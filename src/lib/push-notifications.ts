/**
 * Push Notifications Service
 * Handles browser push notifications for Phase 2 Social Features
 */

export class PushNotificationService {
  private static instance: PushNotificationService
  private registration: ServiceWorkerRegistration | null = null

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    )
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied'
    }
    return Notification.permission
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported()) {
      return null
    }

    try {
      // Register service worker if not already registered
      if (!this.registration) {
        this.registration = await navigator.serviceWorker.register('/sw.js')
      }

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready

      // Check existing subscription
      let subscription = await this.registration.pushManager.getSubscription()

      if (!subscription) {
        // Create new subscription
        // In production, you'd use your own VAPID public key
        const vapidPublicKey =
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8YbpglUZdQZ-3WGPD3-JCr3d0h8lCJPdDKnVJB7UrIkHO6Tq3mUXmw'

        subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        })
      }

      // Send subscription to backend
      await this.sendSubscriptionToBackend(subscription)

      return subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.isSupported() || !this.registration) {
      return false
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        // Remove from backend
        await this.removeSubscriptionFromBackend(subscription)
      }

      return true
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }

  /**
   * Send subscription to backend
   */
  private async sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token) return

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3003/api/trpc'

      const response = await fetch(`${API_URL}/notifications.subscribeToPush`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh') as ArrayBuffer),
            auth: this.arrayBufferToBase64(subscription.getKey('auth') as ArrayBuffer),
          },
          userAgent: navigator.userAgent,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription to backend')
      }
    } catch (error) {
      console.error('Failed to send subscription to backend:', error)
    }
  }

  /**
   * Remove subscription from backend
   */
  private async removeSubscriptionFromBackend(subscription: PushSubscription): Promise<void> {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token) return

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3003/api/trpc'

      await fetch(`${API_URL}/notifications.unsubscribeFromPush`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      })
    } catch (error) {
      console.error('Failed to remove subscription from backend:', error)
    }
  }

  /**
   * Helper: Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  /**
   * Helper: Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer | null | undefined): string {
    if (!buffer) return ''
    const bytes = new Uint8Array(buffer as ArrayBuffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i] ?? 0)
    }
    return window.btoa(binary)
  }

  /**
   * Show a local notification (for testing)
   */
  async showLocalNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return
    }

    try {
      if (this.registration) {
        await this.registration.showNotification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options,
        })
      }
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance()

// Export helper functions
export const requestNotificationPermission = () => pushNotificationService.requestPermission()

export const subscribeToPushNotifications = () => pushNotificationService.subscribe()

export const unsubscribeFromPushNotifications = () => pushNotificationService.unsubscribe()

export const isPushNotificationSupported = () => pushNotificationService.isSupported()

export const getNotificationPermissionStatus = () => pushNotificationService.getPermissionStatus()
