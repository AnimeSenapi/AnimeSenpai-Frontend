'use client'

import { logger } from './logger'

interface RUMMetric {
  name: string
  value: number
  timestamp: number
  url: string
  userAgent: string
  connectionType: string
  deviceMemory: number
  viewport: {
    width: number
    height: number
  }
  userId?: string
  sessionId: string
  metadata?: Record<string, any>
}

interface RUMConfig {
  apiEndpoint: string
  sampleRate: number
  debug: boolean
  batchSize: number
  flushInterval: number
}

class RealUserMonitoring {
  private config: RUMConfig
  private metrics: RUMMetric[] = []
  private sessionId: string
  private userId?: string
  private flushTimer?: NodeJS.Timeout
  private isOnline = true

  constructor(config: Partial<RUMConfig> = {}) {
    this.config = {
      apiEndpoint: '/api/rum/track',
      sampleRate: 0.1, // 10% sampling in production
      debug: process.env.NODE_ENV === 'development',
      batchSize: 20,
      flushInterval: 30000, // 30 seconds
      ...config
    }

    this.sessionId = this.generateSessionId()
    this.initializeRUM()
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  private initializeRUM() {
    if (typeof window === 'undefined') return

    // Sample rate check
    if (Math.random() > this.config.sampleRate) return

    // Track page load performance
    this.trackPageLoadPerformance()
    
    // Track resource performance
    this.trackResourcePerformance()
    
    // Track user interactions
    this.trackUserInteractions()
    
    // Track navigation timing
    this.trackNavigationTiming()
    
    // Track memory usage
    this.trackMemoryUsage()
    
    // Track network conditions
    this.trackNetworkConditions()

    // Set up automatic flushing
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)

    // Track online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true
      this.flush()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    // Track before unload
    window.addEventListener('beforeunload', () => {
      this.trackMetric('page_unload', Date.now())
      this.flush(true)
    })
  }

  private trackPageLoadPerformance() {
    // Track when page becomes interactive
    if (document.readyState === 'complete') {
      this.trackPageLoadMetrics()
    } else {
      window.addEventListener('load', () => {
        this.trackPageLoadMetrics()
      })
    }
  }

  private trackPageLoadMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (navigation) {
      // Core Web Vitals
      this.trackMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)
      this.trackMetric('load_complete', navigation.loadEventEnd - navigation.loadEventStart)
      this.trackMetric('first_byte', navigation.responseStart - navigation.requestStart)
      this.trackMetric('dom_processing', navigation.domComplete - navigation.domContentLoadedEventStart)
      
