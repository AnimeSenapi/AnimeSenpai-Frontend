/**
 * Mobile Image Optimizer
 * Optimizes image loading for mobile devices
 */

'use client'

import { useMemo } from 'react'
import { useNetworkQuality, useDevicePerformance } from './mobile-performance'

export interface ImageOptimizationOptions {
  baseUrl: string
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
  priority?: boolean
}

/**
 * Get optimal image size for mobile
 */
export function getOptimalMobileImageSize(
  originalWidth: number,
  deviceWidth: number = typeof window !== 'undefined' ? window.innerWidth : 375
): number {
  // Use device width with 2x density for retina displays
  const maxWidth = Math.min(deviceWidth * 2, originalWidth)
  
  // Round to nearest 100px for better caching
  return Math.ceil(maxWidth / 100) * 100
}

/**
 * Generate optimized image srcSet for mobile
 */
export function generateMobileSrcSet(
  baseUrl: string,
  widths: number[] = [320, 640, 960, 1280]
): string {
  return widths
    .map((width) => `${baseUrl}?w=${width}&q=85 ${width}w`)
    .join(', ')
}

/**
 * Hook for mobile-optimized image loading
 */
export function useMobileImageOptimization(baseUrl: string, options: Partial<ImageOptimizationOptions> = {}) {
  const networkQuality = useNetworkQuality()
  const deviceTier = useDevicePerformance()

  const optimizedUrl = useMemo(() => {
    if (!baseUrl) return baseUrl

    const quality = options.quality || (networkQuality === 'slow' ? 60 : networkQuality === 'medium' ? 75 : 85)
    const format = options.format || (networkQuality === 'fast' ? 'webp' : 'jpeg')
    
    // If URL already has query params, append; otherwise add
    const separator = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${separator}w=${options.width || 640}&q=${quality}&fm=${format}`
  }, [baseUrl, networkQuality, options])

  const shouldLazyLoad = useMemo(() => {
    // Lazy load if:
    // - Network is slow
    // - Device is low-end
    // - Not marked as priority
    return networkQuality === 'slow' || deviceTier === 'low' || !options.priority
  }, [networkQuality, deviceTier, options.priority])

  const sizes = useMemo(() => {
    // Responsive sizes for mobile
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  }, [])

  return {
    src: optimizedUrl,
    shouldLazyLoad,
    sizes,
    loading: shouldLazyLoad ? ('lazy' as const) : ('eager' as const),
  }
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalImageFormat(): 'webp' | 'avif' | 'jpeg' {
  if (typeof window === 'undefined') return 'jpeg'

  // Check AVIF support
  const avifSupported = document.createElement('canvas')
    .toDataURL('image/avif')
    .indexOf('data:image/avif') === 0

  if (avifSupported) return 'avif'

  // Check WebP support
  const webpSupported = document.createElement('canvas')
    .toDataURL('image/webp')
    .indexOf('data:image/webp') === 0

  if (webpSupported) return 'webp'

  return 'jpeg'
}

