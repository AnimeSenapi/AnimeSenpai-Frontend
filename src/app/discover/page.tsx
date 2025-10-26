'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnimeCard } from '@/components/anime/AnimeCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CarouselSkeleton } from '@/components/ui/skeleton'
import {
  Sparkles,
  TrendingUp,
  Gem,
  Calendar,
  Star,
  Compass,
  Flame,
  Award,
  Crown,
  Target,
  Filter,
  ArrowRight,
} from 'lucide-react'
import { api } from '../lib/api'
import type { Anime } from '@/types/anime'

interface DiscoverySection {
  id: string
  title: string
  description: string
  icon: any
  gradient: string
  anime: Anime[]
  loading: boolean
}

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'seasonal' | 'top' | 'hidden'>(
    'all'
  )
  const [_isLoading, setIsLoading] = useState(true)

  // Discovery sections
  const [sections, setSections] = useState<DiscoverySection[]>([
    {
      id: 'trending',
      title: 'Trending Now',
      description: 'What everyone is watching right now',
      icon: TrendingUp,
      gradient: 'from-orange-500 to-red-500',
      anime: [],
      loading: true,
    },
    {
      id: 'seasonal',
      title: 'This Season',
      description: 'Currently airing anime',
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-500',
      anime: [],
      loading: true,
    },
    {
      id: 'hidden-gems',
      title: 'Hidden Gems',
      description: 'Underrated shows you might love',
      icon: Gem,
      gradient: 'from-purple-500 to-pink-500',
      anime: [],
      loading: true,
    },
    {
      id: 'top-rated',
      title: 'Top Rated',
      description: 'Highest rated anime of all time',
      icon: Star,
      gradient: 'from-yellow-500 to-orange-500',
      anime: [],
      loading: true,
    },
    {
      id: 'popular',
      title: 'Most Popular',
      description: 'Fan favorites everyone loves',
      icon: Flame,
      gradient: 'from-red-500 to-pink-500',
      anime: [],
      loading: true,
    },
    {
      id: 'award-winners',
      title: 'Award Winners',
      description: 'Critically acclaimed anime',
      icon: Award,
      gradient: 'from-amber-500 to-yellow-500',
      anime: [],
      loading: true,
    },
  ])

  const [genres, setGenres] = useState<Array<{ name: string; count: number }>>([])
  const [seasons, setSeasons] = useState<Array<{ season: string; year: number; count: number }>>([])

  useEffect(() => {
    loadDiscoveryData()
  }, [])

  const loadDiscoveryData = async () => {
    setIsLoading(true)

    try {
      // Load all discovery sections in parallel
      const [trending, seasonal, hiddenGems, topRated, allAnime] = await Promise.all([
        loadTrending(),
        loadSeasonal(),
        loadHiddenGems(),
        loadTopRated(),
        loadAllAnime(),
      ])

      // Update sections with data
      setSections((prev) =>
        prev.map((section) => {
          switch (section.id) {
            case 'trending':
              return { ...section, anime: trending, loading: false }
            case 'seasonal':
              return { ...section, anime: seasonal, loading: false }
            case 'hidden-gems':
              return { ...section, anime: hiddenGems, loading: false }
            case 'top-rated':
              return { ...section, anime: topRated, loading: false }
            case 'popular':
              return { ...section, anime: trending, loading: false } // Use trending for now
            case 'award-winners':
              return { ...section, anime: topRated.slice(0, 12), loading: false }
            default:
              return section
          }
        })
      )

      // Extract genre statistics
      const genreMap = new Map<string, number>()
      allAnime.forEach((anime: any) => {
        anime.genres?.forEach((g: any) => {
          const name = g.name || g.slug || g
          genreMap.set(name, (genreMap.get(name) || 0) + 1)
        })
      })
      const topGenres = Array.from(genreMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)
      setGenres(topGenres)

      // Extract season statistics
      const seasonMap = new Map<string, number>()
      allAnime.forEach((anime: any) => {
        if (anime.season && anime.year) {
          const key = `${anime.season} ${anime.year}`
          seasonMap.set(key, (seasonMap.get(key) || 0) + 1)
        }
      })
      const topSeasons = Array.from(seasonMap.entries())
        .map(([key, count]) => {
          const [season, year] = key.split(' ')
          return { season: season || '', year: parseInt(year || '0'), count }
        })
        .sort((a, b) => b.year - a.year || b.count - a.count)
        .slice(0, 8)
      setSeasons(topSeasons)
    } catch (error) {
      console.error('Failed to load discovery data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTrending = async () => {
    try {
      const data = (await api.trpcQuery('anime.getTrending', { limit: 20 })) as any
      return Array.isArray(data) ? data : []
    } catch (error) {
      return []
    }
  }

  const loadSeasonal = async () => {
    try {
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth()
      const season =
        currentMonth < 3
          ? 'winter'
          : currentMonth < 6
            ? 'spring'
            : currentMonth < 9
              ? 'summer'
              : 'fall'

      const data = (await api.trpcQuery('anime.getAll', {
        page: 1,
        limit: 20,
        seasons: [season],
        years: [currentYear],
        sortBy: 'averageRating',
        sortOrder: 'desc',
      })) as any
      return data?.anime || []
    } catch (error) {
      return []
    }
  }

  const loadHiddenGems = async () => {
    try {
      // High rated but low popularity
      const data = (await api.trpcQuery('anime.getAll', {
        page: 1,
        limit: 20,
        minRating: 7.5,
        sortBy: 'averageRating',
        sortOrder: 'desc',
      })) as any
      return (data?.anime || []).filter((a: any) => (a.popularity || 0) < 1000)
    } catch (error) {
      return []
    }
  }

  const loadTopRated = async () => {
    try {
      const data = (await api.trpcQuery('anime.getAll', {
        page: 1,
        limit: 20,
        minRating: 8,
        sortBy: 'averageRating',
        sortOrder: 'desc',
      })) as any
      return data?.anime || []
    } catch (error) {
      return []
    }
  }

  const loadAllAnime = async () => {
    try {
      const data = (await api.trpcQuery('anime.getAll', {
        page: 1,
        limit: 1000,
      })) as any
      return data?.anime || []
    } catch (error) {
      return []
    }
  }

  const filteredSections =
    activeTab === 'all'
      ? sections
      : sections.filter((s) => {
          if (activeTab === 'trending') return s.id === 'trending' || s.id === 'popular'
          if (activeTab === 'seasonal') return s.id === 'seasonal'
          if (activeTab === 'top') return s.id === 'top-rated' || s.id === 'award-winners'
          if (activeTab === 'hidden') return s.id === 'hidden-gems'
          return true
        })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 xl:pt-32 pb-8 sm:pb-12 lg:pb-16 xl:pb-20 relative z-10">
        {/* Hero Header - Mobile Optimized */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Discover Anime
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-400 mt-1">
                Explore curated collections and find your next favorite show
              </p>
            </div>
          </div>
        </div>

        {/* Quick Filter Tabs - Mobile Optimized */}
        <div className="mb-6 sm:mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 sm:gap-2 min-w-max pb-2">
            {[
              { id: 'all', label: 'All Collections', icon: Sparkles },
              { id: 'trending', label: 'Trending', icon: TrendingUp },
              { id: 'seasonal', label: 'This Season', icon: Calendar },
              { id: 'top', label: 'Top Rated', icon: Crown },
              { id: 'hidden', label: 'Hidden Gems', icon: Gem },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-all whitespace-nowrap touch-manipulation text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Genre Pills - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 sm:mb-3 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Browse by Genre
          </h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {genres.slice(0, 12).map((genre) => (
              <Link key={genre.name} href={`/search?genres=${encodeURIComponent(genre.name)}`}>
                <Badge className="bg-white/5 hover:bg-white/10 text-white border-white/20 hover:border-primary-400/50 px-3 sm:px-4 py-1.5 sm:py-2 cursor-pointer transition-all text-xs sm:text-sm">
                  {genre.name}
                  <span className="ml-1.5 sm:ml-2 text-xs opacity-70">({genre.count})</span>
                </Badge>
              </Link>
            ))}
            <Link href="/search">
              <Badge className="bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 border-primary-500/30 px-3 sm:px-4 py-1.5 sm:py-2 cursor-pointer transition-all text-xs sm:text-sm">
                <span className="hidden sm:inline">View All Genres</span>
                <span className="sm:hidden">All Genres</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </Badge>
            </Link>
          </div>
        </div>

        {/* Season Pills - Mobile Optimized */}
        {seasons.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 sm:mb-3 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Browse by Season
            </h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {seasons.map((season) => (
                <Link
                  key={`${season.season}-${season.year}`}
                  href={`/search?seasons=${season.season}&years=${season.year}`}
                >
                  <Badge className="bg-white/5 hover:bg-white/10 text-white border-white/20 hover:border-secondary-400/50 px-3 sm:px-4 py-1.5 sm:py-2 cursor-pointer transition-all capitalize text-xs sm:text-sm">
                    {season.season} {season.year}
                    <span className="ml-1.5 sm:ml-2 text-xs opacity-70">({season.count})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Discovery Sections - Mobile Optimized */}
        <div className="space-y-8 sm:space-y-12">
          {filteredSections.map((section) => {
            const Icon = section.icon

            return (
              <div key={section.id} className="space-y-3 sm:space-y-4">
                {/* Section Header - Mobile Optimized */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${section.gradient} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">{section.title}</h2>
                      <p className="text-xs sm:text-sm text-gray-400">{section.description}</p>
                    </div>
                  </div>
                  <Link href={`/search?sort=${getSortForSection(section.id)}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex border-white/20 text-white hover:bg-white/10 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                    >
                      View All
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* Anime Grid - Mobile Optimized */}
                {section.loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    <CarouselSkeleton itemCount={6} />
                  </div>
                ) : section.anime.length === 0 ? (
                  <div className="glass rounded-lg sm:rounded-xl p-8 sm:p-12 text-center">
                    <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-2 sm:mb-3" />
                    <p className="text-gray-400 text-sm sm:text-base">No anime found for this category yet.</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Horizontal Scroll Container - Mobile Optimized */}
                    <div className="overflow-x-auto scrollbar-hide -mx-2 sm:-mx-3 px-2 sm:px-3 pb-2">
                      <div className="flex gap-3 sm:gap-4 min-w-max">
                        {section.anime.slice(0, 12).map((anime, index) => (
                          <div
                            key={anime.id}
                            className="w-[140px] sm:w-[150px] lg:w-[180px] flex-shrink-0"
                            style={{
                              animation: `fadeIn 0.3s ease-out ${index * 0.05}s backwards`,
                            }}
                          >
                            <AnimeCard anime={anime} />
                          </div>
                        ))}

                        {/* View More Card - Mobile Optimized */}
                        <Link href={`/search?sort=${getSortForSection(section.id)}`}>
                          <div className="w-[140px] sm:w-[150px] lg:w-[180px] h-full min-h-[200px] sm:min-h-[250px] glass rounded-lg sm:rounded-xl border-2 border-dashed border-white/20 hover:border-primary-400/50 flex items-center justify-center cursor-pointer transition-all group">
                            <div className="text-center p-4 sm:p-6">
                              <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-primary-400 mx-auto mb-1.5 sm:mb-2 transition-colors" />
                              <p className="text-xs sm:text-sm text-gray-400 group-hover:text-white transition-colors">
                                View All
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Link href="/search?sort=year_desc">
            <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all cursor-pointer group border border-white/10 hover:border-primary-400/30">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Latest Releases</h3>
              <p className="text-xs sm:text-sm text-gray-400">Explore the newest anime releases</p>
            </div>
          </Link>

          <Link href="/search?minRating=8">
            <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all cursor-pointer group border border-white/10 hover:border-secondary-400/30">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Highly Rated</h3>
              <p className="text-xs sm:text-sm text-gray-400">Only the best anime (8.0+ rating)</p>
            </div>
          </Link>

          <Link href="/search">
            <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all cursor-pointer group border border-white/10 hover:border-purple-400/30 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Advanced Search</h3>
              <p className="text-xs sm:text-sm text-gray-400">Find exactly what you're looking for</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}

function getSortForSection(sectionId: string): string {
  switch (sectionId) {
    case 'trending':
      return 'popularity_desc'
    case 'seasonal':
      return 'year_desc'
    case 'hidden-gems':
      return 'rating_desc'
    case 'top-rated':
      return 'rating_desc'
    case 'popular':
      return 'popularity_desc'
    case 'award-winners':
      return 'rating_desc'
    default:
      return 'relevance'
  }
}
