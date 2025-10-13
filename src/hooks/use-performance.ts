'use client'

import { useCallback, useEffect, useRef, useMemo } from 'react'

/**
 * Debounce hook
 * Delays execution until after a specified wait time
 * 
 * @example
 * ```tsx
 * const debouncedSearch = useDebounce(searchQuery, 300)
 * 
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     performSearch(debouncedSearch)
 *   }
 * }, [debouncedSearch])
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttle hook
 * Limits execution to once per specified interval
 * 
 * @example
 * ```tsx
 * const throttledScroll = useThrottle(handleScroll, 100)
 * 
 * <div onScroll={throttledScroll}>...</div>
 * ```
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const lastRun = useRef(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    ((...args) => {
      const now = Date.now()
      
      if (now - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = now
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        timeoutRef.current = setTimeout(() => {
          callback(...args)
          lastRun.current = Date.now()
        }, delay - (now - lastRun.current))
      }
    }) as T,
    [callback, delay]
  )
}

/**
 * Intersection Observer hook for lazy loading
 * Detects when element enters viewport
 * 
 * @example
 * ```tsx
 * const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 })
 * 
 * <div ref={ref}>
 *   {isIntersecting && <ExpensiveComponent />}
 * </div>
 * ```
 */
export function useIntersectionObserver(options: IntersectionObserverInit = {}) {
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  const [node, setNode] = React.useState<Element | null>(null)

  useEffect(() => {
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1, ...options }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [node, options])

  return {
    ref: setNode,
    isIntersecting,
  }
}

/**
 * Virtual list hook for rendering large lists efficiently
 * Only renders visible items
 */
interface UseVirtualListOptions {
  itemHeight: number
  itemCount: number
  overscan?: number
}

export function useVirtualList({
  itemHeight,
  itemCount,
  overscan = 3,
}: UseVirtualListOptions) {
  const [scrollTop, setScrollTop] = React.useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = useThrottle(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
    }
  }, 16) // ~60fps

  const visibleRange = useMemo(() => {
    const containerHeight = containerRef.current?.clientHeight || 800
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, itemCount, overscan])

  const totalHeight = itemCount * itemHeight

  return {
    containerRef,
    handleScroll,
    visibleRange,
    totalHeight,
    offsetY: visibleRange.startIndex * itemHeight,
  }
}

/**
 * Idle callback hook
 * Executes callback during browser idle time
 * 
 * @example
 * ```tsx
 * useIdleCallback(() => {
 *   // Do expensive non-critical work
 *   prefetchData()
 * }, [])
 * ```
 */
export function useIdleCallback(callback: () => void, deps: any[] = []) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    let idleCallbackId: number

    if ('requestIdleCallback' in window) {
      idleCallbackId = window.requestIdleCallback(callback, { timeout: 2000 })
    } else {
      // Fallback for Safari
      const timeoutId = setTimeout(callback, 1)
      return () => clearTimeout(timeoutId)
    }

    return () => {
      if (idleCallbackId && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleCallbackId)
      }
    }
  }, deps)
}

/**
 * Memoized expensive calculation hook
 * Only recalculates when dependencies change
 * 
 * @example
 * ```tsx
 * const sortedAnime = useMemoized(
 *   () => animeList.sort((a, b) => b.rating - a.rating),
 *   [animeList]
 * )
 * ```
 */
export function useMemoized<T>(factory: () => T, deps: any[]): T {
  return useMemo(factory, deps)
}

/**
 * Previous value hook
 * Returns the previous value of a variable
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  
  useEffect(() => {
    ref.current = value
  }, [value])
  
  return ref.current
}

/**
 * Media query hook for responsive optimization
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

/**
 * Optimized event handler hook
 * Prevents unnecessary re-renders
 */
export function useEvent<T extends (...args: any[]) => any>(handler: T): T {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  })

  return useCallback((...args: any[]) => {
    return handlerRef.current(...args)
  }, []) as T
}

