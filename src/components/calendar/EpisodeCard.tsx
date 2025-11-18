'use client'

import { useState, useEffect, useMemo } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  Play, 
  Check, 
  Plus,
  Clock,
  MoreVertical,
  Eye
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '../../app/lib/utils'
import { useToast } from '../ui/toast'
import { apiAddToList } from '../../app/lib/api'
import type { ListStatus } from '../../../types/anime'

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
  genres?: string[]
  type?: string
}

interface EpisodeCardProps {
  episode: Episode
  onEpisodeClick?: (episode: Episode) => void
  onAnimeClick?: (animeId: string) => void
  onMarkWatched?: (episode: Episode) => void
  variant?: 'compact' | 'detailed' | 'minimal'
  className?: string
}

export function EpisodeCard({
  episode,
  onEpisodeClick,
  onAnimeClick,
  onMarkWatched,
  variant = 'detailed',
  className
}: EpisodeCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [isMarkingWatched, setIsMarkingWatched] = useState(false)
  const { addToast } = useToast()

  // Calculate countdown timer
  const countdown = useMemo(() => {
    const now = new Date()
    const airDateTime = new Date(`${episode.airDate}T${episode.airTime}`)
    const diff = airDateTime.getTime() - now.getTime()

    if (diff <= 0) {
      return null // Episode has already aired
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }, [episode.airDate, episode.airTime])

  // Update countdown every minute
  useEffect(() => {
    if (!countdown) return

    const interval = setInterval(() => {
      // Force re-render by updating a state
      setShowActions(prev => prev)
    }, 60000)

    return () => clearInterval(interval)
  }, [countdown])

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours || '0')
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleMarkWatched = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMarkingWatched(true)

    try {
      // Add to list with watching status and update progress
      await apiAddToList({
        animeId: episode.animeId,
        status: 'watching',
      })

      onMarkWatched?.(episode)
      addToast({
        title: 'Marked as watched',
        description: `${episode.animeTitle} Episode ${episode.episodeNumber}`,
        variant: 'success',
      })
    } catch (err) {
      addToast({
        title: 'Failed to mark as watched',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'error',
      })
    } finally {
      setIsMarkingWatched(false)
      setShowActions(false)
    }
  }

  const handleAddToList = async (status: ListStatus) => {
    try {
      await apiAddToList({
        animeId: episode.animeId,
        status,
      })

      addToast({
        title: 'Added to list',
        description: `Added ${episode.animeTitle} to ${status.replace('-', ' ')}`,
        variant: 'success',
      })
    } catch (err) {
      addToast({
        title: 'Failed to add to list',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'error',
      })
    } finally {
      setShowActions(false)
    }
  }

  const handleAnimeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAnimeClick?.(episode.animeId)
  }

  const isAired = useMemo(() => {
    const now = new Date()
    const airDateTime = new Date(`${episode.airDate}T${episode.airTime}`)
    return now >= airDateTime
  }, [episode.airDate, episode.airTime])

  const isAiringSoon = useMemo(() => {
    if (isAired) return false
    const now = new Date()
    const airDateTime = new Date(`${episode.airDate}T${episode.airTime}`)
    const diff = airDateTime.getTime() - now.getTime()
    const hoursUntilAir = diff / (1000 * 60 * 60)
    return hoursUntilAir > 0 && hoursUntilAir <= 24
  }, [episode.airDate, episode.airTime, isAired])

  if (variant === 'minimal') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-violet-500/50 transition-all cursor-pointer',
          className
        )}
        onClick={() => onEpisodeClick?.(episode)}
      >
        {episode.animeImage && (
          <div className="relative w-16 h-10 rounded overflow-hidden flex-shrink-0">
            <Image
              src={episode.animeImage}
              alt={episode.animeTitle}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {episode.animeTitle} Ep {episode.episodeNumber}
          </p>
          <p className="text-xs text-gray-400">
            {formatTime(episode.airTime)}
          </p>
        </div>
        {countdown && (
          <Badge variant="secondary" className="text-xs">
            {countdown}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative bg-gray-800/50 rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg',
        isAiringSoon 
          ? 'border-violet-500/50 shadow-lg shadow-violet-500/20 ring-2 ring-violet-500/30' 
          : isAired 
            ? 'border-gray-700 opacity-75 hover:border-gray-600' 
            : 'border-gray-700 hover:border-violet-500/50 hover:shadow-violet-500/20',
        className
      )}
      onClick={() => onEpisodeClick?.(episode)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onEpisodeClick?.(episode)
        }
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Episode Image */}
      <div className="relative aspect-video w-full bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
        {episode.animeImage ? (
          <Image
            src={episode.animeImage}
            alt={episode.animeTitle}
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

        {/* New Episode Badge */}
        {episode.isNewEpisode && !isAired && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-red-600 text-white text-xs font-semibold px-2 py-1 animate-pulse">
              NEW
            </Badge>
          </div>
        )}

        {/* Countdown Timer */}
        {countdown && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className={cn(
              'text-white text-xs font-semibold px-2 py-1 flex items-center gap-1',
              isAiringSoon 
                ? 'bg-violet-600 animate-pulse' 
                : 'bg-violet-600'
            )}>
              <Clock className="h-3 w-3" />
              {countdown}
            </Badge>
          </div>
        )}

        {/* Airing Soon Indicator */}
        {isAiringSoon && !countdown && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-violet-600 text-white text-xs font-semibold px-2 py-1 animate-pulse">
              Airing Soon
            </Badge>
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
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

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/60 backdrop-blur-sm rounded-full p-4">
            <Play className="h-8 w-8 text-white fill-white" />
          </div>
        </div>

        {/* Quick Actions */}
        {showActions && (
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
            {!episode.isWatching && !episode.isCompleted && (
              <Button
                size="sm"
                variant="default"
                onClick={handleMarkWatched}
                disabled={isMarkingWatched}
                className="h-8 px-3 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Watched
              </Button>
            )}
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(!showActions)
                }}
                className="h-8 w-8 p-0 bg-gray-800/90 backdrop-blur-sm border-gray-600"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              {showActions && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden min-w-[160px] z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToList('watching')
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Add to Watching
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToList('plan-to-watch')
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add to Plan to Watch
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Episode Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/anime/${episode.animeSlug}`}
              onClick={handleAnimeClick}
              className="text-sm font-semibold text-white hover:text-violet-400 transition-colors line-clamp-1"
            >
              {episode.animeTitle}
            </Link>
            <p className="text-xs text-gray-400 mt-1">
              Episode {episode.episodeNumber}
              {episode.title && `: ${episode.title}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(episode.airTime)}
          </div>
          {episode.duration && (
            <>
              <span>•</span>
              <span>{episode.duration} min</span>
            </>
          )}
        </div>

        {/* Genres */}
        {variant === 'detailed' && episode.genres && episode.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {episode.genres.slice(0, 2).map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                className="text-[10px] px-1.5 py-0.5"
              >
                {genre}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

