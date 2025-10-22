'use client'

import { analytics } from './analytics'

interface CohortData {
  cohortDate: string // YYYY-MM-DD format
  totalUsers: number
  retention: {
    day1: number
    day3: number
    day7: number
    day14: number
    day30: number
    day90: number
  }
  engagement: {
    averageSessions: number
    averageEvents: number
    averageSessionDuration: number
  }
  revenue?: {
    totalRevenue: number
    averageRevenuePerUser: number
    conversionRate: number
  }
}

interface CohortAnalysisResult {
  cohorts: CohortData[]
  summary: {
    averageRetention: {
      day1: number
      day7: number
      day30: number
    }
    bestPerformingCohort: string
    worstPerformingCohort: string
    trend: 'improving' | 'declining' | 'stable'
  }
}

class CohortAnalyzer {
  private userCohorts: Map<string, string> = new Map() // userId -> cohortDate
  private userActivity: Map<string, Array<{ date: string; events: number; sessions: number; duration: number }>> = new Map()

  constructor() {
    this.initializeCohortTracking()
  }

  private initializeCohortTracking() {
    // Track user signup dates and activity
    if (typeof window !== 'undefined') {
      // This would integrate with the analytics system
      // For now, we'll track cohorts manually
    }
  }

  // Track user cohort assignment
  trackUserCohort(userId: string, signupDate: string) {
    this.userCohorts.set(userId, signupDate)
    
    // Track cohort assignment with analytics
    analytics.track('cohort_assigned', {
      userId,
      cohortDate: signupDate,
      cohortWeek: this.getCohortWeek(signupDate)
    })
  }

  // Track user activity for cohort analysis
  trackUserActivity(userId: string, date: string, events: number, sessions: number, duration: number) {
    if (!this.userActivity.has(userId)) {
      this.userActivity.set(userId, [])
    }

    const activity = this.userActivity.get(userId)!
    const existingEntry = activity.find(entry => entry.date === date)
    
    if (existingEntry) {
      existingEntry.events += events
      existingEntry.sessions += sessions
      existingEntry.duration += duration
    } else {
      activity.push({ date, events, sessions, duration })
    }
  }

  // Analyze cohorts for a specific time period
  analyzeCohorts(startDate: string, endDate: string): CohortAnalysisResult {
    const cohorts = this.generateCohortData(startDate, endDate)
    
    return {
      cohorts,
      summary: this.calculateSummary(cohorts)
    }
  }

  private generateCohortData(startDate: string, endDate: string): CohortData[] {
    const cohortDates = this.getCohortDates(startDate, endDate)
    const cohorts: CohortData[] = []

    for (const cohortDate of cohortDates) {
      const cohortUsers = this.getCohortUsers(cohortDate)
      const retention = this.calculateRetention(cohortDate, cohortUsers)
      const engagement = this.calculateEngagement(cohortDate, cohortUsers)
      
      cohorts.push({
        cohortDate,
        totalUsers: cohortUsers.length,
        retention,
        engagement
      })
    }

    return cohorts
  }

  private getCohortDates(startDate: string, endDate: string): string[] {
    const dates: string[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 7)) {
      dates.push(date.toISOString().split('T')[0]!)
    }
    
