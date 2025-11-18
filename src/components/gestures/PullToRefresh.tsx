/**
 * Pull to Refresh Component
 * Visual indicator for pull-to-refresh functionality
 */

'use client'

import { ReactNode } from 'react'
import { usePullToRefresh, PullToRefreshOptions } from '../../hooks/use-pull-to-refresh'
import { Loader2, ArrowDown } from 'lucide-react'
import { cn } from '../../app/lib/utils'

interface PullToRefreshProps extends PullToRefreshOptions {
  children: ReactNode
  className?: string
  showIndicator?: boolean
}

export function PullToRefresh({
  children,
  className,
  showIndicator = true,
  ...options
}: PullToRefreshProps) {
  const state = usePullToRefresh(options)

  const { isPulling, isRefreshing, pullDistance, progress } = state

  return (
    <div className={cn('relative', className)}>
      {/* Pull Indicator */}
      {showIndicator && (isPulling || isRefreshing) && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-200"
          style={{
            height: `${Math.min(pullDistance, 80)}px`,
            opacity: Math.min(progress * 2, 1),
            transform: `translateY(${isRefreshing ? 0 : -Math.min(pullDistance, 80)}px)`,
          }}
        >
          <div className="flex flex-col items-center gap-2">
            {isRefreshing ? (
              <>
                <Loader2 className="h-6 w-6 text-primary-400 animate-spin" />
                <span className="text-sm text-gray-400">Refreshing...</span>
              </>
            ) : (
              <>
                <div
                  className="transition-transform duration-200"
                  style={{
                    transform: `rotate(${progress >= 1 ? 180 : 0}deg)`,
                  }}
                >
                  <ArrowDown className="h-6 w-6 text-primary-400" />
                </div>
                <span className="text-xs text-gray-400">
                  {progress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          transform: `translateY(${isPulling && !isRefreshing ? Math.min(pullDistance, 80) : 0}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  )
}

