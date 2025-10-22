/**
 * Smart Filters
 * Remember and suggest user filter preferences
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

interface FilterPreference {
  filterId: string
  label: string
  value: any
  usageCount: number
  lastUsed: number
}


const STORAGE_KEY = 'anime-filter-preferences'
const MAX_RECENT = 10
const MAX_FAVORITES = 5

/**
 * Smart Filter Manager
 */
class SmartFilterManager {
  private history: Map<string, FilterPreference> = new Map()

  constructor() {
    this.loadFromStorage()
  }

  /**
   * Load preferences from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        this.history = new Map(Object.entries(data))
      }
    } catch (error) {
      console.warn('[SmartFilters] Failed to load preferences:', error)
    }
  }

  /**
   * Save preferences to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const data = Object.fromEntries(this.history)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.warn('[SmartFilters] Failed to save preferences:', error)
    }
  }

  /**
   * Record filter usage
   */
  recordUsage(filterId: string, label: string, value: any): void {
    const existing = this.history.get(filterId)

    if (existing) {
      existing.usageCount++
      existing.lastUsed = Date.now()
      existing.value = value
    } else {
      this.history.set(filterId, {
        filterId,
        label,
        value,
        usageCount: 1,
        lastUsed: Date.now(),
      })
    }

    this.saveToStorage()
  }

  /**
   * Get recent filters
   */
  getRecent(limit: number = MAX_RECENT): FilterPreference[] {
    return Array.from(this.history.values())
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, limit)
  }

  /**
   * Get favorite filters (most used)
   */
  getFavorites(limit: number = MAX_FAVORITES): FilterPreference[] {
    return Array.from(this.history.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
  }

  /**
   * Get suggestions based on current context
   */
  getSuggestions(currentFilters: Record<string, any>): FilterPreference[] {
    // Get filters that work well with current selection
    const suggestions = Array.from(this.history.values())
      .filter((pref) => {
        // Don't suggest filters that are already active
        return !currentFilters[pref.filterId]
      })
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)

    return suggestions
  }

  /**
   * Clear a specific filter preference
   */
  clearFilter(filterId: string): void {
    this.history.delete(filterId)
    this.saveToStorage()
  }

  /**
   * Clear all preferences
   */
  clearAll(): void {
    this.history.clear()
    this.saveToStorage()
  }

  /**
   * Get all history
   */
  getAll(): FilterPreference[] {
    return Array.from(this.history.values())
  }
}

// Singleton instance
const smartFilterManager = new SmartFilterManager()

/**
 * React Hook for Smart Filters
 */
export function useSmartFilters(filterId?: string) {
  const [recent, setRecent] = useState<FilterPreference[]>([])
  const [favorites, setFavorites] = useState<FilterPreference[]>([])
  const [suggestions, setSuggestions] = useState<FilterPreference[]>([])

  const refresh = useCallback(() => {
    setRecent(smartFilterManager.getRecent())
    setFavorites(smartFilterManager.getFavorites())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const recordUsage = useCallback(
    (label: string, value: any, id?: string) => {
      const filterKey = id || filterId || label.toLowerCase().replace(/\s+/g, '-')
      smartFilterManager.recordUsage(filterKey, label, value)
      refresh()
    },
    [filterId, refresh]
  )

  const getSuggestions = useCallback((currentFilters: Record<string, any>) => {
    const suggestions = smartFilterManager.getSuggestions(currentFilters)
    setSuggestions(suggestions)
    return suggestions
  }, [])

  const clearFilter = useCallback(
    (id: string) => {
      smartFilterManager.clearFilter(id)
      refresh()
    },
    [refresh]
  )

  const clearAll = useCallback(() => {
    smartFilterManager.clearAll()
    refresh()
  }, [refresh])

  return {
    recent,
    favorites,
    suggestions,
    recordUsage,
    getSuggestions,
    clearFilter,
    clearAll,
  }
}

/**
 * Hook to persist filter state
 */
export function usePersistedFilters<T extends Record<string, any>>(key: string, initialFilters: T) {
  const [filters, setFilters] = useState<T>(() => {
    if (typeof window === 'undefined') return initialFilters

    try {
      const stored = localStorage.getItem(`filters:${key}`)
      if (stored) {
        return { ...initialFilters, ...JSON.parse(stored) }
      }
    } catch {
      // Ignore errors
    }

    return initialFilters
  })

  const updateFilters = useCallback(
    (updates: Partial<T>) => {
      setFilters((prev) => {
        const next = { ...prev, ...updates }

        // Save to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`filters:${key}`, JSON.stringify(next))
          } catch {
            // Ignore errors
          }
        }

        return next
      })
    },
    [key]
  )

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`filters:${key}`)
    }
  }, [key, initialFilters])

  return {
    filters,
    updateFilters,
    resetFilters,
    setFilters,
  }
}

/**
 * Quick Filter Suggestions Component
 */
interface QuickFilterSuggestionsProps {
  onApplyFilter: (filterId: string, value: any) => void
  currentFilters: Record<string, any>
}

export function QuickFilterSuggestions({
  onApplyFilter,
  currentFilters,
}: QuickFilterSuggestionsProps) {
  const { favorites, suggestions, getSuggestions } = useSmartFilters()

  useEffect(() => {
    getSuggestions(currentFilters)
  }, [currentFilters, getSuggestions])

  const recommendedFilters = [...favorites, ...suggestions].slice(0, 5)

  if (recommendedFilters.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-xs text-gray-500">Quick filters:</span>
      {recommendedFilters.map((filter) => (
        <button
          key={filter.filterId}
          onClick={() => onApplyFilter(filter.filterId, filter.value)}
          className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
        >
          {filter.label}
          {filter.usageCount > 1 && (
            <span className="ml-1 text-gray-500">({filter.usageCount})</span>
          )}
        </button>
      ))}
    </div>
  )
}
