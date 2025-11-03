'use client'

import { useState, useEffect } from 'react'
import { AnimeCard } from '@/components/anime/AnimeCard'
import { Badge } from '@/components/ui/badge'
import { GridSkeleton } from '@/components/ui/skeleton'
import { Crown, Trophy, Award, Medal } from 'lucide-react'
import { api } from '../lib/api'
import type { Anime } from '@/types/anime'

const RATING_TIERS = [
  {
    id: 'masterpiece',
    name: 'Masterpieces',
    description: 'The absolute best (9.0+)',
    icon: Crown,
    gradient: 'from-yellow-400 to-amber-500',
    minRating: 9.0,
    emoji: '👑',
  },
  {
    id: 'excellent',
    name: 'Excellent',
    description: 'Outstanding shows (8.5 - 9.0)',
    icon: Trophy,
    gradient: 'from-orange-400 to-red-500',
    minRating: 8.5,
    maxRating: 9.0,
    emoji: '🏆',
  },
  {
    id: 'great',
    name: 'Great',
    description: 'Highly recommended (8.0 - 8.5)',
    icon: Award,
    gradient: 'from-purple-400 to-pink-500',
    minRating: 8.0,
    maxRating: 8.5,
    emoji: '🎖️',
  },
  {
    id: 'good',
    name: 'Good',
    description: 'Worth watching (7.5 - 8.0)',
    icon: Medal,
    gradient: 'from-blue-400 to-cyan-500',
    minRating: 7.5,
    maxRating: 8.0,
    emoji: '🥇',
  },
]

export default function TopRatedPage() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [animeByTier, setAnimeByTier] = useState<Record<string, Anime[]>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTopRated()
  }, [])

  const loadTopRated = async () => {
    setIsLoading(true)

    try {
      const tierData: Record<string, Anime[]> = {}

      // Load anime for each tier
      await Promise.all(
        RATING_TIERS.map(async (tier) => {
          const data = (await api.trpcQuery('anime.getAll', {
            page: 1,
            limit: 50,
            minRating: tier.minRating,
            maxRating: tier.maxRating,
            sortBy: 'averageRating',
            sortOrder: 'desc',
          })) as any

          tierData[tier.id] = data?.anime || []
        })
      )

      setAnimeByTier(tierData)
    } catch (error) {
      console.error('Failed to load top rated anime:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const displayedTiers = selectedTier
    ? RATING_TIERS.filter((t) => t.id === selectedTier)
    : RATING_TIERS

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <main className="container mx-auto px-3 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-8 sm:pb-16 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Top Rated Anime
              </h1>
              <p className="text-sm sm:text-base text-gray-400 mt-1">
                The highest rated anime across all categories
              </p>
            </div>
          </div>
        </div>

        {/* Tier Filter */}
        <div className="mb-8 overflow-x-auto scrollbar-hide -mx-3 px-3">
          <div className="flex gap-2 min-w-max pb-2">
            <button
              onClick={() => setSelectedTier(null)}
              className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                selectedTier === null
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              All Tiers
            </button>
            {RATING_TIERS.map((tier) => {
              return (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    selectedTier === tier.id
                      ? `bg-gradient-to-r ${tier.gradient} text-white shadow-lg`
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  <span>{tier.emoji}</span>
                  {tier.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tier Sections */}
        {isLoading ? (
          <GridSkeleton items={24} columns={6} />
        ) : (
          <div className="space-y-12">
            {displayedTiers.map((tier) => {
              const anime = animeByTier[tier.id] || []
              const Icon = tier.icon

              return (
                <div key={tier.id} className="space-y-4">
                  {/* Tier Header */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 bg-gradient-to-r ${tier.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        {tier.emoji} {tier.name}
                      </h2>
                      <p className="text-sm text-gray-400">{tier.description}</p>
                    </div>
                    <Badge className="ml-auto bg-white/10 text-white border-white/20">
                      {anime.length} anime
                    </Badge>
                  </div>

                  {/* Anime Grid */}
                  {anime.length === 0 ? (
                    <div className="glass rounded-xl p-8 text-center">
                      <Icon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">No anime found for this tier</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {anime.map((item, index) => (
                        <div
                          key={item.id}
                          style={{
                            animation: `fadeIn 0.3s ease-out ${index * 0.02}s backwards`,
                          }}
                        >
                          <AnimeCard anime={item} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
