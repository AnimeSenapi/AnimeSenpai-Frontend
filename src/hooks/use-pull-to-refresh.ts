/**
 * Pull to Refresh Hook
 * Provides pull-to-refresh functionality for mobile devices
 */

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export interface PullToRefreshOptions {
  threshold?: number // Distance in pixels to trigger refresh (default: 80)
  resistance?: number // Resistance factor for pull (default: 2.5)
  disabled?: boolean
  onRefresh: () => Promise<void> | void
}

export interface PullToRefreshState {
  isPulling: boolean
  isRefreshing: boolean
  pullDistance: number
  progress: number // 0-1 progress of pull
}

const DEFAULT_OPTIONS: Required<Omit<PullToRefreshOptions, 'onRefresh'>> = {
  threshold: 80,
  resistance: 2.5,
  disabled: false,
}

/**
 * Hook for pull-to-refresh functionality
 */
export function usePullToRefresh(options: PullToRefreshOptions) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    progress: 0,
  })

  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)
  const isAtTop = useRef<boolean>(true)

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (opts.disabled) return

      // Only trigger at the top of the page
      isAtTop.current = window.scrollY === 0
      if (!isAtTop.current) return

      startY.current = e.touches[0]?.clientY ?? 0
      currentY.current = startY.current
    },
    [opts.disabled]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (opts.disabled || !isAtTop.current || startY.current === 0) return

      // Prevent default scrolling if we're pulling down
      currentY.current = e.touches[0]?.clientY ?? 0
      const deltaY = currentY.current - startY.current

      if (deltaY > 0) {
        // Pulling down
        e.preventDefault()
        const distance = deltaY / opts.resistance
        const progress = Math.min(distance / opts.threshold, 1)

        setState({
          isPulling: distance > 10, // Start showing feedback after 10px
          isRefreshing: false,
          pullDistance: distance,
          progress,
        })
      } else {
        // Scrolling up - reset
        setState({
          isPulling: false,
          isRefreshing: false,
          pullDistance: 0,
          progress: 0,
        })
        startY.current = 0
      }
    },
    [opts]
  )

  const handleTouchEnd = useCallback(async () => {
    if (opts.disabled || !isAtTop.current || startY.current === 0) return

    const distance = state.pullDistance

    if (distance >= opts.threshold && !state.isRefreshing) {
      // Trigger refresh
      setState((prev) => ({
        ...prev,
        isRefreshing: true,
        isPulling: false,
      }))

      try {
        await opts.onRefresh()
      } finally {
        // Reset after a short delay for smooth animation
        setTimeout(() => {
          setState({
            isPulling: false,
            isRefreshing: false,
            pullDistance: 0,
            progress: 0,
          })
          startY.current = 0
          currentY.current = 0
        }, 300)
      }
    } else {
      // Reset without refreshing
      setState({
        isPulling: false,
        isRefreshing: false,
        pullDistance: 0,
        progress: 0,
      })
      startY.current = 0
      currentY.current = 0
    }
  }, [opts, state.pullDistance, state.isRefreshing])

  useEffect(() => {
    if (opts.disabled) return

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, opts.disabled])

  return state
}

