'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '../../app/lib/utils'
import { Anime } from '../../types/anime'
import { getTagById } from '../../types/tags'
import { Star, Play, Calendar } from 'lucide-react'

interface SearchAnimeCardProps {
  anime: Anime & { 
    listStatus?: 'favorite' | 'watching' | 'completed' | 'plan-to-watch'
  }
  variant?: 'grid' | 'list' | 'compact'
  className?: string
}

export function SearchAnimeCard({ 
  anime, 
  variant = 'grid', 
  className 
}: SearchAnimeCardProps) {
  const router = useRouter()
  
  // Handle both old format (tags array) and new format (genres array)
  const firstTag = anime.genres?.[0] || anime.tags?.[0]
  const tag = typeof firstTag === 'string' ? getTagById(firstTag) : firstTag || { name: 'Anime', color: 'bg-gray-500/20 text-gray-400' }
  
  if (variant === 'compact') {
    return (
      <Link href={`/anime/${anime.slug}`} className={cn("block group", className)}>
        <div className="flex items-center gap-3 px-2 py-2 hover:bg-white/5 rounded-lg transition-all duration-200">
          {/* Image - Clean without rating badge */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-white/10 group-hover:border-primary-500/40 transition-colors relative">
              {(anime.coverImage || anime.imageUrl) ? (
                <Image 
                  src={anime.coverImage || anime.imageUrl} 
                  alt={anime.title}
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
              {anime.title}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              {anime.year && <span>{anime.year}</span>}
              {anime.type && anime.year && <span>•</span>}
              {anime.type && <span>{anime.type}</span>}
              {anime.episodes && (
                <>
                  <span>•</span>
                  <span>{anime.episodes} eps</span>
                </>
              )}
            </div>
            {/* Genre tags - compact */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {anime.genres.slice(0, 2).map((genre, index) => {
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
      </Link>
    )
  }

  if (variant === 'list') {
    return (
      <Link href={`/anime/${anime.slug}`} className={cn("block group", className)}>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-primary-500/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary-500/10">
          <div className="flex items-start gap-5">
            {/* Image */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-36 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border border-white/10 relative">
                {(anime.coverImage || anime.imageUrl) ? (
                  <Image 
                    src={anime.coverImage || anime.imageUrl} 
                    alt={anime.title}
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
                    <span className="font-bold">{anime.rating || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-300 transition-colors line-clamp-1">
                    {anime.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {anime.year || 'TBA'}
                    </span>
                    {anime.episodes && (
                      <>
                        <span>•</span>
                        <span>{anime.episodes} eps</span>
                      </>
                    )}
                    {anime.studio && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[150px]">{anime.studio}</span>
                      </>
                    )}
                  </div>
                  
                  {/* Genres */}
                  {anime.genres && anime.genres.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {anime.genres.slice(0, 4).map((genre, index) => (
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
      </Link>
    )
  }

  // Grid variant
  return (
    <Link href={`/anime/${anime.slug}`} className={cn("block group", className)}>
      <div className="relative transform hover:scale-[1.03] transition-all duration-300 cursor-pointer">
        {/* Image Container */}
        <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-white/10 group-hover:border-primary-500/50 transition-all duration-300">
          {(anime.coverImage || anime.imageUrl) ? (
            <Image 
              src={anime.coverImage || anime.imageUrl} 
              alt={anime.title}
              fill
              className="object-cover transition-all duration-300 group-hover:blur-sm"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-500 text-sm font-medium">No Image</span>
            </div>
          )}
          
          {/* Gradient Overlay - Always visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          
          {/* Rating Badge - Shows on Hover */}
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="font-bold">{anime.rating || 'N/A'}</span>
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
              {anime.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
              <span>{anime.year || 'TBA'}</span>
              {anime.episodes && (
                <>
                  <span>•</span>
                  <span>{anime.episodes} eps</span>
                </>
              )}
            </div>
            
            {/* Genres - Clickable */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {anime.genres.slice(0, 2).map((genre, index) => {
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
    </Link>
  )
}