      // Additional metrics
      this.trackMetric('redirect_time', navigation.redirectEnd - navigation.redirectStart)
      this.trackMetric('dns_lookup', navigation.domainLookupEnd - navigation.domainLookupStart)
      this.trackMetric('tcp_connection', navigation.connectEnd - navigation.connectStart)
      this.trackMetric('request_time', navigation.responseEnd - navigation.requestStart)
    }
  }

  private trackResourcePerformance() {
    if (!('PerformanceObserver' in window)) return

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resourceEntry = entry as PerformanceResourceTiming
          
          // Track slow resources
          if (resourceEntry.duration > 1000) {
            this.trackMetric('slow_resource', resourceEntry.duration, {
              resourceType: resourceEntry.initiatorType,
              resourceName: resourceEntry.name,
              transferSize: resourceEntry.transferSize,
              encodedBodySize: resourceEntry.encodedBodySize
            })
          }

          // Track resource timing breakdown
          this.trackMetric('resource_dns', resourceEntry.domainLookupEnd - resourceEntry.domainLookupStart, {
            resourceType: resourceEntry.initiatorType,
            resourceName: resourceEntry.name
          })

          this.trackMetric('resource_connection', resourceEntry.connectEnd - resourceEntry.connectStart, {
            resourceType: resourceEntry.initiatorType,
            resourceName: resourceEntry.name
          })

          this.trackMetric('resource_request', resourceEntry.responseEnd - resourceEntry.requestStart, {
            resourceType: resourceEntry.initiatorType,
            resourceName: resourceEntry.name
          })
        }
      })

      resourceObserver.observe({ entryTypes: ['resource'] })
    } catch (error) {
      logger.error('Failed to initialize resource performance observer', { error })
    }
  }

  private trackUserInteractions() {
    // Track click events
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      this.trackMetric('user_click', Date.now(), {
        element: target.tagName,
        className: target.className,
        id: target.id,
        text: target.textContent?.substring(0, 100)
      })
    })

    // Track scroll events (throttled)
    let scrollTimeout: NodeJS.Timeout
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        this.trackMetric('user_scroll', Date.now(), {
          scrollY: window.scrollY,
          scrollX: window.scrollX,
          documentHeight: document.documentElement.scrollHeight,
          viewportHeight: window.innerHeight
        })
      }, 100)
    })

    // Track form interactions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      this.trackMetric('form_submit', Date.now(), {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method
      })
    })

    // Track input focus/blur
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        this.trackMetric('input_focus', Date.now(), {
          inputType: (target as HTMLInputElement).type,
          inputName: (target as HTMLInputElement).name
        })
      }
    })
  }

  private trackNavigationTiming() {
    if (!('PerformanceObserver' in window)) return

    try {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            
            // Track navigation timing metrics
            this.trackMetric('navigation_type', navEntry.type === 'navigate' ? 0 : 1, {
              navigationType: navEntry.type,
              redirectCount: navEntry.redirectCount
            })

            // Track timing phases
            this.trackMetric('navigation_redirect', navEntry.redirectEnd - navEntry.redirectStart)
            this.trackMetric('navigation_dns', navEntry.domainLookupEnd - navEntry.domainLookupStart)
            this.trackMetric('navigation_tcp', navEntry.connectEnd - navEntry.connectStart)
            this.trackMetric('navigation_request', navEntry.responseEnd - navEntry.requestStart)
            this.trackMetric('navigation_dom', navEntry.domComplete - navEntry.domContentLoadedEventStart)
          }
        }
      })

      navObserver.observe({ entryTypes: ['navigation'] })
    } catch (error) {
      logger.error('Failed to initialize navigation observer', { error })
    }
  }

  private trackMemoryUsage() {
    if (!('memory' in performance)) return

    const memory = (performance as any).memory
    
    this.trackMetric('memory_used', memory.usedJSHeapSize)
    this.trackMetric('memory_total', memory.totalJSHeapSize)
    this.trackMetric('memory_limit', memory.jsHeapSizeLimit)

    // Track memory usage periodically
    setInterval(() => {
      this.trackMetric('memory_used_periodic', memory.usedJSHeapSize)
    }, 60000) // Every minute
  }

  private trackNetworkConditions() {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    
    if (connection) {
      this.trackMetric('network_effective_type', this.getNetworkTypeValue(connection.effectiveType), {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      })

      // Track network changes
      connection.addEventListener('change', () => {
        this.trackMetric('network_change', Date.now(), {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        })
      })
    }
  }

  private getNetworkTypeValue(effectiveType: string): number {
    const types = { 'slow-2g': 1, '2g': 2, '3g': 3, '4g': 4 }
    return types[effectiveType as keyof typeof types] || 0
  }

  private trackMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: RUMMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType(),
      deviceMemory: this.getDeviceMemory(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      userId: this.userId,
      sessionId: this.sessionId,
      metadata
    }

    this.metrics.push(metric)

    if (this.config.debug) {
      console.log('RUM metric:', metric)
    }

    // Auto-flush if batch size reached
    if (this.metrics.length >= this.config.batchSize) {
      this.flush()
    }
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    return connection?.effectiveType || 'unknown'
  }

  private getDeviceMemory(): number {
    return (navigator as any).deviceMemory || 0
  }

  private async flush(force = false) {
    if (!this.isOnline && !force) return
    if (this.metrics.length === 0) return

    const metricsToSend = [...this.metrics]
    this.metrics = []

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: metricsToSend,
          session: {
            sessionId: this.sessionId,
            userId: this.userId,
            timestamp: Date.now()
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (this.config.debug) {
        console.log(`RUM: Sent ${metricsToSend.length} metrics`)
      }
    } catch (error) {
      // Re-add metrics to queue if sending failed
      this.metrics.unshift(...metricsToSend)
      logger.error('Failed to send RUM metrics', { error, metricCount: metricsToSend.length })
    }
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  getSessionId(): string {
    return this.sessionId
  }

  getMetrics(): RUMMetric[] {
    return [...this.metrics]
  }

  // Custom metric tracking
  trackCustomMetric(name: string, value: number, metadata?: Record<string, any>) {
    this.trackMetric(name, value, metadata)
  }

  // Track user journey
  trackUserJourney(step: string, metadata?: Record<string, any>) {
    this.trackMetric('user_journey', Date.now(), {
      step,
      ...metadata
    })
  }

  // Track errors
  trackError(error: Error, metadata?: Record<string, any>) {
    this.trackMetric('javascript_error', Date.now(), {
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
      ...metadata
    })
  }

  // Cleanup
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flush(true)
  }
}

// Global RUM instance
export const rum = new RealUserMonitoring({
  debug: process.env.NODE_ENV === 'development',
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
})

// React hook for RUM
export function useRUM() {
  return {
    trackCustomMetric: rum.trackCustomMetric.bind(rum),
    trackUserJourney: rum.trackUserJourney.bind(rum),
    trackError: rum.trackError.bind(rum),
    getSessionId: rum.getSessionId.bind(rum)
  }
}

export default rum
