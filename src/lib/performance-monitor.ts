/**
 * Performance Monitoring Service
 *
 * Tracks and monitors application performance metrics including:
 * - Web Vitals (LCP, FID, CLS, FCP, TTFB)
 * - API response times
 * - Custom application metrics
 * - Error rates
 * - Cache performance
 */

import * as Sentry from '@sentry/nextjs'

/**
 * Web Vitals Metrics
 */
export interface WebVitals {
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  fcp: number // First Contentful Paint
  ttfb: number // Time to First Byte
}

/**
 * Performance Metric
 */
export interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: string
  timestamp: number
  url: string
  userAgent?: string
  userId?: string
}

/**
 * API Performance Metric
 */
export interface APIPerformanceMetric {
  endpoint: string
  method: string
  duration: number
  status: number
  cached: boolean
  timestamp: number
  error?: string
}

/**
 * Performance Thresholds (Web Vitals)
 */
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  LCP: { good: 2500, needsImprovement: 4000 }, // ms
  FID: { good: 100, needsImprovement: 300 }, // ms
  CLS: { good: 0.1, needsImprovement: 0.25 }, // score

  // Additional metrics
  FCP: { good: 1800, needsImprovement: 3000 }, // ms
  TTFB: { good: 800, needsImprovement: 1800 }, // ms

  // Custom thresholds
  API_RESPONSE: { good: 200, needsImprovement: 500 }, // ms
  PAGE_LOAD: { good: 2000, needsImprovement: 4000 }, // ms
  CACHE_HIT_RATE: { good: 80, needsImprovement: 60 }, // %
} as const

