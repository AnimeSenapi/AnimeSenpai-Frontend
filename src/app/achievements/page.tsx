'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Trophy,
  Star,
  Users,
  BookOpen,
  CheckCircle,
  Compass,
  Gem,
  Award,
  Target,
  Home,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiGetMyAchievements, apiGetAchievementStats } from '../lib/api'
import { RequireAuth } from '../lib/protected-route'
import { LoadingState } from '../../components/ui/loading-state'
import { EmptyState } from '../../components/ui/error-state'
import { Button } from '../../components/ui/button'

interface AchievementTier {
  id: string
  tier: number
  requirement: number
  points: number
  name: string
  description: string
}

interface Achievement {
  id: string
  key: string
  baseName: string
  baseDescription: string
  icon: string
  category: string
  maxTier: number
  tiers: AchievementTier[]
  unlockedTiers: number[]
  currentProgress: number
  highestUnlockedTier: number
  nextTierRequirement: number
  nextTier?: AchievementTier
  progressPercentage: number
}

interface AchievementStats {
  totalAchievements: number
  totalTiers: number
  unlockedTiers: number
  totalPoints: number
  categoryStats: Array<{ category: string; _count: { id: number } }>
}

const CATEGORY_ICONS = {
  watching: BookOpen,
  rating: Star,
  social: Users,
  discovery: Compass,
  special: Gem
}

const CATEGORY_COLORS = {
  watching: 'text-blue-400',
  rating: 'text-yellow-400',
  social: 'text-green-400',
  discovery: 'text-purple-400',
  special: 'text-pink-400'
}

const TIER_COLORS = {
  1: 'text-amber-400',
  2: 'text-gray-400',
  3: 'text-yellow-400',
  4: 'text-cyan-400',
  5: 'text-purple-400',
  6: 'text-pink-400',
  7: 'text-red-400',
  8: 'text-indigo-400'
}

const TIER_BG_COLORS = {
  1: 'bg-amber-500/10',
  2: 'bg-gray-500/10',
  3: 'bg-yellow-500/10',
  4: 'bg-cyan-500/10',
  5: 'bg-purple-500/10',
  6: 'bg-pink-500/10',
  7: 'bg-red-500/10',
  8: 'bg-indigo-500/10'
}

