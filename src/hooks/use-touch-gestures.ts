/**
 * Touch Gesture Hooks
 * Handle swipe, pinch, and other touch interactions
 */

'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface TouchPosition {
  x: number
  y: number
  time: number
}

/**
 * Swipe gesture hook
 * Detects swipe direction and triggers callbacks
 */
export function useSwipe(handlers: SwipeHandlers, threshold: number = 50) {
  const touchStart = useRef<TouchPosition | null>(null)
  const touchEnd = useRef<TouchPosition | null>(null)

  const onTouchStart = useCallback((e: TouchEvent) => {
    touchEnd.current = null
    touchStart.current = {
      x: e.targetTouches[0]?.clientX ?? 0,
      y: e.targetTouches[0]?.clientY ?? 0,
      time: Date.now(),
    }
  }, [])

  const onTouchMove = useCallback((e: TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0]?.clientX ?? 0,
      y: e.targetTouches[0]?.clientY ?? 0,
      time: Date.now(),
    }
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return

    const xDiff = touchStart.current.x - touchEnd.current.x
    const yDiff = touchStart.current.y - touchEnd.current.y
    const timeDiff = touchEnd.current.time - touchStart.current.time

    // Ignore very slow swipes (> 500ms)
    if (timeDiff > 500) return

    // Determine swipe direction
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      // Horizontal swipe
      if (Math.abs(xDiff) > threshold) {
        if (xDiff > 0) {
          handlers.onSwipeLeft?.()
        } else {
          handlers.onSwipeRight?.()
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(yDiff) > threshold) {
        if (yDiff > 0) {
          handlers.onSwipeUp?.()
        } else {
          handlers.onSwipeDown?.()
        }
      }
    }

    touchStart.current = null
    touchEnd.current = null
  }, [handlers, threshold])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}

/**
 * Long press gesture hook
 */
export function useLongPress(callback: () => void, duration: number = 500) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPress = useRef(false)

  const start = useCallback(
    (_e: React.TouchEvent | React.MouseEvent) => {
      isLongPress.current = false
      timerRef.current = setTimeout(() => {
        isLongPress.current = true
        callback()
      }, duration)
    },
    [callback, duration]
  )

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const end = useCallback(() => {
    cancel()
    return isLongPress.current
  }, [cancel])

  return {
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: end,
  }
}

/**
 * Pull to refresh hook
 */
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef<number>(0)
  const threshold = 80 // Pull 80px to trigger refresh

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only trigger at top of page
    if (window.scrollY === 0) {
      startY.current = e.touches[0]?.clientY ?? 0
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startY.current === 0 || window.scrollY !== 0) return

    const currentY = e.touches[0]?.clientY ?? 0
    const distance = currentY - startY.current

    if (distance > 0 && distance < threshold * 2) {
      setPullDistance(distance)
      setIsPulling(true)
    }
  }, [])

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isPulling) {
      setIsPulling(true)
      try {
        await onRefresh()
      } finally {
        setIsPulling(false)
        setPullDistance(0)
        startY.current = 0
      }
    } else {
      setPullDistance(0)
      setIsPulling(false)
      startY.current = 0
    }
  }, [pullDistance, threshold, onRefresh, isPulling])

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const progress = Math.min(pullDistance / threshold, 1)

  return {
    isPulling,
    pullDistance,
    progress,
  }
}

/**
 * Swipeable card component hook
 */
export function useSwipeableCard(onSwipeLeft?: () => void, onSwipeRight?: () => void) {
  const [offset, setOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const startX = useRef<number>(0)
  const currentX = useRef<number>(0)
  const threshold = 100 // Swipe 100px to trigger action

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0]?.clientX ?? 0
    currentX.current = startX.current
    setIsSwiping(true)
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isSwiping) return

      currentX.current = e.touches[0]?.clientX ?? 0
      const diff = currentX.current - startX.current
      setOffset(diff)
    },
    [isSwiping]
  )

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return

    const diff = currentX.current - startX.current

    if (Math.abs(diff) >= threshold) {
      if (diff > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    }

    // Reset
    setOffset(0)
    setIsSwiping(false)
    startX.current = 0
    currentX.current = 0
  }, [isSwiping, threshold, onSwipeLeft, onSwipeRight])

  return {
    offset,
    isSwiping,
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}

/**
 * Haptic feedback hook (iOS/Android)
 */
export function useHaptic() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if (typeof window === 'undefined') return

    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  const hapticFeedback = useCallback(
    (type: 'light' | 'medium' | 'heavy' = 'light') => {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
      }

      vibrate(patterns[type])
    },
    [vibrate]
  )

  const success = useCallback(() => {
    vibrate([10, 50, 10]) // Short vibration pattern
  }, [vibrate])

  const error = useCallback(() => {
    vibrate([50, 100, 50, 100, 50]) // Error pattern
  }, [vibrate])

  const selection = useCallback(() => {
    vibrate(5) // Very light tap
  }, [vibrate])

  return {
    vibrate,
    haptic: hapticFeedback,
    success,
    error,
    selection,
  }
}

/**
 * Mobile detection hook
 * Returns false initially to avoid hydration mismatch, then updates after mount
 */
export function useIsMobile() {
  // Start with false to match server-side rendering
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check immediately after mount
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Return false during SSR and initial client render to avoid hydration mismatch
  // The value will update after mount via useEffect
  return mounted ? isMobile : false
}

/**
 * Safe area hook (for iPhone notch, etc.)
 */
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateSafeArea = () => {
      // Get CSS environment variables for safe area insets
      const root = document.documentElement
      const computedStyle = getComputedStyle(root)

      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--sar') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--sal') || '0'),
      })
    }

    updateSafeArea()
    window.addEventListener('resize', updateSafeArea)

    return () => window.removeEventListener('resize', updateSafeArea)
  }, [])

  return safeArea
}

/**
 * Prevent double-tap zoom on buttons/links
 */
export function usePreventZoom() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const preventZoom = (e: TouchEvent) => {
      if (
        (e.target as HTMLElement).tagName === 'BUTTON' ||
        (e.target as HTMLElement).tagName === 'A'
      ) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchend', preventZoom)
    return () => document.removeEventListener('touchend', preventZoom)
  }, [])
}
