'use client'

import { Fragment } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { X, Clock, Play, Calendar as CalendarIcon, Tag, Building } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '../../app/lib/utils'

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
  year?: number
  averageRating?: number
  viewCount?: number
  popularity?: number
}

interface EpisodeDetailsModalProps {
  episode: Episode | null
  isOpen: boolean
  onClose: () => void
  onAnimeClick?: (animeId: string) => void
}

export function EpisodeDetailsModal({
  episode,
  isOpen,
  onClose,
  onAnimeClick
}: EpisodeDetailsModalProps) {
  if (!isOpen || !episode) return null

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours || '0')
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const airDateTime = new Date(`${episode.airDate}T${episode.airTime}`)
  const isAired = new Date() >= airDateTime

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl max-w-lg w-full mx-4 border border-white/10 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative">
          {episode.animeImage && (
            <div className="relative h-40 w-full">
              <Image
                src={episode.animeImage}
                alt={episode.animeTitle}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <h2 className="text-xl font-bold text-white mb-1">
              {episode.animeTitle}
            </h2>
            <p className="text-sm text-gray-300">
              Episode {episode.episodeNumber}
              {episode.title && `: ${episode.title}`}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-12rem)]">
          {/* Air Date & Time */}
          <div className="flex items-start gap-3">
            <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">{formatDate(episode.airDate)}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {formatTime(episode.airTime)}
                {isAired && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Aired
                  </Badge>
                )}
              </p>
            </div>
          </div>

          {/* Episode Info */}
          <div className="grid grid-cols-2 gap-4">
            {episode.duration && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Duration</p>
                <p className="text-sm text-white">{episode.duration} minutes</p>
              </div>
            )}
            {episode.type && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Type</p>
                <p className="text-sm text-white">{episode.type}</p>
              </div>
            )}
          </div>

          {/* Genres */}
          {episode.genres && episode.genres.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Genres
              </p>
              <div className="flex flex-wrap gap-2">
                {episode.genres.map((genre) => (
                  <Badge
                    key={genre}
                    variant="secondary"
                    className="text-xs"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Studio */}
          {episode.studio && (
            <div>
              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                <Building className="h-3 w-3" />
                Studio
              </p>
              <p className="text-sm text-white">{episode.studio}</p>
            </div>
          )}

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {episode.isNewEpisode && (
              <Badge className="bg-red-600 text-white">
                New Episode
              </Badge>
            )}
            {episode.isWatching && (
              <Badge className="bg-green-600 text-white">
                Watching
              </Badge>
            )}
            {episode.isCompleted && (
              <Badge className="bg-blue-600 text-white">
                Completed
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t border-white/10">
            <Link
              href={`/anime/${episode.animeSlug}`}
              onClick={() => onAnimeClick?.(episode.animeId)}
            >
              <Button variant="default" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                View Anime Page
              </Button>
            </Link>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

