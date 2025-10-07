'use client'

import Link from 'next/link'
import { cn } from '../../app/lib/utils'
import { Anime } from '../../types/anime'
import { getTagById } from '../../types/tags'
import { Heart, Play, CheckCircle, Star, MoreVertical, Bookmark } from 'lucide-react'
import { Button } from '../ui/button'

interface MyListAnimeCardProps {
  anime: Anime & { listStatus: 'favorite' | 'watching' | 'completed' | 'plan-to-watch' }
  variant?: 'grid' | 'list'
  className?: string
}

export function MyListAnimeCard({ 
  anime, 
  variant = 'grid', 
  className 
}: MyListAnimeCardProps) {
  const tag = getTagById(anime.tags[0])
  
  const getStatusConfig = () => {
    switch (anime.listStatus) {
      case 'favorite':
        return {
          icon: Heart,
          label: 'Favorite',
          color: 'pink',
          bgColor: 'bg-gray-800/90',
          borderColor: 'border-secondary-500/30',
          textColor: 'text-secondary-400',
          iconColor: 'text-secondary-500'
        }
      case 'watching':
        return {
          icon: Play,
          label: 'Watching',
          color: 'cyan',
          bgColor: 'bg-gray-800/90',
          borderColor: 'border-primary-500/30',
          textColor: 'text-primary-400',
          iconColor: 'text-primary-500'
        }
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Completed',
          color: 'green',
          bgColor: 'bg-gray-800/90',
          borderColor: 'border-success-500/30',
          textColor: 'text-success-400',
          iconColor: 'text-success-500'
        }
      case 'plan-to-watch':
        return {
          icon: Star,
          label: 'Plan to Watch',
          color: 'purple',
          bgColor: 'bg-gray-800/90',
          borderColor: 'border-planning-500/30',
          textColor: 'text-planning-400',
          iconColor: 'text-planning-500'
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  if (variant === 'list') {
    return (
      <Link href={`/anime/${anime.slug}`} className={cn("block group", className)}>
        <div className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center gap-6">
            {/* Image */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden">
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
              {/* Status Badge - Subtle Dark Style */}
              <div className="absolute -top-2 -right-2">
                <div className={cn(
                  "backdrop-blur-md text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 border",
                  statusConfig.bgColor,
                  statusConfig.borderColor,
                  statusConfig.textColor
                )}>
                  <StatusIcon className={cn("h-3 w-3", statusConfig.iconColor)} />
                  <span className="font-medium">{statusConfig.label}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">
                    {anime.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{anime.year}</span>
                    <span>•</span>
                    <span>{anime.episodes} episodes</span>
                    <span>•</span>
                    <span>{anime.studio}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-warning-400 fill-warning-400" />
                    <span className="text-white font-semibold">{anime.rating}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 mb-3">
                {anime.tags.slice(0, 3).map((tagId) => {
                  const tag = getTagById(tagId)
                  return tag ? (
                    <span 
                      key={tagId}
                      className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium",
                        tag.color
                      )}
                    >
                      {tag.name}
                    </span>
                  ) : null
                })}
              </div>

              {/* Progress Bar (for watching anime) */}
              {anime.listStatus === 'watching' && (
                <div className="w-full">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>5 / {anime.episodes || '?'}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${anime.episodes ? (5 / anime.episodes) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
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
          
          {/* Status Badge - Subtle Dark Style */}
          <div className="absolute top-3 right-3 z-10">
            <div className={cn(
              "backdrop-blur-md text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border shadow-sm",
              statusConfig.bgColor,
              statusConfig.borderColor,
              statusConfig.textColor
            )}>
              <StatusIcon className={cn("h-3.5 w-3.5", statusConfig.iconColor)} />
              <span className="font-medium">{statusConfig.label}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-black/50 backdrop-blur-sm text-white text-sm px-2 py-1 rounded-lg flex items-center gap-1">
              <Star className="h-3 w-3 text-warning-400 fill-warning-400" />
              <span className="font-semibold">{anime.rating}</span>
            </div>
          </div>

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
          <h3 className="text-white font-bold text-sm mb-1 group-hover:text-primary-400 transition-colors line-clamp-2">
            {anime.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{anime.year}</span>
            <span>{anime.episodes} eps</span>
          </div>
          
          {/* Tags */}
          <div className="flex items-center gap-1 mt-2">
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
