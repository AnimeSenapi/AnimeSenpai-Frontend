'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MyListAnimeCard } from '../../components/anime/MyListAnimeCard'
import { Button } from '../../components/ui/button'
import { Anime, AnimeListItem, UserListResponse } from '../../types/anime'
import { useAuth } from '../lib/auth-context'
import { useFavorites } from '../lib/favorites-context'
import { apiGetUserList } from '../lib/api'
import { groupAnimeIntoSeries } from '../../lib/series-grouping'
import { StatsCardSkeleton, AnimeCardSkeleton, ListItemSkeleton } from '../../components/ui/skeleton'
import { LoadingState } from '../../components/ui/loading-state'
import { EmptyState, ErrorState } from '../../components/ui/error-state'
import { Bookmark, Heart, Grid, List as ListIcon, Clock, Star, CheckCircle, Play, Plus, Lock, Loader2, Search, X, RefreshCw, TrendingUp } from 'lucide-react'

// Sort options
type SortOption = 'title' | 'rating' | 'year' | 'recent' | 'episodes'
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'title', label: 'Title (A-Z)' },
  { value: 'rating', label: 'Highest Rating' },
  { value: 'year', label: 'Release Year' },
  { value: 'episodes', label: 'Most Episodes' }
]

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
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { toggleFavorite, isFavorited } = useFavorites()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams?.get('filter') || 'all')
  const [isLoading, setIsLoading] = useState(false)
  const [userList, setUserList] = useState<UserListResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [showSortMenu, setShowSortMenu] = useState(false)

  // Fetch user's anime list from backend
  useEffect(() => {
    const fetchUserList = async () => {
      if (!isAuthenticated) return

      setIsLoading(true)
      setError(null)
      try {
        const data = await apiGetUserList()
        setUserList({
          items: data.items || [],
          total: data.pagination?.total || 0,
          stats: {
            watching: 0, // Will calculate from items
            completed: 0,
            planToWatch: 0,
            onHold: 0,
            dropped: 0,
            favorites: 0
          }
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load your list'
        console.error('Failed to load list:', err)
        setError(null) // Don't show error, just use empty list
        // Use empty list
        setUserList({
          items: [],
          total: 0,
          stats: { watching: 0, completed: 0, planToWatch: 0, onHold: 0, dropped: 0, favorites: 0 }
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserList()
  }, [isAuthenticated])

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSortMenu) {
        setShowSortMenu(false)
      }
    }

    if (showSortMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showSortMenu])

  const refreshList = async () => {
    if (!isAuthenticated) return
    
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiGetUserList()
      setUserList({
        items: data.items || [],
        total: data.pagination?.total || 0,
        stats: {
          watching: 0,
          completed: 0,
          planToWatch: 0,
          onHold: 0,
          dropped: 0,
          favorites: 0
        }
      })
    } catch (err) {
      console.error('Failed to refresh list:', err)
      setError(null) // Don't show error, just use current list
    } finally {
      setIsLoading(false)
    }
  }

  // Convert backend format to display format
  const myListAnimeRaw = userList?.items
    .filter(item => item.anime) // Only include items with anime data
    .map(item => ({
      ...item.anime!,
      listStatus: item.listStatus as 'favorite' | 'watching' | 'completed' | 'plan-to-watch',
      // Ensure rating field exists for grouping
      rating: item.anime!.averageRating || item.anime!.rating || 0,
      averageRating: item.anime!.averageRating || item.anime!.rating || 0,
    })) || []

  // Group anime into series
  const myListAnime = groupAnimeIntoSeries(myListAnimeRaw).map(series => ({
    ...series,
    // Preserve list status from the first season (or most recent)
    listStatus: series.seasons?.[0]?.listStatus || myListAnimeRaw.find(a => a.id === series.id)?.listStatus || 'plan-to-watch',
    // Use English title if available
    title: series.titleEnglish || series.displayTitle || series.title,
    titleEnglish: series.titleEnglish || series.displayTitle,
    // Ensure rating is a number
    rating: Number(series.rating) || series.averageRating || 0,
    averageRating: Number(series.rating) || series.averageRating || 0,
  }))

  // Calculate stats from items (before grouping for accurate counts)
  const favorites = myListAnimeRaw.filter(anime => anime.listStatus === 'favorite')
  const watching = myListAnimeRaw.filter(anime => anime.listStatus === 'watching')
  const completed = myListAnimeRaw.filter(anime => anime.listStatus === 'completed')
  const planToWatch = myListAnimeRaw.filter(anime => anime.listStatus === 'plan-to-watch')

  // Filter anime based on selected category
  const getCategoryFilteredAnime = () => {
    switch (selectedCategory) {
      case 'favorites':
        return myListAnime.filter(anime => 
          anime.listStatus === 'favorite' || 
          anime.seasons?.some((s: any) => s.listStatus === 'favorite')
        )
      case 'watching':
        return myListAnime.filter(anime => 
          anime.listStatus === 'watching' || 
          anime.seasons?.some((s: any) => s.listStatus === 'watching')
        )
      case 'completed':
        return myListAnime.filter(anime => 
          anime.listStatus === 'completed' || 
          anime.seasons?.some((s: any) => s.listStatus === 'completed')
        )
      case 'plan-to-watch':
        return myListAnime.filter(anime => 
          anime.listStatus === 'plan-to-watch' || 
          anime.seasons?.some((s: any) => s.listStatus === 'plan-to-watch')
        )
      default:
        return myListAnime
    }
  }

  // Apply search filter
  const getSearchFilteredAnime = (animeList: typeof myListAnime) => {
    if (!searchQuery.trim()) return animeList
    
    const query = searchQuery.toLowerCase()
    return animeList.filter(anime => 
      anime.title.toLowerCase().includes(query) ||
      anime.titleEnglish?.toLowerCase().includes(query) ||
      anime.titleJapanese?.toLowerCase().includes(query) ||
      anime.studio?.toLowerCase().includes(query)
    )
  }

  // Apply sorting
  const getSortedAnime = (animeList: typeof myListAnime) => {
    const sorted = [...animeList]
    
    switch (sortBy) {
      case 'title':
        return sorted.sort((a, b) => {
          const aTitle = a.titleEnglish || a.title
          const bTitle = b.titleEnglish || b.title
          return aTitle.localeCompare(bTitle)
        })
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'year':
        return sorted.sort((a, b) => (b.year || 0) - (a.year || 0))
      case 'episodes':
        return sorted.sort((a, b) => (b.episodes || 0) - (a.episodes || 0))
      case 'recent':
      default:
        return sorted // Already in recent order from API
    }
  }

  const filteredAnime = getSortedAnime(getSearchFilteredAnime(getCategoryFilteredAnime()))
  
  // Calculate stats
  const stats = {
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
      <LoadingState variant="full" text="Loading your anime list..." size="lg" />
    )
  }

  // Show error state if needed
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden pt-32">
        <ErrorState
          variant="full"
          error={error}
          title="Failed to load your list"
          onRetry={() => window.location.reload()}
          showHome={true}
        />
      </div>
    )
  }

  // Original loading skeleton code (fallback)
  if (false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <main className="container pt-32 pb-20 relative z-10">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="h-12 w-48 bg-white/10 rounded-lg mb-2 animate-pulse"></div>
                <div className="h-6 w-64 bg-white/10 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-10 w-10 bg-white/10 rounded-lg animate-pulse"></div>
            </div>
            
            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>
          </div>

          {/* Category Filter Skeleton */}
          <div className="glass rounded-2xl p-4 mb-8">
            <div className="flex gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-9 w-32 bg-white/10 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Search Bar Skeleton */}
          <div className="mb-8 space-y-4">
            <div className="h-14 bg-white/10 rounded-xl animate-pulse"></div>
            <div className="flex justify-between">
              <div className="h-10 w-40 bg-white/10 rounded-lg animate-pulse"></div>
              <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Anime Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <AnimeCardSkeleton key={i} />
            ))}
          </div>
        </main>
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

      <main className="container px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 relative z-10">
        {/* Header Section - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white via-primary-400 to-secondary-400 bg-clip-text text-transparent">
                My List
              </h1>
              <p className="text-lg text-gray-300 flex items-center gap-2">
                {myListAnime.length} anime in your collection
                {myListAnime.length > 0 && searchQuery && (
                  <span className="text-sm text-gray-500">({filteredAnime.length} shown)</span>
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshList}
              disabled={isLoading}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="glass rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-error-500/20 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-error-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{stats.favorites}</div>
                  <div className="text-xs text-gray-400">Favorites</div>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <Play className="h-5 w-5 text-primary-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{stats.watching}</div>
                  <div className="text-xs text-gray-400">Watching</div>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{stats.completed}</div>
                  <div className="text-xs text-gray-400">Completed</div>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{stats.planToWatch}</div>
                  <div className="text-xs text-gray-400">Plan to Watch</div>
                </div>
              </div>
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

        {/* Search and Controls */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="glass rounded-xl p-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search anime by title or studio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSortMenu(!showSortMenu)
                }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label}
              </Button>
              
              {showSortMenu && (
                <div className="absolute top-full left-0 mt-2 glass rounded-xl p-2 min-w-[200px] z-10 border border-white/10">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value)
                        setShowSortMenu(false)
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        sortBy === option.value
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 glass rounded-xl p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`transition-all ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`transition-all ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
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
                onFavorite={toggleFavorite}
                isFavorited={isFavorited(anime.id)}
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
                onFavorite={toggleFavorite}
                isFavorited={isFavorited(anime.id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredAnime.length === 0 && (
          <EmptyState
            icon={
              selectedCategory === 'favorites' ? <Heart className="h-12 w-12 text-gray-500" /> :
              selectedCategory === 'watching' ? <Play className="h-12 w-12 text-gray-500" /> :
              selectedCategory === 'completed' ? <CheckCircle className="h-12 w-12 text-gray-500" /> :
              selectedCategory === 'plan-to-watch' ? <Clock className="h-12 w-12 text-gray-500" /> :
              <Bookmark className="h-12 w-12 text-gray-500" />
            }
            title={
              selectedCategory === 'all' 
                ? 'Your list is empty' 
                : `No ${selectedCategory.replace('-', ' ')} anime`
            }
            message={
              selectedCategory === 'all' 
                ? 'Start building your anime collection by adding shows you love or want to watch'
                : searchQuery
                ? `No anime matching "${searchQuery}" in your ${selectedCategory.replace('-', ' ')} list`
                : `Add some anime to your ${selectedCategory.replace('-', ' ')} list to see them here`
            }
            actionLabel="Discover Anime"
            onAction={() => window.location.href = '/search'}
          />
        )}
      </main>
    </div>
  )
}
