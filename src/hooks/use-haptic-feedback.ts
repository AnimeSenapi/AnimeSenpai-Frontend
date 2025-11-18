/**
 * Haptic Feedback Hook
 * Provides haptic feedback for mobile devices using Vibration API
 */

'use client'

import { useCallback } from 'react'

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection'

interface HapticFeedback {
  trigger: (type: HapticType) => void
  light: () => void
  medium: () => void
  heavy: () => void
  success: () => void
  error: () => void
  warning: () => void
  selection: () => void
}

/**
 * Check if device supports haptic feedback
 */
function supportsHaptic(): boolean {
  if (typeof window === 'undefined') return false
  return 'vibrate' in navigator
}

/**
 * Trigger haptic feedback
 */
function vibrate(pattern: number | number[]): void {
  if (typeof window === 'undefined' || !supportsHaptic()) return

  try {
    navigator.vibrate(pattern)
  } catch (error) {
    // Silently fail if vibration is not supported or blocked
    console.debug('Haptic feedback not available:', error)
  }
}

/**
 * Haptic feedback hook
 * Provides different vibration patterns for different interaction types
 */
export function useHapticFeedback(): HapticFeedback {
  const trigger = useCallback((type: HapticType) => {
    if (!supportsHaptic()) return

    const patterns: Record<HapticType, number | number[]> = {
      light: 10, // Light tap
      medium: 20, // Medium tap
      heavy: 30, // Heavy tap
      selection: 5, // Very light selection feedback
      success: [10, 50, 10], // Success pattern: short-long-short
      error: [50, 100, 50, 100, 50], // Error pattern: long-short-long-short-long
      warning: [20, 50, 20], // Warning pattern: medium-long-medium
    }

    vibrate(patterns[type])
  }, [])

  const light = useCallback(() => trigger('light'), [trigger])
  const medium = useCallback(() => trigger('medium'), [trigger])
  const heavy = useCallback(() => trigger('heavy'), [trigger])
  const success = useCallback(() => trigger('success'), [trigger])
  const error = useCallback(() => trigger('error'), [trigger])
  const warning = useCallback(() => trigger('warning'), [trigger])
  const selection = useCallback(() => trigger('selection'), [trigger])

  return {
    trigger,
    light,
    medium,
    heavy,
    success,
    error,
    warning,
    selection,
  }
}

