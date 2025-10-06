'use client'

import Link from 'next/link'
import { cn } from '../../app/lib/utils'
import { Anime } from '../../types/anime'
import { getTagById } from '../../types/tags'
import { Star, Play, Bookmark, Heart, Clock, Calendar } from 'lucide-react'
import { Button } from '../ui/button'

interface SearchAnimeCardProps {
  anime: Anime & { 
    listStatus?: 'favorite' | 'watching' | 'completed' | 'plan-to-watch',
    genres?: string[],
    studios?: string[],
    popularity?: number
  }
  variant?: 'grid' | 'list' | 'compact'
  className?: string
}

export function SearchAnimeCard({ 
  anime, 
  variant = 'grid', 
  className 
}: SearchAnimeCardProps) {
  // Handle both old format (tags array) and new format (genres array)
  const firstTag = anime.genres?.[0] || anime.tags?.[0]
  const tag = typeof firstTag === 'string' ? getTagById(firstTag) : firstTag || { name: 'Anime', color: 'bg-gray-500/20 text-gray-400' }
  
  if (variant === 'compact') {
    return (
      <Link href={`/anime/${anime.slug}`} className={cn("block group", className)}>
        <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-all duration-200">
          {/* Image */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-md overflow-hidden">
              {anime.imageUrl ? (
                <img 
                  src={anime.imageUrl} 
                  alt={anime.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-cyan-300 transition-colors line-clamp-1">
              {anime.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{anime.year}</span>
              <span>•</span>
              <span>{anime.studio}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-white font-medium">{anime.rating}</span>
            </div>
          </div>

          {/* Status Indicator */}
          {anime.listStatus && (
            <div className="flex-shrink-0">
              {anime.listStatus === 'favorite' && (
                <Heart className="h-4 w-4 text-pink-400" />
              )}
              {anime.listStatus === 'watching' && (
                <Play className="h-4 w-4 text-cyan-400" />
              )}
              {anime.listStatus === 'completed' && (
                <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
              {anime.listStatus === 'plan-to-watch' && (
                <Star className="h-4 w-4 text-purple-400" />
              )}
            </div>
          )}
        </div>
      </Link>
    )
  }

  if (variant === 'list') {
    return (
      <Link href={`/anime/${anime.slug}`} className={cn("block group", className)}>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center gap-6">
            {/* Image */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-28 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden">
                {anime.imageUrl ? (
                  <img 
                    src={anime.imageUrl} 
                    alt={anime.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-500 text-sm font-medium">No Image</span>
                  </div>
                )}
              </div>
              {/* Rating Badge */}
              <div className="absolute -top-2 -right-2">
                <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{anime.rating}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                    {anime.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                    <span>{anime.year}</span>
                    <span>•</span>
                    <span>{anime.episodes} episodes</span>
                    <span>•</span>
                    <span>{anime.studio}</span>
                  </div>
                  {anime.genres && (
                    <div className="flex items-center gap-2 mb-3">
                      {anime.genres.slice(0, 3).map((genre, index) => (
                        <span 
                          key={index}
                          className="text-xs px-2 py-1 bg-white/10 text-gray-300 rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {anime.listStatus && (
                    <div className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300">
                      {anime.listStatus === 'favorite' && '❤️ Favorite'}
                      {anime.listStatus === 'watching' && '▶️ Watching'}
                      {anime.listStatus === 'completed' && '✅ Completed'}
                      {anime.listStatus === 'plan-to-watch' && '⭐ Plan to Watch'}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm line-clamp-2">
                {anime.description || 'No description available'}
              </p>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Grid variant
  return (
    <Link href={`/anime/${anime.slug}`} className={cn("block group", className)}>
      <div className="relative transform hover:scale-105 transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden">
          {anime.imageUrl ? (
            <img 
              src={anime.imageUrl} 
              alt={anime.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-500 text-sm font-medium">No Image</span>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Rating */}
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-black/50 backdrop-blur-sm text-white text-sm px-2 py-1 rounded-lg flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">{anime.rating}</span>
            </div>
          </div>

          {/* Status Badge */}
          {anime.listStatus && (
            <div className="absolute top-3 right-3 z-10">
              {anime.listStatus === 'favorite' && (
                <div className="bg-pink-500/95 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>Favorite</span>
                </div>
              )}
              {anime.listStatus === 'watching' && (
                <div className="bg-cyan-500/95 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  <span>Watching</span>
                </div>
              )}
              {anime.listStatus === 'completed' && (
                <div className="bg-green-500/95 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  </div>
                  <span>Completed</span>
                </div>
              )}
              {anime.listStatus === 'plan-to-watch' && (
                <div className="bg-purple-500/95 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  <span>Plan to Watch</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20"
              >
                <Play className="h-4 w-4 mr-1" />
                Watch
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-3">
          <h3 className="text-white font-bold text-sm mb-1 group-hover:text-cyan-300 transition-colors line-clamp-2">
            {anime.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>{anime.year}</span>
            <span>{anime.episodes} eps</span>
          </div>
          
          {/* Tags */}
          <div className="flex items-center gap-1">
            {anime.tags.slice(0, 2).map((tagId) => {
              const tag = getTagById(tagId)
              return tag ? (
                <span 
                  key={tagId}
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    tag.color
                  )}
                >
                  {tag.name}
                </span>
              ) : null
            })}
          </div>
        </div>
      </div>
    </Link>
  )
}
