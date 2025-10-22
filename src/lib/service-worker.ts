/**
 * Service Worker Registration and Management
 * Provides offline support and intelligent caching
 */

export interface CacheSize {
  usage: number
  quota: number
  usageInMB: string
  quotaInMB: string
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null
  private updateAvailable = false

  /**
   * Register service worker
   */
  async register(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('[SW] Service Worker not supported')
      return
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      console.log('[SW] Service Worker registered:', this.registration.scope)

      // Check for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              this.updateAvailable = true
              console.log('[SW] New version available!')

              // Notify user (you can emit an event here)
              window.dispatchEvent(new CustomEvent('sw-update-available'))
            }
          })
        }
      })

      // Check for updates every 10 minutes
      setInterval(
        () => {
          this.registration?.update()
        },
        10 * 60 * 1000
      )
    } catch (error) {
      console.error('[SW] Registration failed:', error)
    }
  }

  /**
   * Unregister service worker
   */
  async unregister(): Promise<boolean> {
    if (this.registration) {
      return await this.registration.unregister()
    }
    return false
  }

  /**
   * Skip waiting and activate new service worker
   */
  async skipWaiting(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })

      // Reload page after activation
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    if (!navigator.serviceWorker.controller) return

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel()

      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve()
        } else {
          reject(new Error('Failed to clear cache'))
        }
      }

      navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_CACHE' }, [
        messageChannel.port2,
      ])
    })
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<CacheSize | null> {
    if (!navigator.serviceWorker.controller) return null

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()

      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.size)
      }

      navigator.serviceWorker.controller?.postMessage({ type: 'GET_CACHE_SIZE' }, [
        messageChannel.port2,
      ])
    })
  }

  /**
   * Check if update is available
   */
  isUpdateAvailable(): boolean {
    return this.updateAvailable
  }

  /**
   * Get registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration
  }
}

// Singleton instance
export const swManager = new ServiceWorkerManager()

/**
 * Initialize service worker (call from app)
 */
export function initServiceWorker(): void {
  if (typeof window !== 'undefined') {
    // Register on page load
    window.addEventListener('load', () => {
      swManager.register()
    })
  }
}

/**
 * React hook for service worker status
 */
export function useServiceWorker() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [cacheSize, setCacheSize] = useState<CacheSize | null>(null)

  useEffect(() => {
    const handleUpdate = () => {
      setUpdateAvailable(true)
    }

    window.addEventListener('sw-update-available', handleUpdate)

    // Get initial cache size
    swManager.getCacheSize().then(setCacheSize)

    return () => {
      window.removeEventListener('sw-update-available', handleUpdate)
    }
  }, [])

  const applyUpdate = async () => {
    await swManager.skipWaiting()
  }

  const clearCache = async () => {
    await swManager.clearCache()
    setCacheSize(null)
  }

  const refreshCacheSize = async () => {
    const size = await swManager.getCacheSize()
    setCacheSize(size)
  }

  return {
    updateAvailable,
    cacheSize,
    applyUpdate,
    clearCache,
    refreshCacheSize,
  }
}

// Import for React hooks
import { useEffect, useState } from 'react'
