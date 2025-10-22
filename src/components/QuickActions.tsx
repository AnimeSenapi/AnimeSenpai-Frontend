'use client'

import { useState } from 'react'
import { Plus, Check, Clock, Heart, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { apiAddToList, apiRemoveFromList } from '../app/lib/api'
import { useToast } from './ui/toast'
import { NotesButton } from './notes'
import { Anime, ListStatus } from '../types/anime'

interface QuickActionsProps {
  anime: Anime
  currentStatus?: ListStatus | null
  isFavorite?: boolean
  onUpdate?: () => void
  variant?: 'compact' | 'expanded'
}

/**
 * Quick Actions Component
 * Add anime to list without navigating away from current page
 */
export function QuickActions({
  anime,
  currentStatus,
  isFavorite = false,
  onUpdate,
  variant = 'compact',
}: QuickActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<ListStatus | null>(currentStatus || null)
  const [favorite, setFavorite] = useState(isFavorite)
  const { toast } = useToast()

  const handleAddToList = async (newStatus: ListStatus) => {
    setIsLoading(true)
    try {
      await apiAddToList({
        animeId: anime.id,
        status: newStatus,
        isFavorite: favorite,
      })

      setStatus(newStatus)
      onUpdate?.()

      toast({
        title: 'Added to list!',
        message: `${anime.title} added to ${newStatus.replace('-', ' ')}`,
        type: 'success',
      })
    } catch (error) {
      toast({
        title: 'Failed to add',
        message: error instanceof Error ? error.message : 'Please try again',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFromList = async () => {
    if (!anime.id) return

    setIsLoading(true)
    try {
      await apiRemoveFromList(anime.id)
      setStatus(null)
      onUpdate?.()

      toast({
        title: 'Removed from list',
        message: `${anime.title} has been removed`,
        type: 'success',
      })
    } catch (error) {
      toast({
        title: 'Failed to remove',
        message: error instanceof Error ? error.message : 'Please try again',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFavorite = async () => {
    setIsLoading(true)
    try {
      await apiAddToList({
        animeId: anime.id,
        status: status || 'plan-to-watch',
        isFavorite: !favorite,
      })

      setFavorite(!favorite)
      if (!status) {
        setStatus('plan-to-watch')
      }
      onUpdate?.()

      toast({
        title: !favorite ? 'Added to favorites' : 'Removed from favorites',
        message: anime.title,
        type: 'success',
      })
    } catch (error) {
      toast({
        title: 'Failed to update',
        message: error instanceof Error ? error.message : 'Please try again',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        {/* Status Dropdown */}
        <div className="relative group">
          <Button
            size="sm"
            variant={status ? 'default' : 'outline'}
            className="gap-2"
            disabled={isLoading}
          >
            {status ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span className="hidden sm:inline">
              {status ? status.replace('-', ' ') : 'Add to List'}
            </span>
          </Button>

          {/* Dropdown Menu */}
          <div className="absolute left-0 top-full mt-2 w-48 bg-gray-900 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="p-2 space-y-1">
              <button
                onClick={() => handleAddToList('watching')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-white/5 rounded flex items-center gap-2 transition-colors"
              >
                <Play className="h-4 w-4 text-green-400" />
                Watching
              </button>
              <button
                onClick={() => handleAddToList('completed')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-white/5 rounded flex items-center gap-2 transition-colors"
              >
                <Check className="h-4 w-4 text-blue-400" />
                Completed
              </button>
              <button
                onClick={() => handleAddToList('plan-to-watch')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-white/5 rounded flex items-center gap-2 transition-colors"
              >
                <Clock className="h-4 w-4 text-yellow-400" />
                Plan to Watch
              </button>
              <button
                onClick={() => handleAddToList('on-hold')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-white/5 rounded flex items-center gap-2 transition-colors"
              >
                <Clock className="h-4 w-4 text-orange-400" />
                On Hold
              </button>
              <button
                onClick={() => handleAddToList('dropped')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-white/5 rounded flex items-center gap-2 transition-colors"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
                Dropped
              </button>

              {status && (
                <>
                  <div className="border-t border-white/10 my-1" />
                  <button
                    onClick={handleRemoveFromList}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-red-500/10 rounded flex items-center gap-2 transition-colors text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove from List
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Favorite Button */}
        <Button
          size="sm"
          variant={favorite ? 'default' : 'outline'}
          onClick={handleToggleFavorite}
          disabled={isLoading}
          className="gap-2"
        >
          <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">{favorite ? 'Favorited' : 'Favorite'}</span>
        </Button>
      </div>
    )
  }

  // Expanded variant with more details
  return (
    <div className="space-y-3">
      {/* Status Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={status === 'watching' ? 'default' : 'outline'}
          onClick={() => handleAddToList('watching')}
          disabled={isLoading}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          Watching
        </Button>
        <Button
          variant={status === 'completed' ? 'default' : 'outline'}
          onClick={() => handleAddToList('completed')}
          disabled={isLoading}
          className="gap-2"
        >
          <Check className="h-4 w-4" />
          Completed
        </Button>
        <Button
          variant={status === 'plan-to-watch' ? 'default' : 'outline'}
          onClick={() => handleAddToList('plan-to-watch')}
          disabled={isLoading}
          className="gap-2"
        >
          <Clock className="h-4 w-4" />
          Plan to Watch
        </Button>
        <Button
          variant={status === 'on-hold' ? 'default' : 'outline'}
          onClick={() => handleAddToList('on-hold')}
          disabled={isLoading}
          className="gap-2"
        >
          <Clock className="h-4 w-4" />
          On Hold
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className="flex gap-2">
        <Button
          variant={favorite ? 'default' : 'outline'}
          onClick={handleToggleFavorite}
          disabled={isLoading}
          className="flex-1 gap-2"
        >
          <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
          {favorite ? 'Favorited' : 'Add to Favorites'}
        </Button>

        {status && (
          <Button
            variant="outline"
            onClick={handleRemoveFromList}
            disabled={isLoading}
            className="gap-2 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      {/* Notes Button */}
      <div className="flex justify-center">
        <NotesButton
          animeId={anime.id}
          animeTitle={anime.title}
          variant="compact"
        />
      </div>
    </div>
  )
}

// Import statements that were missing
import { Play } from 'lucide-react'
