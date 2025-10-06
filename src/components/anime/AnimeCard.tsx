'use client'

import Link from 'next/link'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Star, Bookmark, Eye, Heart, Calendar, Clock, Users } from 'lucide-react'
import { cn } from '../../app/lib/utils'
import { Anime } from '../../types/anime'
import { getTagById } from '../../types/tags'

interface AnimeCardProps {
  anime: Anime
  variant?: 'featured' | 'list' | 'grid' | 'compact'
  className?: string
  onPlay?: () => void
  onBookmark?: () => void
  onLike?: () => void
}

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  hot: { label: 'Hot', className: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  trending: { label: 'Trending', className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  classic: { label: 'Classic', className: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  ongoing: { label: 'Ongoing', className: 'bg-green-500/20 text-green-300 border-green-500/30' },
  completed: { label: 'Completed', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  upcoming: { label: 'Upcoming', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  // API status values
  airing: { label: 'Airing', className: 'bg-green-500/20 text-green-300 border-green-500/30' },
  finished: { label: 'Finished', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  'not-yet-aired': { label: 'Coming Soon', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
}

export function AnimeCard({
  anime,
  variant = 'featured',
  className,
  onPlay,
  onBookmark,
  onLike
}: AnimeCardProps) {
  if (!anime) return null
  
  // Handle both API format (genres array of objects) and old format (tags array of strings)
  const animeGenres = 'genres' in anime ? (anime as unknown as { genres: Array<{ id: string; name: string; slug: string; color?: string }> }).genres || [] : []
  const animeTags = anime.tags || []
  const title = anime.title
  const year = anime.year
  const rating = anime.rating
  const status = anime.status
  const episodes = anime.episodes
  const duration = anime.duration
  const studio = anime.studio
  
  const renderFeatured = () => {
    // Handle genres from API (array of objects with { id, name, slug, color })
    const genreTags: Array<{ id?: string; name: string; slug: string; color?: string }> = animeGenres.length > 0 
      ? animeGenres.slice(0, 3) // Show first 3 genres
      : animeTags.filter((tagId: string) => {
          const tag = getTagById(tagId)
          return tag?.category === 'genre'
        })
    
    return (
      <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
        <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
          {status && statusConfig[status] && (
            <div className="absolute top-2 left-2">
              <Badge className={cn("text-xs px-1.5 py-0.5", statusConfig[status].className)}>
                {statusConfig[status].label}
              </Badge>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Button size="sm" className="bg-black/50 hover:bg-black/70 text-white border-0 h-8 w-8 p-0" onClick={onBookmark}>
              <Bookmark className="h-3 w-3" />
            </Button>
          </div>
          {/* Gradient fade overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
          <h3 className="font-semibold text-white text-sm mb-2 truncate drop-shadow-lg">{title}</h3>
          
          {/* Subtle Genre Display */}
          <div className="flex flex-wrap gap-1 mb-2">
            {genreTags.slice(0, 2).map((item: any, index: number) => {
              // Handle both genre objects and tag strings
              const genreName = typeof item === 'object' ? item.name : getTagById(item)?.name
              return genreName ? (
                <span key={index} className="text-xs text-gray-400">
                  {genreName}
                </span>
              ) : null
            })}
            {genreTags.length > 2 && (
              <span className="text-xs text-gray-500">
                • {genreTags.length - 2} more
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-cyan-400 fill-current drop-shadow-md" />
              <span className="text-xs text-white font-medium drop-shadow-md">{rating}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300 drop-shadow-md">
              {episodes && (
                <span>{episodes} eps</span>
              )}
              {duration && (
                <span>• {duration}m</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300 drop-shadow-md">{year}</span>
            {studio && (
              <span className="text-xs text-gray-400 drop-shadow-md truncate max-w-20">
                {studio}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderList = () => {
    // Handle genres from API (array of objects) or old tags (array of strings)
    const genreTags = animeGenres.length > 0 
      ? animeGenres.slice(0, 3)
      : animeTags.filter((tagId: string) => {
          const tag = getTagById(tagId)
          return tag?.category === 'genre'
        })
    
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
        <div className="w-10 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-md flex items-center justify-center">
          <div className="text-xs text-gray-300 font-bold">{year}</div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm truncate">{title}</h4>
          <div className="flex items-center gap-1 mt-1">
            {genreTags.slice(0, 2).map((item: any, index: number) => {
              const genreName = typeof item === 'object' ? item.name : getTagById(item)?.name
              return genreName ? (
                <span key={index} className="text-xs text-gray-400">
                  {index > 0 && ' • '}{genreName}
                </span>
              ) : null
            })}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-cyan-400 fill-current" />
              <span className="text-xs text-gray-300">{rating}</span>
            </div>
            {status && statusConfig[status] && (
              <Badge className={cn("text-xs px-1.5 py-0.5", statusConfig[status].className)}>
                {statusConfig[status].label}
              </Badge>
            )}
            {episodes && (
              <span className="text-xs text-gray-400">{episodes} eps</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderGrid = () => {
    // Handle genres from API (array of objects) or old tags (array of strings)
    const genreTags = animeGenres.length > 0 
      ? animeGenres.slice(0, 3)
      : animeTags.filter((tagId: string) => {
          const tag = getTagById(tagId)
          return tag?.category === 'genre'
        })
    
    return (
      <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
        <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
          {status && statusConfig[status] && (
            <div className="absolute top-1.5 left-1.5">
              <Badge className={cn("text-xs px-1.5 py-0.5", statusConfig[status].className)}>
                {statusConfig[status].label}
              </Badge>
            </div>
          )}
          {/* Gradient fade overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <h4 className="font-medium text-white text-xs mb-1 truncate drop-shadow-md">{title}</h4>
          <div className="flex items-center gap-1 mb-1">
            {genreTags.slice(0, 2).map((item: any, index: number) => {
              const genreName = typeof item === 'object' ? item.name : getTagById(item)?.name
              return genreName ? (
                <span key={index} className="text-xs text-gray-400">
                  {index > 0 && ' • '}{genreName}
                </span>
              ) : null
            })}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-cyan-400 fill-current drop-shadow-sm" />
              <span className="text-xs text-white font-medium drop-shadow-sm">{rating}</span>
            </div>
            <span className="text-xs text-gray-300 drop-shadow-sm">{year}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderCompact = () => {
    // Handle genres from API (array of objects) or old tags (array of strings)
    const genreTags = animeGenres.length > 0 
      ? animeGenres.slice(0, 2)
      : animeTags.filter((tagId: string) => {
          const tag = getTagById(tagId)
          return tag?.category === 'genre'
        })
    
    return (
      <div className="flex items-center gap-2 p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors">
        <div className="w-6 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded flex items-center justify-center">
          <div className="text-xs text-gray-300 font-bold">{year}</div>
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="font-medium text-white text-xs truncate">{title}</h5>
          <div className="flex items-center gap-1">
            {genreTags.slice(0, 1).map((item: any, index: number) => {
              const genreName = typeof item === 'object' ? item.name : getTagById(item)?.name
              return genreName ? (
                <span key={index} className="text-xs text-gray-400">
                  {genreName}
                </span>
              ) : null
            })}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-2.5 w-2.5 text-cyan-400 fill-current" />
          <span className="text-xs text-gray-300">{rating}</span>
        </div>
      </div>
    )
  }

  const renderVariant = () => {
    switch (variant) {
      case 'list':
        return renderList()
      case 'grid':
        return renderGrid()
      case 'compact':
        return renderCompact()
      default:
        return renderFeatured()
    }
  }

      return (
        <Link href={`/anime/${anime.slug}`} className={cn("cursor-pointer block", className)}>
          {renderVariant()}
        </Link>
      )
}
