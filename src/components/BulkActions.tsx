'use client'

import { useState } from 'react'
import { CheckSquare, Square, Trash2, Star, Archive, Download } from 'lucide-react'
import { Button } from './ui/button'
import { Anime } from '../types/anime'

interface BulkActionsProps {
  items: Anime[]
  selectedItems: Set<string>
  onSelectionChange: (selected: Set<string>) => void
  onBulkAction: (action: BulkActionType, itemIds: string[]) => Promise<void>
}

export type BulkActionType =
  | 'delete'
  | 'mark-completed'
  | 'mark-watching'
  | 'mark-plan-to-watch'
  | 'add-to-favorites'
  | 'remove-from-favorites'
  | 'export'

/**
 * Bulk Actions Component
 * Select multiple items and perform actions on them
 */
export function BulkActions({
  items,
  selectedItems,
  onSelectionChange,
  onBulkAction,
}: BulkActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const selectedCount = selectedItems.size
  const allSelected = items.length > 0 && selectedItems.size === items.length

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set())
    } else {
      const allIds = new Set(items.map((item) => item.id))
      onSelectionChange(allIds)
    }
  }

  const handleBulkAction = async (action: BulkActionType) => {
    if (selectedItems.size === 0) return

    setIsProcessing(true)
    try {
      await onBulkAction(action, Array.from(selectedItems))
      onSelectionChange(new Set()) // Clear selection after action
      setShowActions(false)
    } finally {
      setIsProcessing(false)
    }
  }

  if (selectedCount === 0) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-white/5">
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <Square className="h-5 w-5" />
          <span>Select All ({items.length})</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-lg border border-primary-400/30 backdrop-blur-sm">
      {/* Selection Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2 text-sm font-medium text-white"
        >
          <CheckSquare className="h-5 w-5 text-primary-400" />
          <span>
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
        </button>

        <button
          onClick={() => onSelectionChange(new Set())}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center gap-2">
        {showActions ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('mark-completed')}
              disabled={isProcessing}
              className="gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              Mark Completed
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('add-to-favorites')}
              disabled={isProcessing}
              className="gap-2"
            >
              <Star className="h-4 w-4" />
              Add to Favorites
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('export')}
              disabled={isProcessing}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('delete')}
              disabled={isProcessing}
              className="gap-2 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowActions(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="default"
            onClick={() => setShowActions(true)}
            className="gap-2"
          >
            <Archive className="h-4 w-4" />
            Bulk Actions
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Selection Manager Hook
 * Manages selection state for bulk actions
 */
export function useSelection<T extends { id: string }>(items: T[]) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const toggleSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedItems(new Set(items.map((item) => item.id)))
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
  }

  const isSelected = (itemId: string) => {
    return selectedItems.has(itemId)
  }

  const allSelected = items.length > 0 && selectedItems.size === items.length

  return {
    selectedItems,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    allSelected,
    selectedCount: selectedItems.size,
    setSelectedItems,
  }
}

/**
 * Selectable Item Wrapper
 * Adds checkbox to any component for bulk selection
 */
interface SelectableItemProps {
  id: string
  isSelected: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
  className?: string
}

export function SelectableItem({
  id,
  isSelected,
  onToggle,
  children,
  className = '',
}: SelectableItemProps) {
  return (
    <div className={`relative group ${className}`}>
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggle(id)
          }}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-primary-500 border-primary-500'
              : 'bg-gray-900/80 border-white/20 hover:border-primary-400'
          }`}
          aria-label={isSelected ? 'Deselect item' : 'Select item'}
        >
          {isSelected && <CheckSquare className="h-4 w-4 text-white" />}
        </button>
      </div>

      {/* Content with selection highlight */}
      <div
        className={`transition-all ${
          isSelected ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-gray-950' : ''
        }`}
      >
        {children}
      </div>
    </div>
  )
}
