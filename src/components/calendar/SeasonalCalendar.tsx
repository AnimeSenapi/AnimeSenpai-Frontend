'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { useToast } from '../ui/toast'
import { 
  Calendar, 
  Star, 
  Eye, 
  Play, 
  Filter,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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
  const [currentSeason, setCurrentSeason] = useState<'Winter' | 'Spring' | 'Summer' | 'Fall'>('Fall')
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterStatus, setFilterStatus] = useState<'all' | 'airing' | 'upcoming' | 'watching'>('all')
  const [sortBy, setSortBy] = useState<'popularity' | 'score' | 'title' | 'airDate'>('popularity')
  const { toast } = useToast()

  // Mock data for demonstration
  const mockAnime: SeasonalAnime[] = useMemo(() => [
    {
      id: 'attack-on-titan-final',
      title: 'Attack on Titan: The Final Season',
      titleEnglish: 'Attack on Titan: The Final Season',
      slug: 'attack-on-titan-final',
      image: '/api/placeholder/300/400',
      season: 'Fall',
      year: 2024,
      status: 'Airing',
      episodes: 12,
      episodesAired: 8,
      genres: ['Action', 'Drama', 'Fantasy'],
      studios: ['MAPPA'],
      score: 9.2,
      popularity: 95,
      isWatching: true,
      isCompleted: false,
      isPlanToWatch: false,
      airDate: '2024-10-01',
      description: 'The epic conclusion to the Attack on Titan series.'
    },
    {
      id: 'demon-slayer-hashira',
      title: 'Demon Slayer: Hashira Training Arc',
      titleEnglish: 'Demon Slayer: Hashira Training Arc',
      slug: 'demon-slayer-hashira',
      image: '/api/placeholder/300/400',
      season: 'Fall',
      year: 2024,
      status: 'Airing',
      episodes: 8,
      episodesAired: 6,
      genres: ['Action', 'Supernatural', 'Historical'],
      studios: ['Ufotable'],
      score: 8.8,
      popularity: 92,
      isWatching: false,
      isCompleted: false,
      isPlanToWatch: true,
      airDate: '2024-10-15',
      description: 'Tanjiro trains with the Hashira to prepare for the final battle.'
    },
    {
      id: 'jujutsu-kaisen-shibuya',
      title: 'Jujutsu Kaisen Season 3',
      titleEnglish: 'Jujutsu Kaisen Season 3',
      slug: 'jujutsu-kaisen-shibuya',
      image: '/api/placeholder/300/400',
      season: 'Fall',
      year: 2024,
      status: 'Airing',
      episodes: 24,
      episodesAired: 12,
      genres: ['Action', 'Supernatural', 'School'],
      studios: ['MAPPA'],
      score: 9.0,
      popularity: 88,
      isWatching: true,
      isCompleted: false,
      isPlanToWatch: false,
      airDate: '2024-09-15',
      description: 'The Shibuya Incident arc continues with intense battles.'
    },
    {
      id: 'one-piece-wano',
      title: 'One Piece: Wano Country Arc',
      titleEnglish: 'One Piece: Wano Country Arc',
      slug: 'one-piece-wano',
      image: '/api/placeholder/300/400',
      season: 'Fall',
      year: 2024,
      status: 'Airing',
      episodes: 50,
      episodesAired: 45,
      genres: ['Action', 'Adventure', 'Comedy'],
      studios: ['Toei Animation'],
      score: 8.5,
      popularity: 85,
      isWatching: false,
      isCompleted: false,
      isPlanToWatch: false,
      airDate: '2024-08-01',
      description: 'Luffy and his crew fight to liberate Wano Country.'
    },
    {
      id: 'spy-x-family-season-2',
      title: 'Spy x Family Season 2',
      titleEnglish: 'Spy x Family Season 2',
      slug: 'spy-x-family-season-2',
      image: '/api/placeholder/300/400',
      season: 'Fall',
      year: 2024,
      status: 'Upcoming',
      episodes: 12,
      genres: ['Action', 'Comedy', 'Family'],
      studios: ['Wit Studio', 'CloverWorks'],
      score: 8.7,
      popularity: 90,
      isWatching: false,
      isCompleted: false,
      isPlanToWatch: true,
      airDate: '2024-11-01',
      description: 'The Forger family returns with more spy missions and family comedy.'
    }
  ], [])

  const displayAnime = anime.length > 0 ? anime : mockAnime

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
  }, [displayAnime, currentSeason, currentYear, filterStatus, sortBy])

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

  const handleAnimeClick = (animeId: string) => {
    onAnimeClick?.(animeId)
  }

  const handleStatusChange = (animeId: string, newStatus: string) => {
    onStatusChange?.(animeId, newStatus)
    toast({
      title: 'Status updated',
      message: `Added to ${newStatus.replace('-', ' ')}`,
      type: 'success',
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
    <Card className={`border-gray-700 bg-gray-800/50 backdrop-blur-sm ${className}`}>
      <CardHeader className="border-b border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl text-white">
            <Calendar className="h-6 w-6 text-violet-400" />
            Seasonal Calendar
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Season Navigation */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSeasonChange('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-3">
              <Badge className={`${getSeasonInfo(currentSeason, currentYear).color} text-white`}>
                {currentSeason} {currentYear}
              </Badge>
              <span className="text-sm text-gray-400">
                {getSeasonInfo(currentSeason, currentYear).months}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSeasonChange('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All Anime</option>
              <option value="airing">Currently Airing</option>
              <option value="upcoming">Upcoming</option>
              <option value="watching">Watching</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="popularity">Most Popular</option>
              <option value="score">Highest Rated</option>
              <option value="title">Alphabetical</option>
              <option value="airDate">Air Date</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAnime.map((item) => (
              <div
                key={item.id}
                className="group relative bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-all duration-300 hover:scale-105"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={item.image || '/api/placeholder/300/400'}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className={`${getStatusColor(item.status)} text-white text-xs`}>
                      {item.status}
                    </Badge>
                  </div>
                  
                  {/* Score */}
                  {item.score && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-yellow-600 text-white text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {item.score}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Progress for airing anime */}
                  {item.status === 'Airing' && item.episodesAired && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                      <div className="flex items-center justify-between text-xs text-white mb-1">
                        <span>Progress</span>
                        <span>{item.episodesAired}/{item.episodes}</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-1">
                        <div 
                          className="bg-violet-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${(item.episodesAired / item.episodes) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  {item.titleEnglish && item.titleEnglish !== item.title && (
                    <p className="text-xs text-gray-400 mb-2 line-clamp-1">
                      {item.titleEnglish}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.genres.slice(0, 2).map((genre, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-600 text-gray-300 text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.isWatching && (
                        <Badge className="bg-green-600 text-white text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Watching
                        </Badge>
                      )}
                      {item.isPlanToWatch && (
                        <Badge className="bg-blue-600 text-white text-xs">
                          Plan to Watch
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{item.popularity}%</span>
                    </div>
                  </div>
                </div>
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAnimeClick(item.id)}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {!item.isWatching && !item.isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(item.id, 'watching')}
                        className="border-white text-white hover:bg-white hover:text-black"
                      >
                        Add to List
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnime.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <div className="relative w-16 h-20 flex-shrink-0">
                  <Image
                    src={item.image || '/api/placeholder/300/400'}
                    alt={item.title}
                    fill
                    className="object-cover rounded"
                  />
                  {item.isWatching && (
                    <Badge className="absolute -top-1 -right-1 bg-green-600 text-white text-xs">
                      <Eye className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {item.title}
                    </h3>
                    <Badge className={`${getStatusColor(item.status)} text-white text-xs`}>
                      {item.status}
                    </Badge>
                    {item.score && (
                      <Badge className="bg-yellow-600 text-white text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {item.score}
                      </Badge>
                    )}
                  </div>
                  
                  {item.titleEnglish && item.titleEnglish !== item.title && (
                    <p className="text-sm text-gray-400 mb-2 truncate">
                      {item.titleEnglish}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{item.episodes} episodes</span>
                    {item.episodesAired && (
                      <span>{item.episodesAired} aired</span>
                    )}
                    <span>{item.studios.join(', ')}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.genres.slice(0, 3).map((genre, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-600 text-gray-300 text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">{item.popularity}%</span>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleAnimeClick(item.id)}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredAnime.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-semibold text-white mb-2">No anime found</h3>
            <p className="text-gray-400">
              No anime found for {currentSeason} {currentYear} with the current filters.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
