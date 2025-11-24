'use client'

import { memo, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Star, Plus, Play, Eye, Calendar, Heart, CheckCircle, Clock, ChevronDown, CheckSquare, Square, MoreVertical } from 'lucide-react'
import { cn } from '../../app/lib/utils'
import { Anime } from '../../types/anime'
import { getTagById } from '../../types/tags'
import { useAnalytics } from '../AnalyticsProvider'

interface AnimeCardProps {
  anime: Anime & {
    listStatus?: 'favorite' | 'watching' | 'completed' | 'plan-to-watch'
    listId?: string
  }
  variant?: 'featured' | 'list' | 'grid' | 'compact'
  context?: 'default' | 'search' | 'mylist'
  className?: string
  onPlay?: () => void
  onFavorite?: (animeId?: string) => void
  onLike?: () => void
  isFavorited?: boolean
  // MyList specific props
  onStatusChange?: (animeId: string, status: 'watching' | 'completed' | 'plan-to-watch') => void
  isBulkMode?: boolean
  isSelected?: boolean
  onToggleSelection?: (animeId: string) => void
}

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-gray-800/80 text-primary-400 border-primary-500/30' },
  hot: { label: 'Hot', className: 'bg-gray-800/80 text-secondary-400 border-secondary-500/30' },
  trending: {
    label: 'Trending',
    className: 'bg-gray-800/80 text-primary-400 border-primary-500/30',
  },
  classic: {
    label: 'Classic',
    className: 'bg-gray-800/80 text-planning-400 border-planning-500/30',
  },
  ongoing: { label: 'Ongoing', className: 'bg-gray-800/80 text-success-400 border-success-500/30' },
  completed: { label: 'Completed', className: 'bg-gray-800/80 text-gray-400 border-gray-600/30' },
  upcoming: {
    label: 'Upcoming',
    className: 'bg-gray-800/80 text-warning-400 border-warning-500/30',
  },
  // API status values
  airing: { label: 'Airing', className: 'bg-gray-800/80 text-success-400 border-success-500/30' },
  finished: { label: 'Finished', className: 'bg-gray-800/80 text-gray-400 border-gray-600/30' },
  'not-yet-aired': {
    label: 'Coming Soon',
    className: 'bg-gray-800/80 text-warning-400 border-warning-500/30',
  },
}

const getListStatusConfig = (listStatus?: 'favorite' | 'watching' | 'completed' | 'plan-to-watch') => {
  switch (listStatus) {
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
    default:
      return null
  }
}

