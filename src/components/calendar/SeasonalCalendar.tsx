'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { useToast } from '../ui/toast'
import { 
  Calendar, 
  Star, 
  Eye, 
  Play, 
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Tag,
  Building,
  Film,
  Clock,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '../../app/lib/utils'

interface SeasonalAnime {
  id: string
  title: string
  titleEnglish?: string
  slug: string
  image?: string
  season: 'Winter' | 'Spring' | 'Summer' | 'Fall'
  year: number
  status: 'Airing' | 'Upcoming' | 'Completed'
  episodes: number
  episodesAired?: number
  genres: string[]
  studios: string[]
  score?: number
  popularity: number
  isWatching: boolean
  isCompleted: boolean
  isPlanToWatch: boolean
  airDate?: string
  endDate?: string
  description?: string
}

interface SeasonalCalendarProps {
  anime?: SeasonalAnime[]
  isLoading?: boolean
  onAnimeClick?: (animeId: string) => void
  onStatusChange?: (animeId: string, status: string) => void
  className?: string
}

export function SeasonalCalendar({
  anime = [],
  isLoading = false,
  onAnimeClick,
  onStatusChange,
  className
}: SeasonalCalendarProps) {
  // Calculate current season based on current date
  const getCurrentSeason = (): 'Winter' | 'Spring' | 'Summer' | 'Fall' => {
    const month = new Date().getMonth()
    if (month >= 0 && month <= 2) return 'Winter'
    if (month >= 3 && month <= 5) return 'Spring'
    if (month >= 6 && month <= 8) return 'Summer'
    return 'Fall'
  }

  const [currentSeason, setCurrentSeason] = useState<'Winter' | 'Spring' | 'Summer' | 'Fall'>(getCurrentSeason())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [filterStatus, setFilterStatus] = useState<'all' | 'airing' | 'upcoming' | 'watching'>('all')
  const [sortBy, setSortBy] = useState<'popularity' | 'score' | 'title' | 'airDate'>('popularity')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedStudios, setSelectedStudios] = useState<string[]>([])
  const [expandedFilterSections, setExpandedFilterSections] = useState<Record<string, boolean>>({
    genres: false,
    studios: false,
  })
  const { addToast } = useToast()

  // Use only real anime data
  const displayAnime = anime

  // Extract unique values for filters
  const availableGenres = useMemo(() => {
    const genreSet = new Set<string>()
    displayAnime.forEach(item => {
      if (item.genres && Array.isArray(item.genres)) {
        item.genres.forEach(genre => genreSet.add(genre))
      }
    })
    return Array.from(genreSet).sort()
  }, [displayAnime])

  const availableStudios = useMemo(() => {
    const studios = new Set<string>()
    displayAnime.forEach(item => {
      if (item.studios && Array.isArray(item.studios)) {
        item.studios.forEach(studio => studios.add(studio))
      }
    })
    return Array.from(studios).sort()
  }, [displayAnime])

  const filteredAnime = useMemo(() => {
    let filtered = displayAnime.filter(item => 
      item.season === currentSeason && item.year === currentYear
    )

    // Filter by status
    switch (filterStatus) {
      case 'airing':
        filtered = filtered.filter(item => item.status === 'Airing')
        break
      case 'upcoming':
        filtered = filtered.filter(item => item.status === 'Upcoming')
        break
      case 'watching':
        filtered = filtered.filter(item => item.isWatching)
        break
    }

    // Filter by genres
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(item => 
        item.genres && item.genres.some(genre => selectedGenres.includes(genre))
      )
    }

    // Filter by studios
    if (selectedStudios.length > 0) {
      filtered = filtered.filter(item => 
        item.studios && item.studios.some(studio => selectedStudios.includes(studio))
      )
    }

    // Sort anime
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity
        case 'score':
          return (b.score || 0) - (a.score || 0)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'airDate':
          return new Date(a.airDate || '').getTime() - new Date(b.airDate || '').getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [displayAnime, currentSeason, currentYear, filterStatus, sortBy, selectedGenres, selectedStudios])

  const activeFiltersCount = selectedGenres.length + selectedStudios.length

  const clearFilters = () => {
    setSelectedGenres([])
    setSelectedStudios([])
  }

  const toggleFilter = (type: 'genre' | 'studio', value: string) => {
    if (type === 'genre') {
      setSelectedGenres(prev => 
        prev.includes(value) ? prev.filter(g => g !== value) : [...prev, value]
      )
    } else if (type === 'studio') {
      setSelectedStudios(prev => 
        prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
      )
    }
  }

  const getSeasonInfo = (season: string, year: number) => {
    const seasons = {
      Winter: { months: 'Dec - Feb', color: 'bg-blue-600' },
      Spring: { months: 'Mar - May', color: 'bg-green-600' },
      Summer: { months: 'Jun - Aug', color: 'bg-yellow-600' },
      Fall: { months: 'Sep - Nov', color: 'bg-orange-600' }
    }
    return seasons[season as keyof typeof seasons] || { months: '', color: 'bg-gray-600' }
  }

  const handleSeasonChange = (direction: 'prev' | 'next') => {
    const seasons: Array<'Winter' | 'Spring' | 'Summer' | 'Fall'> = ['Winter', 'Spring', 'Summer', 'Fall']
    const currentIndex = seasons.indexOf(currentSeason)
    
    if (direction === 'next') {
      if (currentIndex === 3) {
        setCurrentSeason('Winter')
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentSeason(seasons[currentIndex + 1] || 'Spring')
      }
    } else {
      if (currentIndex === 0) {
        setCurrentSeason('Fall')
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentSeason(seasons[currentIndex - 1] || 'Winter')
      }
    }
  }

  const handleAnimeClick = (animeId: string, slug: string) => {
    onAnimeClick?.(animeId)
    window.location.href = `/anime/${slug}`
  }

  const handleStatusChange = (animeId: string, newStatus: string) => {
    onStatusChange?.(animeId, newStatus)
    addToast({
      title: 'Status updated',
      description: `Added to ${newStatus.replace('-', ' ')}`,
      variant: 'success',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Airing': return 'bg-green-600'
      case 'Upcoming': return 'bg-blue-600'
      case 'Completed': return 'bg-gray-600'
      default: return 'bg-gray-600'
    }
  }

  if (isLoading) {
    return (
      <Card className={`border-gray-700 bg-gray-800/50 backdrop-blur-sm ${className}`}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            <span className="ml-3 text-gray-300">Loading seasonal anime...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Seasonal Anime</h2>
          <p className="text-sm text-gray-400">Discover anime from {currentSeason} {currentYear}</p>
        </div>

        {/* Season Navigation */}
        <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSeasonChange('prev')}
            className="h-9 w-9 p-0"
            aria-label="Previous season"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
              <Badge className={`${getSeasonInfo(currentSeason, currentYear).color} text-white`}>
                {currentSeason} {currentYear}
              </Badge>
            <span className="text-sm text-gray-400 hidden sm:inline">
                {getSeasonInfo(currentSeason, currentYear).months}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSeasonChange('next')}
            className="h-9 w-9 p-0"
            aria-label="Next season"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
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
            All Anime
          </button>
          <button
            onClick={() => setFilterStatus('airing')}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filterStatus === 'airing'
                ? 'text-white border-b-2 border-violet-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Currently Airing
          </button>
          <button
            onClick={() => setFilterStatus('upcoming')}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              filterStatus === 'upcoming'
                ? 'text-white border-b-2 border-violet-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upcoming
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
          </div>
        )}
      </div>

      {/* Sort Dropdown */}
      <div className="flex justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          aria-label="Sort anime"
            >
              <option value="popularity">Most Popular</option>
              <option value="score">Highest Rated</option>
              <option value="title">Alphabetical</option>
              <option value="airDate">Air Date</option>
            </select>
          </div>

      {/* Anime Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredAnime.map((item) => (
              <div
                key={item.id}
            className="group relative bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/20"
              >
            {/* Anime Image */}
            <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
              {item.image ? (
                  <Image
                  src={item.image}
                    alt={item.title}
                    fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="h-12 w-12 text-gray-600" />
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  {/* Status Badge */}
              <div className="absolute top-2 left-2 z-10">
                <Badge className={`${getStatusColor(item.status)} text-white text-xs font-semibold`}>
                      {item.status}
                    </Badge>
                  </div>
                  
                  {/* Score */}
                  {item.score && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-yellow-600/90 backdrop-blur-sm text-white text-xs font-semibold">
                    <Star className="h-3 w-3 mr-1 fill-white" />
                        {item.score}
                      </Badge>
                    </div>
                  )}
                  
              {/* Watching Badge */}
                      {item.isWatching && (
                <div className="absolute bottom-2 left-2 z-10">
                        <Badge className="bg-green-600 text-white text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Watching
                        </Badge>
                </div>
              )}
                
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                  size="lg"
                  onClick={() => handleAnimeClick(item.id, item.slug)}
                  className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg"
                >
                  <Play className="h-5 w-5 mr-2 fill-white" />
                      View
                    </Button>
              </div>
                </div>
                
            {/* Anime Info */}
            <div className="p-3 sm:p-4 space-y-2">
              {/* Title */}
              <h3 className="font-semibold text-white text-sm sm:text-base line-clamp-2 group-hover:text-violet-400 transition-colors min-h-[2.5rem]">
                      {item.title}
                    </h3>
              
              {/* English Title */}
                  {item.titleEnglish && item.titleEnglish !== item.title && (
                <p className="text-xs text-gray-400 line-clamp-1">
                      {item.titleEnglish}
                    </p>
                  )}
                  
              {/* Episodes & Studios */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{item.episodes} eps</span>
                    {item.episodesAired && (
                  <span className="text-gray-500">• {item.episodesAired} aired</span>
                    )}
                  </div>
                  
              {/* Genres */}
              <div className="flex flex-wrap gap-1">
                {item.genres.slice(0, 2).map((genre, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-700/50 text-gray-300 text-xs border-gray-600">
                        {genre}
                      </Badge>
                    ))}
                </div>
                
              {/* Popularity */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>{item.popularity}%</span>
                </div>
                {item.isPlanToWatch && (
                  <Badge className="bg-blue-600 text-white text-xs">
                    Plan to Watch
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
        {filteredAnime.length === 0 && (
        <div className="text-center py-16">
          <Calendar className="h-20 w-20 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-white mb-2">No anime found</h3>
            <p className="text-gray-400">
              No anime found for {currentSeason} {currentYear} with the current filters.
            </p>
          </div>
        )}
    </div>
  )
}
