'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimeCard } from '../../../components/anime/AnimeCard'
import { TrailerPlayer, TrailerButton } from '../../../components/anime/TrailerPlayer'
import { ShareButton } from '../../../components/social/ShareButton'
import { ShareAnimeCard } from '../../../components/social/ShareAnimeCard'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { BackButton } from '../../../components/ui/back-button'
import { DetailHeroSkeleton, AnimeCardSkeleton } from '../../../components/ui/skeleton'
import { useAuth } from '../../lib/auth-context'
import { useToast } from '../../../lib/toast-context'
import type { Anime } from '../../../types/anime'
import { 
  Play, 
  Bookmark, 
  Heart, 
  Star, 
  Check,
  Plus,
  X,
  Loader2,
  ExternalLink
} from 'lucide-react'

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
  const [reviews, setReviews] = useState<Review[]>([])
  const [listStatus, setListStatus] = useState<ListStatus>({ inList: false })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [showAddToListModal, setShowAddToListModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedListStatus, setSelectedListStatus] = useState<'watching' | 'completed' | 'plan-to-watch' | 'favorite'>('plan-to-watch')
  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState('')
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
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
            headers: { 'Content-Type': 'application/json' }
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
          
          // Fetch user's list status if authenticated
          if (isAuthenticated) {
            fetchListStatus(animeData.id)
          }
          
          // Fetch related seasons
          if (animeData.title) {
            fetchRelatedSeasons(animeData.title)
          }
          
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
  }, [slug, isAuthenticated])

  const fetchListStatus = async (animeId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/user.getAnimeList?input=${encodeURIComponent(JSON.stringify({}))}`,
        {
          method: 'GET',
          headers: getAuthHeaders()
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
          score: userAnime.score
        })
        if (userAnime.score) {
          setUserRating(userAnime.score)
        }
      }
    } catch (err) {
      console.error('Failed to fetch list status:', err)
    }
  }

  const fetchRelatedSeasons = async (title: string) => {
    try {
      // Extract base title (remove season numbers, part numbers, etc.)
      const baseTitle = title.replace(/\s+(Season|Part|S)\s*\d+/gi, '').trim()
      
      const response = await fetch(
        `${API_URL}/anime.search?input=${encodeURIComponent(JSON.stringify({ query: baseTitle, limit: 6 }))}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      )

      const data = await response.json()
      const results = data.result?.data?.anime || []
      
      // Filter to only include anime with similar titles (likely same series)
      const related = results.filter((a: Anime) => 
        a.slug !== slug && 
        a.title.toLowerCase().includes(baseTitle.toLowerCase())
      )
      
      setRelatedSeasons(related.slice(0, 6))
    } catch (err) {
      console.error('Failed to fetch related seasons:', err)
    }
  }

  const fetchSimilarAnime = async (animeId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/anime.getSimilar?input=${encodeURIComponent(JSON.stringify({ animeId, limit: 6 }))}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
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

    if (!anime) return

    const isUpdating = listStatus.inList

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/user.addToList`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          animeId: anime.id,
          status: selectedListStatus
        })
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
        score: listStatus.score
      })
      setShowAddToListModal(false)
      toast.success(isUpdating ? `Moved to ${selectedListStatus.replace('-', ' ')} list!` : `Added to ${selectedListStatus.replace('-', ' ')} list!`, 'Success')
    } catch (err) {
      console.error('Failed to add to list:', err)
      toast.error(isUpdating ? 'Failed to update list. Please try again.' : 'Failed to add to list. Please try again.', 'Error')
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
          animeId: anime.id
        })
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

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_URL}/user.rateAnime`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          animeId: anime.id,
          rating: userRating,
          review: userReview || undefined
        })
      })

      const data = await response.json()
      
      if (data.error) {
        toast.error('Failed to submit rating', 'Error')
        return
      }

      setListStatus(prev => ({ ...prev, score: userRating }))
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

  const handleShare = async () => {
    if (navigator.share && anime) {
      try {
        await navigator.share({
          title: anime.title,
          text: `Check out ${anime.title} on AnimeSenpai!`,
          url: window.location.href
        })
        toast.success('Shared successfully!', 'Success')
      } catch (err) {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!', 'Copied')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!', 'Copied')
    }
  }

  // Streaming platforms (would come from API in production)
  const streamingPlatforms = [
    { name: 'Crunchyroll', url: '#', available: true },
    { name: 'Funimation', url: '#', available: true },
    { name: 'Netflix', url: '#', available: false },
    { name: 'Hulu', url: '#', available: true },
  ].filter(p => p.available)

  if (isLoading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <main className="container pt-32 pb-20 relative z-10">
          {/* Back Button Skeleton */}
        <div className="mb-8">
            <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse"></div>
          </div>

          {/* Detail Hero Skeleton */}
          <DetailHeroSkeleton />

          {/* Where to Watch Skeleton */}
          <div className="glass rounded-2xl p-6 mb-8">
            <div className="h-8 w-48 bg-white/10 rounded-lg mb-4 animate-pulse"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/10 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Related Anime Skeleton */}
          <div className="mb-12">
            <div className="h-8 w-56 bg-white/10 rounded-lg mb-6 animate-pulse"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <AnimeCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Anime Not Found</h1>
          <p className="text-gray-400 mb-8">The anime you're looking for doesn't exist.</p>
          <Link href="/search">
            <Button className="bg-primary-500 hover:bg-primary-600">
              Browse Anime
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      <main className="container pt-28 pb-20">
        <div className="mb-8">
          <BackButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-10 max-w-7xl mx-auto">
          {/* Left: Poster & Actions */}
          <div className="md:sticky md:top-24 self-start">
            <div className="glass rounded-2xl p-2 mb-6">
              <div className="aspect-[2/3] rounded-xl overflow-hidden">
                {(anime.coverImage || anime.imageUrl) ? (
                  <img 
                    src={anime.coverImage || anime.imageUrl} 
                    alt={anime.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-500 text-6xl">🎬</span>
                  </div>
                )}
              </div>
                  </div>

            {/* Actions */}
            <div className="space-y-3 mb-6">
              {listStatus.inList ? (
                <>
                  <Button 
                    onClick={() => setShowRatingModal(true)}
                    className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white"
                    size="lg"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {listStatus.score ? `Your Rating: ${listStatus.score}/10` : 'Rate Anime'}
                  </Button>
                  <Button 
                    onClick={() => {
                      if (listStatus.status) {
                        setSelectedListStatus(listStatus.status as any)
                      }
                      setShowAddToListModal(true)
                    }}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    Change List
                  </Button>
                  <Button 
                    onClick={handleRemoveFromList}
                    variant="outline"
                    disabled={isSubmitting}
                    className="w-full border-white/20 text-white hover:bg-white/10 hover:border-red-500/50 hover:text-red-400"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
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
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white"
                  size="lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to List
                </Button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <ShareAnimeCard anime={anime} userRating={userRating} userStatus={listStatus.status} />
                {anime.trailer && <TrailerButton trailerUrl={anime.trailer} title={anime.title} />}
              </div>
            </div>
          </div>

          {/* Right: Content */}
            <div>
            {/* Title */}
            <div className="mb-6">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 leading-tight">{anime.title}</h1>
              {anime.titleEnglish && anime.titleEnglish !== anime.title && (
                <p className="text-xl text-gray-400 mb-2">{anime.titleEnglish}</p>
              )}
              {anime.titleJapanese && (
                <p className="text-sm text-gray-500">{anime.titleJapanese}</p>
              )}
            </div>

            {/* Meta Info Bar */}
            <div className="glass rounded-xl p-5 mb-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-2xl font-bold text-white">
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
                <div className="h-6 w-px bg-white/20"></div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                  {anime.year && <span className="text-white font-medium">{anime.year}</span>}
                  {anime.episodes && <><span>•</span><span>{anime.episodes} eps</span></>}
                  {anime.duration && <><span>•</span><span>{anime.duration}m</span></>}
                  {anime.studio && <><span>•</span><span className="text-white">{anime.studio}</span></>}
                </div>
              </div>
            </div>

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {anime.genres.map((genre: any, index: number) => {
                  const genreName = genre.name || genre.slug || genre;
                  return (
                    <Link 
                      key={index}
                      href={`/search?genre=${encodeURIComponent(genreName)}`}
                    >
                      <Badge 
                        className="bg-white/10 text-white border-white/20 px-4 py-1.5 hover:bg-white/20 cursor-pointer transition-colors"
                      >
                        {genreName}
                      </Badge>
                    </Link>
                  );
                })}
            </div>
            )}

            {/* Where to Watch */}
            {streamingPlatforms.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm text-gray-500 mb-3">Watch on</h3>
                <div className="flex flex-wrap gap-2">
                  {streamingPlatforms.map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
                    >
                      <span className="text-white font-medium">{platform.name}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-white transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Synopsis */}
            {anime.synopsis && (
              <div className="glass rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-3">Synopsis</h2>
                <p className="text-gray-300 leading-relaxed text-lg">{anime.synopsis}</p>
                </div>
            )}

            {/* Background */}
            {anime.background && (
              <div className="glass rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-3">Background</h2>
                <p className="text-gray-300 leading-relaxed">{anime.background}</p>
              </div>
            )}

            {/* Additional Info */}
            <div className="glass rounded-xl p-5 mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {(anime as AnimeDetail).source && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Source</span>
                    <span className="text-white font-medium">{(anime as AnimeDetail).source}</span>
                  </div>
                )}
                {(anime as AnimeDetail).aired && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Aired</span>
                    <span className="text-white font-medium text-right">{(anime as AnimeDetail).aired}</span>
                  </div>
                )}
                {(anime as AnimeDetail).broadcast && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Broadcast</span>
                    <span className="text-white font-medium">{(anime as AnimeDetail).broadcast}</span>
                  </div>
                )}
                {(anime as AnimeDetail).studios && (anime as AnimeDetail).studios!.length > 0 && (
                  <div className="flex justify-between col-span-full">
                    <span className="text-gray-500">Studios</span>
                    <span className="text-white font-medium text-right">{(anime as AnimeDetail).studios!.join(', ')}</span>
                  </div>
                )}
                {(anime as AnimeDetail).producers && (anime as AnimeDetail).producers!.length > 0 && (
                  <div className="flex justify-between col-span-full">
                    <span className="text-gray-500">Producers</span>
                    <span className="text-white font-medium text-right">{(anime as AnimeDetail).producers!.join(', ')}</span>
                  </div>
                )}
                {(anime as AnimeDetail).licensors && (anime as AnimeDetail).licensors!.length > 0 && (
                  <div className="flex justify-between col-span-full">
                    <span className="text-gray-500">Licensors</span>
                    <span className="text-white font-medium text-right">{(anime as AnimeDetail).licensors!.join(', ')}</span>
                  </div>
                )}
                {(anime as AnimeDetail).themes && (anime as AnimeDetail).themes!.length > 0 && (
                  <div className="flex justify-between col-span-full">
                    <span className="text-gray-500">Themes</span>
                    <span className="text-white font-medium text-right">{(anime as AnimeDetail).themes!.join(', ')}</span>
                  </div>
                )}
                {(anime as AnimeDetail).demographics && (anime as AnimeDetail).demographics!.length > 0 && (
                  <div className="flex justify-between col-span-full">
                    <span className="text-gray-500">Demographic</span>
                    <span className="text-white font-medium text-right">{(anime as AnimeDetail).demographics!.join(', ')}</span>
                </div>
                )}
                {anime.season && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Season</span>
                    <span className="text-white font-medium capitalize">{anime.season} {anime.year}</span>
              </div>
                )}
                {(anime as AnimeDetail).malId && (
                  <div className="flex justify-between col-span-full">
                    <span className="text-gray-500">MAL ID</span>
                    <a 
                      href={`https://myanimelist.net/anime/${(anime as AnimeDetail).malId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 font-medium"
                    >
                      #{(anime as AnimeDetail).malId} →
                    </a>
                </div>
                )}
              </div>
            </div>

          {/* Recommendations */}
          {relatedSeasons.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">More from this Series</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {relatedSeasons.map((season) => (
                  <AnimeCard key={season.id} anime={season} variant="grid" />
                ))}
              </div>
            </div>
          )}

          {similarAnime.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">You Might Also Like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddToListModal(false)}>
          <div className="glass rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-2">Add to Your List</h2>
            <p className="text-gray-400 text-sm mb-6">Choose where you'd like to save this anime</p>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { value: 'watching', label: 'Watching', icon: Play },
                { value: 'completed', label: 'Completed', icon: Check },
                { value: 'plan-to-watch', label: 'Plan to Watch', icon: Bookmark },
                { value: 'favorite', label: 'Favorite', icon: Heart }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedListStatus(option.value as any)}
                  className={`p-4 rounded-xl transition-all flex flex-col items-center gap-2 ${
                    selectedListStatus === option.value
                      ? 'bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border-2 border-primary-400/50 shadow-lg shadow-primary-500/20'
                      : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <option.icon className={`h-6 w-6 ${selectedListStatus === option.value ? 'text-primary-400' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${selectedListStatus === option.value ? 'text-white' : 'text-gray-300'}`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowAddToListModal(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToList}
                disabled={isSubmitting || !selectedListStatus}
                className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add to List'}
              </Button>
          </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowRatingModal(false)}>
          <div className="glass rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-6">Rate {anime.title}</h2>
            
            <div className="mb-6">
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    onMouseEnter={() => setHoverRating(rating)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setUserRating(rating)}
                    className="transition-transform hover:scale-110"
                  >
                        <Star
                      className={`h-8 w-8 ${
                        rating <= (hoverRating || userRating)
                          ? 'text-primary-400 fill-current'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-white text-lg font-semibold">
                {userRating > 0 ? `${userRating} / 10` : 'Select a rating'}
              </p>
        </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Write a review (optional)
              </label>
              <textarea
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                placeholder="Share your thoughts about this anime..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{userReview.length}/500</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowRatingModal(false)
                  setUserReview('')
                }}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRating}
                disabled={isSubmitting || userRating === 0}
                className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Submit Rating'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  )
}
