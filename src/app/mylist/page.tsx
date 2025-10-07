'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MyListAnimeCard } from '../../components/anime/MyListAnimeCard'
import { Button } from '../../components/ui/button'
import { Anime, AnimeListItem, UserListResponse } from '../../types/anime'
import { useAuth } from '../lib/auth-context'
import { apiGetUserList } from '../lib/api'
import { Bookmark, Heart, Filter, SortAsc, Grid, List, Clock, Star, CheckCircle, Play, Plus, Lock } from 'lucide-react'

// Legacy sample data - will be replaced with API data
const myListAnimeFallback: (Anime & { listStatus: 'favorite' | 'watching' | 'completed' | 'plan-to-watch' })[] = [
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
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [userList, setUserList] = useState<UserListResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's anime list from backend
  useEffect(() => {
    const fetchUserList = async () => {
      if (!isAuthenticated) return

      setIsLoading(true)
      setError(null)
      try {
        const data = await apiGetUserList()
        setUserList(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load your list'
        
        // If backend doesn't have mylist endpoints yet, show fallback data
        if (errorMessage.includes('NOT_FOUND') || errorMessage.includes('404')) {
          console.log('ℹ️ MyList backend not available yet - using fallback data')
          setError(null)
          // Use fallback data
          setUserList({
            items: [],
            total: 0,
            stats: { watching: 0, completed: 0, planToWatch: 0, onHold: 0, dropped: 0, favorites: 0 }
          })
        } else {
          setError(errorMessage)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserList()
  }, [isAuthenticated])

  // Convert AnimeListItem to display format
  const myListAnime = userList?.items.map(item => ({
    ...item.anime!,
    listStatus: item.isFavorite ? 'favorite' as const : 
                item.status === 'plan-to-watch' ? 'plan-to-watch' as const :
                item.status as 'watching' | 'completed'
  })) || myListAnimeFallback

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
  
  // Use stats from backend if available
  const stats = userList?.stats || {
    favorites: favorites.length,
    watching: watching.length,
    completed: completed.length,
    planToWatch: planToWatch.length,
    onHold: 0,
    dropped: 0
  }

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">AS</span>
          </div>
          <p className="text-gray-400">Loading your list...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Unable to Load Your List</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary-500 hover:bg-primary-600"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Show sign-in prompt for guests
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <main className="container pt-32 pb-20 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="glass rounded-3xl p-12">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="h-10 w-10 text-primary-400" />
              </div>
              
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Sign In to View Your List
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Create an account or sign in to track your favorite anime, manage your watchlist, and never miss an episode.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/auth/signin">
                  <Button className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold px-8 py-6 text-lg rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg shadow-brand-primary-500/25">
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
                  <Bookmark className="h-8 w-8 text-primary-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Track Favorites</p>
                </div>
                <div className="text-center">
                  <Star className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Rate Anime</p>
                </div>
                <div className="text-center">
                  <Clock className="h-8 w-8 text-planning-400 mx-auto mb-2" />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="container pt-32 pb-20 relative z-10">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white via-primary-400 to-secondary-400 bg-clip-text text-transparent">
                My List
              </h1>
              <p className="text-xl text-gray-300">
                {myListAnime.length} anime in your collection
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.favorites}</div>
                <div className="text-sm text-gray-400">Favorites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.watching}</div>
                <div className="text-sm text-gray-400">Watching</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.completed}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </div>
            </div>
          </div>
          
          {/* Mobile Stats */}
          <div className="md:hidden flex items-center justify-between glass rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary-400 rounded-full"></div>
              <span className="text-sm text-gray-300">{stats.favorites} Favorites</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-400 rounded-full"></div>
              <span className="text-sm text-gray-300">{stats.watching} Watching</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success-400 rounded-full"></div>
              <span className="text-sm text-gray-300">{stats.completed} Completed</span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="glass rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className={`whitespace-nowrap transition-all duration-200 ${
                selectedCategory === 'all' 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 shadow-lg shadow-brand-primary-500/25' 
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
                  ? 'bg-secondary-500 hover:bg-secondary-600 shadow-lg shadow-brand-secondary-500/25' 
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
                  ? 'bg-primary-500 hover:bg-primary-600 shadow-lg shadow-brand-primary-500/25' 
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
                  ? 'bg-success-500 hover:bg-success-600 shadow-lg shadow-success-500/25' 
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
                  ? 'bg-planning-500 hover:bg-planning-600 shadow-lg shadow-planning-500/25' 
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
          <div className="flex items-center gap-1 glass rounded-xl p-1">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm" 
              onClick={() => setViewMode('grid')}
              className={`transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 shadow-lg shadow-brand-primary-500/25' 
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
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 shadow-lg shadow-brand-primary-500/25' 
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
            <Button className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 shadow-lg shadow-brand-primary-500/25 px-8 py-3 text-lg font-semibold">
              <Plus className="h-5 w-5 mr-2" />
              Discover Anime
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
