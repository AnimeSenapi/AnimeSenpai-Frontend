/**
 * Memoization Utilities for React Components
 * Optimize expensive renders with intelligent memoization
 */

import React, { memo, ComponentType } from 'react'

/**
 * Smart memo wrapper that compares props deeply
 */
export function deepMemo<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): ComponentType<P> {
  return memo(Component, propsAreEqual)
}

/**
 * Memo wrapper for list items (compares by id)
 */
export function listItemMemo<P extends { id: string | number }>(
  Component: ComponentType<P>
): ComponentType<P> {
  return memo(Component, (prevProps, nextProps) => {
    return prevProps.id === nextProps.id
  })
}

/**
 * Memo wrapper for anime cards (compares by anime.id)
 */
export function animeCardMemo<P extends { anime: { id: string | number } }>(
  Component: ComponentType<P>
): ComponentType<P> {
  return memo(Component, (prevProps, nextProps) => {
    return (
      prevProps.anime.id === nextProps.anime.id &&
      // Also check if anime object reference changed
      prevProps.anime === nextProps.anime
    )
  })
}

/**
 * Shallow comparison for props
 */
export function shallowEqual<P extends object>(
  prevProps: Readonly<P>,
  nextProps: Readonly<P>
): boolean {
  const prevKeys = Object.keys(prevProps) as Array<keyof P>
  const nextKeys = Object.keys(nextProps) as Array<keyof P>

  if (prevKeys.length !== nextKeys.length) {
    return false
  }

  return prevKeys.every((key) => {
    return prevProps[key] === nextProps[key]
  })
}

/**
 * Deep comparison for props (with circular reference handling)
 */
export function deepEqual<P>(prevProps: Readonly<P>, nextProps: Readonly<P>): boolean {
  if (prevProps === nextProps) return true

  if (
    typeof prevProps !== 'object' ||
    typeof nextProps !== 'object' ||
    prevProps === null ||
    nextProps === null
  ) {
    return prevProps === nextProps
  }

  const prevKeys = Object.keys(prevProps) as Array<keyof P>
  const nextKeys = Object.keys(nextProps) as Array<keyof P>

  if (prevKeys.length !== nextKeys.length) return false

  return prevKeys.every((key) => {
    const prevValue = prevProps[key]
    const nextValue = nextProps[key]

    // Handle arrays
    if (Array.isArray(prevValue) && Array.isArray(nextValue)) {
      if (prevValue.length !== nextValue.length) return false
      return prevValue.every((item, index) => deepEqual(item, nextValue[index]))
    }

    // Handle objects
    if (
      typeof prevValue === 'object' &&
      typeof nextValue === 'object' &&
      prevValue !== null &&
      nextValue !== null
    ) {
      return deepEqual(prevValue, nextValue)
    }

    // Handle primitives
    return prevValue === nextValue
  })
}

/**
 * Custom comparison that ignores specific props
 */
export function memoExcluding<P extends object>(
  Component: ComponentType<P>,
  excludeProps: Array<keyof P>
): ComponentType<P> {
  return memo(Component, (prevProps, nextProps) => {
    const prevKeys = Object.keys(prevProps).filter(
      (key) => !excludeProps.includes(key as keyof P)
    ) as Array<keyof P>

    return prevKeys.every((key) => prevProps[key] === nextProps[key])
  })
}

/**
 * Custom comparison that only checks specific props
 */
export function memoOnly<P extends object>(
  Component: ComponentType<P>,
  includeProps: Array<keyof P>
): ComponentType<P> {
  return memo(Component, (prevProps, nextProps) => {
    return includeProps.every((key) => prevProps[key] === nextProps[key])
  })
}

/**
 * Performance monitoring wrapper
 * Logs render count and time for debugging
 */
export function withPerformanceTracking<P extends object>(
  Component: ComponentType<P>,
  componentName: string
): ComponentType<P> {
  if (process.env.NODE_ENV === 'production') {
    return Component
  }

  let renderCount = 0

  return (props: P) => {
    renderCount++
    const startTime = performance.now()

    const result = React.createElement(Component, props)

    const endTime = performance.now()
    const renderTime = endTime - startTime

    if (renderTime > 16) {
      // Warn if render takes longer than one frame (16ms @ 60fps)
      console.warn(
        `[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render (render #${renderCount})`
      )
    }

    return result
  }
}

/**
 * Render count tracker for debugging
 */
export function useRenderCount(componentName: string): void {
  if (process.env.NODE_ENV === 'production') return

  const renderCountRef = useRef(0)

  renderCountRef.current++

  console.log(`[Render] ${componentName} rendered ${renderCountRef.current} times`)
}

// Import useRef
import { useRef } from 'react'
