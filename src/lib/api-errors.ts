/**
 * API Error Handling Utilities
 * Provides user-friendly error messages for various API error codes
 */

export interface ApiError {
  code: string
  message: string
  statusCode?: number
}

export class UserFriendlyError extends Error {
  public readonly userMessage: string
  public readonly code: string
  public readonly statusCode?: number

  constructor(error: ApiError | Error | unknown) {
    const errorDetails = parseError(error)
    super(errorDetails.message)
    this.name = 'UserFriendlyError'
    this.userMessage = errorDetails.userMessage
    this.code = errorDetails.code
    this.statusCode = errorDetails.statusCode
  }
}

interface ParsedError {
  message: string
  userMessage: string
  code: string
  statusCode?: number
}

function parseError(error: unknown): ParsedError {
  // Handle tRPC errors
  if (error && typeof error === 'object') {
    const err = error as any
    
    // tRPC error format
    if (err.error?.data?.code || err.data?.code) {
      const code = err.error?.data?.code || err.data?.code
      const message = err.error?.message || err.message || 'An error occurred'
      const statusCode = err.error?.data?.httpStatus || err.data?.httpStatus
      
      return {
        message,
        userMessage: getErrorMessage(code, message),
        code,
        statusCode
      }
    }
    
    // Standard error format
    if (err.message) {
      return {
        message: err.message,
        userMessage: getErrorMessage('UNKNOWN_ERROR', err.message),
        code: 'UNKNOWN_ERROR'
      }
    }
  }
  
  // Fallback
  return {
    message: 'An unexpected error occurred',
    userMessage: 'Something went wrong. Please try again.',
    code: 'UNKNOWN_ERROR'
  }
}

function getErrorMessage(code: string, defaultMessage: string): string {
  const errorMessages: Record<string, string> = {
    // Authentication errors
    'UNAUTHORIZED': 'Please sign in to continue',
    'FORBIDDEN': 'You don\'t have permission to perform this action',
    'INVALID_CREDENTIALS': 'Invalid email or password. Please try again.',
    'USER_NOT_FOUND': 'User not found. Please check your credentials.',
    'EMAIL_ALREADY_EXISTS': 'An account with this email already exists',
    'USERNAME_ALREADY_EXISTS': 'This username is already taken',
    'INVALID_TOKEN': 'Your session has expired. Please sign in again.',
    'TOKEN_EXPIRED': 'Your session has expired. Please sign in again.',
    
    // Validation errors
    'BAD_REQUEST': 'Invalid request. Please check your input.',
    'VALIDATION_ERROR': 'Please check your input and try again',
    'TOO_MANY_REQUESTS': 'Too many requests. Please slow down and try again in a moment.',
    
    // Resource errors
    'NOT_FOUND': 'The requested item could not be found',
    'ANIME_NOT_FOUND': 'This anime doesn\'t exist or has been removed',
    'REVIEW_NOT_FOUND': 'Review not found',
    
    // Server errors
    'INTERNAL_SERVER_ERROR': 'Something went wrong on our end. Please try again later.',
    'SERVICE_UNAVAILABLE': 'Service is temporarily unavailable. Please try again later.',
    'TIMEOUT': 'Request timed out. Please check your connection and try again.',
    
    // Database errors
    'DATABASE_ERROR': 'A database error occurred. Please try again.',
    'UNIQUE_CONSTRAINT': 'This item already exists',
    
    // Network errors
    'NETWORK_ERROR': 'Network error. Please check your internet connection.',
    'CONNECTION_REFUSED': 'Unable to connect to server. Please try again later.',
    
    // File upload errors
    'FILE_TOO_LARGE': 'File is too large. Maximum size is 2MB.',
    'INVALID_FILE_TYPE': 'Invalid file type. Please upload an image file.',
    
    // List management errors
    'ALREADY_IN_LIST': 'This anime is already in your list',
    'NOT_IN_LIST': 'This anime is not in your list',
    
    // Rating errors
    'ALREADY_RATED': 'You\'ve already rated this anime',
    'INVALID_RATING': 'Rating must be between 1 and 10',
    
    // Generic
    'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.',
    'PARSE_ERROR': 'Failed to process response. Please try again.',
  }

  // Check if we have a specific message for this code
  if (errorMessages[code]) {
    return errorMessages[code]
  }

  // Check if the default message contains useful information
  if (defaultMessage && defaultMessage !== 'Internal server error' && defaultMessage.length < 200) {
    return defaultMessage
  }

  // Fallback
  return errorMessages['UNKNOWN_ERROR']
}

export function handleApiError(error: unknown): string {
  const userError = new UserFriendlyError(error)
  return userError.userMessage
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('connection')
    )
  }
  return false
}

export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as any
    const code = err.error?.data?.code || err.data?.code || err.code
    return ['UNAUTHORIZED', 'FORBIDDEN', 'INVALID_TOKEN', 'TOKEN_EXPIRED'].includes(code)
  }
  return false
}

export function shouldRetry(error: unknown): boolean {
  if (isNetworkError(error)) return true
  
  if (error && typeof error === 'object') {
    const err = error as any
    const statusCode = err.error?.data?.httpStatus || err.data?.httpStatus || err.statusCode
    
    // Retry on server errors (5xx) but not client errors (4xx)
    return statusCode >= 500 && statusCode < 600
  }
  
  return false
}


