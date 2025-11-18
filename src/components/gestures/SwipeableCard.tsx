/**
 * Swipeable Card Component
 * Wraps content with swipe gesture support
 */

'use client'

import { ReactNode, useRef } from 'react'
import { useSwipeableCard } from '../../hooks/use-swipe-gestures'
import { cn } from '../../app/lib/utils'

interface SwipeableCardProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  className?: string
  disabled?: boolean
  leftAction?: ReactNode
  rightAction?: ReactNode
  showActions?: boolean
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 100,
  className,
  disabled = false,
  leftAction,
  rightAction,
  showActions = true,
}: SwipeableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const swipeHandlers = useSwipeableCard(
    disabled ? undefined : onSwipeLeft,
    disabled ? undefined : onSwipeRight,
    {
      threshold,
      enableSwipeUp: !!onSwipeUp,
      enableSwipeDown: !!onSwipeDown,
    }
  )

  const { offset, isSwiping, progress } = swipeHandlers

  // Calculate opacity and scale based on swipe progress
  const opacity = Math.max(0.3, 1 - Math.abs(progress))
  const scale = Math.max(0.95, 1 - Math.abs(progress) * 0.1)

  return (
    <div className={cn('relative overflow-hidden', className)} ref={cardRef}>
      {/* Background Actions */}
      {showActions && (leftAction || rightAction) && (
        <div className="absolute inset-0 flex items-center pointer-events-none">
          {/* Left Action */}
          {leftAction && (
            <div
              className={cn(
                'absolute left-0 top-0 bottom-0 flex items-center justify-center transition-opacity duration-200',
                offset > 0 ? 'opacity-100' : 'opacity-0'
              )}
              style={{ width: Math.min(Math.abs(offset), 100) }}
            >
              <div className="px-4">{leftAction}</div>
            </div>
          )}

          {/* Right Action */}
          {rightAction && (
            <div
              className={cn(
                'absolute right-0 top-0 bottom-0 flex items-center justify-center transition-opacity duration-200',
                offset < 0 ? 'opacity-100' : 'opacity-0'
              )}
              style={{ width: Math.min(Math.abs(offset), 100) }}
            >
              <div className="px-4">{rightAction}</div>
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div
        onTouchStart={swipeHandlers.onTouchStart}
        onTouchMove={swipeHandlers.onTouchMove}
        onTouchEnd={swipeHandlers.onTouchEnd}
        className={cn(
          'relative transition-all duration-200',
          isSwiping && 'transition-none'
        )}
        style={{
          transform: `translateX(${offset}px) scale(${scale})`,
          opacity,
          touchAction: 'pan-y', // Allow vertical panning but prevent horizontal interference
        }}
      >
        {children}
      </div>

      {/* Swipe Indicator */}
      {isSwiping && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary-400/50 rounded-full transition-all duration-200"
          style={{
            opacity: Math.min(progress, 1),
            transform: `scaleX(${progress})`,
          }}
        />
      )}
    </div>
  )
}

