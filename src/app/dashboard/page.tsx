'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import dynamicImport from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { EmailVerificationBanner } from '../../components/EmailVerificationBanner'
import { Button } from '../../components/ui/button'
import { LoadingState } from '../../components/ui/loading-state'
import { EmptyState, ErrorState } from '../../components/ui/error-state'
import { PullToRefresh } from '../../components/gestures/PullToRefresh'
import {
  Sparkles,
  TrendingUp,
  Heart,
  Compass,
  Gem,
  Target,
  Clock,
  Calendar,
  Star,
  Filter,
  Crown,
  RefreshCw,
  X,
  ChevronUp,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { apiGetAllAnime, apiGetAllSeries, apiGetTrending, api } from '../lib/api'
import { useAuth } from '../lib/auth-context'
import { groupAnimeIntoSeries } from '../../lib/series-grouping'
import type { Anime } from '../../types/anime'
import { logger, captureException } from '../../lib/logger'
import { SEOMetadata } from '../../components/SEOMetadata'

// Lazy load heavy components
const RecommendationCarousel = dynamicImport(
  () =>
    import('../../components/recommendations/RecommendationCarousel').then((mod) => ({
      default: mod.RecommendationCarousel,
    })),
  { loading: () => <div className="h-64 animate-pulse bg-white/5 rounded-xl" /> }
)

// Simple inline component to avoid chunk loading issues
function FriendsWatching() {
  return (
    <div className="rounded-xl bg-white/5 p-6">
      <h2 className="text-xl font-semibold mb-4">Friends Are Watching</h2>
      <p className="text-white/60">No friends activity to show right now.</p>
    </div>
  )
}

const CarouselSkeleton = dynamicImport(
  () => import('../../components/ui/skeleton').then((mod) => ({ default: mod.CarouselSkeleton })),
  { ssr: false }
)

// Section wrapper component for personalization
interface SectionWrapperProps {
  sectionId: string
  title: string
  isDismissed: boolean
  isCollapsed: boolean
  onDismiss: () => void
  onRestore: () => void
  onToggleCollapse: () => void
  children: React.ReactNode
}

function SectionWrapper({
  sectionId,
  title,
  isDismissed,
  isCollapsed,
  onDismiss,
  onRestore,
  onToggleCollapse,
  children,
}: SectionWrapperProps) {
  if (isDismissed) {
    return (
      <div className="mb-4 p-4 glass rounded-xl border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <X className="h-5 w-5 text-gray-500" />
          <span className="text-gray-400 text-sm">"{title}" section is hidden</span>
        </div>
        <Button
          onClick={onRestore}
          variant="outline"
          size="sm"
          className="border-white/20 text-white hover:bg-white/10"
        >
          Restore
        </Button>
      </div>
    )
  }

  return (
    <div className="relative group">
      {isCollapsed ? (
        <div className="mb-8 sm:mb-10 lg:mb-12 p-4 glass rounded-xl border border-white/10 cursor-pointer hover:bg-white/5 transition-all" onClick={onToggleCollapse}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChevronRight className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{title}</h2>
            </div>
            <span className="text-sm text-gray-400">Click to expand</span>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  )
}


export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([])
  const [allAnime, setAllAnime] = useState<Anime[]>([])
  const [allSeries, setAllSeries] = useState<any[]>([]) // Grouped series
  const [forYouRecs, setForYouRecs] = useState<any[]>([])
  const [fansLikeYouRecs, setFansLikeYouRecs] = useState<any[]>([])
  const [_friendRecs, setFriendRecs] = useState<any[]>([])
  const [hiddenGemsRecs, setHiddenGemsRecs] = useState<any[]>([])
  const [discoveryRecs, setDiscoveryRecs] = useState<any[]>([])
  const [continueWatching, setContinueWatching] = useState<any[]>([])
  const [topRatedSeries, setTopRatedSeries] = useState<any[]>([]) // Grouped series
  const [recentlyAddedSeries, setRecentlyAddedSeries] = useState<any[]>([]) // Grouped series
  const [seasonalSeries, setSeasonalSeries] = useState<any[]>([]) // Seasonal anime
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sectionLoadingStates, setSectionLoadingStates] = useState({
    secondary: false,
    personalized: false,
    seasonal: false,
  })
  const [dismissedSections, setDismissedSections] = useState<Set<string>>(new Set())
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  // Load dashboard preferences from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('dashboard:sections')
      if (stored) {
        const data = JSON.parse(stored)
        if (data.dismissed) setDismissedSections(new Set(data.dismissed))
        if (data.collapsed) setCollapsedSections(new Set(data.collapsed))
      }
    } catch (err) {
      console.warn('Failed to load dashboard preferences:', err)
    }
  }, [])

  // Save dashboard preferences to localStorage
  const saveDashboardPreferences = () => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(
        'dashboard:sections',
        JSON.stringify({
          dismissed: Array.from(dismissedSections),
          collapsed: Array.from(collapsedSections),
        })
      )
    } catch (err) {
      console.warn('Failed to save dashboard preferences:', err)
    }
  }

  useEffect(() => {
    saveDashboardPreferences()
  }, [dismissedSections, collapsedSections])

  const handleDismissSection = (sectionId: string) => {
    setDismissedSections((prev) => {
      const next = new Set(prev)
      next.add(sectionId)
      return next
    })
  }

  const handleRestoreSection = (sectionId: string) => {
    setDismissedSections((prev) => {
      const next = new Set(prev)
      next.delete(sectionId)
      return next
    })
  }

  const handleToggleCollapse = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }


  // Helper to map series objects into recommendation card shape
  const mapSeriesToRecs = (list: any[]) =>
    (Array.isArray(list) ? list : [])
      .filter((s) => s && s.slug)
      .map((series) => ({
        anime: {
          id: series.id,
          slug: series.slug,
          title: series.title,
          titleEnglish: series.titleEnglish || series.displayTitle,
          titleJapanese: series.titleJapanese,
          titleSynonyms: series.titleSynonyms,
          coverImage: series.coverImage ?? null,
          year: series.year ?? null,
          averageRating: series.rating || series.averageRating || null,
          genres: series.genres || [],
          seasonCount: series.seasonCount,
          totalEpisodes: series.totalEpisodes,
        },
      }))

  // Helper to map any series/list to recommendation format (reusable)
  const mapToRecommendations = (seriesList: any[]) => {
    return mapSeriesToRecs(seriesList) as any
  }

  // Load seasonal anime
  async function loadSeasonalAnime() {
    try {
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth()
      const season =
        currentMonth < 3
          ? 'winter'
          : currentMonth < 6
            ? 'spring'
            : currentMonth < 9
              ? 'summer'
              : 'fall'

      const data = (await api.trpcQuery('anime.getAll', {
        page: 1,
        limit: 20,
        seasons: [season],
        years: [currentYear],
        sortBy: 'averageRating',
        sortOrder: 'desc',
      })) as any

      const animeList = data?.anime || []
      if (animeList.length > 0) {
        const grouped = groupAnimeIntoSeries(animeList)
        setSeasonalSeries(grouped)
      }
    } catch (err) {
      console.error('Failed to load seasonal anime:', err)
    }
  }


  // Refresh all recommendations
  async function refreshRecommendations() {
    setIsRefreshing(true)
    try {
      // Clear existing data
      setForYouRecs([])
      setFansLikeYouRecs([])
      setHiddenGemsRecs([])
      setDiscoveryRecs([])
      setContinueWatching([])
      setTrendingAnime([])
      setTopRatedSeries([])
      setRecentlyAddedSeries([])
      setAllSeries([])
      setSeasonalSeries([])

      // Reload data
      await Promise.all([
        loadAllRecommendations(),
        isAuthenticated ? loadPersonalizedRecommendations() : Promise.resolve(),
        loadSeasonalAnime(),
      ])
    } catch (err) {
      console.error('Failed to refresh recommendations:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Use shared API client helpers (headers handled centrally)

  // Check onboarding status
  useEffect(() => {
    async function checkOnboarding() {
      if (!isAuthenticated) return

      try {
        const data = (await api.trpcQuery('onboarding.getStatus')) as any
        if (data && !data.completed) {
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
        // Load all recommendation-based data
        setIsLoading(false)

        // Load all recommendation sections in background (non-blocking)
        setTimeout(async () => {
          setSectionLoadingStates((prev) => ({ ...prev, secondary: true }))
          await loadAllRecommendations()
          setSectionLoadingStates((prev) => ({ ...prev, secondary: false }))
        }, 100)

        // Load personalized recommendations if authenticated (also background)
        if (isAuthenticated) {
          setTimeout(async () => {
            setSectionLoadingStates((prev) => ({ ...prev, personalized: true }))
            await loadPersonalizedRecommendations()
            setSectionLoadingStates((prev) => ({ ...prev, personalized: false }))
          }, 200)
        }

        // Load seasonal content in background
        setTimeout(async () => {
          setSectionLoadingStates((prev) => ({ ...prev, seasonal: true }))
          await loadSeasonalAnime()
          setSectionLoadingStates((prev) => ({ ...prev, seasonal: false }))
        }, 300)
      } catch (err: unknown) {
        console.error('❌ Failed to load anime:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to load anime data'
        setError(errorMessage)
        setIsLoading(false)
      }
    }

    loadAnime()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  // Load all recommendation-based sections
  async function loadAllRecommendations() {
    try {
      // Use Promise.allSettled to handle errors gracefully
      const [trendingResult, popularResult, topRatedResult] = await Promise.allSettled([
        api.trpcQuery('recommendations.getTrending', { limit: 20 }),
        api.trpcQuery('anime.getAll', { 
          limit: 20, 
          sortBy: 'popularity', 
          sortOrder: 'desc' 
        }),
        api.trpcQuery('anime.getAll', { 
          limit: 20, 
          sortBy: 'averageRating', 
          sortOrder: 'desc',
          minRating: 7.0
        }),
      ])

      // Helper to extract data from Promise result
      const getData = (result: PromiseSettledResult<any>) => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          console.error('API call failed:', result.reason)
          return null
        }
      }

      // Process Trending - from recommendations system
      const trendingData = getData(trendingResult)
      if (trendingData?.recommendations) {
        const trendingRecs = (trendingData.recommendations || []).map((r: any) => ({
          id: r.anime.id,
          slug: r.anime.slug,
          title: r.anime.title,
          titleEnglish: r.anime.titleEnglish,
          coverImage: r.anime.coverImage,
          year: r.anime.year,
          rating: r.anime.averageRating,
          genres: r.anime.genres || [],
        }))
        setTrendingAnime(trendingRecs)
      }

      // Process Popular - from anime.getAll with popularity sort
      const popularData = getData(popularResult)
      if (popularData?.anime) {
        const popularList = Array.isArray(popularData.anime) ? popularData.anime : []
        const groupedPopular = groupAnimeIntoSeries(popularList)
        setAllSeries(groupedPopular)
      }

      // Process Top Rated - from anime.getAll with rating sort
      const topRatedData = getData(topRatedResult)
      if (topRatedData?.anime) {
        const topRatedList = Array.isArray(topRatedData.anime) ? topRatedData.anime : []
        const groupedTopRated = groupAnimeIntoSeries(topRatedList)
        setTopRatedSeries(groupedTopRated)
        
        // Also store all anime for recently added
        setAllAnime(topRatedList)

          // Recently Added: Sort by most recent year
        const recentlyAdded = [...groupedTopRated]
          .sort((a, b) => (b.year || 0) - (a.year || 0))
            .slice(0, 20)
          setRecentlyAddedSeries(recentlyAdded)
        }

      logger.debug('Dashboard recommendation sections loaded', {
        trending: trendingData?.recommendations?.length || 0,
        popular: popularData?.anime?.length || 0,
        topRated: topRatedData?.anime?.length || 0,
      })
    } catch (err) {
      logger.error('Failed to load recommendation sections', err instanceof Error ? err : new Error(String(err)))
    }
  }

  async function loadPersonalizedRecommendations() {
    try {
      // Use the proper API helper instead of raw fetch
      const [forYouResult, fansLikeYouResult, friendRecsResult, hiddenGemsResult, discoveryResult, continueWatchResult] =
        await Promise.allSettled([
          api.trpcQuery('recommendations.getForYou', { limit: 20 }),
          api.trpcQuery('recommendations.getFansLikeYou', { limit: 20 }),
          api.trpcQuery('social.getFriendRecommendations', { limit: 12 }),
          api.trpcQuery('recommendations.getHiddenGems', { limit: 20 }),
          api.trpcQuery('recommendations.getDiscovery', { limit: 20 }),
          api.trpcQuery('recommendations.getContinueWatching', { limit: 10 }),
        ])

      // Helper to extract data from Promise result
      const getData = (result: PromiseSettledResult<any>) => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          // Only log non-auth errors (auth errors are expected for optional endpoints)
          const errorMessage = result.reason?.message || String(result.reason)
          const isAuthError = errorMessage.toLowerCase().includes('session') ||
            errorMessage.toLowerCase().includes('invalid') ||
            errorMessage.toLowerCase().includes('expired') ||
            errorMessage.toLowerCase().includes('unauthorized')
          
          if (!isAuthError) {
            console.error('API call failed:', result.reason)
          }
          return null
        }
      }

      // Filter out any undefined/null items and ensure anime object exists
      const filterValidRecs = (recs: any[]) => {
        return (recs || []).filter((r) => r && r.anime && r.anime.slug)
      }

      const forYouData = getData(forYouResult)
      const fansLikeYouData = getData(fansLikeYouResult)
      const friendRecsData = getData(friendRecsResult)
      const hiddenGemsData = getData(hiddenGemsResult)
      const discoveryData = getData(discoveryResult)
      const continueWatchData = getData(continueWatchResult)

      const forYouRecsList = filterValidRecs(forYouData?.recommendations || [])
      const fansLikeYouRecsList = filterValidRecs(fansLikeYouData?.recommendations || [])
      const friendRecsList = filterValidRecs(friendRecsData?.recommendations || [])
      const hiddenGemsRecsList = filterValidRecs(hiddenGemsData?.recommendations || [])
      const discoveryRecsList = filterValidRecs(discoveryData?.recommendations || [])
      const continueWatchList = filterValidRecs(continueWatchData?.recommendations || [])

      // Set state directly from API results - no fallbacks
      setForYouRecs(forYouRecsList)
      setFansLikeYouRecs(fansLikeYouRecsList)
      setFriendRecs(friendRecsList)
      setHiddenGemsRecs(hiddenGemsRecsList)
      setDiscoveryRecs(discoveryRecsList)
      setContinueWatching(continueWatchList)

      logger.debug('Dashboard personalized recommendations loaded', {
        forYou: forYouRecsList.length,
        fansLikeYou: fansLikeYouRecsList.length,
        friendRecs: friendRecsList.length,
        hiddenGems: hiddenGemsRecsList.length,
        discovery: discoveryRecsList.length,
        continueWatching: continueWatchList.length,
        errors: {
          forYou: forYouResult.status === 'rejected',
          fansLikeYou: fansLikeYouResult.status === 'rejected',
          friendRecs: friendRecsResult.status === 'rejected',
          hiddenGems: hiddenGemsResult.status === 'rejected',
          discovery: discoveryResult.status === 'rejected',
          continueWatch: continueWatchResult.status === 'rejected',
        },
      })
    } catch (err) {
      // Log error to help debug recommendation loading issues
      logger.error('Failed to load personalized recommendations', {
        error: err instanceof Error ? err.message : String(err),
        userId: isAuthenticated ? 'authenticated' : 'guest',
      })
      captureException(err, {
        context: {
          operation: 'load_personalized_recommendations',
          isAuthenticated,
        },
        tags: { feature: 'recommendations' },
      })
      // Non-critical, just won't show personalized recommendations
    }
  }

  async function handleDismissRecommendation(animeId: string) {
    try {
      await api.trpcMutation('recommendations.submitFeedback', {
          animeId,
          feedbackType: 'dismiss',
      })

      // Remove from all recommendation lists
      setForYouRecs(forYouRecs.filter((r) => r.anime.id !== animeId))
      setFansLikeYouRecs(fansLikeYouRecs.filter((r) => r.anime.id !== animeId))
      setHiddenGemsRecs(hiddenGemsRecs.filter((r) => r.anime.id !== animeId))
      setDiscoveryRecs(discoveryRecs.filter((r) => r.anime.id !== animeId))
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

  // Refresh handler for pull-to-refresh
  const handleRefresh = async () => {
    await refreshRecommendations()
  }

  return (
    <>
      {/* SEO Metadata */}
      <SEOMetadata
        title="Dashboard"
        description="Your personalized anime dashboard. Discover recommendations, trending anime, and manage your watchlist."
        keywords={['anime dashboard', 'anime recommendations', 'my anime list', 'watchlist']}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <PullToRefresh onRefresh={handleRefresh} disabled={isRefreshing}>
          <main className="container px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-8 sm:pb-16 lg:pb-20 relative z-10">
            {/* Email Verification Banner */}
            {isAuthenticated && user && !user.emailVerified && (
              <EmailVerificationBanner email={user.email} />
            )}

          {/* Onboarding Banner - Responsive */}
          {showOnboarding && isAuthenticated && (
            <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-6 mb-4 sm:mb-8 border-2 border-primary-500/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/30">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-white mb-1">
                      Get Personalized Recommendations!
                    </h3>
                    <p className="text-xs sm:text-base text-gray-300">
                      Tell us what you like and Senpai will find your perfect anime match ✨
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button
                    onClick={() => setShowOnboarding(false)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 flex-1 sm:flex-initial text-sm sm:text-base"
                  >
                    Later
                  </Button>
                  <Button
                    onClick={() => router.push('/onboarding')}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 flex-1 sm:flex-initial text-sm sm:text-base shadow-lg shadow-primary-500/30"
                  >
                    Let's Go!
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Hero Section - Responsive */}
          <div className="mb-6 sm:mb-10 lg:mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 sm:mb-6">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-white via-primary-400 to-secondary-400 bg-clip-text text-transparent">
              {isAuthenticated
                    ? `Welcome Back${user?.username ? `, ${user.username}` : ''}!`
                : 'Discover Amazing Anime'}
            </h1>
                <p className="text-sm sm:text-lg lg:text-xl text-gray-300 max-w-2xl">
              {isAuthenticated
                ? 'Here are anime recommendations just for you'
                : 'Personalized recommendations powered by your taste'}
            </p>
          </div>
              <div className="flex gap-2">
                {isAuthenticated && (
                  <Button
                    onClick={refreshRecommendations}
                    disabled={isRefreshing}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 flex items-center gap-2"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                    />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                )}
              </div>
                  </div>
                </div>

          {/* This Season - Integrated Quick Discovery */}
          {(seasonalSeries.length > 0 || sectionLoadingStates.seasonal) && (
            <>
              {seasonalSeries.length > 0 ? (
                <RecommendationCarousel
                  title="This Season"
                  icon={<Calendar className="h-5 w-5 text-blue-400" />}
                  recommendations={mapToRecommendations(seasonalSeries)}
                  showReasons={false}
                />
              ) : (
                <div className="mb-8 sm:mb-10 lg:mb-12">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">This Season</h2>
                  </div>
                  <CarouselSkeleton itemCount={5} />
                </div>
              )}
            </>
          )}

          {/* Personalized Recommendations (Authenticated Users Only) */}
          {isAuthenticated && (
            <>
              {/* Continue Watching */}
              {(continueWatching.length > 0 || sectionLoadingStates.personalized) && (
                <>
                  {continueWatching.length > 0 ? (
                <RecommendationCarousel
                  title="Continue Watching"
                  icon={<Clock className="h-5 w-5 text-primary-400" />}
                  recommendations={continueWatching}
                  onDismiss={handleDismissRecommendation}
                  showReasons={false}
                />
                  ) : sectionLoadingStates.personalized ? (
                    <div className="mb-8 sm:mb-10 lg:mb-12">
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <Clock className="h-5 w-5 text-primary-400" />
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Continue Watching</h2>
                      </div>
                      <CarouselSkeleton itemCount={5} />
                    </div>
                  ) : null}
                </>
              )}

              {/* For You - Main Personalized Feed (Hybrid: Content + Collaborative) */}
              {(forYouRecs.length > 0 || sectionLoadingStates.personalized) && (
                <>
                  {forYouRecs.length > 0 ? (
                <RecommendationCarousel
                  title="For You"
                  icon={<Heart className="h-5 w-5 text-primary-400" />}
                  recommendations={forYouRecs}
                  onDismiss={handleDismissRecommendation}
                  showReasons={true}
                />
                  ) : sectionLoadingStates.personalized ? (
                    <div className="mb-8 sm:mb-10 lg:mb-12">
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <Heart className="h-5 w-5 text-primary-400" />
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">For You</h2>
                      </div>
                      <CarouselSkeleton itemCount={5} />
                    </div>
                  ) : null}
                </>
              )}

              {/* Trending Now - For logged-in users too - From recommendations system */}
              {trendingAnime.length > 0 && (
                <RecommendationCarousel
                  title="Trending Now"
                  icon={<TrendingUp className="h-5 w-5 text-secondary-400" />}
                  recommendations={trendingAnime.map((item) => ({
                        anime: {
                      id: item.id,
                      slug: item.slug,
                      title: item.title,
                      titleEnglish: item.titleEnglish || null,
                      coverImage: item.coverImage || null,
                      year: item.year,
                      averageRating: item.rating,
                      genres: item.genres || [],
                        },
                  }))}
                  showReasons={false}
                />
              )}

              {/* Friends Are Watching - Social Recommendations */}
              <FriendsWatching />

              {/* Popular Series - Grouped by series like Crunchyroll */}
              {(allSeries.length > 0 || sectionLoadingStates.secondary) && (
                <>
                  {allSeries.length > 0 ? (
                <RecommendationCarousel
                  title="Popular Anime"
                  icon={<Sparkles className="h-5 w-5 text-primary-400" />}
                      recommendations={mapToRecommendations(allSeries.slice(0, 20))}
                  showReasons={false}
                />
                  ) : (
                    <div className="mb-8 sm:mb-10 lg:mb-12">
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <Sparkles className="h-5 w-5 text-primary-400" />
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Popular Anime</h2>
                      </div>
                      <CarouselSkeleton itemCount={5} />
                    </div>
                  )}
                </>
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
              {(hiddenGemsRecs.length > 0 || sectionLoadingStates.personalized) && (
                <>
                  {hiddenGemsRecs.length > 0 ? (
                <RecommendationCarousel
                  title="Hidden Gems You'll Love"
                  icon={<Gem className="h-5 w-5 text-primary-400" />}
                  recommendations={hiddenGemsRecs}
                  onDismiss={handleDismissRecommendation}
                  showReasons={true}
                />
                  ) : sectionLoadingStates.personalized ? (
                    <div className="mb-8 sm:mb-10 lg:mb-12">
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <Gem className="h-5 w-5 text-primary-400" />
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Hidden Gems You'll Love</h2>
                      </div>
                      <CarouselSkeleton itemCount={5} />
                    </div>
                  ) : null}
                </>
              )}

              {/* Top Rated Series - Grouped */}
              {(topRatedSeries.length > 0 || sectionLoadingStates.secondary) && (
                <>
                  {topRatedSeries.length > 0 ? (
                <RecommendationCarousel
                  title="Top Rated Anime"
                  icon={<Star className="h-5 w-5 text-warning-400" />}
                      recommendations={mapToRecommendations(topRatedSeries)}
                  showReasons={false}
                />
                  ) : (
                    <div className="mb-8 sm:mb-10 lg:mb-12">
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <Star className="h-5 w-5 text-warning-400" />
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Top Rated Anime</h2>
                      </div>
                      <CarouselSkeleton itemCount={5} />
                    </div>
                  )}
                </>
              )}

              {/* Expand Your Horizons */}
              {(discoveryRecs.length > 0 || sectionLoadingStates.personalized) && (
                <>
                  {discoveryRecs.length > 0 ? (
                <RecommendationCarousel
                  title="Expand Your Horizons"
                  icon={<Compass className="h-5 w-5 text-primary-400" />}
                  recommendations={discoveryRecs}
                  onDismiss={handleDismissRecommendation}
                  showReasons={true}
                />
                  ) : sectionLoadingStates.personalized ? (
                    <div className="mb-8 sm:mb-10 lg:mb-12">
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <Compass className="h-5 w-5 text-primary-400" />
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Expand Your Horizons</h2>
                      </div>
                      <CarouselSkeleton itemCount={5} />
                    </div>
                  ) : null}
                </>
              )}

              {/* Recently Added - Grouped Series */}
              {(recentlyAddedSeries.length > 0 || sectionLoadingStates.secondary) && (
                <>
                  {recentlyAddedSeries.length > 0 ? (
                <RecommendationCarousel
                  title="Recently Added"
                  icon={<Calendar className="h-5 w-5 text-success-400" />}
                      recommendations={mapToRecommendations(recentlyAddedSeries)}
                  showReasons={false}
                />
                  ) : (
                    <div className="mb-8 sm:mb-10 lg:mb-12">
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <Calendar className="h-5 w-5 text-success-400" />
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Recently Added</h2>
                      </div>
                      <CarouselSkeleton itemCount={5} />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Trending Series - Use carousel for consistency - Guest users */}
          {!isAuthenticated && (
            <>
              {trendingAnime.length > 0 ? (
            <RecommendationCarousel
              title="Trending Now"
              icon={<TrendingUp className="h-5 w-5 text-primary-400" />}
                  recommendations={trendingAnime.map((item) => ({
                    anime: {
                      id: item.id,
                      slug: item.slug,
                      title: item.title,
                      titleEnglish: item.titleEnglish || null,
                      coverImage: item.coverImage || null,
                      year: item.year,
                      averageRating: item.rating,
                      genres: item.genres || [],
                    },
                  }))}
              showReasons={false}
            />
              ) : (
                <div className="mb-8 sm:mb-10 lg:mb-12">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <TrendingUp className="h-5 w-5 text-primary-400" />
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Trending Now</h2>
                  </div>
                  <CarouselSkeleton itemCount={5} />
                </div>
              )}
            </>
          )}

          {/* Popular Series - Use carousel for consistency - Guest users */}
          {!isAuthenticated && (
            <>
              {allSeries.length > 0 ? (
            <RecommendationCarousel
              title="Popular Anime"
              icon={<Sparkles className="h-5 w-5 text-primary-400" />}
                  recommendations={mapToRecommendations(allSeries.slice(0, 20))}
              showReasons={false}
            />
              ) : sectionLoadingStates.secondary ? (
                <div className="mb-8 sm:mb-10 lg:mb-12">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <Sparkles className="h-5 w-5 text-primary-400" />
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Popular Anime</h2>
                  </div>
                  <CarouselSkeleton itemCount={5} />
                </div>
              ) : null}
            </>
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
        </PullToRefresh>
      </div>
    </>
  )
}