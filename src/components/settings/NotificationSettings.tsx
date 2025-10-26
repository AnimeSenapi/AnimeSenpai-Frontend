'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Check, X, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useToast } from '../ui/toast'
import {
  pushNotificationService,
  isPushNotificationSupported,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from '../../lib/push-notifications'

export function NotificationSettings() {
  const { addToast } = useToast()

  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkNotificationStatus()
  }, [])

  const checkNotificationStatus = async () => {
    const supported = isPushNotificationSupported()
    setIsSupported(supported)

    if (supported) {
      const currentPermission = getNotificationPermissionStatus()
      setPermission(currentPermission)

      // Check if already subscribed
      if (currentPermission === 'granted' && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      }
    }
  }

  const handleEnableNotifications = async () => {
    setLoading(true)

    try {
      // Request permission
      const granted = await requestNotificationPermission()

      if (!granted) {
        addToast({
        title: 'Error',
        description: 'Notification permission denied',
        variant: 'destructive',
      })
        setPermission('denied')
        setLoading(false)
        return
      }

      setPermission('granted')

      // Subscribe to push
      const subscription = await subscribeToPushNotifications()

      if (subscription) {
        setIsSubscribed(true)
        addToast({
        title: 'Success',
        description: 'Push notifications enabled!',
        variant: 'success',
      })

        // Show a test notification
        await pushNotificationService.showLocalNotification('Notifications Enabled! 🎉', {
          body: "You'll now receive updates about friend activities, new followers, and more!",
          icon: '/favicon.ico',
        })
      } else {
        addToast({
        title: 'Error',
        description: 'Failed to enable notifications',
        variant: 'destructive',
      })
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error)
      addToast({
        title: 'Error',
        description: 'Failed to enable notifications',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDisableNotifications = async () => {
    setLoading(true)

    try {
      const success = await unsubscribeFromPushNotifications()

      if (success) {
        setIsSubscribed(false)
        addToast({
        title: 'Success',
        description: 'Push notifications disabled',
        variant: 'success',
      })
      } else {
        addToast({
        title: 'Error',
        description: 'Failed to disable notifications',
        variant: 'destructive',
      })
      }
    } catch (error) {
      console.error('Failed to disable notifications:', error)
      addToast({
        title: 'Error',
        description: 'Failed to disable notifications',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="glass rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <BellOff className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-white">Push Notifications</h3>
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Not Supported</Badge>
        </div>
        <p className="text-sm text-gray-400">
          Push notifications are not supported in your browser. Please use a modern browser like
          Chrome, Firefox, or Edge.
        </p>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <Bell className="h-5 w-5 text-primary-400" />
        <h3 className="text-lg font-semibold text-white">Push Notifications</h3>
        {isSubscribed && (
          <Badge className="bg-success-500/20 text-success-400 border-success-500/30">
            <Check className="h-3 w-3 mr-1" />
            Enabled
          </Badge>
        )}
      </div>

      <p className="text-sm text-gray-400 mb-6">
        Get notified about friend activities, new followers, and more
      </p>

      {/* Permission Status */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-400">Status:</span>
          {permission === 'granted' ? (
            <Badge className="bg-success-500/20 text-success-400 border-success-500/30 text-xs">
              <Check className="h-3 w-3 mr-1" />
              Granted
            </Badge>
          ) : permission === 'denied' ? (
            <Badge className="bg-error-500/20 text-error-400 border-error-500/30 text-xs">
              <X className="h-3 w-3 mr-1" />
              Blocked
            </Badge>
          ) : (
            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
              Not Set
            </Badge>
          )}
        </div>

        {permission === 'denied' && (
          <div className="p-3 bg-error-500/10 border border-error-500/30 rounded-lg">
            <p className="text-xs text-error-300">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          </div>
        )}
      </div>

      {/* Notification Types */}
      <div className="space-y-3 mb-6">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          You'll be notified about:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <Check className="h-4 w-4 text-success-400" />
            New followers
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Check className="h-4 w-4 text-success-400" />
            Friend requests
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Check className="h-4 w-4 text-success-400" />
            Review likes & comments
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Check className="h-4 w-4 text-success-400" />
            Friend recommendations
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Check className="h-4 w-4 text-success-400" />
            Tagged in reviews
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Check className="h-4 w-4 text-success-400" />
            Friend activity updates
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex gap-3">
        {isSubscribed ? (
          <Button
            onClick={handleDisableNotifications}
            disabled={loading}
            variant="outline"
            className="border-error-500/30 text-error-400 hover:bg-error-500/20"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BellOff className="h-4 w-4 mr-2" />
            )}
            Disable Notifications
          </Button>
        ) : (
          <Button
            onClick={handleEnableNotifications}
            disabled={loading || permission === 'denied'}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Bell className="h-4 w-4 mr-2" />
            )}
            Enable Notifications
          </Button>
        )}
      </div>
    </div>
  )
}
