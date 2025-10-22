'use client'

import { Badge } from '../ui/badge'
import {
  BarChart3,
  Star,
  CheckCircle,
  Calendar,
  Target,
  Film,
  Eye,
  Clock,
  Heart,
} from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface UserStats {
  totalAnime: number
  totalEpisodes: number
  totalHours: number
  favorites: number
  watching: number
  completed: number
  planToWatch: number
  dropped?: number
  averageRating: number
  totalRatings: number
  totalReviews: number
  genreBreakdown?: Array<{ genre: string; count: number; percentage: number }>
  yearBreakdown?: Array<{ year: number; count: number }>
  completionRate?: number
  daysActive?: number
}

interface UserStatsProps {
  stats: UserStats
  showDetailed?: boolean
}

export function UserStats({ stats, showDetailed = true }: UserStatsProps) {
  const topGenres = stats.genreBreakdown?.slice(0, 5) || []

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Film}
          label="Total Anime"
          value={stats.totalAnime}
          gradient="from-primary-500 to-secondary-500"
        />
        <StatCard
          icon={Eye}
          label="Episodes"
          value={stats.totalEpisodes}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={Clock}
          label="Hours Watched"
          value={Math.round(stats.totalHours)}
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          icon={Heart}
          label="Favorites"
          value={stats.favorites}
          gradient="from-red-500 to-pink-500"
        />
      </div>

      {/* List Status Distribution */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-400" />
          List Breakdown
        </h3>

        <div className="space-y-3">
          <StatusBar
            label="Watching"
            count={stats.watching}
            total={stats.totalAnime}
            color="from-green-500 to-emerald-500"
            emoji="📺"
          />
          <StatusBar
            label="Completed"
            count={stats.completed}
            total={stats.totalAnime}
            color="from-blue-500 to-cyan-500"
            emoji="✅"
          />
          <StatusBar
            label="Plan to Watch"
            count={stats.planToWatch}
            total={stats.totalAnime}
            color="from-purple-500 to-pink-500"
            emoji="📝"
          />
          {stats.dropped !== undefined && stats.dropped > 0 && (
            <StatusBar
              label="Dropped"
              count={stats.dropped}
              total={stats.totalAnime}
              color="from-gray-600 to-gray-700"
              emoji="❌"
            />
          )}
        </div>
      </div>

      {showDetailed && (
        <>
          {/* Rating Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <h3 className="text-lg font-bold text-white">Average Rating</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-lg text-gray-400">/10</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                From {stats.totalRatings} rating{stats.totalRatings !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="glass rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-bold text-white">Completion Rate</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">
                  {stats.completionRate?.toFixed(0) || 0}
                </span>
                <span className="text-lg text-gray-400">%</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {stats.completed} of {stats.totalAnime} completed
              </p>
            </div>
          </div>

          {/* Top Genres */}
          {topGenres.length > 0 && (
            <div className="glass rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-400" />
                Top Genres
              </h3>
              <div className="space-y-3">
                {topGenres.map((genre, index) => (
                  <div key={genre.genre}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getGenreEmoji(genre.genre, index)}</span>
                        <span className="text-sm font-medium text-white">{genre.genre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">{genre.count}</span>
                        <Badge className="bg-primary-500/20 text-primary-300 border-primary-500/30 text-xs">
                          {genre.percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full bg-gradient-to-r transition-all duration-500',
                          index === 0 && 'from-primary-500 to-secondary-500',
                          index === 1 && 'from-blue-500 to-cyan-500',
                          index === 2 && 'from-purple-500 to-pink-500',
                          index === 3 && 'from-green-500 to-emerald-500',
                          index === 4 && 'from-orange-500 to-red-500'
                        )}
                        style={{ width: `${genre.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Stats */}
          {stats.daysActive !== undefined && (
            <div className="glass rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary-400" />
                Activity
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.daysActive}</div>
                  <div className="text-sm text-gray-400">Days Active</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.totalReviews}</div>
                  <div className="text-sm text-gray-400">Reviews Written</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: any
  label: string
  value: number
  gradient: string
}) {
  return (
    <div className="glass rounded-xl p-4 sm:p-6 border border-white/10">
      <div
        className={cn(
          'w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r rounded-lg sm:rounded-xl flex items-center justify-center mb-3 shadow-lg',
          gradient
        )}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{value.toLocaleString()}</div>
      <div className="text-xs sm:text-sm text-gray-400">{label}</div>
    </div>
  )
}

function StatusBar({
  label,
  count,
  total,
  color,
  emoji,
}: {
  label: string
  count: number
  total: number
  color: string
  emoji: string
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span>{emoji}</span>
          <span className="text-sm font-medium text-white">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{count}</span>
          <span className="text-xs text-gray-500">({percentage.toFixed(0)}%)</span>
        </div>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn('h-full bg-gradient-to-r transition-all duration-500', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function getGenreEmoji(genre: string, index: number): string {
  const emojiMap: Record<string, string> = {
    action: '⚔️',
    adventure: '🗺️',
    comedy: '😄',
    drama: '🎭',
    fantasy: '✨',
    horror: '👻',
    mystery: '🔍',
    romance: '💕',
    'sci-fi': '🚀',
    'slice of life': '🍵',
    sports: '⚽',
    supernatural: '👁️',
    thriller: '😱',
  }

  return emojiMap[genre.toLowerCase()] || ['🥇', '🥈', '🥉', '🏅', '⭐'][index] || '📺'
}
