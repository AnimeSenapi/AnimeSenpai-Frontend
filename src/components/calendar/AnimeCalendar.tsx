'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { useToast } from '../ui/toast'
import { 
  Calendar, 
  Clock, 
  Play, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Tag,
  Building,
  Film,
  Star as StarIcon,
  Search,
  Table,
  List
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '../../app/lib/utils'
import { EpisodeCard } from './EpisodeCard'
import { EpisodeCardSkeleton } from './EpisodeCardSkeleton'
import { EpisodeDetailsModal } from './EpisodeDetailsModal'

interface Episode {
  id: string
  animeId: string
  animeTitle: string
  animeSlug: string
  animeImage?: string
  episodeNumber: number
  title?: string
  airDate: string
  airTime: string
  duration?: number
  isNewEpisode: boolean
  isWatching: boolean
  isCompleted: boolean
  studio?: string
  season?: string
  year?: number
  genres?: string[]
  type?: string
}

interface AnimeCalendarProps {
  episodes?: Episode[]
  isLoading?: boolean
  onEpisodeClick?: (episode: Episode) => void
  onAnimeClick?: (animeId: string) => void
  className?: string
}

export function AnimeCalendar({
  episodes = [],
  isLoading = false,
  onEpisodeClick,
  onAnimeClick,
  className
}: AnimeCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Sort episodes by time
  const sortedEpisodes = useMemo(() => {
    return [...episodes].sort((a, b) => {
      return new Date(a.airDate + 'T' + a.airTime).getTime() - new Date(b.airDate + 'T' + b.airTime).getTime()
    })
  }, [episodes])

  const episodesByDate = useMemo(() => {
    const grouped: Record<string, Episode[]> = {}
    
    sortedEpisodes.forEach(episode => {
      const date = episode.airDate
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(episode)
    })

    return grouped
  }, [sortedEpisodes])

  // Get current week (Sunday to Saturday)
  const getCurrentWeek = () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Sunday
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // Saturday
    endOfWeek.setHours(23, 59, 59, 999)
    
    return { start: startOfWeek, end: endOfWeek }
  }

  const getWeekDates = () => {
    const { start } = getCurrentWeek()
    const dates = []
    const current = new Date(start)

    // Adjust to show the week starting from the currentDate's week
    const weekStart = new Date(currentDate)
    weekStart.setDate(currentDate.getDate() - currentDate.getDay())
    weekStart.setHours(0, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      dates.push(date)
    }

    return dates
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours || '0')
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
    
    // Smooth scroll to top when changing weeks
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const goToThisWeek = () => {
    setCurrentDate(new Date())
  }

  const handleEpisodeClick = (episode: Episode) => {
    setSelectedEpisode(episode)
    setShowEpisodeModal(true)
    onEpisodeClick?.(episode)
  }

  const handleAnimeClick = (e: React.MouseEvent, animeId: string, animeSlug: string) => {
    e.stopPropagation()
    onAnimeClick?.(animeId)
    window.location.href = `/anime/${animeSlug}`
  }

  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [showEpisodeModal, setShowEpisodeModal] = useState(false)
  
  // Load view mode from localStorage
  const [viewMode, setViewMode] = useState<'table' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calendar-view-mode')
      return (saved === 'table' || saved === 'list') ? saved : 'table'
    }
    return 'table'
  })

  // Save view mode to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('calendar-view-mode', viewMode)
    }
  }, [viewMode])

  // Ref for today's column (will be used after weekDates is defined)
  const todayColumnRef = useRef<HTMLDivElement | null>(null)

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA' || 
          document.activeElement?.tagName === 'SELECT' ||
          (document.activeElement as HTMLElement)?.isContentEditable) {
        return
      }

      // Keyboard shortcuts
      // Removed filter/search shortcuts
      if (false) {
        // Placeholder
      } else if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setCurrentDate(new Date())
      } else if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setShowKeyboardHelp(prev => !prev)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() - 7)
        setCurrentDate(newDate)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() + 7)
        setCurrentDate(newDate)
      } else if (e.key === 'Home') {
        e.preventDefault()
        setCurrentDate(new Date())
      } else if (e.key === 'Escape') {
        setShowKeyboardHelp(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentDate])

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className} animate-in fade-in duration-300`}>
            {/* Header Skeleton */}
            <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl glass" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
              <div className="flex gap-2">
            <Skeleton className="h-9 w-24 glass rounded-lg" />
            <Skeleton className="h-9 w-24 glass rounded-lg" />
            <Skeleton className="h-9 w-24 glass rounded-lg" />
              </div>
            </div>
            
            {/* Episode Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <EpisodeCardSkeleton key={i} variant="detailed" />
              ))}
            </div>
          </div>
    )
  }

  const weekDates = getWeekDates()
  const firstDate = weekDates[0]
  const lastDate = weekDates[6]
  const isCurrentWeek = firstDate && lastDate && firstDate.getTime() <= new Date().getTime() && lastDate.getTime() >= new Date().getTime()
  const isToday = weekDates.some(date => date.toDateString() === new Date().toDateString())

  // Auto-scroll to today's column on mobile/tablet
  useEffect(() => {
    if (todayColumnRef.current && window.innerWidth < 1024) {
      // Small delay to ensure layout is complete
      setTimeout(() => {
        todayColumnRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'center'
        })
      }, 100)
    }
  }, [weekDates])

  // Smooth scroll to today on mount if viewing current week
  useEffect(() => {
    if (isCurrentWeek && !isLoading) {
      const todayElement = document.querySelector('[data-date-today="true"]')
      if (todayElement) {
        setTimeout(() => {
          todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
      }
    }
  }, [isCurrentWeek, isLoading])

  return (
    <div className={`space-y-6 ${className} relative`}>
      {/* Keyboard Help Modal */}
        {showKeyboardHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowKeyboardHelp(false)}>
            <div className="glass border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Keyboard Shortcuts</h3>
            <Button
                variant="ghost"
              size="sm"
                onClick={() => setShowKeyboardHelp(false)}
                className="h-8 w-8 p-0"
            >
                <X className="h-4 w-4" />
            </Button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Navigate dates</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-white">← →</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Go to today</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-white">T</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Show shortcuts</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-white">?</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Close modals</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-white">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back to Today Floating Button */}
      {!isCurrentWeek && (
        <Button
          onClick={goToToday}
          className="fixed bottom-8 right-8 z-40 rounded-full h-12 w-12 shadow-lg bg-violet-600 hover:bg-violet-700 text-white"
          aria-label="Go to today"
        >
          <Calendar className="h-5 w-5" />
        </Button>
      )}

      {/* Episode Details Modal */}
      <EpisodeDetailsModal
        episode={selectedEpisode}
        isOpen={showEpisodeModal}
        onClose={() => {
          setShowEpisodeModal(false)
          setSelectedEpisode(null)
        }}
        onAnimeClick={onAnimeClick}
      />

      {/* Week Calendar Layout - AnimeSenpai Style */}
      {viewMode === 'table' ? (
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          {/* Desktop Table View (lg and above) */}
          <div className="hidden lg:block overflow-x-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 240px)' }}>
            <div className="min-w-full inline-block">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-20 glass border-b-2 border-white/10 backdrop-blur-md">
                  <tr>
                    {weekDates.map((date) => {
                      const dateStr = date.toISOString().split('T')[0] || ''
                      const dayEpisodes = episodesByDate[dateStr] || []
                      const isToday = date.toDateString() === new Date().toDateString()
                      
                      return (
                        <th
                          key={dateStr}
                          className={cn(
                            'px-4 py-4 text-left align-top w-[220px] transition-all',
                            isToday 
                              ? 'bg-gradient-to-b from-primary-500/20 via-primary-500/10 to-transparent border-b-2 border-primary-500/50' 
                              : 'bg-white/5 hover:bg-white/10 transition-colors'
                          )}
                          data-date-today={isToday ? 'true' : undefined}
                        >
                          <div className={cn(
                            'flex flex-col gap-2',
                            isToday && 'text-white'
                          )}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm uppercase tracking-wide text-white">
                                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                                {isToday && (
                                  <Badge className="bg-primary-500 text-white text-[10px] px-2 py-0.5 h-5 font-bold uppercase shadow-lg">
                                    Today
                                  </Badge>
                                )}
                              </div>
                              {dayEpisodes.length > 0 && (
                                <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5 font-semibold bg-white/10 text-gray-200 border border-white/20">
                                  {dayEpisodes.length}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 font-medium">
                              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {weekDates.map((date) => {
                      const dateStr = date.toISOString().split('T')[0] || ''
                      const dayEpisodes = episodesByDate[dateStr] || []
                      const isToday = date.toDateString() === new Date().toDateString()
                      
                      if (dayEpisodes.length === 0) {
                        return <td key={dateStr} className="px-4 py-6 bg-white/5"></td>
                      }
                      
                      return (
                        <td
                          key={dateStr}
                          className={cn(
                            'px-4 py-4 align-top border-r border-white/10 last:border-r-0',
                            isToday ? 'bg-primary-500/5' : 'bg-white/5'
                          )}
                        >
                          {dayEpisodes.length > 0 ? (
                            <div className="space-y-2.5 overflow-y-auto custom-scrollbar pr-2" style={{ maxHeight: 'calc(100vh - 380px)' }}>
                              {dayEpisodes.map((episode) => (
                                <EpisodeCard
                                  key={episode.id}
                                  episode={episode}
                                  onEpisodeClick={handleEpisodeClick}
                                  onAnimeClick={(animeId) => {
                                    const ep = dayEpisodes.find(e => e.animeId === animeId)
                                    if (ep) {
                                      handleAnimeClick({} as React.MouseEvent, animeId, ep.animeSlug)
                                    }
                                  }}
                                  onMarkWatched={(ep) => {
                                    handleEpisodeClick(ep)
                                  }}
                                  variant="minimal"
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <Calendar className="h-8 w-8 mx-auto mb-3 text-gray-700 opacity-50" />
                              <p className="text-sm text-gray-500 font-medium">No episodes</p>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tablet & Mobile View - Horizontal Scrolling (like Crunchyroll) */}
          <div className="lg:hidden">
            {/* Horizontal Scrollable Calendar */}
            <div className="overflow-x-auto custom-scrollbar pb-2 -mx-3 sm:-mx-4 px-3 sm:px-4 calendar-horizontal-scroll" style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}>
              <div className="flex gap-3 sm:gap-4 min-w-max">
                {weekDates.map((date) => {
                  const dateStr = date.toISOString().split('T')[0] || ''
                  const dayEpisodes = episodesByDate[dateStr] || []
                  const isToday = date.toDateString() === new Date().toDateString()
                  
                  if (dayEpisodes.length === 0) {
                    return null
                  }
                  
                  return (
                    <div 
                      key={dateStr}
                      ref={isToday ? todayColumnRef : null}
                      className={cn(
                        'flex-shrink-0 w-[85vw] sm:w-[400px] md:w-[450px] glass rounded-2xl border overflow-hidden transition-all',
                        isToday ? 'border-primary-500/50 shadow-lg shadow-primary-500/20' : 'border-white/10'
                      )}
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      {/* Day Header */}
                      <div className={cn(
                        'px-4 py-3 border-b backdrop-blur-sm',
                        isToday 
                          ? 'bg-gradient-to-r from-primary-500/20 to-primary-500/10 border-primary-500/30' 
                          : 'bg-white/5 border-white/10'
                      )}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'font-bold text-sm sm:text-base uppercase tracking-wide',
                              isToday ? 'text-primary-400' : 'text-white'
                            )}>
                              {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            {isToday && (
                              <Badge className="bg-primary-500 text-white text-[10px] px-2 py-0.5 h-5 font-bold uppercase">
                                Today
                              </Badge>
                            )}
                          </div>
                          {dayEpisodes.length > 0 && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5 font-semibold bg-white/10 text-gray-200 border border-white/20">
                              {dayEpisodes.length}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 font-medium">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      {/* Episodes List - Scrollable */}
                      <div className="p-3 sm:p-4 space-y-2.5 max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
                        {dayEpisodes.length > 0 ? (
                          dayEpisodes.map((episode) => (
                            <EpisodeCard
                              key={episode.id}
                              episode={episode}
                              onEpisodeClick={handleEpisodeClick}
                              onAnimeClick={(animeId) => {
                                const ep = dayEpisodes.find(e => e.animeId === animeId)
                                if (ep) {
                                  handleAnimeClick({} as React.MouseEvent, animeId, ep.animeSlug)
                                }
                              }}
                              onMarkWatched={(ep) => {
                                handleEpisodeClick(ep)
                              }}
                              variant="minimal"
                            />
                          ))
                        ) : (
                          <div className="text-center py-8 sm:py-10">
                            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-gray-700 opacity-50" />
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">No episodes</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Scroll Indicator */}
            <div className="mt-3 flex justify-center gap-1.5">
              {weekDates.map((date, index) => {
                const dateStr = date.toISOString().split('T')[0] || ''
                const dayEpisodes = episodesByDate[dateStr] || []
                const isToday = date.toDateString() === new Date().toDateString()
                
                return (
                  <div
                    key={dateStr}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      isToday 
                        ? 'w-6 bg-primary-500' 
                        : 'w-1.5 bg-white/20'
                    )}
                  />
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {weekDates.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0] || ''
            const dayEpisodes = episodesByDate[dateStr] || []
            const isToday = date.toDateString() === new Date().toDateString()
            
            return (
              <div key={dateStr} className="space-y-4">
                {/* Day Header */}
                <div className="flex items-center gap-3 mb-2" data-date-today={isToday ? 'true' : undefined}>
                  <div className={cn(
                    'glass flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-300',
                    isToday 
                      ? 'bg-primary-500/20 backdrop-blur-md border-primary-500/50 text-white ring-2 ring-primary-400/50 shadow-lg shadow-primary-500/30' 
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all'
                  )}>
                    <Calendar className={cn(
                      'h-5 w-5',
                      isToday ? 'text-white' : 'text-gray-400'
                    )} />
                    <span className="font-semibold text-base sm:text-lg">
                    {date.toLocaleDateString('en-US', { weekday: 'long' })}
                  </span>
                    <span className="text-sm sm:text-base opacity-90">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                  {isToday && (
                      <Badge className="bg-white/30 text-white text-xs font-semibold ml-2 px-2 py-0.5 border-white/20">
                      Today
                            </Badge>
                          )}
                </div>
                {dayEpisodes.length > 0 && (
                  <Badge variant="secondary" className={cn(
                      'glass px-3 py-1.5 text-sm font-medium',
                      isToday 
                        ? 'bg-white/20 text-white border-white/30' 
                        : 'bg-white/5 text-gray-300 border-white/10'
                  )}>
                    {dayEpisodes.length} {dayEpisodes.length === 1 ? 'episode' : 'episodes'}
                  </Badge>
                )}
                </div>
                
                {/* Visual divider between days */}
                {index < weekDates.length - 1 && (
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent my-2" />
                )}
                
              {/* Episodes Grid */}
              {dayEpisodes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {dayEpisodes.map((episode) => (
                    <EpisodeCard
                      key={episode.id}
                      episode={episode}
                      onEpisodeClick={handleEpisodeClick}
                      onAnimeClick={(animeId) => {
                        const ep = dayEpisodes.find(e => e.animeId === animeId)
                        if (ep) {
                          handleAnimeClick({} as React.MouseEvent, animeId, ep.animeSlug)
                        }
                      }}
                      onMarkWatched={(ep) => {
                        handleEpisodeClick(ep)
                      }}
                      variant="detailed"
                    />
                  ))}
                </div>
              ) : (
                  <div className="text-center py-16 glass rounded-xl border border-white/10">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="absolute inset-0 bg-violet-500/10 rounded-full animate-pulse" />
                      <Calendar className="h-12 w-12 mx-auto mt-4 text-gray-500" />
              </div>
                    <p className="text-sm text-gray-400">No episodes scheduled for this day</p>
          </div>
        )}
            </div>
          )
        })}
      </div>
      )}

      {/* Empty State */}
        {sortedEpisodes.length === 0 && (
          <div className="text-center py-20 glass rounded-2xl border border-white/10 p-8 animate-in fade-in duration-500">
            <div className="relative w-40 h-40 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full animate-pulse blur-xl" />
              <div className="absolute inset-0 bg-violet-500/10 rounded-full animate-pulse" />
              <Calendar className="h-24 w-24 mx-auto mt-8 text-gray-500 relative z-10" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No episodes scheduled</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              No anime episodes are scheduled for this time period.
            </p>
          </div>
        )}
    </div>
  )
}
