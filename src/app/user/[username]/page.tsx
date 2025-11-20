'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '../../../components/ui/button'
import { useAuth } from '../../lib/auth-context'
import { useToast } from '../../../components/ui/toast'
import { AnimeCard } from '../../../components/anime/AnimeCard'
import { LoadingState } from '../../../components/ui/loading-state'
import { EmptyState } from '../../../components/ui/error-state'
import { groupAnimeIntoSeries } from '../../../lib/series-grouping'
import { 
  apiGetUserProfile, 
  apiGetPublicUserAnimeList, 
  apiGetActivityStats, 
  apiGetMyRank, 
  apiGetMyAchievements,
  apiGetRelationshipStatus,
  apiFollowUser,
  apiUnfollowUser,
  apiSendFriendRequest,
  apiUnfriend
} from '../../lib/api'
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
  ArrowLeft,
  UserPlus,
  UserMinus,
  UserCheck,
  Settings as SettingsIcon,
  List,
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import { Badge } from '../../../components/ui/badge'
import Script from 'next/script'
import { buildBreadcrumbJsonLd, buildCanonical, buildPersonJsonLd } from '@/lib/seo'


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

interface UserProfile {
  user: {
    id: string
    username: string
    name?: string | null
    avatar?: string | null
    bio?: string | null
    createdAt: string
  }
  stats: {
    followers: number
    following: number
    friends: number
    animeCount: number
    reviewsCount: number
  }
  privacy: {
    profileVisibility: string
    listVisibility: string
    activityVisibility: string
    friendsVisibility: string
    reviewsVisibility: string
  }
}

interface RelationshipStatus {
  isFollowing: boolean
  isFollowedBy: boolean
  isFriend: boolean
  pendingFriendRequest?: {
    id: string
    sentByMe: boolean
  } | null
}

