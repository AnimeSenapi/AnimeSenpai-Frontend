'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Search, 
  Eye, 
  Heart, 
  Share2,
  RefreshCw,
  Calendar,
  Activity
} from 'lucide-react'
import { useToast } from '../../../components/ui/toast'

interface AnalyticsData {
  userGrowth: {
    newUsers: number
    totalUsers: number
    growthRate: number
  }
  engagement: {
    activeSessions: number
    totalEvents: number
    averageEventsPerSession: number
  }
  content: {
    popularAnime: Array<{
      animeId: string
      views: number
      likes: number
      shares: number
    }>
    topSearches: Array<{
      query: string
      count: number
      totalResults: number
    }>
    featureUsage: Array<{
      feature: string
      usageCount: number
    }>
  }
  retention: {
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
  }
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const { addToast } = useToast()

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Fetch growth metrics
      const growthResponse = await fetch(`/api/trpc/analytics.getGrowthMetrics?input=${encodeURIComponent(JSON.stringify({ timeRange }))}`)
      const growthData = await growthResponse.json()
      
      // Fetch content analytics
      const contentResponse = await fetch(`/api/trpc/analytics.getContentAnalytics?input=${encodeURIComponent(JSON.stringify({ timeRange }))}`)
      const contentData = await contentResponse.json()
      
      // Fetch engagement metrics
      const engagementResponse = await fetch(`/api/trpc/analytics.getGrowthMetrics?input=${encodeURIComponent(JSON.stringify({ timeRange }))}`)
      const engagementData = await engagementResponse.json()

      setAnalyticsData({
        userGrowth: growthData.result?.data?.metrics?.userGrowth || { newUsers: 0, totalUsers: 0, growthRate: 0 },
        engagement: engagementData.result?.data?.metrics?.engagement || { activeSessions: 0, totalEvents: 0, averageEventsPerSession: 0 },
        content: {
          popularAnime: contentData.result?.data?.analytics?.popularAnime || [],
          topSearches: [], // Would need separate endpoint
          featureUsage: [] // Would need separate endpoint
        },
        retention: {
          dailyActiveUsers: 0,
          weeklyActiveUsers: 0,
          monthlyActiveUsers: 0
        }
      })

      setLastRefresh(new Date())
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      addToast({
        title: 'Failed to fetch analytics data',
        description: 'Please try again later.',
        variant: 'default',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAnalyticsData, 300000)
    return () => clearInterval(interval)
  }, [timeRange])

  if (loading && !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-12 sm:pb-16 relative z-10">
        <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-2">
            User behavior, content performance, and growth metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          <p className="text-sm text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
          <Button 
            onClick={fetchAnalyticsData} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">New Users</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analyticsData?.userGrowth.newUsers || 0}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {analyticsData?.userGrowth.growthRate.toFixed(1)}% growth rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analyticsData?.userGrowth.totalUsers || 0}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              All time users
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analyticsData?.engagement.activeSessions || 0}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {analyticsData?.engagement.averageEventsPerSession.toFixed(1)} avg events/session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Popular Anime
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData?.content.popularAnime.length ? (
              <div className="space-y-3">
                {analyticsData.content.popularAnime.slice(0, 5).map((anime, index) => (
                  <div key={anime.animeId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-300">#{index + 1}</span>
                      <span className="text-white">Anime {anime.animeId}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {anime.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {anime.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        {anime.shares}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No popular anime data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5" />
              Top Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">Search analytics coming soon...</p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Engagement Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {analyticsData?.engagement.totalEvents || 0}
              </div>
              <p className="text-sm text-gray-400">Total Events</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {analyticsData?.engagement.averageEventsPerSession.toFixed(1) || 0}
              </div>
              <p className="text-sm text-gray-400">Avg Events/Session</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {analyticsData?.retention.dailyActiveUsers || 0}
              </div>
              <p className="text-sm text-gray-400">Daily Active Users</p>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  )
}
