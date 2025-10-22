'use client'

import { logger } from './logger'

interface WebVitalMetric {
  name: string
  value: number
  delta: number
  id: string
  navigationType?: string
  timestamp: number
}

interface WebVitalsConfig {
  apiEndpoint: string
  sampleRate: number
  debug: boolean
  thresholds: {
    LCP: number // milliseconds
    FID: number // milliseconds
    CLS: number // score
    FCP: number // milliseconds
    TTFB: number // milliseconds
  }
}

class WebVitalsTracker {
  private config: WebVitalsConfig
  private metrics: WebVitalMetric[] = []
  private sessionId: string
  private userId?: string

  constructor(config: Partial<WebVitalsConfig> = {}) {
    this.config = {
      apiEndpoint: '/api/web-vitals',
      sampleRate: 1.0,
      debug: false,
      thresholds: {
        LCP: 2500, // 2.5s
        FID: 100,  // 100ms
        CLS: 0.1,  // 0.1 score
        FCP: 1800, // 1.8s
        TTFB: 600  // 600ms
      },
      ...config
    }
    
    this.sessionId = this.generateSessionId()
    this.initializeTracking()
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  private initializeTracking() {
    if (typeof window === 'undefined') return

    // Sample rate check
    if (Math.random() > this.config.sampleRate) return

    // Load web-vitals library dynamically
    this.loadWebVitalsLibrary()
  }

  private async loadWebVitalsLibrary() {
    try {
      const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals')
      
      // Track Core Web Vitals
      onCLS(this.handleMetric.bind(this))
      onINP(this.handleMetric.bind(this))
      onFCP(this.handleMetric.bind(this))
      onLCP(this.handleMetric.bind(this))
      onTTFB(this.handleMetric.bind(this))

      if (this.config.debug) {
        console.log('Web Vitals tracking initialized')
      }
    } catch (error) {
      logger.error('Failed to load web-vitals library', { error })
    }
  }

  private handleMetric(metric: any) {
    if (typeof window === 'undefined') return
    
    const enrichedMetric = {
      ...metric,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType(),
      deviceMemory: this.getDeviceMemory(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }

    this.metrics.push(enrichedMetric)
    
    // Check thresholds and send alerts
    this.checkThresholds(enrichedMetric)
    
    // Send to backend
    this.sendMetric(enrichedMetric)
    
    if (this.config.debug) {
      console.log('Web Vital recorded:', enrichedMetric)
    }
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    return connection?.effectiveType || 'unknown'
  }

  private getDeviceMemory(): number {
    return (navigator as any).deviceMemory || 0
  }

  private checkThresholds(metric: WebVitalMetric) {
    const threshold = this.config.thresholds[metric.name as keyof typeof this.config.thresholds]
    
    if (threshold && metric.value > threshold) {
      this.sendPerformanceAlert(metric, threshold)
    }
  }

  private async sendMetric(metric: WebVitalMetric) {
    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      logger.error('Failed to send web vital metric', { error, metric })
    }
  }

  private async sendPerformanceAlert(metric: WebVitalMetric, threshold: number) {
    if (typeof window === 'undefined') return
    
    const alertData = {
      type: 'web-vital-threshold',
      metric: metric.name,
      value: metric.value,
      threshold,
      url: window.location.href,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: metric.timestamp
    }

    try {
      await fetch('/api/alerts/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertData)
      })
    } catch (error) {
      logger.error('Failed to send performance alert', { error, alertData })
    }
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  getMetrics(): WebVitalMetric[] {
    return [...this.metrics]
  }

  getSessionId(): string {
    return this.sessionId
  }

  // Custom metric tracking
  trackCustomMetric(name: string, value: number, delta: number = 0) {
    const metric: WebVitalMetric = {
      name,
      value,
      delta,
      id: `${name}-${Date.now()}`,
      timestamp: Date.now()
    }

    this.handleMetric(metric)
  }

  // Performance observer for additional metrics
  observePerformance() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.trackCustomMetric('DOMContentLoaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart)
            this.trackCustomMetric('LoadComplete', navEntry.loadEventEnd - navEntry.loadEventStart)
          }
        }
      })
      navObserver.observe({ entryTypes: ['navigation'] })

      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resourceEntry = entry as PerformanceResourceTiming
          if (resourceEntry.duration > 1000) { // Track slow resources (>1s)
            this.trackCustomMetric('SlowResource', resourceEntry.duration, 0)
          }
        }
      })
      resourceObserver.observe({ entryTypes: ['resource'] })

      // Observe long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackCustomMetric('LongTask', entry.duration, 0)
        }
      })
      longTaskObserver.observe({ entryTypes: ['longtask'] })

    } catch (error) {
      logger.error('Failed to initialize performance observers', { error })
    }
  }
}

// Create a lazy-initialized tracker
let webVitalsTrackerInstance: WebVitalsTracker | null = null

export const getWebVitalsTracker = () => {
  if (typeof window === 'undefined') {
    return null
  }
  
  if (!webVitalsTrackerInstance) {
    webVitalsTrackerInstance = new WebVitalsTracker({
      debug: process.env.NODE_ENV === 'development',
      sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
    })
    
    // Auto-initialize tracking
    webVitalsTrackerInstance.observePerformance()
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        webVitalsTrackerInstance?.trackCustomMetric('PageHidden', Date.now())
      } else {
        webVitalsTrackerInstance?.trackCustomMetric('PageVisible', Date.now())
      }
    })

    // Track unload events
    window.addEventListener('beforeunload', () => {
      webVitalsTrackerInstance?.trackCustomMetric('PageUnload', Date.now())
    })
  }
  
  return webVitalsTrackerInstance
}

export const webVitalsTracker = {
  get trackCustomMetric() {
    return getWebVitalsTracker()?.trackCustomMetric.bind(getWebVitalsTracker()) || (() => {})
  },
  get getMetrics() {
    return getWebVitalsTracker()?.getMetrics.bind(getWebVitalsTracker()) || (() => [])
  },
  get getSessionId() {
    return getWebVitalsTracker()?.getSessionId.bind(getWebVitalsTracker()) || (() => '')
  },
  get setUserId() {
    return getWebVitalsTracker()?.setUserId.bind(getWebVitalsTracker()) || (() => {})
  }
}

// React hook for web vitals
export function useWebVitals() {
  return {
    trackCustomMetric: webVitalsTracker.trackCustomMetric,
    getMetrics: webVitalsTracker.getMetrics,
    getSessionId: webVitalsTracker.getSessionId
  }
}

export default webVitalsTracker