/**
 * Performance Monitor Class
 */
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private apiMetrics: APIPerformanceMetric[] = []
  private webVitals: Partial<WebVitals> = {}
  private maxMetrics = 1000 // Keep last 1000 metrics in memory
  private enabled = true

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals()
      this.initializePerformanceObserver()
    }
  }

  /**
   * Initialize Web Vitals tracking
   */
  private initializeWebVitals() {
    // Track LCP (Largest Contentful Paint)
    this.trackLCP()

    // Track FID (First Input Delay)
    this.trackFID()

    // Track CLS (Cumulative Layout Shift)
    this.trackCLS()

    // Track FCP (First Contentful Paint)
    this.trackFCP()

    // Track TTFB (Time to First Byte)
    this.trackTTFB()
  }

  /**
   * Track Largest Contentful Paint (LCP)
   */
  private trackLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        this.webVitals.lcp = lastEntry.renderTime || lastEntry.loadTime
        this.reportMetric('LCP', this.webVitals.lcp ?? 0, 'ms')
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.warn('LCP tracking not supported:', error)
    }
  }

  /**
   * Track First Input Delay (FID)
   */
  private trackFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[]
        for (const entry of entries) {
          this.webVitals.fid = entry.processingStart - entry.startTime
          this.reportMetric('FID', this.webVitals.fid, 'ms')
        }
      })

      observer.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      console.warn('FID tracking not supported:', error)
    }
  }

  /**
   * Track Cumulative Layout Shift (CLS)
   */
  private trackCLS() {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        this.webVitals.cls = clsValue
        this.reportMetric('CLS', clsValue, 'score')
      })

      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('CLS tracking not supported:', error)
    }
  }

  /**
   * Track First Contentful Paint (FCP)
   */
  private trackFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcpEntry = entries[0]
        this.webVitals.fcp = fcpEntry?.startTime ?? 0
        this.reportMetric('FCP', this.webVitals.fcp, 'ms')
      })

      observer.observe({ entryTypes: ['paint'] })
    } catch (error) {
      console.warn('FCP tracking not supported:', error)
    }
  }

  /**
   * Track Time to First Byte (TTFB)
   */
  private trackTTFB() {
    try {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      if (navigation) {
        this.webVitals.ttfb = navigation.responseStart - navigation.requestStart
        this.reportMetric('TTFB', this.webVitals.ttfb, 'ms')
      }
    } catch (error) {
      console.warn('TTFB tracking not supported:', error)
    }
  }

  /**
   * Initialize Performance Observer for custom metrics
   */
  private initializePerformanceObserver() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Track long tasks (>50ms)
          if (entry.entryType === 'measure' && entry.duration > 50) {
            this.reportMetric('Long Task', entry.duration, 'ms', {
              name: entry.name,
            })
          }
        }
      })

      observer.observe({ entryTypes: ['measure', 'navigation'] })
    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }
  }

  /**
   * Report a performance metric
   */
  reportMetric(name: string, value: number, unit: string, additionalData?: Record<string, any>) {
    if (!this.enabled) return

    const metric: PerformanceMetric = {
      id: `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      value,
      unit,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...additionalData,
    }

    this.metrics.push(metric)

    // Keep only last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    // Report to Sentry
    Sentry.metrics.distribution(name, value, {
      unit,
    })

    // Check thresholds
    this.checkThresholds(name, value)
  }

  /**
   * Track API performance
   */
  trackAPI(
    endpoint: string,
    method: string,
    duration: number,
    status: number,
    cached: boolean = false,
    error?: string
  ) {
    if (!this.enabled) return

    const metric: APIPerformanceMetric = {
      endpoint,
      method,
      duration,
      status,
      cached,
      timestamp: Date.now(),
      error,
    }

    this.apiMetrics.push(metric)

    // Keep only last maxMetrics
    if (this.apiMetrics.length > this.maxMetrics) {
      this.apiMetrics.shift()
    }

    // Report to Sentry
    Sentry.metrics.distribution('api.response_time', duration, {
      unit: 'millisecond',
    })

    // Check thresholds
    this.checkThresholds('API_RESPONSE', duration)
  }

  /**
   * Check performance thresholds
   */
  private checkThresholds(name: string, value: number) {
    const threshold = PERFORMANCE_THRESHOLDS[name as keyof typeof PERFORMANCE_THRESHOLDS]

    if (!threshold) return

    if (value > threshold.needsImprovement) {
      // Poor performance - report to Sentry
      Sentry.captureMessage(`Poor ${name} performance: ${value}${this.getUnit(name)}`, {
        level: 'warning',
        tags: {
          metric: name,
          value: value.toString(),
          threshold: threshold.needsImprovement.toString(),
        },
      })
    }
  }

  /**
   * Get unit for metric name
   */
  private getUnit(name: string): string {
    if (
      name.includes('TIME') ||
      name.includes('DELAY') ||
      name === 'LCP' ||
      name === 'FCP' ||
      name === 'TTFB'
    ) {
      return 'ms'
    }
    if (name === 'CLS') {
      return ' score'
    }
    if (name.includes('RATE')) {
      return '%'
    }
    return ''
  }

  /**
   * Get Web Vitals summary
   */
  getWebVitalsSummary(): {
    metrics: Partial<WebVitals>
    scores: Record<string, 'good' | 'needs-improvement' | 'poor'>
    overall: 'good' | 'needs-improvement' | 'poor'
  } {
    const scores: Record<string, 'good' | 'needs-improvement' | 'poor'> = {}
    let goodCount = 0
    let needsImprovementCount = 0
    let poorCount = 0

    // Score each metric
    Object.entries(this.webVitals).forEach(([key, value]) => {
      const threshold =
        PERFORMANCE_THRESHOLDS[key.toUpperCase() as keyof typeof PERFORMANCE_THRESHOLDS]

      if (threshold && value !== undefined) {
        if (value <= threshold.good) {
          scores[key] = 'good'
          goodCount++
        } else if (value <= threshold.needsImprovement) {
          scores[key] = 'needs-improvement'
          needsImprovementCount++
        } else {
          scores[key] = 'poor'
          poorCount++
        }
      }
    })

    // Calculate overall score
    const total = goodCount + needsImprovementCount + poorCount
    let overall: 'good' | 'needs-improvement' | 'poor' = 'good'

    if (poorCount > 0 || needsImprovementCount > total / 2) {
      overall = poorCount > 0 ? 'poor' : 'needs-improvement'
    }

    return {
      metrics: this.webVitals,
      scores,
      overall,
    }
  }

  /**
   * Get API performance summary
   */
  getAPISummary(): {
    total: number
    average: number
    min: number
    max: number
    p95: number
    p99: number
    errorRate: number
    cacheHitRate: number
    byEndpoint: Record<
      string,
      {
        count: number
        average: number
        errors: number
      }
    >
  } {
    if (this.apiMetrics.length === 0) {
      return {
        total: 0,
        average: 0,
        min: 0,
        max: 0,
        p95: 0,
        p99: 0,
        errorRate: 0,
        cacheHitRate: 0,
        byEndpoint: {},
      }
    }

    const durations = this.apiMetrics.map((m) => m.duration).sort((a, b) => a - b)
    const errors = this.apiMetrics.filter((m) => m.status >= 400).length
    const cached = this.apiMetrics.filter((m) => m.cached).length

    // Group by endpoint
    const byEndpoint: Record<string, { count: number; total: number; errors: number }> = {}

    this.apiMetrics.forEach((m) => {
      if (!byEndpoint[m.endpoint]) {
        byEndpoint[m.endpoint] = { count: 0, total: 0, errors: 0 }
      }
      byEndpoint[m.endpoint]!.count++
      byEndpoint[m.endpoint]!.total += m.duration
      if (m.status >= 400) {
        byEndpoint[m.endpoint]!.errors++
      }
    })

    // Calculate averages
    const byEndpointSummary: Record<string, { count: number; average: number; errors: number }> = {}
    Object.entries(byEndpoint).forEach(([endpoint, data]) => {
      byEndpointSummary[endpoint] = {
        count: data.count,
        average: data.total / data.count,
        errors: data.errors,
      }
    })

    return {
      total: this.apiMetrics.length,
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: durations[0] ?? 0,
      max: durations[durations.length - 1] ?? 0,
      p95: durations[Math.floor(durations.length * 0.95)] ?? 0,
      p99: durations[Math.floor(durations.length * 0.99)] ?? 0,
      errorRate: (errors / this.apiMetrics.length) * 100,
      cacheHitRate: (cached / this.apiMetrics.length) * 100,
      byEndpoint: byEndpointSummary,
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Get all API metrics
   */
  getAPIMetrics(): APIPerformanceMetric[] {
    return [...this.apiMetrics]
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = []
    this.apiMetrics = []
    this.webVitals = {}
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify(
      {
        webVitals: this.webVitals,
        metrics: this.metrics,
        apiMetrics: this.apiMetrics,
        summary: this.getWebVitalsSummary(),
        apiSummary: this.getAPISummary(),
        timestamp: new Date().toISOString(),
      },
      null,
      2
    )
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Export convenience functions
export const trackMetric = (
  name: string,
  value: number,
  unit: string,
  data?: Record<string, any>
) => {
  performanceMonitor.reportMetric(name, value, unit, data)
}

export const trackAPI = (
  endpoint: string,
  method: string,
  duration: number,
  status: number,
  cached: boolean = false,
  error?: string
) => {
  performanceMonitor.trackAPI(endpoint, method, duration, status, cached, error)
}

export const getWebVitalsSummary = () => performanceMonitor.getWebVitalsSummary()
export const getAPISummary = () => performanceMonitor.getAPISummary()
export const getMetrics = () => performanceMonitor.getMetrics()
export const getAPIMetrics = () => performanceMonitor.getAPIMetrics()
export const clearMetrics = () => performanceMonitor.clearMetrics()
export const setMonitoringEnabled = (enabled: boolean) => performanceMonitor.setEnabled(enabled)
export const isMonitoringEnabled = () => performanceMonitor.isEnabled()
export const exportMetrics = () => performanceMonitor.exportMetrics()
