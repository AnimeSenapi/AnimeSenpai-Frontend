'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Lock, Check } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { LoadingState } from '../../components/ui/loading-state'
import { useAuth } from '../lib/auth-context'
import { cn } from '../lib/utils'

interface Achievement {
  id: string
  key: string
  name: string
  description: string
  icon: string
  category: string
  tier: string
  requirement: number
  points: number
  unlocked: boolean
  unlockedAt?: string
  progress: number
  percentage: number
}

export default function AchievementsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [byCategory, setByCategory] = useState<Record<string, Achievement[]>>({})
  const [stats, setStats] = useState({
    unlockedCount: 0,
    totalCount: 0,
    totalPoints: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }

    loadAchievements()
  }, [isAuthenticated])

  const loadAchievements = async () => {
    try {
      setLoading(true)

      const { apiGetMyAchievements } = await import('../lib/api')
      const data = (await apiGetMyAchievements()) as any

      if (data) {
        setAchievements(data.achievements || [])
        setByCategory(data.byCategory || {})
        setStats({
          unlockedCount: data.unlockedCount || 0,
          totalCount: data.totalCount || 0,
          totalPoints: data.totalPoints || 0,
        })
      }
    } catch (error) {
      console.error('Failed to load achievements:', error)
      setAchievements([])
    } finally {
      setLoading(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'from-amber-700 to-amber-600'
      case 'silver':
        return 'from-gray-400 to-gray-500'
      case 'gold':
        return 'from-yellow-400 to-yellow-500'
      case 'platinum':
        return 'from-cyan-400 to-blue-500'
      default:
        return 'from-gray-600 to-gray-700'
    }
  }

  const filteredAchievements =
    selectedCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory)

  if (loading) {
    return <LoadingState variant="full" text="Loading achievements..." size="lg" />
  }

  const categories = Object.keys(byCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      <main className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Achievements</h1>
              <p className="text-gray-400">Earn badges for your anime journey</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">
                {stats.unlockedCount}/{stats.totalCount}
              </div>
              <div className="text-sm text-gray-400">Achievements Unlocked</div>
            </div>
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent mb-1">
                {stats.totalPoints}
              </div>
              <div className="text-sm text-gray-400">Total Points</div>
            </div>
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">
                {Math.floor((stats.unlockedCount / stats.totalCount) * 100)}%
              </div>
              <div className="text-sm text-gray-400">Completion</div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className={cn(
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                  : 'border-white/20 text-white hover:bg-white/10'
              )}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                    : 'border-white/20 text-white hover:bg-white/10'
                )}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                'glass rounded-xl p-6 border transition-all',
                achievement.unlocked
                  ? 'border-primary-500/50 bg-white/5'
                  : 'border-white/10 opacity-75'
              )}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={cn(
                    'w-16 h-16 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br',
                    achievement.unlocked
                      ? getTierColor(achievement.tier)
                      : 'from-gray-700 to-gray-800'
                  )}
                >
                  {achievement.unlocked ? (
                    achievement.icon
                  ) : (
                    <Lock className="h-8 w-8 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white">{achievement.name}</h3>
                    {achievement.unlocked && <Check className="h-4 w-4 text-success-400" />}
                  </div>
                  <p className="text-xs text-gray-400">{achievement.description}</p>
                </div>
              </div>

              {/* Progress Bar */}
              {!achievement.unlocked && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>
                      {achievement.progress}/{achievement.requirement}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all"
                      style={{ width: `${achievement.percentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs">
                <Badge
                  className={cn(
                    'text-[10px] px-2 py-0.5',
                    achievement.tier === 'platinum' &&
                      'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
                    achievement.tier === 'gold' &&
                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                    achievement.tier === 'silver' &&
                      'bg-gray-400/20 text-gray-300 border-gray-400/30',
                    achievement.tier === 'bronze' &&
                      'bg-amber-700/20 text-amber-400 border-amber-700/30'
                  )}
                >
                  {achievement.tier}
                </Badge>
                <span className="text-gray-500">{achievement.points} points</span>
              </div>

              {achievement.unlocked && achievement.unlockedAt && (
                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-500">
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
