/**
 * Mobile Performance Optimizations
 * Optimize for slower mobile devices and networks
 */

'use client'

import { useState, useEffect } from 'react'

/**
 * Detect device performance tier
 */
export function getDevicePerformanceTier(): 'high' | 'medium' | 'low' {
  if (typeof window === 'undefined') return 'medium'

  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2

  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory || 4 // GB

  // Detect low-end devices
  if (cores <= 2 || memory <= 2) {
    return 'low'
  }

  // Detect high-end devices
  if (cores >= 8 && memory >= 8) {
    return 'high'
  }

  return 'medium'
}

/**
 * Hook for device performance tier
 */
export function useDevicePerformance() {
  const [tier, setTier] = useState<'high' | 'medium' | 'low'>('medium')

  useEffect(() => {
    setTier(getDevicePerformanceTier())
  }, [])

  return tier
}

/**
 * Get optimal settings based on device performance
 */
export function getOptimalSettings(tier: 'high' | 'medium' | 'low') {
  const settings = {
    high: {
      animationsEnabled: true,
      particleEffects: true,
      imageQuality: 90,
      prefetchEnabled: true,
      virtualScrollOverscan: 3,
      maxConcurrentRequests: 6,
    },
    medium: {
      animationsEnabled: true,
      particleEffects: false,
      imageQuality: 85,
      prefetchEnabled: true,
      virtualScrollOverscan: 2,
      maxConcurrentRequests: 4,
    },
    low: {
      animationsEnabled: false,
      particleEffects: false,
      imageQuality: 75,
      prefetchEnabled: false,
      virtualScrollOverscan: 1,
      maxConcurrentRequests: 2,
    },
  }

  return settings[tier]
}

/**
 * Network quality detection
 */
export function getNetworkQuality(): 'fast' | 'medium' | 'slow' | 'offline' {
  if (typeof window === 'undefined') return 'medium'

  if (!navigator.onLine) {
    return 'offline'
  }

  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    const effectiveType = connection?.effectiveType

    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'slow'
      case '3g':
        return 'medium'
      case '4g':
      default:
        return 'fast'
    }
  }

  return 'medium'
}

/**
 * Hook for network quality
 */
export function useNetworkQuality() {
  const [quality, setQuality] = useState<'fast' | 'medium' | 'slow' | 'offline'>('medium')

  useEffect(() => {
    const updateQuality = () => {
      setQuality(getNetworkQuality())
    }

    updateQuality()

    // Listen for online/offline events
    window.addEventListener('online', updateQuality)
    window.addEventListener('offline', updateQuality)

    // Listen for connection changes (if supported)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection?.addEventListener('change', updateQuality)
    }

    return () => {
      window.removeEventListener('online', updateQuality)
      window.removeEventListener('offline', updateQuality)
    }
  }, [])

  return quality
}

/**
 * Adaptive loading based on network
 */
export function useAdaptiveLoading() {
  const networkQuality = useNetworkQuality()
  const deviceTier = useDevicePerformance()

  const shouldLoadImages = networkQuality !== 'offline'
  const shouldPrefetch = networkQuality === 'fast' && deviceTier !== 'low'
  const shouldAnimate = deviceTier !== 'low'
  const imageQuality = networkQuality === 'slow' ? 60 : 85

  return {
    shouldLoadImages,
    shouldPrefetch,
    shouldAnimate,
    imageQuality,
    networkQuality,
    deviceTier,
  }
}

/**
 * Reduce motion detection (accessibility + performance)
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return reducedMotion
}

/**
 * Battery status hook (reduce animations on low battery)
 */
export function useBatteryStatus() {
  const [isLowBattery, setIsLowBattery] = useState(false)
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('getBattery' in navigator)) return
    ;(navigator as any).getBattery().then((battery: any) => {
      const updateBatteryStatus = () => {
        setBatteryLevel(battery.level)
        setIsLowBattery(battery.level < 0.2 && !battery.charging)
      }

      updateBatteryStatus()

      battery.addEventListener('levelchange', updateBatteryStatus)
      battery.addEventListener('chargingchange', updateBatteryStatus)

      return () => {
        battery.removeEventListener('levelchange', updateBatteryStatus)
        battery.removeEventListener('chargingchange', updateBatteryStatus)
      }
    })
  }, [])

  return { isLowBattery, batteryLevel }
}

/**
 * Adaptive performance hook
 * Combines all performance indicators
 */
export function useAdaptivePerformance() {
  const deviceTier = useDevicePerformance()
  const networkQuality = useNetworkQuality()
  const reducedMotion = useReducedMotion()
  const { isLowBattery } = useBatteryStatus()

  const settings = getOptimalSettings(deviceTier)

  // Disable animations if:
  // - User prefers reduced motion
  // - Device is low-end
  // - Battery is low
  const enableAnimations = settings.animationsEnabled && !reducedMotion && !isLowBattery

  // Disable prefetching if:
  // - Network is slow
  // - Device is low-end
  const enablePrefetch =
    settings.prefetchEnabled && networkQuality !== 'slow' && deviceTier !== 'low'

  // Adjust image quality based on network
  const imageQuality =
    networkQuality === 'slow' ? 60 : networkQuality === 'medium' ? 75 : settings.imageQuality

  return {
    deviceTier,
    networkQuality,
    enableAnimations,
    enablePrefetch,
    imageQuality,
    enableParticles: settings.particleEffects && !isLowBattery,
    virtualScrollOverscan: settings.virtualScrollOverscan,
    maxConcurrentRequests: settings.maxConcurrentRequests,
    isLowBattery,
    reducedMotion,
  }
}

/**
 * Optimize rendering for mobile
 */
export function useMobileOptimization() {
  const [isMobile, setIsMobile] = useState(false)
  const performance = useAdaptivePerformance()

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    isMobile,
    ...performance,
    // Mobile-specific optimizations
    shouldUseVirtualScroll: isMobile, // Always use on mobile
    shouldShowBottomNav: isMobile,
    touchTargetSize: 44, // Minimum 44x44px for touch
  }
}

/**
 * Data saver mode detection
 */
export function useDataSaverMode(): boolean {
  const [dataSaver, setDataSaver] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if user has data saver enabled
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setDataSaver(connection?.saveData || false)
    }
  }, [])

  return dataSaver
}

/**
 * Lazy load component based on device performance
 */
export function shouldLazyLoad(index: number, deviceTier: 'high' | 'medium' | 'low'): boolean {
  const thresholds = {
    high: 20, // Lazy load after 20 items
    medium: 10, // Lazy load after 10 items
    low: 5, // Lazy load after 5 items
  }

  return index >= thresholds[deviceTier]
}

/**
 * Get optimal animation duration based on performance
 */
export function getAnimationDuration(
  baseDuration: number,
  deviceTier: 'high' | 'medium' | 'low'
): number {
  const multipliers = {
    high: 1.0,
    medium: 0.8,
    low: 0.5, // Faster animations on low-end devices
  }

  return baseDuration * multipliers[deviceTier]
}
