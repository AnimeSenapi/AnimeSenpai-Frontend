'use client'

import { analytics } from './analytics'

interface ABTest {
  id: string
  name: string
  description: string
  variants: Array<{
    id: string
    name: string
    weight: number // percentage (0-100)
    config: Record<string, any>
  }>
  status: 'draft' | 'running' | 'paused' | 'completed'
  startDate: number
  endDate?: number
  targetAudience?: {
    userSegments?: string[]
    userProperties?: Record<string, any>
    trafficPercentage?: number // 0-100
  }
  metrics: Array<{
    name: string
    type: 'conversion' | 'engagement' | 'revenue'
    goal: 'increase' | 'decrease'
  }>
  results?: ABTestResults
}

interface ABTestResults {
  testId: string
  totalParticipants: number
  variants: Array<{
    variantId: string
    participants: number
    conversions: number
    conversionRate: number
    confidence: number
    isWinner: boolean
    metrics: Record<string, number>
  }>
  statisticalSignificance: number
  winner?: string
  recommendation: 'implement' | 'continue' | 'stop'
}

interface ABTestAssignment {
  testId: string
  variantId: string
  userId?: string
  sessionId: string
  assignedAt: number
  metadata?: Record<string, any>
}

class ABTestingFramework {
  private tests: Map<string, ABTest> = new Map()
  private assignments: Map<string, ABTestAssignment> = new Map()
  private userAssignments: Map<string, Map<string, ABTestAssignment>> = new Map()

  constructor() {
    this.initializeDefaultTests()
  }

  private initializeDefaultTests() {
    // Homepage Layout Test
    this.createTest({
      id: 'homepage-layout',
      name: 'Homepage Layout Optimization',
      description: 'Test different homepage layouts for better engagement',
      variants: [
        {
          id: 'control',
          name: 'Current Layout',
          weight: 50,
          config: { layout: 'grid', featuredCount: 6 }
        },
        {
          id: 'variant-a',
          name: 'Featured Focus',
          weight: 25,
          config: { layout: 'featured', featuredCount: 3, showTrending: true }
        },
        {
          id: 'variant-b',
          name: 'List View',
          weight: 25,
          config: { layout: 'list', featuredCount: 8, showGenres: true }
        }
      ],
      metrics: [
        { name: 'homepage_engagement', type: 'engagement', goal: 'increase' },
        { name: 'anime_click_rate', type: 'conversion', goal: 'increase' },
        { name: 'session_duration', type: 'engagement', goal: 'increase' }
      ]
    })

    // Search Experience Test
    this.createTest({
      id: 'search-experience',
      name: 'Search Experience Optimization',
      description: 'Test different search interfaces for better usability',
      variants: [
        {
          id: 'control',
          name: 'Current Search',
          weight: 50,
          config: { type: 'dropdown', suggestions: 5, filters: 'basic' }
        },
        {
          id: 'variant-a',
          name: 'Enhanced Search',
          weight: 25,
          config: { type: 'modal', suggestions: 8, filters: 'advanced' }
        },
        {
          id: 'variant-b',
          name: 'Quick Search',
          weight: 25,
          config: { type: 'inline', suggestions: 3, filters: 'minimal' }
        }
      ],
      metrics: [
        { name: 'search_success_rate', type: 'conversion', goal: 'increase' },
        { name: 'search_time', type: 'engagement', goal: 'decrease' },
        { name: 'search_satisfaction', type: 'engagement', goal: 'increase' }
      ]
    })

    // Recommendation Algorithm Test
    this.createTest({
      id: 'recommendation-algorithm',
      name: 'Recommendation Algorithm',
      description: 'Test different recommendation algorithms',
      variants: [
        {
          id: 'control',
          name: 'Current Algorithm',
          weight: 50,
          config: { algorithm: 'collaborative', factors: ['genre', 'rating', 'popularity'] }
        },
        {
          id: 'variant-a',
          name: 'ML Enhanced',
          weight: 25,
          config: { algorithm: 'ml_enhanced', factors: ['genre', 'rating', 'behavior', 'demographics'] }
        },
        {
          id: 'variant-b',
          name: 'Hybrid Approach',
          weight: 25,
          config: { algorithm: 'hybrid', factors: ['collaborative', 'content_based', 'trending'] }
        }
      ],
      metrics: [
        { name: 'recommendation_click_rate', type: 'conversion', goal: 'increase' },
        { name: 'recommendation_satisfaction', type: 'engagement', goal: 'increase' },
        { name: 'list_additions', type: 'conversion', goal: 'increase' }
      ]
    })
  }

  createTest(test: Omit<ABTest, 'status' | 'startDate'>): ABTest {
    const abTest: ABTest = {
      ...test,
      status: 'draft',
      startDate: Date.now()
    }

    this.tests.set(test.id, abTest)
    return abTest
  }

  startTest(testId: string): boolean {
    const test = this.tests.get(testId)
    if (!test || test.status !== 'draft') return false

    test.status = 'running'
    test.startDate = Date.now()
    this.tests.set(testId, test)
    return true
  }

