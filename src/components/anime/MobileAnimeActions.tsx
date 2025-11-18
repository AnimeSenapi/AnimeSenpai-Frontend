/**
 * Mobile Anime Actions Component
 * Sticky action bar for anime detail page on mobile
 */

'use client'

import { useState } from 'react'
import { Play, Bookmark, Heart, Star, Plus, Check, X, Loader2, Tv2 } from 'lucide-react'
import { cn } from '../../app/lib/utils'
import { useIsMobile } from '../../hooks/use-touch-gestures'
import { useHapticFeedback } from '../../hooks/use-haptic-feedback'

interface MobileAnimeActionsProps {
  isAuthenticated: boolean
  isFavorite: boolean
  listStatus?: {
    inList: boolean
    status?: 'watching' | 'completed' | 'plan-to-watch' | 'favorite'
  }
  isSubmitting?: boolean
  onAddToList: (status?: 'watching' | 'completed' | 'plan-to-watch') => void
  onToggleFavorite: () => void
  onRate: () => void
  onRemoveFromList?: () => void
}

export function MobileAnimeActions({
  isAuthenticated,
  isFavorite,
  listStatus,
  isSubmitting = false,
  onAddToList,
  onToggleFavorite,
  onRate,
  onRemoveFromList,
}: MobileAnimeActionsProps) {
  const isMobile = useIsMobile()
  const haptic = useHapticFeedback()
  const [showQuickActions, setShowQuickActions] = useState(false)

  if (!isMobile) {
    return null
  }

  const handleAction = (action: () => void) => {
    haptic.selection()
    action()
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden */}
      <div className="h-20 md:hidden" />

      {/* Sticky Action Bar */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300',
          'bg-gray-950/95 backdrop-blur-xl border-t border-white/10',
          'safe-area-bottom'
        )}
      >
        {/* Quick Actions Toggle */}
        {isAuthenticated && listStatus?.inList && (
          <div className="px-4 py-2 border-b border-white/10">
            <button
              onClick={() => {
                haptic.light()
                setShowQuickActions(!showQuickActions)
              }}
              className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <span>Quick Actions</span>
              <Plus
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  showQuickActions && 'rotate-45'
                )}
              />
            </button>
          </div>
        )}

        {/* Quick Actions Menu */}
        {showQuickActions && isAuthenticated && listStatus?.inList && (
          <div className="px-4 py-3 border-b border-white/10 bg-gray-900/50">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleAction(() => onAddToList('watching'))}
                disabled={isSubmitting}
                className={cn(
                  'py-2 px-3 rounded-lg text-xs font-medium transition-all touch-manipulation min-h-[44px]',
                  listStatus?.status === 'watching'
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 active:scale-95'
                )}
              >
                <Tv2 className="h-4 w-4 mx-auto mb-1" />
                Watching
              </button>
              <button
                onClick={() => handleAction(() => onAddToList('completed'))}
                disabled={isSubmitting}
                className={cn(
                  'py-2 px-3 rounded-lg text-xs font-medium transition-all touch-manipulation min-h-[44px]',
                  listStatus?.status === 'completed'
                    ? 'bg-success-500/20 text-success-400 border border-success-500/30'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 active:scale-95'
                )}
              >
                <Check className="h-4 w-4 mx-auto mb-1" />
                Completed
              </button>
              <button
                onClick={() => handleAction(() => onRate())}
                disabled={isSubmitting}
                className="py-2 px-3 rounded-lg text-xs font-medium bg-white/5 text-gray-300 hover:bg-white/10 active:scale-95 transition-all touch-manipulation min-h-[44px]"
              >
                <Star className="h-4 w-4 mx-auto mb-1" />
                Rate
              </button>
            </div>
          </div>
        )}

        {/* Main Actions */}
        <div className="flex items-center px-2 py-2 gap-2">
          {/* Add to List / Remove */}
          {isAuthenticated ? (
            listStatus?.inList ? (
              <button
                onClick={() => handleAction(() => onRemoveFromList?.())}
                disabled={isSubmitting}
                className={cn(
                  'flex-1 py-3 px-4 rounded-xl font-medium transition-all touch-manipulation min-h-[44px]',
                  'bg-red-500/10 text-red-400 border border-red-500/30',
                  'hover:bg-red-500/20 active:scale-95',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 mx-auto animate-spin" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <X className="h-5 w-5" />
                    <span>Remove</span>
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={() => handleAction(() => onAddToList())}
                disabled={isSubmitting}
                className={cn(
                  'flex-1 py-3 px-4 rounded-xl font-medium transition-all touch-manipulation min-h-[44px]',
                  'bg-primary-500/20 text-primary-400 border border-primary-500/30',
                  'hover:bg-primary-500/30 active:scale-95',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 mx-auto animate-spin" />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Plus className="h-5 w-5" />
                    <span>Add to List</span>
                  </div>
                )}
              </button>
            )
          ) : (
            <button
              onClick={() => handleAction(() => onAddToList())}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl font-medium transition-all touch-manipulation min-h-[44px]',
                'bg-primary-500/20 text-primary-400 border border-primary-500/30',
                'hover:bg-primary-500/30 active:scale-95'
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Bookmark className="h-5 w-5" />
                <span>Sign In to Add</span>
              </div>
            </button>
          )}

          {/* Favorite */}
          {isAuthenticated && (
            <button
              onClick={() => handleAction(onToggleFavorite)}
              disabled={isSubmitting}
              className={cn(
                'w-14 h-[44px] rounded-xl font-medium transition-all touch-manipulation flex items-center justify-center',
                isFavorite
                  ? 'bg-secondary-500/20 text-secondary-400 border border-secondary-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10',
                'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={cn(
                  'h-5 w-5 transition-all',
                  isFavorite && 'fill-current'
                )}
              />
            </button>
          )}

          {/* Rate Button */}
          {isAuthenticated && listStatus?.inList && (
            <button
              onClick={() => handleAction(onRate)}
              disabled={isSubmitting}
              className={cn(
                'w-14 h-[44px] rounded-xl font-medium transition-all touch-manipulation flex items-center justify-center',
                'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10',
                'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label="Rate this anime"
            >
              <Star className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </>
  )
}

