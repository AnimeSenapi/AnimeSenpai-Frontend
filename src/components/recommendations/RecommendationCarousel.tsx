'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '../ui/button'
import { AnimeCard } from '../anime/AnimeCard'
import { useAuth } from '../../app/lib/auth-context'
import { useFavorites } from '../../app/lib/favorites-context'
import { useToast } from '../../lib/toast-context'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/trpc'

interface RecommendationAnime {
  id: string
  slug: string
  title: string
  titleEnglish?: string | null
  titleJapanese?: string | null
  titleSynonyms?: string[] | null
  coverImage: string | null
  year: number | null
  averageRating: number | null
  genres: Array<{
    id: string
    name: string
  }>
}

interface Recommendation {
  anime: RecommendationAnime
  reason?: string
  score?: number
}

interface RecommendationCarouselProps {
  title: string
  icon?: React.ReactNode
  recommendations: Recommendation[]
  onDismiss?: (animeId: string) => void
  showReasons?: boolean
}

export function RecommendationCarousel({
  title,
  icon,
  recommendations,
  onDismiss,
  showReasons = false
}: RecommendationCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [showReason, setShowReason] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const { isFavorited, toggleFavorite } = useFavorites()
  const toast = useToast()

  if (recommendations.length === 0) {
    return null
  }

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(`carousel-${title.replace(/\s/g, '-')}`)
    if (container) {
      const scrollAmount = 300
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }

  const handleFavorite = async (animeId: string, animeTitle: string) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to favorite anime', 'Sign In Required')
      return
    }

    const wasFavorited = isFavorited(animeId)
    await toggleFavorite(animeId)
    
    // Show success message
    if (wasFavorited) {
      toast.success(`Removed "${animeTitle}" from favorites`, 'Success')
    } else {
      toast.success(`Added "${animeTitle}" to favorites!`, 'Success')
    }
  }

  return (
    <div className="mb-8 sm:mb-10 lg:mb-12">
      {/* Header - Responsive */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          {icon && (
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20">
              {icon}
            </div>
          )}
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{title}</h2>
        </div>
        
        <div className="hidden sm:flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Carousel - Touch-friendly scrolling on mobile */}
      <div 
        id={`carousel-${title.replace(/\s/g, '-')}`}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recommendations.slice(0, 20).map(({ anime, reason }) => (
          <div 
            key={anime.id}
            className="flex-shrink-0 w-36 sm:w-44 lg:w-48 relative group/card snap-start"
          >
            {/* Dismiss Button - Top Left, Show on Hover */}
            {onDismiss && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  onDismiss(anime.id)
                }}
                className="absolute top-2 left-2 z-20 w-7 h-7 bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-error-500/90 transition-all opacity-0 group-hover/card:opacity-100"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            )}

            {/* Use AnimeCard for consistency - without status badge */}
            <AnimeCard
              anime={{
                id: anime.id,
                slug: anime.slug,
                title: anime.title,
                titleEnglish: anime.titleEnglish || undefined,
                titleJapanese: anime.titleJapanese || undefined,
                titleSynonyms: anime.titleSynonyms || undefined,
                coverImage: anime.coverImage || undefined,
                year: anime.year || 0,
                rating: anime.averageRating || 0,
                status: 'trending' as const,
                tags: [],
                genres: anime.genres.map(g => ({ ...g, slug: g.id }))
              }}
              variant="featured"
              onFavorite={() => handleFavorite(anime.id, anime.titleEnglish || anime.title)}
              isFavorited={isFavorited(anime.id)}
            />

            {/* Reason text below card */}
            {reason && showReasons && (
              <div className="mt-2 px-1">
                <p className="text-xs text-gray-400 italic line-clamp-2">
                  {reason}
                </p>
              </div>
            )}
          </div>
        ))}
        
        {/* See All Button - Matches anime card size */}
        {recommendations.length > 10 && (
          <div className="flex-shrink-0 w-48">
            <a href={`/search?category=${encodeURIComponent(title.toLowerCase())}`}>
              <div className="glass rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 border-dashed border-white/20 hover:border-primary-400/50 relative group">
                {/* Match aspect ratio of anime cards */}
                <div className="aspect-[2/3] bg-gradient-to-br from-gray-800/50 to-gray-900/50 flex flex-col items-center justify-center p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ChevronRight className="h-8 w-8 text-primary-400" />
                  </div>
                  <h3 className="text-white font-semibold text-center mb-2">
                    See All
                  </h3>
                  <p className="text-gray-400 text-sm text-center">
                    {recommendations.length}+ anime
                  </p>
                </div>
              </div>
            </a>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