  stopTest(testId: string): boolean {
    const test = this.tests.get(testId)
    if (!test || test.status !== 'running') return false

    test.status = 'completed'
    test.endDate = Date.now()
    this.tests.set(testId, test)
    return true
  }

  assignUser(testId: string, userId?: string, sessionId?: string): ABTestAssignment | null {
    const test = this.tests.get(testId)
    if (!test || test.status !== 'running') return null

    const userKey = userId || sessionId || 'anonymous'
    const userSessionId = sessionId || this.generateSessionId()

    // Check if user is already assigned to this test
    if (this.userAssignments.has(userKey)) {
      const userTests = this.userAssignments.get(userKey)!
      if (userTests.has(testId)) {
        return userTests.get(testId)!
      }
    }

    // Check traffic percentage
    if (test.targetAudience?.trafficPercentage && Math.random() * 100 > test.targetAudience.trafficPercentage) {
      return null
    }

    // Assign variant based on weights
    const variant = this.selectVariant(test.variants)
    const assignment: ABTestAssignment = {
      testId,
      variantId: variant.id,
      userId,
      sessionId: userSessionId,
      assignedAt: Date.now()
    }

    // Store assignment
    this.assignments.set(`${testId}-${userKey}`, assignment)
    
    if (!this.userAssignments.has(userKey)) {
      this.userAssignments.set(userKey, new Map())
    }
    this.userAssignments.get(userKey)!.set(testId, assignment)

    // Track assignment with analytics
    analytics.track('ab_test_assigned', {
      testId,
      variantId: variant.id,
      userId,
      sessionId: userSessionId
    })

    return assignment
  }

  private selectVariant(variants: ABTest['variants']): ABTest['variants'][0] {
    const random = Math.random() * 100
    let cumulative = 0

    for (const variant of variants) {
      cumulative += variant.weight
      if (random <= cumulative) {
        return variant
      }
    }

    return variants[0]! // Fallback
  }

  getAssignment(testId: string, userId?: string, sessionId?: string): ABTestAssignment | null {
    const userKey = userId || sessionId || 'anonymous'
    return this.assignments.get(`${testId}-${userKey}`) || null
  }

  trackConversion(testId: string, metricName: string, userId?: string, sessionId?: string, value?: number) {
    const assignment = this.getAssignment(testId, userId, sessionId)
    if (!assignment) return

    analytics.track('ab_test_conversion', {
      testId,
      variantId: assignment.variantId,
      metricName,
      value,
      userId,
      sessionId
    })
  }

  analyzeTest(testId: string): ABTestResults | null {
    const test = this.tests.get(testId)
    if (!test) return null

    // This would typically query analytics data
    // For now, we'll return mock results
    const results: ABTestResults = {
      testId,
      totalParticipants: 1000,
      variants: test.variants.map(variant => ({
        variantId: variant.id,
        participants: Math.floor(Math.random() * 500) + 100,
        conversions: Math.floor(Math.random() * 50) + 10,
        conversionRate: Math.random() * 20 + 5,
        confidence: Math.random() * 30 + 70,
        isWinner: Math.random() > 0.5,
        metrics: {
          engagement: Math.random() * 100,
          satisfaction: Math.random() * 5 + 3
        }
      })),
      statisticalSignificance: Math.random() * 20 + 80,
      winner: test.variants[Math.floor(Math.random() * test.variants.length)]!.id,
      recommendation: 'implement'
    }

    test.results = results
    this.tests.set(testId, test)

    return results
  }

  getTest(testId: string): ABTest | undefined {
    return this.tests.get(testId)
  }

  getAllTests(): ABTest[] {
    return Array.from(this.tests.values())
  }

  getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(test => test.status === 'running')
  }

  // Helper methods for common test scenarios
  isUserInTest(testId: string, userId?: string, sessionId?: string): boolean {
    return this.getAssignment(testId, userId, sessionId) !== null
  }

  getVariantConfig(testId: string, userId?: string, sessionId?: string): Record<string, any> | null {
    const assignment = this.getAssignment(testId, userId, sessionId)
    if (!assignment) return null

    const test = this.tests.get(testId)
    if (!test) return null

    const variant = test.variants.find(v => v.id === assignment.variantId)
    return variant?.config || null
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }
}

// Global A/B testing framework instance
export const abTesting = new ABTestingFramework()

// React hook for A/B testing
export function useABTesting() {
  return {
    assignUser: abTesting.assignUser.bind(abTesting),
    getAssignment: abTesting.getAssignment.bind(abTesting),
    trackConversion: abTesting.trackConversion.bind(abTesting),
    isUserInTest: abTesting.isUserInTest.bind(abTesting),
    getVariantConfig: abTesting.getVariantConfig.bind(abTesting),
    getTest: abTesting.getTest.bind(abTesting),
    getAllTests: abTesting.getAllTests.bind(abTesting),
    getActiveTests: abTesting.getActiveTests.bind(abTesting)
  }
}

export default abTesting
