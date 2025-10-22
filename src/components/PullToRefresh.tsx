'use client'

import { RefreshCw, ArrowDown } from 'lucide-react'
import { usePullToRefresh } from '../hooks/use-touch-gestures'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

/**
 * Pull to Refresh Component
 * Native-feeling pull-to-refresh for mobile
 */
export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const { isPulling, pullDistance, progress } = usePullToRefresh(onRefresh)

  const threshold = 80
  const canRefresh = pullDistance >= threshold

  return (
    <div className="relative">
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center overflow-hidden transition-all"
        style={{
          height: Math.min(pullDistance, 100),
          opacity: progress,
        }}
      >
        <div className="relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl" />

          {/* Icon */}
          <div
            className={`relative transition-all duration-300 ${
              canRefresh ? 'text-primary-400' : 'text-gray-400'
            }`}
          >
            {isPulling ? (
              <RefreshCw className={`h-6 w-6 ${isPulling ? 'animate-spin' : ''}`} />
            ) : canRefresh ? (
              <RefreshCw className="h-6 w-6" />
            ) : (
              <ArrowDown
                className="h-6 w-6 transition-transform"
                style={{
                  transform: `translateY(${progress * 10}px)`,
                }}
              />
            )}
          </div>
        </div>

        {/* Progress text */}
        <span className="ml-3 text-sm text-gray-400">
          {isPulling ? 'Refreshing...' : canRefresh ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </div>

      {/* Content */}
      <div
        className="transition-transform"
        style={{
          transform: `translateY(${Math.min(pullDistance, 100)}px)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Simpler pull-to-refresh (just indicator, no wrapper)
 */
export function usePullToRefreshIndicator(onRefresh: () => Promise<void>) {
  const { isPulling, pullDistance, progress } = usePullToRefresh(onRefresh)

  const Indicator = () => (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all"
      style={{
        height: Math.min(pullDistance, 60),
        opacity: progress,
        transform: `translateY(${Math.min(pullDistance - 60, 0)}px)`,
      }}
    >
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10 flex items-center gap-2">
        <RefreshCw className={`h-4 w-4 text-primary-400 ${isPulling ? 'animate-spin' : ''}`} />
        <span className="text-xs text-white">
          {isPulling ? 'Refreshing...' : 'Pull to refresh'}
        </span>
      </div>
    </div>
  )

  return {
    isPulling,
    pullDistance,
    progress,
    Indicator,
  }
}
