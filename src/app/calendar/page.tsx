'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '../../components/ui/button'
import { LoadingState } from '../../components/ui/loading-state'
import { ErrorState } from '../../components/ui/error-state'
import { AnimeCalendar, DateRangePicker } from '../../components/calendar'
import { useAuth } from '../lib/auth-context'
import { useToast } from '../../components/ui/toast'
import { 
  apiGetEpisodeSchedule,
  apiGetCalendarStats,
  apiSyncCalendarData,
  type Episode,
  type CalendarStats,
} from '../lib/api'
import { 
  Clock, 
  TrendingUp,
  Star,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { logger } from '../../lib/logger'

export default function CalendarPage() {
  const { isAuthenticated, user } = useAuth()
  const { addToast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [stats, setStats] = useState<CalendarStats | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const retryCountRef = useRef(0)
  const retryDelayRef = useRef(1000)
  
  // Initialize date range - compute default week
  const getDefaultDateRange = () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    
    return { start: startOfWeek, end: endOfWeek }
  }
  
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => getDefaultDateRange())
  
  const retryFetch = async () => {
    setError(null)
    setIsLoading(true)
    retryCountRef.current = 0
    retryDelayRef.current = 1000
    await fetchCalendarData()
  }
  
  const fetchCalendarData = async (isRetry = false) => {
    if (!isRetry) {
      setIsLoading(true)
      setError(null)
      retryCountRef.current = 0
      retryDelayRef.current = 1000
    }

    try {
      const startStr = dateRange.start.toISOString().split('T')[0] || ''
      const endStr = dateRange.end.toISOString().split('T')[0] || ''
      
      const [episodeData, statsData] = await Promise.all([
        apiGetEpisodeSchedule(startStr, endStr),
        apiGetCalendarStats(startStr, endStr).catch(() => null),
      ])

      setEpisodes(episodeData)
      if (statsData) {
        setStats(statsData)
      }
      retryCountRef.current = 0
      retryDelayRef.current = 1000
      setIsLoading(false)
      
      // Prefetch adjacent weeks in background
      prefetchAdjacentWeeks(startStr, endStr)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load calendar data'
      setError(errorMessage)
      logger.error('Failed to load calendar data', err as Error)
      
      // Exponential backoff retry
      if (retryCountRef.current < 3) {
        retryCountRef.current += 1
        retryDelayRef.current *= 2
        
        setTimeout(() => {
          fetchCalendarData(true)
        }, retryDelayRef.current)
      } else {
        setIsLoading(false)
      }
    }
  }
  
  const prefetchAdjacentWeeks = async (currentStart: string, currentEnd: string) => {
    // Prefetch previous week
    const prevStart = new Date(currentStart)
    prevStart.setDate(prevStart.getDate() - 7)
    const prevEnd = new Date(currentEnd)
    prevEnd.setDate(prevEnd.getDate() - 7)
    
    // Prefetch next week
    const nextStart = new Date(currentStart)
    nextStart.setDate(nextStart.getDate() + 7)
    const nextEnd = new Date(currentEnd)
    nextEnd.setDate(nextEnd.getDate() + 7)
    
    // Prefetch in background (don't await)
    Promise.all([
      apiGetEpisodeSchedule(
        prevStart.toISOString().split('T')[0] || '',
        prevEnd.toISOString().split('T')[0] || ''
      ).catch(() => []),
      apiGetEpisodeSchedule(
        nextStart.toISOString().split('T')[0] || '',
        nextEnd.toISOString().split('T')[0] || ''
      ).catch(() => []),
    ]).catch(() => {
      // Silently fail prefetch
    })
  }
  
  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end })
    
    // Update URL with new date range
    const params = new URLSearchParams(searchParams.toString())
    params.set('start', start.toISOString().split('T')[0] || '')
    params.set('end', end.toISOString().split('T')[0] || '')
    router.push(`/calendar?${params.toString()}`, { scroll: false })
  }

  // Sync URL params with state when URL changes (but not when we update it ourselves)
  useEffect(() => {
    const startParam = searchParams.get('start')
    const endParam = searchParams.get('end')
    
    if (startParam && endParam) {
      try {
        const start = new Date(startParam)
        const end = new Date(endParam)
        
        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return
        }
        
        const currentStartStr = dateRange.start.toISOString().split('T')[0] || ''
        const currentEndStr = dateRange.end.toISOString().split('T')[0] || ''
        
        // Only update if URL params differ from current state
        if (startParam !== currentStartStr || endParam !== currentEndStr) {
          setDateRange({ start, end })
        }
      } catch (e) {
        // Invalid date params, ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])
  
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    fetchCalendarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, dateRange.start.getTime(), dateRange.end.getTime()])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Trigger sync in background
      await apiSyncCalendarData()
      
      // Wait a moment for sync to start, then refresh data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Refresh calendar data
      const startStr = dateRange.start.toISOString().split('T')[0] || ''
      const endStr = dateRange.end.toISOString().split('T')[0] || ''
      
      const [episodeData, statsData] = await Promise.all([
        apiGetEpisodeSchedule(startStr, endStr, false), // Skip cache
        apiGetCalendarStats(startStr, endStr, false).catch(() => null),
      ])

      setEpisodes(episodeData)
      if (statsData) {
        setStats(statsData)
      }
      
      addToast({
        title: 'Calendar refreshed',
        description: 'Calendar data has been updated',
        variant: 'success',
      })
    } catch (err) {
      addToast({
        title: 'Refresh failed',
        description: err instanceof Error ? err.message : 'Failed to refresh calendar data',
        variant: 'error',
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleEpisodeClick = (episode: any) => {
    // Episode clicked - handle navigation/action
    addToast({
        title: 'Episode clicked',
        description: `${episode.animeTitle} Episode ${episode.episodeNumber}`,
        variant: 'default',
      })
  }

  const handleAnimeClick = (animeId: string) => {
    // Find anime slug from episodes
    const episode = episodes.find((ep) => ep.animeId === animeId)
    const slug = episode?.animeSlug
    
    if (slug) {
      window.location.href = `/anime/${slug}`
    } else {
      addToast({
        title: 'Anime clicked',
        description: 'Redirecting to anime page...',
        variant: 'default',
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 pt-32 sm:pt-36 md:pt-40">
        <ErrorState
          variant="full"
          title="Authentication Required"
          message="Please sign in to view the anime calendar."
          showHome={true}
        />
      </div>
    )
  }

  if (isLoading) {
    return <LoadingState variant="full" text="Loading calendar..." size="lg" />
  }

  if (error && retryCountRef.current >= 3 && episodes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 pt-32 sm:pt-36 md:pt-40">
        <ErrorState
          variant="full"
          title="Failed to Load Calendar"
          message={`${error}${retryCountRef.current > 0 ? ` (Retried ${retryCountRef.current} times)` : ''}`}
          showHome={true}
          showRetry={true}
          onRetry={retryFetch}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-8 sm:pb-16 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center border border-primary-500/30">
                <Clock className="h-6 w-6 text-primary-400" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Anime Calendar</h1>
                <p className="text-gray-400 text-sm">Track upcoming episodes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DateRangePicker
                startDate={dateRange.start}
                endDate={dateRange.end}
                onDateRangeChange={handleDateRangeChange}
              />
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
                aria-label="Refresh calendar data"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>

        {/* Error Banner (if partial data) */}
        {error && episodes.length > 0 && (
          <div className="mb-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">
                {error} Showing cached data. 
                <button
                  onClick={retryFetch}
                  className="ml-2 underline hover:text-yellow-300"
                >
                  Retry
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <AnimeCalendar
          episodes={episodes}
          onEpisodeClick={handleEpisodeClick}
          onAnimeClick={handleAnimeClick}
          isLoading={isLoading}
        />

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-violet-400" />
              <h3 className="text-lg font-semibold text-white">This Week</h3>
            </div>
            <p className="text-2xl font-bold text-violet-400 mb-1">
              {stats?.episodesThisWeek ?? episodes.length}
            </p>
            <p className="text-sm text-gray-400">Episodes airing</p>
          </div>
          
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Trending</h3>
            </div>
            <p className="text-2xl font-bold text-green-400 mb-1">
              {stats?.trendingCount ?? 0}
            </p>
            <p className="text-sm text-gray-400">Popular anime</p>
          </div>
          
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Watching</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-400 mb-1">
              {stats?.watchingEpisodes ?? episodes.filter((ep) => ep.isWatching).length}
            </p>
            <p className="text-sm text-gray-400">Currently watching</p>
          </div>
        </div>
      </main>
    </div>
  )
}
