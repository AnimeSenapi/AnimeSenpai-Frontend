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
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState, EmptyState } from '@/components/ui/error-state'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/app/lib/utils'

export function PerformanceTab() {
  const { webVitals, apiSummary, enabled, toggleMonitoring, clear, exportData } =
    usePerformanceMonitor()
  const { addToast } = useToast()

  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleExport = () => {
    try {
      setIsExporting(true)
      setExportError(null)
      const data = exportData()
      if (!data) {
        throw new Error('No performance data available to export.')
      }
      const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `performance-metrics-${new Date().toISOString()}.json`
      a.click()
      URL.revokeObjectURL(url)
      addToast({
        title: 'Performance data exported',
        description: 'Performance metrics were downloaded as JSON.',
        variant: 'success',
      })
    } catch (error: any) {
      console.error('Failed to export performance metrics:', error)
      const message =
        error instanceof Error ? error.message || 'Unable to export performance metrics.' : 'Unable to export performance metrics.'
      setExportError(message)
      addToast({
        title: 'Export failed',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

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

  const webVitalMetrics = webVitals?.metrics ?? {}
  const webVitalScores = webVitals?.scores ?? {}
  const webVitalOverall = webVitals?.overall
  const safeApiSummary =
    apiSummary ??
    ({
      total: 0,
      average: 0,
      errorRate: 0,
      cacheHitRate: 0,
      min: 0,
      p95: 0,
      p99: 0,
      byEndpoint: {},
    } as typeof apiSummary)

  const hasWebVitals = Object.keys(webVitalMetrics).length > 0
  const hasApiData = Boolean(apiSummary && apiSummary.total > 0)
  const monitoringDisabled = !enabled
  const showEmptyState = monitoringDisabled || (!hasWebVitals && !hasApiData)
  const canClear = hasWebVitals || hasApiData

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-primary-500/10 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-3 rounded-xl bg-white/5 px-3 py-1.5 border border-white/10 text-sm text-primary-200">
              <Activity className="h-4 w-4" />
              Performance Monitoring
            </div>
        <div>
              <h2 className="text-3xl font-semibold text-white">Keep The App Fast</h2>
              <p className="text-sm text-gray-400">
                Monitor Core Web Vitals and API latency with built-in anonymized tracking.
              </p>
        </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-sm text-gray-400">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <Button
              onClick={() => toggleMonitoring(!enabled)}
            variant={enabled ? 'default' : 'outline'}
            size="sm"
              className={enabled ? 'bg-primary-500 text-white' : undefined}
          >
              {enabled ? 'Disable Monitoring' : 'Enable Monitoring'}
          </Button>
            <Button
              onClick={clear}
              variant="outline"
              size="sm"
              disabled={!canClear}
              className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Clear Metrics</span>
          </Button>
          <Button
              onClick={handleExport}
            variant="outline"
            size="sm"
              disabled={isExporting || (!hasWebVitals && !hasApiData)}
              className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
          >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export Data'}</span>
          </Button>
        </div>
      </div>
      </header>

      {exportError && (
        <div className="rounded-xl border border-error-500/20 bg-error-500/10 px-3 py-2 text-xs text-error-200">
          {exportError}
        </div>
      )}

      {showEmptyState ? (
        <EmptyState
          icon={<Activity className="h-10 w-10 text-primary-300" />}
          title={monitoringDisabled ? 'Performance monitoring is disabled' : 'No performance data yet'}
          message={
            monitoringDisabled
              ? 'Enable monitoring to start collecting performance metrics across the app.'
              : 'We have not collected any performance data yet. Interact with the application or refresh once metrics are captured.'
          }
          actionLabel={monitoringDisabled ? 'Enable monitoring' : undefined}
          onAction={monitoringDisabled ? () => toggleMonitoring(true) : undefined}
          secondaryActionLabel={monitoringDisabled ? undefined : 'Refresh'}
          onSecondaryAction={monitoringDisabled ? undefined : () => setLastUpdated(new Date())}
        />
      ) : (
        <>
      {/* Web Vitals */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary-400" />
          Core Web Vitals
        </h3>
            {hasWebVitals ? (
              <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(webVitalMetrics).map(([key, value]) => {
                    const score = webVitalScores[key as keyof typeof webVitalScores]
            return (
                      <div key={key} className="rounded-xl border border-white/10 bg-white/5 p-4">
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
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Overall Performance</span>
            <div className="flex items-center gap-2">
                      {getScoreIcon(webVitalOverall)}
                      <span className={cn('font-semibold', getScoreColor(webVitalOverall))}>
                        {webVitalOverall ? webVitalOverall.toUpperCase() : 'UNKNOWN'}
              </span>
            </div>
          </div>
        </div>
              </>
            ) : (
              <EmptyState
                variant="simple"
                icon={<Zap className="h-6 w-6 text-primary-300" />}
                title="No web vitals captured yet"
                message="We haven’t collected any Core Web Vitals for this session."
              />
            )}
      </div>

      {/* API Performance */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Server className="h-5 w-5 text-primary-400" />
          API Performance
        </h3>
            {hasApiData ? (
              <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-gray-400 text-sm mb-1">Total Requests</div>
                    <div className="text-2xl font-bold text-white">{safeApiSummary.total}</div>
          </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-gray-400 text-sm mb-1">Avg Response Time</div>
                    <div className="text-2xl font-bold text-white">{formatTime(safeApiSummary.average)}</div>
          </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-gray-400 text-sm mb-1">Error Rate</div>
            <div className="text-2xl font-bold text-red-400">
                      {formatPercent(safeApiSummary.errorRate)}
            </div>
          </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-gray-400 text-sm mb-1">Cache Hit Rate</div>
            <div className="text-2xl font-bold text-green-400">
                      {formatPercent(safeApiSummary.cacheHitRate)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-gray-400 text-sm mb-1">Min Response Time</div>
                    <div className="text-xl font-bold text-white">{formatTime(safeApiSummary.min)}</div>
          </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-gray-400 text-sm mb-1">P95 Response Time</div>
                    <div className="text-xl font-bold text-white">{formatTime(safeApiSummary.p95)}</div>
          </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-gray-400 text-sm mb-1">P99 Response Time</div>
                    <div className="text-xl font-bold text-white">{formatTime(safeApiSummary.p99)}</div>
          </div>
        </div>

        <div>
          <h4 className="text-md font-semibold text-white mb-3">Performance by Endpoint</h4>
          <div className="space-y-2">
                    {Object.entries(safeApiSummary.byEndpoint ?? {})
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 10)
              .map(([endpoint, data]) => (
                <div
                  key={endpoint}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between"
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
                  {Object.keys(safeApiSummary.byEndpoint ?? {}).length === 0 && (
                    <EmptyState
                      variant="simple"
                      icon={<Server className="h-6 w-6 text-primary-300" />}
                      title="No API metrics yet"
                      message="Once API requests are made, their performance will be summarized here."
                    />
                  )}
        </div>
              </>
            ) : (
              <EmptyState
                variant="simple"
                icon={<Server className="h-6 w-6 text-primary-300" />}
                title="No API performance data"
                message="Trigger API requests to populate performance metrics."
              />
            )}
      </div>

      {/* Performance Thresholds */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-400" />
          Performance Thresholds
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-gray-400 text-sm mb-2">LCP (Largest Contentful Paint)</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-400" style={{ width: '100%' }} />
              </div>
              <span className="text-white text-sm font-medium">Good: &lt;2.5s</span>
            </div>
          </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-gray-400 text-sm mb-2">FID (First Input Delay)</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-400" style={{ width: '100%' }} />
              </div>
              <span className="text-white text-sm font-medium">Good: &lt;100ms</span>
            </div>
          </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-gray-400 text-sm mb-2">CLS (Cumulative Layout Shift)</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-400" style={{ width: '100%' }} />
              </div>
              <span className="text-white text-sm font-medium">Good: &lt;0.1</span>
            </div>
          </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
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
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
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
        </>
      )}
    </div>
  )
}
