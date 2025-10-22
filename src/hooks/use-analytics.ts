/**
 * Analytics Hook
 *
 * React hook for tracking analytics events
 */

import { useEffect, useCallback } from 'react'
import analytics from '../lib/analytics'

// Define the type locally since it's not exported
type AnalyticsEventType = 'page_view' | 'click' | 'search' | 'anime_view' | 'anime_rated' | 'anime_added_to_list' | 'user_signup' | 'user_login'

/**
 * Hook to access analytics
 */
export function useAnalytics() {
  const enabled = true
  const summary = {
    session: { duration: 0, pageViews: 0, events: 0 },
    engagement: { score: 0, level: 'low' as 'low' | 'medium' | 'high' },
    events: { byType: {}, total: 0 },
    user: null as null | { userId?: string; username?: string; role?: string; signupDate?: string }
  }

  const track = useCallback((_type: AnalyticsEventType, properties?: Record<string, any>) => {
    analytics.track('event', properties || {})
  }, [])

  const trackPage = useCallback((path: string) => {
    analytics.track('page_view', { url: path, title: path })
  }, [])

  const setUser = useCallback((userId: string, properties?: any) => {
    analytics.track('identify', { userId, ...properties })
  }, [])

  const clear = useCallback(() => {
    // No clear method available
  }, [])

  const enable = useCallback(() => {
    // No enable method available
  }, [])

  const disable = useCallback(() => {
    // No disable method available
  }, [])

  const exportData = useCallback(() => {
    return {}
  }, [])

  return {
    enabled,
    summary,
    track,
    trackPage,
    setUser,
    clear,
    enable,
    disable,
    exportData,
    analytics,
  }
}

/**
 * Hook to track page views
 */
export function usePageTracking(pageName: string) {
  useEffect(() => {
    analytics.track('page_view', { url: pageName, title: pageName })
  }, [pageName])
}

/**
 * Hook to track anime views
 */
export function useAnimeTracking(animeId: string, animeTitle: string) {
  useEffect(() => {
    analytics.track('anime_view', {
      animeId,
      animeTitle,
    })
  }, [animeId, animeTitle])
}

/**
 * Hook to track search queries
 */
export function useSearchTracking(query: string) {
  useEffect(() => {
    if (query) {
      analytics.track('search', {
        query,
        queryLength: query.length,
      })
    }
  }, [query])
}

/**
 * Hook to track list actions
 */
export function useListTracking() {
  const trackAddToList = useCallback((animeId: string, status: string) => {
    analytics.track('anime_added_to_list', {
      animeId,
      status,
    })
  }, [])

  const trackRemoveFromList = useCallback((animeId: string) => {
    analytics.track('anime_removed_from_list', {
      animeId,
    })
  }, [])

  const trackRate = useCallback((animeId: string, rating: number) => {
    analytics.track('anime_rated', {
      animeId,
      rating,
    })
  }, [])

  return {
    trackAddToList,
    trackRemoveFromList,
    trackRate,
  }
}

/**
 * Hook to track social actions
 */
export function useSocialTracking() {
  const trackFollow = useCallback((userId: string) => {
    analytics.track('user_follow', {
      userId,
    })
  }, [])

  const trackUnfollow = useCallback((userId: string) => {
    analytics.track('user_unfollow', {
      userId,
    })
  }, [])

  const trackShare = useCallback((type: string, id: string) => {
    analytics.track('anime_share', {
      type,
      id,
    })
  }, [])

  return {
    trackFollow,
    trackUnfollow,
    trackShare,
  }
}

/**
 * Hook to track feature usage
 */
export function useFeatureTracking(featureName: string) {
  const trackUse = useCallback(() => {
    analytics.track('feature_use', {
      feature: featureName,
    })
  }, [featureName])

  const trackAbandon = useCallback(() => {
    analytics.track('feature_abandon', {
      feature: featureName,
    })
  }, [featureName])

  return {
    trackUse,
    trackAbandon,
  }
}
