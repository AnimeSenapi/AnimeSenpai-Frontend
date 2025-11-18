'use client'

import { logger } from './logger'
import { headers } from 'next/headers'

interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  userId?: string
  sessionId: string
  timestamp: number
  url: string
  userAgent: string
  viewport: {
    width: number
    height: number
  }
  referrer?: string
}

interface UserSession {
  sessionId: string
  userId?: string
  startTime: number
  lastActivity: number
  pageViews: number
  events: number
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

interface AnalyticsConfig {
  apiEndpoint: string
  batchSize: number
  flushInterval: number
  debug: boolean
  sampleRate: number
}

class AnalyticsTracker {
  private config: AnalyticsConfig
  private events: AnalyticsEvent[] = []
  private session: UserSession
  private flushTimer?: NodeJS.Timeout
  private isOnline = true
  private enabled = true
  private vercelTrack?: (event: string, props?: Record<string, any>) => void

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      apiEndpoint: '/api/analytics/track',
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      debug: process.env.NODE_ENV === 'development',
      sampleRate: 1.0,
      ...config
    }

    this.session = this.createSession()
    this.enabled = this.shouldEnable()
    // Lazy import vercel analytics custom event tracker if present
    if (typeof window !== 'undefined') {
      import('@vercel/analytics').then((mod) => {
        if (mod && typeof mod.track === 'function') {
          this.vercelTrack = mod.track
        }
      }).catch(() => {})
    }
    this.initializeTracking()
  }

  private shouldEnable(): boolean {
    if (typeof window === 'undefined') return true
    // Respect Do Not Track
    if ((navigator as any).doNotTrack === '1' || (window as any).doNotTrack === '1') {
      return false
    }
    // Optional local opt-out flag
    try {
      const consent = localStorage.getItem('analytics:consent')
      if (consent === 'denied') return false
    } catch {}
    return true
  }

  private createSession(): UserSession {
    const sessionId = this.generateSessionId()
    
    if (typeof window === 'undefined') {
      return {
        sessionId,
        userId: undefined,
        startTime: Date.now(),
        lastActivity: Date.now(),
        pageViews: 0,
        events: 0,
        referrer: undefined,
        utmSource: undefined,
        utmMedium: undefined,
        utmCampaign: undefined
      }
    }
    
    const urlParams = new URLSearchParams(window.location.search)
    
    return {
      sessionId,
      userId: undefined,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: 0,
      referrer: document.referrer || undefined,
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  private initializeTracking() {
    if (typeof window === 'undefined') return
    if (!this.enabled) return

    // Sample rate check
    if (Math.random() > this.config.sampleRate) return

    // Track page view
    this.trackPageView()

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
      this.track('session_end', {
        duration: Date.now() - this.session.startTime,
        pageViews: this.session.pageViews,
        events: this.session.events
      })
      this.flush(true) // Force flush on unload
    })

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.track('page_visible')
      } else {
        this.track('page_hidden')
      }
    })
  }

  setUserId(userId: string) {
    this.session.userId = userId
  }
  
  identify(userId: string, traits?: Record<string, any>) {
    this.setUserId(userId)
    // Do not include PII (emails, tokens, message bodies)
    const safeTraits = Object.fromEntries(
      Object.entries(traits || {}).filter(([k]) => !/email|token|password|message|content/i.test(k))
    )
    this.track('identify', { userId, ...safeTraits })
  }

  track(event: string, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return
    if (!this.enabled) return
    
    // Context
    const urlObj = new URL(window.location.href)
    const locale = navigator.language || 'en'
    const connection = (navigator as any).connection?.effectiveType
    const device = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    const route = urlObj.pathname
    const abFlags = (() => {
      try {
        return JSON.parse(localStorage.getItem('ab:flags') || 'null') || undefined
      } catch { return undefined }
    })()

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        route,
        locale,
        device,
        connection,
        abFlags,
        sessionId: this.session.sessionId,
        userId: this.session.userId
      },
      userId: this.session.userId,
      sessionId: this.session.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      referrer: this.session.referrer
    }

    this.events.push(analyticsEvent)
    this.session.events++
    this.session.lastActivity = Date.now()

    if (this.config.debug) {
      console.log('Analytics event:', analyticsEvent)
    }
    // Best-effort fan-out to Vercel custom events if available
    try {
      this.vercelTrack?.(event, analyticsEvent.properties)
    } catch {}

    // Auto-flush if batch size reached
    if (this.events.length >= this.config.batchSize) {
      this.flush()
    }
  }

  trackPageView(page?: string) {
    if (typeof window === 'undefined') return
    
    const currentPage = page || window.location.pathname
    
    this.track('page_view', {
      page: currentPage,
      title: document.title,
      referrer: this.session.referrer
    })

    this.session.pageViews++
  }

  trackUserAction(action: string, target?: string, properties?: Record<string, any>) {
    this.track('user_action', {
      action,
      target,
      ...properties
    })
  }

  trackFeatureUsage(feature: string, properties?: Record<string, any>) {
    this.track('feature_usage', {
      feature,
      ...properties
    })
  }

  trackSearch(query: string, results: number, filters?: Record<string, any>) {
    this.track('search', {
      query: query.toLowerCase().trim(),
      results,
      filters,
      queryLength: query.length
    })
  }

  trackAnimeInteraction(animeId: string, action: string, properties?: Record<string, any>) {
    this.track('anime_interaction', {
      animeId,
      action,
      ...properties
    })
  }

  trackListInteraction(listId: string, action: string, properties?: Record<string, any>) {
    this.track('list_interaction', {
      listId,
      action,
      ...properties
    })
  }

  trackSocialInteraction(type: string, targetId: string, action: string, properties?: Record<string, any>) {
    this.track('social_interaction', {
      type,
      targetId,
      action,
      ...properties
    })
  }

  trackError(error: string, properties?: Record<string, any>) {
    this.track('error', {
      error,
      ...properties
    })
  }

  trackPerformance(metric: string, value: number, properties?: Record<string, any>) {
    this.track('performance', {
      metric,
      value,
      ...properties
    })
  }

  private async flush(force = false) {
    if (!this.isOnline && !force) return
    if (this.events.length === 0) return

    const eventsToSend = [...this.events]
    this.events = []

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: eventsToSend,
          session: this.session
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (this.config.debug) {
        console.log(`Analytics: Sent ${eventsToSend.length} events`)
      }
    } catch (error) {
      // Re-add events to queue if sending failed
      this.events.unshift(...eventsToSend)
      logger.error('Failed to send analytics events', { error, eventCount: eventsToSend.length })
    }
  }

  getSession(): UserSession {
    return { ...this.session }
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events]
  }

  // Cleanup
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flush(true)
  }
}

