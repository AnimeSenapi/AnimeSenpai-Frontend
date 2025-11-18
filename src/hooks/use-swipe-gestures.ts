/**
 * Swipe Gestures Hook
 * Provides swipe detection for mobile interactions
 */

'use client'

import { useRef, useCallback, useState } from 'react'

export interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

export interface SwipeOptions {
  threshold?: number // Minimum distance in pixels to trigger swipe (default: 50)
  velocityThreshold?: number // Minimum velocity to trigger swipe (default: 0.3)
  preventDefault?: boolean // Prevent default touch behavior (default: false)
  enableSwipeLeft?: boolean
  enableSwipeRight?: boolean
  enableSwipeUp?: boolean
  enableSwipeDown?: boolean
}

export interface SwipeState {
  isSwiping: boolean
  direction: 'left' | 'right' | 'up' | 'down' | null
  distance: number
  progress: number // 0-1 progress of swipe
}

const DEFAULT_OPTIONS: Required<SwipeOptions> = {
  threshold: 50,
  velocityThreshold: 0.3,
  preventDefault: false,
  enableSwipeLeft: true,
  enableSwipeRight: true,
  enableSwipeUp: true,
  enableSwipeDown: true,
}

/**
 * Hook for detecting swipe gestures
 */
export function useSwipeGestures(
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
): {
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void
    onTouchMove: (e: React.TouchEvent) => void
    onTouchEnd: (e: React.TouchEvent) => void
  }
  state: SwipeState
} {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)
  const touchCurrent = useRef<{ x: number; y: number; time: number } | null>(null)
  const [state, setState] = useState<SwipeState>({
    isSwiping: false,
    direction: null,
    distance: 0,
    progress: 0,
  })

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return

      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }
      touchCurrent.current = touchStart.current

      setState({
        isSwiping: false,
        direction: null,
        distance: 0,
        progress: 0,
      })
    },
    []
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current || !touchCurrent.current) return

      const touch = e.touches[0]
      if (!touch) return

      if (opts.preventDefault) {
        e.preventDefault()
      }

      touchCurrent.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }

      const deltaX = touchCurrent.current.x - touchStart.current.x
      const deltaY = touchCurrent.current.y - touchStart.current.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // Determine primary direction
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)
      let direction: 'left' | 'right' | 'up' | 'down' | null = null

      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && opts.enableSwipeRight) {
          direction = 'right'
        } else if (deltaX < 0 && opts.enableSwipeLeft) {
          direction = 'left'
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && opts.enableSwipeDown) {
          direction = 'down'
        } else if (deltaY < 0 && opts.enableSwipeUp) {
          direction = 'up'
        }
      }

      const progress = Math.min(distance / opts.threshold, 1)

      setState({
        isSwiping: distance > 10, // Start showing swipe feedback after 10px
        direction,
        distance,
        progress,
      })
    },
    [opts]
  )

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current || !touchCurrent.current) return

      const deltaX = touchCurrent.current.x - touchStart.current.x
      const deltaY = touchCurrent.current.y - touchStart.current.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const timeDelta = touchCurrent.current.time - touchStart.current.time
      const velocity = distance / timeDelta // pixels per ms

      // Check if swipe meets threshold
      if (distance >= opts.threshold && velocity >= opts.velocityThreshold) {
        const absX = Math.abs(deltaX)
        const absY = Math.abs(deltaY)

        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0 && opts.enableSwipeRight) {
            handlers.onSwipeRight?.()
          } else if (deltaX < 0 && opts.enableSwipeLeft) {
            handlers.onSwipeLeft?.()
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && opts.enableSwipeDown) {
            handlers.onSwipeDown?.()
          } else if (deltaY < 0 && opts.enableSwipeUp) {
            handlers.onSwipeUp?.()
          }
        }
      }

      // Reset
      touchStart.current = null
      touchCurrent.current = null
      setState({
        isSwiping: false,
        direction: null,
        distance: 0,
        progress: 0,
      })
    },
    [handlers, opts]
  )

  return {
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    state,
  }
}

/**
 * Hook for swipeable card component
 * Provides visual feedback during swipe
 */
export function useSwipeableCard(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  options: SwipeOptions = {}
) {
  const swipe = useSwipeGestures(
    {
      onSwipeLeft,
      onSwipeRight,
    },
    {
      ...options,
      enableSwipeUp: false,
      enableSwipeDown: false,
    }
  )

  return {
    ...swipe.handlers,
    offset: swipe.state.direction === 'left' ? -swipe.state.distance : swipe.state.distance,
    isSwiping: swipe.state.isSwiping,
    progress: swipe.state.progress,
  }
}

