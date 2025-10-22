'use client'

import { Button } from './button'
import {
  Search,
  Bookmark,
  Heart,
  Users,
  MessageSquare,
  TrendingUp,
  Calendar,
  Bell,
  Star,
  Sparkles,
  Inbox,
} from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  compact?: boolean
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8' : 'py-12 sm:py-16 lg:py-20',
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div
          className={cn(
            'mb-4 sm:mb-6 rounded-2xl flex items-center justify-center',
            compact
              ? 'w-16 h-16 bg-white/5'
              : 'w-20 h-20 sm:w-24 sm:h-24 bg-white/5 border border-white/10'
          )}
        >
          {icon}
        </div>
      )}

      {/* Title */}
      <h3
        className={cn(
          'font-bold text-white mb-2',
          compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl lg:text-3xl'
        )}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={cn(
          'text-gray-400 max-w-md mx-auto',
          compact ? 'text-sm' : 'text-sm sm:text-base'
        )}
      >
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 sm:mt-8">
          {action && (
            <Button
              onClick={action.onClick}
              className={cn(
                'w-full sm:w-auto',
                action.variant === 'primary' &&
                  'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white',
                action.variant === 'secondary' && 'bg-white/10 hover:bg-white/20 text-white',
                !action.variant &&
                  'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white'
              )}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Predefined empty states for common scenarios

export function NoSearchResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <EmptyState
      icon={<Search className="w-12 h-12 text-gray-500" />}
      title="No results found"
      description={`We couldn't find any anime matching "${query}". Try different keywords or check your spelling.`}
      action={{
        label: 'Clear Search',
        onClick: onClear,
      }}
    />
  )
}

export function EmptyAnimeList({ onBrowse }: { onBrowse: () => void }) {
  return (
    <EmptyState
      icon={<Bookmark className="w-12 h-12 text-gray-500" />}
      title="Your list is empty"
      description="Start building your anime collection by adding shows you're watching, planning to watch, or have completed."
      action={{
        label: 'Browse Anime',
        onClick: onBrowse,
      }}
    />
  )
}

export function EmptyFavorites({ onExplore }: { onExplore: () => void }) {
  return (
    <EmptyState
      icon={<Heart className="w-12 h-12 text-gray-500" />}
      title="No favorites yet"
      description="Mark anime as favorites to quickly access your all-time favorites."
      action={{
        label: 'Explore Anime',
        onClick: onExplore,
      }}
    />
  )
}

export function EmptyFriends({ onFind }: { onFind: () => void }) {
  return (
    <EmptyState
      icon={<Users className="w-12 h-12 text-gray-500" />}
      title="No friends yet"
      description="Connect with other anime fans to share recommendations and see what they're watching."
      action={{
        label: 'Find Friends',
        onClick: onFind,
      }}
    />
  )
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={<Bell className="w-12 h-12 text-gray-500" />}
      title="All caught up!"
      description="You don't have any new notifications right now."
      compact
    />
  )
}

export function EmptyMessages({ onStartChat }: { onStartChat: () => void }) {
  return (
    <EmptyState
      icon={<MessageSquare className="w-12 h-12 text-gray-500" />}
      title="No messages"
      description="Start a conversation with friends to discuss your favorite anime."
      action={{
        label: 'Start Chat',
        onClick: onStartChat,
      }}
    />
  )
}

export function EmptyReviews({ onWriteReview }: { onWriteReview: () => void }) {
  return (
    <EmptyState
      icon={<Star className="w-12 h-12 text-gray-500" />}
      title="No reviews yet"
      description="Be the first to share your thoughts about this anime."
      action={{
        label: 'Write a Review',
        onClick: onWriteReview,
      }}
    />
  )
}

export function EmptyActivity() {
  return (
    <EmptyState
      icon={<TrendingUp className="w-12 h-12 text-gray-500" />}
      title="No activity yet"
      description="Your activity feed will show updates from friends and your own anime journey."
      compact
    />
  )
}

export function EmptyCalendar() {
  return (
    <EmptyState
      icon={<Calendar className="w-12 h-12 text-gray-500" />}
      title="No upcoming episodes"
      description="Check back later for new episodes of shows you're watching."
      compact
    />
  )
}

export function EmptyRecommendations({ onAddAnime }: { onAddAnime: () => void }) {
  return (
    <EmptyState
      icon={<Sparkles className="w-12 h-12 text-gray-500" />}
      title="Not enough data for recommendations"
      description="Add more anime to your list so we can suggest shows you might enjoy."
      action={{
        label: 'Add Anime',
        onClick: onAddAnime,
      }}
    />
  )
}

export function GenericEmpty({
  title = 'Nothing here yet',
  description = 'Start adding content to see it here.',
}: {
  title?: string
  description?: string
}) {
  return (
    <EmptyState
      icon={<Inbox className="w-12 h-12 text-gray-500" />}
      title={title}
      description={description}
      compact
    />
  )
}
