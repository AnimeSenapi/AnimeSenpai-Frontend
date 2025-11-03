'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '../../../components/ui/button'
import { RequireAuth } from '../../lib/protected-route'
import { useAuth } from '../../lib/auth-context'
import { useFavorites } from '../../lib/favorites-context'
import { useToast } from '../../../components/ui/toast'
import { AnimeCard } from '../../../components/anime/AnimeCard'
import { LoadingState } from '../../../components/ui/loading-state'
import { EmptyState } from '../../../components/ui/error-state'
import { groupAnimeIntoSeries } from '../../../lib/series-grouping'
import { apiGetUserList, apiGetAchievementStats } from '../../lib/api'
import {
  User,
  Settings,
  Heart,
  Play,
  CheckCircle,
  Eye,
  Loader2,
  Activity,
  Clock,
  Camera,
  AlertCircle,
  Star,
  MessageSquare,
  Trophy,
  TrendingUp,
  Users,
  Award,
  BarChart3,
  Target,
  Bookmark,
  Zap,
  Shield,
  Globe,
  Lock,
  Edit3,
  Share2,
  History,
  Sparkles,
  Calendar,
} from 'lucide-react'

interface UserStats {
  totalAnime: number
  favorites: number
  watching: number
  completed: number
  planToWatch: number
  onHold: number
  dropped: number
}

