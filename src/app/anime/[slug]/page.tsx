'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AnimeCard } from '../../../components/anime/AnimeCard'
import { TrailerButton } from '../../../components/anime/TrailerPlayer'
import { ShareAnimeCard } from '../../../components/social/ShareAnimeCard'
import { StreamingLinks } from '../../../components/anime/StreamingLinks'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { BackButton } from '../../../components/ui/back-button'
import { LoadingState } from '../../../components/ui/loading-state'
import { ErrorState } from '../../../components/ui/error-state'
import { SEOHead } from '../../../components/SEOHead'
import { useAuth } from '../../lib/auth-context'
import { useToast } from '../../../components/ui/toast'
import { NotesButton } from '../../../components/notes'
import { apiToggleFavoriteByAnimeId, apiAddToList, apiUpdateListStatus, apiRemoveFromList, apiUpdateListEntry } from '../../lib/api'
import { RecommendationCarousel } from '../../../components/recommendations/RecommendationCarousel'
import { MobileAnimeActions } from '../../../components/anime/MobileAnimeActions'
import type { Anime, ListStatus as ListStatusType } from '../../../types/anime'
import { 
  generateAnimeStructuredData,
  generateAnimeMetaDescription,
  generateAnimeKeywords,
  generateCanonicalURL,
} from '../../../lib/seo-utils'
import { Play, Bookmark, Heart, Star, Check, Plus, X, Loader2, Tv2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { TRPC_URL as API_URL } from '../../lib/api'
import { useIsMobile } from '../../../hooks/use-touch-gestures'
import { cn } from '../../../lib/utils'

interface AnimeDetail extends Anime {
  titleEnglish?: string
  titleJapanese?: string
  source?: string
  aired?: string
  synopsis?: string
  background?: string
  trailer?: string
  producers?: string[]
  licensors?: string[]
  studios?: string[]
  themes?: string[]
  demographics?: string[]
  broadcast?: string
  malId?: number
}

interface ListStatus {
  inList: boolean
  status?: 'watching' | 'completed' | 'plan-to-watch' | 'favorite'
  progress?: number
  score?: number
}

interface Review {
  id: string
  userId: string
  username: string
    rating: number
    comment: string
  createdAt: string
}


export default function AnimePage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { addToast } = useToast()
  const slug = params?.slug as string
  const isMobile = useIsMobile()

  const [anime, setAnime] = useState<AnimeDetail | null>(null)
  const [relatedSeasons, setRelatedSeasons] = useState<Anime[]>([])
  const [similarAnime, setSimilarAnime] = useState<any[]>([])
  const [_reviews, _setReviews] = useState<Review[]>([])
  const [listStatus, setListStatus] = useState<ListStatus>({ inList: false })
  const [isFavorite, setIsFavorite] = useState(false)
  const [userNotes, setUserNotes] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [seasons, setSeasons] = useState<any[]>([])
  const [seriesName, setSeriesName] = useState<string>('')
  const [selectedSeason, setSelectedSeason] = useState<string>('')

  // Modal states
  const [showAddToListModal, setShowAddToListModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedListStatus, setSelectedListStatus] = useState<
    'watching' | 'completed' | 'plan-to-watch' | 'favorite'
  >('plan-to-watch')
  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState('')
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Collapsed sections state for mobile
  const [collapsedSections, setCollapsedSections] = useState({
    about: false,
  })

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = 'Bearer ' + token
    }
    return headers
  }

  // Fetch anime data
  useEffect(() => {
    async function fetchAnime() {
      if (!slug) return

      setIsLoading(true)
      setError(null)

      try {
        // Fetch anime details
        const response = await fetch(
          `${API_URL}/anime.getBySlug?input=${encodeURIComponent(JSON.stringify({ slug }))}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        )

        const data = await response.json()

        if (data.error) {
          setError('Anime not found')
          return
        }

        const animeData = data.result?.data
        if (animeData) {
          setAnime(animeData)
          setSelectedSeason(slug)

          // Fetch user's list status if authenticated
          if (isAuthenticated) {
            fetchListStatus(animeData.id)
          }

          // Fetch all seasons for this series
          fetchAllSeasons(slug)

          // Fetch similar anime
          fetchSimilarAnime(animeData.id)
        }
      } catch (err) {
        console.error('Failed to fetch anime:', err)
        setError('Failed to load anime')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnime()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, isAuthenticated])

  const fetchListStatus = async (animeId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/user.getAnimeList?input=${encodeURIComponent(JSON.stringify({}))}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      )

      const data = await response.json()
      const items = data.result?.data?.items || []
      const userAnime = items.find((item: any) => item.anime?.id === animeId)

      if (userAnime) {
        setListStatus({
          inList: true,
          status: userAnime.listStatus,
          progress: userAnime.progress,
          score: userAnime.score,
        })
        setIsFavorite(userAnime.isFavorite || false)
        if (userAnime.score) {
          setUserRating(userAnime.score)
        }
        if (userAnime.notes) {
          setUserNotes(userAnime.notes)
        }
      }
    } catch (err) {
      console.error('Failed to fetch list status:', err)
    }
  }

  const fetchAllSeasons = async (currentSlug: string) => {
    try {
      const response = await fetch(
        `${API_URL}/anime.getSeasons?input=${encodeURIComponent(JSON.stringify({ slug: currentSlug }))}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const data = await response.json()
      const result = data.result?.data

      if (result) {
        setSeasons(result.seasons || [])
        setSeriesName(result.seriesName || '')
        setRelatedSeasons(result.seasons || [])
      }
    } catch (err) {
      console.error('Failed to fetch seasons:', err)
    }
  }

  const fetchSimilarAnime = async (animeId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/recommendations.getSimilarByEmbedding?input=${encodeURIComponent(JSON.stringify({ animeId, limit: 6 }))}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const data = await response.json()
      // Extract recommendations array directly
      const recommendations = data.result?.data?.recommendations || []
      setSimilarAnime(recommendations)
    } catch (err) {
      console.error('❌ Failed to fetch similar anime:', err)
    }
  }

  const handleAddToList = async (status?: 'watching' | 'completed' | 'plan-to-watch' | 'favorite') => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }

    // Check email verification
    if (!user?.emailVerified) {
      addToast({
        title: 'Email Verification Required',
        description: 'Please verify your email to add anime to your list. Check your inbox for the verification link.',
        variant: 'destructive',
      })
      return
    }

    if (!anime) return

    const targetStatus = status || selectedListStatus
    const isUpdating = listStatus.inList

    // Handle favorite separately (it's not a ListStatus)
    if (targetStatus === 'favorite') {
      setIsSubmitting(true)
      try {
        const result = await apiToggleFavoriteByAnimeId(anime.id)
        setIsFavorite(result.isFavorite)
        addToast({
          title: 'Success',
          description: result.isFavorite ? 'Added to favorites!' : 'Removed from favorites',
          variant: 'success',
        })
      } catch (err) {
        console.error('Failed to toggle favorite:', err)
        addToast({
          title: 'Error',
          description: 'Failed to update favorite',
          variant: 'destructive',
        })
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    // For regular status updates, ensure it's a valid ListStatus
    const validStatus = targetStatus as 'watching' | 'completed' | 'plan-to-watch'

    // Optimistically update UI
    setListStatus({
      inList: true,
      status: validStatus,
      progress: listStatus.progress || 0,
      score: listStatus.score,
    })
    setShowAddToListModal(false)

    setIsSubmitting(true)
    try {
      if (isUpdating) {
        await apiUpdateListStatus({
          animeId: anime.id,
          status: validStatus,
        })
      } else {
        await apiAddToList({
          animeId: anime.id,
          status: validStatus,
        })
      }

      addToast({
        title: 'Success',
        description: isUpdating
          ? `Moved to ${validStatus.replace('-', ' ')} list!`
          : `Added to ${validStatus.replace('-', ' ')} list!`,
        variant: 'success',
      })
    } catch (err) {
      console.error('Failed to add to list:', err)
      // Revert optimistic update
      if (isUpdating) {
        // Restore previous status
        setListStatus({
          inList: true,
          status: listStatus.status || 'plan-to-watch',
          progress: listStatus.progress || 0,
          score: listStatus.score,
        })
      } else {
        setListStatus({ inList: false })
      }
      addToast({
        title: 'Error',
        description: isUpdating
          ? 'Failed to update list. Please try again.'
          : 'Failed to add to list. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveFromList = async () => {
    if (!anime || !listStatus.inList) return

    if (!confirm('Remove this anime from your list?')) return

    // Optimistically update UI
    const previousStatus = listStatus
    setListStatus({ inList: false })
    setIsFavorite(false)

    setIsSubmitting(true)
    try {
      await apiRemoveFromList(anime.id)

      addToast({
        title: 'Success',
        description: 'Removed from your list',
        variant: 'success',
      })
    } catch (err) {
      console.error('Failed to remove from list:', err)
      // Revert optimistic update
      setListStatus(previousStatus)
      addToast({
        title: 'Error',
        description: 'Failed to remove from list',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!anime || !isAuthenticated) return

    setIsSubmitting(true)
    try {
      const result = await apiToggleFavoriteByAnimeId(anime.id)
      setIsFavorite(result.isFavorite)
      addToast({
        title: 'Success',
        description: result.isFavorite ? 'Added to favorites!' : 'Removed from favorites',
        variant: 'success',
      })
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
      addToast({
        title: 'Error',
        description: 'Failed to update favorite',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitRating = async () => {
    if (!anime || userRating === 0) return

    // Check email verification
    if (!user?.emailVerified) {
      addToast({
        title: 'Email Verification Required',
        description: 'Please verify your email to rate anime. Check your inbox for the verification link.',
        variant: 'destructive',
      })
      setShowRatingModal(false)
      return
    }

    // Optimistically update UI
    const previousScore = listStatus.score
    setListStatus((prev) => ({ ...prev, score: userRating }))

    setIsSubmitting(true)
    try {
      // Update rating using updateListEntry
      // Ensure status is a valid ListStatus (exclude 'favorite')
      const currentStatus = listStatus.status
      const validStatus: ListStatusType | undefined = 
        currentStatus && currentStatus !== 'favorite' 
          ? (currentStatus as ListStatusType)
          : 'plan-to-watch'
      
      await apiUpdateListEntry({
        animeId: anime.id,
        status: validStatus,
        score: userRating,
        notes: userReview || undefined,
      })

      setShowRatingModal(false)
      setUserReview('')
      addToast({
        title: 'Rating Submitted',
        description: `Rated ${userRating}/10!`,
        variant: 'success',
      })
    } catch (err) {
      console.error('Failed to submit rating:', err)
      // Revert optimistic update
      setListStatus((prev) => ({ ...prev, score: previousScore }))
      addToast({
        title: 'Error',
        description: 'Failed to submit rating',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <LoadingState variant="full" text="Loading anime details..." size="lg" />
  }

  if (error || !anime) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 pt-32">
        <ErrorState
          variant="full"
          title="Anime Not Found"
          message={error || "The anime you're looking for doesn't exist or has been removed."}
          showHome={true}
          onHome={() => router.push('/search')}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      {/* Dynamic SEO Meta Tags */}
      <SEOHead
        title={`${anime.titleEnglish || anime.title} | AnimeSenpai`}
        description={generateAnimeMetaDescription(anime)}
        keywords={generateAnimeKeywords(anime)}
        canonical={generateCanonicalURL(`/anime/${anime.slug}`)}
        ogImage={anime.bannerImage || anime.coverImage || undefined}
        ogType="video.tv_show"
        structuredData={generateAnimeStructuredData(anime)}
      />

      <main className="container px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-8 sm:pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
            {/* Left: Back Button, Poster & Actions */}
            <aside>
              <div className="sticky top-40 space-y-4">
          <BackButton />
                <div className="glass rounded-xl p-2 hover:border-primary-500/20 transition-all">
                <div className="aspect-[2/3] rounded-lg overflow-hidden relative shadow-lg">
                {anime.coverImage || anime.imageUrl ? (
                  <Image
                    src={(anime.coverImage || anime.imageUrl) as string}
                    alt={anime.titleEnglish || anime.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-500 text-6xl">🎬</span>
                  </div>
                )}
              </div>
                  </div>

            {/* Actions */}
              <div className="space-y-3">
              {listStatus.inList ? (
                <>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAddToList('watching')}
                        disabled={isSubmitting}
                        className={`w-full py-2.5 rounded-lg transition-all ${
                          listStatus.status === 'watching'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-blue-400'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Tv2 className="h-4 w-4" />
                          <span className="text-sm font-medium">Watching</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleAddToList('completed')}
                        disabled={isSubmitting}
                        className={`w-full py-2.5 rounded-lg transition-all ${
                          listStatus.status === 'completed'
                            ? 'bg-green-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-green-400'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Check className="h-4 w-4" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleAddToList('plan-to-watch')}
                        disabled={isSubmitting}
                        className={`w-full py-2.5 rounded-lg transition-all ${
                          listStatus.status === 'plan-to-watch'
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-purple-400'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Bookmark className="h-4 w-4" />
                          <span className="text-sm font-medium">Planning</span>
                        </div>
                      </button>
                      <button
                        onClick={handleToggleFavorite}
                        disabled={isSubmitting}
                        className={`w-full py-2.5 rounded-lg transition-all ${
                          isFavorite
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-rose-400'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                          <span className="text-sm font-medium">Favorite</span>
                        </div>
                      </button>
                    </div>
                  <Button
                    onClick={handleRemoveFromList}
                    variant="outline"
                    disabled={isSubmitting}
                      className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 h-10 text-sm font-medium transition-all"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                      Remove
                  </Button>
                </>
              ) : (
              <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAddToList('watching')}
                      className="w-full py-2.5 rounded-lg bg-white/5 text-gray-400 hover:bg-blue-500/10 hover:text-blue-400 transition-all"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Tv2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Watching</span>
              </div>
                    </button>
                    <button
                      onClick={() => handleAddToList('completed')}
                      className="w-full py-2.5 rounded-lg bg-white/5 text-gray-400 hover:bg-green-500/10 hover:text-green-400 transition-all"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-medium">Completed</span>
            </div>
                    </button>
                    <button
                      onClick={() => handleAddToList('plan-to-watch')}
                      className="w-full py-2.5 rounded-lg bg-white/5 text-gray-400 hover:bg-purple-500/10 hover:text-purple-400 transition-all"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Bookmark className="h-4 w-4" />
                        <span className="text-sm font-medium">Planning</span>
          </div>
                    </button>
                    <button
                      onClick={handleToggleFavorite}
                      className={`w-full py-2.5 rounded-lg transition-all ${
                        isFavorite
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-rose-400'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                        <span className="text-sm font-medium">Favorite</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Right: Content */}
            <div>
            {/* Title */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                {seriesName || anime.titleEnglish || anime.title}
              </h1>
              {anime.titleEnglish && anime.title !== anime.titleEnglish && (
                    <p className="text-base sm:text-lg text-gray-400">{anime.title}</p>
              )}
              {anime.titleJapanese && anime.titleJapanese !== anime.title && (
                    <p className="text-sm text-gray-500 mt-1">{anime.titleJapanese}</p>
              )}
                </div>
                <div className="flex items-center gap-2 self-start shrink-0">
                  {((anime as AnimeDetail).trailer || anime.trailerUrl || (anime as any).trailer) && (
                    <TrailerButton
                      trailerUrl={((anime as AnimeDetail).trailer || anime.trailerUrl || (anime as any).trailer || '') as string}
                      title={anime.titleEnglish || anime.title}
                    />
                  )}
                  <ShareAnimeCard
                    anime={anime as any}
                    userRating={userRating}
                    userStatus={listStatus.status}
                    isFavorite={isFavorite}
                  />
                </div>
              </div>
            </div>

            {/* Season Selector */}
            {seasons.length > 1 && (
              <div className="glass rounded-xl p-4 mb-4 sm:mb-6">
                <h3 className="text-sm text-gray-400 mb-3 font-semibold">
                  Seasons ({seasons.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {seasons.map((season) => (
                    <button
                      key={season.slug}
                      onClick={() => {
                        setSelectedSeason(season.slug)
                        router.push(`/anime/${season.slug}`)
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        season.slug === selectedSeason
                          ? 'bg-primary-500 text-white shadow-lg'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{season.seasonName}</span>
                        {season.year && (
                          <span className="text-xs opacity-70">({season.year})</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Meta Info Bar with Genres */}
            <div className="glass rounded-xl p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-yellow-400/20 to-yellow-500/10 rounded-lg border border-yellow-400/20">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-white">
                    {anime.rating ? Number(anime.rating).toFixed(1) : 'N/A'}
                  </span>
                </div>
                  <div className="h-6 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                    {anime.year && <span className="text-white font-semibold">{anime.year}</span>}
                  {anime.episodes && (
                    <>
                        <span className="text-gray-600">•</span>
                      <span>{anime.episodes} eps</span>
                    </>
                  )}
                  {anime.duration && (
                    <>
                        <span className="text-gray-600">•</span>
                      <span>{anime.duration}m</span>
                    </>
                  )}
                  {anime.studio && (
                    <>
                        <span className="text-gray-600">•</span>
                        <span className="text-white font-semibold">{anime.studio}</span>
                    </>
                  )}
                </div>
              </div>
                {isAuthenticated && (
                  <div>
                    {listStatus.score ? (
                      <button 
                        onClick={() => setShowRatingModal(true)}
                        className="text-right hover:opacity-80 transition-all cursor-pointer group"
                      >
                        <div className="text-xs text-gray-500 group-hover:text-primary-400 transition-colors">Your Rating</div>
                        <div className="text-lg sm:text-xl text-white font-bold group-hover:text-primary-400 transition-colors flex items-center gap-1.5 justify-end">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {listStatus.score}/10
                        </div>
                      </button>
                    ) : (
                      <Button
                        onClick={() => setShowRatingModal(true)}
                        variant="outline"
                        className="border-primary-500/40 bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 hover:border-primary-500/60 h-9 px-4 font-medium transition-all shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20"
                      >
                        <Star className="h-3 w-3 mr-1.5 fill-primary-400 text-primary-400" />
                        Rate
                      </Button>
                    )}
                  </div>
                )}
            </div>

              {/* Genres below meta info */}
            {anime.genres && anime.genres.length > 0 && (
                <div className="pt-3 border-t border-white/10">
                  <div className="flex flex-wrap gap-2">
                {anime.genres.map((genre: any, index: number) => {
                  const genreName = genre.name || genre.slug || genre
                  return (
                    <Link key={index} href={`/search?genre=${encodeURIComponent(genreName)}`}>
                          <Badge className="bg-white/10 text-white border border-white/20 px-3 py-1.5 hover:bg-white/20 hover:border-primary-500/40 cursor-pointer transition-all text-sm">
                        {genreName}
                      </Badge>
                    </Link>
                  )
                })}
                  </div>
              </div>
            )}
            </div>

            {/* About Section - Combined Synopsis & Background */}
            {(anime.synopsis || anime.background) && (
              <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 hover:border-primary-500/20 transition-all duration-300">
                <button
                  onClick={() => setCollapsedSections(prev => ({ ...prev, about: !prev.about }))}
                  className={cn(
                    'flex items-center justify-between w-full gap-3 mb-4',
                    isMobile && 'cursor-pointer'
                  )}
                  aria-expanded={!collapsedSections.about}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full"></div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">About</h2>
                  </div>
                  {isMobile && (
                    collapsedSections.about ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    )
                  )}
                </button>
                {(!isMobile || !collapsedSections.about) && (
                  <>
                    {anime.synopsis && (
                      <div className="mb-4">
                        <p className="text-sm sm:text-base lg:text-lg text-gray-300 leading-relaxed">{anime.synopsis}</p>
                      </div>
                    )}
                    {anime.background && (
                      <div className={anime.synopsis ? 'pt-4 border-t border-white/10' : ''}>
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Background</h3>
                        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{anime.background}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Watch & Personal Sections in a 2-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Where to Watch */}
              <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-primary-500/20 hover:border-primary-500/30 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-1 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full"></div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Where to Watch</h2>
                </div>
                <StreamingLinks animeTitle={anime.titleEnglish || anime.title} />
              </div>

            {/* Personal Notes */}
            {isAuthenticated && (
                <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-primary-500/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-1 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full"></div>
                      <h2 className="text-lg sm:text-xl font-bold text-white">Personal Notes</h2>
                    </div>
                  <NotesButton
                    animeId={anime.id}
                    animeTitle={anime.titleEnglish || anime.title}
                    currentNotes={userNotes}
                    onNotesUpdate={setUserNotes}
                    variant="compact"
                  />
                </div>
                {userNotes ? (
                  <div
                      className="prose prose-invert max-w-none p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-sm"
                    dangerouslySetInnerHTML={{ __html: userNotes }}
                  />
                ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-xs">No notes yet</p>
                  </div>
                )}
              </div>
            )}
              </div>

            {/* Additional Info */}
            <div className="glass rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 hover:border-primary-500/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-1 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full"></div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Additional Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(anime as AnimeDetail).source && (
                  <div className="bg-gradient-to-br from-white/5 to-white/5 rounded-lg px-3 sm:px-4 py-3 border border-white/10 hover:border-primary-500/30 hover:bg-primary-500/10 transition-all">
                    <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">
                      Source
                    </div>
                    <div className="text-sm text-white font-semibold">
                      {(anime as AnimeDetail).source}
                    </div>
                  </div>
                )}
                {(anime as AnimeDetail).aired && (
                  <div className="bg-gradient-to-br from-white/5 to-white/5 rounded-lg px-3 sm:px-4 py-3 border border-white/10 hover:border-primary-500/30 hover:bg-primary-500/10 transition-all">
                    <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">
                      Aired
                    </div>
                    <div className="text-sm text-white font-semibold">
                      {(anime as AnimeDetail).aired}
                    </div>
                  </div>
                )}
                {(anime as AnimeDetail).broadcast && (
                  <div className="bg-gradient-to-br from-white/5 to-white/5 rounded-lg px-3 sm:px-4 py-3 border border-white/10 hover:border-primary-500/30 hover:bg-primary-500/10 transition-all">
                    <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">
                      Broadcast
                    </div>
                    <div className="text-sm text-white font-semibold">
                      {(anime as AnimeDetail).broadcast}
                    </div>
                  </div>
                )}
                {anime.season && (
                  <div className="bg-gradient-to-br from-white/5 to-white/5 rounded-lg px-3 sm:px-4 py-3 border border-white/10 hover:border-primary-500/30 hover:bg-primary-500/10 transition-all">
                    <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">
                      Season
                    </div>
                    <div className="text-sm text-white font-semibold capitalize">
                      {anime.season} {anime.year}
                    </div>
                  </div>
                )}
                {(anime as AnimeDetail).studios && (anime as AnimeDetail).studios!.length > 0 && (
                  <div className="bg-gradient-to-br from-white/5 to-white/5 rounded-lg px-3 sm:px-4 py-3 border border-white/10 hover:border-primary-500/30 hover:bg-primary-500/10 transition-all md:col-span-2">
                    <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">
                      Studios
                    </div>
                    <div className="text-sm text-white font-semibold flex flex-wrap gap-2">
                      {(anime as AnimeDetail).studios!.map((studio, index) => (
                        <span key={index}>
                          <Link
                            href={`/studio/${studio.replace(/\s+/g, '-')}`}
                            className="hover:text-primary-400 transition-colors"
                          >
                            {studio}
                          </Link>
                          {index < (anime as AnimeDetail).studios!.length - 1 && <span className="text-gray-500">•</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(anime as AnimeDetail).producers &&
                  (anime as AnimeDetail).producers!.length > 0 && (
                    <div className="bg-gradient-to-br from-white/5 to-white/5 rounded-lg px-3 sm:px-4 py-3 border border-white/10 hover:border-primary-500/30 hover:bg-primary-500/10 transition-all md:col-span-2">
                      <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">
                        Producers
                      </div>
                      <div className="text-sm text-white font-semibold">
                        {(anime as AnimeDetail).producers!.join(', ')}
                      </div>
                    </div>
                  )}
                {(anime as AnimeDetail).licensors &&
                  (anime as AnimeDetail).licensors!.length > 0 && (
                    <div className="bg-gradient-to-br from-white/5 to-white/5 rounded-lg px-3 sm:px-4 py-3 border border-white/10 hover:border-primary-500/30 hover:bg-primary-500/10 transition-all md:col-span-2">
                      <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">
                        Licensors
                      </div>
                      <div className="text-sm text-white font-semibold">
                        {(anime as AnimeDetail).licensors!.join(', ')}
                      </div>
                    </div>
                  )}
                {(anime as AnimeDetail).themes && (anime as AnimeDetail).themes!.length > 0 && (
                  <div className="bg-gradient-to-br from-white/5 to-white/5 rounded-lg px-3 sm:px-4 py-3 border border-white/10 hover:border-primary-500/30 hover:bg-primary-500/10 transition-all md:col-span-2">
                    <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">
                      Themes
                    </div>
                    <div className="text-sm text-white font-semibold">
                      {(anime as AnimeDetail).themes!.join(', ')}
                    </div>
                  </div>
                )}
                {(anime as AnimeDetail).demographics &&
                  (anime as AnimeDetail).demographics!.length > 0 && (
                    <div className="bg-gradient-to-br from-white/5 to-white/5 rounded-lg px-3 sm:px-4 py-3 border border-white/10 hover:border-primary-500/30 hover:bg-primary-500/10 transition-all md:col-span-2">
                      <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">
                        Demographic
                      </div>
                      <div className="text-sm text-white font-semibold">
                        {(anime as AnimeDetail).demographics!.join(', ')}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Recommendations */}
            {relatedSeasons.length > 1 && (
              <RecommendationCarousel
                title="More from this Series"
                icon={<Tv2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400" />}
                recommendations={relatedSeasons
                    .filter((season) => season.slug !== slug)
                  .map((season) => ({
                    anime: {
                          id: season.animeId || season.id,
                      slug: season.slug,
                      title: season.title,
                      titleEnglish: season.titleEnglish || null,
                      titleJapanese: season.titleJapanese || null,
                      titleSynonyms: season.titleSynonyms || null,
                      coverImage: season.coverImage || null,
                      year: season.year || null,
                      averageRating: season.averageRating || null,
                          genres: season.genres || [],
                    },
                  }))}
                      />
            )}

                </div>
              </div>

          {/* Full-width Recommendations at bottom */}
            {similarAnime.length > 0 && (
            <div className="mt-8 sm:mt-12 lg:mt-16">
              <RecommendationCarousel
                title="You Might Also Like"
                icon={<Sparkles className="h-5 w-5 text-primary-400" />}
                recommendations={similarAnime}
              />
              </div>
            )}
        </div>
      </main>

      {/* Rating Modal */}
      {showRatingModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowRatingModal(false)}
        >
          <div
            className="glass rounded-2xl p-6 sm:p-8 max-w-md w-full border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  Rate This Anime
                </h2>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {anime.titleEnglish || anime.title}
                </p>
              </div>
                <button
                onClick={() => setShowRatingModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                <X className="h-5 w-5 text-gray-400" />
                </button>
            </div>

            {/* Star Rating */}
            <div className="mb-6">
              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    onMouseEnter={() => setHoverRating(rating)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setUserRating(rating)}
                    className="transition-all hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`h-8 w-8 transition-all ${
                        rating <= (hoverRating || userRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-600 hover:text-gray-500'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white mb-1">
                  {userRating > 0 ? (
                    <span className="text-yellow-400">{userRating}</span>
                  ) : (
                    <span className="text-gray-500">0</span>
                  )}
                  <span className="text-gray-500 text-xl ml-2">/ 10</span>
                </p>
                <p className="text-xs text-gray-500">
                  {userRating > 0 ? 'Great choice!' : 'Click a star to rate'}
              </p>
              </div>
            </div>

            {/* Review */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Write a review (optional)
              </label>
              <textarea
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                placeholder="Share your thoughts about this anime..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 min-h-[100px] text-sm resize-none transition-all"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">{userReview.length}/500 characters</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowRatingModal(false)
                  setUserReview('')
                }}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10 h-11 text-sm font-medium transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRating}
                disabled={isSubmitting || userRating === 0}
                className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed h-11 text-sm font-medium shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Rating'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Actions Bar */}
      <MobileAnimeActions
        isAuthenticated={isAuthenticated}
        isFavorite={isFavorite}
        listStatus={listStatus}
        isSubmitting={isSubmitting}
        onAddToList={handleAddToList}
        onToggleFavorite={handleToggleFavorite}
        onRate={() => setShowRatingModal(true)}
        onRemoveFromList={handleRemoveFromList}
      />
    </div>
  )
}
