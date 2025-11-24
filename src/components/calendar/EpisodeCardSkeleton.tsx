'use client'

import { Skeleton } from '../ui/skeleton'
import { cn } from '../../app/lib/utils'

interface EpisodeCardSkeletonProps {
  variant?: 'compact' | 'detailed' | 'minimal'
  className?: string
}

export function EpisodeCardSkeleton({
  variant = 'detailed',
  className
}: EpisodeCardSkeletonProps) {
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700', className)}>
        <Skeleton className="w-16 h-10 rounded flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-12 rounded" />
      </div>
    )
  }

  return (
    <div className={cn('glass rounded-xl overflow-hidden border border-gray-700/50 animate-pulse', className)}>
      <Skeleton className="aspect-video w-full bg-gray-800/50" />
      <div className="p-4 bg-gray-900/30 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4 bg-gray-700/50" />
          <Skeleton className="h-3 w-1/2 bg-gray-700/50" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded bg-gray-700/50" />
          <Skeleton className="h-3 w-24 bg-gray-700/50" />
        </div>
        {variant === 'detailed' && (
          <div className="flex gap-1.5">
            <Skeleton className="h-4 w-12 rounded bg-gray-700/50" />
            <Skeleton className="h-4 w-16 rounded bg-gray-700/50" />
          </div>
        )}
      </div>
    </div>
  )
}

