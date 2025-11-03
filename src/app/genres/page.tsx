'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tag,
  TrendingUp,
  Search,
  Sparkles,
  Heart,
  Sword,
  Ghost,
  Laugh,
  Drama,
  Mountain,
  Users,
  Baby,
  Briefcase,
  School,
  Star,
} from 'lucide-react'
import { api } from '../lib/api'

interface Genre {
  name: string
  slug: string
  count: number
  avgRating?: number
}

const GENRE_ICONS: Record<string, any> = {
  action: Sword,
  adventure: Mountain,
  comedy: Laugh,
  drama: Drama,
  fantasy: Sparkles,
  horror: Ghost,
  mystery: Search,
  romance: Heart,
  'sci-fi': TrendingUp,
  'slice of life': Users,
  sports: TrendingUp,
  supernatural: Ghost,
  thriller: Drama,
  kids: Baby,
  seinen: Briefcase,
  shounen: School,
  shoujo: Heart,
  josei: Users,
}

const GENRE_COLORS: Record<string, string> = {
  action: 'from-red-500 to-orange-500',
  adventure: 'from-green-500 to-emerald-500',
  comedy: 'from-yellow-500 to-amber-500',
  drama: 'from-purple-500 to-pink-500',
  fantasy: 'from-indigo-500 to-purple-500',
  horror: 'from-gray-700 to-gray-900',
  mystery: 'from-blue-500 to-indigo-500',
  romance: 'from-pink-500 to-rose-500',
  'sci-fi': 'from-cyan-500 to-blue-500',
  'slice of life': 'from-teal-500 to-green-500',
  sports: 'from-orange-500 to-red-500',
  supernatural: 'from-violet-500 to-purple-500',
  thriller: 'from-red-600 to-gray-800',
}

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'alphabetical' | 'popular' | 'rating'>('popular')

  useEffect(() => {
    loadGenres()
  }, [])

  const loadGenres = async () => {
    setIsLoading(true)
    try {
      const data = (await api.trpcQuery('anime.getAll', {
        page: 1,
        limit: 1000,
      })) as any

      const allAnime = data?.anime || []

      // Extract and count genres
      const genreMap = new Map<
        string,
        { count: number; totalRating: number; ratingCount: number }
      >()

      allAnime.forEach((anime: any) => {
        anime.genres?.forEach((g: any) => {
          const name = g.name || g.slug || g
          const slug = g.slug || name.toLowerCase().replace(/\s+/g, '-')

          if (!genreMap.has(slug)) {
            genreMap.set(slug, { count: 0, totalRating: 0, ratingCount: 0 })
          }

          const stats = genreMap.get(slug)!
          stats.count++

          if (anime.averageRating) {
            stats.totalRating += anime.averageRating
            stats.ratingCount++
          }
        })
      })

      const genreList: Genre[] = Array.from(genreMap.entries()).map(([slug, stats]) => ({
        name: slug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
        slug,
        count: stats.count,
        avgRating: stats.ratingCount > 0 ? stats.totalRating / stats.ratingCount : undefined,
      }))

      setGenres(genreList)
    } catch (error) {
      console.error('Failed to load genres:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredGenres = genres
    .filter((genre) => !searchQuery || genre.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.name.localeCompare(b.name)
        case 'popular':
          return b.count - a.count
        case 'rating':
          return (b.avgRating || 0) - (a.avgRating || 0)
        default:
          return 0
      }
    })

  const getIcon = (genreSlug: string) => {
    const Icon = GENRE_ICONS[genreSlug] || Tag
    return Icon
  }

  const getGradient = (genreSlug: string) => {
    return GENRE_COLORS[genreSlug] || 'from-gray-500 to-gray-600'
  }

  return (
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
              <Tag className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Explore Genres
              </h1>
              <p className="text-sm sm:text-base text-gray-400 mt-1">
                Discover anime by your favorite genres
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-primary-400/50"
            />
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            {[
              { id: 'popular', label: 'Popular' },
              { id: 'rating', label: 'Top Rated' },
              { id: 'alphabetical', label: 'A-Z' },
            ].map((sort) => (
              <button
                key={sort.id}
                onClick={() => setSortBy(sort.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === sort.id
                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{genres.length}</div>
            <div className="text-sm text-gray-400">Total Genres</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{filteredGenres.length}</div>
            <div className="text-sm text-gray-400">Showing</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-white">
              {genres.reduce((sum, g) => sum + g.count, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Anime</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-white">
              {genres.length > 0
                ? (genres.reduce((sum, g) => sum + (g.avgRating || 0), 0) / genres.length).toFixed(
                    1
                  )
                : '0'}
            </div>
            <div className="text-sm text-gray-400">Avg Rating</div>
          </div>
        </div>

        {/* Genre Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-6">
                <Skeleton className="w-12 h-12 rounded-xl mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredGenres.map((genre, index) => {
              const Icon = getIcon(genre.slug)
              const gradient = getGradient(genre.slug)

              return (
                <Link
                  key={genre.slug}
                  href={`/search?genres=${encodeURIComponent(genre.name)}`}
                  style={{
                    animation: `fadeIn 0.3s ease-out ${index * 0.02}s backwards`,
                  }}
                >
                  <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all group cursor-pointer border border-white/10 hover:border-primary-400/30 h-full">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-300 transition-colors">
                      {genre.name}
                    </h3>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{genre.count} anime</span>
                      {genre.avgRating && (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="font-medium">{genre.avgRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