// Create a lazy-initialized tracker
let analyticsInstance: AnalyticsTracker | null = null

export const getAnalyticsTracker = () => {
  if (typeof window === 'undefined') {
    return null
  }
  
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsTracker({
      debug: process.env.NODE_ENV === 'development',
      sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
    })
  }
  
  return analyticsInstance
}

export const analytics = {
  get track() {
    return getAnalyticsTracker()?.track.bind(getAnalyticsTracker()) || (() => {})
  },
  get identify() {
    return getAnalyticsTracker()?.identify.bind(getAnalyticsTracker()) || ((_id: string, _traits?: Record<string, any>) => {})
  },
  get trackPageView() {
    return getAnalyticsTracker()?.trackPageView.bind(getAnalyticsTracker()) || (() => {})
  },
  get trackUserAction() {
    return getAnalyticsTracker()?.trackUserAction.bind(getAnalyticsTracker()) || (() => {})
  },
  get trackFeatureUsage() {
    return getAnalyticsTracker()?.trackFeatureUsage.bind(getAnalyticsTracker()) || (() => {})
  },
  get trackSearch() {
    return getAnalyticsTracker()?.trackSearch.bind(getAnalyticsTracker()) || (() => {})
  },
  get trackAnimeInteraction() {
    return getAnalyticsTracker()?.trackAnimeInteraction.bind(getAnalyticsTracker()) || (() => {})
  },
  get trackListInteraction() {
    return getAnalyticsTracker()?.trackListInteraction.bind(getAnalyticsTracker()) || (() => {})
  },
  get trackSocialInteraction() {
    return getAnalyticsTracker()?.trackSocialInteraction.bind(getAnalyticsTracker()) || (() => {})
  },
  get trackError() {
    return getAnalyticsTracker()?.trackError.bind(getAnalyticsTracker()) || (() => {})
  },
  get trackPerformance() {
    return getAnalyticsTracker()?.trackPerformance.bind(getAnalyticsTracker()) || (() => {})
  },
  get getSession() {
    return getAnalyticsTracker()?.getSession.bind(getAnalyticsTracker()) || (() => ({}))
  },
  get setUserId() {
    return getAnalyticsTracker()?.setUserId.bind(getAnalyticsTracker()) || (() => {})
  }
}

// React hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track,
    trackPageView: analytics.trackPageView,
    trackUserAction: analytics.trackUserAction,
    trackFeatureUsage: analytics.trackFeatureUsage,
    trackSearch: analytics.trackSearch,
    trackAnimeInteraction: analytics.trackAnimeInteraction,
    trackListInteraction: analytics.trackListInteraction,
    trackSocialInteraction: analytics.trackSocialInteraction,
    trackError: analytics.trackError,
    trackPerformance: analytics.trackPerformance,
    getSession: analytics.getSession
  }
}

// Export Analytics tracker for compatibility
export const Analytics = analytics
export default analytics