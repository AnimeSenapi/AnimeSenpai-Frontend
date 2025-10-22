'use client'

import { useState, useEffect } from 'react'
import { AnimeCard } from '@/components/anime/AnimeCard'
import { Button } from '@/components/ui/button'
import { GridSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/error-state'
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, Star, Filter } from 'lucide-react'
import { api } from '../lib/api'
import type { Anime } from '@/types/anime'

const SEASONS = ['winter', 'spring', 'summer', 'fall']
const SEASON_NAMES = {
  winter: 'Winter',
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall',
}

const SEASON_COLORS = {
  winter: 'from-blue-400 to-cyan-400',
  spring: 'from-green-400 to-emerald-400',
  summer: 'from-orange-400 to-red-400',
  fall: 'from-amber-400 to-orange-400',
}

const SEASON_EMOJIS = {
  winter: '❄️',
  spring: '🌸',
  summer: '☀️',
  fall: '🍂',
}

export default function SeasonalPage() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const getCurrentSeason = () => {
    if (currentMonth < 3) return 'winter'
    if (currentMonth < 6) return 'spring'
    if (currentMonth < 9) return 'summer'
    return 'fall'
  }

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedSeason, setSelectedSeason] =
    useState<keyof typeof SEASON_NAMES>(getCurrentSeason())
  const [anime, setAnime] = useState<Anime[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'title'>('popularity')

  useEffect(() => {
    loadSeasonalAnime()
  }, [selectedYear, selectedSeason, sortBy])

  const loadSeasonalAnime = async () => {
    setIsLoading(true)
    try {
      const data = (await api.trpcQuery('anime.getAll', {
        page: 1,
        limit: 100,
        seasons: [selectedSeason],
        years: [selectedYear],
        sortBy:
          sortBy === 'rating' ? 'averageRating' : sortBy === 'popularity' ? 'popularity' : 'title',
        sortOrder: sortBy === 'title' ? 'asc' : 'desc',
      })) as any

      setAnime(data?.anime || [])
    } catch (error) {
      console.error('Failed to load seasonal anime:', error)
      setAnime([])
    } finally {
      setIsLoading(false)
    }
  }

  const navigateYear = (direction: 'prev' | 'next') => {
    setSelectedYear((prev) => (direction === 'next' ? prev + 1 : prev - 1))
  }

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i + 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <main className="container mx-auto px-3 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-32 pb-8 sm:pb-16 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${SEASON_COLORS[selectedSeason]} rounded-2xl flex items-center justify-center shadow-lg text-2xl sm:text-3xl`}
            >
              {SEASON_EMOJIS[selectedSeason]}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                {SEASON_NAMES[selectedSeason]} {selectedYear}
              </h1>
              <p className="text-sm sm:text-base text-gray-400 mt-1">
                {anime.length} anime this season
              </p>
            </div>
          </div>
        </div>

        {/* Year & Season Selector */}
        <div className="mb-8 space-y-4">
          {/* Year Selector */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigateYear('prev')}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
              disabled={selectedYear <= 1980}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                      selectedYear === year
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => navigateYear('next')}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
              disabled={selectedYear >= currentYear + 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Season Selector */}
          <div className="flex flex-wrap gap-2">
            {SEASONS.map((season) => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season as keyof typeof SEASON_NAMES)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all touch-manipulation ${
                  selectedSeason === season
                    ? `bg-gradient-to-r ${SEASON_COLORS[season as keyof typeof SEASON_COLORS]} text-white shadow-lg`
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <span className="text-xl">
                  {SEASON_EMOJIS[season as keyof typeof SEASON_EMOJIS]}
                </span>
                {SEASON_NAMES[season as keyof typeof SEASON_NAMES]}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            {[
              { id: 'popularity', label: 'Popular', icon: TrendingUp },
              { id: 'rating', label: 'Top Rated', icon: Star },
              { id: 'title', label: 'A-Z', icon: Filter },
            ].map((sort) => {
              const Icon = sort.icon
              return (
                <button
                  key={sort.id}
                  onClick={() => setSortBy(sort.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortBy === sort.id
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{sort.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Anime Grid */}
        {isLoading ? (
          <GridSkeleton items={24} columns={6} />
        ) : anime.length === 0 ? (
          <EmptyState
            variant="default"
            icon={<Calendar className="w-12 h-12 text-gray-500" />}
            title={`No anime found for ${SEASON_NAMES[selectedSeason]} ${selectedYear}`}
            message="Try selecting a different season or year."
          />
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
      </main>
    </div>
  )
}
