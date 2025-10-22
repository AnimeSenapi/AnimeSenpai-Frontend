'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/app/lib/utils'

interface OptimizedAnimeImageProps {
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  onLoad?: () => void
  onError?: () => void
}

const ANIME_PLACEHOLDER = '/assets/anime-placeholder.jpg'
const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzExMTgyNyIvPjwvc3ZnPg=='

export function OptimizedAnimeImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  quality = 85,
  placeholder = 'blur',
  onLoad,
  onError,
}: OptimizedAnimeImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const imageSrc = imageError || !src ? ANIME_PLACEHOLDER : src

  // Responsive sizes for different breakpoints
  const defaultSizes =
    sizes ||
    (fill
      ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
      : width && width < 200
        ? '(max-width: 640px) 150px, 180px'
        : '(max-width: 640px) 200px, 250px')

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {fill ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes={defaultSizes}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={placeholder === 'blur' ? BLUR_DATA_URL : undefined}
          className={cn(
            'object-cover transition-all duration-300',
            isLoading && 'scale-110 blur-sm',
            !isLoading && 'scale-100 blur-0'
          )}
          onLoad={() => {
            setIsLoading(false)
            onLoad?.()
          }}
          onError={() => {
            setImageError(true)
            setIsLoading(false)
            onError?.()
          }}
        />
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          width={width || 200}
          height={height || 300}
          sizes={defaultSizes}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={placeholder === 'blur' ? BLUR_DATA_URL : undefined}
          className={cn(
            'transition-all duration-300',
            isLoading && 'scale-110 blur-sm opacity-0',
            !isLoading && 'scale-100 blur-0 opacity-100'
          )}
          onLoad={() => {
            setIsLoading(false)
            onLoad?.()
          }}
          onError={() => {
            setImageError(true)
            setIsLoading(false)
            onError?.()
          }}
        />
      )}

      {/* Loading Shimmer */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      )}
    </div>
  )
}

// Preload critical images
export function preloadImage(src: string) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = src
  document.head.appendChild(link)
}

// Prefetch images for next page
export function prefetchImages(srcs: string[]) {
  if (typeof window === 'undefined') return

  srcs.forEach((src) => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)
  })
}
