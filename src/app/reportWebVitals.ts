'use client'

import * as Sentry from '@sentry/nextjs'
import { analytics } from '../lib/analytics'

type NextWebVitalsMetric = {
  id: string
  name: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'INP' | 'TTFB'
  startTime: number
  value: number
  label: 'web-vital' | 'custom'
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
  try {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    const route = url.pathname
    const device = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    const connection = (navigator as any).connection?.effectiveType

    const span = (Sentry as any).getActiveSpan?.()
    if (span && typeof span.setAttribute === 'function') {
      span.setAttribute(`web-vitals.${metric.name.toLowerCase()}`, metric.value)
      span.setAttribute('route', route)
      if (device) span.setAttribute('device', device)
      if (connection) span.setAttribute('connection', connection)
    } else {
      Sentry.addBreadcrumb({
        category: 'web-vitals',
        message: metric.name,
        level: 'info',
        data: { value: metric.value, route, device, connection },
      })
    }

    analytics.track('web_vital', {
      name: metric.name,
      value: metric.value,
      route,
      device,
      connection,
    })
  } catch {
    // no-op
  }
}

export default reportWebVitals


