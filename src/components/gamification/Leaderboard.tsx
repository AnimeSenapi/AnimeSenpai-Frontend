'use client'

import Link from 'next/link'
import { Badge } from '../ui/badge'
import {
  Crown,
  Trophy,
  Medal,
  TrendingUp,
  Eye,
  MessageSquare,
  Users,
  Flame,
} from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface LeaderboardEntry {
  rank: number
  user: {
    id: string
    username: string
    avatar?: string
  }
  score: number
  change?: number // Position change from previous period
  badge?: string
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  category: 'watchers' | 'reviewers' | 'social' | 'streak'
  timeRange?: 'week' | 'month' | 'all'
  currentUserId?: string
  showTop?: number
}

const CATEGORY_CONFIG = {
  watchers: {
    title: 'Top Watchers',
    description: 'Most episodes watched',
    icon: Eye,
    gradient: 'from-blue-500 to-cyan-500',
    scoreLabel: 'episodes',
  },
  reviewers: {
    title: 'Top Reviewers',
    description: 'Most helpful reviews',
    icon: MessageSquare,
    gradient: 'from-purple-500 to-pink-500',
    scoreLabel: 'reviews',
  },
  social: {
    title: 'Most Social',
    description: 'Most active community members',
    icon: Users,
    gradient: 'from-pink-500 to-rose-500',
    scoreLabel: 'interactions',
  },
  streak: {
    title: 'Longest Streaks',
    description: 'Most consistent watchers',
    icon: Flame,
    gradient: 'from-orange-500 to-red-500',
    scoreLabel: 'days',
  },
}

export function Leaderboard({
  entries,
  category,
  timeRange = 'all',
  currentUserId,
  showTop = 10,
}: LeaderboardProps) {
  const config = CATEGORY_CONFIG[category]
  const Icon = config.icon
  const displayedEntries = entries.slice(0, showTop)
  const currentUserEntry = entries.find((e) => e.user.id === currentUserId)
  const showCurrentUser = currentUserId && currentUserEntry && currentUserEntry.rank > showTop

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400 fill-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-700 fill-amber-700" />
      default:
        return <span className="text-sm font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
            🥇 1st
          </Badge>
        )
      case 2:
        return (
          <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0">
            🥈 2nd
          </Badge>
        )
      case 3:
        return (
          <Badge className="bg-gradient-to-r from-amber-700 to-amber-600 text-white border-0">
            🥉 3rd
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-12 h-12 bg-gradient-to-r rounded-xl flex items-center justify-center shadow-lg',
              config.gradient
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{config.title}</h2>
            <p className="text-sm text-gray-400">{config.description}</p>
          </div>
        </div>

        {/* Time Range */}
        {timeRange && (
          <Badge className="bg-white/10 text-white border-white/20 capitalize">{timeRange}</Badge>
        )}
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {displayedEntries.map((entry) => {
          const isCurrentUser = entry.user.id === currentUserId
          const isTop3 = entry.rank <= 3

          return (
            <div
              key={entry.user.id}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl transition-all',
                isCurrentUser
                  ? 'bg-primary-500/10 border border-primary-500/30 shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10',
                isTop3 && !isCurrentUser && 'border-white/20'
              )}
            >
              {/* Rank */}
              <div className="w-8 flex items-center justify-center flex-shrink-0">
                {getRankIcon(entry.rank)}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                {entry.user.avatar ? (
                  <img
                    src={entry.user.avatar}
                    alt={entry.user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  entry.user.username?.[0]?.toUpperCase() || 'U'
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/user/${entry.user.username}`}
                    className="font-semibold text-white hover:text-primary-300 transition-colors truncate"
                  >
                    {entry.user.username}
                  </Link>
                  {isCurrentUser && (
                    <Badge className="bg-primary-500/20 text-primary-300 border-primary-500/30 text-xs">
                      You
                    </Badge>
                  )}
                  {getRankBadge(entry.rank)}
                </div>

                {/* Change indicator */}
                {entry.change !== undefined && entry.change !== 0 && (
                  <div
                    className={cn(
                      'flex items-center gap-1 text-xs mt-1',
                      entry.change > 0 ? 'text-green-400' : 'text-red-400'
                    )}
                  >
                    <TrendingUp className={cn('w-3 h-3', entry.change < 0 && 'rotate-180')} />
                    <span>
                      {Math.abs(entry.change)} {entry.change > 0 ? 'up' : 'down'}
                    </span>
                  </div>
                )}
              </div>

              {/* Score */}
              <div className="text-right flex-shrink-0">
                <div className="text-xl font-bold text-white">{entry.score.toLocaleString()}</div>
                <div className="text-xs text-gray-400">{config.scoreLabel}</div>
              </div>

              {/* Special Badge */}
              {entry.badge && (
                <div className="flex-shrink-0">
                  <span className="text-2xl" title={entry.badge}>
                    {entry.badge}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Current User (if not in top) */}
      {showCurrentUser && currentUserEntry && (
        <>
          <div className="my-4 border-t border-white/10" />
          <div className="flex items-center gap-4 p-4 rounded-xl bg-primary-500/10 border border-primary-500/30">
            <div className="w-8 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary-300">#{currentUserEntry.rank}</span>
            </div>

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold flex-shrink-0">
              {currentUserEntry.user.avatar ? (
                <img
                  src={currentUserEntry.user.avatar}
                  alt={currentUserEntry.user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                currentUserEntry.user.username?.[0]?.toUpperCase() || 'U'
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{currentUserEntry.user.username}</span>
                <Badge className="bg-primary-500/20 text-primary-300 border-primary-500/30 text-xs">
                  You
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-bold text-white">
                {currentUserEntry.score.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">{config.scoreLabel}</div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {entries.length === 0 && (
        <div className="text-center py-8">
          <Icon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400">No data yet for this leaderboard</p>
        </div>
      )}
    </div>
  )
}
