'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Bell, BellOff, Check, X, User, UserPlus, Heart, 
  MessageCircle, Share2, Loader2, CheckCheck, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LoadingState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/error-state'
import { useAuth } from '@/app/lib/auth-context'
import {
  apiGetNotifications,
  apiMarkNotificationAsRead,
  apiMarkAllNotificationsAsRead,
  apiGetPendingFriendRequests,
  apiAcceptFriendRequest,
  apiDeclineFriendRequest
} from '@/app/lib/api'
import { cn } from '@/app/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: string
  message: string
  actionUrl?: string | null
  isRead: boolean
  createdAt: string
  fromUserId?: string | null
  animeId?: string | null
}

interface FriendRequest {
  id: string
  createdAt: string
  sender: {
    id: string
    username: string
    name?: string | null
    avatar?: string | null
    bio?: string | null
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    } else if (user) {
      loadNotifications()
      loadFriendRequests()
    }
  }, [user, authLoading, filter])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await apiGetNotifications({ limit: 50, unreadOnly: filter === 'unread' }) as any
      setNotifications(data.notifications)
      setUnreadCount(data.notifications.filter((n: any) => !n.isRead).length)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFriendRequests = async () => {
    try {
      const data = await apiGetPendingFriendRequests() as any
      setFriendRequests(data.requests)
    } catch (error) {
      console.error('Failed to load friend requests:', error)
    }
  }

  const handleMarkRead = async (notificationId: string) => {
    try {
      await apiMarkNotificationAsRead(notificationId)
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await apiMarkAllNotificationsAsRead()
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleAcceptFriendRequest = async (requestId: string) => {
    try {
      await apiAcceptFriendRequest(requestId)
      setFriendRequests(friendRequests.filter(r => r.id !== requestId))
      await loadNotifications()
    } catch (error) {
      console.error('Failed to accept friend request:', error)
    }
  }

  const handleDeclineFriendRequest = async (requestId: string) => {
    try {
      await apiDeclineFriendRequest(requestId)
      setFriendRequests(friendRequests.filter(r => r.id !== requestId))
    } catch (error) {
      console.error('Failed to decline friend request:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_follower':
        return <UserPlus className="h-5 w-5 text-primary-400" />
      case 'friend_request':
        return <UserPlus className="h-5 w-5 text-success-400" />
      case 'friend_accepted':
        return <Heart className="h-5 w-5 text-success-400" />
      case 'review_liked':
        return <Heart className="h-5 w-5 text-error-400" />
      case 'review_commented':
        return <MessageCircle className="h-5 w-5 text-secondary-400" />
      case 'anime_shared':
      case 'anime_recommended':
        return <Share2 className="h-5 w-5 text-warning-400" />
      case 'friend_started_watching':
        return <User className="h-5 w-5 text-planning-400" />
      default:
        return <Bell className="h-5 w-5 text-gray-400" />
    }
  }

  if (authLoading || loading) {
    return <LoadingState text="Loading notifications..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Notifications</h1>
            <p className="text-gray-400">
              {unreadCount > 0 ? (
                <span className="text-primary-400 font-semibold">{unreadCount} unread</span>
              ) : (
                'You\'re all caught up!'
              )}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className={cn(
              filter === 'all'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                : 'border-white/20 text-white hover:bg-white/10'
            )}
          >
            All Notifications
          </Button>
          <Button
            onClick={() => setFilter('unread')}
            variant={filter === 'unread' ? 'default' : 'outline'}
            className={cn(
              filter === 'unread'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                : 'border-white/20 text-white hover:bg-white/10'
            )}
          >
            Unread ({unreadCount})
          </Button>
        </div>

        {/* Friend Requests Section */}
        {friendRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-success-400" />
              Friend Requests ({friendRequests.length})
            </h2>
            <div className="space-y-3">
              {friendRequests.map((request) => (
                <div
                  key={request.id}
                  className="glass rounded-xl p-4 border border-success-500/30 hover:border-success-500/50 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Avatar */}
                      {request.sender.avatar ? (
                        <Image
                          src={request.sender.avatar}
                          alt={request.sender.username}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary-400" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/user/${request.sender.username}`}
                          className="font-semibold text-white hover:text-primary-400 transition-colors block truncate"
                        >
                          {request.sender.name || request.sender.username}
                        </Link>
                        <p className="text-sm text-gray-400 truncate">
                          @{request.sender.username} • {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        onClick={() => handleAcceptFriendRequest(request.id)}
                        size="sm"
                        className="bg-success-500 hover:bg-success-600 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleDeclineFriendRequest(request.id)}
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-8 bg-white/10" />
          </div>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <EmptyState
            icon={filter === 'unread' ? <CheckCheck className="h-12 w-12 text-gray-500" /> : <BellOff className="h-12 w-12 text-gray-500" />}
            title={filter === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
            message={filter === 'unread' ? 'You\'re all caught up! Check back later for updates.' : 'You haven\'t received any notifications yet.'}
            actionLabel={filter === 'unread' ? 'Show All' : undefined}
            onAction={filter === 'unread' ? () => setFilter('all') : undefined}
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "glass rounded-xl p-4 border transition-all hover:border-white/20 cursor-pointer",
                  notification.isRead
                    ? 'border-white/5 bg-white/0'
                    : 'border-primary-500/30 bg-primary-500/5'
                )}
                onClick={() => {
                  if (!notification.isRead) {
                    handleMarkRead(notification.id)
                  }
                  if (notification.actionUrl) {
                    router.push(notification.actionUrl)
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm mb-1",
                      notification.isRead ? 'text-gray-400' : 'text-white font-medium'
                    )}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary-500" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

