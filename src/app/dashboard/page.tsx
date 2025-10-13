'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimeCard } from '../../components/anime/AnimeCard'
import { RecommendationCarousel } from '../../components/recommendations/RecommendationCarousel'
import { FriendsWatching } from '../../components/social/FriendsWatching'
import { EmailVerificationBanner } from '../../components/EmailVerificationBanner'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { CarouselSkeleton } from '../../components/ui/skeleton'
import { LoadingState } from '../../components/ui/loading-state'
import { EmptyState, ErrorState } from '../../components/ui/error-state'
import { 
  Sparkles, 
  TrendingUp, 
  Heart, 
  Compass, 
  Gem, 
  Target,
  Clock,
  Calendar,
  Users,
  Star
} from 'lucide-react'
import { apiGetAllAnime, apiGetAllSeries, apiGetTrending } from '../lib/api'
import { useAuth } from '../lib/auth-context'
import { groupAnimeIntoSeries } from '../../lib/series-grouping'
import type { Anime } from '../../types/anime'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([])
  const [allAnime, setAllAnime] = useState<Anime[]>([])
  const [allSeries, setAllSeries] = useState<any[]>([]) // Grouped series
  const [forYouRecs, setForYouRecs] = useState<any[]>([])
  const [fansLikeYouRecs, setFansLikeYouRecs] = useState<any[]>([])
  const [friendRecs, setFriendRecs] = useState<any[]>([])
  const [hiddenGemsRecs, setHiddenGemsRecs] = useState<any[]>([])
  const [discoveryRecs, setDiscoveryRecs] = useState<any[]>([])
  const [continueWatching, setContinueWatching] = useState<any[]>([])
  const [newReleases, setNewReleases] = useState<any[]>([])
  const [topRatedSeries, setTopRatedSeries] = useState<any[]>([]) // Grouped series
  const [recentlyAddedSeries, setRecentlyAddedSeries] = useState<any[]>([]) // Grouped series
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/trpc'
  const getAuthHeaders = (): Record<string, string> => {
    // Check both localStorage (Remember Me) and sessionStorage (current session)
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (token) {
      headers['Authorization'] = 'Bearer ' + token
    }
    return headers
  }

  // Check onboarding status
  useEffect(() => {
    async function checkOnboarding() {
      if (!isAuthenticated) return
      
      try {
        const response = await fetch(`${API_URL}/onboarding.getStatus`, {
          method: 'GET',
          headers: getAuthHeaders()
        })
        
        const data = await response.json()
        if (data.result?.data && !data.result.data.completed) {
          // Redirect to onboarding if not completed
          router.push('/onboarding')
        } else {
          setShowOnboarding(false)
        }
      } catch (err) {
        // Ignore errors for onboarding check
      }
    }

    checkOnboarding()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  useEffect(() => {
    const loadAnime = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Load basic trending/all anime (works for guests too)
        const [trending, all, series] = await Promise.all([
          apiGetTrending(),
          apiGetAllAnime(),
          apiGetAllSeries()
        ])
        
        // Group trending anime into series
        const trendingList = Array.isArray(trending) ? trending : []
        const groupedTrending = groupAnimeIntoSeries(trendingList)
        setTrendingAnime(groupedTrending)
        
        // Store series data
        if (series && typeof series === 'object' && 'series' in series) {
          const seriesList = Array.isArray(series.series) ? series.series : []
          setAllSeries(seriesList)
          
          // Top Rated Series
          const topRated = [...seriesList]
            .filter(s => s.rating && s.rating > 0)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 20)
          setTopRatedSeries(topRated)
        }
        
        if (all && typeof all === 'object' && 'anime' in all) {
          const animeList = Array.isArray(all.anime) ? all.anime : []
          setAllAnime(animeList)
          
          // Group all anime and generate sections
          if (animeList.length > 0) {
            const allGrouped = groupAnimeIntoSeries(animeList)
            
            // Recently Added: Sort by most recent year
            const recentlyAdded = [...allGrouped]
              .sort((a, b) => {
                // Sort by most recent year
                return (b.year || 0) - (a.year || 0)
              })
              .slice(0, 20)
            setRecentlyAddedSeries(recentlyAdded)
          }
        } else if (Array.isArray(all)) {
          setAllAnime(all)
        } else {
          setAllAnime([])
        }

        // Load personalized recommendations if authenticated
        if (isAuthenticated) {
          loadPersonalizedRecommendations()
        }
      } catch (err: unknown) {
        console.error('❌ Failed to load anime:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to load anime data'
        setError(errorMessage)
        setTrendingAnime([])
        setAllAnime([])
      } finally {
        setIsLoading(false)
      }
    }

    loadAnime()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  async function loadPersonalizedRecommendations() {
    try {
      const headers = getAuthHeaders()
      const [forYou, fansLikeYou, friendRecs, hiddenGems, discovery, continueWatch, newAnime] = await Promise.all([
        fetch(`${API_URL}/recommendations.getForYou`, {
          method: 'GET',
          headers
        }).then(r => r.json()),
        fetch(`${API_URL}/recommendations.getFansLikeYou`, {
          method: 'GET',
          headers
        }).then(r => r.json()),
        fetch(`${API_URL}/social.getFriendRecommendations`, {
          method: 'GET',
          headers
        }).then(r => r.json()),
        fetch(`${API_URL}/recommendations.getHiddenGems`, {
          method: 'GET',
          headers
        }).then(r => r.json()),
        fetch(`${API_URL}/recommendations.getDiscovery`, {
          method: 'GET',
          headers
        }).then(r => r.json()),
        fetch(`${API_URL}/recommendations.getContinueWatching`, {
          method: 'GET',
          headers
        }).then(r => r.json()),
        fetch(`${API_URL}/recommendations.getNewReleases`, {
          method: 'GET',
          headers
        }).then(r => r.json())
      ])

      setForYouRecs(forYou.result?.data?.recommendations || [])
      setFansLikeYouRecs(fansLikeYou.result?.data?.recommendations || [])
      setFriendRecs(friendRecs.result?.data?.recommendations || [])
      setHiddenGemsRecs(hiddenGems.result?.data?.recommendations || [])
      setDiscoveryRecs(discovery.result?.data?.recommendations || [])
      setContinueWatching(continueWatch.result?.data?.recommendations || [])
      setNewReleases(newAnime.result?.data?.recommendations || [])
    } catch (err) {
      // Non-critical, just won't show personalized recommendations
    }
  }

  async function handleDismissRecommendation(animeId: string) {
    try {
      await fetch(`${API_URL}/recommendations.submitFeedback`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          animeId,
          feedbackType: 'dismiss'
        })
      })

      // Remove from all recommendation lists
      setForYouRecs(forYouRecs.filter(r => r.anime.id !== animeId))
      setFansLikeYouRecs(fansLikeYouRecs.filter(r => r.anime.id !== animeId))
      setHiddenGemsRecs(hiddenGemsRecs.filter(r => r.anime.id !== animeId))
      setDiscoveryRecs(discoveryRecs.filter(r => r.anime.id !== animeId))
    } catch (err) {
      // Fail silently
    }
  }

  if (isLoading) {
    return <LoadingState variant="full" text="Loading your personalized dashboard..." size="lg" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 pt-32">
        <ErrorState
          variant="full"
          error={error}
          title="Failed to load dashboard"
          onRetry={() => window.location.reload()}
          showHome={false}
        />
      </div>
    )
  }

  // Old loading skeleton (kept as fallback)
  if (false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <main className="container px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 relative z-10">
          {/* Loading Skeletons */}
          <CarouselSkeleton itemCount={5} />
          <CarouselSkeleton itemCount={5} />
          <CarouselSkeleton itemCount={5} />
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="container px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 relative z-10">
        {/* Email Verification Banner */}
        {isAuthenticated && user && !user.emailVerified && (
          <EmailVerificationBanner email={user.email} />
        )}

        {/* Onboarding Banner - Responsive */}
        {showOnboarding && isAuthenticated && (
          <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border-2 border-primary-500/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                    Get Personalized Recommendations!
                  </h3>
                  <p className="text-sm sm:text-base text-gray-300">
                    Tell us what you like and Senpai will find your perfect anime match ✨
          </p>
        </div>
              </div>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  onClick={() => setShowOnboarding(false)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 flex-1 sm:flex-initial"
                >
                  Later
                </Button>
                <Button
                  onClick={() => router.push('/onboarding')}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 flex-1 sm:flex-initial"
                >
                  Let's Go!
                </Button>
              </div>
            </div>
              </div>
            )}

        {/* Hero Section - Responsive */}
        <div className="mb-8 sm:mb-10 lg:mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4 sm:mb-6">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-400" />
            <span className="text-xs sm:text-sm text-gray-300">
              {isAuthenticated ? 'Your Personalized Dashboard' : 'Discover Your Next Obsession'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-primary-400 to-secondary-400 bg-clip-text text-transparent px-4">
            {isAuthenticated ? `Welcome Back${user?.name ? `, ${user.name}` : ''}!` : 'Discover Amazing Anime'}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-4">
            {isAuthenticated 
              ? 'Here are anime recommendations just for you'
              : 'Personalized recommendations powered by your taste'
            }
          </p>
        </div>

        {/* Personalized Recommendations (Authenticated Users Only) */}
        {isAuthenticated && (
          <>
            {/* Continue Watching */}
            {continueWatching.length > 0 && (
              <RecommendationCarousel
                title="Continue Watching"
                icon={<Clock className="h-5 w-5 text-primary-400" />}
                recommendations={continueWatching}
                onDismiss={handleDismissRecommendation}
                showReasons={false}
              />
            )}

            {/* For You - Main Personalized Feed (Hybrid: Content + Collaborative) */}
            {forYouRecs.length > 0 && (
              <RecommendationCarousel
                title="For You"
                icon={<Heart className="h-5 w-5 text-primary-400" />}
                recommendations={forYouRecs}
                onDismiss={handleDismissRecommendation}
                showReasons={true}
              />
            )}

            {/* Trending Now - For logged-in users too - Grouped by series */}
            {trendingAnime.length > 0 && (
              <RecommendationCarousel
                title="Trending Now"
                icon={<TrendingUp className="h-5 w-5 text-secondary-400" />}
                recommendations={trendingAnime.map(series => ({
                  anime: {
                    id: series.id,
                    slug: series.slug,
                    title: series.title,
                    titleEnglish: series.titleEnglish || series.displayTitle,
                    titleJapanese: series.titleJapanese,
                    titleSynonyms: series.titleSynonyms,
                    coverImage: series.coverImage ?? null,
                    year: series.year ?? null,
                    averageRating: series.rating || series.averageRating,
                    genres: series.genres || [],
                    seasonCount: series.seasonCount,
                    totalEpisodes: series.totalEpisodes
                  }
                }))}
                showReasons={false}
              />
            )}

            {/* Friends Are Watching - Social Recommendations */}
            <FriendsWatching />

            {/* Popular Series - Grouped by series like Crunchyroll */}
            {allSeries.length > 0 && (
              <RecommendationCarousel
                title="Popular Anime"
                icon={<Sparkles className="h-5 w-5 text-primary-400" />}
                recommendations={allSeries.slice(0, 20).map(series => ({
                  anime: {
                    id: series.id,
                    slug: series.slug,
                    title: series.title,
                    titleEnglish: series.titleEnglish || series.displayTitle,
                    titleJapanese: series.titleJapanese,
                    titleSynonyms: series.titleSynonyms,
                    coverImage: series.coverImage ?? null,
                    year: series.year ?? null,
                    averageRating: series.rating ?? null,
                    genres: series.genres || [],
                    // Add season metadata for badge display
                    seasonCount: series.seasonCount,
                    totalEpisodes: series.totalEpisodes
                  }
                }))}
                showReasons={false}
              />
            )}

            {/* Fans Like You Also Watched - Pure Collaborative Filtering */}
            {fansLikeYouRecs.length > 0 && (
              <RecommendationCarousel
                title="Fans Like You Also Watched"
                icon={<Target className="h-5 w-5 text-secondary-400" />}
                recommendations={fansLikeYouRecs}
                onDismiss={handleDismissRecommendation}
                showReasons={true}
              />
            )}

            {/* Hidden Gems */}
            {hiddenGemsRecs.length > 0 && (
              <RecommendationCarousel
                title="Hidden Gems You'll Love"
                icon={<Gem className="h-5 w-5 text-primary-400" />}
                recommendations={hiddenGemsRecs}
                onDismiss={handleDismissRecommendation}
                showReasons={true}
              />
            )}

            {/* Top Rated Series - Grouped */}
            {topRatedSeries.length > 0 && (
              <RecommendationCarousel
                title="Top Rated Anime"
                icon={<Star className="h-5 w-5 text-warning-400" />}
                recommendations={topRatedSeries.map(series => ({
                  anime: {
                    id: series.id,
                    slug: series.slug,
                    title: series.title,
                    titleEnglish: series.titleEnglish || series.displayTitle,
                    titleJapanese: series.titleJapanese,
                    titleSynonyms: series.titleSynonyms,
                    coverImage: series.coverImage ?? null,
                    year: series.year ?? null,
                    averageRating: series.rating ?? null,
                    genres: series.genres || [],
                    seasonCount: series.seasonCount,
                    totalEpisodes: series.totalEpisodes
                  }
                }))}
                showReasons={false}
              />
            )}

            {/* Expand Your Horizons */}
            {discoveryRecs.length > 0 && (
              <RecommendationCarousel
                title="Expand Your Horizons"
                icon={<Compass className="h-5 w-5 text-primary-400" />}
                recommendations={discoveryRecs}
                onDismiss={handleDismissRecommendation}
                showReasons={true}
              />
            )}

          {/* Recently Added - Grouped Series */}
            {recentlyAddedSeries.length > 0 && (
              <RecommendationCarousel
                title="Recently Added"
                icon={<Calendar className="h-5 w-5 text-success-400" />}
                recommendations={recentlyAddedSeries.map(series => ({
                  anime: {
                    id: series.id,
                    slug: series.slug,
                    title: series.title,
                    titleEnglish: series.titleEnglish || series.displayTitle,
                    titleJapanese: series.titleJapanese,
                    titleSynonyms: series.titleSynonyms,
                    coverImage: series.coverImage ?? null,
                    year: series.year ?? null,
                    averageRating: series.rating ?? null,
                    seasonCount: series.seasonCount,
                    totalEpisodes: series.totalEpisodes,
                    genres: series.genres || []
                  }
                }))}
                showReasons={false}
              />
            )}
          </>
        )}

        {/* New Releases Section */}
        {newReleases.length > 0 && (
          <RecommendationCarousel
            title="New on AnimeSenpai"
            icon={<Calendar className="h-5 w-5 text-primary-400" />}
            recommendations={newReleases}
            showReasons={false}
          />
        )}

        {/* Trending Series - Use carousel for consistency - Guest users */}
        {!isAuthenticated && trendingAnime.length > 0 && (
          <RecommendationCarousel
            title="Trending Now"
            icon={<TrendingUp className="h-5 w-5 text-primary-400" />}
            recommendations={trendingAnime.map(series => ({
              anime: {
                id: series.id,
                slug: series.slug,
                title: series.title,
                titleEnglish: series.titleEnglish || series.displayTitle,
                titleJapanese: series.titleJapanese,
                titleSynonyms: series.titleSynonyms,
                coverImage: series.coverImage ?? null,
                year: series.year ?? null,
                averageRating: series.rating || series.averageRating,
                genres: series.genres || [],
                seasonCount: series.seasonCount,
                totalEpisodes: series.totalEpisodes
              }
            }))}
            showReasons={false}
          />
        )}

        {/* Popular Series - Use carousel for consistency - Guest users */}
        {!isAuthenticated && allSeries.length > 0 && (
          <RecommendationCarousel
            title="Popular Anime"
            icon={<Sparkles className="h-5 w-5 text-primary-400" />}
            recommendations={allSeries.slice(0, 20).map(series => ({
              anime: {
                id: series.id,
                slug: series.slug,
                title: series.title,
                titleEnglish: series.titleEnglish || series.displayTitle,
                titleJapanese: series.titleJapanese,
                titleSynonyms: series.titleSynonyms,
                coverImage: series.coverImage ?? null,
                year: series.year ?? null,
                averageRating: series.rating ?? null,
                genres: series.genres || [],
                seasonCount: series.seasonCount,
                totalEpisodes: series.totalEpisodes
              }
            }))}
            showReasons={false}
          />
        )}

        {/* Empty State for Guests */}
        {!isAuthenticated && trendingAnime.length === 0 && allAnime.length === 0 && (
          <EmptyState
            icon={<Sparkles className="h-12 w-12 text-gray-500" />}
            title="No Anime Yet"
            message="The anime database is being populated. Check back soon for thousands of titles!"
            actionLabel="Sign In for Personalized Recommendations"
            onAction={() => router.push('/auth/signin')}
          />
        )}
      </main>
    </div>
  )
}
