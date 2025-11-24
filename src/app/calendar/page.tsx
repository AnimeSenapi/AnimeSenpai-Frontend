'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { LoadingState } from '../../components/ui/loading-state'
import { ErrorState } from '../../components/ui/error-state'
import { AnimeCalendar } from '../../components/calendar'
import { apiGetEpisodeSchedule, type Episode } from '../lib/api'
import { logger } from '../../lib/logger'

export default function CalendarPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
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
  
  const [dateRange] = useState<{ start: Date; end: Date }>(() => getDefaultDateRange())
  
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
      
      const episodeData = await apiGetEpisodeSchedule(startStr, endStr)

      setEpisodes(episodeData)
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
  

  // Fetch calendar data on mount
  useEffect(() => {
    fetchCalendarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.start.getTime(), dateRange.end.getTime()])

  const handleEpisodeClick = () => {
    // Episode clicked - handled by calendar component
  }

  const handleAnimeClick = (animeId: string) => {
    const episode = episodes.find((ep) => ep.animeId === animeId)
    const slug = episode?.animeSlug
    if (slug) {
      window.location.href = `/anime/${slug}`
    }
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
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '500ms' }}></div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-6 sm:pb-8 relative z-10">
        {/* Simple Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Episode Schedule</h1>
          <p className="text-sm text-gray-400">
            {episodes.length > 0 
              ? `${episodes.length} episode${episodes.length === 1 ? '' : 's'} this week`
              : 'Loading schedule...'}
          </p>
        </div>

        {/* Calendar */}
        <AnimeCalendar
          episodes={episodes}
          onEpisodeClick={handleEpisodeClick}
          onAnimeClick={handleAnimeClick}
          isLoading={isLoading}
        />
      </main>
    </div>
  )
}
