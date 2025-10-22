'use client'

import { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'
import { useIntersectionObserver } from '../hooks/use-performance'

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  /**
   * Enable lazy loading with Intersection Observer
   */
  lazy?: boolean

  /**
   * Intersection threshold (0-1)
   */
  threshold?: number

  /**
   * Root margin for lazy loading (e.g., "200px" to load 200px before entering viewport)
   */
  rootMargin?: string

  /**
   * Placeholder type
   */
  placeholderType?: 'blur' | 'skeleton' | 'none'

  /**
   * Custom skeleton color
   */
  skeletonColor?: string

  /**
   * Callback when image loads
   */
  onLoad?: () => void

  /**
   * Callback when image errors
   */
  onError?: () => void
}

/**
 * Optimized Image Component
 * Features:
 * - Lazy loading with Intersection Observer
 * - Automatic blur placeholder
 * - Skeleton loading state
 * - Error handling with fallback
 * - Performance optimizations
 */
export function OptimizedImage({
  src,
  alt,
  lazy = true,
  threshold = 0.1,
  rootMargin = '200px',
  placeholderType = 'skeleton',
  skeletonColor = 'rgba(255, 255, 255, 0.05)',
  onLoad,
  onError,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(!lazy)

  // Intersection Observer for lazy loading
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
  })

  // Trigger loading when image enters viewport
  useEffect(() => {
    if (lazy && isIntersecting && !shouldLoad) {
      setShouldLoad(true)
    }
  }, [isIntersecting, lazy, shouldLoad])

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  // Handle image error
  const handleError = () => {
    setHasError(true)
    setIsLoaded(true)
    onError?.()
  }

  return (
    <div
      ref={ref as any}
      className={`relative overflow-hidden ${className}`}
      style={props.fill ? undefined : { width: props.width, height: props.height }}
    >
      {/* Skeleton/Placeholder */}
      {!isLoaded && placeholderType !== 'none' && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundColor: skeletonColor,
          }}
          aria-hidden="true"
        />
      )}

      {/* Error Fallback */}
      {hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-800/50 text-gray-400 text-xs"
          role="img"
          aria-label={`Failed to load: ${alt}`}
        >
          <div className="text-center p-2">
            <svg
              className="w-8 h-8 mx-auto mb-1 opacity-30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-[10px]">Image unavailable</span>
          </div>
        </div>
      )}

      {/* Actual Image */}
      {shouldLoad && !hasError && (
        <Image
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading={lazy ? 'lazy' : 'eager'}
          quality={90}
          {...props}
        />
      )}
    </div>
  )
}

/**
 * Optimized Background Image Component
 * For hero sections, banners, etc.
 */
interface OptimizedBackgroundImageProps {
  src: string
  alt: string
  className?: string
  overlay?: boolean
  overlayOpacity?: number
  children?: React.ReactNode
  lazy?: boolean
}

export function OptimizedBackgroundImage({
  src,
  alt,
  className = '',
  overlay = true,
  overlayOpacity = 0.6,
  children,
  lazy = true,
}: OptimizedBackgroundImageProps) {
  return (
    <div className={`relative ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        style={{ objectFit: 'cover' }}
        lazy={lazy}
        placeholderType="blur"
        priority={!lazy}
      />

      {overlay && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"
          style={{ opacity: overlayOpacity }}
          aria-hidden="true"
        />
      )}

      {children && <div className="relative z-10">{children}</div>}
    </div>
  )
}

/**
 * Avatar Image with fallback
 */
interface AvatarImageProps {
  src?: string | null
  alt: string
  size?: number
  className?: string
  fallbackText?: string
}

export function AvatarImage({
  src,
  alt,
  size = 40,
  className = '',
  fallbackText,
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false)

  const initials = fallbackText || alt.charAt(0).toUpperCase()

  if (!src || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-secondary-500/20 text-white font-semibold ${className}`}
        style={{ width: size, height: size }}
        role="img"
        aria-label={alt}
      >
        {initials}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`object-cover ${className}`}
      onError={() => setHasError(true)}
      lazy={false}
      placeholderType="none"
    />
  )
}
