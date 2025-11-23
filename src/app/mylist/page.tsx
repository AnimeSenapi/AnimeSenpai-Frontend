'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MyListAnimeCard } from '../../components/anime/MyListAnimeCard'
import { Button } from '../../components/ui/button'
import { UserListResponse } from '../../types/anime'
import { useAuth } from '../lib/auth-context'
import { useFavorites } from '../lib/favorites-context'
import { apiGetUserList, apiUpdateListStatus } from '../lib/api'
import { groupAnimeIntoSeries } from '../../lib/series-grouping'
import {
  StatsCardSkeleton,
  AnimeCardSkeleton,
} from '../../components/ui/skeleton'
import { LoadingState } from '../../components/ui/loading-state'
import { EmptyState, ErrorState } from '../../components/ui/error-state'
import { VerificationGuard } from '../../lib/verification-guard'
import { VirtualGrid, VirtualList } from '../../components/VirtualList'
import { PullToRefresh } from '../../components/gestures/PullToRefresh'
import {
  Bookmark,
  Heart,
  Grid,
  List as ListIcon,
  Clock,
  Star,
  CheckCircle,
  Play,
  Lock,
  Search,
  X,
  TrendingUp,
  Download,
  BarChart3,
  CheckSquare,
  Square,
  MoreVertical,
} from 'lucide-react'
import { SEOMetadata } from '../../components/SEOMetadata'
import { ListExportWizard } from '../../components/export/ListExportWizard'
import { Progress } from '../../components/ui/progress'
import { useToast } from '../../components/ui/toast'

// Sort options
type SortOption = 'title' | 'rating' | 'year' | 'recent'
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'title', label: 'Title (A-Z)' },
  { value: 'rating', label: 'Highest Rating' },
  { value: 'year', label: 'Release Year' },
]

