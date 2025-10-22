'use client'

import { useEffect, useState } from 'react'
import {
  Zap,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte

  // Custom Metrics
  pageLoadTime?: number
  apiResponseTime?: number
  memoryUsage?: number
  bundleSize?: number
}

interface PerformanceMonitorProps {
  showInProduction?: boolean
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
}

export function PerformanceMonitor({
  showInProduction = false,
  position = 'bottom-left',
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const [isVisible, setIsVisible] = useState(false)

  // Only show in development unless explicitly enabled
  const shouldShow = process.env.NODE_ENV === 'development' || showInProduction

  useEffect(() => {
    if (!shouldShow || typeof window === 'undefined') return

    // Measure Core Web Vitals
    const measureWebVitals = () => {
      // FCP - First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint')
      const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint')

      // Navigation Timing
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming

      setMetrics((prev) => ({
        ...prev,
        fcp: fcp?.startTime,
        ttfb: navigation?.responseStart - navigation?.requestStart,
        pageLoadTime: navigation?.loadEventEnd - navigation?.fetchStart,
      }))
    }

    // Use PerformanceObserver for LCP, FID, CLS
    try {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        setMetrics((prev) => ({ ...prev, lcp: lastEntry.renderTime || lastEntry.loadTime }))
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // FID Observer
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          setMetrics((prev) => ({ ...prev, fid: entry.processingStart - entry.startTime }))
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // CLS Observer
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            setMetrics((prev) => ({ ...prev, cls: clsValue }))
          }
        }
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('PerformanceObserver not supported')
    }

    measureWebVitals()

    // Memory usage (if available)
    if ((performance as any).memory) {
      const memory = (performance as any).memory
      setMetrics((prev) => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize / 1048576, // Convert to MB
      }))
    }
  }, [shouldShow])

  if (!shouldShow) return null

  const getScoreColor = (metric: string, value: number) => {
    const thresholds: Record<string, { good: number; needsImprovement: number }> = {
      fcp: { good: 1800, needsImprovement: 3000 },
      lcp: { good: 2500, needsImprovement: 4000 },
      fid: { good: 100, needsImprovement: 300 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      ttfb: { good: 800, needsImprovement: 1800 },
    }

    const threshold = thresholds[metric]
    if (!threshold) return 'text-gray-400'

    if (value <= threshold.good) return 'text-green-400'
    if (value <= threshold.needsImprovement) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreIcon = (metric: string, value: number) => {
    const color = getScoreColor(metric, value)
    if (color === 'text-green-400') return <CheckCircle className="w-3 h-3" />
    if (color === 'text-yellow-400') return <AlertTriangle className="w-3 h-3" />
    return <AlertTriangle className="w-3 h-3" />
  }

  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={cn(
          'fixed z-[90] w-12 h-12 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all shadow-lg border border-white/10',
          positionClasses[position]
        )}
        title="Show Performance Metrics"
      >
        <Zap className="w-5 h-5 text-primary-400" />
      </button>
    )
  }

  return (
    <div
      className={cn(
        'fixed z-[90] w-80 glass rounded-xl border border-white/10 p-4 shadow-2xl',
        positionClasses[position]
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary-400" />
          <h3 className="font-bold text-white text-sm">Performance</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white text-xs"
        >
          Hide
        </button>
      </div>

      {/* Core Web Vitals */}
      <div className="space-y-2">
        {metrics.fcp && (
          <MetricRow
            label="FCP"
            value={`${Math.round(metrics.fcp)}ms`}
            color={getScoreColor('fcp', metrics.fcp)}
            icon={getScoreIcon('fcp', metrics.fcp)}
          />
        )}

        {metrics.lcp && (
          <MetricRow
            label="LCP"
            value={`${Math.round(metrics.lcp)}ms`}
            color={getScoreColor('lcp', metrics.lcp)}
            icon={getScoreIcon('lcp', metrics.lcp)}
          />
        )}

        {metrics.fid && (
          <MetricRow
            label="FID"
            value={`${Math.round(metrics.fid)}ms`}
            color={getScoreColor('fid', metrics.fid)}
            icon={getScoreIcon('fid', metrics.fid)}
          />
        )}

        {metrics.cls !== undefined && (
          <MetricRow
            label="CLS"
            value={metrics.cls.toFixed(3)}
            color={getScoreColor('cls', metrics.cls)}
            icon={getScoreIcon('cls', metrics.cls)}
          />
        )}

        {metrics.ttfb && (
          <MetricRow
            label="TTFB"
            value={`${Math.round(metrics.ttfb)}ms`}
            color={getScoreColor('ttfb', metrics.ttfb)}
            icon={getScoreIcon('ttfb', metrics.ttfb)}
          />
        )}

        {/* Custom Metrics */}
        {metrics.pageLoadTime && (
          <MetricRow
            label="Page Load"
            value={`${(metrics.pageLoadTime / 1000).toFixed(2)}s`}
            color="text-gray-400"
          />
        )}

        {metrics.memoryUsage && (
          <MetricRow
            label="Memory"
            value={`${Math.round(metrics.memoryUsage)}MB`}
            color="text-gray-400"
          />
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-gray-400">Good</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span className="text-gray-400">OK</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            <span className="text-gray-400">Poor</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricRow({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: string
  color: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        {icon && <span className={color}>{icon}</span>}
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <span className={cn('text-sm font-mono font-semibold', color)}>{value}</span>
    </div>
  )
}
