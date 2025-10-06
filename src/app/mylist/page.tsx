'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MyListAnimeCard } from '../../components/anime/MyListAnimeCard'
import { Button } from '../../components/ui/button'
import { Anime } from '../../types/anime'
import { useAuth } from '../lib/auth-context'
import { Bookmark, Heart, Filter, SortAsc, Grid, List, Clock, Star, CheckCircle, Play, Plus, Lock } from 'lucide-react'

// Sample my list data with different statuses
const myListAnime: (Anime & { listStatus: 'favorite' | 'watching' | 'completed' | 'plan-to-watch' })[] = [
  {
    id: '1',
    slug: 'attack-on-titan',
    title: 'Attack on Titan',
    year: 2023,
    rating: 9.2,
    status: 'new',
    tags: ['action', 'drama', 'supernatural'],
    episodes: 25,
    duration: 24,
    studio: 'Wit Studio',
    listStatus: 'favorite'
  },
  {
    id: '2',
    slug: 'demon-slayer',
    title: 'Demon Slayer',
    year: 2023,
    rating: 9.1,
    status: 'trending',
    tags: ['action', 'supernatural', 'shounen'],
    episodes: 26,
    duration: 23,
    studio: 'Ufotable',
    listStatus: 'watching'
  },
  {
    id: '4',
    slug: 'fullmetal-alchemist',
    title: 'Fullmetal Alchemist',
    year: 2009,
    rating: 9.3,
    status: 'classic',
    tags: ['action', 'fantasy', 'drama'],
    episodes: 64,
    duration: 24,
    studio: 'Bones',
    listStatus: 'completed'
  },
  {
    id: '5',
    slug: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    year: 2023,
    rating: 8.9,
    status: 'trending',
    tags: ['action', 'supernatural', 'school'],
    episodes: 24,
    duration: 24,
    studio: 'MAPPA',
    listStatus: 'watching'
  },
  {
    id: '7',
    slug: 'chainsaw-man',
    title: 'Chainsaw Man',
    year: 2022,
    rating: 8.8,
    status: 'trending',
    tags: ['action', 'supernatural', 'seinen'],
    episodes: 12,
    duration: 24,
    studio: 'MAPPA',
    listStatus: 'plan-to-watch'
  },
  {
    id: '8',
    slug: 'spy-x-family',
    title: 'Spy x Family',
    year: 2022,
    rating: 8.7,
    status: 'trending',
    tags: ['comedy', 'action', 'family'],
    episodes: 25,
    duration: 24,
    studio: 'Wit Studio',
    listStatus: 'completed'
  },
  {
    id: '9',
    slug: 'mob-psycho-100',
    title: 'Mob Psycho 100',
    year: 2022,
    rating: 8.9,
    status: 'trending',
    tags: ['action', 'supernatural', 'comedy'],
    episodes: 12,
    duration: 24,
    studio: 'Bones',
    listStatus: 'favorite'
  },
  {
    id: '10',
    slug: 'vinland-saga',
    title: 'Vinland Saga',
    year: 2022,
    rating: 9.0,
    status: 'trending',
    tags: ['action', 'historical', 'drama'],
    episodes: 24,
    duration: 24,
    studio: 'Wit Studio',
    listStatus: 'plan-to-watch'
  }
]

