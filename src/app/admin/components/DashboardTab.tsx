'use client'

import { useEffect, useState } from 'react'
import { apiGetAdminStats } from '../../lib/api'
import { Users, Film, TrendingUp, UserPlus, Database, Shield, Activity } from 'lucide-react'

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

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await apiGetAdminStats()
      setStats(data)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading statistics...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-error-400">Failed to load statistics</div>
      </div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h2>
        <p className="text-gray-400">Quick stats and system overview</p>
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
                <div className={`w-12 h-12 rounded-lg bg-${card.color}-500/10 flex items-center justify-center`}>
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
            <p className="text-2xl font-bold text-blue-400">{stats.users.testers.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.users.testers / stats.users.total) * 100).toFixed(1)}% of total
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Admins</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.users.admins.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.users.admins / stats.users.total) * 100).toFixed(1)}% of total
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary-400" />
          Recent Activity
        </h3>
        <p className="text-gray-400 text-sm">Activity feed coming soon...</p>
      </div>
    </div>
  )
}

