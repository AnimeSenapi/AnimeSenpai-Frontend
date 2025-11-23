'use client'

export const dynamic = 'force-dynamic'

import React from 'react'
import { PerformanceDashboard } from '../../components/PerformanceDashboard'
import { usePerformance } from '../../hooks/use-performance'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Settings,
  BarChart3,
  Cpu,
  Wifi,
  HardDrive
} from 'lucide-react'

export default function PerformancePage() {
  const {
    metrics,
    isLoading,
    optimizations,
    score,
    applyOptimizations
  } = usePerformance({
    enableMonitoring: true,
    enableOptimization: true,
    enableCaching: true,
    enableLazyLoading: true,
    enablePrefetching: true,
    enableCompression: true,
    enableMemoization: true,
    enableDebouncing: true,
    enableThrottling: true
  })

  const handleApplyOptimizations = () => {
    applyOptimizations()
    // Show success message
    console.log('Optimizations applied successfully!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-violet-500" />
            <span className="ml-3 text-lg text-gray-300">Loading performance data...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Performance Dashboard</h1>
          <p className="text-gray-400">
            Monitor and optimize your application's performance in real-time
          </p>
        </div>

        {/* Performance Score Card */}
        <Card className="mb-8 border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-violet-700">
              <BarChart3 className="h-6 w-6" />
              Overall Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`text-6xl font-bold ${
                  score >= 90 ? 'text-green-500' : 
                  score >= 70 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {score}
                </div>
                <div>
                  <div className="text-lg text-gray-600">Performance Score</div>
                  <Badge className={`${
                    score >= 90 ? 'bg-green-500' : 
                    score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  } text-white text-lg px-4 py-2`}>
                    {score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-2">Quick Actions</div>
                <Button onClick={handleApplyOptimizations} className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Apply Optimizations
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Web Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">LCP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <span className="text-3xl font-bold text-blue-700">{metrics.lcp.toFixed(0)}ms</span>
              </div>
              <div className="text-xs text-blue-600 mt-1">Largest Contentful Paint</div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.lcp < 2500 ? 'Good' : metrics.lcp < 4000 ? 'Needs Improvement' : 'Poor'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">FID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
                <span className="text-3xl font-bold text-yellow-700">{metrics.fid.toFixed(0)}ms</span>
              </div>
              <div className="text-xs text-yellow-600 mt-1">First Input Delay</div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.fid < 100 ? 'Good' : metrics.fid < 300 ? 'Needs Improvement' : 'Poor'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">CLS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold text-green-700">{metrics.cls.toFixed(3)}</span>
              </div>
              <div className="text-xs text-green-600 mt-1">Cumulative Layout Shift</div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.cls < 0.1 ? 'Good' : metrics.cls < 0.25 ? 'Needs Improvement' : 'Poor'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">FCP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-purple-500" />
                <span className="text-3xl font-bold text-purple-700">{metrics.fcp.toFixed(0)}ms</span>
              </div>
              <div className="text-xs text-purple-600 mt-1">First Contentful Paint</div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.fcp < 1800 ? 'Good' : metrics.fcp < 3000 ? 'Needs Improvement' : 'Poor'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Memory Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold text-orange-700">{metrics.memory.used.toFixed(1)}MB</span>
              </div>
              <div className="text-xs text-orange-600 mt-1">
                {((metrics.memory.used / metrics.memory.limit) * 100).toFixed(1)}% of limit
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${(metrics.memory.used / metrics.memory.limit) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold text-blue-700">{metrics.network.effectiveType.toUpperCase()}</span>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {metrics.network.downlink}Mbps • {metrics.network.rtt}ms RTT
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">CPU Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold text-red-700">{metrics.tbt.toFixed(0)}ms</span>
              </div>
              <div className="text-xs text-red-600 mt-1">Total Blocking Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Optimization Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimizations.map((optimization, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{optimization}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-4">
              <Button onClick={handleApplyOptimizations} className="flex-1">
                <Zap className="h-4 w-4 mr-2" />
                Apply All Optimizations
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Dashboard Component */}
        <PerformanceDashboard />
      </div>
    </div>
  )
}
