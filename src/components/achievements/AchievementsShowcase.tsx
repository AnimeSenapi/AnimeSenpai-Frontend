'use client'

import { useState } from 'react'
import {
  Achievement,
  AchievementCategory,
  groupAchievementsByCategory,
} from '../../lib/achievements'
import { AchievementBadge } from './AchievementBadge'
import { Trophy, Star, Heart, Compass, Sparkles } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

interface AchievementsShowcaseProps {
  achievements: Achievement[]
  allAchievements: Achievement[]
  stats?: {
    totalAnime: number
    completedAnime: number
    totalRatings: number
    followers: number
    following: number
    mutualFollows: number
    uniqueGenres: number
    perfectRatings: number
  }
  compact?: boolean
}

const CATEGORY_INFO = {
  watching: {
    name: 'Watching',
    icon: Trophy,
    color: 'text-primary-400',
  },
  rating: {
    name: 'Rating',
    icon: Star,
    color: 'text-yellow-400',
  },
  social: {
    name: 'Social',
    icon: Heart,
    color: 'text-pink-400',
  },
  exploration: {
    name: 'Exploration',
    icon: Compass,
    color: 'text-blue-400',
  },
  special: {
    name: 'Special',
    icon: Sparkles,
    color: 'text-purple-400',
  },
}

export function AchievementsShowcase({
  achievements,
  allAchievements,
  stats,
  compact = false,
}: AchievementsShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all')

  const unlockedIds = new Set(achievements.map((a) => a.id))
  const groupedUnlocked = groupAchievementsByCategory(achievements)
  const groupedAll = groupAchievementsByCategory(allAchievements)

  // Calculate completion percentage
  const totalAchievements = allAchievements.length
  const unlockedCount = achievements.length
  const completionPercentage = (unlockedCount / totalAchievements) * 100

  // Get achievements to display
  const achievementsToShow =
    selectedCategory === 'all' ? allAchievements : groupedAll[selectedCategory]

  // Calculate progress for each achievement
  const getProgress = (achievement: Achievement): number => {
    if (!stats) return 0

    switch (achievement.id.split('_')[0]) {
      case 'anime':
        return stats.totalAnime / achievement.requirement
      case 'completed':
        return stats.completedAnime / achievement.requirement
      case 'ratings':
      case 'first':
        return stats.totalRatings / achievement.requirement
      case 'followers':
        return stats.followers / achievement.requirement
      case 'following':
        return stats.following / achievement.requirement
      case 'friends':
        return stats.mutualFollows / achievement.requirement
      case 'genres':
        return stats.uniqueGenres / achievement.requirement
      case 'perfectionist':
        return stats.perfectRatings / achievement.requirement
      default:
        return 0
    }
  }

  if (compact) {
    // Compact view for profile
    const recentAchievements = achievements
      .sort((a, b) => {
        const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0
        const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 6)

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary-400" />
            Achievements
          </h3>
          <span className="text-sm text-gray-400">
            {unlockedCount} / {totalAchievements}
          </span>
        </div>

        {achievements.length > 0 ? (
          <div className="grid grid-cols-6 gap-3">
            {recentAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                unlocked={true}
                size="sm"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">
            No achievements yet. Start watching anime to unlock badges!
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Header with stats */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
              <Trophy className="h-6 w-6 text-primary-400" />
              Achievements
            </h2>
            <p className="text-gray-400 text-sm">
              {unlockedCount} of {totalAchievements} unlocked
            </p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text">
              {completionPercentage.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-400">Complete</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Category stats */}
        <div className="grid grid-cols-5 gap-3 mt-4">
          {Object.entries(CATEGORY_INFO).map(([key, info]) => {
            const category = key as AchievementCategory
            const Icon = info.icon
            const categoryTotal = groupedAll[category].length
            const categoryUnlocked = groupedUnlocked[category].length

            return (
              <div key={key} className="text-center">
                <Icon className={cn('h-5 w-5 mx-auto mb-1', info.color)} />
                <div className="text-sm font-semibold text-white">
                  {categoryUnlocked}/{categoryTotal}
                </div>
                <div className="text-xs text-gray-500">{info.name}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
          className={
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
              : 'border-white/20 text-white hover:bg-white/10'
          }
        >
          All
        </Button>
        {Object.entries(CATEGORY_INFO).map(([key, info]) => {
          const Icon = info.icon
          return (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(key as AchievementCategory)}
              className={
                selectedCategory === key
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                  : 'border-white/20 text-white hover:bg-white/10'
              }
            >
              <Icon className="h-4 w-4 mr-2" />
              {info.name}
            </Button>
          )
        })}
      </div>

      {/* Achievements grid */}
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {achievementsToShow.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id)
          const progress = isUnlocked ? 1 : getProgress(achievement)

          return (
            <AchievementBadge
              key={achievement.id}
              achievement={
                isUnlocked ? achievements.find((a) => a.id === achievement.id)! : achievement
              }
              unlocked={isUnlocked}
              progress={progress}
              size="md"
              showProgress={!isUnlocked}
            />
          )
        })}
      </div>
    </div>
  )
}
