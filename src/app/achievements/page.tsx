'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../lib/auth-context'
import { AchievementsShowcase } from '../../components/achievements/AchievementsShowcase'
import { ACHIEVEMENTS, calculateAchievements, Achievement } from '../../lib/achievements'
import { ArrowLeft, Trophy, Loader2 } from 'lucide-react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function AchievementsPage() {
  const { user, isAuthenticated, isLoading: authLoading, getAuthHeaders } = useAuth()
  const router = useRouter()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin')
      return
    }

    if (user) {
      fetchUserStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, isAuthenticated])

  const fetchUserStats = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      // Fetch user anime list
      const listResponse = await fetch(
        `${API_URL}/user.getAnimeList?input=${encodeURIComponent(JSON.stringify({}))}`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      )

      const listData = await listResponse.json()
      const animeList = listData.result?.data?.anime || []

      // Fetch social counts
      const socialResponse = await fetch(
        `${API_URL}/social.getSocialCounts?input=${encodeURIComponent(JSON.stringify({ userId: user.id }))}`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      )

      const socialData = await socialResponse.json()
      const socialCounts = socialData.result?.data || { followers: 0, following: 0, mutualFollows: 0 }

      // Calculate stats
      const completed = animeList.filter((a: any) => a.status === 'completed').length
      const ratings = animeList.filter((a: any) => a.score).length
      const perfectRatings = animeList.filter((a: any) => a.score === 10).length
      
      // Get unique genres
      const genreSet = new Set<string>()
      animeList.forEach((anime: any) => {
        if (anime.genres) {
          anime.genres.forEach((g: any) => genreSet.add(g.id || g))
        }
      })

      const userStats = {
        totalAnime: animeList.length,
        completedAnime: completed,
        totalRatings: ratings,
        followers: socialCounts.followers,
        following: socialCounts.following,
        mutualFollows: socialCounts.mutualFollows,
        uniqueGenres: genreSet.size,
        perfectRatings,
        hasAvatar: !!user.avatar,
        hasBio: !!user.bio,
        createdAt: new Date(user.createdAt || Date.now())
      }

      setStats(userStats)

      // Calculate achievements
      const unlockedAchievements = calculateAchievements(userStats)
      setAchievements(unlockedAchievements)

    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary-400 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link
            href="/user/profile"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Your Achievements
            </h1>
            <p className="text-xl text-gray-300">
              Track your progress and collect badges as you explore anime
            </p>
          </div>

          {/* Achievements Showcase */}
          <AchievementsShowcase
            achievements={achievements}
            allAchievements={ACHIEVEMENTS}
            stats={stats}
            compact={false}
          />

          {/* Fun fact */}
          <div className="glass rounded-2xl p-6 mt-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="h-6 w-6 text-primary-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Keep Going!</h3>
                <p className="text-gray-400 text-sm">
                  Achievements unlock automatically as you use AnimeSenpai. Keep watching anime, 
                  rating shows, and connecting with other fans to earn more badges!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
