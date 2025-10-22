'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { useToast } from '../ui/toast'
import { 
  Calendar, 
  Clock, 
  Play, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Grid3X3,
  List,
  Star,
  Eye,
  Loader2
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [filterStatus, setFilterStatus] = useState<'all' | 'watching' | 'new'>('all')
  const [sortBy, setSortBy] = useState<'time' | 'anime' | 'episode'>('time')
  const { toast } = useToast()

  // Mock data for demonstration
  const mockEpisodes: Episode[] = useMemo(() => [
    {
      id: '1',
      animeId: 'attack-on-titan',
      animeTitle: 'Attack on Titan',
      animeSlug: 'attack-on-titan',
      animeImage: '/api/placeholder/300/400',
      episodeNumber: 25,
      title: 'The Final Season Part 3',
      airDate: new Date().toISOString().split('T')[0] || '2024-01-15',
      airTime: '14:00',
      duration: 24,
      isNewEpisode: true,
      isWatching: true,
      isCompleted: false,
      studio: 'MAPPA',
      season: 'Winter 2024',
      year: 2024
    },
    {
      id: '2',
      animeId: 'demon-slayer',
      animeTitle: 'Demon Slayer',
      animeSlug: 'demon-slayer',
      animeImage: '/api/placeholder/300/400',
      episodeNumber: 12,
      title: 'Hashira Training Arc',
      airDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '2024-01-16',
      airTime: '15:30',
      duration: 23,
      isNewEpisode: false,
      isWatching: true,
      isCompleted: false,
      studio: 'Ufotable',
      season: 'Spring 2024',
      year: 2024
    },
    {
      id: '3',
      animeId: 'jujutsu-kaisen',
      animeTitle: 'Jujutsu Kaisen',
      animeSlug: 'jujutsu-kaisen',
      animeImage: '/api/placeholder/300/400',
      episodeNumber: 8,
      title: 'Shibuya Incident',
      airDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '2024-01-17',
      airTime: '16:00',
      duration: 24,
      isNewEpisode: true,
      isWatching: false,
      isCompleted: false,
      studio: 'MAPPA',
      season: 'Fall 2024',
      year: 2024
    }
  ], [])

  const displayEpisodes = episodes.length > 0 ? episodes : mockEpisodes

  const filteredEpisodes = useMemo(() => {
    let filtered = displayEpisodes

    // Filter by status
    if (filterStatus === 'watching') {
      filtered = filtered.filter(ep => ep.isWatching)
    } else if (filterStatus === 'new') {
      filtered = filtered.filter(ep => ep.isNewEpisode)
    }

    // Sort episodes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return new Date(a.airDate + 'T' + a.airTime).getTime() - new Date(b.airDate + 'T' + b.airTime).getTime()
        case 'anime':
          return a.animeTitle.localeCompare(b.animeTitle)
        case 'episode':
          return a.episodeNumber - b.episodeNumber
        default:
          return 0
      }
    })

    return filtered
  }, [displayEpisodes, filterStatus, sortBy])

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

  const getDateRange = () => {
    if (viewMode === 'week') {
      const start = new Date(currentDate)
      start.setDate(start.getDate() - start.getDay())
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      return { start, end }
    } else {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      return { start, end }
    }
  }

  const getDatesInRange = () => {
    const { start, end } = getDateRange()
    const dates = []
    const current = new Date(start)

    while (current <= end) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
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
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const handleEpisodeClick = (episode: Episode) => {
    onEpisodeClick?.(episode)
    toast({
      title: 'Episode clicked',
      message: `${episode.animeTitle} Episode ${episode.episodeNumber}`,
      type: 'info',
    })
  }

  const handleAnimeClick = (animeId: string) => {
    onAnimeClick?.(animeId)
  }

  if (isLoading) {
    return (
      <Card className={`border-gray-700 bg-gray-800/50 backdrop-blur-sm ${className}`}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            <span className="ml-3 text-gray-300">Loading calendar...</span>
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
            Anime Calendar
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="h-8"
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="h-8"
            >
              Month
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateChange('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold text-white min-w-0">
              {viewMode === 'week' 
                ? `Week of ${getDateRange().start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
                : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              }
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateChange('next')}
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
              <option value="all">All Episodes</option>
              <option value="watching">Watching</option>
              <option value="new">New Episodes</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="time">Sort by Time</option>
              <option value="anime">Sort by Anime</option>
              <option value="episode">Sort by Episode</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {viewMode === 'week' ? (
          <div className="grid grid-cols-7 gap-4">
            {getDatesInRange().map((date, index) => {
              const dateStr = date.toISOString().split('T')[0] || ''
              const dayEpisodes = episodesByDate[dateStr] || []
              const isToday = date.toDateString() === new Date().toDateString()
              
              return (
                <div key={index} className="min-h-[200px]">
                  <div className={`text-center mb-3 p-2 rounded-lg ${
                    isToday ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}>
                    <div className="text-sm font-medium">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold">
                      {date.getDate()}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {dayEpisodes.map((episode) => (
                      <div
                        key={episode.id}
                        className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                        onClick={() => handleEpisodeClick(episode)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {formatTime(episode.airTime)}
                          </span>
                          {episode.isNewEpisode && (
                            <Badge className="bg-red-600 text-white text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm font-medium text-white truncate">
                          {episode.animeTitle}
                        </div>
                        <div className="text-xs text-gray-400">
                          Episode {episode.episodeNumber}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(episodesByDate).map(([date, dayEpisodes]) => (
              <div key={date} className="border border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">
                    {formatDate(new Date(date))}
                  </h4>
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                    {dayEpisodes.length} episodes
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayEpisodes.map((episode) => (
                    <div
                      key={episode.id}
                      className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                      onClick={() => handleEpisodeClick(episode)}
                    >
                      <div className="relative w-12 h-16 flex-shrink-0">
                        <Image
                          src={episode.animeImage || '/api/placeholder/300/400'}
                          alt={episode.animeTitle}
                          fill
                          className="object-cover rounded"
                        />
                        {episode.isNewEpisode && (
                          <Badge className="absolute -top-1 -right-1 bg-red-600 text-white text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {formatTime(episode.airTime)}
                          </span>
                          {episode.duration && (
                            <span className="text-xs text-gray-500">
                              • {episode.duration}min
                            </span>
                          )}
                        </div>
                        
                        <h5 className="font-medium text-white truncate">
                          {episode.animeTitle}
                        </h5>
                        <p className="text-sm text-gray-400 truncate">
                          Episode {episode.episodeNumber}
                          {episode.title && ` - ${episode.title}`}
                        </p>
                        
                        {episode.studio && (
                          <p className="text-xs text-gray-500 truncate">
                            {episode.studio}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        {episode.isWatching && (
                          <Badge className="bg-green-600 text-white text-xs">
                            Watching
                          </Badge>
                        )}
                        {episode.isCompleted && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredEpisodes.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-semibold text-white mb-2">No episodes scheduled</h3>
            <p className="text-gray-400">
              No anime episodes are scheduled for this time period.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
