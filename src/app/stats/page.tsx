'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { RequireAuth } from '../lib/protected-route'
import { AchievementCard, Achievement } from '@/components/gamification/AchievementCard'
import { StreakTracker } from '@/components/gamification/StreakTracker'
import { UserStats } from '@/components/gamification/UserStats'
import { Leaderboard } from '@/components/gamification/Leaderboard'
import { GridSkeleton } from '@/components/ui/skeleton'
import {
  Trophy,
  Flame,
  BarChart3,
  Crown,
  Star,
  Sparkles,
  Award,
} from 'lucide-react'
import { useToast } from '../../components/ui/toast'
import { api } from '../lib/api'

export default function StatsPage() {
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboards'>(
    'overview'
  )
  const [loading, setLoading] = useState(true)

  // Data
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [streak, setStreak] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [leaderboards, setLeaderboards] = useState<any>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load all gamification data
      const [achievementsData, statsData] = await Promise.all([loadAchievements(), loadStats()])

      setAchievements(achievementsData)
      setStats(statsData)

      // Mock streak data for now
      setStreak({
        currentStreak: 5,
        longestStreak: 12,
        totalDays: 45,
        lastActivityDate: new Date().toISOString(),
        streakHistory: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          hasActivity: i < 5,
        })),
      })

      // Load leaderboards
      if (activeTab === 'leaderboards') {
        await loadLeaderboards()
      }
    } catch (error) {
      console.error('Failed to load gamification data:', error)
      addToast({
        title: 'Error',
        description: 'Failed to load stats',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAchievements = async () => {
    try {
      const data = await api.trpcQuery('achievements.getMyAchievements')
      return data || []
    } catch (error) {
      return []
    }
  }

  const loadStats = async () => {
    try {
      const data = await api.trpcQuery('user.getStats')
      return (
        data || {
          totalAnime: 0,
        variant: 'destructive',
      })
    } catch (error) {
      return null
    }
  }

  const loadLeaderboards = async () => {
    try {
      const [watchers, reviewers, social] = await Promise.all([
        api.trpcQuery('leaderboards.getTopWatchers', { limit: 10, timeRange: 'all' }),
        api.trpcQuery('leaderboards.getTopReviewers', { limit: 10 }),
        api.trpcQuery('leaderboards.getMostSocial', { limit: 10 }),
      ])

      setLeaderboards({
        watchers: watchers || [],
        reviewers: reviewers || [],
        social: social || [],
      })
    } catch (error) {
      console.error('Failed to load leaderboards:', error)
    }
  }

  // Filter achievements
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const filteredAchievements = achievements.filter((a) => {
    if (achievementFilter === 'unlocked') return a.unlocked
    if (achievementFilter === 'locked') return !a.unlocked
    return true
  })

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalPoints = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0)

  function cn(...classes: (string | undefined)[]): string {
    return classes.filter(Boolean).join(' ')
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <main className="container mx-auto px-3 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-8 sm:pb-16 relative z-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  Your Stats & Achievements
                </h1>
                <p className="text-sm sm:text-base text-gray-400 mt-1">
                  Track your anime journey and unlock achievements
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 overflow-x-auto scrollbar-hide -mx-3 px-3">
            <div className="flex gap-2 min-w-max pb-2">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'achievements', label: 'Achievements', icon: Trophy },
                { id: 'leaderboards', label: 'Leaderboards', icon: Crown },
              ].map((tab) => {
                const Icon = tab.icon
                function cn(...classes: (string | undefined)[]): string {
                  return classes.filter(Boolean).join(' ')
                }

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any)
                      if (tab.id === 'leaderboards' && Object.keys(leaderboards).length === 0) {
                        loadLeaderboards()
                      }
                    }}
                    className={cn(
                      'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap',
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <GridSkeleton items={8} columns={4} />
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                      <div className="text-2xl font-bold text-white">
                        {totalPoints.toLocaleString()}
                      </div>
                    </div>

                    <div className="glass rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="text-sm text-gray-400">Streak</span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {streak?.currentStreak || 0}
                      </div>
                    </div>

                    <div className="glass rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-purple-400" />
                        <span className="text-sm text-gray-400">Level</span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {Math.floor(totalPoints / 100)}
                      </div>
                    </div>
                  </div>

                  {/* Streak & Stats */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {streak && <StreakTracker streak={streak} />}
                    {stats && <UserStats stats={stats} showDetailed={false} />}
                  </div>

                  {/* Recent Achievements */}
                  {achievements.filter((a) => a.unlocked).length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary-400" />
                        Recent Unlocks
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {achievements
                          .filter((a) => a.unlocked)
                          .sort((a, b) => {
                            const dateA = new Date(a.unlockedAt || 0).getTime()
                            const dateB = new Date(b.unlockedAt || 0).getTime()
                            return dateB - dateA
                          })
                          .slice(0, 6)
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
                  )}
                </div>
              )}

              {activeTab === 'achievements' && (
                <div>
                  {/* Filter */}
                  <div className="flex items-center gap-2 mb-6">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'unlocked', label: 'Unlocked' },
                      { id: 'locked', label: 'Locked' },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setAchievementFilter(filter.id as any)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                          achievementFilter === filter.id
                            ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        {filter.label}
                        {filter.id === 'unlocked' && ` (${unlockedCount})`}
                        {filter.id === 'locked' && ` (${achievements.length - unlockedCount})`}
                      </button>
                    ))}
                  </div>

                  {/* Achievements Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAchievements.map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        showProgress
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'leaderboards' && (
                <div className="space-y-6">
                  <Leaderboard
                    entries={leaderboards.watchers || []}
                    category="watchers"
                    timeRange="all"
                  />
                  <Leaderboard
                    entries={leaderboards.reviewers || []}
                    category="reviewers"
                    timeRange="all"
                  />
                  <Leaderboard
                    entries={leaderboards.social || []}
                    category="social"
                    timeRange="all"
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </RequireAuth>
  )
}
