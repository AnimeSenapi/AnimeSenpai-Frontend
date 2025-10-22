'use client'

import { Badge } from '../ui/badge'
import {
  Trophy,
  Star,
  Lock,
  Check,
  Flame,
  Users,
  MessageSquare,
  Zap,
  Crown,
} from 'lucide-react'
import { cn } from '@/app/lib/utils'

export interface Achievement {
  id: string
  key: string
  name: string
  description: string
  icon: string
  category: 'watching' | 'social' | 'reviews' | 'streak' | 'collection' | 'special'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  points: number
  requirement: number
  progress?: number
  unlocked: boolean
  unlockedAt?: string
  isSecret?: boolean
}

interface AchievementCardProps {
  achievement: Achievement
  showProgress?: boolean
  compact?: boolean
  onClick?: () => void
}

const TIER_COLORS = {
  bronze: 'from-amber-700 to-amber-600',
  silver: 'from-gray-400 to-gray-500',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-cyan-400 to-blue-500',
  diamond: 'from-purple-400 to-pink-500',
}

const TIER_GLOW = {
  bronze: 'shadow-amber-500/20',
  silver: 'shadow-gray-400/20',
  gold: 'shadow-yellow-400/30',
  platinum: 'shadow-cyan-400/30',
  diamond: 'shadow-purple-400/30',
}

const CATEGORY_ICONS: Record<Achievement['category'], any> = {
  watching: Flame,
  social: Users,
  reviews: MessageSquare,
  streak: Zap,
  collection: Star,
  special: Crown,
}

export function AchievementCard({
  achievement,
  showProgress = true,
  compact = false,
  onClick,
}: AchievementCardProps) {
  const CategoryIcon = CATEGORY_ICONS[achievement.category]
  const isLocked = !achievement.unlocked
  const progress = achievement.progress || 0
  const progressPercent = (progress / achievement.requirement) * 100

  // If secret and locked, hide details
  if (achievement.isSecret && isLocked) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'glass rounded-xl border border-white/10 transition-all',
          compact ? 'p-4' : 'p-6',
          onClick && 'cursor-pointer hover:border-white/20'
        )}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center">
            <Lock className="w-8 h-8 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">Secret Achievement</h3>
            <p className="text-sm text-gray-400">???</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass rounded-xl border transition-all relative overflow-hidden',
        compact ? 'p-4' : 'p-6',
        achievement.unlocked
          ? `border-${achievement.tier}-500/30 ${TIER_GLOW[achievement.tier]}`
          : 'border-white/10',
        onClick && 'cursor-pointer hover:border-white/20',
        achievement.unlocked && 'hover:scale-[1.02]'
      )}
    >
      {/* Shimmer effect for unlocked achievements */}
      {achievement.unlocked && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-r opacity-10',
              `${TIER_COLORS[achievement.tier]}`
            )}
          />
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              'rounded-xl flex items-center justify-center flex-shrink-0 relative',
              compact ? 'w-12 h-12' : 'w-16 h-16',
              achievement.unlocked
                ? `bg-gradient-to-r ${TIER_COLORS[achievement.tier]} shadow-lg ${TIER_GLOW[achievement.tier]}`
                : 'bg-white/5'
            )}
          >
            {achievement.unlocked ? (
              <span className={cn('text-2xl', compact && 'text-xl')}>{achievement.icon}</span>
            ) : (
              <Lock className={cn('text-gray-600', compact ? 'w-6 h-6' : 'w-8 h-8')} />
            )}

            {/* Unlock checkmark */}
            {achievement.unlocked && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3
                  className={cn(
                    'font-bold mb-1',
                    compact ? 'text-base' : 'text-lg',
                    achievement.unlocked ? 'text-white' : 'text-gray-400'
                  )}
                >
                  {achievement.name}
                </h3>
                <p className={cn('text-gray-400', compact ? 'text-xs' : 'text-sm')}>
                  {achievement.description}
                </p>
              </div>

              {/* Tier Badge */}
              <Badge
                className={cn(
                  'capitalize text-xs',
                  achievement.unlocked
                    ? `bg-gradient-to-r ${TIER_COLORS[achievement.tier]} text-white border-0`
                    : 'bg-white/5 text-gray-500 border-white/10'
                )}
              >
                {achievement.tier}
              </Badge>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-4">
              {/* Category & Points */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <CategoryIcon className="w-3.5 h-3.5" />
                  <span className="capitalize">{achievement.category}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-primary-400">
                  <Star className="w-3.5 h-3.5" />
                  <span>{achievement.points} XP</span>
                </div>
              </div>

              {/* Unlocked date */}
              {achievement.unlocked && achievement.unlockedAt && (
                <span className="text-xs text-gray-500">
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Progress Bar */}
            {showProgress && !achievement.unlocked && achievement.progress !== undefined && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                  <span>Progress</span>
                  <span className="font-medium">
                    {progress}/{achievement.requirement}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, progressPercent)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Achievement showcase for profiles
export function AchievementShowcase({ achievements }: { achievements: Achievement[] }) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalPoints = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0)

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Achievements</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {unlockedCount}/{achievements.length}
          </div>
        </div>

        <div className="glass rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-primary-400" />
            <span className="text-sm text-gray-400">Total XP</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalPoints.toLocaleString()}</div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          Recent Unlocks
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements
            .filter((a) => a.unlocked)
            .sort((a, b) => {
              const dateA = new Date(a.unlockedAt || 0).getTime()
              const dateB = new Date(b.unlockedAt || 0).getTime()
              return dateB - dateA
            })
            .slice(0, 4)
            .map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                showProgress={false}
                compact
              />
            ))}
        </div>
      </div>
    </div>
  )
}
