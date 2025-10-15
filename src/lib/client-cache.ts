/**
 * 🚀 Client-Side Cache Manager
 * 
 * Reduces redundant API calls by caching data in browser memory
 * Automatically expires stale data
 */

interface CacheEntry<T> {
  data: T
  expires: number
}

export const CacheTTL = {
  short: 1 * 60 * 1000,      // 1 minute
  medium: 5 * 60 * 1000,     // 5 minutes
  long: 15 * 60 * 1000,      // 15 minutes
  veryLong: 60 * 60 * 1000,  // 1 hour
}

class ClientCache {
  private cache: Map<string, CacheEntry<any>>

  constructor() {
    this.cache = new Map()
    
    // Cleanup expired entries every minute
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 60000)
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  set<T>(key: string, data: T, ttl: number): void {
    const expires = Date.now() + ttl
    this.cache.set(key, { data, expires })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key)
      }
    }
  }

  stats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

export const clientCache = new ClientCache()
