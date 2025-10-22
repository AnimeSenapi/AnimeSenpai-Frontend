/**
 * Performance Monitoring Dashboard
 *
 * Admin dashboard for viewing application performance metrics
 */

'use client'

import { useState, useEffect } from 'react'
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor'
import {
  Activity,
  Zap,
  TrendingUp,
  AlertTriangle,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Server,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/app/lib/utils'

export function PerformanceTab() {
  const { webVitals, apiSummary, enabled, toggleMonitoring, clear, exportData } =
    usePerformanceMonitor()

  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getScoreColor = (score?: 'good' | 'needs-improvement' | 'poor') => {
    if (!score) return 'text-gray-400'

    switch (score) {
      case 'good':
        return 'text-green-400'
      case 'needs-improvement':
        return 'text-yellow-400'
      case 'poor':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getScoreIcon = (score?: 'good' | 'needs-improvement' | 'poor') => {
    if (!score) return null

    switch (score) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'needs-improvement':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case 'poor':
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return null
    }
  }

  const formatNumber = (num: number, decimals: number = 0) => {
    return num.toFixed(decimals)
  }

  const formatPercent = (num: number) => {
    return `${formatNumber(num, 1)}%`
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) {
      return `${formatNumber(ms, 0)}ms`
    }
    return `${formatNumber(ms / 1000, 2)}s`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary-400" />
            Performance Monitoring
          </h2>
          <p className="text-gray-400 text-sm mt-1">Real-time performance metrics and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button
            variant={enabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleMonitoring(!enabled)}
          >
            {enabled ? 'Monitoring Enabled' : 'Monitoring Disabled'}
          </Button>
          <Button variant="outline" size="sm" onClick={clear}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Metrics
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const data = exportData()
              const blob = new Blob([data], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `performance-metrics-${new Date().toISOString()}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Web Vitals */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary-400" />
          Core Web Vitals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(webVitals.metrics).map(([key, value]) => {
            const score = webVitals.scores[key]
            return (
              <div key={key} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(score)}
                    <span className="font-medium text-white">{key.toUpperCase()}</span>
                  </div>
                  <span className={cn('text-sm font-semibold', getScoreColor(score))}>{score}</span>
                </div>
                <div className="text-2xl font-bold text-white">{formatTime(value)}</div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Overall Performance</span>
            <div className="flex items-center gap-2">
              {getScoreIcon(webVitals.overall)}
              <span className={cn('font-semibold', getScoreColor(webVitals.overall))}>
                {webVitals.overall.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* API Performance */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Server className="h-5 w-5 text-primary-400" />
          API Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-gray-400 text-sm mb-1">Total Requests</div>
            <div className="text-2xl font-bold text-white">{apiSummary.total}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-gray-400 text-sm mb-1">Avg Response Time</div>
            <div className="text-2xl font-bold text-white">{formatTime(apiSummary.average)}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-gray-400 text-sm mb-1">Error Rate</div>
            <div className="text-2xl font-bold text-red-400">
              {formatPercent(apiSummary.errorRate)}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-gray-400 text-sm mb-1">Cache Hit Rate</div>
            <div className="text-2xl font-bold text-green-400">
              {formatPercent(apiSummary.cacheHitRate)}
            </div>
          </div>
        </div>

        {/* Response Time Percentiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-gray-400 text-sm mb-1">Min Response Time</div>
            <div className="text-xl font-bold text-white">{formatTime(apiSummary.min)}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-gray-400 text-sm mb-1">P95 Response Time</div>
            <div className="text-xl font-bold text-white">{formatTime(apiSummary.p95)}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-gray-400 text-sm mb-1">P99 Response Time</div>
            <div className="text-xl font-bold text-white">{formatTime(apiSummary.p99)}</div>
          </div>
        </div>

        {/* Performance by Endpoint */}
        <div>
          <h4 className="text-md font-semibold text-white mb-3">Performance by Endpoint</h4>
          <div className="space-y-2">
            {Object.entries(apiSummary.byEndpoint)
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 10)
              .map(([endpoint, data]) => (
                <div
                  key={endpoint}
                  className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium truncate">{endpoint}</div>
                    <div className="text-gray-400 text-xs">
                      {data.count} requests • {formatTime(data.average)} avg
                    </div>
                  </div>
                  {data.errors > 0 && (
                    <div className="text-red-400 text-sm font-medium">{data.errors} errors</div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Performance Thresholds */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-400" />
          Performance Thresholds
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">LCP (Largest Contentful Paint)</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-400" style={{ width: '100%' }} />
              </div>
              <span className="text-white text-sm font-medium">Good: &lt;2.5s</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">FID (First Input Delay)</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-400" style={{ width: '100%' }} />
              </div>
              <span className="text-white text-sm font-medium">Good: &lt;100ms</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">CLS (Cumulative Layout Shift)</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-400" style={{ width: '100%' }} />
              </div>
              <span className="text-white text-sm font-medium">Good: &lt;0.1</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-gray-400 text-sm mb-2">API Response Time</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-400" style={{ width: '100%' }} />
              </div>
              <span className="text-white text-sm font-medium">Good: &lt;200ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="glass rounded-xl p-4 border border-blue-500/20 bg-blue-500/5">
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white mb-1">About Performance Monitoring</h4>
            <p className="text-gray-400 text-sm">
              Performance metrics are automatically tracked and reported to Sentry. All metrics are
              stored in memory and reset when the page is refreshed. Export your metrics to keep a
              record of performance over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
