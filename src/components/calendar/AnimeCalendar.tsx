'use client'

import { useState, useEffect, useMemo } from 'react'
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
  Search
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
  const [filterStatus, setFilterStatus] = useState<'all' | 'watching' | 'new'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedStudios, setSelectedStudios] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [expandedFilterSections, setExpandedFilterSections] = useState<Record<string, boolean>>({
    genres: false,
    studios: false,
    types: false,
  })
  const { addToast } = useToast()

  // Load filters from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFilters = localStorage.getItem('calendar-filters')
      if (savedFilters) {
        try {
          const parsed = JSON.parse(savedFilters)
          setSelectedGenres(parsed.genres || [])
          setSelectedStudios(parsed.studios || [])
          setSelectedTypes(parsed.types || [])
          setFilterStatus(parsed.status || 'all')
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [])

  // Save filters to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('calendar-filters', JSON.stringify({
        genres: selectedGenres,
        studios: selectedStudios,
        types: selectedTypes,
        status: filterStatus,
      }))
    }
  }, [selectedGenres, selectedStudios, selectedTypes, filterStatus])

  // Use only real episodes data
  const displayEpisodes = episodes

  // Extract unique values for filters
  const availableGenres = useMemo(() => {
    const genreSet = new Set<string>()
    episodes.forEach(ep => {
      if (ep.genres && Array.isArray(ep.genres)) {
        ep.genres.forEach(genre => genreSet.add(genre))
      }
    })
    return Array.from(genreSet).sort()
  }, [episodes])

  const availableStudios = useMemo(() => {
    const studios = new Set<string>()
    episodes.forEach(ep => {
      if (ep.studio) {
        studios.add(ep.studio)
      }
    })
    return Array.from(studios).sort()
  }, [episodes])

  const availableTypes = useMemo(() => {
    const types = new Set<string>()
    episodes.forEach(ep => {
      if (ep.type) {
        types.add(ep.type)
      }
    })
    return Array.from(types).sort()
  }, [episodes])

  const filteredEpisodes = useMemo(() => {
    let filtered = displayEpisodes

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(ep => 
        ep.animeTitle.toLowerCase().includes(query) ||
        ep.title?.toLowerCase().includes(query) ||
        ep.animeSlug.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (filterStatus === 'watching') {
      filtered = filtered.filter(ep => ep.isWatching)
    } else if (filterStatus === 'new') {
      filtered = filtered.filter(ep => ep.isNewEpisode)
    }

    // Filter by genres
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(ep => 
        ep.genres && ep.genres.some(genre => selectedGenres.includes(genre))
      )
    }

    // Filter by studios
    if (selectedStudios.length > 0) {
      filtered = filtered.filter(ep => ep.studio && selectedStudios.includes(ep.studio))
    }

    // Filter by types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(ep => ep.type && selectedTypes.includes(ep.type))
    }

    // Sort by time
    filtered.sort((a, b) => {
          return new Date(a.airDate + 'T' + a.airTime).getTime() - new Date(b.airDate + 'T' + b.airTime).getTime()
    })

    return filtered
  }, [displayEpisodes, searchQuery, filterStatus, selectedGenres, selectedStudios, selectedTypes])

  const activeFiltersCount = selectedGenres.length + selectedStudios.length + selectedTypes.length + (searchQuery.trim() ? 1 : 0)

  const clearFilters = () => {
    setSelectedGenres([])
    setSelectedStudios([])
    setSelectedTypes([])
    setSearchQuery('')
  }

  const toggleFilter = (type: 'genre' | 'studio' | 'type', value: string) => {
    if (type === 'genre') {
      setSelectedGenres(prev => 
        prev.includes(value) ? prev.filter(g => g !== value) : [...prev, value]
      )
    } else if (type === 'studio') {
      setSelectedStudios(prev => 
        prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
      )
    } else if (type === 'type') {
      setSelectedTypes(prev => 
        prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
      )
    }
  }

  const episodesByDate = useMemo(() => {
    const grouped: Record<string, Episode[]> = {}
    
    filteredEpisodes.forEach(episode => {
      const date = episode.airDate
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(episode)
    })

    return grouped
  }, [filteredEpisodes])

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
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        // Focus search if available, otherwise do nothing
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      } else if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setShowFilters(prev => !prev)
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
        setShowFilters(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentDate])

  if (isLoading) {
    return (
      <Card className={`border-gray-700 bg-gray-800/50 backdrop-blur-sm ${className}`}>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
            
            {/* Episode Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <EpisodeCardSkeleton key={i} variant="detailed" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const weekDates = getWeekDates()
  const firstDate = weekDates[0]
  const lastDate = weekDates[6]
  const isCurrentWeek = firstDate && lastDate && firstDate.getTime() <= new Date().getTime() && lastDate.getTime() >= new Date().getTime()
  const isToday = weekDates.some(date => date.toDateString() === new Date().toDateString())

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
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
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
                <span className="text-gray-300">Toggle filters</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-white">F</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Focus search</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-white">/</kbd>
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
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <span>Calendar</span>
        <span>/</span>
        <span className="text-white">
          {firstDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {lastDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Episode Schedule</h2>
          <p className="text-sm text-gray-400">
            {filteredEpisodes.length > 0 
              ? `${filteredEpisodes.length} episode${filteredEpisodes.length === 1 ? '' : 's'} scheduled`
              : 'No episodes scheduled'}
          </p>
        </div>

          <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToThisWeek}
            className={isCurrentWeek ? 'bg-violet-600 border-violet-500 text-white hover:bg-violet-700' : ''}
          >
            This Week
          </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateChange('prev')}
            className="h-9 w-9 p-0"
            aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateChange('next')}
            className="h-9 w-9 p-0"
            aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search episodes by anime title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setSearchQuery('')
            }
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs & Advanced Filters */}
      <div className="space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-700 pb-2 overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filterStatus === 'all'
                ? 'text-white border-b-2 border-violet-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Episodes
          </button>
          <button
            onClick={() => setFilterStatus('watching')}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filterStatus === 'watching'
                ? 'text-white border-b-2 border-violet-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Watching
          </button>
          <button
            onClick={() => setFilterStatus('new')}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filterStatus === 'new'
                ? 'text-white border-b-2 border-violet-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            New Episodes
          </button>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="bg-violet-600 text-white text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-400 hover:text-white text-xs"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Active Filter Pills */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge
                className="bg-orange-500/20 text-orange-300 border-orange-500/30 pr-1 cursor-pointer hover:bg-orange-500/30 transition-colors"
                onClick={() => setSearchQuery('')}
              >
                Search: {searchQuery}
                <X className="w-3 h-3 ml-1 inline" />
              </Badge>
            )}
            {selectedGenres.map((genre) => (
              <Badge
                key={genre}
                className="bg-purple-500/20 text-purple-300 border-purple-500/30 pr-1 cursor-pointer hover:bg-purple-500/30 transition-colors"
                onClick={() => toggleFilter('genre', genre)}
              >
                {genre}
                <X className="w-3 h-3 ml-1 inline" />
              </Badge>
            ))}
            {selectedStudios.map((studio) => (
              <Badge
                key={studio}
                className="bg-blue-500/20 text-blue-300 border-blue-500/30 pr-1 cursor-pointer hover:bg-blue-500/30 transition-colors"
                onClick={() => toggleFilter('studio', studio)}
              >
                {studio}
                <X className="w-3 h-3 ml-1 inline" />
              </Badge>
            ))}
            {selectedTypes.map((type) => (
              <Badge
                key={type}
                className="bg-green-500/20 text-green-300 border-green-500/30 pr-1 cursor-pointer hover:bg-green-500/30 transition-colors"
                onClick={() => toggleFilter('type', type)}
              >
                {type}
                <X className="w-3 h-3 ml-1 inline" />
              </Badge>
            ))}
          </div>
        )}

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 space-y-3">
            {/* Genres Filter */}
            {availableGenres.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setExpandedFilterSections(prev => ({ ...prev, genres: !prev.genres }))}
                  className="w-full flex items-center justify-between text-white hover:text-violet-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span className="font-medium text-sm">Genres</span>
                    {selectedGenres.length > 0 && (
                      <Badge className="bg-violet-500 text-white text-[10px] px-1.5 py-0.5">
                        {selectedGenres.length}
                      </Badge>
                    )}
                  </div>
                  {expandedFilterSections.genres ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {expandedFilterSections.genres && (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pl-6">
                    {availableGenres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => toggleFilter('genre', genre)}
                        className={cn(
                          'w-full text-left px-3 py-1.5 rounded-md text-xs transition-all',
                          selectedGenres.includes(genre)
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                            : 'text-gray-300 hover:bg-white/5 border border-transparent hover:border-white/10'
                        )}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Studios Filter */}
            {availableStudios.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setExpandedFilterSections(prev => ({ ...prev, studios: !prev.studios }))}
                  className="w-full flex items-center justify-between text-white hover:text-violet-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span className="font-medium text-sm">Studios</span>
                    {selectedStudios.length > 0 && (
                      <Badge className="bg-violet-500 text-white text-[10px] px-1.5 py-0.5">
                        {selectedStudios.length}
                      </Badge>
                    )}
                  </div>
                  {expandedFilterSections.studios ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {expandedFilterSections.studios && (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pl-6">
                    {availableStudios.map((studio) => (
                      <button
                        key={studio}
                        onClick={() => toggleFilter('studio', studio)}
                        className={cn(
                          'w-full text-left px-3 py-1.5 rounded-md text-xs transition-all',
                          selectedStudios.includes(studio)
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                            : 'text-gray-300 hover:bg-white/5 border border-transparent hover:border-white/10'
                        )}
                      >
                        {studio}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Type Filter */}
            {availableTypes.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setExpandedFilterSections(prev => ({ ...prev, types: !prev.types }))}
                  className="w-full flex items-center justify-between text-white hover:text-violet-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    <span className="font-medium text-sm">Type</span>
                    {selectedTypes.length > 0 && (
                      <Badge className="bg-violet-500 text-white text-[10px] px-1.5 py-0.5">
                        {selectedTypes.length}
                      </Badge>
                    )}
                  </div>
                  {expandedFilterSections.types ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {expandedFilterSections.types && (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pl-6">
                    {availableTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleFilter('type', type)}
                        className={cn(
                          'w-full text-left px-3 py-1.5 rounded-md text-xs transition-all',
                          selectedTypes.includes(type)
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                            : 'text-gray-300 hover:bg-white/5 border border-transparent hover:border-white/10'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        </div>

      {/* Week Calendar Grid */}
      <div className="space-y-6">
        {weekDates.map((date) => {
              const dateStr = date.toISOString().split('T')[0] || ''
              const dayEpisodes = episodesByDate[dateStr] || []
              const isToday = date.toDateString() === new Date().toDateString()
          
          if (dayEpisodes.length === 0 && filterStatus !== 'all') {
            return null
          }
              
              return (
            <div key={dateStr} className="space-y-4">
              {/* Day Header */}
              <div className="flex items-center gap-3" data-date-today={isToday ? 'true' : undefined}>
                <div className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                  isToday 
                    ? 'bg-violet-600 text-white ring-2 ring-violet-400 shadow-lg shadow-violet-500/20' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                )}>
                  <Calendar className="h-4 w-4" />
                  <span className="font-semibold text-sm sm:text-base">
                    {date.toLocaleDateString('en-US', { weekday: 'long' })}
                  </span>
                  <span className="text-sm sm:text-base">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                  {isToday && (
                    <Badge className="bg-white/20 text-white text-xs ml-2">
                      Today
                            </Badge>
                          )}
                </div>
                {dayEpisodes.length > 0 && (
                  <Badge variant="secondary" className={cn(
                    'bg-gray-700 text-gray-300',
                    isToday && 'bg-white/20 text-white'
                  )}>
                    {dayEpisodes.length} {dayEpisodes.length === 1 ? 'episode' : 'episodes'}
                  </Badge>
                )}
                </div>
                
              {/* Episodes Grid */}
              {dayEpisodes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                        // Refresh episodes after marking as watched
                        handleEpisodeClick(ep)
                      }}
                      variant="detailed"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="relative w-16 h-16 mx-auto mb-3">
                    <div className="absolute inset-0 bg-gray-700/20 rounded-full" />
                    <Calendar className="h-12 w-12 mx-auto mt-2 opacity-50" />
              </div>
                  <p className="text-sm">No episodes scheduled for this day</p>
          </div>
        )}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
        {filteredEpisodes.length === 0 && (
        <div className="text-center py-16">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-violet-500/10 rounded-full animate-pulse" />
            <Calendar className="h-20 w-20 mx-auto mt-6 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No episodes scheduled</h3>
            <p className="text-gray-400 mb-4">
              {activeFiltersCount > 0 
                ? 'No episodes match your current filters. Try adjusting your filters.'
                : 'No anime episodes are scheduled for this time period.'}
            </p>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
    </div>
  )
}