export const AnimeCard = memo(function AnimeCard({
  anime,
  variant = 'featured',
  context = 'default',
  className,
  onPlay: _onPlay,
  onFavorite,
  onLike: _onLike,
  isFavorited = false,
  onStatusChange,
  isBulkMode = false,
  isSelected = false,
  onToggleSelection,
}: AnimeCardProps) {
  const router = useRouter()
  const analytics = useAnalytics()
  const [isHovered, setIsHovered] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const statusMenuRef = useRef<HTMLDivElement>(null)

  // Close status menu when clicking outside
  useEffect(() => {
    if (showStatusMenu) {
      const handleClickOutside = (event: MouseEvent) => {
        if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
          setShowStatusMenu(false)
        }
      }
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

  if (!anime) return null

  // Handle both API format (genres array of objects) and old format (tags array of strings)
  const animeGenres =
    'genres' in anime
      ? (
          anime as unknown as {
            genres: Array<{ id: string; name: string; slug: string; color?: string }>
          }
        ).genres || []
      : []
  const animeTags = anime.tags || []
  // Prefer English title over romanized Japanese
  const title = anime.titleEnglish || anime.title
  const displayTitle = title
  const year = anime.year
  const rating = anime.rating
  const status = anime.status
  const episodes = anime.episodes
  const duration = anime.duration
  const studio = anime.studio

  const handleStatusChange = (status: 'watching' | 'completed' | 'plan-to-watch', e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (onStatusChange) {
      onStatusChange(anime.id, status)
    }
    setShowStatusMenu(false)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onFavorite) {
      if (context === 'mylist') {
        onFavorite(anime.id)
      } else {
        onFavorite()
      }
    }
  }

  const handleToggleSelection = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleSelection?.(anime.id)
  }

  const renderFeatured = () => {
    // Handle genres from API (array of objects with { id, name, slug, color })
    const genreTags: Array<{ id?: string; name: string; slug: string; color?: string }> =
      animeGenres.length > 0
        ? (animeGenres.slice(0, 3) as Array<{
            id?: string
            name: string
            slug: string
            color?: string
          }>)
        : animeTags
            .filter((tagId: string) => {
              const tag = getTagById(tagId)
              return tag?.category === 'genre'
            })
            .slice(0, 3)
            .map((tagId: string) => {
              const tag = getTagById(tagId)!
              return { name: tag.name, slug: tagId, color: tag.color }
            })

    return (
      <div 
        className="group relative glass rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
          {anime.coverImage || anime.imageUrl ? (
            <Image
              src={(anime.coverImage || anime.imageUrl) as string}
              alt={displayTitle}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              priority={false}
              loading="lazy"
            />
          ) : (
            <div className="text-gray-600 text-4xl">🎬</div>
          )}

          {/* Season Count Badge - Top Left */}
          {anime.seasonCount && anime.seasonCount > 1 && (
            <div className="absolute top-2 left-2 z-10">
              <div className="text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wide backdrop-blur-sm bg-gray-900/90 text-primary-400 border border-primary-500/30">
                {anime.seasonCount} Seasons
              </div>
            </div>
          )}

          {status && statusConfig[status] && !anime.seasonCount && (
            <div className="absolute top-2 left-2 z-10">
              <div
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wide backdrop-blur-sm',
                  statusConfig[status].className
                )}
              >
                {statusConfig[status].label}
              </div>
            </div>
          )}
          {/* Quick Actions - Show on hover (Play button only) */}
          {_onPlay && context === 'default' && (
            <div className={cn(
              "absolute inset-0 z-10 flex items-center justify-center gap-2 transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}>
              <Button
                size="sm"
                className="h-10 w-10 rounded-full bg-primary-500/90 hover:bg-primary-500 backdrop-blur-sm border-0 shadow-lg transition-all hover:scale-110"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  _onPlay()
                }}
                aria-label="Play trailer"
              >
                <Play className="h-5 w-5 fill-white text-white" />
              </Button>
            </div>
          )}

          {/* Favorite Button - Always visible in top right corner */}
          {onFavorite && (
            <div className="absolute top-3 right-3 z-10">
              <Button
                size="sm"
                className="border-0 h-10 w-10 p-0 transition-all bg-black/50 hover:bg-black/70 active:bg-black/80 active:scale-95 touch-manipulation"
                onClick={handleFavorite}
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
              </Button>
            </div>
          )}

          {/* Gradient fade overlay - focused on bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none z-[1]"></div>
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-3 md:p-2.5 z-[2]">
          <h3 className="font-semibold text-white text-base sm:text-sm mb-2 sm:mb-1.5 truncate drop-shadow-lg leading-tight">{displayTitle}</h3>

          {/* Subtle Genre Display - Clickable */}
          <div className="flex flex-wrap gap-1.5 sm:gap-1 mb-2 sm:mb-1.5 min-h-[20px] sm:min-h-[16px]">
            {genreTags.slice(0, 2).map((item: any, index: number) => {
              // Handle both genre objects and tag strings
              const genreName = typeof item === 'object' ? item.name : getTagById(item)?.name
              return genreName ? (
                <button
                  key={index}
                  className="text-xs sm:text-[10px] text-gray-400 hover:text-primary-400 transition-colors hover:underline cursor-pointer touch-manipulation py-0.5 px-1 -mx-1 rounded active:bg-white/10"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    router.push(`/search?genre=${encodeURIComponent(genreName)}`)
                  }}
                >
                  {genreName}
                </button>
              ) : null
            })}
            {genreTags.length > 2 && (
              <span className="text-xs sm:text-[10px] text-gray-500">• {genreTags.length - 2} more</span>
            )}
          </div>

          <div className="flex items-center justify-between mb-2 sm:mb-1.5">
            <div className="flex items-center gap-1.5 sm:gap-1">
              <Star className="h-4 w-4 sm:h-3 sm:w-3 text-cyan-400 fill-current drop-shadow-md" />
              <span className="text-sm sm:text-xs text-white font-medium drop-shadow-md">
                {rating || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm sm:text-xs text-gray-300 drop-shadow-md">
              {(anime.totalEpisodes || episodes) && (
                <span>{anime.totalEpisodes || episodes} eps</span>
              )}
              {duration && (anime.totalEpisodes || episodes) && <span>•</span>}
              {duration && <span>{duration}m</span>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-xs text-gray-300 drop-shadow-md">{year || 'TBA'}</span>
            <span className="text-sm sm:text-xs text-gray-400 drop-shadow-md truncate max-w-24 sm:max-w-20">
              {studio || ''}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const renderList = () => {
    // Handle genres from API (array of objects) or old tags (array of strings)
    const genreTags =
      animeGenres.length > 0
        ? animeGenres.slice(0, 3)
        : animeTags.filter((tagId: string) => {
            const tag = getTagById(tagId)
            return tag?.category === 'genre'
          })

    // Search context list variant
    if (context === 'search') {
      return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-primary-500/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary-500/10">
          <div className="flex items-start gap-5">
            {/* Image */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-36 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-white/10 relative">
                {anime.coverImage || anime.imageUrl ? (
                  <Image
                    src={(anime.coverImage || anime.imageUrl) as string}
                    alt={displayTitle}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-500 text-xs font-medium">No Image</span>
                  </div>
                )}

                {/* Rating Badge - Shows on Hover */}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold">{rating || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-300 transition-colors line-clamp-1">
                    {displayTitle}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {year || 'TBA'}
                    </span>
                    {episodes && (
                      <>
                        <span>•</span>
                        <span>{episodes} eps</span>
                      </>
                    )}
                    {studio && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[150px]">{studio}</span>
                      </>
                    )}
                  </div>

                  {/* Genres */}
                  {animeGenres && animeGenres.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {animeGenres.slice(0, 4).map((genre, index) => (
                        <span
                          key={index}
                          className="text-xs px-2.5 py-1 bg-white/10 text-gray-300 rounded-md border border-white/20"
                        >
                          {typeof genre === 'string' ? genre : genre.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                    {anime.description || 'An exciting anime adventure awaits...'}
                  </p>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 whitespace-nowrap shadow-lg">
                    <Play className="h-4 w-4" />
                    <span className="text-sm font-medium">View</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // MyList context list variant
    if (context === 'mylist') {
      const statusConfig = getListStatusConfig(anime.listStatus)
      const StatusIcon = statusConfig?.icon || Star

      return (
        <div className={cn(
          'glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:scale-[1.02]',
          isSelected && 'ring-2 ring-primary-500 bg-primary-500/10'
        )}>
          {isBulkMode && (
            <button
              onClick={handleToggleSelection}
              className="absolute top-4 left-4 z-20 w-6 h-6 bg-gray-900/90 backdrop-blur-sm rounded border-2 border-white/20 flex items-center justify-center hover:bg-primary-500/90 transition-all"
            >
              {isSelected ? (
                <CheckSquare className="h-4 w-4 text-white fill-white" />
              ) : (
                <Square className="h-4 w-4 text-white" />
              )}
            </button>
          )}
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
                {onStatusChange && statusConfig ? (
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
                          onClick={(e) => handleStatusChange('watching', e)}
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
                          onClick={(e) => handleStatusChange('completed', e)}
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
                          onClick={(e) => handleStatusChange('plan-to-watch', e)}
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
                ) : statusConfig ? (
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
                ) : null}
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
                    <span>{year}</span>
                    <span>•</span>
                    <span>{episodes} episodes</span>
                    <span>•</span>
                    <span>{studio}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onFavorite && (
                    <button
                      onClick={handleFavorite}
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
                {animeTags && animeTags.length > 0 ? (
                  animeTags.slice(0, 3).map((tagId) => {
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
      )
    }

    // Default context list variant
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
        <div className="w-10 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-md flex items-center justify-center overflow-hidden relative">
          {anime.coverImage || anime.imageUrl ? (
            <Image
              src={(anime.coverImage || anime.imageUrl) as string}
              alt={displayTitle}
              width={40}
              height={56}
              className="object-cover"
              sizes="40px"
              loading="lazy"
            />
          ) : (
            <div className="text-xs text-gray-300 font-bold">{year || 'TBA'}</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm truncate">{displayTitle}</h4>
          <div className="flex items-center gap-1 mt-1 min-h-[16px]">
            {genreTags.slice(0, 2).map((item: any, index: number) => {
              const genreName = typeof item === 'object' ? item.name : getTagById(item)?.name
              return genreName ? (
                <span key={index} className="text-xs text-gray-400">
                  {index > 0 && ' • '}
                  {genreName}
                </span>
              ) : null
            })}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-cyan-400 fill-current" />
              <span className="text-xs text-gray-300">{rating || 'N/A'}</span>
            </div>
            {status && statusConfig[status] && (
              <div
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wide backdrop-blur-sm inline-block',
                  statusConfig[status].className
                )}
              >
                {statusConfig[status].label}
              </div>
            )}
            {episodes && <span className="text-xs text-gray-400">{episodes} eps</span>}
          </div>
        </div>
      </div>
    )
  }

  const renderGrid = () => {
    // Handle genres from API (array of objects) or old tags (array of strings)
    const genreTags =
      animeGenres.length > 0
        ? animeGenres.slice(0, 3)
        : animeTags.filter((tagId: string) => {
            const tag = getTagById(tagId)
            return tag?.category === 'genre'
          })

    // Search context grid variant
    if (context === 'search') {
      return (
        <div className="relative transform hover:scale-[1.03] transition-all duration-300 cursor-pointer">
          {/* Image Container */}
          <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-white/10 group-hover:border-primary-500/50 transition-all duration-300">
            {anime.coverImage || anime.imageUrl ? (
              <Image
                src={(anime.coverImage || anime.imageUrl) as string}
                alt={displayTitle}
                fill
                className="object-cover transition-all duration-300 group-hover:blur-sm"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">No Image</span>
              </div>
            )}

            {/* Season Count Badge - Top Left */}
            {anime.seasonCount && anime.seasonCount > 1 && (
              <div className="absolute top-2 left-2 z-10">
                <div className="text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wide backdrop-blur-sm bg-gray-900/90 text-primary-400 border border-primary-500/30">
                  {anime.seasonCount} Seasons
                </div>
              </div>
            )}

            {/* Gradient Overlay - Always visible */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Favorite Button - Always visible */}
            {onFavorite && (
              <div className="absolute top-2 right-2 z-10">
                <Button
                  size="sm"
                  className="border-0 h-8 w-8 p-0 transition-all bg-black/50 hover:bg-black/70"
                  onClick={handleFavorite}
                >
                  <Star
                    className={cn(
                      'h-3.5 w-3.5 transition-all',
                      isFavorited
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]'
                        : 'text-white'
                    )}
                  />
                </Button>
              </div>
            )}

            {/* Rating Badge - Shows on Hover */}
            <div
              className={cn(
                'absolute top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                onFavorite ? 'right-12' : 'right-2'
              )}
            >
              <div className="bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="font-bold">{rating || 'N/A'}</span>
              </div>
            </div>

            {/* View Button - Shows on Hover - Subtle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100">
              <div className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-white/30">
                <Play className="h-3.5 w-3.5" />
                View
              </div>
            </div>

            {/* Bottom Info - Always visible */}
            <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
              <h3 className="text-white font-bold text-sm mb-1.5 line-clamp-2 drop-shadow-lg">
                {displayTitle}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
                <span>{year || 'TBA'}</span>
                {(anime.totalEpisodes || episodes) && (
                  <>
                    <span>•</span>
                    <span>{anime.totalEpisodes || episodes} eps</span>
                  </>
                )}
              </div>

              {/* Genres - Clickable */}
              {animeGenres && animeGenres.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {animeGenres.slice(0, 2).map((genre, index) => {
                    const genreName = typeof genre === 'string' ? genre : genre.name
                    return (
                      <span
                        key={index}
                        className="text-xs px-2 py-0.5 bg-white/10 backdrop-blur-sm text-gray-200 rounded-md border border-white/20 hover:bg-primary-500/20 hover:border-primary-400 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          router.push(`/search?genre=${encodeURIComponent(genreName)}`)
                        }}
                      >
                        {genreName}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    // MyList context grid variant
    if (context === 'mylist') {
      const statusConfig = getListStatusConfig(anime.listStatus)
      const StatusIcon = statusConfig?.icon || Star

      return (
        <div className={cn(
          'relative transform hover:scale-105 transition-all duration-300',
          isSelected && 'ring-2 ring-primary-500 bg-primary-500/10 rounded-xl'
        )}>
          {isBulkMode && (
            <button
              onClick={handleToggleSelection}
              className="absolute top-2 left-2 z-20 w-6 h-6 bg-gray-900/90 backdrop-blur-sm rounded border-2 border-white/20 flex items-center justify-center hover:bg-primary-500/90 transition-all"
            >
              {isSelected ? (
                <CheckSquare className="h-4 w-4 text-white fill-white" />
              ) : (
                <Square className="h-4 w-4 text-white" />
              )}
            </button>
          )}
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
                onClick={handleFavorite}
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
              {onStatusChange && statusConfig ? (
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
                        onClick={(e) => handleStatusChange('watching', e)}
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
                        onClick={(e) => handleStatusChange('completed', e)}
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
                        onClick={(e) => handleStatusChange('plan-to-watch', e)}
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
              ) : statusConfig ? (
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
              ) : null}
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
              <span>{year}</span>
              <div className="flex items-center gap-2">
                {anime.seasonCount && anime.seasonCount > 1 && (
                  <span className="bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded font-medium">
                    {anime.seasonCount} Seasons
                  </span>
                )}
                <span>{anime.totalEpisodes || episodes} eps</span>
              </div>
            </div>

            {/* Tags - Clickable */}
            <div className="flex items-center gap-1">
              {animeTags && animeTags.length > 0 ? (
                animeTags.slice(0, 2).map((tagId) => {
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
      )
    }

    // Default context grid variant
    return (
      <div className="group relative glass rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
        <div className="aspect-[3/4] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
          {anime.coverImage || anime.imageUrl ? (
            <Image
              src={(anime.coverImage || anime.imageUrl) as string}
              alt={displayTitle}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="text-gray-600 text-2xl">🎬</div>
          )}

          {status && statusConfig[status] && (
            <div className="absolute top-1.5 left-1.5 z-10">
              <Badge className={cn('text-xs px-1.5 py-0.5', statusConfig[status].className)}>
                {statusConfig[status].label}
              </Badge>
            </div>
          )}

          {/* Gradient fade overlay - focused on bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-[1]"></div>
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-[2]">
          <h4 className="font-medium text-white text-xs mb-1 truncate drop-shadow-md">{displayTitle}</h4>
          <div className="flex items-center gap-1 mb-1 min-h-[14px]">
            {genreTags.slice(0, 2).map((item: any, index: number) => {
              const genreName = typeof item === 'object' ? item.name : getTagById(item)?.name
              return genreName ? (
                <span key={index} className="text-xs text-gray-400">
                  {index > 0 && ' • '}
                  {genreName}
                </span>
              ) : null
            })}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-cyan-400 fill-current drop-shadow-sm" />
              <span className="text-xs text-white font-medium drop-shadow-sm">
                {rating || 'N/A'}
              </span>
            </div>
            <span className="text-xs text-gray-300 drop-shadow-sm">{year || 'TBA'}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderCompact = () => {
    // Handle genres from API (array of objects) or old tags (array of strings)
    const genreTags =
      animeGenres.length > 0
        ? animeGenres.slice(0, 2)
        : animeTags.filter((tagId: string) => {
            const tag = getTagById(tagId)
            return tag?.category === 'genre'
          })

    // Search context compact variant
    if (context === 'search') {
      return (
        <div className="flex items-center gap-3 px-2 py-2 hover:bg-white/5 rounded-lg transition-all duration-200">
          {/* Image - Clean without rating badge */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-white/10 group-hover:border-primary-500/40 transition-colors relative">
              {anime.coverImage || anime.imageUrl ? (
                <Image
                  src={(anime.coverImage || anime.imageUrl) as string}
                  alt={displayTitle}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="h-5 w-5 text-gray-600" />
                </div>
              )}
            </div>
          </div>

          {/* Content - More compact */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm mb-1 group-hover:text-primary-300 transition-colors line-clamp-2 leading-tight">
              {displayTitle}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              {year && <span>{year}</span>}
              {anime.type && year && <span>•</span>}
              {anime.type && <span>{anime.type}</span>}
              {episodes && (
                <>
                  <span>•</span>
                  <span>{episodes} eps</span>
                </>
              )}
            </div>
            {/* Genre tags - compact */}
            {animeGenres && animeGenres.length > 0 && (
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {animeGenres.slice(0, 2).map((genre, index) => {
                  const genreName = typeof genre === 'string' ? genre : genre.name
                  return (
                    <span
                      key={index}
                      className="text-[10px] px-1.5 py-0.5 bg-primary-500/10 text-primary-300 rounded border border-primary-500/20"
                    >
                      {genreName}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )
    }

    // Default context compact variant
    return (
      <div className="flex items-center gap-2 sm:gap-2 p-2 sm:p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors touch-manipulation min-h-[44px] sm:min-h-0">
        <div className="w-8 h-10 sm:w-6 sm:h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded flex items-center justify-center overflow-hidden relative flex-shrink-0">
          {anime.coverImage || anime.imageUrl ? (
            <Image
              src={(anime.coverImage || anime.imageUrl) as string}
              alt={displayTitle}
              width={32}
              height={40}
              className="object-cover w-full h-full"
              sizes="(max-width: 640px) 32px, 24px"
              loading="lazy"
            />
          ) : (
            <div className="text-xs sm:text-[10px] text-gray-300 font-bold">{year || 'TBA'}</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="font-medium text-white text-sm sm:text-xs truncate leading-tight">{displayTitle}</h5>
          <div className="flex items-center gap-1 min-h-[16px] sm:min-h-[14px]">
            {genreTags.slice(0, 1).map((item: any, index: number) => {
              const genreName = typeof item === 'object' ? item.name : getTagById(item)?.name
              return genreName ? (
                <span key={index} className="text-xs sm:text-[10px] text-gray-400">
                  {genreName}
                </span>
              ) : null
            })}
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-1 flex-shrink-0">
          <Star className="h-3 w-3 sm:h-2.5 sm:w-2.5 text-cyan-400 fill-current" />
          <span className="text-sm sm:text-xs text-gray-300">{rating || 'N/A'}</span>
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

  // Render the card content
  const cardContent = renderVariant()

  // Early return if no content
  if (!cardContent) {
    return null
  }

  // Handle link wrapping - MyList context may need special handling for bulk mode
  const linkHref = isBulkMode && context === 'mylist' ? '#' : `/anime/${anime.slug}`
  const linkOnClick = isBulkMode && context === 'mylist' ? (e: React.MouseEvent) => e.preventDefault() : undefined

  // Next.js 15 Link requires exactly one child element
  return (
    <Link 
      href={linkHref} 
      className={cn('cursor-pointer block', className, isBulkMode && context === 'mylist' && 'relative')}
      onClick={(e) => {
        if (linkOnClick) {
          linkOnClick(e)
        }
        if (context === 'default') {
          analytics.trackAnimeInteraction(anime.id, 'view', {
            title: anime.title,
            slug: anime.slug,
            variant
          })
        }
      }}
    >
      {cardContent}
    </Link>
  )
}, (prevProps, nextProps) => {
  // Memoization comparison - combine logic from all three components
  const baseEqual = 
    prevProps.anime.id === nextProps.anime.id &&
    prevProps.variant === nextProps.variant &&
    prevProps.context === nextProps.context &&
    prevProps.isFavorited === nextProps.isFavorited &&
    prevProps.className === nextProps.className

  // MyList specific comparisons
  if (prevProps.context === 'mylist' || nextProps.context === 'mylist') {
    return baseEqual &&
      prevProps.anime.listStatus === nextProps.anime.listStatus &&
      prevProps.isBulkMode === nextProps.isBulkMode &&
      prevProps.isSelected === nextProps.isSelected
  }

  return baseEqual
})

AnimeCard.displayName = 'AnimeCard'
