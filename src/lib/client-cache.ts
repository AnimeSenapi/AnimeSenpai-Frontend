/**
 * Client-side caching utility
 * Provides in-memory and localStorage caching for API responses
 */

interface CacheEntry<T> {
  data: T
  expires: number
  timestamp: number
}

class ClientCache {
  private memoryCache: Map<string, CacheEntry<any>> = new Map()
  private readonly prefix = 'animesenpai_cache_'
  
  /**
   * Get cached data
   * Checks memory first, then localStorage
   */
  get<T>(key: string): T | null {
    // Check memory cache first (fastest)
    const memoryCached = this.memoryCache.get(key)
    if (memoryCached && Date.now() < memoryCached.expires) {
      return memoryCached.data as T
    }

    // Check localStorage (persistent across sessions)
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(this.prefix + key)
        if (item) {
          const parsed: CacheEntry<T> = JSON.parse(item)
          if (Date.now() < parsed.expires) {
            // Restore to memory cache
            this.memoryCache.set(key, parsed)
            return parsed.data
          } else {
            // Expired - remove from localStorage
            localStorage.removeItem(this.prefix + key)
          }
        }
      } catch (error) {
        console.error('Cache get error:', error)
      }
    }

    return null
  }

  /**
   * Set cached data
   * Stores in both memory and localStorage
   */
  set<T>(key: string, data: T, ttlMs: number = 300000): void {
    const entry: CacheEntry<T> = {
      data,
      expires: Date.now() + ttlMs,
      timestamp: Date.now(),
    }

    // Set in memory cache
    this.memoryCache.set(key, entry)

    // Set in localStorage (if available and data is serializable)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.prefix + key, JSON.stringify(entry))
      } catch (error) {
        // localStorage might be full or unavailable
        console.warn('Failed to cache to localStorage:', error)
      }
    }
  }

  /**
   * Remove specific key from cache
   */
  remove(key: string): void {
    this.memoryCache.delete(key)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.prefix + key)
      } catch (error) {
        console.error('Cache remove error:', error)
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.memoryCache.clear()
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix))
        keys.forEach(key => localStorage.removeItem(key))
      } catch (error) {
        console.error('Cache clear error:', error)
      }
    }
  }

  /**
   * Check if data is cached and valid
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Get or set pattern - fetch data if not cached
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 300000
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetcher()
    this.set(key, data, ttlMs)
    return data
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      memorySize: this.memoryCache.size,
      localStorageSize: typeof window !== 'undefined' 
        ? Object.keys(localStorage).filter(k => k.startsWith(this.prefix)).length
        : 0,
    }
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    // Memory cache cleanup
    const now = Date.now()
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now >= entry.expires) {
        this.memoryCache.delete(key)
      }
    }

    // localStorage cleanup
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix))
        keys.forEach(key => {
          try {
            const item = localStorage.getItem(key)
            if (item) {
              const parsed = JSON.parse(item)
              if (now >= parsed.expires) {
                localStorage.removeItem(key)
              }
            }
          } catch {}
        })
      } catch (error) {
        console.error('Cache cleanup error:', error)
      }
    }
  }
}

// Export singleton instance
export const clientCache = new ClientCache()

// Run cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => clientCache.cleanup(), 300000)
}

// Cache TTL presets
export const CacheTTL = {
  FIVE_SECONDS: 5000,
  TEN_SECONDS: 10000,
  THIRTY_SECONDS: 30000,
  ONE_MINUTE: 60000,
  FIVE_MINUTES: 300000,
  TEN_MINUTES: 600000,
  THIRTY_MINUTES: 1800000,
  ONE_HOUR: 3600000,
  ONE_DAY: 86400000,
  ONE_WEEK: 604800000,
} as const

// Helper function to generate cache keys
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&')
  return `${prefix}:${sortedParams}`
}

