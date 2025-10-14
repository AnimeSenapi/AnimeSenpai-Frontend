'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { 
  Activity as ActivityIcon, 
  Heart, 
  Star, 
  Play, 
  Check, 
  UserPlus,
  MessageCircle,
  Loader2
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { LoadingState } from '../../components/ui/loading-state'
import { EmptyState } from '../../components/ui/error-state'
import { useAuth } from '../lib/auth-context'
import { cn } from '../lib/utils'

interface Activity {
  id: string
  userId: string
  activityType: string
  animeId?: string | null
  targetUserId?: string | null
  metadata: any
  isPublic: boolean
  createdAt: string
  user: {
    id: string
    username: string
    name: string | null
    avatar: string | null
  }
  anime?: {
    id: string
    slug: string
    title: string
    titleEnglish: string | null
    coverImage: string | null
  } | null
  targetUser?: {
    id: string
    username: string
    name: string | null
  } | null
}

export default function ActivityFeedPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }
    
    loadActivities()
  }, [isAuthenticated])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  const loadActivities = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3003/api/trpc'
      const url = `${API_URL}/activity.getFriendActivities?input=${encodeURIComponent(JSON.stringify({
        limit: 20,
        cursor: loadMore ? cursor : undefined
      }))}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Failed to load activities')
      }
      
      const json = await response.json()
      const data = json.result?.data
      
      if (data) {
        if (loadMore) {
          setActivities(prev => [...prev, ...(data.activities || [])])
        } else {
          setActivities(data.activities || [])
        }
        setCursor(data.nextCursor)
        setHasMore(!!data.nextCursor)
      }
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'rated_anime':
        return <Star className="h-4 w-4 text-yellow-400" />
      case 'completed_anime':
        return <Check className="h-4 w-4 text-success-400" />
      case 'started_watching':
        return <Play className="h-4 w-4 text-primary-400" />
      case 'added_to_list':
        return <Heart className="h-4 w-4 text-error-400" />
      case 'followed_user':
        return <UserPlus className="h-4 w-4 text-secondary-400" />
      case 'reviewed_anime':
        return <MessageCircle className="h-4 w-4 text-primary-400" />
      default:
        return <ActivityIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const getActivityText = (activity: Activity) => {
    const username = activity.user.name || activity.user.username
    const animeTitle = activity.anime?.titleEnglish || activity.anime?.title
    const targetUsername = activity.targetUser?.name || activity.targetUser?.username
    
    switch (activity.activityType) {
      case 'rated_anime':
        const rating = activity.metadata?.score || activity.metadata?.rating
        return (
          <>
            <span className="font-semibold text-white">{username}</span> rated{' '}
            <Link href={`/anime/${activity.anime?.slug}`} className="font-semibold text-primary-400 hover:text-primary-300">
              {animeTitle}
            </Link>
            {rating && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-white">{rating}/10</span>
              </span>
            )}
          </>
        )
      
      case 'completed_anime':
        return (
          <>
            <span className="font-semibold text-white">{username}</span> completed{' '}
            <Link href={`/anime/${activity.anime?.slug}`} className="font-semibold text-success-400 hover:text-success-300">
              {animeTitle}
            </Link>
          </>
        )
      
      case 'started_watching':
        return (
          <>
            <span className="font-semibold text-white">{username}</span> started watching{' '}
            <Link href={`/anime/${activity.anime?.slug}`} className="font-semibold text-primary-400 hover:text-primary-300">
              {animeTitle}
            </Link>
          </>
        )
      
      case 'added_to_list':
        const status = activity.metadata?.status
        return (
          <>
            <span className="font-semibold text-white">{username}</span> added{' '}
            <Link href={`/anime/${activity.anime?.slug}`} className="font-semibold text-primary-400 hover:text-primary-300">
              {animeTitle}
            </Link>
            {status && <span className="text-gray-400"> to {status.replace('-', ' ')}</span>}
          </>
        )
      
      case 'followed_user':
        return (
          <>
            <span className="font-semibold text-white">{username}</span> started following{' '}
            <Link href={`/user/${activity.targetUser?.username}`} className="font-semibold text-secondary-400 hover:text-secondary-300">
              {targetUsername}
            </Link>
          </>
        )
      
      case 'reviewed_anime':
        return (
          <>
            <span className="font-semibold text-white">{username}</span> reviewed{' '}
            <Link href={`/anime/${activity.anime?.slug}`} className="font-semibold text-primary-400 hover:text-primary-300">
              {animeTitle}
            </Link>
          </>
        )
      
      default:
        return <span className="text-gray-400">Unknown activity</span>
    }
  }

  const filteredActivities = filterType === 'all' 
    ? activities 
    : activities.filter(a => a.activityType === filterType)

  if (loading) {
    return <LoadingState variant="full" text="Loading activity feed..." size="lg" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      <main className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center">
              <ActivityIcon className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Activity Feed</h1>
              <p className="text-gray-400">See what your friends are watching</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
              className={cn(
                filterType === 'all'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                  : 'border-white/20 text-white hover:bg-white/10'
              )}
            >
              All Activity
            </Button>
            <Button
              variant={filterType === 'started_watching' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('started_watching')}
              className={cn(
                filterType === 'started_watching'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                  : 'border-white/20 text-white hover:bg-white/10'
              )}
            >
              <Play className="h-3 w-3 mr-1" />
              Watching
            </Button>
            <Button
              variant={filterType === 'completed_anime' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('completed_anime')}
              className={cn(
                filterType === 'completed_anime'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                  : 'border-white/20 text-white hover:bg-white/10'
              )}
            >
              <Check className="h-3 w-3 mr-1" />
              Completed
            </Button>
            <Button
              variant={filterType === 'rated_anime' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('rated_anime')}
              className={cn(
                filterType === 'rated_anime'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                  : 'border-white/20 text-white hover:bg-white/10'
              )}
            >
              <Star className="h-3 w-3 mr-1" />
              Rated
            </Button>
            <Button
              variant={filterType === 'reviewed_anime' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('reviewed_anime')}
              className={cn(
                filterType === 'reviewed_anime'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                  : 'border-white/20 text-white hover:bg-white/10'
              )}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Reviews
            </Button>
          </div>
        </div>

        {/* Activity Timeline */}
        {filteredActivities.length === 0 ? (
          <EmptyState
            icon={<ActivityIcon className="h-12 w-12 text-gray-500" />}
            title="No Activity Yet"
            message="Your friends haven't been active recently. Start following more users to see their activity!"
            actionLabel="Find Users to Follow"
            onAction={() => router.push('/search/users')}
          />
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div 
                key={activity.id}
                className="glass rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex gap-4">
                  {/* User Avatar */}
                  <Link href={`/user/${activity.user.username}`}>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 overflow-hidden border border-white/10">
                      {activity.user.avatar ? (
                        <Image 
                          src={activity.user.avatar} 
                          alt={activity.user.username}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-primary-400">
                          {activity.user.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    {/* Activity Text */}
                    <div className="flex items-start gap-2 mb-2">
                      <div className="mt-0.5">
                        {getActivityIcon(activity.activityType)}
                      </div>
                      <p className="text-sm text-gray-300 flex-1">
                        {getActivityText(activity)}
                      </p>
                    </div>

                    {/* Anime Cover (if applicable) */}
                    {activity.anime && (
                      <Link href={`/anime/${activity.anime.slug}`}>
                        <div className="inline-block mt-2">
                          <div className="w-16 h-24 rounded-lg overflow-hidden border border-white/10 hover:border-primary-500/50 transition-all relative">
                            {activity.anime.coverImage ? (
                              <Image 
                                src={activity.anime.coverImage} 
                                alt={activity.anime.title}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <span className="text-2xl">🎬</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    )}

                    {/* Review Preview (if reviewed) */}
                    {activity.activityType === 'reviewed_anime' && activity.metadata?.reviewPreview && (
                      <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-gray-300 line-clamp-2 italic">
                          "{activity.metadata.reviewPreview}"
                        </p>
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => loadActivities(true)}
                  disabled={loadingMore}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