export default function MyListPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const favorites = myListAnime.filter(anime => anime.listStatus === 'favorite')
  const watching = myListAnime.filter(anime => anime.listStatus === 'watching')
  const completed = myListAnime.filter(anime => anime.listStatus === 'completed')
  const planToWatch = myListAnime.filter(anime => anime.listStatus === 'plan-to-watch')

  // Filter anime based on selected category
  const getFilteredAnime = () => {
    switch (selectedCategory) {
      case 'favorites':
        return favorites
      case 'watching':
        return watching
      case 'completed':
        return completed
      case 'plan-to-watch':
        return planToWatch
      default:
        return myListAnime
    }
  }

  const filteredAnime = getFilteredAnime()

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">AS</span>
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show sign-in prompt for guests
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <main className="container pt-32 pb-20 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="h-10 w-10 text-cyan-400" />
              </div>
              
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-200 to-pink-200 bg-clip-text text-transparent">
                Sign In to View Your List
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Create an account or sign in to track your favorite anime, manage your watchlist, and never miss an episode.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/auth/signin">
                  <Button className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-semibold px-8 py-6 text-lg rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg shadow-cyan-500/25">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button 
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg rounded-xl"
                  >
                    Create Account
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
                <div className="text-center">
                  <Bookmark className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Track Favorites</p>
                </div>
                <div className="text-center">
                  <Star className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Rate Anime</p>
                </div>
                <div className="text-center">
                  <Clock className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Track Progress</p>
                </div>
              </div>
            </div>
          </div>
        </main>
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

      <main className="container pt-32 pb-20 relative z-10">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white via-cyan-200 to-pink-200 bg-clip-text text-transparent">
                My List
              </h1>
              <p className="text-xl text-gray-300">
                {myListAnime.length} anime in your collection
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{favorites.length}</div>
                <div className="text-sm text-gray-400">Favorites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{watching.length}</div>
                <div className="text-sm text-gray-400">Watching</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{completed.length}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </div>
            </div>
          </div>
          
          {/* Mobile Stats */}
          <div className="md:hidden flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
              <span className="text-sm text-gray-300">{favorites.length} Favorites</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
              <span className="text-sm text-gray-300">{watching.length} Watching</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-300">{completed.length} Completed</span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className={`whitespace-nowrap transition-all duration-200 ${
                selectedCategory === 'all' 
                  ? 'bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 shadow-lg shadow-cyan-500/25' 
                  : 'border-white/20 text-white hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              All ({myListAnime.length})
            </Button>
            <Button
              variant={selectedCategory === 'favorites' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('favorites')}
              className={`whitespace-nowrap transition-all duration-200 ${
                selectedCategory === 'favorites' 
                  ? 'bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-500/25' 
                  : 'border-white/20 text-white hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <Heart className="h-4 w-4 mr-2" />
              Favorites ({favorites.length})
            </Button>
            <Button
              variant={selectedCategory === 'watching' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('watching')}
              className={`whitespace-nowrap transition-all duration-200 ${
                selectedCategory === 'watching' 
                  ? 'bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/25' 
                  : 'border-white/20 text-white hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <Play className="h-4 w-4 mr-2" />
              Watching ({watching.length})
            </Button>
            <Button
              variant={selectedCategory === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('completed')}
              className={`whitespace-nowrap transition-all duration-200 ${
                selectedCategory === 'completed' 
                  ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/25' 
                  : 'border-white/20 text-white hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed ({completed.length})
            </Button>
            <Button
              variant={selectedCategory === 'plan-to-watch' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('plan-to-watch')}
              className={`whitespace-nowrap transition-all duration-200 ${
                selectedCategory === 'plan-to-watch' 
                  ? 'bg-purple-500 hover:bg-purple-600 shadow-lg shadow-purple-500/25' 
                  : 'border-white/20 text-white hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <Star className="h-4 w-4 mr-2" />
              Plan to Watch ({planToWatch.length})
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200">
              <SortAsc className="h-4 w-4 mr-2" />
              Sort
            </Button>
          </div>
          <div className="flex items-center gap-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-1">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm" 
              onClick={() => setViewMode('grid')}
              className={`transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 shadow-lg shadow-cyan-500/25' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm" 
              onClick={() => setViewMode('list')}
              className={`transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 shadow-lg shadow-cyan-500/25' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Anime Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAnime.map((anime) => (
              <MyListAnimeCard
                key={anime.id}
                anime={anime}
                variant="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnime.map((anime) => (
              <MyListAnimeCard
                key={anime.id}
                anime={anime}
                variant="list"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredAnime.length === 0 && (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Bookmark className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {selectedCategory === 'all' 
                ? 'Your list is empty' 
                : `No ${selectedCategory.replace('-', ' ')} anime found`
              }
            </h3>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto text-lg">
              {selectedCategory === 'all' 
                ? 'Start building your anime collection by adding shows you love or want to watch'
                : `Try selecting a different category or add some anime to your ${selectedCategory.replace('-', ' ')} list`
              }
            </p>
            <Button className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 shadow-lg shadow-cyan-500/25 px-8 py-3 text-lg font-semibold">
              <Plus className="h-5 w-5 mr-2" />
              Discover Anime
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
