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
import {
  ProfileHeaderSkeleton,
  StatsCardSkeleton,
  AnimeCardSkeleton,
} from '../../../components/ui/skeleton'
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
  const toast = useToast()
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
  const [, setAvatarFile] = useState<File | null>(null)
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image must be smaller than 2MB')
      return
    }

    try {
      setIsUploadingAvatar(true)
      setAvatarFile(file)

      // Convert to base64
      const reader = new FileReader()
      const avatarData = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Update avatar via API
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

      // Refresh user data
      await refreshUser()
      setAvatarFile(null)
      toast.success('Avatar updated successfully!', 'Success')
    } catch (err) {
      setAvatarError('Failed to upload avatar')
      toast.error('Failed to upload avatar. Please try again.', 'Error')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated || !user) return

    async function loadProfile() {
      try {
        setIsLoading(true)

        // Load stats and anime list in parallel
        const [statsRes, animeListRes, socialRes] = await Promise.all([
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
        ])

        // Parse stats
        const statsData = await statsRes.json()
        if (statsData.result?.data) {
          setStats(statsData.result.data)
        }

        // Parse anime list
        const animeData = await animeListRes.json()
        if (animeData.result?.data?.items) {
          const items: AnimeListItem[] = animeData.result.data.items

          // Get recent anime (most recently updated)
          const recent = items
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 4)
            .map((item) => ({ ...item.anime, listStatus: item.listStatus }))
          setRecentAnime(recent)

          // Get favorite anime
          const favs = items
            .filter((item) => item.listStatus === 'favorite')
            .slice(0, 4)
            .map((item) => ({ ...item.anime, listStatus: item.listStatus }))
          setFavoriteAnime(favs)
        }

        // Parse social counts
        let socialCounts = { followers: 0, following: 0, mutualFollows: 0 }
        if (socialRes) {
          const socialData = await socialRes.json()
          if (socialData.result?.data) {
            socialCounts = socialData.result.data
            setSocialCounts(socialData.result.data)
          }
        }

        // Calculate achievements
        if (stats && user) {
          const items: AnimeListItem[] = animeData.result?.data?.items || []
          const genreSet = new Set<string>()
          let perfectRatingCount = 0

          items.forEach((item: AnimeListItem) => {
            // Count unique genres
            if (item.anime?.genres) {
              item.anime.genres.forEach((g: any) => genreSet.add(g.id || g))
            }
            // Count perfect ratings
            if (item.score === 10) {
              perfectRatingCount++
            }
          })

          const achievementStatsData = {
            totalAnime: stats.totalAnime || 0,
            completedAnime: stats.completed || 0,
            totalRatings: stats.ratings || 0,
            followers: socialCounts.followers || 0,
            following: socialCounts.following || 0,
            mutualFollows: socialCounts.mutualFollows || 0,
            uniqueGenres: genreSet.size,
            perfectRatings: perfectRatingCount,
            hasAvatar: !!user.avatar,
            hasBio: !!user.bio,
            createdAt: new Date(user.createdAt || Date.now()),
          }

          setAchievementStats(achievementStatsData)
          const unlockedAchievements = calculateAchievements(achievementStatsData)
          setAchievements(unlockedAchievements)
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id])

  if (isLoading) {
    return (
      <RequireAuth>
        <LoadingState variant="full" text="Loading your profile..." size="lg" />
      </RequireAuth>
    )
  }

  // Old loading skeleton (kept as fallback)
  if (false) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative pt-24 sm:pt-28 lg:pt-32 px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
            <div className="max-w-7xl mx-auto">
              {/* Profile Header Skeleton */}
              <ProfileHeaderSkeleton />

              {/* Stats Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </div>

              {/* Content Sections Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="h-6 sm:h-8 w-36 sm:w-48 bg-white/10 rounded-lg mb-4 sm:mb-6 animate-pulse"></div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <AnimeCardSkeleton />
                    <AnimeCardSkeleton />
                    <AnimeCardSkeleton />
                    <AnimeCardSkeleton />
                  </div>
                </div>
                <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="h-6 sm:h-8 w-36 sm:w-48 bg-white/10 rounded-lg mb-4 sm:mb-6 animate-pulse"></div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <AnimeCardSkeleton />
                    <AnimeCardSkeleton />
                    <AnimeCardSkeleton />
                    <AnimeCardSkeleton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative pt-24 sm:pt-28 lg:pt-32 px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
          <div className="max-w-7xl mx-auto">
            {/* Profile Header with Cover - Responsive */}
            <div className="glass rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8">
              {/* Cover Area */}
              <div className="h-24 sm:h-32 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-primary-500/20 relative"></div>

              {/* Profile Info */}
              <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 -mt-10 sm:-mt-12 relative">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-4 sm:gap-6 justify-between">
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 w-full md:w-auto">
                    {/* Avatar */}
                    <div className="relative group">
                      {user?.avatar ? (
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-gray-900 shadow-xl overflow-hidden">
                          <Image
                            src={user.avatar}
                            alt={user.username || 'User'}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl flex items-center justify-center border-4 border-gray-900 shadow-xl">
                          <User className="h-12 w-12 text-white" />
                        </div>
                      )}

                      {/* Avatar Upload Button */}
                      <input
                        type="file"
                        id="avatar-upload-profile"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={isUploadingAvatar}
                      />
                      <label
                        htmlFor="avatar-upload-profile"
                        className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                      >
                        {isUploadingAvatar ? (
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        ) : (
                          <Camera className="h-6 w-6 text-white" />
                        )}
                      </label>
                    </div>

                    {/* User Info */}
                    <div className="pb-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                        {user?.name || user?.username || 'User'}
                      </h1>
                      <p className="text-primary-400 mb-3">@{user?.username}</p>

                      {/* Avatar Error */}
                      {avatarError && (
                        <div className="flex items-center gap-2 text-xs text-error-400 mb-2">
                          <AlertCircle className="h-3 w-3" />
                          <span>{avatarError}</span>
                        </div>
                      )}

                      {/* Social Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-white font-semibold">{socialCounts.followers}</span>
                          <span className="text-gray-400 ml-1">Followers</span>
                        </div>
                        <div>
                          <span className="text-white font-semibold">{socialCounts.following}</span>
                          <span className="text-gray-400 ml-1">Following</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 md:mb-2">
                    <Link href="/user/settings">
                      <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                    <Link href={`/user/@${user?.username}`}>
                      <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Public
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Bio */}
                {user?.bio && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-gray-300 leading-relaxed">{user.bio}</p>
                  </div>
                )}

                {/* Join Date */}
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Joined {joinDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {/* Watching */}
              <div className="glass rounded-xl p-6 text-center hover:bg-white/10 transition-colors">
                <Play className="h-8 w-8 text-primary-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stats?.watching || 0}</div>
                <div className="text-sm text-gray-400">Watching</div>
              </div>

              {/* Completed */}
              <div className="glass rounded-xl p-6 text-center hover:bg-white/10 transition-colors">
                <CheckCircle className="h-8 w-8 text-success-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stats?.completed || 0}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </div>

              {/* Favorites */}
              <div className="glass rounded-xl p-6 text-center hover:bg-white/10 transition-colors">
                <Heart className="h-8 w-8 text-error-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stats?.favorites || 0}</div>
                <div className="text-sm text-gray-400">Favorites</div>
              </div>

              {/* Total Anime */}
              <div className="glass rounded-xl p-6 text-center hover:bg-white/10 transition-colors">
                <Film className="h-8 w-8 text-secondary-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stats?.totalAnime || 0}</div>
                <div className="text-sm text-gray-400">Total Anime</div>
              </div>
            </div>

            {/* Achievements Section */}
            <div className="glass rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <AchievementsShowcase
                  achievements={achievements}
                  allAchievements={ACHIEVEMENTS}
                  stats={achievementStats}
                  compact={true}
                />
              </div>
              <Link href="/achievements">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 border-white/20 text-white hover:bg-white/10"
                >
                  View All Achievements →
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Activity className="h-6 w-6 text-primary-400" />
                    Recent Activity
                  </h2>
                  <Link href="/mylist">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      View All
                    </Button>
                  </Link>
                </div>

                {recentAnime.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No recent activity</p>
                    <p className="text-gray-500 text-sm mb-4">
                      Start watching anime to see your activity here
                    </p>
                    <Link href="/search">
                      <Button className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600">
                        Browse Anime
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {recentAnime.map((anime) => (
                      <AnimeCard key={anime.id} anime={anime} variant="grid" />
                    ))}
                  </div>
                )}
              </div>

              {/* Favorite Anime */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Heart className="h-6 w-6 text-error-400 fill-current" />
                    Favorites
                  </h2>
                  <Link href="/mylist?filter=favorites">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      View All
                    </Button>
                  </Link>
                </div>

                {favoriteAnime.length === 0 ? (
                  <EmptyState
                    icon={<Heart className="h-10 w-10 text-gray-500" />}
                    title="No favorites yet"
                    message="Mark anime as favorite to see them here. Click the star icon on any anime card!"
                    actionLabel="Find Favorites"
                    onAction={() => router.push('/search')}
                    className="py-8"
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
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
