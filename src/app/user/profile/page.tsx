'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '../../../components/ui/button'
import { RequireAuth } from '../../lib/protected-route'
import { useAuth } from '../../lib/auth-context'
import { useToast } from '../../../components/ui/toast'
import { AnimeCard } from '../../../components/anime/AnimeCard'
import { LoadingState } from '../../../components/ui/loading-state'
import { EmptyState } from '../../../components/ui/error-state'
import { AchievementsShowcase } from '../../../components/achievements/AchievementsShowcase'
import { ACHIEVEMENTS, calculateAchievements } from '../../../lib/achievements'
import {
  User,
  Calendar,
  Settings,
  Heart,
  Play,
  CheckCircle,
  Eye,
  Film,
  Loader2,
  Activity,
  Clock,
  Camera,
  AlertCircle,
  Star,
  MessageSquare,
  Tv,
  Trophy,
  TrendingUp,
  Users,
  Award,
  BarChart3,
  Target,
  Zap,
  Shield,
  Globe,
  Lock,
  Edit3,
  Share2,
  Bookmark,
  History,
  Sparkles,
} from 'lucide-react'

interface UserStats {
  totalAnime: number
  favorites: number
  watching: number
  completed: number
  planToWatch: number
  onHold: number
  dropped: number
  ratings: number
  reviews: number
  totalEpisodesWatched: number
}

