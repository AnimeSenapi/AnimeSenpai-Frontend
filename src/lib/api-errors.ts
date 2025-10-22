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

interface TRPCErrorResponse {
  error?: {
    data?: {
      code?: string
      httpStatus?: number
    }
    message?: string
  }
  data?: {
    code?: string
    httpStatus?: number
  }
  code?: string
  message?: string
  statusCode?: number
}

function parseError(error: unknown): ParsedError {
  // Handle tRPC errors
  if (error && typeof error === 'object') {
    const err = error as TRPCErrorResponse

    // tRPC error format
    if (err.error?.data?.code || err.data?.code) {
      const code = err.error?.data?.code || err.data?.code
      const message = err.error?.message || err.message || 'An error occurred'
      const statusCode = err.error?.data?.httpStatus || err.data?.httpStatus

      return {
        message,
        userMessage: getErrorMessage(code || 'UNKNOWN', message),
        code: code || 'UNKNOWN',
        statusCode,
      }
    }

    // Standard error format
    if (err.message) {
      return {
        message: err.message,
        userMessage: getErrorMessage('UNKNOWN_ERROR', err.message),
        code: 'UNKNOWN_ERROR',
      }
    }
  }

  // Fallback
  return {
    message: 'An unexpected error occurred',
    userMessage: 'Something went wrong. Please try again.',
    code: 'UNKNOWN_ERROR',
  }
}

