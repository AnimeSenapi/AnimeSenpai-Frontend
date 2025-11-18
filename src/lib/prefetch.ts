/**
 * Smart Prefetching Utilities
 * Intelligently prefetch data on hover, viewport entry, or idle time
 */

import { useEffect, useRef, useCallback } from 'react'
import { useIntersectionObserver, useIdleCallback } from '../hooks/use-performance'

interface PrefetchOptions {
  /**
   * Prefetch on hover
   */
  onHover?: boolean

  /**
   * Prefetch when entering viewport
   */
  onViewport?: boolean

  /**
   * Prefetch during browser idle time
   */
  onIdle?: boolean

  /**
   * Delay before prefetching on hover (ms)
   */
  hoverDelay?: number

  /**
   * Intersection threshold for viewport prefetching
   */
  viewportThreshold?: number
}

const DEFAULT_OPTIONS: PrefetchOptions = {
  onHover: true,
  onViewport: false,
  onIdle: false,
  hoverDelay: 100,
  viewportThreshold: 0.25,
}

// Cache to track prefetched URLs
const prefetchCache = new Set<string>()

/**
 * Prefetch a URL or execute a prefetch function
 */
export async function prefetch(urlOrFunction: string | (() => Promise<any>)): Promise<void> {
  if (typeof urlOrFunction === 'string') {
    // URL prefetching
    const url = urlOrFunction

    if (prefetchCache.has(url)) {
      console.log('[Prefetch] Already prefetched:', url)
      return
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        prefetchCache.add(url)
        console.log('[Prefetch] Prefetched:', url)
      }
    } catch (error) {
      console.warn('[Prefetch] Failed to prefetch:', url, error)
    }
  } else {
    // Function prefetching
    try {
      await urlOrFunction()
      console.log('[Prefetch] Prefetched function')
    } catch (error) {
      console.warn('[Prefetch] Failed to prefetch function:', error)
    }
  }
}

/**
 * Clear prefetch cache
 */
export function clearPrefetchCache(): void {
  prefetchCache.clear()
}

/**
 * React hook for prefetching
 */
export function usePrefetch(
  urlOrFunction: string | (() => Promise<any>),
  options: PrefetchOptions = {}
) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  const { onHover, onViewport, onIdle, hoverDelay, viewportThreshold } = mergedOptions

  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null)
  const prefetchedRef = useRef(false)

  // Viewport-based prefetching
  const { ref: viewportRef, isIntersecting } = useIntersectionObserver({
    threshold: viewportThreshold,
  })

  useEffect(() => {
    if (onViewport && isIntersecting && !prefetchedRef.current) {
      prefetch(urlOrFunction)
      prefetchedRef.current = true
    }
  }, [isIntersecting, onViewport, urlOrFunction])

  // Idle-time prefetching
  useIdleCallback(() => {
    if (onIdle && !prefetchedRef.current) {
      prefetch(urlOrFunction)
      prefetchedRef.current = true
    }
  }, [onIdle, urlOrFunction])

  // Hover-based prefetching
  const handleMouseEnter = useCallback(() => {
    if (!onHover || prefetchedRef.current) return

    hoverTimerRef.current = setTimeout(() => {
      prefetch(urlOrFunction)
      prefetchedRef.current = true
    }, hoverDelay)
  }, [onHover, hoverDelay, urlOrFunction])

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
      }
    }
  }, [])

  return {
    ref: viewportRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  }
}

/**
 * Prefetch multiple URLs in parallel
 */
export async function prefetchBatch(urls: string[]): Promise<void> {
  await Promise.all(urls.map((url) => prefetch(url)))
}

/**
 * Prefetch next page data (for pagination)
 */
export function usePrefetchNextPage(
  currentPage: number,
  hasNextPage: boolean,
  fetchPage: (page: number) => Promise<any>
) {
  const nextPage = currentPage + 1

  usePrefetch(() => fetchPage(nextPage), {
    onViewport: false,
    onIdle: hasNextPage,
    onHover: false,
  })
}

/**
 * Prefetch anime details on card hover
 */
export function usePrefetchAnime(slug: string) {
  const { TRPC_URL } = await import('@/app/lib/api')
  const url = `${TRPC_URL}/anime.getBySlug?input=${encodeURIComponent(JSON.stringify({ slug }))}`

  return usePrefetch(url, {
    onHover: true,
    onViewport: false,
    onIdle: false,
    hoverDelay: 200, // Prefetch after 200ms hover
  })
}

/**
 * Prefetch user profile on hover
 */
export function usePrefetchUser(username: string) {
  const { TRPC_URL } = await import('@/app/lib/api')
  const url = `${TRPC_URL}/user.getProfile?input=${encodeURIComponent(JSON.stringify({ username }))}`

  return usePrefetch(url, {
    onHover: true,
    onViewport: false,
    onIdle: false,
    hoverDelay: 300,
  })
}

/**
 * Prefetch route data for Next.js navigation
 */
export function prefetchRoute(href: string): void {
  if (typeof window !== 'undefined' && 'next' in window) {
    // @ts-ignore - Next.js router prefetch
    window.next?.router?.prefetch(href)
  }
}

/**
 * Hook for route prefetching
 */
export function usePrefetchRoute(href: string, options: PrefetchOptions = {}) {
  const prefetchCallback = useCallback(() => {
    prefetchRoute(href)
    return Promise.resolve()
  }, [href])

  return usePrefetch(prefetchCallback, options)
}
