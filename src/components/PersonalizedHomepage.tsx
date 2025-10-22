'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Clock, Heart, Star, Calendar, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { AnimeCard } from './anime/AnimeCard'
import { Anime } from '../types/anime'
import { apiGetTrending, apiGetUserList } from '../app/lib/api'

interface PersonalizedHomepageProps {
  userId?: string
}

/**
 * Personalized Homepage
 * Dynamic content based on user activity and preferences
 */
export function PersonalizedHomepage({ userId }: PersonalizedHomepageProps) {
  const [continueWatching, setContinueWatching] = useState<Anime[]>([])
  const [recommendations, setRecommendations] = useState<Anime[]>([])
  const [trending, setTrending] = useState<Anime[]>([])
  const [_newReleases, setNewReleases] = useState<Anime[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPersonalizedContent()
  }, [userId])

  const loadPersonalizedContent = async () => {
    setIsLoading(true)
    try {
      // Load multiple data sources in parallel
      const [userList, recommendationsData, trendingData] = await Promise.all([
        apiGetUserList().catch(() => ({ items: [] })),
        Promise.resolve([]),
        apiGetTrending().catch(() => []),
      ])

      // Extract continue watching (currently watching anime)
      const watching =
        (userList as any).items
          ?.filter((item: any) => item.listStatus === 'watching')
          .map((item: any) => item.anime)
          .slice(0, 6) || []

      setContinueWatching(watching)
      setRecommendations((recommendationsData as any).slice(0, 6) || [])
      setTrending((trendingData as any).slice(0, 6) || [])

      // New releases (placeholder - would need airing schedule)
      setNewReleases([])
    } catch (error) {
      console.error('Failed to load personalized content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 w-48 bg-white/5 rounded mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <div key={j} className="h-64 bg-white/5 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary-400" />
              <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
            </div>
            <Link
              href="/mylist?filter=watching"
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {continueWatching.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </section>
      )}

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-secondary-400" />
              <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
            </div>
            <Link
              href="/discover"
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
            >
              More Recommendations
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendations.map((anime) => (
              <div key={anime.id} className="relative group">
                <AnimeCard anime={anime} />
                {/* Recommendation reason badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-1 bg-secondary-500/90 text-white text-[10px] font-semibold rounded-full backdrop-blur-sm">
                    For You
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Now */}
      {trending.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Trending Now</h2>
            </div>
            <Link
              href="/discover?tab=trending"
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
            >
              See What's Hot
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trending.map((anime, index) => (
              <div key={anime.id} className="relative group">
                <AnimeCard anime={anime} />
                {/* Trending rank badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-1 bg-green-500/90 text-white text-[10px] font-bold rounded-full backdrop-blur-sm">
                    #{index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Favorites Quick Access */}
      <section>
        <Link
          href="/mylist?filter=favorites"
          className="block p-6 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-400/20 rounded-xl hover:border-primary-400/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-primary-400 fill-current" />
              <div>
                <h3 className="text-lg font-semibold text-white">Your Favorites</h3>
                <p className="text-sm text-gray-400">View your favorite anime collection</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
          </div>
        </Link>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Watching"
          value={continueWatching.length}
          href="/mylist?filter=watching"
          color="green"
        />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="Completed"
          value="0"
          href="/mylist?filter=completed"
          color="blue"
        />
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Plan to Watch"
          value="0"
          href="/mylist?filter=plan-to-watch"
          color="yellow"
        />
        <StatCard
          icon={<Heart className="h-5 w-5" />}
          label="Favorites"
          value="0"
          href="/mylist?filter=favorites"
          color="red"
        />
      </section>
    </div>
  )
}

/**
 * Stat Card Component
 */
interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  href: string
  color: 'green' | 'blue' | 'yellow' | 'red'
}

function StatCard({ icon, label, value, href, color }: StatCardProps) {
  const colors = {
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400',
  }

  return (
    <Link
      href={href}
      className={`p-4 bg-gradient-to-br ${colors[color]} border rounded-lg hover:scale-105 transition-all group`}
    >
      <div className="flex items-center gap-3">
        <div className={`${colors[color].split(' ')[3]}`}>{icon}</div>
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-xs text-gray-400">{label}</div>
        </div>
      </div>
    </Link>
  )
}
