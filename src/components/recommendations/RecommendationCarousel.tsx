'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '../ui/button'
import { AnimeCard } from '../anime/AnimeCard'
import { useAuth } from '../../app/lib/auth-context'
import { useToast } from '../../lib/toast-context'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/trpc'

interface RecommendationAnime {
  id: string
  slug: string
  title: string
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
  const [bookmarkedAnime, setBookmarkedAnime] = useState<Set<string>>(new Set())
  const { isAuthenticated, getAuthHeaders } = useAuth()
  const toast = useToast()

  // Fetch user's list to check which anime are bookmarked
  useEffect(() => {
    const fetchUserList = async () => {
      if (!isAuthenticated) {
        setBookmarkedAnime(new Set())
        return
      }

      try {
        const response = await fetch(`${API_URL}/user.getMyList`, {
          method: 'GET',
          headers: getAuthHeaders()
        })

        const data = await response.json()
        
        if (!data.error && data.result?.data) {
          const animeIds = new Set<string>(data.result.data.map((item: any) => item.anime.id as string))
          setBookmarkedAnime(animeIds)
        }
      } catch (err) {
        console.error('Failed to fetch user list:', err)
      }
    }

    fetchUserList()
  }, [isAuthenticated, getAuthHeaders])

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

  const handleBookmark = async (animeId: string, animeTitle: string) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to add anime to your list', 'Sign In Required')
      return
    }

    const isCurrentlyBookmarked = bookmarkedAnime.has(animeId)

    try {
      if (isCurrentlyBookmarked) {
        // Remove from list
        const response = await fetch(`${API_URL}/user.removeFromList`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ animeId })
        })

        const data = await response.json()
        
        if (data.error) {
          toast.error('Failed to remove from list', 'Error')
          return
        }

        setBookmarkedAnime(prev => {
          const newSet = new Set(prev)
          newSet.delete(animeId)
          return newSet
        })
        toast.success(`Removed "${animeTitle}" from your list`, 'Success')
      } else {
        // Add to list
        const response = await fetch(`${API_URL}/user.addToList`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            animeId: animeId,
            status: 'plan-to-watch'
          })
        })

        const data = await response.json()
        
        if (data.error) {
          toast.error('Failed to add to list', 'Error')
          return
        }

        setBookmarkedAnime(prev => new Set(prev).add(animeId))
        toast.success(`Added "${animeTitle}" to Plan to Watch!`, 'Success')
      }
    } catch (err) {
      console.error('Failed to update list:', err)
      toast.error('Failed to update list', 'Error')
    }
  }

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20">
              {icon}
            </div>
          )}
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        
        <div className="flex gap-2">
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

      {/* Carousel */}
      <div 
        id={`carousel-${title.replace(/\s/g, '-')}`}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recommendations.slice(0, 20).map(({ anime, reason }) => (
          <div 
            key={anime.id}
            className="flex-shrink-0 w-48 relative group/card"
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
                coverImage: anime.coverImage || undefined,
                year: anime.year || 0,
                rating: anime.averageRating || 0,
                tags: [],
                genres: anime.genres.map(g => ({ ...g, slug: g.id }))
              } as any}
              variant="featured"
              onBookmark={() => handleBookmark(anime.id, anime.title)}
              isBookmarked={bookmarkedAnime.has(anime.id)}
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
        
        {/* See All Button */}
        {recommendations.length > 10 && (
          <div className="flex-shrink-0 w-48">
            <a href={`/search?category=${encodeURIComponent(title.toLowerCase())}`}>
              <div className="h-full glass rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center p-6 min-h-[320px] cursor-pointer border-2 border-dashed border-white/20 hover:border-primary-400/50">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center mb-4">
                  <ChevronRight className="h-8 w-8 text-primary-400" />
                </div>
                <h3 className="text-white font-semibold text-center mb-2">
                  See All
                </h3>
                <p className="text-gray-400 text-sm text-center">
                  {recommendations.length}+ anime
                </p>
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

