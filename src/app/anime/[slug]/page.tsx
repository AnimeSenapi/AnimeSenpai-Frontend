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
import type { Anime } from '../../../types/anime'
import { 
  generateAnimeStructuredData,
  generateAnimeMetaDescription,
  generateAnimeKeywords,
  generateCanonicalURL,
} from '../../../lib/seo-utils'
import { Play, Bookmark, Heart, Star, Check, Plus, X, Loader2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/trpc'

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
  const toast = useToast()
  const slug = params?.slug as string

  const [anime, setAnime] = useState<AnimeDetail | null>(null)
  const [relatedSeasons, setRelatedSeasons] = useState<Anime[]>([])
  const [similarAnime, setSimilarAnime] = useState<Anime[]>([])
  const [_reviews, _setReviews] = useState<Review[]>([])
  const [listStatus, setListStatus] = useState<ListStatus>({ inList: false })
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
        `${API_URL}/anime.getSimilar?input=${encodeURIComponent(JSON.stringify({ animeId, limit: 6 }))}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const data = await response.json()
      setSimilarAnime(data.result?.data || [])
    } catch (err) {
      console.error('Failed to fetch similar anime:', err)
    }
  }

  const handleAddToList = async () => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }

    // Check email verification
    if (!user?.emailVerified) {
      toast.error(
        'Email Verification Required',
        'Please verify your email to add anime to your list. Check your inbox for the verification link.'
      )
      return
    }

    if (!anime) return

    const isUpdating = listStatus.inList

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/user.addToList`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          animeId: anime.id,
          status: selectedListStatus,
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(isUpdating ? 'Failed to update list' : 'Failed to add to list', 'Error')
        return
      }

      setListStatus({
        inList: true,
        status: selectedListStatus,
        progress: listStatus.progress || 0,
        score: listStatus.score,
      })
      setShowAddToListModal(false)
      toast.success(
        isUpdating
          ? `Moved to ${selectedListStatus.replace('-', ' ')} list!`
          : `Added to ${selectedListStatus.replace('-', ' ')} list!`,
        'Success'
      )
    } catch (err) {
      console.error('Failed to add to list:', err)
      toast.error(
        isUpdating
          ? 'Failed to update list. Please try again.'
          : 'Failed to add to list. Please try again.',
        'Error'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveFromList = async () => {
    if (!anime || !listStatus.inList) return

    if (!confirm('Remove this anime from your list?')) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/user.removeFromList`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          animeId: anime.id,
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error('Failed to remove from list', 'Error')
        return
      }

      setListStatus({ inList: false })
      toast.success('Removed from your list', 'Success')
    } catch (err) {
      console.error('Failed to remove from list:', err)
      toast.error('Failed to remove from list', 'Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitRating = async () => {
    if (!anime || userRating === 0) return

    // Check email verification
    if (!user?.emailVerified) {
      toast.error(
        'Email Verification Required',
        'Please verify your email to rate anime. Check your inbox for the verification link.'
      )
      setShowRatingModal(false)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/user.rateAnime`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          animeId: anime.id,
          rating: userRating,
          review: userReview || undefined,
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error('Failed to submit rating', 'Error')
        return
      }

      setListStatus((prev) => ({ ...prev, score: userRating }))
      setShowRatingModal(false)
      setUserReview('')
      toast.success(`Rated ${userRating}/10!`, 'Rating Submitted')
    } catch (err) {
      console.error('Failed to submit rating:', err)
      toast.error('Failed to submit rating', 'Error')
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

      <main className="container px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-32 pb-8 sm:pb-16 lg:pb-20">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <BackButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-4 sm:gap-6 lg:gap-8 xl:gap-10 max-w-7xl mx-auto">
          {/* Left: Poster & Actions */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="glass rounded-xl sm:rounded-2xl p-2 sm:p-3 mb-4 sm:mb-6">
              <div className="aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden relative">
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
            <div className="space-y-3 sm:space-y-3 mb-4 sm:mb-6">
              {listStatus.inList ? (
                <>
                  <Button
                    onClick={() => setShowRatingModal(true)}
                    className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white min-h-[44px] text-sm sm:text-base"
                    size="lg"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {listStatus.score ? `Your Rating: ${listStatus.score}/10` : 'Rate Anime'}
                  </Button>
                  <Button
                    onClick={() => {
                      if (listStatus.status) {
                        setSelectedListStatus(
                          listStatus.status as
                            | 'watching'
                            | 'completed'
                            | 'plan-to-watch'
                            | 'favorite'
                        )
                      }
                      setShowAddToListModal(true)
                    }}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 min-h-[44px] text-sm sm:text-base"
                  >
                    Change List
                  </Button>
                  <Button
                    onClick={handleRemoveFromList}
                    variant="outline"
                    disabled={isSubmitting}
                    className="w-full border-white/20 text-white hover:bg-white/10 hover:border-red-500/50 hover:text-red-400 min-h-[44px] text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Remove from List
                  </Button>
                  {listStatus.status && (
                    <div className="text-center py-2">
                      <Badge className="bg-success-500/20 text-success-400 border-success-500/30">
                        <Check className="h-3 w-3 mr-1" />
                        In {listStatus.status?.replace('-', ' ')}
                      </Badge>
                </div>
                  )}
                </>
              ) : (
                <Button
                  onClick={() => setShowAddToListModal(true)}
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white min-h-[44px] text-sm sm:text-base"
                  size="lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to List
                </Button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <ShareAnimeCard
                  anime={anime as any}
                  userRating={userRating}
                  userStatus={listStatus.status}
                />
                {anime.trailer && (
                  <TrailerButton
                    trailerUrl={anime.trailer}
                    title={anime.titleEnglish || anime.title}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right: Content */}
            <div>
            {/* Title - Prioritize English - Mobile Optimized */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                {seriesName || anime.titleEnglish || anime.title}
              </h1>
              {anime.titleEnglish && anime.title !== anime.titleEnglish && (
                <p className="text-sm sm:text-base lg:text-lg text-gray-400 mb-1 sm:mb-1.5">{anime.title}</p>
              )}
              {anime.titleJapanese && anime.titleJapanese !== anime.title && (
                <p className="text-xs sm:text-sm text-gray-500">{anime.titleJapanese}</p>
              )}
            </div>

            {/* Season Selector - Crunchyroll Style - Mobile Optimized */}
            {seasons.length > 1 && (
              <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <h3 className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 uppercase tracking-wide">
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
                      className={`px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation min-h-[44px] ${
                        season.slug === selectedSeason
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 active:bg-white/15 hover:text-white border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="whitespace-nowrap">{season.seasonName}</span>
                        {season.year && (
                          <span className="text-[10px] sm:text-xs opacity-70">({season.year})</span>
                        )}
                      </div>
                      {season.episodes && (
                        <div className="text-xs opacity-70 mt-0.5">{season.episodes} eps</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Meta Info Bar */}
            <div className="glass rounded-xl p-3 sm:p-4 lg:p-5 mb-4 sm:mb-6">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    {anime.rating ? Number(anime.rating).toFixed(1) : 'N/A'}
                  </span>
                </div>
                {listStatus.score && (
                  <>
                    <div className="h-6 w-px bg-white/20"></div>
                    <div className="text-sm">
                      <div className="text-gray-500">Your Rating</div>
                      <div className="text-white font-bold">{listStatus.score}/10</div>
              </div>
                  </>
                )}
                <div className="h-4 sm:h-6 w-px bg-white/20"></div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                  {anime.year && <span className="text-white font-medium">{anime.year}</span>}
                  {anime.episodes && (
                    <>
                      <span>•</span>
                      <span>{anime.episodes} eps</span>
                    </>
                  )}
                  {anime.duration && (
                    <>
                      <span>•</span>
                      <span>{anime.duration}m</span>
                    </>
                  )}
                  {anime.studio && (
                    <>
                      <span>•</span>
                      <span className="text-white">{anime.studio}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                {anime.genres.map((genre: any, index: number) => {
                  const genreName = genre.name || genre.slug || genre
                  return (
                    <Link key={index} href={`/search?genre=${encodeURIComponent(genreName)}`}>
                      <Badge className="bg-white/10 text-white border-white/20 px-3 py-1.5 sm:px-4 hover:bg-white/20 cursor-pointer transition-colors text-xs sm:text-sm">
                        {genreName}
                      </Badge>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* Where to Watch */}
            {/* Streaming Platform Links */}
            <div className="mb-4 sm:mb-6">
              <StreamingLinks animeTitle={anime.titleEnglish || anime.title} />
            </div>

            {/* Synopsis */}
            {anime.synopsis && (
              <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2 sm:mb-3">Synopsis</h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-300 leading-relaxed">{anime.synopsis}</p>
              </div>
            )}

            {/* Personal Notes */}
            {isAuthenticated && (
              <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white">Personal Notes</h2>
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
                    className="prose prose-invert max-w-none p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    dangerouslySetInnerHTML={{ __html: userNotes }}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No personal notes yet. Add your thoughts about this anime!</p>
                  </div>
                )}
              </div>
            )}

            {/* Background */}
            {anime.background && (
              <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2 sm:mb-3">Background</h2>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{anime.background}</p>
              </div>
            )}

            {/* Additional Info */}
            <div className="glass rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <h3 className="text-xs sm:text-sm font-bold text-white mb-3 flex items-center gap-2">
                <div className="h-0.5 w-4 sm:w-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
                {(anime as AnimeDetail).source && (
                  <div className="bg-white/5 rounded-lg px-2.5 sm:px-3 py-2 border border-white/10">
                    <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5 uppercase tracking-wide">
                      Source
                    </div>
                    <div className="text-xs sm:text-sm text-white font-medium">
                      {(anime as AnimeDetail).source}
                    </div>
                  </div>
                )}
                {(anime as AnimeDetail).aired && (
                  <div className="bg-white/5 rounded-lg px-2.5 sm:px-3 py-2 border border-white/10">
                    <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5 uppercase tracking-wide">
                      Aired
                    </div>
                    <div className="text-xs sm:text-sm text-white font-medium">
                      {(anime as AnimeDetail).aired}
                    </div>
                  </div>
                )}
                {(anime as AnimeDetail).broadcast && (
                  <div className="bg-white/5 rounded-lg px-2.5 sm:px-3 py-2 border border-white/10">
                    <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5 uppercase tracking-wide">
                      Broadcast
                    </div>
                    <div className="text-xs sm:text-sm text-white font-medium">
                      {(anime as AnimeDetail).broadcast}
                    </div>
                  </div>
                )}
                {anime.season && (
                  <div className="bg-white/5 rounded-lg px-2.5 sm:px-3 py-2 border border-white/10">
                    <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5 uppercase tracking-wide">
                      Season
                    </div>
                    <div className="text-xs sm:text-sm text-white font-medium capitalize">
                      {anime.season} {anime.year}
                    </div>
                  </div>
                )}
                {(anime as AnimeDetail).studios && (anime as AnimeDetail).studios!.length > 0 && (
                  <div className="bg-white/5 rounded-lg px-2.5 sm:px-3 py-2 border border-white/10 md:col-span-2">
                    <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5 uppercase tracking-wide">
                      Studios
                    </div>
                    <div className="text-xs sm:text-sm text-white font-medium flex flex-wrap gap-1 sm:gap-2">
                      {(anime as AnimeDetail).studios!.map((studio, index) => (
                        <span key={index}>
                          <Link
                            href={`/studio/${studio.replace(/\s+/g, '-')}`}
                            className="hover:text-primary-400 transition-colors"
                          >
                            {studio}
                          </Link>
                          {index < (anime as AnimeDetail).studios!.length - 1 && <span>, </span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(anime as AnimeDetail).producers &&
                  (anime as AnimeDetail).producers!.length > 0 && (
                    <div className="bg-white/5 rounded-lg px-2.5 sm:px-3 py-2 border border-white/10 md:col-span-2">
                      <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5 uppercase tracking-wide">
                        Producers
                      </div>
                      <div className="text-xs sm:text-sm text-white font-medium">
                        {(anime as AnimeDetail).producers!.join(', ')}
                      </div>
                    </div>
                  )}
                {(anime as AnimeDetail).licensors &&
                  (anime as AnimeDetail).licensors!.length > 0 && (
                    <div className="bg-white/5 rounded-lg px-2.5 sm:px-3 py-2 border border-white/10 md:col-span-2">
                      <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5 uppercase tracking-wide">
                        Licensors
                      </div>
                      <div className="text-xs sm:text-sm text-white font-medium">
                        {(anime as AnimeDetail).licensors!.join(', ')}
                      </div>
                    </div>
                  )}
                {(anime as AnimeDetail).themes && (anime as AnimeDetail).themes!.length > 0 && (
                  <div className="bg-white/5 rounded-lg px-2.5 sm:px-3 py-2 border border-white/10 md:col-span-2">
                    <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5 uppercase tracking-wide">
                      Themes
                    </div>
                    <div className="text-xs sm:text-sm text-white font-medium">
                      {(anime as AnimeDetail).themes!.join(', ')}
                    </div>
                  </div>
                )}
                {(anime as AnimeDetail).demographics &&
                  (anime as AnimeDetail).demographics!.length > 0 && (
                    <div className="bg-white/5 rounded-lg px-2.5 sm:px-3 py-2 border border-white/10 md:col-span-2">
                      <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5 uppercase tracking-wide">
                        Demographic
                      </div>
                      <div className="text-xs sm:text-sm text-white font-medium">
                        {(anime as AnimeDetail).demographics!.join(', ')}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Recommendations */}
            {relatedSeasons.length > 1 && (
              <div className="mt-6 sm:mt-8 lg:mt-12">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4 lg:mb-6">
                  More from this Series
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {relatedSeasons
                    .filter((season) => season.slug !== slug)
                    .map((season) => (
                      <AnimeCard
                        key={season.animeId || season.slug}
                        anime={{
                          ...season,
                          id: season.animeId || season.id,
                          rating: season.averageRating || 0,
                          tags: [],
                          genres: season.genres || [],
                        }}
                        variant="grid"
                      />
                    ))}
                </div>
              </div>
            )}

            {similarAnime.length > 0 && (
              <div className="mt-6 sm:mt-8 lg:mt-12">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4 lg:mb-6">
                  You Might Also Like
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {similarAnime.map((similar) => (
                    <AnimeCard key={similar.id} anime={similar} variant="grid" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add to List Modal */}
      {showAddToListModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddToListModal(false)}
        >
          <div
            className="glass rounded-2xl p-4 sm:p-6 lg:p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Add to Your List</h2>
            <p className="text-gray-400 text-sm mb-4 sm:mb-6">Choose where you'd like to save this anime</p>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
              {[
                { value: 'watching', label: 'Watching', icon: Play },
                { value: 'completed', label: 'Completed', icon: Check },
                { value: 'plan-to-watch', label: 'Plan to Watch', icon: Bookmark },
                { value: 'favorite', label: 'Favorite', icon: Heart },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setSelectedListStatus(
                      option.value as 'watching' | 'completed' | 'plan-to-watch' | 'favorite'
                    )
                  }
                  className={`p-3 sm:p-4 rounded-xl transition-all flex flex-col items-center gap-2 min-h-[80px] sm:min-h-[100px] ${
                    selectedListStatus === option.value
                      ? 'bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border-2 border-primary-400/50 shadow-lg shadow-primary-500/20'
                      : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <option.icon
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${selectedListStatus === option.value ? 'text-primary-400' : 'text-gray-400'}`}
                  />
                  <span
                    className={`text-xs sm:text-sm font-medium ${selectedListStatus === option.value ? 'text-white' : 'text-gray-300'}`}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 sm:gap-3">
              <Button
                onClick={() => setShowAddToListModal(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10 min-h-[44px] text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToList}
                disabled={isSubmitting || !selectedListStatus}
                className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white disabled:opacity-50 min-h-[44px] text-sm sm:text-base"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add to List'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowRatingModal(false)}
        >
          <div
            className="glass rounded-2xl p-4 sm:p-6 lg:p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
              Rate {anime.titleEnglish || anime.title}
            </h2>

            <div className="mb-4 sm:mb-6">
              <div className="flex justify-center gap-1 sm:gap-2 mb-3 sm:mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    onMouseEnter={() => setHoverRating(rating)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setUserRating(rating)}
                    className="transition-transform hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Star
                      className={`h-6 w-6 sm:h-8 sm:w-8 ${
                        rating <= (hoverRating || userRating)
                          ? 'text-primary-400 fill-current'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-white text-base sm:text-lg font-semibold">
                {userRating > 0 ? `${userRating} / 10` : 'Select a rating'}
              </p>
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Write a review (optional)
              </label>
              <textarea
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                placeholder="Share your thoughts about this anime..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{userReview.length}/500</p>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <Button
                onClick={() => {
                  setShowRatingModal(false)
                  setUserReview('')
                }}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10 min-h-[44px] text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRating}
                disabled={isSubmitting || userRating === 0}
                className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white disabled:opacity-50 min-h-[44px] text-sm sm:text-base"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Rating'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
