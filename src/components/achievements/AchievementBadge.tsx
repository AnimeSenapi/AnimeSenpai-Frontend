'use client'

import { Achievement, TIER_INFO } from '../../lib/achievements'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AchievementBadgeProps {
  achievement: Achievement
  unlocked: boolean
  progress?: number
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
}

export function AchievementBadge({
  achievement,
  unlocked,
  progress = 0,
  size = 'md',
  showProgress = false
}: AchievementBadgeProps) {
  const Icon = achievement.icon
  const tierInfo = TIER_INFO[achievement.tier]

  const sizes = {
    sm: {
      container: 'w-16 h-16',
      icon: 'h-6 w-6',
      badge: 'text-[10px] px-1.5 py-0.5'
    },
    md: {
      container: 'w-20 h-20',
      icon: 'h-8 w-8',
      badge: 'text-xs px-2 py-0.5'
    },
    lg: {
      container: 'w-24 h-24',
      icon: 'h-10 w-10',
      badge: 'text-sm px-2 py-1'
    }
  }

  const sizeConfig = sizes[size]

  return (
    <div className="relative group">
      {/* Achievement Icon */}
      <div
        className={cn(
          sizeConfig.container,
          'rounded-2xl flex items-center justify-center relative transition-all duration-300',
          unlocked
            ? `bg-gradient-to-br ${tierInfo.color} shadow-lg ${tierInfo.glow} group-hover:scale-110`
            : 'bg-white/5 border border-white/10 group-hover:bg-white/10'
        )}
      >
        {unlocked ? (
          <Icon className={cn(sizeConfig.icon, 'text-white')} />
        ) : (
          <Lock className={cn(sizeConfig.icon, 'text-gray-600')} />
        )}

        {/* Progress Ring (for locked achievements) */}
        {!unlocked && showProgress && progress > 0 && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-white/10"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${progress * 283} 283`}
              className={tierInfo.textColor}
            />
          </svg>
        )}
      </div>

      {/* Tier Badge */}
      <div
        className={cn(
          'absolute -bottom-1 -right-1 rounded-full uppercase font-bold',
          sizeConfig.badge,
          unlocked
            ? `${tierInfo.bgColor} ${tierInfo.textColor} border ${tierInfo.borderColor}`
            : 'bg-gray-800 text-gray-600 border border-gray-700'
        )}
      >
        {achievement.tier[0]}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="glass rounded-xl p-3 min-w-[200px] shadow-xl border border-white/10">
          <h4 className={cn('font-semibold mb-1', unlocked ? 'text-white' : 'text-gray-400')}>
            {achievement.name}
          </h4>
          <p className="text-xs text-gray-400 mb-2">{achievement.description}</p>
          
          {!unlocked && showProgress && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Progress</span>
                <span className={tierInfo.textColor}>{Math.round(progress * 100)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className={cn('h-full rounded-full bg-gradient-to-r', tierInfo.color)}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )}

          {unlocked && achievement.unlockedAt && (
            <p className="text-xs text-gray-500 mt-2">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

