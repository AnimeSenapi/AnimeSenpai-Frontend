'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { apiGetUnreadNotificationCount } from '@/app/lib/api'

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const data = await apiGetUnreadNotificationCount() as any
      setUnreadCount(data.count)
    } catch (error) {
      // Silently fail - user might not be logged in
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link
      href="/notifications"
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
      
      {/* Unread Badge */}
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-error-500 to-error-600 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-lg">
          <span className="text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </div>
      )}
    </Link>
  )
}

