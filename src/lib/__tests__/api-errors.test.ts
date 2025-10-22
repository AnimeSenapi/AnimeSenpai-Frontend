/**
 * API Error Handling Tests
 * Tests for error handling utilities
 */

import { describe, it, expect } from 'bun:test'
import { handleApiError, isNetworkError, isAuthError, shouldRetry } from '../api-errors'

describe('API Error Handling', () => {
  describe('handleApiError', () => {
    it('should return user-friendly message for UNAUTHORIZED', () => {
      const error = {
        error: {
          data: { code: 'UNAUTHORIZED' },
          message: 'Unauthorized',
        },
      }
      const result = handleApiError(error)
      expect(result).toBe('Please sign in to continue')
    })

    it('should return user-friendly message for NOT_FOUND', () => {
      const error = {
        error: {
          data: { code: 'NOT_FOUND' },
          message: 'Not found',
        },
      }
      const result = handleApiError(error)
      expect(result).toBe('The requested item could not be found')
    })

    it('should return user-friendly message for NETWORK_ERROR', () => {
      const error = {
        error: {
          data: { code: 'NETWORK_ERROR' },
          message: 'Network error',
        },
      }
      const result = handleApiError(error)
      expect(result).toBe('Network error. Please check your internet connection and try again.')
    })

    it('should return user-friendly message for TOO_MANY_REQUESTS', () => {
      const error = {
        error: {
          data: { code: 'TOO_MANY_REQUESTS' },
          message: 'Too many requests',
        },
      }
      const result = handleApiError(error)
      expect(result).toBe('Too many requests. Please slow down and try again in a moment.')
    })

    it('should return user-friendly message for EMAIL_ALREADY_EXISTS', () => {
      const error = {
        error: {
          data: { code: 'EMAIL_ALREADY_EXISTS' },
          message: 'Email already exists',
        },
      }
      const result = handleApiError(error)
      expect(result).toBe('An account with this email already exists. Try signing in instead.')
    })

    it('should return default message for unknown errors', () => {
      const error = {
        error: {
          data: { code: 'UNKNOWN_ERROR' },
          message: 'Unknown error',
        },
      }
      const result = handleApiError(error)
      expect(result).toBe('An unexpected error occurred. Please try again.')
    })
  })

  describe('isNetworkError', () => {
    it('should detect network errors', () => {
      const error = new Error('fetch failed')
      expect(isNetworkError(error)).toBe(true)
    })

    it('should detect timeout errors', () => {
      const error = new Error('request timeout')
      expect(isNetworkError(error)).toBe(true)
    })

    it('should detect connection errors', () => {
      const error = new Error('connection refused')
      expect(isNetworkError(error)).toBe(true)
    })

    it('should not detect non-network errors', () => {
      const error = new Error('validation failed')
      expect(isNetworkError(error)).toBe(false)
    })
  })

  describe('isAuthError', () => {
    it('should detect UNAUTHORIZED errors', () => {
      const error = {
        error: {
          data: { code: 'UNAUTHORIZED' },
          message: 'Unauthorized',
        },
      }
      expect(isAuthError(error)).toBe(true)
    })

    it('should detect FORBIDDEN errors', () => {
      const error = {
        error: {
          data: { code: 'FORBIDDEN' },
          message: 'Forbidden',
        },
      }
      expect(isAuthError(error)).toBe(true)
    })

    it('should detect INVALID_TOKEN errors', () => {
      const error = {
        error: {
          data: { code: 'INVALID_TOKEN' },
          message: 'Invalid token',
        },
      }
      expect(isAuthError(error)).toBe(true)
    })

    it('should detect TOKEN_EXPIRED errors', () => {
      const error = {
        error: {
          data: { code: 'TOKEN_EXPIRED' },
          message: 'Token expired',
        },
      }
      expect(isAuthError(error)).toBe(true)
    })

    it('should not detect non-auth errors', () => {
      const error = {
        error: {
          data: { code: 'NOT_FOUND' },
          message: 'Not found',
        },
      }
      expect(isAuthError(error)).toBe(false)
    })
  })

  describe('shouldRetry', () => {
    it('should retry network errors', () => {
      const error = new Error('fetch failed')
      expect(shouldRetry(error)).toBe(true)
    })

    it('should retry server errors (5xx)', () => {
      const error = {
        error: {
          data: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500 },
          message: 'Internal server error',
        },
      }
      expect(shouldRetry(error)).toBe(true)
    })

    it('should not retry client errors (4xx)', () => {
      const error = {
        error: {
          data: { code: 'BAD_REQUEST', httpStatus: 400 },
          message: 'Bad request',
        },
      }
      expect(shouldRetry(error)).toBe(false)
    })

    it('should not retry auth errors', () => {
      const error = {
        error: {
          data: { code: 'UNAUTHORIZED', httpStatus: 401 },
          message: 'Unauthorized',
        },
      }
      expect(shouldRetry(error)).toBe(false)
    })
  })
})
