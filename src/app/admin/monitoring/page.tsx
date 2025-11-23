'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  Database, 
  RefreshCw, 
  TrendingUp,
  Server,
  Zap
} from 'lucide-react'
import { useToast } from '../../../components/ui/toast'

interface SystemStatus {
  timestamp: number
  uptime: number
  memory: {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
  }
  errorRate: number
  totalErrors: number
  totalRequests: number
  slowQueries: number
  averageQueryDuration: number
  health: {
    database: string
    redis: string
    api: string
  }
}

interface ErrorMetrics {
  errorRate: number
  totalErrors: number
  totalRequests: number
  timeWindow: number
}

interface QueryStats {
  totalQueries: number
  slowQueries: number
  averageDuration: number
  slowestQuery: any
  topSlowQueries: Array<{
    query: string
    count: number
    avgDuration: number
  }>
}

export default function MonitoringPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [errorMetrics, setErrorMetrics] = useState<ErrorMetrics | null>(null)
  const [queryStats, setQueryStats] = useState<QueryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const { addToast } = useToast()

  const fetchMonitoringData = async () => {
    try {
      setLoading(true)
      
      // Fetch system status
      const statusResponse = await fetch('/api/trpc/monitoring.getSystemStatus')
      const statusData = await statusResponse.json()
      
      if (statusData.result?.data?.success) {
        setSystemStatus(statusData.result.data.status)
      }

      // Fetch error metrics
      const errorResponse = await fetch('/api/trpc/monitoring.getErrorMetrics')
      const errorData = await errorResponse.json()
      
      if (errorData.result?.data?.success) {
        setErrorMetrics(errorData.result.data.metrics)
      }

      // Fetch query stats
      const queryResponse = await fetch('/api/trpc/monitoring.getQueryStats')
      const queryData = await queryResponse.json()
      
      if (queryData.result?.data?.success) {
        setQueryStats(queryData.result.data.stats)
      }

      setLastRefresh(new Date())
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error)
      addToast({
        title: 'Failed to fetch monitoring data',
        description: 'Please try again later.',
        variant: 'default',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonitoringData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMonitoringData, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getHealthBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      unhealthy: 'destructive'
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    )
  }

  if (loading && !systemStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading monitoring data...</p>
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
          <h1 className="text-3xl font-bold text-white">System Monitoring</h1>
          <p className="text-gray-400 mt-2">
            Real-time system health and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
          <Button 
            onClick={fetchMonitoringData} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Uptime</CardTitle>
            <Server className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {systemStatus ? formatUptime(systemStatus.uptime) : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {errorMetrics ? `${errorMetrics.errorRate.toFixed(2)}%` : 'N/A'}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {errorMetrics ? `${errorMetrics.totalErrors}/${errorMetrics.totalRequests} requests` : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {systemStatus ? formatBytes(systemStatus.memory.heapUsed) : 'N/A'}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {systemStatus ? `Total: ${formatBytes(systemStatus.memory.heapTotal)}` : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Slow Queries</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {queryStats ? queryStats.slowQueries : 'N/A'}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {queryStats ? `Avg: ${queryStats.averageDuration.toFixed(0)}ms` : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Health Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Database</span>
              {systemStatus ? getHealthBadge(systemStatus.health.database) : <Badge>Unknown</Badge>}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Redis</span>
              {systemStatus ? getHealthBadge(systemStatus.health.redis) : <Badge>Unknown</Badge>}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">API</span>
              {systemStatus ? getHealthBadge(systemStatus.health.api) : <Badge>Unknown</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Query Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {queryStats ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Queries</span>
                  <span className="text-white font-medium">{queryStats.totalQueries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Slow Queries</span>
                  <span className="text-white font-medium">{queryStats.slowQueries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Average Duration</span>
                  <span className="text-white font-medium">{queryStats.averageDuration.toFixed(0)}ms</span>
                </div>
                {queryStats.topSlowQueries.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Top Slow Queries</h4>
                    <div className="space-y-2">
                      {queryStats.topSlowQueries.slice(0, 3).map((query, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-gray-400 truncate max-w-[200px]">{query.query}</span>
                          <span className="text-white">{query.avgDuration.toFixed(0)}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">No query data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Error Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorMetrics ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Error Rate</span>
                  <span className={`font-medium ${errorMetrics.errorRate > 5 ? 'text-red-400' : 'text-green-400'}`}>
                    {errorMetrics.errorRate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Errors</span>
                  <span className="text-white font-medium">{errorMetrics.totalErrors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Requests</span>
                  <span className="text-white font-medium">{errorMetrics.totalRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Time Window</span>
                  <span className="text-white font-medium">{errorMetrics.timeWindow} minutes</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No error data available</p>
            )}
          </CardContent>
        </Card>
      </div>
        </div>
      </div>
    </div>
  )
}
