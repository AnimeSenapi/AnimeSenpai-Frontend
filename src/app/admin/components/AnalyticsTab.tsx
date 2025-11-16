/**
 * Analytics Dashboard
 *
 * Admin dashboard for viewing user analytics and engagement metrics
 */

'use client'

import { useState, useEffect } from 'react'
import { useAnalytics } from '@/hooks/use-analytics'
import {
  BarChart3,
  Users,
  Activity,
  TrendingUp,
  Download,
  Clock,
  Eye,
  MousePointerClick,
  User,
  Target,
  RotateCcw,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState, EmptyState } from '@/components/ui/error-state'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/app/lib/utils'

export function AnalyticsTab() {
  const { enabled, summary, enable, disable, exportData } = useAnalytics()
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

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  const getEngagementColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high':
        return 'text-green-400'
      case 'medium':
        return 'text-yellow-400'
      case 'low':
        return 'text-red-400'
    }
  }

  const getEngagementBgColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high':
        return 'bg-green-500/10 border-green-500/20'
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'low':
        return 'bg-red-500/10 border-red-500/20'
    }
  }

  const handleExport = () => {
    try {
      setIsExporting(true)
      setExportError(null)
              const data = exportData()
      if (!data) {
        throw new Error('No analytics data available to export.')
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `analytics-data-${new Date().toISOString()}.json`
              a.click()
              URL.revokeObjectURL(url)
      addToast({
        title: 'Analytics exported',
        description: 'The analytics data was downloaded as JSON.',
        variant: 'success',
      })
    } catch (error: any) {
      console.error('Failed to export analytics:', error)
      setExportError(error instanceof Error ? error.message || 'Export failed.' : 'Export failed.')
      addToast({
        title: 'Export failed',
        description:
          error instanceof Error ? error.message || 'Unable to export analytics.' : 'Unable to export analytics.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const analyticsUnavailable = !summary

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-primary-500/10 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-3 rounded-xl bg-white/5 px-3 py-1.5 border border-white/10 text-sm text-primary-200">
              <BarChart3 className="h-4 w-4" />
              User Analytics
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-white">Understand Engagement</h2>
              <p className="text-sm text-gray-400">
                Track live sessions, event mix, and privacy-respecting insights.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-sm text-gray-400">Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <Button
              onClick={() => (enabled ? disable() : enable())}
              variant={enabled ? 'default' : 'outline'}
              size="sm"
              className={enabled ? 'bg-primary-500 text-white' : undefined}
            >
              {enabled ? 'Disable Analytics' : 'Enable Analytics'}
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              disabled={isExporting || analyticsUnavailable}
              className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export Data'}</span>
          </Button>
        </div>
      </div>
        {exportError && (
          <div className="mt-4 rounded-xl border border-error-500/20 bg-error-500/10 px-3 py-2 text-xs text-error-200">
            {exportError}
          </div>
        )}
      </header>

      {!summary ? (
        <EmptyState
          icon={<BarChart3 className="h-10 w-10 text-primary-300" />}
          title={enabled ? 'No analytics data yet' : 'Analytics disabled'}
          message={
            enabled
              ? 'Analytics are enabled but no activity has been captured yet. Interact with the site to generate data.'
              : 'Enable analytics to start tracking user interactions and engagement metrics.'
          }
          actionLabel={enabled ? undefined : 'Enable analytics'}
          onAction={enabled ? undefined : enable}
          secondaryActionLabel={enabled ? 'Refresh' : undefined}
          onSecondaryAction={enabled ? () => setLastUpdated(new Date()) : undefined}
        />
      ) : (
        <>
      {/* Session Overview */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary-400" />
          Current Session
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <div className="text-gray-400 text-sm">Duration</div>
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.session ? formatDuration(summary.session.duration) : '0s'}
            </div>
          </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-gray-400" />
              <div className="text-gray-400 text-sm">Page Views</div>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatNumber(summary.session.pageViews)}
            </div>
          </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MousePointerClick className="h-4 w-4 text-gray-400" />
              <div className="text-gray-400 text-sm">Events</div>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatNumber(summary.session.events)}
            </div>
          </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-gray-400" />
              <div className="text-gray-400 text-sm">Engagement</div>
            </div>
            <div className={cn('text-2xl font-bold', getEngagementColor(summary.engagement.level))}>
              {summary.engagement.score}
            </div>
            <div className={cn('text-xs mt-1', getEngagementColor(summary.engagement.level))}>
              {summary.engagement.level.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Score */}
          <div className={cn('rounded-2xl border p-6', getEngagementBgColor(summary.engagement.level))}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Engagement Score</h3>
            <p className="text-gray-400 text-sm">
              Based on session duration, page views, and user interactions
            </p>
          </div>
          <div className="text-right">
            <div className={cn('text-4xl font-bold', getEngagementColor(summary.engagement.level))}>
              {summary.engagement.score}
            </div>
            <div className={cn('text-sm mt-1', getEngagementColor(summary.engagement.level))}>
              {summary.engagement.level.toUpperCase()}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all duration-500', {
                'bg-red-400': summary.engagement.level === 'low',
                'bg-yellow-400': summary.engagement.level === 'medium',
                'bg-green-400': summary.engagement.level === 'high',
              })}
              style={{ width: `${Math.min((summary.engagement.score / 20) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Events by Type */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-400" />
          Events by Type
        </h3>
        <div className="space-y-2">
          {Object.entries(summary.events.byType)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, 10)
            .map(([type, count]) => (
              <div
                key={type}
                className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{type}</div>
                  <div className="text-gray-400 text-xs">
                    {(((count as number) / summary.events.total) * 100).toFixed(1)}% of total events
                  </div>
                </div>
                <div className="text-white text-lg font-bold">{formatNumber(count as number)}</div>
              </div>
            ))}
        </div>
        {Object.keys(summary.events.byType).length === 0 && (
          <div className="text-center py-8 text-gray-400">No events tracked yet</div>
        )}
      </div>

      {/* User Information */}
      {summary.user && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary-400" />
            User Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.user.userId && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-gray-400 text-sm mb-1">User ID</div>
                <div className="text-white font-medium">{summary.user.userId}</div>
              </div>
            )}
            {summary.user.username && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-gray-400 text-sm mb-1">Username</div>
                <div className="text-white font-medium">{summary.user.username}</div>
              </div>
            )}
            {summary.user.role && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-gray-400 text-sm mb-1">Role</div>
                <div className="text-white font-medium capitalize">{summary.user.role}</div>
              </div>
            )}
            {summary.user.signupDate && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-gray-400 text-sm mb-1">Signup Date</div>
                <div className="text-white font-medium">
                  {new Date(summary.user.signupDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="glass rounded-xl p-4 border border-blue-500/20 bg-blue-500/5">
        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white mb-1">Privacy-First Analytics</h4>
            <p className="text-gray-400 text-sm">
              All analytics data is collected with privacy in mind. IP addresses are anonymized, Do
              Not Track is respected, and all data is stored locally. Users can opt out at any time.
              No data is shared with third parties without explicit consent.
            </p>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
