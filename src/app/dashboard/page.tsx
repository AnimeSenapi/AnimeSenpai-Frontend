'use client'

import { useState, useEffect } from 'react'
import { AnimeCard } from '../../components/anime/AnimeCard'
import { Button } from '../../components/ui/button'
import { Sparkles, TrendingUp } from 'lucide-react'
import { apiGetAllAnime, apiGetTrending } from '../lib/api'
import type { Anime } from '../../types/anime'

export default function DashboardPage() {
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([])
  const [allAnime, setAllAnime] = useState<Anime[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAnime = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [trending, all] = await Promise.all([
          apiGetTrending(),
          apiGetAllAnime()
        ])
        
        // Handle API response structure
        setTrendingAnime(Array.isArray(trending) ? trending : [])
        
        // getAll returns { anime: [], total: number }
        if (all && typeof all === 'object' && 'anime' in all) {
          setAllAnime(Array.isArray(all.anime) ? all.anime : [])
        } else if (Array.isArray(all)) {
          setAllAnime(all)
        } else {
          setAllAnime([])
        }
      } catch (err: unknown) {
        console.error('Failed to load anime:', err)
        setError(err instanceof Error ? err.message : 'Failed to load anime')
      } finally {
        setIsLoading(false)
      }
    }
    loadAnime()
  }, [])

  if (isLoading) {
    return null // Loading skeleton will show
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="container py-20 relative z-10">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Discover Your Next Obsession</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-200 to-pink-200 bg-clip-text text-transparent">
            Discover Amazing Anime
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Personalized recommendations powered by AI to find your perfect anime match
          </p>
        </div>

        {/* Trending Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-pink-500/20">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Trending Now</h2>
            </div>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              View All Trending
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {trendingAnime.length > 0 ? (
              trendingAnime.slice(0, 10).map((anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  variant="featured"
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-400">
                <p>No trending anime found. Add some anime to the database!</p>
              </div>
            )}
          </div>
        </div>

        {/* Popular Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-pink-500/20">
                <Sparkles className="h-5 w-5 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Popular Anime</h2>
            </div>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {allAnime.length > 0 ? (
              allAnime.slice(0, 10).map((anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  variant="featured"
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-400">
                <p>No anime found. Add some anime to the database!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommendation Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recently Added */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recently Added</h3>
            <div className="space-y-4">
              {allAnime.slice(0, 3).map((anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  variant="list"
                />
              ))}
              {allAnime.length === 0 && (
                <p className="text-center py-4 text-gray-500 text-sm">No anime yet</p>
              )}
            </div>
          </div>

          {/* Top Rated */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Top Rated</h3>
            <div className="space-y-4">
              {trendingAnime.slice(0, 3).map((anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  variant="list"
                />
              ))}
              {trendingAnime.length === 0 && (
                <p className="text-center py-4 text-gray-500 text-sm">No trending anime yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
