'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { clientCache, CacheTTL } from '../lib/client-cache'

interface UseCachedDataOptions<T> {
  cacheKey: string
  fetcher: () => Promise<T>
  ttl?: number
  enabled?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: unknown) => void
}

/**
 * Hook for fetching and caching data
 *
 * Features:
 * - Automatic caching in memory and localStorage
 * - Deduplication (prevents duplicate requests)
 * - Stale-while-revalidate pattern
 * - Automatic cache invalidation
 *
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useCachedData({
 *   cacheKey: 'anime-trending',
 *   fetcher: () => apiGetTrending(),
 *   ttl: CacheTTL.medium,
 * })
 * ```
 */
export function useCachedData<T>({
  cacheKey,
  fetcher,
  ttl = CacheTTL.medium,
  enabled = true,
  onSuccess,
  onError,
}: UseCachedDataOptions<T>) {
  const [data, setData] = useState<T | null>(() => clientCache.get<T>(cacheKey))
  const [loading, setLoading] = useState(!data && enabled)
  const [error, setError] = useState<unknown>(null)
  const fetchingRef = useRef(false)

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (fetchingRef.current) return // Prevent duplicate requests

      try {
        // If we have cached data and not forcing refresh, use it
        if (!forceRefresh) {
          const cached = clientCache.get<T>(cacheKey)
          if (cached !== null) {
            setData(cached)
            setLoading(false)
            return
          }
        }

        fetchingRef.current = true
        setLoading(true)
        setError(null)

        const result = await fetcher()

        // Cache the result
        clientCache.set(cacheKey, result, ttl)

        setData(result)
        onSuccess?.(result)
      } catch (err) {
        setError(err)
        onError?.(err)
      } finally {
        setLoading(false)
        fetchingRef.current = false
      }
    },
    [cacheKey, fetcher, ttl, onSuccess, onError]
  )

  // Fetch on mount or when enabled changes
  useEffect(() => {
    if (enabled) {
      fetchData()
    }
  }, [enabled, fetchData])

  const refetch = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  const invalidate = useCallback(() => {
    clientCache.delete(cacheKey)
    setData(null)
  }, [cacheKey])

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
    isStale: data === null,
  }
}

/**
 * Hook for prefetching data
 * Fetches data in the background and caches it
 */
export function usePrefetch() {
  const prefetch = useCallback(
    async <T>(cacheKey: string, fetcher: () => Promise<T>, ttl?: number) => {
      // Check if already cached
      if (clientCache.get(cacheKey) !== null) {
        return
      }

      try {
        const data = await fetcher()
        clientCache.set(cacheKey, data, ttl ?? CacheTTL.medium)
      } catch (error) {
        // Prefetch failures are silent
        console.error('Prefetch failed:', cacheKey, error)
      }
    },
    []
  )

  return { prefetch }
}

/**
 * Hook for paginated cached data
 */
interface UsePaginatedCacheOptions<T> {
  cacheKeyPrefix: string
  fetcher: (page: number) => Promise<T[]>
  ttl?: number
}

export function usePaginatedCache<T>({
  cacheKeyPrefix,
  fetcher,
  ttl = CacheTTL.medium,
}: UsePaginatedCacheOptions<T>) {
  const [pages, setPages] = useState<Map<number, T[]>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const fetchPage = useCallback(
    async (page: number) => {
      const cacheKey = `${cacheKeyPrefix}:page:${page}`

      // Check cache first
      const cached = clientCache.get<T[]>(cacheKey)
      if (cached !== null) {
        setPages((prev) => new Map(prev).set(page, cached))
        return cached
      }

      try {
        setLoading(true)
        const data = await fetcher(page)

        // Cache the page
        clientCache.set(cacheKey, data, ttl)

        setPages((prev) => new Map(prev).set(page, data))
        return data
      } catch (err) {
        setError(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [cacheKeyPrefix, fetcher, ttl]
  )

  const getPage = useCallback(
    (page: number) => {
      return pages.get(page) || null
    },
    [pages]
  )

  const getAllData = useCallback(() => {
    return Array.from(pages.values()).flat()
  }, [pages])

  const invalidateAll = useCallback(() => {
    // Remove all pages from cache
    pages.forEach((_, page) => {
      clientCache.delete(`${cacheKeyPrefix}:page:${page}`)
    })
    setPages(new Map())
  }, [pages, cacheKeyPrefix])

  return {
    pages,
    fetchPage,
    getPage,
    getAllData,
    invalidateAll,
    loading,
    error,
  }
}