export default function AchievementsPage() {
  const router = useRouter()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState<AchievementStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [achievementsData, statsData] = await Promise.all([
        apiGetMyAchievements(),
        apiGetAchievementStats()
      ])
      
      if (achievementsData && typeof achievementsData === 'object') {
        // Handle different response formats
        let achievementsList: Achievement[] = []
        const data = achievementsData as any
        
        if (data.result?.data) {
          // tRPC response format - extract from categories
          const resultData = data.result.data
          if (resultData.watching) achievementsList = [...achievementsList, ...resultData.watching]
          if (resultData.rating) achievementsList = [...achievementsList, ...resultData.rating]
          if (resultData.social) achievementsList = [...achievementsList, ...resultData.social]
          if (resultData.discovery) achievementsList = [...achievementsList, ...resultData.discovery]
          if (resultData.special) achievementsList = [...achievementsList, ...resultData.special]
        } else if (data.achievements && Array.isArray(data.achievements)) {
          achievementsList = data.achievements
        } else if (Array.isArray(achievementsData)) {
          achievementsList = achievementsData
        } else {
          // Try to extract from category keys
          if (data.watching) achievementsList = [...achievementsList, ...(Array.isArray(data.watching) ? data.watching : [])]
          if (data.rating) achievementsList = [...achievementsList, ...(Array.isArray(data.rating) ? data.rating : [])]
          if (data.social) achievementsList = [...achievementsList, ...(Array.isArray(data.social) ? data.social : [])]
          if (data.discovery) achievementsList = [...achievementsList, ...(Array.isArray(data.discovery) ? data.discovery : [])]
          if (data.special) achievementsList = [...achievementsList, ...(Array.isArray(data.special) ? data.special : [])]
        }
        setAchievements(achievementsList)
      }
      
      if (statsData && typeof statsData === 'object') {
        const stats = statsData as any
        if (stats.result?.data) {
          setStats(stats.result.data as AchievementStats)
        } else {
          setStats(stats as AchievementStats)
        }
      }
    } catch (err) {
      console.error('Failed to load achievements:', err)
      setError('Failed to load achievements. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory)

  const categories = [
    { key: 'all', label: 'All', icon: Trophy },
    { key: 'watching', label: 'Watching', icon: BookOpen },
    { key: 'rating', label: 'Rating', icon: Star },
    { key: 'social', label: 'Social', icon: Users },
    { key: 'discovery', label: 'Discovery', icon: Compass },
    { key: 'special', label: 'Special', icon: Gem },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-12 sm:pb-16 lg:pb-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            <LoadingState variant="page" text="Loading achievements..." size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-12 sm:pb-16 lg:pb-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            <EmptyState
              icon={<AlertCircle className="h-10 w-10 text-gray-500" />}
              title="Error loading achievements"
              message={error || 'Unknown error occurred'}
              actionLabel="Try Again"
              onAction={loadData}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-12 sm:pb-16 lg:pb-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center border border-primary-500/30">
                  <Trophy className="h-6 w-6 text-primary-400" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">Achievements</h1>
                  <p className="text-gray-400 text-sm">Track your progress and unlock new tiers as you explore anime</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="glass rounded-xl p-3 sm:p-4 border border-white/10 mb-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="glass rounded-xl p-4 text-center hover:bg-white/5 transition-all border border-white/10"
                  >
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500/20 to-primary-400/10 rounded-lg mb-2">
                      <Trophy className="h-5 w-5 text-primary-400" />
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{stats.unlockedTiers}</p>
                    <p className="text-xs text-gray-400">Tiers Unlocked</p>
                  </button>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="glass rounded-xl p-4 text-center hover:bg-white/5 transition-all border border-white/10"
                  >
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-400/10 rounded-lg mb-2">
                      <Target className="h-5 w-5 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{stats.totalTiers}</p>
                    <p className="text-xs text-gray-400">Total Tiers</p>
                  </button>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="glass rounded-xl p-4 text-center hover:bg-white/5 transition-all border border-white/10"
                  >
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-yellow-400/10 rounded-lg mb-2">
                      <Star className="h-5 w-5 text-yellow-400" />
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{stats.totalPoints.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Points Earned</p>
                  </button>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="glass rounded-xl p-4 text-center hover:bg-white/5 transition-all border border-white/10"
                  >
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-400/10 rounded-lg mb-2">
                      <Award className="h-5 w-5 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{stats.totalAchievements}</p>
                    <p className="text-xs text-gray-400">Achievement Types</p>
                  </button>
                </div>
              </div>
            )}

            {/* Category Filter */}
            <div className="glass rounded-xl p-3 border border-white/10 mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm whitespace-nowrap flex-shrink-0',
                        selectedCategory === category.key
                          ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/40 text-white shadow-md shadow-primary-500/10'
                          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent glass'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {category.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement) => {
                const CategoryIcon = CATEGORY_ICONS[achievement.category as keyof typeof CATEGORY_ICONS] || Trophy
                const categoryColor = CATEGORY_COLORS[achievement.category as keyof typeof CATEGORY_COLORS] || 'text-gray-400'
                
                return (
                  <div key={achievement.id} className="glass rounded-xl p-4 border border-white/10 hover:bg-white/5 transition-all">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        TIER_BG_COLORS[achievement.highestUnlockedTier as keyof typeof TIER_BG_COLORS] || 'bg-gray-500/10'
                      )}>
                        <CategoryIcon className={cn(
                          'h-5 w-5',
                          TIER_COLORS[achievement.highestUnlockedTier as keyof typeof TIER_COLORS] || 'text-gray-400'
                        )} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm mb-1">{achievement.baseName}</h3>
                        <p className="text-xs text-gray-400 mb-2 line-clamp-2">{achievement.baseDescription}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn('text-xs px-2 py-0.5 rounded-lg font-medium', categoryColor === 'text-blue-400' ? 'bg-blue-500/20' : categoryColor === 'text-yellow-400' ? 'bg-yellow-500/20' : categoryColor === 'text-green-400' ? 'bg-green-500/20' : categoryColor === 'text-purple-400' ? 'bg-purple-500/20' : 'bg-pink-500/20')}>
                            {achievement.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {achievement.unlockedTiers.length}/{achievement.maxTier}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {achievement.nextTierRequirement > 0 && (
                      <div className="mb-3 bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-gray-300">Progress</span>
                          <span className="text-primary-300 font-medium">{achievement.currentProgress}/{achievement.nextTierRequirement}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${achievement.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Tiers */}
                    <div className="space-y-2">
                      {achievement.tiers
                        .filter((tier) => tier.tier <= achievement.highestUnlockedTier + 2)
                        .slice(-3)
                        .map((tier) => {
                          const isUnlocked = achievement.unlockedTiers.includes(tier.tier)
                          const isNext = tier.tier === achievement.highestUnlockedTier + 1
                          
                          return (
                            <div
                              key={tier.id}
                              className={cn(
                                'flex items-center gap-2 p-2.5 rounded-lg border',
                                isUnlocked 
                                  ? 'bg-green-500/10 border-green-500/30' 
                                  : isNext
                                  ? 'bg-primary-500/10 border-primary-500/30'
                                  : 'bg-white/5 border-white/10'
                              )}
                            >
                              <div className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                                isUnlocked 
                                  ? 'bg-gradient-to-br from-green-500 to-green-400 text-white' 
                                  : isNext
                                  ? 'bg-gradient-to-br from-primary-500 to-primary-400 text-white'
                                  : 'bg-gray-600/30 text-gray-400'
                              )}>
                                {tier.tier}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <h4 className={cn(
                                    'font-medium text-xs',
                                    isUnlocked ? 'text-green-300' : isNext ? 'text-primary-300' : 'text-gray-300'
                                  )}>
                                    {tier.name}
                                  </h4>
                                  {isUnlocked && <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />}
                                </div>
                                <p className="text-xs text-gray-400 mb-1 line-clamp-1">{tier.description}</p>
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="text-gray-500">{tier.requirement} req</span>
                                  <span className="text-yellow-400">•</span>
                                  <span className="text-yellow-400 font-medium">{tier.points} pts</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
              </div>
            )
          })}
        </div>

            {filteredAchievements.length === 0 && (
              <div className="glass rounded-xl p-12 border border-white/10">
                <EmptyState
                  icon={<Trophy className="h-10 w-10 text-gray-500" />}
                  title="No achievements yet"
                  message="Start watching anime, rating shows, and connecting with others to unlock your first tiers!"
                  actionLabel="Go to Dashboard"
                  onAction={() => router.push('/dashboard')}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}