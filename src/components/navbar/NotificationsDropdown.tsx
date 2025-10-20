'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Bell, Check, X, User, UserPlus, Heart, 
  MessageCircle, Share2, CheckCheck, Loader2
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
  apiDeclineFriendRequest
} from '@/app/lib/api'
import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

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
  const [open, setOpen] = useState(false)

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
    if (open && isAuthenticated) {
      loadNotifications()
      loadFriendRequests()
    }
  }, [open, isAuthenticated])

  const loadUnreadCount = async () => {
    if (!isAuthenticated) return

    try {
      const data = await apiGetUnreadNotificationCount() as any
      setUnreadCount(data.count || 0)
    } catch (error) {
      setUnreadCount(0)
    }
  }

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await apiGetNotifications({ limit: 20, unreadOnly: false }) as any
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFriendRequests = async () => {
    try {
      const data = await apiGetPendingFriendRequests() as any
      setFriendRequests(data.requests || [])
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

  const NotificationsContent = () => (
    <div className="w-full sm:w-96 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white">Notifications</h3>
          <p className="text-xs text-gray-400">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllRead}
            size="sm"
            variant="ghost"
            className="text-xs"
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
              <div className="p-4 border-b border-white/10">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-success-400" />
                  Friend Requests ({friendRequests.length})
                </h4>
                <div className="space-y-2">
                  {friendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="glass rounded-lg p-3 border border-success-500/30"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {request.sender.avatar ? (
                            <Image
                              src={request.sender.avatar}
                              alt={request.sender.username}
                              width={32}
                              height={32}
                              className="rounded-full flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-primary-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {request.sender.name || request.sender.username}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              @{request.sender.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            onClick={() => handleAcceptFriendRequest(request.id)}
                            size="sm"
                            className="h-7 px-2 bg-success-500 hover:bg-success-600 text-white"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleDeclineFriendRequest(request.id)}
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                          >
                            <X className="h-3 w-3" />
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
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="h-12 w-12 text-gray-500 mb-3" />
                <p className="text-sm text-gray-400 text-center">No notifications yet</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "rounded-lg p-3 cursor-pointer transition-all",
                      notification.isRead
                        ? 'hover:bg-white/5'
                        : 'bg-primary-500/10 border border-primary-500/30'
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
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm",
                          notification.isRead ? 'text-gray-400' : 'text-white font-medium'
                        )}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <Link
          href="/notifications"
          className="block w-full text-center text-sm text-primary-400 hover:text-primary-300 transition-colors"
          onClick={() => setOpen(false)}
        >
          View all notifications
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Dropdown */}
      <div className="hidden sm:block">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200",
                unreadCount > 0 && "text-primary-400"
              )}
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
              <Bell className={cn(
                "h-5 w-5",
                unreadCount > 0 && "animate-pulse"
              )} />
              
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

      {/* Mobile Drawer */}
      <div className="sm:hidden">
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <button
              className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200",
                unreadCount > 0 && "text-primary-400"
              )}
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
              <Bell className={cn(
                "h-5 w-5",
                unreadCount > 0 && "animate-pulse"
              )} />
              
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-error-500 to-error-600 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-lg">
                  <span className="text-xs font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="p-0">
              <NotificationsContent />
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  )
}

