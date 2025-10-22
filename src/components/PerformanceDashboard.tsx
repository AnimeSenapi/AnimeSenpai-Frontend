'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  BarChart3,
  Cpu,
  Wifi,
  HardDrive
} from 'lucide-react'

interface PerformanceMetrics {
  lcp: number
  fid: number
  cls: number
  ttfb: number
  fcp: number
  tbt: number
  si: number
  memory: {
    used: number
    total: number
    limit: number
  }
  network: {
    effectiveType: string
    downlink: number
    rtt: number
  }
  score: number
}

interface PerformanceDashboardProps {
  className?: string
}

export function PerformanceDashboard({ className }: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    fcp: 0,
    tbt: 0,
    si: 0,
    memory: { used: 0, total: 0, limit: 0 },
    network: { effectiveType: 'unknown', downlink: 0, rtt: 0 },
    score: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<string[]>([])

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        // Simulate loading performance metrics
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock metrics - in real implementation, these would come from the performance optimizer
        const mockMetrics: PerformanceMetrics = {
          lcp: 1200,
          fid: 45,
          cls: 0.05,
          ttfb: 180,
          fcp: 800,
          tbt: 120,
          si: 950,
          memory: {
            used: 45.2,
            total: 67.8,
            limit: 100
          },
          network: {
            effectiveType: '4g',
            downlink: 10,
            rtt: 50
          },
          score: 92
        }
        
        setMetrics(mockMetrics)
        setRecommendations([
          'Optimize image loading for better LCP',
          'Reduce JavaScript bundle size',
          'Enable service worker caching',
          'Implement code splitting for non-critical features'
        ])
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load performance metrics:', error)
        setIsLoading(false)
      }
    }

    loadMetrics()
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatMetric = (value: number, unit: string = 'ms') => {
    if (unit === 'ms') return `${value.toFixed(0)}ms`
    if (unit === 'score') return `${value}/100`
    return value.toFixed(2)
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Score */}
      <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-violet-700">
            <BarChart3 className="h-5 w-5" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold ${getScoreColor(metrics.score)}`}>
                {metrics.score}
              </div>
              <div>
                <div className="text-sm text-gray-600">Overall Performance</div>
                <Badge className={`${getScoreBadge(metrics.score)} text-white`}>
                  {metrics.score >= 90 ? 'Excellent' : metrics.score >= 70 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
            </div>
            <div className="w-32">
              <Progress value={metrics.score} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">LCP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{formatMetric(metrics.lcp)}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Largest Contentful Paint</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">FID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-2xl font-bold">{formatMetric(metrics.fid)}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">First Input Delay</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">CLS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{formatMetric(metrics.cls, 'score')}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Cumulative Layout Shift</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">FCP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="text-2xl font-bold">{formatMetric(metrics.fcp)}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">First Contentful Paint</div>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-orange-500" />
              <span className="text-lg font-bold">{metrics.memory.used.toFixed(1)}MB</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {((metrics.memory.used / metrics.memory.limit) * 100).toFixed(1)}% of limit
            </div>
            <Progress 
              value={(metrics.memory.used / metrics.memory.limit) * 100} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-blue-500" />
              <span className="text-lg font-bold">{metrics.network.effectiveType.toUpperCase()}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.network.downlink}Mbps • {metrics.network.rtt}ms RTT
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-red-500" />
              <span className="text-lg font-bold">{formatMetric(metrics.tbt)}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Total Blocking Time</div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{recommendation}</span>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full" variant="outline">
            Apply Optimizations
          </Button>
        </CardContent>
      </Card>

      {/* Performance History */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Performance history will be displayed here</p>
            <p className="text-sm">Track your performance improvements over time</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PerformanceDashboard
