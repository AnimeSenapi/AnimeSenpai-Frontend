'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { cn } from '../../app/lib/utils'
import { Anime } from '../../types/anime'
import { getTagById } from '../../types/tags'
import { Heart, Play, CheckCircle, Star, MoreVertical, ChevronDown, Clock } from 'lucide-react'
import { Button } from '../ui/button'

interface MyListAnimeCardProps {
  anime: Anime & {
    listStatus: 'favorite' | 'watching' | 'completed' | 'plan-to-watch'
    listId?: string // ID from the user's list entry
  }
  variant?: 'grid' | 'list'
  className?: string
  onFavorite?: (animeId: string) => void
  isFavorited?: boolean
  onStatusChange?: (animeId: string, status: 'watching' | 'completed' | 'plan-to-watch') => void
}

export function MyListAnimeCard({
  anime,
  variant = 'grid',
  className,
  onFavorite,
  isFavorited = false,
  onStatusChange,
}: MyListAnimeCardProps) {
  const router = useRouter()
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const statusMenuRef = useRef<HTMLDivElement>(null)
  // Prefer English title over romanized Japanese
  const displayTitle = anime.titleEnglish || anime.title

  // Close status menu when clicking outside
  useEffect(() => {
    if (showStatusMenu) {
      const handleClickOutside = (event: MouseEvent) => {
        if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
          setShowStatusMenu(false)
        }
      }
      // Use a small delay to ensure button clicks register first
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 0)
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('click', handleClickOutside)
      }
    }
    return undefined
  }, [showStatusMenu])

  const handleStatusChange = (status: 'watching' | 'completed' | 'plan-to-watch', e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    console.log('handleStatusChange called:', { animeId: anime.id, status, hasCallback: !!onStatusChange })
    if (onStatusChange) {
      onStatusChange(anime.id, status)
    }
    setShowStatusMenu(false)
  }

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
          iconColor: 'text-secondary-500',
        }
      case 'watching':
        return {
          icon: Play,
          label: 'Watching',
          color: 'cyan',
          bgColor: 'bg-gray-800/90',
          borderColor: 'border-primary-500/30',
          textColor: 'text-primary-400',
          iconColor: 'text-primary-500',
        }
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Completed',
          color: 'green',
          bgColor: 'bg-gray-800/90',
          borderColor: 'border-success-500/30',
          textColor: 'text-success-400',
          iconColor: 'text-success-500',
        }
      case 'plan-to-watch':
        return {
          icon: Star,
          label: 'Plan to Watch',
          color: 'purple',
          bgColor: 'bg-gray-800/90',
          borderColor: 'border-planning-500/30',
          textColor: 'text-planning-400',
          iconColor: 'text-planning-500',
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  if (variant === 'list') {
    return (
      <Link href={`/anime/${anime.slug}`} className={cn('block group', className)}>
        <div className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center gap-6">
            {/* Image */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden relative">
                {anime.coverImage || anime.imageUrl ? (
                  <Image
                    src={(anime.coverImage || anime.imageUrl) as string}
                    alt={displayTitle}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-500 text-sm font-medium">No Image</span>
                  </div>
                )}
              </div>
              {/* Status Badge with Dropdown - Subtle Dark Style */}
              <div className="absolute -top-2 -right-2 z-10">
                {onStatusChange ? (
                  <div className="relative" ref={statusMenuRef}>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowStatusMenu(!showStatusMenu)
                      }}
                      className={cn(
                        'backdrop-blur-md text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 border-2 shadow-lg transition-all hover:scale-110 active:scale-95 hover:shadow-xl group/status',
                        statusConfig.bgColor,
                        statusConfig.borderColor,
                        statusConfig.textColor,
                        showStatusMenu && 'ring-2 ring-white/30'
                      )}
                      title="Click to change status"
                    >
                      <StatusIcon className={cn('h-3.5 w-3.5', statusConfig.iconColor)} />
                      <span className="font-semibold">{statusConfig.label}</span>
                      <ChevronDown className={cn(
                        'h-3.5 w-3.5 text-white transition-transform duration-200',
                        showStatusMenu ? 'rotate-180 opacity-100' : 'opacity-90 group-hover/status:translate-y-0.5 group-hover/status:opacity-100'
                      )} />
                    </button>
                    {showStatusMenu && (
                      <div 
                        className="absolute top-full right-0 mt-2 glass rounded-lg p-1.5 min-w-[160px] z-50 border border-white/20 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleStatusChange('watching', e)
                          }}
                          className={cn(
                            'w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm',
                            anime.listStatus === 'watching'
                              ? 'bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30'
                              : 'text-white hover:bg-white/10'
                          )}
                        >
                          <Play className="h-4 w-4" />
                          <span>Watching</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleStatusChange('completed', e)
                          }}
                          className={cn(
                            'w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm',
                            anime.listStatus === 'completed'
                              ? 'bg-green-500/20 text-green-300 font-semibold border border-green-500/30'
                              : 'text-white hover:bg-white/10'
                          )}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Completed</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleStatusChange('plan-to-watch', e)
                          }}
                          className={cn(
                            'w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm',
                            anime.listStatus === 'plan-to-watch'
                              ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                              : 'text-white hover:bg-white/10'
                          )}
                        >
                          <Clock className="h-4 w-4" />
                          <span>Plan to Watch</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                <div
                  className={cn(
                    'backdrop-blur-md text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 border',
                    statusConfig.bgColor,
                    statusConfig.borderColor,
                    statusConfig.textColor
                  )}
                >
                  <StatusIcon className={cn('h-3 w-3', statusConfig.iconColor)} />
                  <span className="font-medium">{statusConfig.label}</span>
                </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">
                    {displayTitle}
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
                  {onFavorite && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onFavorite(anime.id)
                      }}
                      className="p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all"
                      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star
                        className={cn(
                          'h-4 w-4 transition-all',
                          isFavorited
                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]'
                            : 'text-white hover:text-yellow-400'
                        )}
                      />
                    </button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 mb-3">
                {anime.tags && anime.tags.length > 0 ? (
                  anime.tags.slice(0, 3).map((tagId) => {
                    const tag = getTagById(tagId)
                    return tag ? (
                      <span
                        key={tagId}
                        className={cn('text-xs px-2 py-1 rounded-full font-medium', tag.color)}
                      >
                        {tag.name}
                      </span>
                    ) : null
                  })
                ) : (
                  <span className="text-xs text-gray-500">No tags</span>
                )}
              </div>

            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Grid variant
  return (
    <Link href={`/anime/${anime.slug}`} className={cn('block group', className)}>
      <div className="relative transform hover:scale-105 transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden">
          {anime.coverImage || anime.imageUrl ? (
            <Image
              src={(anime.coverImage || anime.imageUrl) as string}
              alt={displayTitle}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-500 text-sm font-medium">No Image</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Favorite Star Button - Top Right */}
          {onFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onFavorite(anime.id)
              }}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all touch-manipulation active:bg-black/80"
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                className={cn(
                  'h-5 w-5 transition-all',
                  isFavorited
                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]'
                    : 'text-white hover:text-yellow-400'
                )}
              />
            </button>
          )}

          {/* Status Badge with Dropdown - Top Left */}
          <div className="absolute top-3 left-3 z-10">
            {onStatusChange ? (
              <div className="relative" ref={statusMenuRef}>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowStatusMenu(!showStatusMenu)
                  }}
                  className={cn(
                    'backdrop-blur-md text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 border-2 shadow-lg transition-all hover:scale-110 active:scale-95 hover:shadow-xl group/status',
                    statusConfig.bgColor,
                    statusConfig.borderColor,
                    statusConfig.textColor,
                    showStatusMenu && 'ring-2 ring-white/30'
                  )}
                  title="Click to change status"
                >
                  <StatusIcon className={cn('h-4 w-4', statusConfig.iconColor)} />
                  <span className="font-semibold">{statusConfig.label}</span>
                  <ChevronDown className={cn(
                    'h-4 w-4 text-white transition-transform duration-200',
                    showStatusMenu ? 'rotate-180 opacity-100' : 'opacity-90 group-hover/status:translate-y-0.5 group-hover/status:opacity-100'
                  )} />
                </button>
                {showStatusMenu && (
                  <div 
                    className="absolute top-full left-0 mt-2 glass rounded-lg p-1.5 min-w-[160px] z-50 border border-white/20 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleStatusChange('watching', e)
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm',
                        anime.listStatus === 'watching'
                          ? 'bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30'
                          : 'text-white hover:bg-white/10'
                      )}
                    >
                      <Play className="h-4 w-4" />
                      <span>Watching</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleStatusChange('completed', e)
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm',
                        anime.listStatus === 'completed'
                          ? 'bg-green-500/20 text-green-300 font-semibold border border-green-500/30'
                          : 'text-white hover:bg-white/10'
                      )}
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Completed</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleStatusChange('plan-to-watch', e)
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm',
                        anime.listStatus === 'plan-to-watch'
                          ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                          : 'text-white hover:bg-white/10'
                      )}
                    >
                      <Clock className="h-4 w-4" />
                      <span>Plan to Watch</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  'backdrop-blur-md text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border shadow-sm',
                  statusConfig.bgColor,
                  statusConfig.borderColor,
                  statusConfig.textColor
                )}
              >
                <StatusIcon className={cn('h-3.5 w-3.5', statusConfig.iconColor)} />
                <span className="font-medium">{statusConfig.label}</span>
              </div>
            )}
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
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-3">
          <h3 className="text-white font-bold text-sm mb-1 group-hover:text-primary-400 transition-colors line-clamp-2">
            {displayTitle}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>{anime.year}</span>
            <div className="flex items-center gap-2">
              {anime.seasonCount && anime.seasonCount > 1 && (
                <span className="bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded font-medium">
                  {anime.seasonCount} Seasons
                </span>
              )}
              <span>{anime.totalEpisodes || anime.episodes} eps</span>
            </div>
          </div>


          {/* Tags - Clickable */}
          <div className="flex items-center gap-1">
            {anime.tags && anime.tags.length > 0 ? (
              anime.tags.slice(0, 2).map((tagId) => {
                const tag = getTagById(tagId)
                return tag ? (
                  <span
                    key={tagId}
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium hover:opacity-80 transition-opacity cursor-pointer',
                      tag.color
                    )}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      router.push(`/search?genre=${encodeURIComponent(tag.name)}`)
                    }}
                  >
                    {tag.name}
                  </span>
                ) : null
              })
            ) : (
              <span className="text-xs text-gray-500">No tags</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
