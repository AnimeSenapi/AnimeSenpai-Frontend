'use client'

import { useEffect, useState } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

/**
 * Hook to detect if the user is on a mobile device
 * @param breakpoint The breakpoint to check against (default: 'md')
 * @returns boolean indicating if viewport is below the breakpoint
 */
export function useIsMobile(breakpoint: Breakpoint = 'md'): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`)

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches)
    }

    // Set initial value
    handleChange(mediaQuery)

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [breakpoint])

  return isMobile
}

/**
 * Hook to get the current device type
 * @returns 'mobile' | 'tablet' | 'desktop'
 */
export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth

      if (width < BREAKPOINTS.sm) {
        setDeviceType('mobile')
      } else if (width < BREAKPOINTS.lg) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)

    return () => window.removeEventListener('resize', checkDeviceType)
  }, [])

  return deviceType
}

/**
 * Hook to get the current window dimensions
 * @returns { width: number, height: number }
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

/**
 * Hook to detect touch support
 * @returns boolean indicating if the device supports touch
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const hasTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0

    setIsTouch(hasTouch)
  }, [])

  return isTouch
}

/**
 * Hook to detect if the device is in landscape or portrait mode
 * @returns 'portrait' | 'landscape'
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  return orientation
}

/**
 * Hook to check if the viewport matches a specific breakpoint
 * @param breakpoint The breakpoint to check
 * @returns boolean indicating if viewport matches the breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const nextBreakpoint = getNextBreakpoint(breakpoint)
    const minWidth = BREAKPOINTS[breakpoint]
    const maxWidth = nextBreakpoint ? BREAKPOINTS[nextBreakpoint] - 1 : undefined

    const query = maxWidth
      ? `(min-width: ${minWidth}px) and (max-width: ${maxWidth}px)`
      : `(min-width: ${minWidth}px)`

    const mediaQuery = window.matchMedia(query)

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setMatches(event.matches)
    }

    handleChange(mediaQuery)

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [breakpoint])

  return matches
}

function getNextBreakpoint(current: Breakpoint): Breakpoint | null {
  const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  const currentIndex = breakpoints.indexOf(current)
  return currentIndex < breakpoints.length - 1 ? breakpoints[currentIndex + 1] ?? null : null
}

/**
 * Hook to detect safe area insets (for iPhone notch, dynamic island, etc.)
 * @returns { top: number, right: number, bottom: number, left: number }
 */
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  useEffect(() => {
    const getSafeAreaInsets = () => {
      const style = getComputedStyle(document.documentElement)

      setSafeArea({
        top: parseInt(style.getPropertyValue('--safe-area-inset-top')) || 0,
        right: parseInt(style.getPropertyValue('--safe-area-inset-right')) || 0,
        bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom')) || 0,
        left: parseInt(style.getPropertyValue('--safe-area-inset-left')) || 0,
      })
    }

    getSafeAreaInsets()
    window.addEventListener('resize', getSafeAreaInsets)

    return () => window.removeEventListener('resize', getSafeAreaInsets)
  }, [])

  return safeArea
}