export default function MyListPage() {
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { toggleFavorite, isFavorited } = useFavorites()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams?.get('filter') || 'all'
  )
  const [isLoading, setIsLoading] = useState(false)
  const [userList, setUserList] = useState<UserListResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [selectedAnime, setSelectedAnime] = useState<Set<string>>(new Set())
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [showExportWizard, setShowExportWizard] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const { addToast } = useToast()

  // Fetch user's anime list from backend
    const fetchUserList = async () => {
      if (!isAuthenticated) return

      setIsLoading(true)
      setError(null)
      try {
        const data = (await apiGetUserList()) as any
        setUserList({
          items: data.items || [],
          total: data.pagination?.total || 0,
          stats: {
            watching: 0, // Will calculate from items
            completed: 0,
            planToWatch: 0,
            onHold: 0,
            dropped: 0,
            favorites: 0,
          },
        })
      } catch (err) {
        console.error('Failed to load list:', err)
        setError(null) // Don't show error, just use empty list
        // Use empty list
        setUserList({
          items: [],
          total: 0,
          stats: { watching: 0, completed: 0, planToWatch: 0, onHold: 0, dropped: 0, favorites: 0 },
        })
      } finally {
        setIsLoading(false)
      }
    }

  useEffect(() => {
    fetchUserList()
  }, [isAuthenticated])

  // Handle status change
  const handleStatusChange = async (animeId: string, status: 'watching' | 'completed' | 'plan-to-watch') => {
    console.log('handleStatusChange in mylist page:', { animeId, status })
    
    // Optimistically update the UI immediately
    if (userList) {
      setUserList({
        ...userList,
        items: userList.items.map((item) => {
          if (item.anime?.id === animeId) {
            return {
              ...item,
              listStatus: status as typeof item.listStatus,
            }
          }
          return item
        }),
      })
    }
    
    try {
      const result = await apiUpdateListStatus({
        animeId,
        status,
      })
      console.log('Status update successful:', result)
      // Optionally refetch to ensure consistency, but UI is already updated
      // await fetchUserList()
    } catch (err) {
      console.error('Failed to update status:', err)
      // Revert optimistic update on error
      await fetchUserList()
    }
  }

  // Handle bulk status change
  const handleBulkStatusChange = async (status: 'watching' | 'completed' | 'plan-to-watch' | 'on-hold' | 'dropped') => {
    if (selectedAnime.size === 0) return

    const animeIds = Array.from(selectedAnime)
    let successCount = 0
    let failCount = 0

    // Optimistically update UI
    if (userList) {
      setUserList({
        ...userList,
        items: userList.items.map((item) => {
          if (item.anime && animeIds.includes(item.anime.id)) {
            return {
              ...item,
              listStatus: status as typeof item.listStatus,
            }
          }
          return item
        }),
      })
    }

    // Update each item
    for (const animeId of animeIds) {
      try {
        await apiUpdateListStatus({
          animeId,
          status,
        })
        successCount++
      } catch (err) {
        console.error(`Failed to update ${animeId}:`, err)
        failCount++
      }
    }

    // Clear selection
    setSelectedAnime(new Set())
    setIsBulkMode(false)

    // Show toast
    if (failCount === 0) {
      addToast({
        title: 'Success',
        description: `Updated ${successCount} anime to ${status.replace('-', ' ')}`,
        variant: 'success',
      })
    } else {
      addToast({
        title: 'Partial Success',
        description: `Updated ${successCount} anime. ${failCount} failed.`,
        variant: 'default',
      })
      // Refetch to sync state
      await fetchUserList()
    }
  }

  // Toggle selection
  const toggleSelection = (animeId: string) => {
    setSelectedAnime((prev) => {
      const next = new Set(prev)
      if (next.has(animeId)) {
        next.delete(animeId)
      } else {
        next.add(animeId)
      }
      return next
    })
  }

  // Select all visible
  const selectAll = () => {
    setSelectedAnime(new Set(filteredAnime.map((a) => a.id)))
  }

  // Deselect all
  const deselectAll = () => {
    setSelectedAnime(new Set())
  }

  // Handle export
  const handleExport = async (options: any) => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      total: filteredAnime.length,
      stats: stats,
      anime: filteredAnime.map((anime) => ({
        id: anime.id,
        title: anime.title,
        titleEnglish: anime.titleEnglish,
        listStatus: anime.listStatus,
        isFavorite: anime.isFavorite,
        rating: anime.rating,
        year: anime.year,
      })),
    }

    let blob: Blob
    if (options.format === 'json') {
      blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    } else if (options.format === 'csv') {
      const headers = ['Title', 'Status', 'Favorite', 'Rating', 'Year']
      const rows = exportData.anime.map((a) => [
        a.titleEnglish || a.title,
        a.listStatus,
        a.isFavorite ? 'Yes' : 'No',
        a.rating || '',
        a.year || '',
      ])
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
      blob = new Blob([csv], { type: 'text/csv' })
    } else {
      // XML
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<animeList>
  <exportedAt>${exportData.exportedAt}</exportedAt>
  <total>${exportData.total}</total>
  ${exportData.anime.map((a) => `
  <anime>
    <title>${a.title}</title>
    <status>${a.listStatus}</status>
    <favorite>${a.isFavorite}</favorite>
    <rating>${a.rating || ''}</rating>
    <year>${a.year || ''}</year>
  </anime>`).join('')}
</animeList>`
      blob = new Blob([xml], { type: 'application/xml' })
    }

    return blob
  }

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (_event: MouseEvent) => {
      if (showSortMenu) {
        setShowSortMenu(false)
      }
    }

    if (showSortMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
    return undefined
  }, [showSortMenu])

  // Convert backend format to display format
  const myListAnimeRaw =
    userList?.items
      .filter((item) => item.anime) // Only include items with anime data
      .map((item) => ({
        ...item.anime!,
        listId: item.listId, // Preserve listId from the API response
        listStatus: item.listStatus as
          | 'watching'
          | 'completed'
          | 'plan-to-watch'
          | 'on-hold'
          | 'dropped',
        isFavorite: 'isFavorite' in item ? item.isFavorite! : false, // Include favorite flag, safe check for missing field
        // Ensure rating field exists for grouping
        rating: (item.anime && (item.anime.averageRating ?? item.anime.rating)) || 0,
        averageRating: item.anime!.averageRating || item.anime!.rating || 0,
      })) || []

  // Group anime into series
  const myListAnime = groupAnimeIntoSeries(myListAnimeRaw).map((series) => ({
    ...series,
    // Preserve list status from the first season (or most recent)
    listStatus:
      series.seasons?.[0]?.listStatus ||
      myListAnimeRaw.find((a) => a.id === series.id)?.listStatus ||
      'plan-to-watch',
    // Preserve favorite flag - true if ANY season is favorited
    isFavorite:
      series.seasons?.some((s: any) => s.isFavorite) ||
      myListAnimeRaw.find((a) => a.id === series.id)?.isFavorite ||
      false,
    // Use English title if available
    title: series.titleEnglish || series.displayTitle || series.title,
    titleEnglish: series.titleEnglish || series.displayTitle,
    // Ensure rating is a number
    rating: Number(series.rating) || series.averageRating || 0,
    averageRating: Number(series.rating) || series.averageRating || 0,
  }))

  // Calculate stats from items (before grouping for accurate counts)
  const favorites = myListAnimeRaw.filter((anime) => anime.isFavorite === true)
  const watching = myListAnimeRaw.filter((anime) => anime.listStatus === 'watching')
  const completed = myListAnimeRaw.filter((anime) => anime.listStatus === 'completed')
  const planToWatch = myListAnimeRaw.filter((anime) => anime.listStatus === 'plan-to-watch')

  // Filter anime based on selected category
  const getCategoryFilteredAnime = () => {
    switch (selectedCategory) {
      case 'favorites':
        return myListAnime.filter(
          (anime) =>
            anime.isFavorite === true || anime.seasons?.some((s: any) => s.isFavorite === true)
        )
      case 'watching':
        return myListAnime.filter(
          (anime) =>
            anime.listStatus === 'watching' ||
            anime.seasons?.some((s: any) => s.listStatus === 'watching')
        )
      case 'completed':
        return myListAnime.filter(
          (anime) =>
            anime.listStatus === 'completed' ||
            anime.seasons?.some((s: any) => s.listStatus === 'completed')
        )
      case 'plan-to-watch':
        return myListAnime.filter(
          (anime) =>
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
    return animeList.filter(
      (anime) =>
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
    dropped: 0,
  }

  // Show loading state
  if (authLoading || isLoading) {
    return <LoadingState variant="full" text="Loading your anime list..." size="lg" />
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
                Create an account or sign in to track your favorite anime, manage your watchlist,
                and never miss an episode.
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
    <VerificationGuard requireVerification={false}>
      <>
        {/* SEO Metadata */}
        <SEOMetadata
          title="My Anime List"
          description="Track and manage your anime watchlist. Organize your favorite anime by status and rating."
          keywords={['my anime list', 'watchlist', 'anime tracking', 'anime management']}
          noindex={true}
          nofollow={true}
        />

        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          <PullToRefresh onRefresh={fetchUserList} disabled={isLoading}>
            <main className="container px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-8 sm:pb-12 md:pb-16 lg:pb-20 relative z-10">
              {/* Stats and Controls Card */}
            <div className="glass rounded-xl p-3 sm:p-4 border border-white/10 mb-6 shadow-xl backdrop-blur-xl">
              {/* Stats Row - Clickable Filters */}
              <div className="grid grid-cols-5 gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`group flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl transition-all duration-200 ease-out ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-br from-primary-500/20 via-secondary-500/20 to-primary-500/20 border border-primary-500/40 shadow-lg shadow-primary-500/10 scale-105'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-br from-primary-500/30 to-secondary-500/30 shadow-sm'
                      : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                    <Bookmark className={`h-4 w-4 ${selectedCategory === 'all' ? 'text-primary-300' : 'text-gray-400'}`} fill={selectedCategory === 'all' ? 'currentColor' : 'none'} />
                  </div>
                  <span className={`text-base font-bold leading-tight ${selectedCategory === 'all' ? 'text-white' : 'text-gray-300'}`}>
                    {myListAnime.length}
                  </span>
                  <span className={`text-[10px] font-medium leading-tight ${selectedCategory === 'all' ? 'text-primary-300' : 'text-gray-500'}`}>
                    All
                  </span>
                </button>

                <button
                  onClick={() => setSelectedCategory('favorites')}
                  className={`group flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl transition-all duration-200 ease-out ${
                    selectedCategory === 'favorites'
                      ? 'bg-rose-500/20 border border-rose-500/40 shadow-lg shadow-rose-500/10 scale-105'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                    selectedCategory === 'favorites'
                      ? 'bg-rose-500/30 shadow-sm'
                      : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                    <Heart className={`h-4 w-4 ${selectedCategory === 'favorites' ? 'text-rose-300' : 'text-gray-400'}`} fill={selectedCategory === 'favorites' ? 'currentColor' : 'none'} />
                  </div>
                  <span className={`text-base font-bold leading-tight ${selectedCategory === 'favorites' ? 'text-white' : 'text-gray-300'}`}>
                    {stats.favorites}
                  </span>
                  <span className={`text-[10px] font-medium leading-tight ${selectedCategory === 'favorites' ? 'text-rose-300' : 'text-gray-500'}`}>
                    Fav
                  </span>
                </button>

                <button
                  onClick={() => setSelectedCategory('watching')}
                  className={`group flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl transition-all duration-200 ease-out ${
                    selectedCategory === 'watching'
                      ? 'bg-blue-500/20 border border-blue-500/40 shadow-lg shadow-blue-500/10 scale-105'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                    selectedCategory === 'watching'
                      ? 'bg-blue-500/30 shadow-sm'
                      : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                    <Play className={`h-4 w-4 ${selectedCategory === 'watching' ? 'text-blue-300' : 'text-gray-400'}`} fill={selectedCategory === 'watching' ? 'currentColor' : 'none'} />
                  </div>
                  <span className={`text-base font-bold leading-tight ${selectedCategory === 'watching' ? 'text-white' : 'text-gray-300'}`}>
                    {stats.watching}
                  </span>
                  <span className={`text-[10px] font-medium leading-tight ${selectedCategory === 'watching' ? 'text-blue-300' : 'text-gray-500'}`}>
                    Watch
                  </span>
                </button>

                <button
                  onClick={() => setSelectedCategory('completed')}
                  className={`group flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl transition-all duration-200 ease-out ${
                    selectedCategory === 'completed'
                      ? 'bg-green-500/20 border border-green-500/40 shadow-lg shadow-green-500/10 scale-105'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                    selectedCategory === 'completed'
                      ? 'bg-green-500/30 shadow-sm'
                      : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                    <CheckCircle className={`h-4 w-4 ${selectedCategory === 'completed' ? 'text-green-300' : 'text-gray-400'}`} fill={selectedCategory === 'completed' ? 'currentColor' : 'none'} />
                  </div>
                  <span className={`text-base font-bold leading-tight ${selectedCategory === 'completed' ? 'text-white' : 'text-gray-300'}`}>
                    {stats.completed}
                  </span>
                  <span className={`text-[10px] font-medium leading-tight ${selectedCategory === 'completed' ? 'text-green-300' : 'text-gray-500'}`}>
                    Done
                  </span>
                </button>

                <button
                  onClick={() => setSelectedCategory('plan-to-watch')}
                  className={`group flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl transition-all duration-200 ease-out ${
                    selectedCategory === 'plan-to-watch'
                      ? 'bg-amber-500/20 border border-amber-500/40 shadow-lg shadow-amber-500/10 scale-105'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                    selectedCategory === 'plan-to-watch'
                      ? 'bg-amber-500/30 shadow-sm'
                      : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                    <Clock className={`h-4 w-4 ${selectedCategory === 'plan-to-watch' ? 'text-amber-300' : 'text-gray-400'}`} fill={selectedCategory === 'plan-to-watch' ? 'currentColor' : 'none'} />
              </div>
                  <span className={`text-base font-bold leading-tight ${selectedCategory === 'plan-to-watch' ? 'text-white' : 'text-gray-300'}`}>
                    {stats.planToWatch}
                  </span>
                  <span className={`text-[10px] font-medium leading-tight ${selectedCategory === 'plan-to-watch' ? 'text-amber-300' : 'text-gray-500'}`}>
                    Plan
                  </span>
                </button>
            </div>

            {/* Search and Controls */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2 border-t border-white/10">
                <div className="relative flex-1 overflow-hidden rounded-lg">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-colors z-10" />
                  <input
                    type="text"
                    placeholder="Search your anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 h-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/30 text-sm transition-all duration-200 hover:border-white/20"
                    style={{ borderRadius: '0.5rem' }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 p-1.5 active:scale-95"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
              </div>

                <div className="flex items-center gap-2">
                  {/* Bulk Mode Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsBulkMode(!isBulkMode)
                      if (isBulkMode) {
                        setSelectedAnime(new Set())
                      }
                    }}
                    className={`border-white/20 text-white hover:bg-white/10 h-10 px-3.5 transition-all duration-200 rounded-xl ${
                      isBulkMode ? 'bg-primary-500/20 border-primary-500/40' : ''
                    }`}
                  >
                    {isBulkMode ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        <span className="text-xs hidden sm:inline font-medium">Cancel</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        <span className="text-xs hidden sm:inline font-medium">Select</span>
                      </>
                    )}
                  </Button>

                  {/* Export Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExportWizard(true)}
                    className="border-white/20 text-white hover:bg-white/10 h-10 px-3.5 transition-all duration-200 rounded-xl"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span className="text-xs hidden sm:inline font-medium">Export</span>
                  </Button>

                  {/* Stats Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowStats(!showStats)}
                    className={`border-white/20 text-white hover:bg-white/10 h-10 px-3.5 transition-all duration-200 rounded-xl ${
                      showStats ? 'bg-primary-500/20 border-primary-500/40' : ''
                    }`}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <span className="text-xs hidden sm:inline font-medium">Stats</span>
                  </Button>
                {/* Sort Dropdown */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowSortMenu(!showSortMenu)
                    }}
                      className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 h-10 px-3.5 transition-all duration-200 rounded-xl"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                      <span className="text-xs hidden sm:inline font-medium">{SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}</span>
                      <span className="text-xs sm:hidden font-medium">Sort</span>
                  </Button>

                  {showSortMenu && (
                      <div className="absolute top-full right-0 mt-2 glass rounded-xl p-2 min-w-[220px] z-50 border border-white/20 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value)
                            setShowSortMenu(false)
                          }}
                            className={`w-full text-left px-3.5 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-between text-sm ${
                            sortBy === option.value
                                ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-primary-400 font-semibold border border-primary-500/30'
                              : 'text-white hover:bg-white/10'
                          }`}
                        >
                            <span>{option.label}</span>
                            {sortBy === option.value && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div>
                            )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View Mode Toggle */}
                  <div className="flex items-center gap-0.5 glass rounded-xl p-0.5 border border-white/10">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                      className={`transition-all duration-200 h-9 w-9 flex items-center justify-center p-0 rounded-lg ${
                      viewMode === 'grid'
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/20'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                      className={`transition-all duration-200 h-9 w-9 flex items-center justify-center p-0 rounded-lg ${
                      viewMode === 'list'
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/20'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <ListIcon className="h-4 w-4" />
                  </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk Action Bar */}
            {isBulkMode && selectedAnime.size > 0 && (
              <div className="glass rounded-xl p-4 border border-primary-500/30 bg-primary-500/10 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckSquare className="h-5 w-5 text-primary-400" />
                  <span className="text-white font-medium">
                    {selectedAnime.size} {selectedAnime.size === 1 ? 'anime' : 'anime'} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectedAnime.size === filteredAnime.length ? deselectAll : selectAll}
                    className="text-primary-400 hover:text-primary-300 text-xs"
                  >
                    {selectedAnime.size === filteredAnime.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-300 mr-2">Change status to:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange('watching')}
                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                  >
                    Watching
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange('completed')}
                    className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                  >
                    Completed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange('plan-to-watch')}
                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                  >
                    Plan to Watch
                  </Button>
                </div>
              </div>
            )}

            {/* Statistics Visualization */}
            {showStats && (
              <div className="glass rounded-xl p-6 border border-white/10 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary-400" />
                    List Statistics
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStats(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Distribution */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Status Distribution</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Watching', value: stats.watching, color: 'bg-blue-400', icon: Play },
                        { label: 'Completed', value: stats.completed, color: 'bg-green-400', icon: CheckCircle },
                        { label: 'Plan to Watch', value: stats.planToWatch, color: 'bg-amber-400', icon: Clock },
                        { label: 'Favorites', value: stats.favorites, color: 'bg-red-400', icon: Heart },
                      ].map(({ label, value, color, icon: Icon }) => {
                        const total = myListAnime.length || 1
                        const percentage = (value / total) * 100
                        return (
                          <div key={label}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-300">{label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">{value}</span>
                                <span className="text-xs text-gray-500">({Math.round(percentage)}%)</span>
                              </div>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${color} rounded-full transition-all`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Summary</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-sm text-gray-300">Total Anime</span>
                        <span className="text-lg font-bold text-white">{myListAnime.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-sm text-gray-300">Completion Rate</span>
                        <span className="text-lg font-bold text-green-400">
                          {myListAnime.length > 0
                            ? Math.round((stats.completed / myListAnime.length) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-sm text-gray-300">Favorites</span>
                        <span className="text-lg font-bold text-red-400">{stats.favorites}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Anime Display */}
            <div className="mt-2">
            {viewMode === 'grid' ? (
              // Use virtual scrolling for grid view (optimal for 100+ items)
              filteredAnime.length > 50 ? (
                <VirtualGrid
                  items={filteredAnime}
                  itemWidth={220}
                  itemHeight={360}
                  columns={5}
                  gap={24}
                  height={800}
                  className="pb-8"
                  renderItem={(anime) => (
                    <MyListAnimeCard
                      key={anime.id}
                      anime={anime}
                      variant="grid"
                      onFavorite={toggleFavorite}
                      isFavorited={isFavorited(anime.id)}
                      onStatusChange={handleStatusChange}
                      isBulkMode={isBulkMode}
                      isSelected={selectedAnime.has(anime.id)}
                      onToggleSelection={toggleSelection}
                    />
                  )}
                />
              ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  {filteredAnime.map((anime) => (
                    <MyListAnimeCard
                      key={anime.id}
                      anime={anime}
                      variant="grid"
                      onFavorite={toggleFavorite}
                      isFavorited={isFavorited(anime.id)}
                      onStatusChange={handleStatusChange}
                      isBulkMode={isBulkMode}
                      isSelected={selectedAnime.has(anime.id)}
                      onToggleSelection={toggleSelection}
                    />
                  ))}
                </div>
              )
            ) : // Use virtual scrolling for list view (optimal for 100+ items)
            filteredAnime.length > 50 ? (
              <VirtualList
                items={filteredAnime}
                itemHeight={120}
                height={800}
                gap={16}
                className="pb-8"
                renderItem={(anime) => (
                  <MyListAnimeCard
                    key={anime.id}
                    anime={anime}
                    variant="list"
                    onFavorite={toggleFavorite}
                    isFavorited={isFavorited(anime.id)}
                    onStatusChange={handleStatusChange}
                    isBulkMode={isBulkMode}
                    isSelected={selectedAnime.has(anime.id)}
                    onToggleSelection={toggleSelection}
                  />
                )}
              />
            ) : (
                <div className="space-y-3 sm:space-y-4">
                {filteredAnime.map((anime) => (
                  <MyListAnimeCard
                    key={anime.id}
                    anime={anime}
                    variant="list"
                    onFavorite={toggleFavorite}
                    isFavorited={isFavorited(anime.id)}
                    onStatusChange={handleStatusChange}
                    isBulkMode={isBulkMode}
                    isSelected={selectedAnime.has(anime.id)}
                    onToggleSelection={toggleSelection}
                  />
                ))}
              </div>
            )}
            </div>

            {/* Empty State - Enhanced with helpful suggestions */}
            {filteredAnime.length === 0 && (
              <EmptyState
                icon={
                  selectedCategory === 'favorites' ? (
                    <Heart className="h-12 w-12 text-red-400" />
                  ) : selectedCategory === 'watching' ? (
                    <Play className="h-12 w-12 text-blue-400" />
                  ) : selectedCategory === 'completed' ? (
                    <CheckCircle className="h-12 w-12 text-green-400" />
                  ) : selectedCategory === 'plan-to-watch' ? (
                    <Clock className="h-12 w-12 text-amber-400" />
                  ) : (
                    <Bookmark className="h-12 w-12 text-primary-400" />
                  )
                }
                title={
                  selectedCategory === 'all'
                    ? 'Your list is empty'
                    : searchQuery
                      ? 'No results found'
                      : `No ${selectedCategory.replace('-', ' ')} anime`
                }
                message={
                  selectedCategory === 'all'
                    ? 'Start building your anime collection by adding shows you love or want to watch!'
                    : searchQuery
                      ? `No anime matching "${searchQuery}" in your ${selectedCategory.replace('-', ' ')} list`
                      : `Add some anime to your ${selectedCategory.replace('-', ' ')} list to see them here`
                }
                suggestions={
                  selectedCategory === 'all' && !searchQuery
                    ? [
                        'Browse our full anime catalog in the Search page',
                        'Check out trending anime on the Dashboard',
                        'Use filters to find anime by genre, year, or studio',
                      ]
                    : searchQuery
                      ? [
                          'Check your spelling',
                          'Try different keywords',
                          'Clear filters and search again',
                        ]
                      : undefined
                }
                actionLabel={searchQuery ? 'Clear Search' : 'Discover Anime'}
                onAction={() =>
                  searchQuery ? setSearchQuery('') : (window.location.href = '/search')
                }
                secondaryActionLabel={!searchQuery ? 'View Trending' : undefined}
                onSecondaryAction={
                  !searchQuery ? () => (window.location.href = '/dashboard') : undefined
                }
              />
            )}
            </main>
          </PullToRefresh>
        </div>

        {/* Export Wizard Modal */}
        <ListExportWizard
          isOpen={showExportWizard}
          onClose={() => setShowExportWizard(false)}
          onExport={handleExport}
          onCancel={() => setShowExportWizard(false)}
        />
      </>
    </VerificationGuard>
  )
}