interface AnimeListItem {
  listId: string
  anime: any
  listStatus: string
  score?: number | null
  updatedAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, refreshUser } = useAuth()
  const { isFavorited } = useFavorites()
  const { addToast } = useToast()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentAnime, setRecentAnime] = useState<any[]>([])
  const [favoriteAnime, setFavoriteAnime] = useState<any[]>([])
  const [achievementStats, setAchievementStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [socialCounts, setSocialCounts] = useState({
    followers: 0,
    following: 0,
    mutualFollows: 0,
  })
  const [activityStats, setActivityStats] = useState<any>(null)
  const [leaderboardRank, setLeaderboardRank] = useState<any>(null)
  const [userPreferences, setUserPreferences] = useState<any>(null)
  const [privacySettings, setPrivacySettings] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/trpc'

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarError(null)

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image must be smaller than 2MB')
      return
    }

    try {
      setIsUploadingAvatar(true)

      const reader = new FileReader()
      const avatarData = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const response = await fetch(`${API_URL}/auth.updateProfile`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          avatar: avatarData,
        }),
      })

      const data = await response.json()
      if (data.error) {
        setAvatarError('Failed to update avatar')
        return
      }

      await refreshUser()
      addToast({
        title: 'Success',
        description: 'Avatar updated successfully!',
        variant: 'success',
      })
    } catch (err) {
      setAvatarError('Failed to upload avatar')
      addToast({
        title: 'Error',
        description: 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated || !user) return

    async function loadProfile() {
      try {
        setIsLoading(true)

        const [
          profileRes,
          statsRes,
          animeListRes,
          socialRes,
          achievementsRes,
          activityStatsRes,
          leaderboardRes,
          preferencesRes,
          privacyRes
        ] = await Promise.all([
          fetch(`${API_URL}/user.getProfile`, {
            method: 'GET',
            headers: getAuthHeaders(),
          }),
          fetch(`${API_URL}/user.getStats`, {
            method: 'GET',
            headers: getAuthHeaders(),
          }),
          // Get anime list (use apiGetUserList to get ALL anime, not just 20)
          apiGetUserList(),
          user?.id
            ? fetch(
                `${API_URL}/social.getSocialCounts?input=${encodeURIComponent(JSON.stringify({ userId: user.id }))}`,
                {
                  method: 'GET',
                  headers: getAuthHeaders(),
                }
              )
            : null,
          apiGetAchievementStats(),
          fetch(`${API_URL}/activity.getActivityStats?input=${encodeURIComponent(JSON.stringify({ timeRange: 'month' }))}`, {
            method: 'GET',
            headers: getAuthHeaders(),
          }),
          fetch(`${API_URL}/leaderboards.getMyRank?input=${encodeURIComponent(JSON.stringify({ category: 'watched' }))}`, {
            method: 'GET',
            headers: getAuthHeaders(),
          }),
          fetch(`${API_URL}/auth.me`, {
            method: 'GET',
            headers: getAuthHeaders(),
          }),
          fetch(`${API_URL}/privacy.getSettings`, {
            method: 'GET',
            headers: getAuthHeaders(),
          })
        ])

        // Parse all data
        const profileData = await profileRes.json()
        if (profileData.result?.data) {
          const profile = profileData.result.data
          setStats(profile.stats)
          
          if (profile.recentActivity) {
            const recent = profile.recentActivity.slice(0, 4).map((item: any) => ({
              ...item.anime,
              listStatus: item.status,
              updatedAt: item.updatedAt
            }))
            setRecentAnime(recent)
          }
        }

        const statsData = await statsRes.json()
        if (statsData.result?.data) {
          setStats(statsData.result.data)
        }

        // apiGetUserList returns data directly, not wrapped in response
        const animeData = await animeListRes
        if (animeData?.items) {
          const items: AnimeListItem[] = animeData.items
          
          // Process data the same way as mylist page
          const myListAnimeRaw = items
            .filter((item) => item.anime) // Only include items with anime data
            .map((item) => ({
              ...item.anime!,
              listStatus: item.listStatus as 'watching' | 'completed' | 'plan-to-watch' | 'on-hold' | 'dropped',
              isFavorite: isFavorited(item.anime!.id), // Use favorites context
              rating: (item.anime && (item.anime.averageRating ?? item.anime.rating)) || 0,
              averageRating: item.anime!.averageRating || item.anime!.rating || 0,
            }))

          // Debug: Log the raw data structure (development only)
          if (process.env.NODE_ENV === 'development') {
            console.log('Raw API Data:', {
              totalItems: items.length,
              processedItems: myListAnimeRaw.length,
              sampleItem: myListAnimeRaw[0],
              listStatuses: myListAnimeRaw.map(item => item.listStatus),
              favorites: myListAnimeRaw.filter(item => item.isFavorite).length
            })
          }

          // Group anime into series (same as mylist)
          const myListAnime = groupAnimeIntoSeries(myListAnimeRaw).map((series) => ({
            ...series,
            listStatus: series.seasons?.[0]?.listStatus || myListAnimeRaw.find((a) => a.id === series.id)?.listStatus || 'plan-to-watch',
            isFavorite: series.seasons?.some((s: any) => s.isFavorite) || myListAnimeRaw.find((a) => a.id === series.id)?.isFavorite || false,
            title: series.titleEnglish || series.displayTitle || series.title,
            titleEnglish: series.titleEnglish || series.displayTitle,
            rating: Number(series.rating) || series.averageRating || 0,
            averageRating: Number(series.rating) || series.averageRating || 0,
          }))

          // Get favorite anime using the same logic as mylist
          const favs = myListAnime
            .filter((anime) => anime.isFavorite === true || anime.seasons?.some((s: any) => s.isFavorite === true))
            .slice(0, 4)
          setFavoriteAnime(favs)

          // Calculate stats from raw data (same as mylist) - BEFORE grouping for accurate counts
          const favorites = myListAnimeRaw.filter((anime) => anime.isFavorite === true)
          const watching = myListAnimeRaw.filter((anime) => anime.listStatus === 'watching')
          const completed = myListAnimeRaw.filter((anime) => anime.listStatus === 'completed')
          const planToWatch = myListAnimeRaw.filter((anime) => anime.listStatus === 'plan-to-watch')
          const onHold = myListAnimeRaw.filter((anime) => anime.listStatus === 'on-hold')
          const dropped = myListAnimeRaw.filter((anime) => anime.listStatus === 'dropped')
          
          // Debug: Log the calculated stats
          console.log('Profile Stats Calculation:', {
            watching: watching.length,
            completed: completed.length,
            favorites: favorites.length,
            planToWatch: planToWatch.length,
            onHold: onHold.length,
            dropped: dropped.length,
            totalAnime: myListAnimeRaw.length,
          })
          
          // Update stats with calculated values
          setStats(prevStats => ({
            ...prevStats,
            watching: watching.length,
            completed: completed.length,
            favorites: favorites.length,
            planToWatch: planToWatch.length,
            onHold: onHold.length,
            dropped: dropped.length,
            totalAnime: myListAnimeRaw.length
          }))
        }

        if (socialRes) {
          const socialData = await socialRes.json()
          if (socialData.result?.data) {
            setSocialCounts(socialData.result.data)
          }
        }

        const achievementsData = await achievementsRes
        if (achievementsData && typeof achievementsData === 'object') {
          const data = achievementsData as any
          if (data.result?.data) {
            const resultData = data.result.data
            setAchievementStats({
              unlockedCount: resultData.unlockedTiers || 0,
              totalCount: resultData.totalTiers || 0,
              totalPoints: resultData.totalPoints || 0
            })
          } else {
            setAchievementStats({
              unlockedCount: data.unlockedTiers || 0,
              totalCount: data.totalTiers || 0,
              totalPoints: data.totalPoints || 0
            })
          }
        }

        const activityStatsData = await activityStatsRes.json()
        if (activityStatsData.result?.data) {
          setActivityStats(activityStatsData.result.data)
        }

        const leaderboardData = await leaderboardRes.json()
        if (leaderboardData.result?.data) {
          setLeaderboardRank(leaderboardData.result.data)
        }

        const preferencesData = await preferencesRes.json()
        if (preferencesData.result?.data) {
          setUserPreferences(preferencesData.result.data.preferences)
        }

        const privacyData = await privacyRes.json()
        if (privacyData.result?.data) {
          setPrivacySettings(privacyData.result.data)
        }

      } catch (error) {
        console.error('Failed to load profile:', error)
        addToast({
          title: 'Error',
          description: 'Failed to load profile data. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [isAuthenticated, user?.id])

  if (isLoading) {
    return (
      <RequireAuth>
        <LoadingState variant="full" text="Loading your profile..." size="lg" />
      </RequireAuth>
    )
  }

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown'

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Subtle Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-64 h-64 bg-secondary-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative pt-32 sm:pt-36 md:pt-40 px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
          <div className="max-w-6xl mx-auto">
            
            {/* Compact Header */}
            <div className="glass rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative group">
                      {user?.avatar ? (
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-white/20 shadow-lg overflow-hidden">
                          <Image
                            src={user.avatar}
                            alt={user.username || 'User'}
                            fill
                            className="object-cover"
                          sizes="(max-width: 640px) 64px, 80px"
                          />
                        </div>
                      ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl flex items-center justify-center border-2 border-white/20 shadow-lg">
                        <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                        </div>
                      )}

                    {/* Avatar Upload */}
                      <input
                        type="file"
                      id="avatar-upload"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={isUploadingAvatar}
                      />
                      <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                      >
                        {isUploadingAvatar ? (
                        <Loader2 className="h-4 w-4 text-white animate-spin" />
                        ) : (
                        <Camera className="h-4 w-4 text-white" />
                        )}
                      </label>
                    </div>

                    {/* User Info */}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">
                        {user?.name || user?.username || 'User'}
                      </h1>
                    <p className="text-primary-300 text-sm">@{user?.username}</p>
                    {user?.bio && (
                      <p className="text-gray-300 text-sm mt-1 max-w-md">{user.bio}</p>
                    )}
                      {avatarError && (
                      <div className="flex items-center gap-2 text-xs text-red-400 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{avatarError}</span>
                        </div>
                      )}
                    </div>
                  </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Link href="/user/settings">
                    <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                        <Settings className="h-4 w-4 mr-2" />
                      Edit
                      </Button>
                    </Link>
                    <Link href={`/user/@${user?.username}`}>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                        <Eye className="h-4 w-4 mr-2" />
                      Public
                      </Button>
                    </Link>
                  </div>
                </div>

              {/* Social Stats */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{socialCounts.followers}</div>
                    <div className="text-xs text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{socialCounts.following}</div>
                    <div className="text-xs text-gray-400">Following</div>
                  </div>
                </div>
                
                {/* Member Since - Right side with better styling */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{joinDate}</div>
                    <div className="text-xs text-gray-400">Member Since</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
                  {/* Left Column - Activity & Favorites */}
                  <div className="lg:col-span-2">
                    
                    {/* Combined Activity & Favorites with Tabs */}
                    <div className="glass rounded-xl p-4">
                      {/* Tab Headers */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                          <button
                            onClick={() => setActiveTab('recent')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              activeTab === 'recent'
                                ? 'bg-primary-500 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              Recent
              </div>
                          </button>
                          <button
                            onClick={() => setActiveTab('favorites')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              activeTab === 'favorites'
                                ? 'bg-primary-500 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Heart className="h-4 w-4" />
                              Favorites
              </div>
                          </button>
            </div>

                        <Link href={activeTab === 'recent' ? '/mylist' : '/mylist?filter=favorites'}>
                          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 text-xs px-2 py-1">
                            View All
                </Button>
              </Link>
            </div>

                      {/* Tab Content */}
                      {activeTab === 'recent' ? (
                        recentAnime.length === 0 ? (
                          <div className="text-center py-8">
                            <Clock className="h-8 w-8 text-gray-500 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm mb-3">No recent activity</p>
                    <Button
                      variant="outline"
                      size="sm"
                              className="border-white/20 text-white hover:bg-white/10 text-xs"
                              onClick={() => router.push('/search')}
                            >
                        Browse Anime
                      </Button>
                  </div>
                ) : (
                          <div className="grid grid-cols-3 gap-2">
                    {recentAnime.map((anime) => (
                      <AnimeCard key={anime.id} anime={anime} variant="grid" />
                    ))}
                  </div>
                        )
                      ) : (
                        favoriteAnime.length === 0 ? (
                          <div className="text-center py-8">
                            <Heart className="h-8 w-8 text-gray-500 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm mb-3">No favorites yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                              className="border-white/20 text-white hover:bg-white/10 text-xs"
                              onClick={() => router.push('/search')}
                            >
                              Find Favorites
                            </Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {favoriteAnime.map((anime) => (
                              <AnimeCard key={anime.id} anime={anime} variant="grid" />
                            ))}
                          </div>
                        )
                      )}
                    </div>

                </div>

              {/* Right Column - Stats & Info */}
              <div className="space-y-6">
                
                    {/* Quick Stats */}
                    <div className="glass rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-400" />
                        Quick Stats
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Play className="h-4 w-4 text-primary-400" />
                            <span className="text-gray-300 text-sm">Watching</span>
                          </div>
                          <span className="text-white font-semibold">{stats?.watching || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-gray-300 text-sm">Completed</span>
                          </div>
                          <span className="text-white font-semibold">{stats?.completed || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-red-400" />
                            <span className="text-gray-300 text-sm">Favorites</span>
                          </div>
                          <span className="text-white font-semibold">{stats?.favorites || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bookmark className="h-4 w-4 text-yellow-400" />
                            <span className="text-gray-300 text-sm">Plan to Watch</span>
                          </div>
                          <span className="text-white font-semibold">{stats?.planToWatch || 0}</span>
                        </div>
                      </div>
                    </div>


                {/* Performance Stats */}
                <div className="glass rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Performance
                  </h3>
                  <div className="space-y-3">
                    {/* Activity Stats */}
                    {activityStats && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 text-sm">This Month</span>
                          <span className="text-white font-semibold">{activityStats.totalActivities || 0} activities</span>
                        </div>
                        {activityStats.byType && Object.entries(activityStats.byType).slice(0, 2).map(([type, count]) => (
                          <div key={type} className="flex justify-between items-center">
                            <span className="text-gray-300 text-xs capitalize">
                              {type}
                            </span>
                            <span className="text-white font-semibold text-sm">{count as number}</span>
                          </div>
                        ))}
                        <div className="border-t border-white/10 my-2"></div>
                      </>
                    )}
                    
                    {/* Leaderboard Rank */}
                    {leaderboardRank ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 text-sm">Rank</span>
                          <div className="text-right">
                            <div className="text-white font-semibold">#{leaderboardRank.rank || 'N/A'}</div>
                            <div className="text-xs text-gray-400">{leaderboardRank.score || 0} anime</div>
                          </div>
                        </div>
                        {leaderboardRank.percentage > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 text-sm">Percentile</span>
                            <span className="text-white font-semibold text-sm">{leaderboardRank.percentage}%</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-2">
                        <span className="text-gray-400 text-sm">No ranking data</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Achievements - Moved under Performance */}
                <div className="glass rounded-xl p-6 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-lg">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                      Achievements
                    </h3>
                    <Link href="/achievements">
                      <Button variant="outline" size="sm" className="border-orange-400/30 text-orange-300 hover:bg-orange-400/10 text-xs px-3 py-1">
                      View All
                    </Button>
                  </Link>
                </div>

                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Progress</span>
                        <span className="text-white font-semibold">
                          {achievementStats?.unlockedCount || 0} / {achievementStats?.totalCount || 0}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-orange-400 to-yellow-400 h-3 rounded-full transition-all duration-500 ease-out"
                          style={{ 
                            width: `${achievementStats?.totalCount ? 
                              ((achievementStats.unlockedCount / achievementStats.totalCount) * 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Points with Icon */}
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-gray-300 text-sm">Points Earned</span>
                      </div>
                      <span className="text-white font-bold text-lg">{achievementStats?.totalPoints || 0}</span>
                    </div>
                    
                    {/* Achievement Preview */}
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">
                        {achievementStats?.unlockedCount === 0 
                          ? "Start watching anime to unlock tiers!"
                          : `${achievementStats?.unlockedCount} tier${achievementStats?.unlockedCount === 1 ? '' : 's'} unlocked`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}