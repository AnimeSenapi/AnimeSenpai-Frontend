'use client'

import { useState, memo } from 'react'
import { ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { AnimeCard } from '../anime/AnimeCard'
import { SwipeableCard } from '../gestures/SwipeableCard'
import { useAuth } from '../../app/lib/auth-context'
import { useFavorites } from '../../app/lib/favorites-context'
import { useToast } from '../ui/toast'
import { useIsMobile } from '../../hooks/use-touch-gestures'

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
  vertical?: boolean
}

function RecommendationCarouselComponent({
  title,
  icon,
  recommendations,
  onDismiss,
  showReasons = false,
  vertical = false,
}: RecommendationCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const { isAuthenticated } = useAuth()
  const { isFavorited, toggleFavorite } = useFavorites()
  const { addToast } = useToast()
  const isMobile = useIsMobile()

  if (recommendations.length === 0) {
    return null
  }

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(`carousel-${title.replace(/\s/g, '-')}`)
    if (container) {
      const scrollAmount = 300
      const newPosition =
        direction === 'left' ? scrollPosition - scrollAmount : scrollPosition + scrollAmount

      container.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }

  const handleFavorite = async (animeId: string, animeTitle: string) => {
    if (!isAuthenticated) {
      addToast({
        title: 'Sign In Required',
        description: 'Please sign in to favorite anime',
        variant: 'default',
      })
      return
    }

    const wasFavorited = isFavorited(animeId)
    await toggleFavorite(animeId)

    // Show success message
    if (wasFavorited) {
      addToast({
        title: 'Success',
        description: `Removed "${animeTitle}" from favorites`,
        variant: 'success',
      })
    } else {
      addToast({
        title: 'Success',
        description: `Added "${animeTitle}" to favorites!`,
        variant: 'success',
      })
    }
  }

  if (vertical) {
    // Vertical layout for sidebar
    return (
      <div className="mt-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          {icon && (
            <div className="p-1 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20">
              {icon}
            </div>
          )}
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>

        {/* Vertical list of cards */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {recommendations
            .slice(0, 10)
            .filter((rec) => rec && rec.anime && rec.anime.slug)
            .map(({ anime, reason }) => (
              <div key={anime.id} className="relative group/card">
                {/* Dismiss Button */}
                {onDismiss && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      onDismiss(anime.id)
                    }}
                    className="absolute top-2 right-2 z-20 w-6 h-6 bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-error-500/90 transition-all opacity-0 group-hover/card:opacity-100"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                )}

                {/* Compact AnimeCard */}
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
                    popularity: 0,
                    status: 'trending' as const,
                    tags: [],
                    genres: (anime.genres || []).map((g) => ({ ...g, slug: g.id })),
                  }}
                  variant="compact"
                  onFavorite={() => handleFavorite(anime.id, anime.titleEnglish || anime.title)}
                  isFavorited={isFavorited(anime.id)}
                />

                {/* Reason text below card */}
                {reason && showReasons && (
                  <div className="mt-1 px-1">
                    <p className="text-xs text-gray-400 italic line-clamp-1">{reason}</p>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    )
  }

  // Horizontal carousel layout (original)
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
          {recommendations
            .slice(0, 20)
            .filter((rec) => rec && rec.anime && rec.anime.slug)
            .map(({ anime, reason }) => {
              const cardContent = (
                <div className="flex-shrink-0 w-36 sm:w-44 lg:w-48 relative group/card snap-start">
                  {/* Dismiss Button - Top Left, Show on Hover (Desktop) */}
                  {onDismiss && !isMobile && (
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
                      popularity: 0,
                      status: 'trending' as const,
                      tags: [],
                      genres: (anime.genres || []).map((g) => ({ ...g, slug: g.id })),
                    }}
                    variant="featured"
                    onFavorite={() => handleFavorite(anime.id, anime.titleEnglish || anime.title)}
                    isFavorited={isFavorited(anime.id)}
                  />

                  {/* Reason text below card */}
                  {reason && showReasons && (
                    <div className="mt-2 px-1">
                      <p className="text-xs text-gray-400 italic line-clamp-2">{reason}</p>
                    </div>
                  )}
                </div>
              )

              // Wrap with SwipeableCard on mobile if onDismiss is provided
              if (isMobile && onDismiss) {
                return (
                  <SwipeableCard
                    key={anime.id}
                    onSwipeLeft={() => onDismiss(anime.id)}
                    threshold={80}
                    rightAction={
                      <div className="flex items-center gap-2 text-error-400">
                        <Trash2 className="h-5 w-5" />
                        <span className="text-sm font-medium">Dismiss</span>
                      </div>
                    }
                    className="flex-shrink-0"
                  >
                    {cardContent}
                  </SwipeableCard>
                )
              }

              return <div key={anime.id}>{cardContent}</div>
            })}

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
                  <h3 className="text-white font-semibold text-center mb-2">See All</h3>
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

export const RecommendationCarousel = memo(RecommendationCarouselComponent, (prevProps, nextProps) => {
  // Compare recommendations by IDs and length
  const prevIds = prevProps.recommendations.map(r => r.anime.id).join(',')
  const nextIds = nextProps.recommendations.map(r => r.anime.id).join(',')
  
  return (
    prevProps.title === nextProps.title &&
    prevIds === nextIds &&
    prevProps.showReasons === nextProps.showReasons &&
    prevProps.vertical === nextProps.vertical
  )
})

RecommendationCarousel.displayName = 'RecommendationCarousel'
