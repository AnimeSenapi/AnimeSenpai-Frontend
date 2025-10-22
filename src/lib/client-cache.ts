/**
 * 🚀 Client-Side Cache Manager
 *
 * Reduces redundant API calls by caching data in browser memory
 * Automatically expires stale data
 * Uses localStorage for persistent caching across sessions
 */

interface CacheEntry<T> {
  data: T
  expires: number
  timestamp: number
  hits: number
}

export const CacheTTL = {
  short: 1 * 60 * 1000, // 1 minute
  medium: 5 * 60 * 1000, // 5 minutes
  long: 15 * 60 * 1000, // 15 minutes
  veryLong: 60 * 60 * 1000, // 1 hour
  day: 24 * 60 * 60 * 1000, // 24 hours
  week: 7 * 24 * 60 * 60 * 1000, // 1 week
}

// Cache configuration
const CACHE_CONFIG = {
  maxMemorySize: 100, // Maximum number of entries in memory
  persistToLocalStorage: true,
  localStoragePrefix: 'animesenpai_cache_',
  enableStats: true,
}

class ClientCache {
  private cache: Map<string, CacheEntry<any>>
  private totalHits: number = 0
  private totalMisses: number = 0

  constructor() {
    this.cache = new Map()

    // Cleanup expired entries every minute
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 60000)

      // Load from localStorage on init
      if (CACHE_CONFIG.persistToLocalStorage) {
        this.loadFromLocalStorage()
      }
    }
  }

  get<T>(key: string): T | null {
    // Check memory cache first
    let entry = this.cache.get(key)

    // If not in memory, check localStorage
    if (!entry && CACHE_CONFIG.persistToLocalStorage) {
      entry = this.getFromLocalStorage(key) ?? undefined
      if (entry) {
        this.cache.set(key, entry)
      }
    }

    if (!entry) {
      this.totalMisses++
      return null
    }

    if (Date.now() > entry.expires) {
      this.delete(key)
      this.totalMisses++
      return null
    }

    // Update hit count
    entry.hits++
    this.totalHits++

    return entry.data as T
  }

  set<T>(key: string, data: T, ttl: number): void {
    const now = Date.now()
    const expires = now + ttl

    // Check if we need to evict old entries
    if (this.cache.size >= CACHE_CONFIG.maxMemorySize) {
      this.evictOldest()
    }

    const entry: CacheEntry<T> = {
      data,
      expires,
      timestamp: now,
      hits: 0,
    }

    this.cache.set(key, entry)

    // Persist to localStorage if enabled
    if (CACHE_CONFIG.persistToLocalStorage) {
      this.saveToLocalStorage(key, entry)
    }
  }

  delete(key: string): void {
    this.cache.delete(key)

    if (CACHE_CONFIG.persistToLocalStorage) {
      this.deleteFromLocalStorage(key)
    }
  }

  clear(): void {
    this.cache.clear()
    this.totalHits = 0
    this.totalMisses = 0

    if (CACHE_CONFIG.persistToLocalStorage) {
      this.clearLocalStorage()
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => this.delete(key))
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTimestamp = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.delete(oldestKey)
    }
  }

  private saveToLocalStorage(key: string, entry: CacheEntry<any>): void {
    try {
      const storageKey = CACHE_CONFIG.localStoragePrefix + key
      localStorage.setItem(storageKey, JSON.stringify(entry))
    } catch (error) {
      // localStorage might be full or disabled
      console.warn('Failed to save to localStorage:', error)
    }
  }

  private getFromLocalStorage(key: string): CacheEntry<any> | null {
    try {
      const storageKey = CACHE_CONFIG.localStoragePrefix + key
      const item = localStorage.getItem(storageKey)
      if (item) {
        return JSON.parse(item)
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error)
    }
    return null
  }

  private deleteFromLocalStorage(key: string): void {
    try {
      const storageKey = CACHE_CONFIG.localStoragePrefix + key
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.warn('Failed to delete from localStorage:', error)
    }
  }

  private clearLocalStorage(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith(CACHE_CONFIG.localStoragePrefix)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith(CACHE_CONFIG.localStoragePrefix)) {
          const cacheKey = key.replace(CACHE_CONFIG.localStoragePrefix, '')
          const item = localStorage.getItem(key)
          if (item) {
            const entry = JSON.parse(item)
            // Only load if not expired
            if (Date.now() < entry.expires) {
              this.cache.set(cacheKey, entry)
            } else {
              localStorage.removeItem(key)
            }
          }
        }
      })
    } catch (error) {
      console.warn('Failed to load from localStorage:', error)
    }
  }

  stats() {
    const totalRequests = this.totalHits + this.totalMisses
    const hitRate = totalRequests > 0 ? (this.totalHits / totalRequests) * 100 : 0

    let totalHits = 0
    const topKeys: Array<{ key: string; hits: number }> = []

    for (const [key, entry] of this.cache.entries()) {
      totalHits += entry.hits
      topKeys.push({ key, hits: entry.hits })
    }

    topKeys.sort((a, b) => b.hits - a.hits)

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hitRate: hitRate.toFixed(2) + '%',
      totalHits: this.totalHits,
      totalMisses: this.totalMisses,
      topKeys: topKeys.slice(0, 10),
    }
  }
}

export const clientCache = new ClientCache()
