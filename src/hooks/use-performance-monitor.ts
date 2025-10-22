/**
 * Performance Monitor Hook
 *
 * React hook for accessing performance monitoring data
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getWebVitalsSummary,
  getAPISummary,
  getMetrics,
  getAPIMetrics,
  clearMetrics,
  setMonitoringEnabled,
  isMonitoringEnabled,
  exportMetrics,
  trackMetric,
  performanceMonitor,
} from '../lib/performance-monitor'

/**
 * Hook to access performance monitoring data
 */
export function usePerformanceMonitor() {
  const [webVitals, setWebVitals] = useState(getWebVitalsSummary())
  const [apiSummary, setApiSummary] = useState(getAPISummary())
  const [enabled, setEnabled] = useState(isMonitoringEnabled())

  // Update metrics every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWebVitals(getWebVitalsSummary())
      setApiSummary(getAPISummary())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const toggleMonitoring = useCallback((value: boolean) => {
    setMonitoringEnabled(value)
    setEnabled(value)
  }, [])

  const clear = useCallback(() => {
    clearMetrics()
    setWebVitals(getWebVitalsSummary())
    setApiSummary(getAPISummary())
  }, [])

  const exportData = useCallback(() => {
    return exportMetrics()
  }, [])

  return {
    webVitals,
    apiSummary,
    enabled,
    toggleMonitoring,
    clear,
    exportData,
    getMetrics,
    getAPIMetrics,
    trackMetric,
    performanceMonitor,
  }
}

/**
 * Hook to track page load performance
 */
export function usePagePerformance(pageName: string) {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const loadTime = performance.now() - startTime
      trackMetric('Page Load Time', loadTime, 'ms', { page: pageName })
    }
  }, [pageName])
}

/**
 * Hook to track component render performance
 */
export function useRenderPerformance(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const renderTime = performance.now() - startTime
      if (renderTime > 16) {
        // Only track slow renders (>1 frame at 60fps)
        trackMetric('Component Render Time', renderTime, 'ms', { component: componentName })
      }
    }
  })
}