function getErrorMessage(code: string, defaultMessage: string): string {
  const errorMessages: Record<string, string> = {
    // Authentication errors
    UNAUTHORIZED: 'Please sign in to continue',
    FORBIDDEN: "You don't have permission to perform this action",
    INVALID_CREDENTIALS: 'Invalid email or password. Please check your credentials and try again.',
    USER_NOT_FOUND: 'User not found. Please check your credentials.',
    EMAIL_ALREADY_EXISTS: 'An account with this email already exists. Try signing in instead.',
    USERNAME_ALREADY_EXISTS: 'This username is already taken. Please choose a different username.',
    INVALID_TOKEN: 'Your session has expired. Please sign in again.',
    TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
    ACCOUNT_LOCKED:
      'Your account has been temporarily locked due to too many failed login attempts. Please try again in 15 minutes.',
    EMAIL_NOT_VERIFIED:
      'Please verify your email address to continue. Check your inbox for the verification link.',
    PASSWORD_TOO_WEAK:
      'Password is too weak. Please use a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.',
    PASSWORD_MISMATCH:
      'Passwords do not match. Please make sure both password fields are identical.',

    // Validation errors
    BAD_REQUEST: 'Invalid request. Please check your input and try again.',
    VALIDATION_ERROR: 'Please check your input and try again',
    TOO_MANY_REQUESTS: 'Too many requests. Please slow down and try again in a moment.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_USERNAME:
      'Username must be 2-50 characters and can only contain letters, numbers, underscores, and hyphens.',
    INVALID_PASSWORD: 'Password must be at least 8 characters long.',
    MISSING_REQUIRED_FIELD: 'Please fill in all required fields.',

    // Resource errors
    NOT_FOUND: 'The requested item could not be found',
    ANIME_NOT_FOUND: "This anime doesn't exist or has been removed",
    REVIEW_NOT_FOUND: 'Review not found',
    USER_PROFILE_NOT_FOUND:
      'User profile not found. The user may have deleted their account or changed their username.',
    LIST_ITEM_NOT_FOUND: 'This item is not in your list.',
    MESSAGE_NOT_FOUND: 'Message not found or has been deleted.',
    NOTIFICATION_NOT_FOUND: 'Notification not found.',
    FRIEND_REQUEST_NOT_FOUND: 'Friend request not found or has expired.',

    // Server errors
    INTERNAL_SERVER_ERROR:
      'Something went wrong on our end. Our team has been notified. Please try again later.',
    SERVICE_UNAVAILABLE:
      "Service is temporarily unavailable. We're working on it. Please try again in a few minutes.",
    TIMEOUT: 'Request timed out. Please check your connection and try again.',
    DATABASE_CONNECTION_ERROR: 'Unable to connect to database. Please try again in a moment.',

    // Database errors
    DATABASE_ERROR: 'A database error occurred. Please try again.',
    UNIQUE_CONSTRAINT: 'This item already exists',
    FOREIGN_KEY_CONSTRAINT: 'Cannot perform this action because it would violate data integrity.',

    // Network errors
    NETWORK_ERROR: 'Network error. Please check your internet connection and try again.',
    CONNECTION_REFUSED:
      'Unable to connect to server. Please check if the server is running and try again.',
    OFFLINE: 'You appear to be offline. Please check your internet connection.',
    DNS_ERROR: 'Unable to resolve server address. Please check your internet connection.',

    // File upload errors
    FILE_TOO_LARGE:
      'File is too large. Maximum size is 2MB. Please compress your image or choose a smaller file.',
    INVALID_FILE_TYPE: 'Invalid file type. Please upload a JPG, PNG, or GIF image.',
    UPLOAD_FAILED: 'File upload failed. Please try again.',
    STORAGE_QUOTA_EXCEEDED: 'Storage quota exceeded. Please delete some files and try again.',

    // List management errors
    ALREADY_IN_LIST: 'This anime is already in your list.',
    NOT_IN_LIST: 'This anime is not in your list.',
    LIST_FULL: 'Your list is full. Please remove some items before adding new ones.',
    CANNOT_REMOVE_FAVORITE: 'Cannot remove favorite. Please unfavorite it first.',

    // Rating errors
    ALREADY_RATED: "You've already rated this anime.",
    INVALID_RATING: 'Rating must be between 1 and 10.',
    RATING_NOT_FOUND: 'Rating not found.',

    // Social features errors
    ALREADY_FOLLOWING: 'You are already following this user.',
    NOT_FOLLOWING: 'You are not following this user.',
    CANNOT_FOLLOW_SELF: 'You cannot follow yourself.',
    ALREADY_FRIENDS: 'You are already friends with this user.',
    NOT_FRIENDS: 'You are not friends with this user.',
    CANNOT_BEFRIEND_SELF: 'You cannot send a friend request to yourself.',
    FRIEND_REQUEST_PENDING: 'A friend request is already pending.',
    FRIEND_REQUEST_NOT_PENDING: 'No pending friend request found.',
    CANNOT_MESSAGE_SELF: 'You cannot send a message to yourself.',
    MESSAGES_DISABLED: 'This user has disabled direct messages.',
    USER_BLOCKED: 'You cannot perform this action because you have been blocked by this user.',
    USER_BLOCKED_YOU: 'You have blocked this user. Unblock them to perform this action.',
    ALREADY_BLOCKED: 'You have already blocked this user.',
    NOT_BLOCKED: 'You have not blocked this user.',

    // Privacy errors
    PRIVATE_PROFILE: "This user's profile is private. You must be friends to view it.",
    PRIVATE_LIST: "This user's anime list is private.",
    PRIVATE_ACTIVITY: "This user's activity is private.",

    // Admin errors
    ADMIN_ONLY: 'This action requires administrator privileges.',
    MODERATOR_ONLY: 'This action requires moderator privileges.',
    TESTER_ONLY: 'This feature is only available to testers.',
    CANNOT_MODIFY_ADMIN: 'You cannot modify administrator accounts.',
    CANNOT_DELETE_SELF: 'You cannot delete your own account.',

    // Generic
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    PARSE_ERROR: 'Failed to process response. Please try again.',
    OPERATION_FAILED: 'The operation failed. Please try again.',
    FEATURE_DISABLED: 'This feature is currently disabled.',
    MAINTENANCE_MODE: 'The site is currently under maintenance. Please check back later.',
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
  return errorMessages['UNKNOWN_ERROR'] ?? 'An unknown error occurred'
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
    const err = error as TRPCErrorResponse
    const code = err.error?.data?.code || err.data?.code || err.code
    return code
      ? ['UNAUTHORIZED', 'FORBIDDEN', 'INVALID_TOKEN', 'TOKEN_EXPIRED'].includes(code)
      : false
  }
  return false
}

export function shouldRetry(error: unknown): boolean {
  if (isNetworkError(error)) return true

  if (error && typeof error === 'object') {
    const err = error as TRPCErrorResponse
    const statusCode = err.error?.data?.httpStatus || err.data?.httpStatus || err.statusCode

    // Retry on server errors (5xx) but not client errors (4xx)
    return statusCode !== undefined && statusCode >= 500 && statusCode < 600
  }

  return false
}
