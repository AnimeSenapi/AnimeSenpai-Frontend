'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  User, 
  Calendar, 
  Star, 
  Heart, 
  CheckCircle, 
  Clock, 
  UserPlus, 
  UserMinus, 
  Users,
  Play,
  Eye,
  Activity,
  TrendingUp,
  Award,
  Film,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useAuth } from '@/app/lib/auth-context'
import { AnimeCard } from '@/components/anime/AnimeCard'
import { FollowButton } from '@/components/social/FollowButton'
import { ShareButton } from '@/components/social/ShareButton'
import type { Anime } from '@/types/anime'

interface UserProfile {
  id: string
  username: string
  name: string | null
  avatar: string | null
  bio: string | null
  role: string
  createdAt: string
  stats: {
    totalAnime: number
    totalEpisodes: number
    favorites: number
    completed: number
  }
  preferences: {
    showWatchHistory: boolean
    showFavorites: boolean
    showRatings: boolean
  }
}

interface Activity {
  id: string
  type: 'started_watching' | 'completed_anime' | 'rated_anime' | 'added_to_favorites'
  animeId: string
  anime?: {
    id: string
    slug: string
    title: string
    coverImage: string | null
  }
  metadata?: any
  createdAt: string
}

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user: currentUser, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [socialCounts, setSocialCounts] = useState({
    followers: 0,
    following: 0,
    mutualFollows: 0
  })
  const [userAnime, setUserAnime] = useState<{
    favorites: Anime[]
    watching: Anime[]
    completed: Anime[]
  }>({
    favorites: [],
    watching: [],
    completed: []
  })
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [activeTab, setActiveTab] = useState<'favorites' | 'watching' | 'completed'>('favorites')
  const [animeLoading, setAnimeLoading] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/trpc'
  const getAuthHeaders = (): Record<string, string> => {
    // Check both localStorage (Remember Me) and sessionStorage (current session)
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true)
        setError(null)

        // Decode and clean the username
        let username = decodeURIComponent(resolvedParams.username) // Decode URL encoding
        username = username.replace(/^@+/, '') // Remove leading @ symbols
        username = username.trim() // Remove whitespace
        
        // tRPC query - use GET with query params
        const response = await fetch(`${API_URL}/user.getUserByUsername?input=${encodeURIComponent(JSON.stringify({ username }))}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        const data = await response.json()

        if (data.error) {
          setError(data.error.message || 'User not found')
          return
        }

        if (data.result?.data) {
          setProfile(data.result.data)
          
          // Fetch social counts, following status, and anime list
          if (data.result.data.id) {
            fetchSocialData(data.result.data.id)
            fetchRecentActivity(data.result.data.id)
          }
          
          // Fetch user's anime list using the username (not ID)
          fetchUserAnime(username)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    async function fetchSocialData(profileUserId: string) {
      try {
        // Get social counts
        const countsResponse = await fetch(`${API_URL}/social.getSocialCounts?input=${encodeURIComponent(JSON.stringify({ userId: profileUserId }))}`, {
          method: 'GET',
          headers: getAuthHeaders()
        })
        
        const countsData = await countsResponse.json()
        if (countsData.result?.data) {
          setSocialCounts(countsData.result.data)
        }

        // Check if current user is following this profile
        if (isAuthenticated && currentUser && currentUser.id !== profileUserId) {
          const followingResponse = await fetch(`${API_URL}/social.checkFollowing?input=${encodeURIComponent(JSON.stringify({ followerId: currentUser.id, followingId: profileUserId }))}`, {
            method: 'GET',
            headers: getAuthHeaders()
          })
          
          const followingData = await followingResponse.json()
          if (followingData.result?.data) {
            setIsFollowing(followingData.result.data.following)
          }
        }
      } catch (err) {
        // Non-critical
      }
    }

    async function fetchUserAnime(username: string) {
      try {
        setAnimeLoading(true)
        // Fetch all three statuses in parallel
        const [favoritesRes, watchingRes, completedRes] = await Promise.all([
          fetch(`${API_URL}/user.getUserAnimeList?input=${encodeURIComponent(JSON.stringify({ username, status: 'favorite', limit: 50 }))}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch(`${API_URL}/user.getUserAnimeList?input=${encodeURIComponent(JSON.stringify({ username, status: 'watching', limit: 50 }))}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch(`${API_URL}/user.getUserAnimeList?input=${encodeURIComponent(JSON.stringify({ username, status: 'completed', limit: 50 }))}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          })
        ])

        const [favoritesData, watchingData, completedData] = await Promise.all([
          favoritesRes.json(),
          watchingRes.json(),
          completedRes.json()
        ])

        setUserAnime({
          favorites: favoritesData.result?.data?.items || [],
          watching: watchingData.result?.data?.items || [],
          completed: completedData.result?.data?.items || []
        })
      } catch (err) {
        console.error('Error fetching user anime:', err)
        // Set empty arrays on error
        setUserAnime({
          favorites: [],
          watching: [],
          completed: []
        })
      } finally {
        setAnimeLoading(false)
      }
    }

    async function fetchRecentActivity(profileUserId: string) {
      try {
        const response = await fetch(`${API_URL}/social.getActivityFeed?input=${encodeURIComponent(JSON.stringify({ userId: profileUserId, limit: 10 }))}`, {
          method: 'GET',
          headers: getAuthHeaders()
        })
        
        const data = await response.json()
        if (data.result?.data?.activities) {
          setRecentActivity(data.result.data.activities)
        }
      } catch (err) {
        // Non-critical
      }
    }

    fetchProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.username])

  async function handleFollow() {
    if (!profile || !isAuthenticated) return

    setIsFollowLoading(true)
    try {
      const endpoint = isFollowing ? 'social.unfollow' : 'social.follow'
      
      await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId: profile.id })
      })

      setIsFollowing(!isFollowing)
      setSocialCounts(prev => ({
        ...prev,
        followers: isFollowing ? prev.followers - 1 : prev.followers + 1
      }))
    } catch (err) {
      console.error('Follow action failed:', err)
    } finally {
      setIsFollowLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'started_watching': return <Play className="h-4 w-4 text-primary-400" />
      case 'completed_anime': return <CheckCircle className="h-4 w-4 text-success-400" />
      case 'rated_anime': return <Star className="h-4 w-4 text-warning-400" />
      case 'added_to_favorites': return <Heart className="h-4 w-4 text-error-400" />
      default: return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'started_watching': return 'Started watching'
      case 'completed_anime': return 'Completed'
      case 'rated_anime': return `Rated ${activity.metadata?.score || '?'}/10`
      case 'added_to_favorites': return 'Added to favorites'
      default: return 'Activity'
    }
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)
    
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`
    return then.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <User className="h-12 w-12 text-white" />
            </div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-error-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="glass rounded-2xl p-12">
              <div className="w-24 h-24 bg-error-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-12 w-12 text-error-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">User Not Found</h1>
              <p className="text-gray-300 mb-4">
                {error || "Looks like this user wandered off to another dimension. The username you're looking for doesn't exist."}
              </p>
              <div className="mb-8 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                <p className="text-primary-300 text-sm mb-2">
                  <strong>Looking for:</strong> @{decodeURIComponent(resolvedParams.username).replace(/^@+/, '')}
                </p>
                <p className="text-gray-400 text-sm">
                  Make sure you have created an account first, or check the username spelling.
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Go Back
                </Button>
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white">
                    Browse Anime
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  })

  const isOwnProfile = currentUser?.id === profile.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header with Cover */}
          <div className="glass rounded-2xl overflow-hidden mb-8">
            {/* Cover Image Area */}
            <div className="h-48 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-primary-500/20 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
            </div>

            {/* Profile Info */}
            <div className="px-8 pb-8 -mt-16 relative">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                {/* Avatar */}
                <div className="relative">
                  {profile.avatar ? (
                    <div className="relative w-32 h-32 rounded-2xl border-4 border-gray-900 shadow-xl overflow-hidden">
                      <Image 
                        src={profile.avatar} 
                        alt={profile.username}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl flex items-center justify-center border-4 border-gray-900 shadow-xl">
                      <User className="h-16 w-16 text-white" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {profile.name || profile.username}
                  </h1>
                  <p className="text-primary-400 text-lg mb-3">@{profile.username}</p>
                  
                  {/* Social Stats */}
                  <div className="flex items-center gap-6 mb-4">
                    <Link href={`/users/${profile.username}/followers`} className="hover:text-primary-400 transition-colors">
                      <span className="text-white font-semibold text-lg">{socialCounts.followers}</span>
                      <span className="text-gray-400 text-sm ml-1">{socialCounts.followers === 1 ? 'Follower' : 'Followers'}</span>
                    </Link>
                    <Link href={`/users/${profile.username}/following`} className="hover:text-primary-400 transition-colors">
                      <span className="text-white font-semibold text-lg">{socialCounts.following}</span>
                      <span className="text-gray-400 text-sm ml-1">Following</span>
                    </Link>
                    {socialCounts.mutualFollows > 0 && (
                      <div>
                        <span className="text-success-400 font-semibold text-lg">{socialCounts.mutualFollows}</span>
                        <span className="text-gray-400 text-sm ml-1">{socialCounts.mutualFollows === 1 ? 'Friend' : 'Friends'}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {joinDate}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 md:self-start md:mt-0">
                  {isOwnProfile ? (
                    <>
                      <Link href="/user/settings">
                        <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                          Edit Profile
                        </Button>
                      </Link>
                      <ShareButton
                        title={`@${profile?.username} on AnimeSenpai`}
                        url={`/users/@${profile?.username}`}
                        description={profile?.bio || `Check out @${profile?.username}'s anime list on AnimeSenpai!`}
                        hashtags={['AnimeSenpai', 'Anime', 'AnimeList']}
                        variant="outline"
                        showLabel={false}
                      />
                    </>
                  ) : profile ? (
                    <>
                      <FollowButton
                        userId={profile.id}
                        username={profile.username}
                        initialFollowing={isFollowing}
                        onFollowChange={(following) => {
                          setIsFollowing(following)
                          setSocialCounts(prev => ({
                            ...prev,
                            followers: following ? prev.followers + 1 : prev.followers - 1
                          }))
                        }}
                        size="default"
                      />
                      <ShareButton
                        title={`@${profile.username} on AnimeSenpai`}
                        url={`/users/@${profile.username}`}
                        description={profile.bio || `Check out @${profile.username}'s anime list on AnimeSenpai!`}
                        hashtags={['AnimeSenpai', 'Anime', 'AnimeList']}
                        variant="outline"
                        showLabel={false}
                      />
                    </>
                  ) : null}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mt-6">
                  <p className="text-gray-300 text-lg leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stats & Activity */}
            <div className="lg:col-span-1 space-y-6">
              {/* Stats Grid */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary-400" />
                  Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <Film className="h-6 w-6 text-primary-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white mb-1">{profile.stats.totalAnime}</div>
                    <div className="text-xs text-gray-400">Total Anime</div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <Play className="h-6 w-6 text-secondary-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white mb-1">{profile.stats.totalEpisodes}</div>
                    <div className="text-xs text-gray-400">Episodes</div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <Heart className="h-6 w-6 text-error-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white mb-1">{profile.stats.favorites}</div>
                    <div className="text-xs text-gray-400">Favorites</div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-success-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white mb-1">{profile.stats.completed}</div>
                    <div className="text-xs text-gray-400">Completed</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              {profile.preferences.showWatchHistory && recentActivity.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary-400" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="mt-0.5">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium mb-1">
                            {getActivityText(activity)}
                          </p>
                          {activity.anime && (
                            <Link href={`/anime/${activity.anime.slug}`} className="text-primary-400 text-sm hover:underline truncate block">
                              {activity.anime.title}
                            </Link>
                          )}
                          <p className="text-gray-500 text-xs mt-1">{getTimeAgo(activity.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {recentActivity.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full mt-4 border-white/20 text-white hover:bg-white/10"
                      onClick={() => {/* Navigate to full activity */}}
                    >
                      View All Activity
                    </Button>
                  )}
                </div>
              )}

              {/* Quick Actions (Own Profile) */}
              {isOwnProfile && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link href="/mylist">
                      <Button variant="outline" className="w-full justify-start border-white/20 text-white hover:bg-white/10">
                        <Film className="h-4 w-4 mr-2" />
                        My Anime List
                      </Button>
                    </Link>
                    <Link href="/user/settings">
                      <Button variant="outline" className="w-full justify-start border-white/20 text-white hover:bg-white/10">
                        <User className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Anime Lists */}
            <div className="lg:col-span-2">
              {/* Anime List Tabs */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-white mb-6">Anime Collection</h3>
                
                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                      activeTab === 'favorites'
                        ? 'bg-gradient-to-r from-error-500/20 to-error-600/20 text-error-400 border-2 border-error-500/50 shadow-lg shadow-error-500/20'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border-2 border-transparent'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${activeTab === 'favorites' ? 'fill-current' : ''}`} />
                    Favorites
                    <Badge className="ml-1 bg-white/10 text-white">{profile.stats.favorites}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('watching')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                      activeTab === 'watching'
                        ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-primary-400 border-2 border-primary-500/50 shadow-lg shadow-primary-500/20'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border-2 border-transparent'
                    }`}
                  >
                    <Play className={`h-4 w-4 ${activeTab === 'watching' ? 'fill-current' : ''}`} />
                    Watching
                    <Badge className="ml-1 bg-white/10 text-white">{userAnime.watching.length}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                      activeTab === 'completed'
                        ? 'bg-gradient-to-r from-success-500/20 to-success-600/20 text-success-400 border-2 border-success-500/50 shadow-lg shadow-success-500/20'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border-2 border-transparent'
                    }`}
                  >
                    <CheckCircle className={`h-4 w-4 ${activeTab === 'completed' ? 'fill-current' : ''}`} />
                    Completed
                    <Badge className="ml-1 bg-white/10 text-white">{profile.stats.completed}</Badge>
                  </button>
                </div>

                {/* Anime Grid */}
                <div className="min-h-[400px]">
                  {/* Privacy Check */}
                  {!profile.preferences.showWatchHistory && !isOwnProfile ? (
                    <div className="text-center py-20">
                      <Eye className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">This user has hidden their anime list.</p>
                      <p className="text-gray-500 text-sm mt-2">They prefer to keep their watch history private.</p>
                    </div>
                  ) : animeLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="h-8 w-8 text-primary-400 animate-spin" />
                    </div>
                  ) : userAnime[activeTab].length === 0 ? (
                    <div className="text-center py-20">
                      {activeTab === 'favorites' && <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />}
                      {activeTab === 'watching' && <Play className="h-16 w-16 text-gray-600 mx-auto mb-4" />}
                      {activeTab === 'completed' && <CheckCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />}
                      <p className="text-gray-400 text-lg mb-2">
                        {activeTab === 'favorites' && 'No favorites yet!'}
                        {activeTab === 'watching' && 'Not watching anything yet!'}
                        {activeTab === 'completed' && 'No completed anime yet!'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {isOwnProfile 
                          ? 'Start adding anime to your list to see them here.'
                          : `${profile.username} hasn't added any anime to this category yet.`}
                      </p>
                      {isOwnProfile && (
                        <Link href="/search">
                          <Button className="mt-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white">
                            Browse Anime
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                        {userAnime[activeTab].slice(0, 12).map((anime) => (
                          <AnimeCard
                            key={anime.id}
                            anime={anime}
                            variant="grid"
                          />
                        ))}
                      </div>

                      {/* See All Link */}
                      {userAnime[activeTab].length > 12 && (
                        <div className="text-center pt-4 border-t border-white/10">
                          <Button 
                            variant="outline" 
                            className="border-white/20 text-white hover:bg-white/10"
                            onClick={() => router.push(isOwnProfile ? `/mylist?filter=${activeTab}` : `/users/${profile.username}/list?filter=${activeTab}`)}
                          >
                            View All {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
                            <span className="ml-2 text-gray-400">({userAnime[activeTab].length})</span>
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}



