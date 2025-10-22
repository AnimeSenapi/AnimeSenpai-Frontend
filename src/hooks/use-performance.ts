import { useState, useEffect, useCallback, useRef } from 'react'
import { Analytics } from '../lib/analytics'

interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

interface PerformanceMetrics {
  lcp: number
  fid: number
  cls: number
  ttfb: number
  fcp: number
  tbt: number
  si: number
  memory: {
    used: number
    total: number
    limit: number
  }
  network: {
    effectiveType: string
    downlink: number
    rtt: number
  }
  score: number
}

interface PerformanceConfig {
  enableMonitoring: boolean
  enableOptimization: boolean
  enableCaching: boolean
  enableLazyLoading: boolean
  enablePrefetching: boolean
  enableCompression: boolean
  enableMemoization: boolean
  enableDebouncing: boolean
  enableThrottling: boolean
}

export function usePerformance(config: Partial<PerformanceConfig> = {}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    fcp: 0,
    tbt: 0,
    si: 0,
    memory: { used: 0, total: 0, limit: 0 },
    network: { effectiveType: 'unknown', downlink: 0, rtt: 0 },
    score: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [optimizations, setOptimizations] = useState<string[]>([])
  const analytics = useRef<typeof Analytics | null>(null)
  const observers = useRef<Map<string, PerformanceObserver>>(new Map())

  const defaultConfig: PerformanceConfig = {
    enableMonitoring: true,
    enableOptimization: true,
    enableCaching: true,
    enableLazyLoading: true,
    enablePrefetching: true,
    enableCompression: true,
    enableMemoization: true,
    enableDebouncing: true,
    enableThrottling: true,
    ...config
  }

  // Initialize performance monitoring
  useEffect(() => {
    if (!defaultConfig.enableMonitoring) return

    const initMonitoring = async () => {
      try {
        // Initialize analytics
        analytics.current = Analytics
        
        // Monitor Web Vitals
        monitorWebVitals()
        
        // Monitor resource timing
        monitorResourceTiming()
        
        // Monitor memory usage
        monitorMemoryUsage()
        
        // Monitor network conditions
        monitorNetworkConditions()
        
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize performance monitoring:', error)
        setIsLoading(false)
      }
    }

    initMonitoring()

    return () => {
      // Cleanup observers
      observers.current.forEach((observer) => {
        observer.disconnect()
      })
      observers.current.clear()
    }
  }, [defaultConfig.enableMonitoring])

  // Monitor Web Vitals
  const monitorWebVitals = useCallback(() => {
    if (typeof window === 'undefined') return

    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
      }
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    observers.current.set('lcp', lcpObserver)

    // FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const eventEntry = entry as PerformanceEventTiming
        const fid = eventEntry.processingStart - eventEntry.startTime
        setMetrics(prev => ({ ...prev, fid }))
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })
    observers.current.set('fid', fidObserver)

    // CLS (Cumulative Layout Shift)
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const layoutEntry = entry as LayoutShift
        if (!layoutEntry.hadRecentInput) {
          clsValue += layoutEntry.value
          setMetrics(prev => ({ ...prev, cls: clsValue }))
        }
      })
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
    observers.current.set('cls', clsObserver)

    // FCP (First Contentful Paint)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        setMetrics(prev => ({ ...prev, fcp: entry.startTime }))
      })
    })
    fcpObserver.observe({ entryTypes: ['paint'] })
    observers.current.set('fcp', fcpObserver)
  }, [])

  // Monitor resource timing
  const monitorResourceTiming = useCallback(() => {
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const resource = entry as PerformanceResourceTiming
      })
    })
    resourceObserver.observe({ entryTypes: ['resource'] })
    observers.current.set('resource', resourceObserver)
  }, [])

  // Monitor memory usage
  const monitorMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      setMetrics(prev => ({
        ...prev,
        memory: {
          used: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
          total: memory.totalJSHeapSize / 1024 / 1024,
          limit: memory.jsHeapSizeLimit / 1024 / 1024
        }
      }))
    }
  }, [])

  // Monitor network conditions
  const monitorNetworkConditions = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setMetrics(prev => ({
        ...prev,
        network: {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        }
      }))
    }
  }, [])

  // Calculate performance score
  const calculateScore = useCallback((metrics: PerformanceMetrics): number => {
    const scores = {
      lcp: metrics.lcp < 2500 ? 100 : metrics.lcp < 4000 ? 80 : 60,
      fid: metrics.fid < 100 ? 100 : metrics.fid < 300 ? 80 : 60,
      cls: metrics.cls < 0.1 ? 100 : metrics.cls < 0.25 ? 80 : 60,
      fcp: metrics.fcp < 1800 ? 100 : metrics.fcp < 3000 ? 80 : 60
    }
    
    return Math.round((scores.lcp + scores.fid + scores.cls + scores.fcp) / 4)
  }, [])

  // Update score when metrics change
  useEffect(() => {
    const score = calculateScore(metrics)
    setMetrics(prev => ({ ...prev, score }))
  }, [metrics.lcp, metrics.fid, metrics.cls, metrics.fcp, calculateScore])

  // Generate optimization recommendations
  const generateRecommendations = useCallback((metrics: PerformanceMetrics): string[] => {
    const recommendations: string[] = []
    
    if (metrics.lcp > 2500) {
      recommendations.push('Optimize Largest Contentful Paint - consider image optimization and critical CSS')
    }
    
    if (metrics.fid > 100) {
      recommendations.push('Optimize First Input Delay - reduce JavaScript execution time')
    }
    
    if (metrics.cls > 0.1) {
      recommendations.push('Optimize Cumulative Layout Shift - reserve space for dynamic content')
    }
    
    if (metrics.fcp > 1800) {
      recommendations.push('Optimize First Contentful Paint - optimize critical rendering path')
    }
    
    if (metrics.memory.used > metrics.memory.limit * 0.8) {
      recommendations.push('Optimize memory usage - consider lazy loading and code splitting')
    }
    
    return recommendations
  }, [])

  // Update recommendations when metrics change
  useEffect(() => {
    const recommendations = generateRecommendations(metrics)
    setOptimizations(recommendations)
  }, [metrics, generateRecommendations])

  // Debounce function
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(null, args), wait)
    }
  }, [])

  // Throttle function
  const throttle = useCallback((func: Function, limit: number) => {
    let inThrottle: boolean
    return (...args: any[]) => {
      if (!inThrottle) {
        func.apply(null, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }, [])

  // Memoize function
  const memoize = useCallback((fn: Function) => {
    const cache = new Map()
    return (...args: any[]) => {
      const key = JSON.stringify(args)
      if (cache.has(key)) {
        return cache.get(key)
      }
      const result = fn(...args)
      cache.set(key, result)
      return result
    }
  }, [])

  // Optimize images
  const optimizeImages = useCallback(() => {
    if (!defaultConfig.enableLazyLoading) return

    const images = document.querySelectorAll('img')
    images.forEach((img) => {
      img.loading = 'lazy'
      if (img.dataset.src) {
        img.src = img.dataset.src
        img.removeAttribute('data-src')
      }
    })
  }, [defaultConfig.enableLazyLoading])

  // Prefetch resources
  const prefetchResources = useCallback((urls: string[]) => {
    if (!defaultConfig.enablePrefetching) return

    urls.forEach((url) => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = url
      document.head.appendChild(link)
    })
  }, [defaultConfig.enablePrefetching])

  // Apply all optimizations
  const applyOptimizations = useCallback(() => {
    if (!defaultConfig.enableOptimization) return

    optimizeImages()
    
    // Prefetch critical resources
    const criticalResources = [
      '/api/trpc/anime.getPopular',
      '/api/trpc/anime.getTrending',
      '/api/trpc/user.getProfile'
    ]
    prefetchResources(criticalResources)
  }, [defaultConfig.enableOptimization, optimizeImages, prefetchResources])

  // Apply optimizations on mount
  useEffect(() => {
    applyOptimizations()
  }, [applyOptimizations])

  return {
    metrics,
    isLoading,
    optimizations,
    score: metrics.score,
    debounce,
    throttle,
    memoize,
    optimizeImages,
    prefetchResources,
    applyOptimizations
  }
}

// Export missing functions for compatibility
export const useThrottle = (value: any, delay: number) => {
  const [throttledValue, setThrottledValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setThrottledValue(value)
    }, delay)
    
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return throttledValue
}

export const useIntersectionObserver = (options?: IntersectionObserverInit) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const elementRef = useRef<Element>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting)
        })
      },
      options
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [options])

  return { ref: elementRef, isIntersecting }
}

export const useIdleCallback = (callback: () => void, deps: any[] = []) => {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const handleIdle = () => {
        callbackRef.current()
      }
      
      const id = requestIdleCallback(handleIdle)
      return () => cancelIdleCallback(id)
    } else {
      // Fallback for browsers without requestIdleCallback
      const timeoutId = setTimeout(callbackRef.current, 0)
      return () => clearTimeout(timeoutId)
    }
  }, deps)
}

export default usePerformance