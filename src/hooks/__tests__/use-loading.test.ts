/**
 * useLoading Hook Tests
 * Tests for loading state management hooks
 * 
 * Note: These are manual tests since React Testing Library is not available
 * In a real project, you would use @testing-library/react
 */

import { describe, it, expect } from 'bun:test'

describe('useLoading Hook', () => {
  it('should export useLoading function', () => {
    // Test that the module exports correctly
    const module = require('../use-loading')
    expect(module.useLoading).toBeDefined()
    expect(typeof module.useLoading).toBe('function')
  })

  it('should export useAsync function', () => {
    const module = require('../use-loading')
    expect(module.useAsync).toBeDefined()
    expect(typeof module.useAsync).toBe('function')
  })

  it('should export useDebounce function', () => {
    const module = require('../use-loading')
    expect(module.useDebounce).toBeDefined()
    expect(typeof module.useDebounce).toBe('function')
  })

  it('should export useThrottle function', () => {
    const module = require('../use-loading')
    expect(module.useThrottle).toBeDefined()
    expect(typeof module.useThrottle).toBe('function')
  })
})