    return dates
  }

  private getCohortUsers(cohortDate: string): string[] {
    const users: string[] = []
    
    for (const [userId, userCohortDate] of this.userCohorts.entries()) {
      if (userCohortDate === cohortDate) {
        users.push(userId)
      }
    }
    
    return users
  }

  private calculateRetention(cohortDate: string, users: string[]): CohortData['retention'] {
    const cohortStartDate = new Date(cohortDate)
    const retention = {
      day1: 0,
      day3: 0,
      day7: 0,
      day14: 0,
      day30: 0,
      day90: 0
    }

    for (const userId of users) {
      const activity = this.userActivity.get(userId) || []
      
      // Check retention at different intervals
      const day1Date = new Date(cohortStartDate.getTime() + 24 * 60 * 60 * 1000)
      const day3Date = new Date(cohortStartDate.getTime() + 3 * 24 * 60 * 60 * 1000)
      const day7Date = new Date(cohortStartDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      const day14Date = new Date(cohortStartDate.getTime() + 14 * 24 * 60 * 60 * 1000)
      const day30Date = new Date(cohortStartDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      const day90Date = new Date(cohortStartDate.getTime() + 90 * 24 * 60 * 60 * 1000)

      if (this.hasActivityAfter(activity, day1Date)) retention.day1++
      if (this.hasActivityAfter(activity, day3Date)) retention.day3++
      if (this.hasActivityAfter(activity, day7Date)) retention.day7++
      if (this.hasActivityAfter(activity, day14Date)) retention.day14++
      if (this.hasActivityAfter(activity, day30Date)) retention.day30++
      if (this.hasActivityAfter(activity, day90Date)) retention.day90++
    }

    // Convert to percentages
    const totalUsers = users.length
    if (totalUsers > 0) {
      retention.day1 = (retention.day1 / totalUsers) * 100
      retention.day3 = (retention.day3 / totalUsers) * 100
      retention.day7 = (retention.day7 / totalUsers) * 100
      retention.day14 = (retention.day14 / totalUsers) * 100
      retention.day30 = (retention.day30 / totalUsers) * 100
      retention.day90 = (retention.day90 / totalUsers) * 100
    }

    return retention
  }

  private hasActivityAfter(activity: Array<{ date: string; events: number; sessions: number; duration: number }>, afterDate: Date): boolean {
    return activity.some(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= afterDate && (entry.events > 0 || entry.sessions > 0)
    })
  }

  private calculateEngagement(cohortDate: string, users: string[]): CohortData['engagement'] {
    let totalSessions = 0
    let totalEvents = 0
    let totalDuration = 0
    let activeUsers = 0

    for (const userId of users) {
      const activity = this.userActivity.get(userId) || []
      
      if (activity.length > 0) {
        activeUsers++
        totalSessions += activity.reduce((sum, entry) => sum + entry.sessions, 0)
        totalEvents += activity.reduce((sum, entry) => sum + entry.events, 0)
        totalDuration += activity.reduce((sum, entry) => sum + entry.duration, 0)
      }
    }

    return {
      averageSessions: activeUsers > 0 ? totalSessions / activeUsers : 0,
      averageEvents: activeUsers > 0 ? totalEvents / activeUsers : 0,
      averageSessionDuration: activeUsers > 0 ? totalDuration / activeUsers : 0
    }
  }

  private calculateSummary(cohorts: CohortData[]): CohortAnalysisResult['summary'] {
    if (cohorts.length === 0) {
      return {
        averageRetention: { day1: 0, day7: 0, day30: 0 },
        bestPerformingCohort: '',
        worstPerformingCohort: '',
        trend: 'stable'
      }
    }

    // Calculate average retention
    const averageRetention = {
      day1: cohorts.reduce((sum, cohort) => sum + cohort.retention.day1, 0) / cohorts.length,
      day7: cohorts.reduce((sum, cohort) => sum + cohort.retention.day7, 0) / cohorts.length,
      day30: cohorts.reduce((sum, cohort) => sum + cohort.retention.day30, 0) / cohorts.length
    }

    // Find best and worst performing cohorts
    const sortedByRetention = [...cohorts].sort((a, b) => b.retention.day7 - a.retention.day7)
    const bestPerformingCohort = sortedByRetention[0]?.cohortDate || ''
    const worstPerformingCohort = sortedByRetention[sortedByRetention.length - 1]?.cohortDate || ''

    // Calculate trend
    const recentCohorts = cohorts.slice(-3)
    const olderCohorts = cohorts.slice(-6, -3)
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable'
    if (recentCohorts.length >= 2 && olderCohorts.length >= 2) {
      const recentAvg = recentCohorts.reduce((sum, cohort) => sum + cohort.retention.day7, 0) / recentCohorts.length
      const olderAvg = olderCohorts.reduce((sum, cohort) => sum + cohort.retention.day7, 0) / olderCohorts.length
      
      if (recentAvg > olderAvg * 1.1) trend = 'improving'
      else if (recentAvg < olderAvg * 0.9) trend = 'declining'
    }

    return {
      averageRetention,
      bestPerformingCohort,
      worstPerformingCohort,
      trend
    }
  }

  private getCohortWeek(date: string): string {
    const d = new Date(date)
    const year = d.getFullYear()
    const week = Math.ceil(((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7)
    return `${year}-W${week.toString().padStart(2, '0')}`
  }

  // Get cohort data for a specific user
  getUserCohort(userId: string): string | undefined {
    return this.userCohorts.get(userId)
  }

  // Get all cohorts
  getAllCohorts(): string[] {
    return Array.from(new Set(this.userCohorts.values())).sort()
  }
}

// Global cohort analyzer instance
export const cohortAnalyzer = new CohortAnalyzer()

// React hook for cohort analysis
export function useCohortAnalysis() {
  return {
    trackUserCohort: cohortAnalyzer.trackUserCohort.bind(cohortAnalyzer),
    trackUserActivity: cohortAnalyzer.trackUserActivity.bind(cohortAnalyzer),
    analyzeCohorts: cohortAnalyzer.analyzeCohorts.bind(cohortAnalyzer),
    getUserCohort: cohortAnalyzer.getUserCohort.bind(cohortAnalyzer),
    getAllCohorts: cohortAnalyzer.getAllCohorts.bind(cohortAnalyzer)
  }
}

export default cohortAnalyzer
