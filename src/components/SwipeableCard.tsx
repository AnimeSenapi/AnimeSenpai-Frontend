'use client'

import { useSwipeableCard, useHaptic } from '../hooks/use-touch-gestures'
import { Trash2, Heart, Check, Archive } from 'lucide-react'

interface SwipeAction {
  icon: React.ReactNode
  label: string
  color: string
  bgColor: string
  onAction: () => void
}

interface SwipeableCardProps {
  children: React.ReactNode
  leftAction?: SwipeAction
  rightAction?: SwipeAction
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}

/**
 * Swipeable Card Component
 * Swipe left/right to reveal actions (like iOS Mail)
 */
export function SwipeableCard({
  children,
  leftAction,
  rightAction,
  onSwipeLeft,
  onSwipeRight,
  className = '',
}: SwipeableCardProps) {
  const { haptic } = useHaptic()

  const handleSwipeLeft = () => {
    haptic('light')
    onSwipeLeft?.()
  }

  const handleSwipeRight = () => {
    haptic('light')
    onSwipeRight?.()
  }

  const { offset, isSwiping, swipeHandlers } = useSwipeableCard(handleSwipeLeft, handleSwipeRight)

  const showLeftAction = offset > 60 && leftAction
  const showRightAction = offset < -60 && rightAction

  return (
    <div className="relative overflow-hidden">
      {/* Left Action Background */}
      {leftAction && (
        <div
          className={`absolute inset-y-0 left-0 flex items-center px-6 ${leftAction.bgColor} transition-all ${
            showLeftAction ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ width: Math.max(0, offset) }}
        >
          <div className={`flex flex-col items-center gap-1 ${leftAction.color}`}>
            {leftAction.icon}
            <span className="text-xs font-semibold">{leftAction.label}</span>
          </div>
        </div>
      )}

      {/* Right Action Background */}
      {rightAction && (
        <div
          className={`absolute inset-y-0 right-0 flex items-center px-6 ${rightAction.bgColor} transition-all ${
            showRightAction ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ width: Math.max(0, -offset) }}
        >
          <div className={`flex flex-col items-center gap-1 ${rightAction.color}`}>
            {rightAction.icon}
            <span className="text-xs font-semibold">{rightAction.label}</span>
          </div>
        </div>
      )}

      {/* Card Content */}
      <div
        {...swipeHandlers}
        className={`relative ${className} transition-transform ${
          isSwiping ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Preset Swipe Actions
 */
export const SwipeActions = {
  delete: {
    icon: <Trash2 className="h-6 w-6" />,
    label: 'Delete',
    color: 'text-white',
    bgColor: 'bg-red-500',
  },
  favorite: {
    icon: <Heart className="h-6 w-6 fill-current" />,
    label: 'Favorite',
    color: 'text-white',
    bgColor: 'bg-pink-500',
  },
  complete: {
    icon: <Check className="h-6 w-6" />,
    label: 'Complete',
    color: 'text-white',
    bgColor: 'bg-green-500',
  },
  archive: {
    icon: <Archive className="h-6 w-6" />,
    label: 'Archive',
    color: 'text-white',
    bgColor: 'bg-gray-600',
  },
}

/**
 * Example Usage:
 *
 * <SwipeableCard
 *   leftAction={{
 *     ...SwipeActions.favorite,
 *     onAction: () => addToFavorites()
 *   }}
 *   rightAction={{
 *     ...SwipeActions.delete,
 *     onAction: () => deleteItem()
 *   }}
 * >
 *   <AnimeCard anime={anime} />
 * </SwipeableCard>
 */
