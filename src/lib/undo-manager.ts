/**
 * Undo/Redo Manager
 * Provides undo functionality for accidental actions
 */

import { useCallback, useRef, useState } from 'react'
import { ListStatus } from '../types/anime'

export interface UndoAction<T = any> {
  type: string
  data: T
  undo: () => Promise<void> | void
  redo: () => Promise<void> | void
  description: string
  timestamp: number
}

/**
 * Undo Manager Class
 */
class UndoManager {
  private history: UndoAction[] = []
  private currentIndex = -1
  private maxHistory = 50

  /**
   * Add an action to history
   */
  push(action: UndoAction): void {
    // Remove any actions after current index (if we're in middle of history)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    // Add new action
    this.history.push(action)
    this.currentIndex++

    // Maintain max history size
    if (this.history.length > this.maxHistory) {
      this.history.shift()
      this.currentIndex--
    }
  }

  /**
   * Undo the last action
   */
  async undo(): Promise<UndoAction | null> {
    if (!this.canUndo()) {
      return null
    }

    const action = this.history[this.currentIndex]
    if (action) {
      await action.undo()
      this.currentIndex--
    }

    return action ?? null
  }

  /**
   * Redo the last undone action
   */
  async redo(): Promise<UndoAction | null> {
    if (!this.canRedo()) {
      return null
    }

    this.currentIndex++
    const action = this.history[this.currentIndex]
    if (action) {
      await action.redo()
    }

    return action ?? null
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex >= 0
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * Get current action
   */
  getCurrentAction(): UndoAction | null {
    return this.history[this.currentIndex] || null
  }

  /**
   * Clear history
   */
  clear(): void {
    this.history = []
    this.currentIndex = -1
  }

  /**
   * Get history size
   */
  size(): number {
    return this.history.length
  }

  /**
   * Get history for display
   */
  getHistory(): UndoAction[] {
    return [...this.history]
  }
}

// Singleton instance
const globalUndoManager = new UndoManager()

/**
 * React Hook for Undo/Redo
 */
export function useUndo() {
  const [canUndo, setCanUndo] = useState(globalUndoManager.canUndo())
  const [canRedo, setCanRedo] = useState(globalUndoManager.canRedo())
  const updateRef = useRef<() => void>(() => {})

  // Update state
  const updateState = useCallback(() => {
    setCanUndo(globalUndoManager.canUndo())
    setCanRedo(globalUndoManager.canRedo())
  }, [])

  updateRef.current = updateState

  /**
   * Add an undoable action
   */
  const addAction = useCallback((action: Omit<UndoAction, 'timestamp'>) => {
    globalUndoManager.push({
      ...action,
      timestamp: Date.now(),
    })
    updateRef.current?.()
  }, [])

  /**
   * Undo last action
   */
  const undo = useCallback(async () => {
    const action = await globalUndoManager.undo()
    updateRef.current?.()
    return action
  }, [])

  /**
   * Redo last undone action
   */
  const redo = useCallback(async () => {
    const action = await globalUndoManager.redo()
    updateRef.current?.()
    return action
  }, [])

  /**
   * Clear history
   */
  const clear = useCallback(() => {
    globalUndoManager.clear()
    updateRef.current?.()
  }, [])

  return {
    canUndo,
    canRedo,
    addAction,
    undo,
    redo,
    clear,
    history: globalUndoManager.getHistory(),
  }
}

/**
 * Keyboard shortcut handler for undo/redo
 */
export function useUndoKeyboard() {
  const { undo, redo } = useUndo()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }

      // Ctrl+Shift+Z or Cmd+Shift+Z for redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
      }

      // Ctrl+Y or Cmd+Y for redo (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redo()
      }
    },
    [undo, redo]
  )

  return handleKeyDown
}

/**
 * Helper to create anime list actions
 */
export function createAnimeListAction(
  type: 'add' | 'remove' | 'update',
  anime: { id: string; title: string },
  status: ListStatus | null,
  previousStatus: ListStatus | null,
  addFn: (animeId: string, status: ListStatus) => Promise<void>,
  removeFn: (animeId: string) => Promise<void>
): Omit<UndoAction, 'timestamp'> {
  if (type === 'add') {
    return {
      type: 'ANIME_LIST_ADD',
      data: { anime, status },
      description: `Added "${anime.title}" to ${status}`,
      undo: async () => {
        await removeFn(anime.id)
      },
      redo: async () => {
        if (status) {
          await addFn(anime.id, status)
        }
      },
    }
  }

  if (type === 'remove') {
    return {
      type: 'ANIME_LIST_REMOVE',
      data: { anime, previousStatus },
      description: `Removed "${anime.title}" from list`,
      undo: async () => {
        if (previousStatus) {
          await addFn(anime.id, previousStatus)
        }
      },
      redo: async () => {
        await removeFn(anime.id)
      },
    }
  }

  // type === 'update'
  return {
    type: 'ANIME_LIST_UPDATE',
    data: { anime, status, previousStatus },
    description: `Updated "${anime.title}" from ${previousStatus} to ${status}`,
    undo: async () => {
      if (previousStatus) {
        await addFn(anime.id, previousStatus)
      }
    },
    redo: async () => {
      if (status) {
        await addFn(anime.id, status)
      }
    },
  }
}
