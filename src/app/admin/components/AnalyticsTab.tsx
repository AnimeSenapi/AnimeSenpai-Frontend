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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/app/lib/utils'

export function AnalyticsTab() {
  const { enabled, summary, enable, disable, exportData } = useAnalytics()

  const [lastUpdated, setLastUpdated] = useState(new Date())

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary-400" />
            User Analytics
          </h2>
          <p className="text-gray-400 text-sm mt-1">User behavior, engagement, and feature usage</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button
            variant={enabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => (enabled ? disable() : enable())}
          >
            {enabled ? 'Analytics Enabled' : 'Analytics Disabled'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const data = exportData()
              const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `analytics-data-${new Date().toISOString()}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Session Overview */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary-400" />
          Current Session
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <div className="text-gray-400 text-sm">Duration</div>
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.session ? formatDuration(summary.session.duration) : '0s'}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-gray-400" />
              <div className="text-gray-400 text-sm">Page Views</div>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatNumber(summary.session.pageViews)}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <MousePointerClick className="h-4 w-4 text-gray-400" />
              <div className="text-gray-400 text-sm">Events</div>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatNumber(summary.session.events)}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
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
      <div
        className={cn(
          'glass rounded-xl p-6 border-2',
          getEngagementBgColor(summary.engagement.level)
        )}
      >
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
    </div>
  )
}