interface AnimeListItem {
  listId: string
  anime: any
  listStatus: string
  progress: number
  score?: number | null
  updatedAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, refreshUser } = useAuth()
  const { addToast } = useToast()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentAnime, setRecentAnime] = useState<any[]>([])
  const [favoriteAnime, setFavoriteAnime] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
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
          fetch(
            `${API_URL}/user.getAnimeList?input=${encodeURIComponent(JSON.stringify({ limit: 20 }))}`,
            {
              method: 'GET',
              headers: getAuthHeaders(),
            }
          ),
          user?.id
            ? fetch(
                `${API_URL}/social.getSocialCounts?input=${encodeURIComponent(JSON.stringify({ userId: user.id }))}`,
                {
                  method: 'GET',
                  headers: getAuthHeaders(),
                }
              )
            : null,
          fetch(`${API_URL}/achievements.getMyAchievements`, {
            method: 'GET',
            headers: getAuthHeaders(),
          }),
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
              progress: item.progress,
              updatedAt: item.updatedAt
            }))
            setRecentAnime(recent)
          }
        }

        const statsData = await statsRes.json()
        if (statsData.result?.data) {
          setStats(statsData.result.data)
        }

        const animeData = await animeListRes.json()
        if (animeData.result?.data?.items) {
          const items: AnimeListItem[] = animeData.result.data.items
          const favs = items
            .filter((item) => item.listStatus === 'favorite')
            .slice(0, 4)
            .map((item) => ({ ...item.anime, listStatus: item.listStatus }))
          setFavoriteAnime(favs)
        }

        if (socialRes) {
          const socialData = await socialRes.json()
          if (socialData.result?.data) {
            setSocialCounts(socialData.result.data)
          }
        }

        const achievementsData = await achievementsRes.json()
        if (achievementsData.result?.data) {
          const achievements = achievementsData.result.data
          setAchievements(achievements.achievements.filter((a: any) => a.unlocked))
          setAchievementStats({
            unlockedCount: achievements.unlockedCount,
            totalCount: achievements.totalCount,
            totalPoints: achievements.totalPoints
          })
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
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative pt-20 sm:pt-24 lg:pt-28 xl:pt-32 px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16 xl:pb-20">
          <div className="max-w-7xl mx-auto">
            
            {/* Hero Section */}
            <div className="relative mb-8 sm:mb-12">
              {/* Cover Image */}
              <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-primary-500/20 rounded-2xl sm:rounded-3xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-end justify-between">
                    <div className="flex items-end gap-4">
                      {/* Avatar */}
                      <div className="relative group">
                        {user?.avatar ? (
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-xl sm:rounded-2xl border-4 border-white/20 shadow-2xl overflow-hidden">
                            <Image
                              src={user.avatar}
                              alt={user.username || 'User'}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 112px"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl sm:rounded-2xl flex items-center justify-center border-4 border-white/20 shadow-2xl">
                            <User className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-white" />
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
                          className="absolute inset-0 rounded-xl sm:rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                        >
                          {isUploadingAvatar ? (
                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                          ) : (
                            <Camera className="h-6 w-6 text-white" />
                          )}
                        </label>
                      </div>

                      {/* User Info */}
                      <div className="text-white">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">
                          {user?.name || user?.username || 'User'}
                        </h1>
                        <p className="text-primary-300 text-sm sm:text-base mb-2">@{user?.username}</p>
                        {user?.bio && (
                          <p className="text-gray-300 text-sm sm:text-base max-w-md">{user.bio}</p>
                        )}
                        {avatarError && (
                          <div className="flex items-center gap-2 text-xs text-red-400 mt-2">
                            <AlertCircle className="h-3 w-3" />
                            <span>{avatarError}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 sm:gap-3">
                      <Link href="/user/settings">
                        <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                          <Settings className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Edit Profile</span>
                        </Button>
                      </Link>
                      <Link href={`/user/@${user?.username}`}>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          <Eye className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">View Public</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Stats */}
              <div className="mt-6 flex items-center gap-6 sm:gap-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{socialCounts.followers}</div>
                  <div className="text-sm text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{socialCounts.following}</div>
                  <div className="text-sm text-gray-400">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stats?.totalAnime || 0}</div>
                  <div className="text-sm text-gray-400">Anime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{achievementStats?.unlockedCount || 0}</div>
                  <div className="text-sm text-gray-400">Achievements</div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div className="glass rounded-xl p-4 sm:p-6 text-center hover:bg-white/5 transition-all duration-300 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Play className="h-6 w-6 sm:h-7 sm:w-7 text-primary-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats?.watching || 0}</div>
                <div className="text-sm text-gray-400">Watching</div>
              </div>

              <div className="glass rounded-xl p-4 sm:p-6 text-center hover:bg-white/5 transition-all duration-300 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-green-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats?.completed || 0}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </div>

              <div className="glass rounded-xl p-4 sm:p-6 text-center hover:bg-white/5 transition-all duration-300 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-red-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats?.favorites || 0}</div>
                <div className="text-sm text-gray-400">Favorites</div>
              </div>

              <div className="glass rounded-xl p-4 sm:p-6 text-center hover:bg-white/5 transition-all duration-300 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Star className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats?.ratings || 0}</div>
                <div className="text-sm text-gray-400">Ratings</div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Left Column - Activity & Achievements */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                
                {/* Recent Activity */}
                <div className="glass rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                      <Activity className="h-6 w-6 text-primary-400" />
                      Recent Activity
                    </h2>
                    <Link href="/mylist">
                      <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                        View All
                      </Button>
                    </Link>
                  </div>

                  {recentAnime.length === 0 ? (
                    <EmptyState
                      icon={<Clock className="h-12 w-12 text-gray-500" />}
                      title="No recent activity"
                      message="Start watching anime to see your activity here"
                      actionLabel="Browse Anime"
                      onAction={() => router.push('/search')}
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {recentAnime.map((anime) => (
                        <AnimeCard key={anime.id} anime={anime} variant="grid" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Favorites */}
                <div className="glass rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                      <Heart className="h-6 w-6 text-red-400 fill-current" />
                      Favorite Anime
                    </h2>
                    <Link href="/mylist?filter=favorites">
                      <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                        View All
                      </Button>
                    </Link>
                  </div>

                  {favoriteAnime.length === 0 ? (
                    <EmptyState
                      icon={<Heart className="h-12 w-12 text-gray-500" />}
                      title="No favorites yet"
                      message="Mark anime as favorite to see them here"
                      actionLabel="Find Favorites"
                      onAction={() => router.push('/search')}
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {favoriteAnime.map((anime) => (
                        <AnimeCard key={anime.id} anime={anime} variant="grid" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Stats & Info */}
              <div className="space-y-6 sm:space-y-8">
                
                {/* Achievements */}
                <div className="glass rounded-2xl p-6 sm:p-8">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-orange-400" />
                    Achievements
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Unlocked</span>
                      <span className="text-white font-semibold">
                        {achievementStats?.unlockedCount || 0} / {achievementStats?.totalCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Total Points</span>
                      <span className="text-white font-semibold">{achievementStats?.totalPoints || 0}</span>
                    </div>
                    <Link href="/achievements">
                      <Button variant="outline" size="sm" className="w-full border-white/20 text-white hover:bg-white/10">
                        View All Achievements
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Activity Stats */}
                {activityStats && (
                  <div className="glass rounded-2xl p-6 sm:p-8">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-400" />
                      This Month
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Activities</span>
                        <span className="text-white font-semibold">{activityStats.totalActivities || 0}</span>
                      </div>
                      {activityStats.byType && Object.entries(activityStats.byType).slice(0, 3).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-gray-300 text-sm capitalize">
                            {type.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-white font-semibold">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Leaderboard Rank */}
                {leaderboardRank && (
                  <div className="glass rounded-2xl p-6 sm:p-8">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-400" />
                      Rankings
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Anime Watched</span>
                        <div className="text-right">
                          <div className="text-white font-semibold">#{leaderboardRank.rank || 'N/A'}</div>
                          <div className="text-xs text-gray-400">{leaderboardRank.score || 0} anime</div>
                        </div>
                      </div>
                      {leaderboardRank.percentage > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Percentile</span>
                          <span className="text-white font-semibold">{leaderboardRank.percentage}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Join Date */}
                <div className="glass rounded-2xl p-6 sm:p-8">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-400" />
                    Member Since
                  </h3>
                  <div className="text-gray-300">{joinDate}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}