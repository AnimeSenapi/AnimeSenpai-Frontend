'use client'

import { useEffect, useState } from 'react'
import { apiGetAdminStats } from '../../lib/api'
import { LoadingState } from '../../../components/ui/loading-state'
import { ErrorState } from '../../../components/ui/error-state'
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
} from 'lucide-react'
import { Button } from '../../../components/ui/button'

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
    try {
      setLoading(true)
      const data = (await apiGetAdminStats()) as any
      setStats(data)
      setLastRefresh(new Date())
    } catch (error: any) {
      console.error('Failed to load stats:', error)
      // Show user-friendly error message
      if (error.message?.includes('FORBIDDEN') || error.message?.includes('admin')) {
        alert('Access denied. You must be an admin to view this page.')
        window.location.href = '/dashboard'
      }
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

  if (loading) {
    return <LoadingState variant="inline" text="Loading admin statistics..." size="md" />
  }

  if (!stats) {
    return (
      <ErrorState
        variant="inline"
        title="Failed to load statistics"
        message="Unable to fetch admin dashboard data. Please try again."
        onRetry={loadStats}
        showHome={false}
      />
    )
  }

  const statCards = [
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

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h2>
          <p className="text-gray-400">System statistics and health monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <p className="text-gray-400">Last updated</p>
            <p className="text-white font-medium">{lastRefresh.toLocaleTimeString()}</p>
          </div>
          <Button
            onClick={loadStats}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            className={
              autoRefresh
                ? 'bg-primary-500 hover:bg-primary-600'
                : 'border-white/20 text-white hover:bg-white/10'
            }
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto: ON' : 'Auto: OFF'}
          </Button>
        </div>
      </div>

      {/* System Health */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getHealthIcon(systemHealth)}
            <div>
              <h3 className="text-lg font-bold text-white">System Health</h3>
              <p className="text-sm text-gray-400">Overall platform status</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold capitalize ${getHealthColor(systemHealth)}`}>
              {systemHealth}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {systemHealth === 'excellent'
                ? 'All systems operational'
                : systemHealth === 'good'
                  ? 'Running smoothly'
                  : systemHealth === 'fair'
                    ? 'Needs attention'
                    : 'Critical - needs immediate action'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-primary-500/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg bg-${card.color}-500/10 flex items-center justify-center`}
                >
                  <Icon className={`h-6 w-6 text-${card.color}-400`} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-1">{card.value}</p>
                <p className="text-sm font-medium text-gray-300 mb-1">{card.title}</p>
                <p className="text-xs text-gray-500">{card.subtitle}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* User Breakdown */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">User Roles Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Regular Users</p>
            <p className="text-2xl font-bold text-white">{stats.users.regular.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.users.regular / stats.users.total) * 100).toFixed(1)}% of total
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Moderators</p>
            <p className="text-2xl font-bold text-blue-400">
              {stats.users.testers.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.users.testers / stats.users.total) * 100).toFixed(1)}% of total
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Admins</p>
            <p className="text-2xl font-bold text-yellow-400">
              {stats.users.admins.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.users.admins / stats.users.total) * 100).toFixed(1)}% of total
            </p>
          </div>
        </div>
      </div>

      {/* Content Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary-400" />
            Content Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Total Anime</span>
              <span className="text-white font-bold">{stats.content.anime.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">List Entries</span>
              <span className="text-white font-bold">
                {stats.content.listEntries.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Avg. Entries/User</span>
              <span className="text-white font-bold">
                {stats.users.total > 0
                  ? (stats.content.listEntries / stats.users.total).toFixed(1)
                  : '0'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success-400" />
            Growth Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">New Users (7d)</span>
              <span className="text-success-400 font-bold">
                {stats.users.recentSignups.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Growth Rate</span>
              <span className="text-success-400 font-bold">
                {stats.users.total > 0
                  ? ((stats.users.recentSignups / stats.users.total) * 100).toFixed(1)
                  : '0'}
                %
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Feature Flags</span>
              <span className="text-white font-bold">{stats.features.flags}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/30 rounded-lg transition-all group">
            <Users className="h-6 w-6 text-primary-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-white">Manage Users</p>
            <p className="text-xs text-gray-500">{stats.users.total} total</p>
          </button>
          <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-secondary-500/30 rounded-lg transition-all group">
            <Film className="h-6 w-6 text-secondary-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-white">Manage Anime</p>
            <p className="text-xs text-gray-500">{stats.content.anime} total</p>
          </button>
          <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-warning-500/30 rounded-lg transition-all group">
            <Shield className="h-6 w-6 text-warning-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-white">Security</p>
            <p className="text-xs text-gray-500">View logs</p>
          </button>
          <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-success-500/30 rounded-lg transition-all group">
            <Database className="h-6 w-6 text-success-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-white">Settings</p>
            <p className="text-xs text-gray-500">Configure</p>
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary-400" />
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div
              className={`w-10 h-10 rounded-lg bg-${autoRefresh ? 'green' : 'gray'}-500/10 flex items-center justify-center`}
            >
              <Clock className={`h-5 w-5 ${autoRefresh ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Auto-Refresh</p>
              <p className="text-white font-medium">{autoRefresh ? 'Enabled (30s)' : 'Disabled'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Database</p>
              <p className="text-white font-medium">Connected</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">API Status</p>
              <p className="text-white font-medium">Online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
