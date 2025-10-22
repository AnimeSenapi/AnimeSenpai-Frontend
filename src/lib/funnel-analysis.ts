'use client'

import { analytics } from './analytics'

interface FunnelStep {
  name: string
  event: string
  properties?: Record<string, any>
  timestamp: number
  userId?: string
  sessionId: string
}

interface FunnelDefinition {
  name: string
  steps: Array<{
    name: string
    event: string
    properties?: Record<string, any>
  }>
  timeWindow: number // milliseconds
}

interface FunnelResult {
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
  timeRange: {
    start: number
    end: number
  }
}

class FunnelAnalyzer {
  private funnels: Map<string, FunnelDefinition> = new Map()
  private userSteps: Map<string, FunnelStep[]> = new Map()

  constructor() {
    this.initializeDefaultFunnels()
    this.setupEventListeners()
  }

  private initializeDefaultFunnels() {
    // Signup Funnel
    this.addFunnel('signup', {
      name: 'User Signup',
      steps: [
        { name: 'Landing Page', event: 'page_view', properties: { page: '/signup' } },
        { name: 'Form Started', event: 'form_start', properties: { form: 'signup' } },
        { name: 'Form Completed', event: 'form_complete', properties: { form: 'signup' } },
        { name: 'Email Verified', event: 'email_verified', properties: { type: 'signup' } },
        { name: 'Profile Created', event: 'profile_created', properties: { source: 'signup' } }
      ],
      timeWindow: 24 * 60 * 60 * 1000 // 24 hours
    })

    // Onboarding Funnel
    this.addFunnel('onboarding', {
      name: 'User Onboarding',
      steps: [
        { name: 'Welcome Page', event: 'page_view', properties: { page: '/onboarding' } },
        { name: 'Preferences Set', event: 'preferences_set', properties: { type: 'onboarding' } },
        { name: 'First List Created', event: 'list_created', properties: { type: 'first' } },
        { name: 'First Anime Added', event: 'anime_added', properties: { type: 'first' } },
        { name: 'Onboarding Complete', event: 'onboarding_complete', properties: {} }
      ],
      timeWindow: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    // Engagement Funnel
    this.addFunnel('engagement', {
      name: 'User Engagement',
      steps: [
        { name: 'App Opened', event: 'app_opened', properties: {} },
        { name: 'Search Performed', event: 'search', properties: {} },
        { name: 'Anime Viewed', event: 'anime_viewed', properties: {} },
        { name: 'List Updated', event: 'list_updated', properties: {} },
        { name: 'Social Interaction', event: 'social_interaction', properties: {} }
      ],
      timeWindow: 30 * 24 * 60 * 60 * 1000 // 30 days
    })

    // Purchase Funnel (for future monetization)
    this.addFunnel('purchase', {
      name: 'Purchase Flow',
      steps: [
        { name: 'Pricing Page', event: 'page_view', properties: { page: '/pricing' } },
        { name: 'Plan Selected', event: 'plan_selected', properties: {} },
        { name: 'Checkout Started', event: 'checkout_started', properties: {} },
        { name: 'Payment Method Added', event: 'payment_method_added', properties: {} },
        { name: 'Purchase Completed', event: 'purchase_completed', properties: {} }
      ],
      timeWindow: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
  }

  private setupEventListeners() {
    // Listen for analytics events and process them for funnel analysis
    if (typeof window !== 'undefined') {
      // This would integrate with the analytics system
      // For now, we'll track events manually
    }
  }

  addFunnel(name: string, definition: FunnelDefinition) {
    this.funnels.set(name, definition)
  }

  trackFunnelStep(funnelName: string, stepName: string, userId?: string, sessionId?: string, properties?: Record<string, any>) {
    const funnel = this.funnels.get(funnelName)
    if (!funnel) return

    const step = funnel.steps.find(s => s.name === stepName)
    if (!step) return

    const funnelStep: FunnelStep = {
      name: stepName,
      event: step.event,
      properties: { ...step.properties, ...properties },
      timestamp: Date.now(),
      userId,
      sessionId: sessionId || this.generateSessionId()
    }

    // Store user's funnel progress
    const userKey = userId || sessionId || 'anonymous'
    if (!this.userSteps.has(userKey)) {
      this.userSteps.set(userKey, [])
    }

    const userSteps = this.userSteps.get(userKey)!
    userSteps.push(funnelStep)

    // Track with analytics
    analytics.track(step.event, {
      funnel: funnelName,
      step: stepName,
      ...funnelStep.properties
    })
  }

  analyzeFunnel(funnelName: string, timeRange?: { start: number; end: number }): FunnelResult | null {
    const funnel = this.funnels.get(funnelName)
    if (!funnel) return null

    const now = Date.now()
    const start = timeRange?.start || (now - funnel.timeWindow)
    const end = timeRange?.end || now

    // Get all users who started the funnel
    const funnelUsers = new Set<string>()
    const stepCounts = new Map<string, number>()
    const stepTimes = new Map<string, number[]>()

    for (const [userKey, steps] of this.userSteps.entries()) {
      const funnelSteps = steps.filter(step => 
        step.timestamp >= start && 
        step.timestamp <= end &&
        step.properties?.funnel === funnelName
      )

      if (funnelSteps.length === 0) continue

      funnelUsers.add(userKey)

      // Count steps
      for (const step of funnelSteps) {
        const stepName = step.name
        stepCounts.set(stepName, (stepCounts.get(stepName) || 0) + 1)

        // Track completion times
        if (stepName === funnel.steps[funnel.steps.length - 1]!.name) {
          const firstStep = funnelSteps[0]!
          const completionTime = step.timestamp - firstStep.timestamp
          if (!stepTimes.has(stepName)) {
            stepTimes.set(stepName, [])
          }
          stepTimes.get(stepName)!.push(completionTime)
        }
      }
    }

    const totalUsers = funnelUsers.size
    if (totalUsers === 0) {
      return {
        funnelName,
        totalUsers: 0,
        stepConversions: [],
        overallConversionRate: 0,
        averageTimeToComplete: 0,
        timeRange: { start, end }
      }
    }

    // Calculate step conversions
    const stepConversions = funnel.steps.map((step, index) => {
      const users = stepCounts.get(step.name) || 0
      const previousUsers = index === 0 ? totalUsers : (stepCounts.get(funnel.steps[index - 1]!.name) || 0)
      const conversionRate = previousUsers > 0 ? (users / previousUsers) * 100 : 0
      const dropoffRate = 100 - conversionRate

      return {
        stepName: step.name,
        users,
        conversionRate,
        dropoffRate
      }
    })

    // Calculate overall conversion rate
    const finalStepUsers = stepCounts.get(funnel.steps[funnel.steps.length - 1]!.name) || 0
    const overallConversionRate = (finalStepUsers / totalUsers) * 100

    // Calculate average time to complete
    const allCompletionTimes = Array.from(stepTimes.values()).flat()
    const averageTimeToComplete = allCompletionTimes.length > 0 
      ? allCompletionTimes.reduce((sum, time) => sum + time, 0) / allCompletionTimes.length
      : 0

    return {
      funnelName,
      totalUsers,
      stepConversions,
      overallConversionRate,
      averageTimeToComplete,
      timeRange: { start, end }
    }
  }

  getAllFunnels(): string[] {
    return Array.from(this.funnels.keys())
  }

  getFunnelDefinition(name: string): FunnelDefinition | undefined {
    return this.funnels.get(name)
  }

  // Helper method to track common funnel steps
  trackSignupStep(step: 'landing' | 'form_start' | 'form_complete' | 'email_verified' | 'profile_created', userId?: string, sessionId?: string) {
    this.trackFunnelStep('signup', step, userId, sessionId)
  }

  trackOnboardingStep(step: 'welcome' | 'preferences_set' | 'first_list' | 'first_anime' | 'complete', userId?: string, sessionId?: string) {
    this.trackFunnelStep('onboarding', step, userId, sessionId)
  }

  trackEngagementStep(step: 'app_opened' | 'search' | 'anime_viewed' | 'list_updated' | 'social', userId?: string, sessionId?: string) {
    this.trackFunnelStep('engagement', step, userId, sessionId)
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }
}

// Global funnel analyzer instance
export const funnelAnalyzer = new FunnelAnalyzer()

// React hook for funnel analysis
export function useFunnelAnalysis() {
  return {
    trackFunnelStep: funnelAnalyzer.trackFunnelStep.bind(funnelAnalyzer),
    trackSignupStep: funnelAnalyzer.trackSignupStep.bind(funnelAnalyzer),
    trackOnboardingStep: funnelAnalyzer.trackOnboardingStep.bind(funnelAnalyzer),
    trackEngagementStep: funnelAnalyzer.trackEngagementStep.bind(funnelAnalyzer),
    analyzeFunnel: funnelAnalyzer.analyzeFunnel.bind(funnelAnalyzer),
    getAllFunnels: funnelAnalyzer.getAllFunnels.bind(funnelAnalyzer)
  }
}

export default funnelAnalyzer
