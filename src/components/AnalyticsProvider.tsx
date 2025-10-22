'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { analytics } from '../lib/analytics'
import { useAuth } from '../app/lib/auth-context'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Set user ID for analytics tracking
    if (user?.id) {
      analytics.setUserId(user.id)
    }
  }, [user?.id])

  useEffect(() => {
    // Track page views on route changes
    const handleRouteChange = () => {
      analytics.trackPageView()
    }

    // Track initial page view
    analytics.trackPageView()

    // Listen for route changes (Next.js 13+ app router)
    const handlePopState = () => {
      setTimeout(handleRouteChange, 0)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  return <>{children}</>
}

// Hook for tracking user interactions
export function useAnalytics() {
  const { user } = useAuth()

  const trackUserAction = (action: string, target?: string, properties?: Record<string, any>) => {
    analytics.trackUserAction(action, target, properties)
  }

  const trackFeatureUsage = (feature: string, properties?: Record<string, any>) => {
    analytics.trackFeatureUsage(feature, properties)
  }

  const trackSearch = (query: string, results: number, filters?: Record<string, any>) => {
    analytics.trackSearch(query, results, filters)
  }

  const trackAnimeInteraction = (animeId: string, action: string, properties?: Record<string, any>) => {
    analytics.trackAnimeInteraction(animeId, action, properties)
  }

  const trackListInteraction = (listId: string, action: string, properties?: Record<string, any>) => {
    analytics.trackListInteraction(listId, action, properties)
  }

  const trackSocialInteraction = (type: string, targetId: string, action: string, properties?: Record<string, any>) => {
    analytics.trackSocialInteraction(type, targetId, action, properties)
  }

  const trackError = (error: string, properties?: Record<string, any>) => {
    analytics.trackError(error, properties)
  }

  const trackPerformance = (metric: string, value: number, properties?: Record<string, any>) => {
    analytics.trackPerformance(metric, value, properties)
  }

  return {
    trackUserAction,
    trackFeatureUsage,
    trackSearch,
    trackAnimeInteraction,
    trackListInteraction,
    trackSocialInteraction,
    trackError,
    trackPerformance,
    isAuthenticated: !!user
  }
}
