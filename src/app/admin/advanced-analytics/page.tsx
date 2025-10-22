'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { 
  TrendingUp, 
  Users, 
  Activity,
  Target,
  Brain,
  Zap,
  Eye,
  MousePointer,
  Clock,
  RefreshCw,
  Calendar
} from 'lucide-react'
import { useToast } from '../../../components/ui/toast'

interface FunnelData {
  funnelName: string
  totalUsers: number
  stepConversions: Array<{
    stepName: string
    users: number
    conversionRate: number
    dropoffRate: number
  }>
  overallConversionRate: number
  averageTimeToComplete: number
}

interface CohortData {
  cohortDate: string
  totalUsers: number
  retention: {
    day1: number
    day7: number
    day30: number
  }
  engagement: {
    averageSessions: number
    averageEvents: number
    averageSessionDuration: number
  }
}

interface ABTestData {
  testId: string
  name: string
  status: string
  variants: Array<{
    variantId: string
    participants: number
    conversionRate: number
    confidence: number
    isWinner: boolean
  }>
  statisticalSignificance: number
  winner?: string
}

interface RUMMetrics {
  pageLoadTime: number
  domContentLoaded: number
  firstByte: number
  slowResources: number
  userInteractions: number
  errors: number
}

export default function AdvancedAnalyticsPage() {
  const [funnelData, setFunnelData] = useState<FunnelData[]>([])
  const [cohortData, setCohortData] = useState<CohortData[]>([])
  const [abTestData, setABTestData] = useState<ABTestData[]>([])
  const [rumMetrics, setRUMMetrics] = useState<RUMMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const { toast } = useToast()

  const fetchAdvancedAnalytics = async () => {
    try {
      setLoading(true)
      
      // Mock data for demonstration
      setFunnelData([
        {
          funnelName: 'User Signup',
          totalUsers: 1250,
          stepConversions: [
            { stepName: 'Landing Page', users: 1250, conversionRate: 100, dropoffRate: 0 },
            { stepName: 'Form Started', users: 980, conversionRate: 78.4, dropoffRate: 21.6 },
            { stepName: 'Form Completed', users: 750, conversionRate: 76.5, dropoffRate: 23.5 },
            { stepName: 'Email Verified', users: 650, conversionRate: 86.7, dropoffRate: 13.3 },
            { stepName: 'Profile Created', users: 580, conversionRate: 89.2, dropoffRate: 10.8 }
          ],
          overallConversionRate: 46.4,
          averageTimeToComplete: 1800000 // 30 minutes
        },
        {
          funnelName: 'User Onboarding',
          totalUsers: 580,
          stepConversions: [
            { stepName: 'Welcome Page', users: 580, conversionRate: 100, dropoffRate: 0 },
            { stepName: 'Preferences Set', users: 520, conversionRate: 89.7, dropoffRate: 10.3 },
            { stepName: 'First List Created', users: 480, conversionRate: 92.3, dropoffRate: 7.7 },
            { stepName: 'First Anime Added', users: 450, conversionRate: 93.8, dropoffRate: 6.2 },
            { stepName: 'Onboarding Complete', users: 420, conversionRate: 93.3, dropoffRate: 6.7 }
          ],
          overallConversionRate: 72.4,
          averageTimeToComplete: 900000 // 15 minutes
        }
      ])

      setCohortData([
        {
          cohortDate: '2024-10-15',
          totalUsers: 150,
          retention: { day1: 85, day7: 65, day30: 45 },
          engagement: { averageSessions: 12, averageEvents: 45, averageSessionDuration: 1800 }
        },
        {
          cohortDate: '2024-10-08',
          totalUsers: 180,
          retention: { day1: 82, day7: 68, day30: 48 },
          engagement: { averageSessions: 14, averageEvents: 52, averageSessionDuration: 2100 }
        },
        {
          cohortDate: '2024-10-01',
          totalUsers: 200,
          retention: { day1: 88, day7: 72, day30: 52 },
          engagement: { averageSessions: 16, averageEvents: 58, averageSessionDuration: 2400 }
        }
      ])

      setABTestData([
        {
          testId: 'homepage-layout',
          name: 'Homepage Layout Optimization',
          status: 'running',
          variants: [
            { variantId: 'control', participants: 500, conversionRate: 12.5, confidence: 95, isWinner: false },
            { variantId: 'variant-a', participants: 250, conversionRate: 15.2, confidence: 98, isWinner: true },
            { variantId: 'variant-b', participants: 250, conversionRate: 11.8, confidence: 92, isWinner: false }
          ],
          statisticalSignificance: 95,
          winner: 'variant-a'
        },
        {
          testId: 'search-experience',
          name: 'Search Experience Optimization',
          status: 'completed',
          variants: [
            { variantId: 'control', participants: 400, conversionRate: 8.5, confidence: 90, isWinner: false },
            { variantId: 'variant-a', participants: 200, conversionRate: 11.2, confidence: 96, isWinner: true },
            { variantId: 'variant-b', participants: 200, conversionRate: 7.8, confidence: 88, isWinner: false }
          ],
          statisticalSignificance: 92,
          winner: 'variant-a'
        }
      ])

      setRUMMetrics({
        pageLoadTime: 2.3,
        domContentLoaded: 1.8,
        firstByte: 0.6,
        slowResources: 12,
        userInteractions: 1250,
        errors: 8
      })

      setLastRefresh(new Date())
    } catch (error) {
      console.error('Failed to fetch advanced analytics:', error)
      toast({
        title: 'Failed to fetch advanced analytics',
        message: 'Please try again later.',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdvancedAnalytics()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAdvancedAnalytics, 300000)
    return () => clearInterval(interval)
  }, [timeRange])

  if (loading && funnelData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading advanced analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Advanced Analytics</h1>
          <p className="text-gray-400 mt-2">
            Funnel analysis, cohort analysis, A/B testing, and real user monitoring
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
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>
          </div>
          <p className="text-sm text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
          <Button 
            onClick={fetchAdvancedAnalytics} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="funnels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="funnels">Funnel Analysis</TabsTrigger>
          <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="ab-tests">A/B Testing</TabsTrigger>
          <TabsTrigger value="rum">Real User Monitoring</TabsTrigger>
        </TabsList>

        {/* Funnel Analysis Tab */}
        <TabsContent value="funnels" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {funnelData.map((funnel, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {funnel.funnelName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Users</span>
                      <span className="text-white font-medium">{funnel.totalUsers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Overall Conversion</span>
                      <span className="text-green-400 font-medium">{funnel.overallConversionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Avg. Time to Complete</span>
                      <span className="text-white font-medium">{Math.round(funnel.averageTimeToComplete / 60000)}m</span>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-300">Step Conversions</h4>
                      {funnel.stepConversions.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">{step.stepName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white">{step.users}</span>
                            <Badge variant={step.conversionRate > 80 ? 'default' : step.conversionRate > 60 ? 'secondary' : 'destructive'}>
                              {step.conversionRate.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Cohort Analysis Tab */}
        <TabsContent value="cohorts" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Retention by Cohort
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-300 py-2">Cohort</th>
                      <th className="text-left text-gray-300 py-2">Users</th>
                      <th className="text-left text-gray-300 py-2">Day 1</th>
                      <th className="text-left text-gray-300 py-2">Day 7</th>
                      <th className="text-left text-gray-300 py-2">Day 30</th>
                      <th className="text-left text-gray-300 py-2">Avg Sessions</th>
                      <th className="text-left text-gray-300 py-2">Avg Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((cohort, index) => (
                      <tr key={index} className="border-b border-gray-700/50">
                        <td className="py-3 text-white">{cohort.cohortDate}</td>
                        <td className="py-3 text-white">{cohort.totalUsers}</td>
                        <td className="py-3">
                          <Badge variant={cohort.retention.day1 > 80 ? 'default' : 'secondary'}>
                            {cohort.retention.day1.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge variant={cohort.retention.day7 > 60 ? 'default' : 'secondary'}>
                            {cohort.retention.day7.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge variant={cohort.retention.day30 > 40 ? 'default' : 'secondary'}>
                            {cohort.retention.day30.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="py-3 text-white">{cohort.engagement.averageSessions}</td>
                        <td className="py-3 text-white">{Math.round(cohort.engagement.averageSessionDuration / 60)}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B Testing Tab */}
        <TabsContent value="ab-tests" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {abTestData.map((test, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    {test.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={test.status === 'running' ? 'default' : 'secondary'}>
                      {test.status}
                    </Badge>
                    {test.winner && (
                      <Badge variant="destructive">Winner: {test.winner}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Statistical Significance</span>
                      <span className="text-white font-medium">{test.statisticalSignificance.toFixed(1)}%</span>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-300">Variants</h4>
                      {test.variants.map((variant, variantIndex) => (
                        <div key={variantIndex} className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">{variant.variantId}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white">{variant.participants} users</span>
                            <Badge variant={variant.isWinner ? 'default' : 'secondary'}>
                              {variant.conversionRate.toFixed(1)}%
                            </Badge>
                            <Badge variant="outline">
                              {variant.confidence.toFixed(0)}% conf
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Real User Monitoring Tab */}
        <TabsContent value="rum" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Page Load Time</CardTitle>
                <Clock className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {rumMetrics?.pageLoadTime.toFixed(1)}s
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Average load time
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">DOM Content Loaded</CardTitle>
                <Zap className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {rumMetrics?.domContentLoaded.toFixed(1)}s
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Interactive time
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">First Byte</CardTitle>
                <Activity className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {rumMetrics?.firstByte.toFixed(1)}s
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Server response time
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Slow Resources</CardTitle>
                <Eye className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {rumMetrics?.slowResources}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Resources &gt; 1s
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">User Interactions</CardTitle>
                <MousePointer className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {rumMetrics?.userInteractions.toLocaleString()}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Total interactions
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">JavaScript Errors</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {rumMetrics?.errors}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Client-side errors
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
