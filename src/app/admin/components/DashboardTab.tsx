'use client'

import { useEffect, useState } from 'react'
import { apiGetAdminStats } from '../../lib/api'
import { LoadingState } from '../../../components/ui/loading-state'
import { ErrorState, EmptyState } from '../../../components/ui/error-state'
import type { LucideIcon } from 'lucide-react'
import {
  Users,
  Film,
  TrendingUp,
  UserPlus,
  Database,
  Shield,
  Activity,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  LayoutDashboard,
} from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { cn } from '../../../lib/utils'

interface Stats {
  users: {
    total: number
    regular: number
    testers: number
    admins: number
    recentSignups: number
  }
  content: {
    anime: number
    listEntries: number
  }
  features: {
    flags: number
  }
}

export function DashboardTab() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const loadStats = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = (await apiGetAdminStats()) as any
      setStats(data)
      setLastRefresh(new Date())
    } catch (error: any) {
      console.error('Failed to load stats:', error)

      if (error?.message?.includes('FORBIDDEN') || error?.message?.includes('admin')) {
        alert('Access denied. You must be an admin to view this page.')
        window.location.href = '/dashboard'
        return
      }

      setLoadError(
        error instanceof Error
          ? error.message || 'Unable to load overview metrics. Please try again.'
          : 'Unable to load overview metrics. Please try again.'
      )
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  const getSystemHealth = () => {
    if (!stats) return 'unknown'

    const totalUsers = stats.users.total
    const totalAnime = stats.content.anime

    if (totalUsers >= 100 && totalAnime >= 1000) return 'excellent'
    if (totalUsers >= 10 && totalAnime >= 100) return 'good'
    if (totalUsers >= 1 && totalAnime >= 10) return 'fair'
    return 'poor'
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'text-green-400'
      case 'good':
        return 'text-blue-400'
      case 'fair':
        return 'text-yellow-400'
      case 'poor':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'good':
        return <CheckCircle className="h-5 w-5 text-blue-400" />
      case 'fair':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />
      case 'poor':
        return <XCircle className="h-5 w-5 text-red-400" />
      default:
        return <Activity className="h-5 w-5 text-gray-400" />
    }
  }

  const showInitialLoading = loading && !stats && !loadError
  const showError = !loading && Boolean(loadError)
  const showEmpty =
    !loading && !loadError && stats && stats.users.total === 0 && stats.content.anime === 0

  const resolvedErrorMessage =
    loadError || 'Unable to load overview metrics. Please try again later.'

  const colorStyles: Record<
    'primary' | 'success' | 'secondary' | 'warning',
    { bg: string; text: string }
  > = {
    primary: { bg: 'bg-primary-500/15', text: 'text-primary-200' },
    success: { bg: 'bg-success-500/15', text: 'text-success-200' },
    secondary: { bg: 'bg-secondary-500/15', text: 'text-secondary-200' },
    warning: { bg: 'bg-warning-500/15', text: 'text-warning-200' },
  }

  type StatCard = {
    title: string
    value: string
    subtitle: string
    icon: LucideIcon
    color: keyof typeof colorStyles
  }

  if (showInitialLoading) {
    return <LoadingState variant="inline" text="Loading admin statistics..." size="md" />
  }

  if (showError) {
    return (
      <ErrorState
        variant="inline"
        title="Unable to load overview"
        message={resolvedErrorMessage}
        showRetry
        showHome={false}
        onRetry={loadStats}
      />
    )
  }

  if (!stats) {
    return null
  }

  const statCards: StatCard[] = [
    {
      title: 'Total Users',
      value: stats.users.total.toLocaleString(),
      subtitle: `${stats.users.regular} regular users`,
      icon: Users,
      color: 'primary',
    },
    {
      title: 'Recent Signups',
      value: stats.users.recentSignups.toLocaleString(),
      subtitle: 'Last 7 days',
      icon: UserPlus,
      color: 'success',
    },
    {
      title: 'Total Anime',
      value: stats.content.anime.toLocaleString(),
      subtitle: `${stats.content.listEntries.toLocaleString()} list entries`,
      icon: Film,
      color: 'secondary',
    },
    {
      title: 'Moderators',
      value: stats.users.testers.toLocaleString(),
      subtitle: `${stats.users.admins} admins`,
      icon: Shield,
      color: 'warning',
    },
  ]

  const systemHealth = getSystemHealth()

  if (showEmpty) {
    return (
      <EmptyState
        icon={<LayoutDashboard className="h-10 w-10 text-primary-300" />}
        title="No activity yet"
        message="It looks like your platform doesn’t have any data yet."
        suggestions={[
          'Invite users to join and explore the platform',
          'Seed initial content to showcase in the dashboard',
          'Use the quick actions below to start configuring the app',
        ]}
        actionLabel="Refresh"
        onAction={loadStats}
      />
    )
  }

  return (
    <div className="space-y-8">
      <header className="bg-gradient-to-br from-white/5 via-white/0 to-primary-500/10 border border-white/10 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-3 rounded-xl bg-white/5 px-3 py-1.5 border border-white/10 text-sm text-primary-200">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </div>
        <div>
              <h2 className="text-3xl font-semibold text-white">Admin Overview</h2>
              <p className="text-sm text-gray-400">Real-time platform health and growth indicators.</p>
        </div>
          </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-left sm:text-right text-xs sm:text-sm">
              <p className="text-gray-400">Last refreshed</p>
              <p className="text-white font-medium tracking-wide">
                {lastRefresh.toLocaleTimeString()}
              </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadStats}
              variant="outline"
              size="sm"
                className="min-h-[42px] border-white/20 text-white hover:bg-white/10"
              disabled={loading}
            >
                <RefreshCw className={cn('h-4 w-4 sm:mr-2', loading && 'animate-spin')} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              size="sm"
                className={cn(
                  'min-h-[42px] border-white/20 text-white hover:bg-white/10',
                  autoRefresh && 'bg-primary-500/20 border-primary-500/40 text-primary-100 hover:bg-primary-500/30'
                )}
            >
              <Activity className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{autoRefresh ? 'Auto Refresh: On' : 'Auto Refresh: Off'}</span>
                <span className="sm:hidden">{autoRefresh ? 'On' : 'Off'}</span>
            </Button>
          </div>
        </div>
      </div>
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
            {getHealthIcon(systemHealth)}
              </div>
            <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">System Health</p>
                <p className="text-lg font-semibold text-white">Overall platform status</p>
            </div>
          </div>
          <div className="text-right">
              <span className={cn('text-2xl font-semibold capitalize', getHealthColor(systemHealth))}>
              {systemHealth}
              </span>
              <p className="text-xs text-gray-500">
              {systemHealth === 'excellent'
                ? 'All systems operational'
                : systemHealth === 'good'
                  ? 'Running smoothly'
                  : systemHealth === 'fair'
                    ? 'Needs attention'
                      : 'Critical – immediate action required'}
            </p>
          </div>
        </div>
      </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-primary-500/30"
            >
              <div className="flex items-center gap-3">
                <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center border', colorStyles[card.color].bg, 'border-white/10')}>
                  <Icon className={cn('h-6 w-6', colorStyles[card.color].text)} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-semibold text-white truncate">{card.value}</p>
                  <p className="text-sm text-gray-400 truncate">{card.title}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500 leading-relaxed">{card.subtitle}</p>
            </div>
          )
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-300" />
              <h3 className="text-sm font-semibold text-white">User Roles Distribution</h3>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">Live</span>
          </header>
          <div className="space-y-3">
            {[{
              label: 'Regular Users',
              value: stats.users.regular,
              color: 'text-white',
            },
            {
              label: 'Moderators',
              value: stats.users.testers,
              color: 'text-blue-300',
            },
            {
              label: 'Admins',
              value: stats.users.admins,
              color: 'text-yellow-300',
            }].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm text-gray-400">{item.label}</span>
                <span className={cn('text-lg font-semibold', item.color)}>{item.value.toLocaleString()}</span>
            </div>
            ))}
            </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <header className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-primary-300" />
            <h3 className="text-sm font-semibold text-white">Content Metrics</h3>
          </header>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between text-gray-400">
              <span>Total Anime</span>
              <span className="text-white font-medium">{stats.content.anime.toLocaleString()}</span>
            </li>
            <li className="flex items-center justify-between text-gray-400">
              <span>List Entries</span>
              <span className="text-white font-medium">{stats.content.listEntries.toLocaleString()}</span>
            </li>
            <li className="flex items-center justify-between text-gray-400">
              <span>Avg Entries/User</span>
              <span className="text-white font-medium">
                {stats.users.total > 0
                  ? (stats.content.listEntries / stats.users.total).toFixed(1)
                  : '0'}
              </span>
            </li>
          </ul>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <header className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-success-300" />
            <h3 className="text-sm font-semibold text-white">Growth Highlights</h3>
          </header>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-sm text-gray-400">New Users (7d)</span>
              <span className="text-success-300 font-semibold">{stats.users.recentSignups.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-sm text-gray-400">Growth Rate</span>
              <span className="text-success-300 font-semibold">
                {stats.users.total > 0
                  ? `${((stats.users.recentSignups / stats.users.total) * 100).toFixed(1)}%`
                  : '0%'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-sm text-gray-400">Feature Flags</span>
              <span className="text-white font-semibold">{stats.features.flags}</span>
            </div>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <header className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-primary-300" />
            <h3 className="text-sm font-semibold text-white">System Information</h3>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', autoRefresh ? 'bg-green-500/10' : 'bg-gray-500/10')}>
                <Clock className={cn('h-5 w-5', autoRefresh ? 'text-green-400' : 'text-gray-400')} />
            </div>
            <div>
                <p className="text-xs text-gray-400">Auto-Refresh</p>
                <p className="text-sm font-semibold text-white">{autoRefresh ? 'Enabled (30s)' : 'Disabled'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div className="h-10 w-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-primary-300" />
            </div>
            <div>
                <p className="text-xs text-gray-400">Database</p>
                <p className="text-sm font-semibold text-white">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div className="h-10 w-10 rounded-lg bg-success-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success-300" />
            </div>
            <div>
                <p className="text-xs text-gray-400">API Status</p>
                <p className="text-sm font-semibold text-white">Online</p>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <header className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
            <span className="text-xs text-gray-500">Shortcuts</span>
          </header>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Manage Users', subtitle: `${stats.users.total} total`, icon: Users, color: 'text-primary-300' },
              { label: 'Manage Anime', subtitle: `${stats.content.anime} total`, icon: Film, color: 'text-secondary-300' },
              { label: 'Security', subtitle: 'View logs', icon: Shield, color: 'text-warning-300' },
              { label: 'Settings', subtitle: 'Configure', icon: Database, color: 'text-success-300' },
            ].map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  className="group flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-primary-500/30 hover:bg-primary-500/10"
                >
                  <Icon className={cn('h-5 w-5 group-hover:scale-110 transition-transform', action.color)} />
                  <span className="text-sm font-medium text-white">{action.label}</span>
                  <span className="text-xs text-gray-500">{action.subtitle}</span>
                </button>
              )
            })}
        </div>
        </article>
      </section>
    </div>
  )
}
