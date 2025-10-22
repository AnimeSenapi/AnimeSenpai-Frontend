/**
 * Responsive Image Utilities
 * Serve appropriate image sizes for different devices
 */

/**
 * Image size configurations for different breakpoints
 */
export const ImageSizes = {
  // Anime card images
  animeCard: {
    mobile: 160, // iPhone SE width / 2
    tablet: 200, // iPad in portrait / 4
    desktop: 250, // Desktop grid
    sizes: '(max-width: 640px) 160px, (max-width: 1024px) 200px, 250px',
  },

  // Anime detail page hero
  animeHero: {
    mobile: 375, // Full mobile width
    tablet: 768, // Tablet width
    desktop: 1200, // Desktop width
    sizes: '(max-width: 640px) 375px, (max-width: 1024px) 768px, 1200px',
  },

  // List item images (smaller)
  listItem: {
    mobile: 80,
    tablet: 100,
    desktop: 120,
    sizes: '(max-width: 640px) 80px, (max-width: 1024px) 100px, 120px',
  },

  // Avatar images
  avatar: {
    small: 32,
    medium: 40,
    large: 64,
    xlarge: 96,
  },

  // Banner/hero images
  banner: {
    mobile: 375,
    tablet: 768,
    desktop: 1920,
    sizes: '(max-width: 640px) 375px, (max-width: 1024px) 768px, 1920px',
  },
}

/**
 * Get optimal image size for current device
 */
export function getOptimalImageSize(type: keyof typeof ImageSizes, currentWidth?: number): number {
  if (typeof window === 'undefined') {
    return (ImageSizes[type] as any).desktop || 250
  }

  const width = currentWidth || window.innerWidth
  const config = ImageSizes[type]

  if (width < 640) {
    return (config as any).mobile || 160
  } else if (width < 1024) {
    return (config as any).tablet || 200
  } else {
    return (config as any).desktop || 250
  }
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(baseUrl: string, widths: number[]): string {
  return widths.map((width) => `${baseUrl}?w=${width} ${width}w`).join(', ')
}

/**
 * Image loading priority based on position
 */
export function getImagePriority(index: number, isMobile: boolean): boolean {
  // Load first 3 images on mobile, first 6 on desktop
  const limit = isMobile ? 3 : 6
  return index < limit
}

/**
 * Optimize image URL for device
 */
export function optimizeImageUrl(
  url: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'jpeg' | 'png'
    fit?: 'cover' | 'contain' | 'fill'
  } = {}
): string {
  const { width, height, quality = 85, format = 'webp', fit = 'cover' } = options

  // If using a CDN, add query parameters
  // This is a placeholder - adjust based on your CDN
  const params = new URLSearchParams()

  if (width) params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  params.set('q', quality.toString())
  params.set('fm', format)
  params.set('fit', fit)

  // For now, return original URL
  // In production, you'd use a CDN like Cloudinary, imgix, or Vercel Image Optimization
  return url
}

/**
 * Detect device pixel ratio for retina displays
 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1
  return window.devicePixelRatio || 1
}

/**
 * Calculate actual image size needed for retina displays
 */
export function getRetinaSize(baseSize: number): number {
  const dpr = getDevicePixelRatio()
  return Math.ceil(baseSize * dpr)
}

/**
 * Hook for responsive image sizing
 */
import { useState, useEffect } from 'react'

export function useResponsiveImageSize(type: keyof typeof ImageSizes) {
  const [size, setSize] = useState(() => getOptimalImageSize(type))

  useEffect(() => {
    const handleResize = () => {
      setSize(getOptimalImageSize(type))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [type])

  return size
}

/**
 * Mobile-optimized image quality settings
 */
export function getMobileQuality(): number {
  if (typeof window === 'undefined') return 85

  // Lower quality on slow connections
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    const effectiveType = connection?.effectiveType

    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 60 // Low quality for very slow connections
      case '3g':
        return 75 // Medium quality
      case '4g':
      default:
        return 85 // High quality for fast connections
    }
  }

  return 85
}

/**
 * Preload critical images
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })
}

/**
 * Preload multiple images
 */
export async function preloadImages(urls: string[]): Promise<void> {
  await Promise.all(urls.map(preloadImage))
}
