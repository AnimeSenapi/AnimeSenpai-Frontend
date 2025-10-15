'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '../lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string
  alt: string
  fallbackSrc?: string
  aspectRatio?: 'square' | 'video' | 'poster' | 'banner'
  blur?: boolean
  priority?: boolean
}

/**
 * Optimized Image Component
 * 
 * Features:
 * - Automatic WebP conversion
 * - Lazy loading by default
 * - Blur placeholder
 * - Error fallback
 * - Responsive sizing
 * - Aspect ratio presets
 */
export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/assets/placeholder-anime.jpg',
  aspectRatio,
  blur = true,
  priority = false,
  className,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Aspect ratio classes
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    poster: 'aspect-[2/3]', // Common anime poster ratio
    banner: 'aspect-[16/9]',
  }

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  // Handle image error
  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
    }
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-800/50',
        aspectRatio && aspectRatioClasses[aspectRatio],
        className
      )}
    >
      <Image
        src={imgSrc}
        alt={alt}
        fill={!props.width && !props.height}
        sizes={props.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        quality={85}
        loading={priority ? undefined : 'lazy'}
        priority={priority}
        placeholder={blur ? 'blur' : undefined}
        blurDataURL={blur ? 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==' : undefined}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'object-cover transition-all duration-300',
          isLoading && 'scale-110 blur-md',
          !isLoading && 'scale-100 blur-0',
          hasError && 'opacity-50'
        )}
        {...props}
      />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
      )}

      {/* Error indicator */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
          <p className="text-xs text-gray-500">Image unavailable</p>
        </div>
      )}
    </div>
  )
}

/**
 * Anime Cover Image - Preset for anime covers
 */
export function AnimeCoverImage({
  src,
  alt,
  priority = false,
  className,
}: {
  src: string
  alt: string
  priority?: boolean
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio="poster"
      priority={priority}
      className={cn('rounded-lg', className)}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
    />
  )
}

/**
 * Anime Banner Image - Preset for banners
 */
export function AnimeBannerImage({
  src,
  alt,
  priority = false,
  className,
}: {
  src: string
  alt: string
  priority?: boolean
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio="banner"
      priority={priority}
      className={cn('rounded-xl', className)}
      sizes="100vw"
    />
  )
}

