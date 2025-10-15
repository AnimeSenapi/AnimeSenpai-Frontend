/**
 * Centralized Error Handling Service
 * Provides consistent error handling, logging, and user-friendly messages
 */

import * as Sentry from '@sentry/nextjs'

export enum ErrorType {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Auth errors
  AUTH_ERROR = 'AUTH_ERROR',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // API errors
  API_ERROR = 'API_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  
  // Client errors
  RENDER_ERROR = 'RENDER_ERROR',
  STATE_ERROR = 'STATE_ERROR',
  
  // Data errors
  DATA_ERROR = 'DATA_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  
  // Generic
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  type: ErrorType
  message: string
  originalError?: Error | unknown
  statusCode?: number
  timestamp: Date
  context?: Record<string, any>
  userMessage?: string
  stack?: string
}

class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: AppError[] = []
  private maxLogSize = 50

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Create a structured error
   */
  createError(
    type: ErrorType,
    message: string,
    originalError?: Error | unknown,
    context?: Record<string, any>
  ): AppError {
    const appError: AppError = {
      type,
      message,
      originalError,
      timestamp: new Date(),
      context,
      userMessage: this.getUserFriendlyMessage(type, message),
    }

    // Extract status code if available
    if (originalError && typeof originalError === 'object' && 'statusCode' in originalError) {
      appError.statusCode = (originalError as { statusCode: number }).statusCode
    }

    // Log the error
    this.logError(appError)

    return appError
  }

  /**
   * Handle different types of errors and convert to AppError
   */
  handleError(error: unknown, context?: Record<string, any>): AppError {
    // Already an AppError
    if (this.isAppError(error)) {
      return error
    }

    // Network/fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return this.createError(
        ErrorType.NETWORK_ERROR,
        'Failed to connect to server',
        error,
        context
      )
    }

    // Standard Error objects
    if (error instanceof Error) {
      // Auth errors
      if (error.message.includes('auth') || error.message.includes('token') || error.message.includes('unauthorized')) {
        return this.createError(ErrorType.AUTH_ERROR, error.message, error, context)
      }

      // API errors
      if (error.message.includes('API') || error.message.includes('endpoint')) {
        return this.createError(ErrorType.API_ERROR, error.message, error, context)
      }

      // Parse/data errors
      if (error.message.includes('parse') || error.message.includes('JSON')) {
        return this.createError(ErrorType.PARSE_ERROR, error.message, error, context)
      }

      // Generic error
      return this.createError(ErrorType.UNKNOWN_ERROR, error.message, error, context)
    }

    // Unknown error type
    return this.createError(
      ErrorType.UNKNOWN_ERROR,
      'An unexpected error occurred',
      error,
      context
    )
  }

  /**
   * Get user-friendly error messages
   */
  private getUserFriendlyMessage(type: ErrorType, originalMessage: string): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.NETWORK_ERROR]: 'Unable to connect. Please check your internet connection.',
      [ErrorType.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
      [ErrorType.AUTH_ERROR]: 'Authentication failed. Please sign in again.',
      [ErrorType.TOKEN_EXPIRED]: 'Your session has expired. Please sign in again.',
      [ErrorType.UNAUTHORIZED]: 'You don\'t have permission to do that.',
      [ErrorType.API_ERROR]: 'We couldn\'t complete your request. Please try again.',
      [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
      [ErrorType.VALIDATION_ERROR]: 'Please check your input and try again.',
      [ErrorType.SERVER_ERROR]: 'Our servers are having issues. Please try again later.',
      [ErrorType.RENDER_ERROR]: 'We had trouble displaying this page.',
      [ErrorType.STATE_ERROR]: 'Something went wrong. Please refresh the page.',
      [ErrorType.DATA_ERROR]: 'We had trouble loading the data.',
      [ErrorType.PARSE_ERROR]: 'We received invalid data from the server.',
      [ErrorType.UNKNOWN_ERROR]: 'Something went wrong. Please try again.',
    }

    // Return user-friendly message or original if available
    return messages[type] || originalMessage || 'An unexpected error occurred'
  }

  /**
   * Log error (can be extended to send to error tracking service)
   */
  private logError(error: AppError) {
    // Add to in-memory log
    this.errorLog.push(error)
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorHandler]', {
        type: error.type,
        message: error.message,
        userMessage: error.userMessage,
        timestamp: error.timestamp,
        context: error.context,
        originalError: error.originalError,
      })
    }

    // Send to Sentry for error tracking
    this.sendToErrorTracking(error)
  }

  /**
   * Send error to external error tracking service (Sentry)
   */
  private async sendToErrorTracking(error: AppError) {
    try {
      // Send to Sentry with context
      Sentry.captureException(error.originalError || new Error(error.message), {
        level: error.type === ErrorType.SERVER_ERROR ? 'fatal' : 'error',
        tags: {
          errorType: error.type,
        },
        contexts: {
          error: {
            type: error.type,
            message: error.message,
            timestamp: error.timestamp,
            stack: error.stack,
          },
          ...(error.context && { custom: error.context }),
        },
        extra: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        },
      })
    } catch (trackingError) {
      // Fail silently - don't let error tracking break the app
      console.error('Failed to send error to Sentry:', trackingError)
    }
  }

  /**
   * Check if value is an AppError
   */
  private isAppError(value: unknown): value is AppError {
    return (
      typeof value === 'object' &&
      value !== null &&
      'type' in value &&
      'message' in value &&
      'timestamp' in value
    )
  }

  /**
   * Get recent errors (for debugging)
   */
  getRecentErrors(limit: number = 10): AppError[] {
    return this.errorLog.slice(-limit)
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = []
  }

  /**
   * Check if user should retry
   */
  shouldRetry(error: AppError): boolean {
    const retryableErrors = [
      ErrorType.NETWORK_ERROR,
      ErrorType.TIMEOUT_ERROR,
      ErrorType.SERVER_ERROR,
    ]
    return retryableErrors.includes(error.type)
  }

  /**
   * Check if error requires authentication
   */
  requiresAuth(error: AppError): boolean {
    const authErrors = [
      ErrorType.AUTH_ERROR,
      ErrorType.TOKEN_EXPIRED,
      ErrorType.UNAUTHORIZED,
    ]
    return authErrors.includes(error.type)
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Export convenience functions
export const handleError = (error: unknown, context?: Record<string, any>) =>
  errorHandler.handleError(error, context)

export const createError = (
  type: ErrorType,
  message: string,
  originalError?: Error | unknown,
  context?: Record<string, any>
) => errorHandler.createError(type, message, originalError, context)

