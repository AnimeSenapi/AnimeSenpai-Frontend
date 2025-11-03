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
  Loader2,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
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
  const { isAuthenticated } = useAuth()

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

  const loadActivities = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const { apiGetFriendActivities } = await import('../lib/api')
      const data = (await apiGetFriendActivities({
        limit: 20,
        cursor: loadMore ? cursor || undefined : undefined,
      })) as any

      if (data) {
        if (loadMore) {
          setActivities((prev) => [...prev, ...(data.activities || [])])
        } else {
          setActivities(data.activities || [])
        }
        setCursor(data.nextCursor)
        setHasMore(!!data.nextCursor)
      }
    } catch (error) {
      console.error('Failed to load activities:', error)
      setActivities([])
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
            <Link
              href={`/user/${activity.user.username}`}
              className="font-medium text-white hover:text-primary-400 transition-colors"
            >
              {username}
            </Link>{' '}
            rated{' '}
            <Link
              href={`/anime/${activity.anime?.slug}`}
              className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
            >
              {animeTitle}
            </Link>
            {rating && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-white">{rating}/10</span>
              </span>
            )}
          </>
        )

      case 'completed_anime':
        return (
          <>
            <Link
              href={`/user/${activity.user.username}`}
              className="font-medium text-white hover:text-primary-400 transition-colors"
            >
              {username}
            </Link>{' '}
            completed{' '}
            <Link
              href={`/anime/${activity.anime?.slug}`}
              className="font-medium text-success-400 hover:text-success-300 transition-colors"
            >
              {animeTitle}
            </Link>
          </>
        )

      case 'started_watching':
        return (
          <>
            <Link
              href={`/user/${activity.user.username}`}
              className="font-medium text-white hover:text-primary-400 transition-colors"
            >
              {username}
            </Link>{' '}
            started watching{' '}
            <Link
              href={`/anime/${activity.anime?.slug}`}
              className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
            >
              {animeTitle}
            </Link>
          </>
        )

      case 'added_to_list':
        const status = activity.metadata?.status
        return (
          <>
            <Link
              href={`/user/${activity.user.username}`}
              className="font-medium text-white hover:text-primary-400 transition-colors"
            >
              {username}
            </Link>{' '}
            added{' '}
            <Link
              href={`/anime/${activity.anime?.slug}`}
              className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
            >
              {animeTitle}
            </Link>
            {status && <span className="text-gray-400"> to {status.replace('-', ' ')}</span>}
          </>
        )

      case 'followed_user':
        return (
          <>
            <Link
              href={`/user/${activity.user.username}`}
              className="font-medium text-white hover:text-primary-400 transition-colors"
            >
              {username}
            </Link>{' '}
            started following{' '}
            <Link
              href={`/user/${activity.targetUser?.username}`}
              className="font-medium text-secondary-400 hover:text-secondary-300 transition-colors"
            >
              {targetUsername}
            </Link>
          </>
        )

      case 'reviewed_anime':
        return (
          <>
            <Link
              href={`/user/${activity.user.username}`}
              className="font-medium text-white hover:text-primary-400 transition-colors"
            >
              {username}
            </Link>{' '}
            reviewed{' '}
            <Link
              href={`/anime/${activity.anime?.slug}`}
              className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
            >
              {animeTitle}
            </Link>
          </>
        )

      default:
        return <span className="text-gray-400">Unknown activity</span>
    }
  }

  const filteredActivities =
    filterType === 'all' ? activities : activities.filter((a) => a.activityType === filterType)

  if (loading) {
    return <LoadingState variant="full" text="Loading activity feed..." size="lg" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      <main className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-12 sm:pb-16 lg:pb-20">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center border border-primary-500/30">
              <ActivityIcon className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Activity Feed</h1>
              <p className="text-gray-400 text-sm">See what your friends are watching</p>
            </div>
          </div>

          {/* Filters */}
          <div className="glass rounded-xl p-3 border border-white/10">
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            <Button
              onClick={() => setFilterType('all')}
              className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm whitespace-nowrap flex-shrink-0',
                filterType === 'all'
                    ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/40 text-white shadow-md shadow-primary-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent glass'
              )}
            >
              All Activity
            </Button>
            <Button
              onClick={() => setFilterType('started_watching')}
              className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm whitespace-nowrap flex-shrink-0',
                filterType === 'started_watching'
                    ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/40 text-white shadow-md shadow-primary-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent glass'
              )}
            >
                <Play className="h-4 w-4" />
              Watching
            </Button>
            <Button
              onClick={() => setFilterType('completed_anime')}
              className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm whitespace-nowrap flex-shrink-0',
                filterType === 'completed_anime'
                    ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/40 text-white shadow-md shadow-primary-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent glass'
              )}
            >
                <Check className="h-4 w-4" />
              Completed
            </Button>
            <Button
              onClick={() => setFilterType('rated_anime')}
              className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm whitespace-nowrap flex-shrink-0',
                filterType === 'rated_anime'
                    ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/40 text-white shadow-md shadow-primary-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent glass'
              )}
            >
                <Star className="h-4 w-4" />
              Rated
            </Button>
            <Button
              onClick={() => setFilterType('reviewed_anime')}
              className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm whitespace-nowrap flex-shrink-0',
                filterType === 'reviewed_anime'
                    ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/40 text-white shadow-md shadow-primary-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent glass'
              )}
            >
                <MessageCircle className="h-4 w-4" />
              Reviews
            </Button>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        {filteredActivities.length === 0 ? (
          <div className="glass rounded-xl p-12 border border-white/10">
          <EmptyState
            icon={<ActivityIcon className="h-12 w-12 text-gray-500" />}
            title="No Activity Yet"
            message="Your friends haven't been active recently. Start following more users to see their activity!"
            actionLabel="Find Users to Follow"
            onAction={() => router.push('/search/users')}
          />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="glass rounded-xl p-4 border border-white/10 hover:bg-white/5 transition-all"
              >
                <div className="flex gap-4">
                  {/* User Avatar */}
                  <Link href={`/user/${activity.user.username}`} className="flex-shrink-0 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 overflow-hidden border border-white/10">
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
                          {activity.user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    {/* Activity Text */}
                    <div className="flex items-start gap-2 mb-2">
                      <div className="mt-0.5 flex-shrink-0">{getActivityIcon(activity.activityType)}</div>
                      <p className="text-sm text-gray-300 flex-1 leading-relaxed">{getActivityText(activity)}</p>
                    </div>

                    {/* Anime Cover (if applicable) */}
                    {activity.anime && (
                      <Link href={`/anime/${activity.anime.slug}`} className="inline-block mt-2">
                        <div className="w-16 h-24 rounded-lg overflow-hidden border border-white/10 hover:border-primary-500/50 transition-all relative group">
                            {activity.anime.coverImage ? (
                              <Image
                                src={activity.anime.coverImage}
                                alt={activity.anime.title}
                                fill
                              className="object-cover group-hover:scale-105 transition-transform"
                                sizes="64px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <span className="text-2xl">🎬</span>
                              </div>
                            )}
                        </div>
                      </Link>
                    )}

                    {/* Review Preview (if reviewed) */}
                    {activity.activityType === 'reviewed_anime' &&
                      activity.metadata?.reviewPreview && (
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
                  className="bg-white/5 border border-white/10 text-white hover:bg-white/10 font-medium px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
