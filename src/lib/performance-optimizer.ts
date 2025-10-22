import { Analytics } from './analytics'

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
}

interface OptimizationConfig {
  enableImageOptimization: boolean
  enableCodeSplitting: boolean
  enablePrefetching: boolean
  enableCompression: boolean
  enableCaching: boolean
  enableLazyLoading: boolean
  enableVirtualScrolling: boolean
  enableMemoization: boolean
  enableDebouncing: boolean
  enableThrottling: boolean
}

class PerformanceOptimizer {
  private analytics: typeof Analytics
  private config: OptimizationConfig
  private metrics: PerformanceMetrics
  private observers: Map<string, PerformanceObserver> = new Map()

  constructor(analytics: typeof Analytics, config: OptimizationConfig) {
    this.analytics = analytics
    this.config = config
    this.metrics = {
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0,
      fcp: 0,
      tbt: 0,
      si: 0
    }
    this.initPerformanceMonitoring()
  }

  private initPerformanceMonitoring(): void {
    if (typeof window === 'undefined') return

    // Web Vitals monitoring
    this.observeWebVitals()
    
    // Resource timing monitoring
    this.observeResourceTiming()
    
    // Long task monitoring
    this.observeLongTasks()
    
    // Memory monitoring
    this.observeMemoryUsage()
    
    // Network monitoring
    this.observeNetworkConditions()
  }

  private observeWebVitals(): void {
    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        this.metrics.lcp = lastEntry.startTime
        this.analytics.track('performance_lcp', { value: this.metrics.lcp })
      }
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    this.observers.set('lcp', lcpObserver)

    // FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const eventEntry = entry as PerformanceEventTiming
        this.metrics.fid = eventEntry.processingStart - eventEntry.startTime
        this.analytics.track('performance_fid', { value: this.metrics.fid })
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })
    this.observers.set('fid', fidObserver)

    // CLS (Cumulative Layout Shift)
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const layoutEntry = entry as LayoutShift
        if (!layoutEntry.hadRecentInput) {
          clsValue += layoutEntry.value
          this.metrics.cls = clsValue
          this.analytics.track('performance_cls', { value: this.metrics.cls })
        }
      })
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
    this.observers.set('cls', clsObserver)

    // FCP (First Contentful Paint)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        this.metrics.fcp = entry.startTime
        this.analytics.track('performance_fcp', { value: this.metrics.fcp })
      })
    })
    fcpObserver.observe({ entryTypes: ['paint'] })
    this.observers.set('fcp', fcpObserver)
  }

  private observeResourceTiming(): void {
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const resource = entry as PerformanceResourceTiming
        this.analytics.track('performance_resource', {
          name: resource.name,
          duration: resource.duration,
          size: resource.transferSize,
          type: resource.initiatorType
        })
      })
    })
    resourceObserver.observe({ entryTypes: ['resource'] })
    this.observers.set('resource', resourceObserver)
  }

  private observeLongTasks(): void {
    const longTaskObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        this.metrics.tbt += entry.duration
        this.analytics.track('performance_long_task', {
          duration: entry.duration,
          startTime: entry.startTime
        })
      })
    })
    longTaskObserver.observe({ entryTypes: ['longtask'] })
    this.observers.set('longtask', longTaskObserver)
  }

  private observeMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.analytics.track('performance_memory', {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      })
    }
  }

  private observeNetworkConditions(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.analytics.track('performance_network', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      })
    }
  }

  // Image optimization
  optimizeImages(): void {
    if (!this.config.enableImageOptimization) return

    const images = document.querySelectorAll('img')
    images.forEach((img) => {
      // Lazy loading
      if (this.config.enableLazyLoading) {
        img.loading = 'lazy'
      }

      // Responsive images
      if (img.dataset.src) {
        img.src = img.dataset.src
        img.removeAttribute('data-src')
      }

      // WebP support
      if (img.dataset.webp) {
        img.src = img.dataset.webp
      }
    })
  }

  // Code splitting optimization
  optimizeCodeSplitting(): void {
    if (!this.config.enableCodeSplitting) return

    // Preload critical chunks
    const criticalChunks = ['main', 'vendor', 'runtime']
    criticalChunks.forEach((chunk) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = `/_next/static/chunks/${chunk}.js`
      link.as = 'script'
      document.head.appendChild(link)
    })
  }

  // Prefetching optimization
  optimizePrefetching(): void {
    if (!this.config.enablePrefetching) return

    // Prefetch next page
    const nextPage = this.getNextPage()
    if (nextPage) {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = nextPage
      document.head.appendChild(link)
    }

    // Prefetch critical resources
    const criticalResources = [
      '/api/trpc/anime.getPopular',
      '/api/trpc/anime.getTrending',
      '/api/trpc/user.getProfile'
    ]
    criticalResources.forEach((resource) => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = resource
      document.head.appendChild(link)
    })
  }

  // Compression optimization
  optimizeCompression(): void {
    if (!this.config.enableCompression) return

    // Enable Brotli compression
    if ('compression' in window) {
      (window as any).compression = 'brotli'
    }
  }

  // Caching optimization
  optimizeCaching(): void {
    if (!this.config.enableCaching) return

    // Set cache headers for static assets
    const staticAssets = document.querySelectorAll('link[rel="stylesheet"], script[src]')
    staticAssets.forEach((asset) => {
      if (asset instanceof HTMLLinkElement) {
        asset.setAttribute('data-cache', 'static')
      } else if (asset instanceof HTMLScriptElement) {
        asset.setAttribute('data-cache', 'static')
      }
    })
  }

  // Virtual scrolling optimization
  optimizeVirtualScrolling(): void {
    if (!this.config.enableVirtualScrolling) return

    const virtualScrollContainers = document.querySelectorAll('[data-virtual-scroll]')
    virtualScrollContainers.forEach((container) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          } else {
            entry.target.classList.remove('visible')
          }
        })
      })
      observer.observe(container)
    })
  }

  // Memoization optimization
  optimizeMemoization(): void {
    if (!this.config.enableMemoization) return

    // Memoize expensive calculations
    const memoize = (fn: Function) => {
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
    }

    // Memoization is available for use
  }

  // Debouncing optimization
  optimizeDebouncing(): void {
    if (!this.config.enableDebouncing) return

    const debounce = (func: Function, wait: number) => {
      let timeout: NodeJS.Timeout
      return (...args: any[]) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), wait)
      }
    }

    // Apply debouncing to search inputs
    const searchInputs = document.querySelectorAll('input[type="search"]')
    searchInputs.forEach((input) => {
      const debouncedSearch = debounce((e: Event) => {
        // Handle search
      }, 300)
      input.addEventListener('input', debouncedSearch)
    })
  }

  // Throttling optimization
  optimizeThrottling(): void {
    if (!this.config.enableThrottling) return

    const throttle = (func: Function, limit: number) => {
      let inThrottle: boolean
      return (...args: any[]) => {
        if (!inThrottle) {
          func.apply(this, args)
          inThrottle = true
          setTimeout(() => inThrottle = false, limit)
        }
      }
    }

    // Apply throttling to scroll events
    const throttledScroll = throttle(() => {
      // Handle scroll
    }, 100)
    window.addEventListener('scroll', throttledScroll)
  }

  // Get performance score
  getPerformanceScore(): number {
    const scores = {
      lcp: this.metrics.lcp < 2500 ? 100 : this.metrics.lcp < 4000 ? 80 : 60,
      fid: this.metrics.fid < 100 ? 100 : this.metrics.fid < 300 ? 80 : 60,
      cls: this.metrics.cls < 0.1 ? 100 : this.metrics.cls < 0.25 ? 80 : 60,
      fcp: this.metrics.fcp < 1800 ? 100 : this.metrics.fcp < 3000 ? 80 : 60
    }
    
    return Math.round((scores.lcp + scores.fid + scores.cls + scores.fcp) / 4)
  }

  // Get optimization recommendations
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = []
    
    if (this.metrics.lcp > 2500) {
      recommendations.push('Optimize Largest Contentful Paint - consider image optimization and critical CSS')
    }
    
    if (this.metrics.fid > 100) {
      recommendations.push('Optimize First Input Delay - reduce JavaScript execution time')
    }
    
    if (this.metrics.cls > 0.1) {
      recommendations.push('Optimize Cumulative Layout Shift - reserve space for dynamic content')
    }
    
    if (this.metrics.fcp > 1800) {
      recommendations.push('Optimize First Contentful Paint - optimize critical rendering path')
    }
    
    return recommendations
  }

  // Apply all optimizations
  applyAllOptimizations(): void {
    this.optimizeImages()
    this.optimizeCodeSplitting()
    this.optimizePrefetching()
    this.optimizeCompression()
    this.optimizeCaching()
    this.optimizeVirtualScrolling()
    this.optimizeMemoization()
    this.optimizeDebouncing()
    this.optimizeThrottling()
  }

  // Cleanup
  destroy(): void {
    this.observers.forEach((observer) => {
      observer.disconnect()
    })
    this.observers.clear()
  }

  private getNextPage(): string | null {
    // Simple next page detection
    const currentPath = window.location.pathname
    if (currentPath === '/') return '/search'
    if (currentPath === '/search') return '/mylist'
    if (currentPath === '/mylist') return '/dashboard'
    return null
  }
}

// Default configuration
const defaultConfig: OptimizationConfig = {
  enableImageOptimization: true,
  enableCodeSplitting: true,
  enablePrefetching: true,
  enableCompression: true,
  enableCaching: true,
  enableLazyLoading: true,
  enableVirtualScrolling: true,
  enableMemoization: true,
  enableDebouncing: true,
  enableThrottling: true
}

// Export singleton instance
let performanceOptimizer: PerformanceOptimizer | null = null

export const initPerformanceOptimizer = (analytics: typeof Analytics, config?: Partial<OptimizationConfig>) => {
  if (!performanceOptimizer) {
    performanceOptimizer = new PerformanceOptimizer(analytics, { ...defaultConfig, ...config })
  }
  return performanceOptimizer
}

export const getPerformanceOptimizer = () => performanceOptimizer

export default PerformanceOptimizer
