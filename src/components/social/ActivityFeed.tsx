'use client'

import Link from 'next/link'
import {
  Star,
  MessageSquare,
  UserPlus,
  Bookmark,
  TrendingUp,
  Award,
  Clock,
} from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface Activity {
  id: string
  type: 'review' | 'rating' | 'list_add' | 'friend_add' | 'achievement' | 'comment'
  user: {
    id: string
    username: string
    avatar?: string
  }
  anime?: {
    id: string
    slug: string
    title: string
    coverImage?: string
  }
  target?: {
    id: string
    username: string
  }
  content?: string
  rating?: number
  status?: string
  achievement?: {
    name: string
    icon: string
  }
  createdAt: string
}

interface ActivityFeedProps {
  activities: Activity[]
  showUser?: boolean
  compact?: boolean
  limit?: number
}

export function ActivityFeed({
  activities,
  showUser = true,
  compact = false,
  limit,
}: ActivityFeedProps) {
  const displayedActivities = limit ? activities.slice(0, limit) : activities

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'review':
        return MessageSquare
      case 'rating':
        return Star
      case 'list_add':
        return Bookmark
      case 'friend_add':
        return UserPlus
      case 'achievement':
        return Award
      case 'comment':
        return MessageSquare
      default:
        return TrendingUp
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'review':
        return 'from-blue-500 to-cyan-500'
      case 'rating':
        return 'from-yellow-500 to-orange-500'
      case 'list_add':
        return 'from-green-500 to-emerald-500'
      case 'friend_add':
        return 'from-pink-500 to-rose-500'
      case 'achievement':
        return 'from-purple-500 to-indigo-500'
      case 'comment':
        return 'from-blue-500 to-purple-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'review':
        return 'reviewed'
      case 'rating':
        return 'rated'
      case 'list_add':
        return activity.status === 'watching'
          ? 'started watching'
          : activity.status === 'completed'
            ? 'completed'
            : activity.status === 'plan-to-watch'
              ? 'added to plan to watch'
              : 'added to list'
      case 'friend_add':
        return 'became friends with'
      case 'achievement':
        return 'unlocked'
      case 'comment':
        return 'commented on'
      default:
        return 'interacted with'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return date.toLocaleDateString()
  }

  if (displayedActivities.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center border border-white/10">
        <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-2" />
        <p className="text-gray-400">No activity yet</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', compact && 'space-y-2')}>
      {displayedActivities.map((activity) => {
        const Icon = getActivityIcon(activity.type)
        const gradient = getActivityColor(activity.type)

        return (
          <div
            key={activity.id}
            className={cn(
              'glass rounded-xl border border-white/10 hover:border-white/20 transition-all',
              compact ? 'p-3' : 'p-4'
            )}
          >
            <div className="flex gap-3">
              {/* Icon */}
              <div
                className={cn(
                  'flex-shrink-0 rounded-lg bg-gradient-to-r flex items-center justify-center shadow-lg',
                  gradient,
                  compact ? 'w-8 h-8' : 'w-10 h-10'
                )}
              >
                <Icon className={cn('text-white', compact ? 'w-4 h-4' : 'w-5 h-5')} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Activity Description */}
                <div className={cn('mb-2', compact ? 'text-sm' : 'text-base')}>
                  {showUser && (
                    <Link
                      href={`/user/${activity.user.username}`}
                      className="font-semibold text-white hover:text-primary-300 transition-colors"
                    >
                      {activity.user.username}
                    </Link>
                  )}
                  {showUser && ' '}
                  <span className="text-gray-400">{getActivityText(activity)}</span>{' '}
                  {activity.anime && (
                    <Link
                      href={`/anime/${activity.anime.slug}`}
                      className="font-medium text-primary-300 hover:text-primary-200 transition-colors"
                    >
                      {activity.anime.title}
                    </Link>
                  )}
                  {activity.target && (
                    <Link
                      href={`/user/${activity.target.username}`}
                      className="font-medium text-primary-300 hover:text-primary-200 transition-colors"
                    >
                      {activity.target.username}
                    </Link>
                  )}
                  {activity.achievement && (
                    <span className="font-medium text-purple-300">
                      {activity.achievement.icon} {activity.achievement.name}
                    </span>
                  )}
                </div>

                {/* Rating */}
                {activity.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-3 h-3',
                          i < activity.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                        )}
                      />
                    ))}
                    <span className="text-sm font-bold text-yellow-400 ml-1">
                      {activity.rating}/10
                    </span>
                  </div>
                )}

                {/* Comment Preview */}
                {activity.content && (
                  <p className="text-sm text-gray-300 line-clamp-2 mb-2">"{activity.content}"</p>
                )}

                {/* Timestamp */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {formatDate(activity.createdAt)}
                </div>
              </div>

              {/* Anime Thumbnail */}
              {activity.anime?.coverImage && !compact && (
                <Link href={`/anime/${activity.anime.slug}`}>
                  <img
                    src={activity.anime.coverImage}
                    alt={activity.anime.title}
                    className="w-12 h-16 sm:w-16 sm:h-20 object-cover rounded-lg flex-shrink-0 hover:opacity-80 transition-opacity"
                  />
                </Link>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Compact activity card for sidebars
export function ActivityCard({ activity }: { activity: Activity }) {
  const Icon = getActivityIcon(activity.type)

  return (
    <div className="flex items-center gap-3 p-3 glass rounded-lg border border-white/10 hover:border-white/20 transition-all">
      <div
        className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getActivityColor(activity.type)} flex items-center justify-center flex-shrink-0`}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">
          <span className="font-medium">{activity.user.username}</span>{' '}
          <span className="text-gray-400">{getActivityText(activity)}</span>
        </p>
        {activity.anime && <p className="text-xs text-gray-500 truncate">{activity.anime.title}</p>}
      </div>
    </div>
  )
}

function getActivityIcon(type: Activity['type']) {
  switch (type) {
    case 'review':
      return MessageSquare
    case 'rating':
      return Star
    case 'list_add':
      return Bookmark
    case 'friend_add':
      return UserPlus
    case 'achievement':
      return Award
    case 'comment':
      return MessageSquare
    default:
      return TrendingUp
  }
}

function getActivityColor(type: Activity['type']) {
  switch (type) {
    case 'review':
      return 'from-blue-500 to-cyan-500'
    case 'rating':
      return 'from-yellow-500 to-orange-500'
    case 'list_add':
      return 'from-green-500 to-emerald-500'
    case 'friend_add':
      return 'from-pink-500 to-rose-500'
    case 'achievement':
      return 'from-purple-500 to-indigo-500'
    case 'comment':
      return 'from-blue-500 to-purple-500'
    default:
      return 'from-gray-500 to-gray-600'
  }
}

function getActivityText(activity: Activity) {
  switch (activity.type) {
    case 'review':
      return 'reviewed'
    case 'rating':
      return 'rated'
    case 'list_add':
      return activity.status === 'watching'
        ? 'started watching'
        : activity.status === 'completed'
          ? 'completed'
          : activity.status === 'plan-to-watch'
            ? 'added to plan to watch'
            : 'added to list'
    case 'friend_add':
      return 'became friends with'
    case 'achievement':
      return 'unlocked'
    case 'comment':
      return 'commented on'
    default:
      return 'interacted with'
  }
}