export default function UserProfilePage() {
  const params = useParams<{ username: string }>()
  const rawUsername = (params?.username as string) || ''
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const { addToast } = useToast()

  // Strip @ symbol if present in the URL
  let username = rawUsername;
  try {
    username = decodeURIComponent(username);
  } catch (e) {
    console.error("Failed to decode username:", e);
  }
  if (username.startsWith('%40')) {
    username = username.slice(3);
  }
  if (username.startsWith('@')) {
    username = username.slice(1);
  }

  const isOwnProfile = currentUser?.username === username

  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentAnime, setRecentAnime] = useState<any[]>([])
  const [favoriteAnime, setFavoriteAnime] = useState<any[]>([])
  const [activityStats, setActivityStats] = useState<any>(null)
  const [leaderboardRank, setLeaderboardRank] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relationship, setRelationship] = useState<RelationshipStatus | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Loading profile for username:', username)
      const profileData = (await apiGetUserProfile(username)) as any
      console.log('Profile data received:', profileData)
      
      const actualProfile = profileData.result?.data || profileData
      console.log('Actual profile:', actualProfile)
      
      setProfile(actualProfile as UserProfile)
      setStats(actualProfile.stats) // Initial stats from profileData

      if (currentUser && !isOwnProfile) {
        try {
          const relationshipData = await apiGetRelationshipStatus(actualProfile.user.id)
          setRelationship(relationshipData as RelationshipStatus)
        } catch (relErr) {
          console.debug('Could not load relationship status:', relErr)
          setRelationship(null)
        }
      }

      try {
        console.log('Loading anime list for username:', username)
        const animeListData = await apiGetPublicUserAnimeList(username, 100)
        console.log('Anime list data received:', animeListData)
        
        const actualAnimeData = animeListData.result?.data || animeListData
        console.log('Actual anime data:', actualAnimeData)
        
        const items = actualAnimeData?.items || []
        console.log('Items array:', items)
        
        const myListAnimeRaw = items
          .filter((item: any) => item && item.id)
          .map((item: any) => ({
            ...item,
            listStatus: item.listStatus as 'watching' | 'completed' | 'plan-to-watch' | 'on-hold' | 'dropped',
            isFavorite: item.isFavorite || false,
            rating: item.userScore || item.averageRating || 0,
            averageRating: item.averageRating || 0,
          }))
        
        console.log('My list anime raw:', myListAnimeRaw)

        const myListAnime = groupAnimeIntoSeries(myListAnimeRaw).map((series) => ({
          ...series,
          listStatus: series.seasons?.[0]?.listStatus || myListAnimeRaw.find((a: any) => a.id === series.id)?.listStatus || 'plan-to-watch',
          isFavorite: series.seasons?.some((s: any) => s.isFavorite) || myListAnimeRaw.find((a: any) => a.id === series.id)?.isFavorite || false,
          title: series.titleEnglish || series.displayTitle || series.title,
          titleEnglish: series.titleEnglish || series.displayTitle,
          rating: Number(series.rating) || series.averageRating || 0,
          averageRating: Number(series.rating) || series.averageRating || 0,
        }))

        // For public profiles, we don't have recent activity data
        // So we'll show recent anime from their list instead
        const recent = myListAnimeRaw
          .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 4)
        setRecentAnime(recent)

        const favorites = myListAnime.filter(anime => anime.isFavorite).slice(0, 6)
        setFavoriteAnime(favorites)

        // Calculate stats from the anime list
        const watching = myListAnimeRaw.filter((anime: any) => anime.listStatus === 'watching')
        const completed = myListAnimeRaw.filter((anime: any) => anime.listStatus === 'completed')
        const planToWatch = myListAnimeRaw.filter((anime: any) => anime.listStatus === 'plan-to-watch')
        const onHold = myListAnimeRaw.filter((anime: any) => anime.listStatus === 'on-hold')
        const dropped = myListAnimeRaw.filter((anime: any) => anime.listStatus === 'dropped')
        const favoritesCount = myListAnimeRaw.filter((anime: any) => anime.isFavorite)

        setStats({
          watching: watching.length,
          completed: completed.length,
          planToWatch: planToWatch.length,
          onHold: onHold.length,
          dropped: dropped.length,
          favorites: favoritesCount.length,
          totalAnime: myListAnimeRaw.length
        })

        // Load additional stats only if user is authenticated and viewing their own profile
        if (currentUser && isOwnProfile) {
          try {
            const [activityData, leaderboardData] = await Promise.all([
              apiGetActivityStats(),
              apiGetMyRank('watched')
            ])
            setActivityStats(activityData)
            setLeaderboardRank(leaderboardData)
          } catch (statsErr) {
            console.debug('Could not load additional stats:', statsErr)
          }
        }

      } catch (dataErr) {
        console.debug('Could not load additional data:', dataErr)
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (username) {
      loadProfile()
    }
  }, [username, currentUser])

  const handleFollow = async () => {
    if (!profile || !currentUser) return

    setActionLoading(true)
    try {
      if (relationship?.isFollowing) {
        await apiUnfollowUser(profile.user.id)
        setRelationship(prev => prev ? { ...prev, isFollowing: false } : null)
        addToast({
          title: 'Success',
          description: `Unfollowed ${profile.user.username}`,
          variant: 'success',
        })
      } else {
        await apiFollowUser(profile.user.id)
        setRelationship(prev => prev ? { ...prev, isFollowing: true } : null)
        addToast({
          title: 'Success',
          description: `Following ${profile.user.username}`,
          variant: 'success',
        })
      }
    } catch (err: any) {
      addToast({
        title: 'Error',
        description: err.message || 'Failed to update follow status',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleFriendRequest = async () => {
    if (!profile || !currentUser) return

    setActionLoading(true)
    try {
      if (relationship?.isFriend) {
          await apiUnfriend(profile.user.id)
        setRelationship(prev => prev ? { ...prev, isFriend: false } : null)
        addToast({
          title: 'Success',
          description: `Removed ${profile.user.username} from friends`,
          variant: 'success',
        })
      } else {
        await apiSendFriendRequest(profile.user.id)
        setRelationship(prev => prev ? { 
          ...prev, 
          pendingFriendRequest: { id: 'temp', sentByMe: true } 
        } : null)
        addToast({
          title: 'Success',
          description: `Friend request sent to ${profile.user.username}`,
          variant: 'success',
        })
      }
    } catch (err: any) {
      addToast({
        title: 'Error',
        description: err.message || 'Failed to update friend status',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <LoadingState text="Loading profile..." />
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center p-6">
        <EmptyState
          icon={<User className="h-12 w-12 text-gray-500" />}
          title="User Not Found"
          message={error || "The user you're looking for doesn't exist."}
          actionLabel="Back to Dashboard"
          onAction={() => router.push('/dashboard')}
        />
      </div>
    )
  }

  const { user, stats: profileStats, privacy } = profile

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      <Script
        id="ld-user-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbJsonLd([
              { name: 'Home', item: buildCanonical('/') },
              { name: 'Users', item: buildCanonical('/discover') },
              { name: user.username || 'User', item: buildCanonical(`/user/${user.username || ''}`) },
            ])
          ),
        }}
      />
      <Script
        id="ld-user-person"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildPersonJsonLd({
              username: user.username || 'user',
              name: user.name || user.username || 'User',
              url: buildCanonical(`/user/${user.username || ''}`),
              image: user.avatar || undefined,
              description: user.bio || undefined,
            })
          ),
        }}
      />
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-64 h-64 bg-secondary-500/5 rounded-full blur-3xl"></div>
        </div>

          {/* Back Button */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          <Link
            href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 sm:mb-6 py-2 px-3 touch-manipulation"
          >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
          </Link>
      </div>

      <div className="relative pt-4 sm:pt-8 px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Compact Header */}
          <div className="glass rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Avatar */}
                <div className="relative group">
                {user.avatar ? (
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
              </div>

                {/* User Info */}
                  <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    {user.username || 'User'}
                    </h1>
                  <p className="text-primary-300 text-sm">@{user.username || 'unknown'}</p>
                  {user.bio && (
                    <p className="text-gray-300 text-sm mt-1 max-w-full sm:max-w-md break-words">{user.bio}</p>
                  )}
                </div>
                  </div>

                  {/* Action Buttons */}
              {!isOwnProfile && currentUser && (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {/* Follow/Unfollow Button */}
                  <div className="w-full sm:w-auto">
                    <Button
                      onClick={handleFollow}
                      disabled={actionLoading}
                      size="sm"
                      className={cn(
                        'w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20',
                        relationship?.isFollowing && 'bg-white/10 hover:bg-white/20'
                      )}
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : relationship?.isFollowing ? (
                        <UserMinus className="h-4 w-4 mr-2" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      {relationship?.isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                  </div>

                  {/* Friend Request Button */}
                  {relationship && (
                    <div className="w-full sm:w-auto">
                      <Button
                        onClick={handleFriendRequest}
                        disabled={actionLoading || !!relationship?.pendingFriendRequest}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : relationship?.isFriend ? (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Friends
                          </>
                        ) : relationship?.pendingFriendRequest ? (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            {relationship?.pendingFriendRequest?.sentByMe ? 'Request Sent' : 'Request Pending'}
                          </>
                        ) : (
                          <>
                            <Users className="h-4 w-4 mr-2" />
                            Add Friend
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Social Stats */}
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-base sm:text-lg font-bold text-white">{profileStats.followers}</div>
                  <div className="text-xs text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-base sm:text-lg font-bold text-white">{profileStats.following}</div>
                  <div className="text-xs text-gray-400">Following</div>
                </div>
              </div>

              {/* Member Since - Right side with better styling */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10 w-full sm:w-auto">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div className="text-left sm:text-right">
                  <div className="text-sm font-medium text-white">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                </div>
                  <div className="text-xs text-gray-400">Member Since</div>
                </div>
              </div>
              </div>
            </div>

            {/* Privacy Notice */}
            {privacy.profileVisibility === 'private' && !isOwnProfile && (
            <div className="glass rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-yellow-400" />
                <div>
                  <h3 className="text-yellow-300 font-semibold">Private Profile</h3>
                  <p className="text-sm text-gray-300">
                    This user's profile is private. Some information may be hidden.
                  </p>
                </div>
                </div>
              </div>
            )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Activity & Favorites */}
            <div className="lg:col-span-2">
              
              {/* Combined Activity & Favorites with Tabs */}
              <div className="glass rounded-xl p-4 sm:p-6">
                {/* Tab Headers */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                  <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('recent')}
                      className={`px-4 py-2 sm:px-3 sm:py-1.5 rounded-md text-sm font-medium transition-colors touch-manipulation ${
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
                      className={`px-4 py-2 sm:px-3 sm:py-1.5 rounded-md text-sm font-medium transition-colors touch-manipulation ${
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

                  <Link href={activeTab === 'recent' ? '/mylist' : '/mylist?filter=favorites'} className="w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 text-xs px-2 py-1">
                      View All
                    </Button>
                  </Link>
                </div>

                {/* Tab Content */}
                {activeTab === 'recent' ? (
                  recentAnime.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm mb-3">No recent anime</p>
                      <p className="text-gray-500 text-xs">This user hasn't added any anime to their list yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
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
                      <p className="text-gray-500 text-xs">This user hasn't marked any anime as favorites</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
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
              <div className="glass rounded-xl p-4 sm:p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Performance
                </h3>
                <div className="space-y-3">
                  {/* Activity Stats */}
                  {activityStats ? (
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
                  ) : (
                    <div className="text-center py-2">
                      <span className="text-gray-400 text-sm">
                        {isOwnProfile ? 'Sign in to view activity stats' : 'Activity stats not available'}
                      </span>
                    </div>
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

              
            </div>
            </div>

            {/* Relationship Status */}
            {!isOwnProfile && relationship && (
              <div className="mt-6 flex flex-wrap gap-2 items-center text-sm">
                {relationship.isFollowedBy && (
                  <Badge variant="outline" className="border-primary-500/30 text-primary-400">
                    Follows you
                  </Badge>
                )}
                {relationship.isFriend && (
                  <Badge variant="outline" className="border-success-500/30 text-success-400">
                    <Heart className="h-3 w-3 mr-1 fill-success-400" />
                    Friends
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
  )
}