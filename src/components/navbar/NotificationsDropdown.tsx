'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Bell,
  Check,
  X,
  User,
  UserPlus,
  Heart,
  MessageCircle,
  Share2,
  CheckCheck,
  Loader2,
} from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { useAuth } from '@/app/lib/auth-context'
import {
  apiGetNotifications,
  apiGetUnreadNotificationCount,
  apiMarkNotificationAsRead,
  apiMarkAllNotificationsAsRead,
  apiGetPendingFriendRequests,
  apiAcceptFriendRequest,
  apiDeclineFriendRequest,
} from '@/app/lib/api'
import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MobileBottomSheet } from '@/components/ui/MobileBottomSheet'
import { Button } from '@/components/ui/button'

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

export function NotificationsDropdown() {
  const { isAuthenticated } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      setUnreadCount(0)
      return
    }

    loadUnreadCount()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated])

  useEffect(() => {
    if ((dropdownOpen || drawerOpen) && isAuthenticated) {
      loadNotifications()
      loadFriendRequests()
    }
  }, [dropdownOpen, drawerOpen, isAuthenticated])

  const loadUnreadCount = async () => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      return
    }

    try {
      const data = (await apiGetUnreadNotificationCount()) as any
      setUnreadCount(data.count || 0)
    } catch (error) {
      // Silently fail - user might not be authenticated yet
      setUnreadCount(0)
    }
  }

  const loadNotifications = async () => {
    if (!isAuthenticated) {
      setNotifications([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = (await apiGetNotifications({ limit: 20, unreadOnly: false })) as any
      setNotifications(data.notifications || [])
    } catch (error) {
      // Silently fail - user might not be authenticated yet
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const loadFriendRequests = async () => {
    if (!isAuthenticated) {
      setFriendRequests([])
      return
    }

    try {
      const data = (await apiGetPendingFriendRequests()) as any
      setFriendRequests(data.requests || [])
    } catch (error) {
      // Silently fail - user might not be authenticated yet
      setFriendRequests([])
    }
  }

  const handleMarkRead = async (notificationId: string) => {
    try {
      await apiMarkNotificationAsRead(notificationId)
      setNotifications(
        notifications.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      )
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await apiMarkAllNotificationsAsRead()
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleAcceptFriendRequest = async (requestId: string) => {
    try {
      await apiAcceptFriendRequest(requestId)
      setFriendRequests(friendRequests.filter((r) => r.id !== requestId))
      await loadNotifications()
    } catch (error) {
      console.error('Failed to accept friend request:', error)
    }
  }

  const handleDeclineFriendRequest = async (requestId: string) => {
    try {
      await apiDeclineFriendRequest(requestId)
      setFriendRequests(friendRequests.filter((r) => r.id !== requestId))
    } catch (error) {
      console.error('Failed to decline friend request:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_follower':
        return <UserPlus className="h-4 w-4 text-primary-400" />
      case 'friend_request':
        return <UserPlus className="h-4 w-4 text-success-400" />
      case 'friend_accepted':
        return <Heart className="h-4 w-4 text-success-400" />
      case 'review_liked':
        return <Heart className="h-4 w-4 text-error-400" />
      case 'review_commented':
        return <MessageCircle className="h-4 w-4 text-secondary-400" />
      case 'anime_shared':
      case 'anime_recommended':
        return <Share2 className="h-4 w-4 text-warning-400" />
      case 'friend_started_watching':
        return <User className="h-4 w-4 text-planning-400" />
      default:
        return <Bell className="h-4 w-4 text-gray-400" />
    }
  }

  const getNotificationType = (type: string): 'social' | 'activity' | 'reviews' | 'anime' | 'all' => {
    if (type.includes('friend') || type.includes('follower') || type.includes('follow')) {
      return 'social'
    }
    if (type.includes('review')) {
      return 'reviews'
    }
    if (type.includes('anime') || type.includes('watching') || type.includes('episode')) {
      return 'anime'
    }
    return 'activity'
  }

  const groupNotificationsByType = (notifications: Notification[]) => {
    const groups: Record<string, Notification[]> = {
      social: [],
      activity: [],
      reviews: [],
      anime: [],
      all: [],
    }

    notifications.forEach((notification) => {
      const groupType = getNotificationType(notification.type)
      if (groups[groupType]) {
        groups[groupType].push(notification)
      }
    })

    // Return groups that have notifications, preserving order
    const result: Array<{ type: string; notifications: Notification[] }> = []
    if (groups.social && groups.social.length > 0) result.push({ type: 'social', notifications: groups.social })
    if (groups.reviews && groups.reviews.length > 0) result.push({ type: 'reviews', notifications: groups.reviews })
    if (groups.anime && groups.anime.length > 0) result.push({ type: 'anime', notifications: groups.anime })
    if (groups.activity && groups.activity.length > 0) result.push({ type: 'activity', notifications: groups.activity })

    // If no groups, return all notifications
    if (result.length === 0) {
      result.push({ type: 'all', notifications })
    }

    return result
  }

  const NotificationsContent = () => (
    <div className="w-full sm:w-96 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800/30">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary-400" />
            Notifications
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {unreadCount > 0 ? (
              <span className="text-primary-400 font-medium">{unreadCount} unread</span>
            ) : (
              'All caught up!'
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllRead}
            size="sm"
            variant="ghost"
            className="text-xs hover:bg-white/10 transition-all"
            title="Mark all notifications as read"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Friend Requests */}
            {friendRequests.length > 0 && (
              <div className="px-4 pt-4 pb-3 border-b border-gray-800/30">
                <h4 className="text-xs font-semibold text-success-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <UserPlus className="h-3.5 w-3.5" />
                  Friend Requests ({friendRequests.length})
                </h4>
                <div className="space-y-1.5">
                  {friendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="relative px-4 py-3 rounded-lg backdrop-blur-xl bg-gray-900/30 hover:bg-gray-900/40 transition-all duration-150 border-l-2 border-success-500 border border-gray-800/20"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {request.sender.avatar ? (
                            <Image
                              src={request.sender.avatar}
                              alt={request.sender.username}
                              width={36}
                              height={36}
                              className="rounded-full flex-shrink-0 border-2 border-success-500/30"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-success-500/20 to-success-600/20 flex items-center justify-center flex-shrink-0 border-2 border-success-500/30">
                              <User className="h-4 w-4 text-success-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {request.sender.username}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              @{request.sender.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <Button
                            onClick={() => handleAcceptFriendRequest(request.id)}
                            size="sm"
                            className="h-8 px-3 bg-success-500 hover:bg-success-600 text-white shadow-lg shadow-success-500/20"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleDeclineFriendRequest(request.id)}
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 hover:bg-white/10"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications */}
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-gray-900/60 border border-gray-800/40 flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-300">No notifications yet</p>
                <p className="text-xs text-gray-500 mt-1 text-center">You'll see updates here</p>
              </div>
            ) : (
              <div>
                {groupNotificationsByType(notifications).map((group, groupIndex) => (
                  <div key={groupIndex} className={cn(groupIndex > 0 && 'border-t border-gray-800/30')}>
                    {group.type !== 'all' && (
                      <h4 className="text-xs font-semibold text-gray-500 mb-1.5 px-4 pt-3 uppercase tracking-wider">
                        {group.type === 'social' && 'Social Activity'}
                        {group.type === 'activity' && 'Activity Updates'}
                        {group.type === 'reviews' && 'Review Activity'}
                        {group.type === 'anime' && 'Anime Updates'}
                      </h4>
                    )}
                    <div className="space-y-1.5">
                      {group.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'relative px-4 py-3 cursor-pointer transition-all duration-150 group rounded-lg',
                      'backdrop-blur-xl border',
                      notification.isRead
                        ? 'bg-gray-900/20 hover:bg-gray-900/30 border-gray-800/20'
                        : 'bg-gray-900/30 hover:bg-gray-900/40 border-primary-500/30'
                    )}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkRead(notification.id)
                      }
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl
                      }
                    }}
                  >
                    {!notification.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-full" />
                    )}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm leading-snug',
                            notification.isRead 
                              ? 'text-gray-300' 
                              : 'text-white'
                          )}
                        >
                          {notification.message}
                        </p>
                        <p className={cn(
                          'text-xs mt-1',
                          notification.isRead ? 'text-gray-500' : 'text-gray-400'
                        )}>
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-800/30">
        <Link
          href="/notifications"
          className="block w-full text-center text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors py-2 rounded-lg hover:bg-gray-900/50"
          onClick={() => {
            setDropdownOpen(false)
            setDrawerOpen(false)
          }}
        >
          View all notifications →
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Dropdown */}
      <div className="hidden sm:block">
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'relative flex items-center justify-center w-10 h-10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200',
                unreadCount > 0 && 'text-primary-400'
              )}
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
              <Bell className={cn('h-5 w-5', unreadCount > 0 && 'animate-pulse')} />

              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-error-500 to-error-600 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-lg">
                  <span className="text-xs font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-0 w-96">
            <NotificationsContent />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="sm:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className={cn(
            'relative flex items-center justify-center w-10 h-10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200',
            unreadCount > 0 && 'text-primary-400'
          )}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className={cn('h-5 w-5', unreadCount > 0 && 'animate-pulse')} />

          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-error-500 to-error-600 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-lg">
              <span className="text-xs font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </button>
        <MobileBottomSheet
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Notifications"
          className="max-h-[85vh]"
          snapPoints={['70vh', '85vh']}
          showHeader={false}
        >
          <NotificationsContent />
        </MobileBottomSheet>
      </div>
    </>
  )
}
