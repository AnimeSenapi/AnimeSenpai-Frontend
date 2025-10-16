/**
 * Sentry Logger Utility
 * 
 * This file provides a convenient wrapper around Sentry's logging functionality.
 * Use these functions throughout the app for structured logging that will be sent to Sentry.
 * 
 * @example
 * ```typescript
 * import { logger } from '@/lib/logger'
 * 
 * // Log different severity levels
 * logger.trace('Starting database connection', { database: 'users' })
 * logger.debug(logger.fmt`Cache miss for user: ${userId}`)
 * logger.info('Updated profile', { profileId: 345 })
 * logger.warn('Rate limit reached', { endpoint: '/api/results/' })
 * logger.error('Failed to process payment', { orderId: 'order_123', amount: 99.99 })
 * logger.fatal('Database connection pool exhausted', { database: 'users' })
 * ```
 */

import * as Sentry from '@sentry/nextjs'

// Re-export Sentry's logger with proper typing
export const logger = {
  /**
   * Template literal function for bringing variables into structured logs
   * @example logger.fmt`Cache miss for user: ${userId}`
   */
  fmt: Sentry.logger.fmt,

  /**
   * Trace level - Most verbose, use for detailed debugging
   */
  trace: (message: string, context?: Record<string, any>) => {
    Sentry.logger.trace(message, context)
  },

  /**
   * Debug level - Detailed information for debugging
   */
  debug: (message: string, context?: Record<string, any>) => {
    Sentry.logger.debug(message, context)
  },

  /**
   * Info level - General informational messages
   */
  info: (message: string, context?: Record<string, any>) => {
    Sentry.logger.info(message, context)
  },

  /**
   * Warn level - Warning messages for potentially harmful situations
   */
  warn: (message: string, context?: Record<string, any>) => {
    Sentry.logger.warn(message, context)
  },

  /**
   * Error level - Error messages for error events
   */
  error: (message: string, context?: Record<string, any>) => {
    Sentry.logger.error(message, context)
  },

  /**
   * Fatal level - Very severe error events that might cause termination
   */
  fatal: (message: string, context?: Record<string, any>) => {
    Sentry.logger.fatal(message, context)
  },
}

/**
 * Helper function to capture exceptions with additional context
 * @example
 * try {
 *   // risky operation
 * } catch (error) {
 *   captureException(error, { context: { userId, operation: 'update_profile' } })
 * }
 */
export function captureException(error: Error | unknown, options?: {
  context?: Record<string, any>
  tags?: Record<string, string>
  level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'
}) {
  Sentry.captureException(error, {
    level: options?.level || 'error',
    tags: options?.tags,
    contexts: options?.context ? { custom: options.context } : undefined,
  })
}

/**
 * Helper function to capture custom messages
 * @example
 * captureMessage('User completed onboarding', { 
 *   level: 'info',
 *   tags: { flow: 'onboarding' },
 *   context: { userId: user.id }
 * })
 */
export function captureMessage(message: string, options?: {
  context?: Record<string, any>
  tags?: Record<string, string>
  level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'
}) {
  Sentry.captureMessage(message, {
    level: options?.level || 'info',
    tags: options?.tags,
    contexts: options?.context ? { custom: options.context } : undefined,
  })
}

/**
 * Create a span for performance tracking
 * @example
 * await withSpan(
 *   { op: 'http.client', name: 'GET /api/users/123' },
 *   async (span) => {
 *     span.setAttribute('userId', '123')
 *     const result = await fetchUser('123')
 *     return result
 *   }
 * )
 */
export async function withSpan<T>(
  options: { op: string; name: string },
  callback: (span: any) => Promise<T>
): Promise<T> {
  return Sentry.startSpan(options, callback)
}

// Re-export commonly used Sentry functions
export { Sentry }

