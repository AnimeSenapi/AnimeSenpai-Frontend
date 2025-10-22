'use client'

import { Badge } from '../ui/badge'
import { Flame, Calendar, Award, Check, X, Crown } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface StreakData {
  currentStreak: number
  longestStreak: number
  totalDays: number
  lastActivityDate: string
  streakHistory: Array<{
    date: string
    hasActivity: boolean
  }>
}

interface StreakTrackerProps {
  streak: StreakData
  compact?: boolean
}

export function StreakTracker({ streak, compact = false }: StreakTrackerProps) {
  const today = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (6 - i))
    return date
  })

  const hasActivityOnDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0] || ''
    return streak.streakHistory?.some((h) => h.date?.startsWith(dateStr) && h.hasActivity) || false
  }

  const getStreakLevel = (days: number) => {
    if (days >= 365) return { name: 'Legendary', color: 'from-purple-500 to-pink-500', emoji: '🏆' }
    if (days >= 180) return { name: 'Diamond', color: 'from-cyan-400 to-blue-500', emoji: '💎' }
    if (days >= 90) return { name: 'Gold', color: 'from-yellow-400 to-orange-500', emoji: '🥇' }
    if (days >= 30) return { name: 'Silver', color: 'from-gray-400 to-gray-500', emoji: '🥈' }
    if (days >= 7) return { name: 'Bronze', color: 'from-amber-700 to-amber-600', emoji: '🥉' }
    return { name: 'Starter', color: 'from-gray-600 to-gray-700', emoji: '🌱' }
  }

  const level = getStreakLevel(streak.currentStreak)

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Flame
          className={cn('w-5 h-5', streak.currentStreak > 0 ? 'text-orange-500' : 'text-gray-600')}
        />
        <div>
          <div className="text-sm font-bold text-white">{streak.currentStreak} day streak</div>
          <div className="text-xs text-gray-400">Best: {streak.longestStreak} days</div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-12 h-12 bg-gradient-to-r rounded-xl flex items-center justify-center shadow-lg',
              streak.currentStreak > 0 ? level.color : 'bg-white/5'
            )}
          >
            <Flame
              className={cn('w-6 h-6', streak.currentStreak > 0 ? 'text-white' : 'text-gray-600')}
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Watch Streak</h3>
            <p className="text-sm text-gray-400">Stay consistent!</p>
          </div>
        </div>

        {streak.currentStreak >= 7 && (
          <Badge className={cn('bg-gradient-to-r text-white border-0 shadow-lg', level.color)}>
            {level.emoji} {level.name}
          </Badge>
        )}
      </div>

      {/* Current Streak */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span
            className={cn(
              'text-4xl sm:text-5xl font-bold',
              streak.currentStreak > 0
                ? 'bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent'
                : 'text-gray-600'
            )}
          >
            {streak.currentStreak}
          </span>
          <span className="text-lg text-gray-400">day{streak.currentStreak !== 1 ? 's' : ''}</span>
        </div>
        <p className="text-sm text-gray-400">
          {streak.currentStreak > 0
            ? `Keep it going! You're on fire! 🔥`
            : 'Start your streak by watching anime today!'}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Best Streak</span>
          </div>
          <div className="text-xl font-bold text-white">{streak.longestStreak}</div>
        </div>

        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-primary-400" />
            <span className="text-xs text-gray-400">Total Days</span>
          </div>
          <div className="text-xl font-bold text-white">{streak.totalDays}</div>
        </div>
      </div>

      {/* Week View */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-400">Last 7 Days</span>
          <span className="text-xs text-gray-500">
            {last7Days.filter(hasActivityOnDate).length}/7 active
          </span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {last7Days.map((date, index) => {
            const hasActivity = hasActivityOnDate(date)
            const isToday = date.toDateString() === today.toDateString()
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })

            return (
              <div key={index} className="text-center">
                <div
                  className={cn(
                    'w-full aspect-square rounded-lg border-2 flex items-center justify-center mb-1 transition-all',
                    hasActivity
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-400 shadow-lg shadow-orange-500/30'
                      : 'bg-white/5 border-white/10',
                    isToday && 'ring-2 ring-primary-400 ring-offset-2 ring-offset-gray-900'
                  )}
                >
                  {hasActivity ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <X className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs',
                    isToday ? 'text-primary-400 font-bold' : 'text-gray-500'
                  )}
                >
                  {dayName}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Milestone Progress */}
      {streak.currentStreak > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="text-xs text-gray-400 mb-2">Next Milestone</div>
          {getNextMilestone(streak.currentStreak)}
        </div>
      )}
    </div>
  )
}

function getNextMilestone(currentStreak: number) {
  const milestones = [7, 14, 30, 60, 90, 180, 365]
  const next = milestones.find((m) => m > currentStreak)

  if (!next) {
    return (
      <div className="flex items-center gap-2 text-purple-400">
        <Crown className="w-4 h-4" />
        <span className="text-sm font-medium">You've reached legendary status! 🎉</span>
      </div>
    )
  }

  const progress = (currentStreak / next) * 100
  const remaining = next - currentStreak

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-white font-medium">{next} days</span>
        <span className="text-gray-400">{remaining} days to go</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
