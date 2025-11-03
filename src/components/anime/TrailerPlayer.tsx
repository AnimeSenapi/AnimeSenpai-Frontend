'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Play, X } from 'lucide-react'

interface TrailerPlayerProps {
  trailerUrl: string
  title: string
  className?: string
}

export function TrailerPlayer({ trailerUrl, title, className = '' }: TrailerPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string): string | null => {
    try {
      // Handle different YouTube URL formats
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
      ]

      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match && match[1]) {
          return match[1]
        }
      }

      // If URL is already just the ID
      if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return url
      }

      return null
    } catch {
      return null
    }
  }

  const videoId = getYouTubeId(trailerUrl)

  if (!videoId) {
    return null
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`

  return (
    <div className={`relative ${className}`}>
      {!isPlaying ? (
        // Thumbnail with Play Button - Responsive
        <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden group cursor-pointer bg-gray-900">
          <Image
            src={thumbnailUrl}
            alt={`${title} Trailer`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>

          {/* Play Button - Touch-friendly */}
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center touch-manipulation"
            aria-label="Play trailer"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-500/90 hover:bg-primary-500 active:bg-primary-600 rounded-full flex items-center justify-center transition-all duration-200 transform group-hover:scale-110 active:scale-95 shadow-2xl">
              <Play className="h-8 w-8 sm:h-10 sm:w-10 text-white ml-1" fill="white" />
            </div>
          </button>

          {/* Trailer Badge - Responsive */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
            <div className="glass rounded-md sm:rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5 sm:gap-2">
              <Play className="h-3 w-3 sm:h-4 sm:w-4 text-primary-400" />
              <span className="text-white font-semibold text-xs sm:text-sm">Trailer</span>
            </div>
          </div>

          {/* Duration/Info - Responsive */}
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4">
            <div className="glass rounded-md sm:rounded-lg px-2 py-1 sm:px-3 sm:py-1.5">
              <span className="text-white text-xs font-medium">Watch Trailer</span>
            </div>
          </div>
        </div>
      ) : (
        // YouTube Embed
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
          <iframe
            src={embedUrl}
            title={`${title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />

          {/* Close Button - Mobile Optimized */}
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 w-12 h-12 sm:w-10 sm:h-10 bg-black/80 hover:bg-black active:bg-black/90 rounded-full flex items-center justify-center transition-colors z-10 touch-manipulation"
            aria-label="Close trailer"
          >
            <X className="h-6 w-6 sm:h-5 sm:w-5 text-white" />
          </button>
        </div>
      )}
    </div>
  )
}

// Compact inline trailer button
interface TrailerButtonProps {
  trailerUrl: string
  title: string
}

export function TrailerButton({ trailerUrl, title }: TrailerButtonProps) {
  const [showModal, setShowModal] = useState(false)

  // Normalize URL - ensure it has protocol
  const normalizeUrl = (url: string): string => {
    if (!url) return ''
    const trimmed = url.trim()
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`
    }
    return trimmed
  }

  // Extract YouTube video ID from any YouTube URL format
  const getYouTubeId = (url: string): string | null => {
    try {
      if (!url) return null
      
      const normalized = normalizeUrl(url)
      
      // Pattern 1: youtube.com/watch?v=VIDEO_ID
      const watchMatch = normalized.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/)
      if (watchMatch && watchMatch[1]) {
        return watchMatch[1]
      }
      
      // Pattern 2: youtu.be/VIDEO_ID
      const shortMatch = normalized.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
      if (shortMatch && shortMatch[1]) {
        return shortMatch[1]
      }
      
      // Pattern 3: youtube.com/embed/VIDEO_ID or youtube-nocookie.com/embed/VIDEO_ID
      const embedMatch = normalized.match(/(?:youtube\.com|youtube-nocookie\.com)\/embed\/([a-zA-Z0-9_-]{11})/)
      if (embedMatch && embedMatch[1]) {
        return embedMatch[1]
      }
      
      // Pattern 4: youtube.com/v/VIDEO_ID
      const vMatch = normalized.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/)
      if (vMatch && vMatch[1]) {
        return vMatch[1]
      }
      
      // Pattern 5: Direct video ID (11 characters)
      const directMatch = normalized.match(/([a-zA-Z0-9_-]{11})/)
      if (directMatch && directMatch[1] && !normalized.includes('youtube')) {
        // Only accept as direct ID if it's not part of a URL structure
        const isDirectId = normalized.split('/').length === 1 || 
                          normalized.endsWith(directMatch[1]) ||
                          normalized.match(/^https?:\/\/[^/]*\/[a-zA-Z0-9_-]{11}/)
        if (isDirectId) {
          return directMatch[1]
        }
      }

      // Pattern 6: Extract from URL params
      try {
        const urlObj = new URL(normalized)
        const vidId = urlObj.searchParams.get('v')
        if (vidId && vidId.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(vidId)) {
          return vidId
        }
      } catch {
        // Not a valid URL, continue
      }

      return null
    } catch {
      return null
    }
  }

  // Convert YouTube URL to embed format
  const getEmbedUrl = (url: string): string => {
    const videoId = getYouTubeId(url)
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`
    }
    
    // If no video ID found but it's a YouTube URL, try to extract manually
    const normalized = normalizeUrl(url)
    
    // Check if it's already an embed URL (youtube.com or youtube-nocookie.com)
    if (normalized.includes('youtube.com/embed/') || normalized.includes('youtube-nocookie.com/embed/')) {
      // If it already has query params, append; otherwise add
      const separator = normalized.includes('?') ? '&' : '?'
      // Ensure autoplay is set
      let finalUrl = normalized
      if (!normalized.includes('autoplay=1')) {
        finalUrl = `${normalized}${separator}autoplay=1&mute=0`
      }
      return finalUrl
    }
    
    if (normalized.includes('youtube.com') || normalized.includes('youtube-nocookie.com') || normalized.includes('youtu.be')) {
      // Last resort: try to find any 11-character ID in the URL
      const idMatch = normalized.match(/([a-zA-Z0-9_-]{11})/)
      if (idMatch && idMatch[1]) {
        return `https://www.youtube.com/embed/${idMatch[1]}?autoplay=1&mute=0&rel=0&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`
      }
    }
    
    return ''
  }

  // Compute values
  const normalizedUrl = normalizeUrl(trailerUrl)
  const embedUrl = getEmbedUrl(trailerUrl)

  // Always render the button if we have a trailer URL, even if format isn't recognized
  // The modal will handle invalid URLs gracefully
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="py-3 px-4 rounded-lg bg-gradient-to-r from-primary-500/10 to-primary-600/10 hover:from-primary-500/20 hover:to-primary-600/20 border border-primary-500/20 hover:border-primary-500/40 text-primary-400 hover:text-primary-300 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
      >
        <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center">
          <Play className="h-3 w-3 fill-current" />
        </div>
        <span className="text-sm font-semibold">Trailer</span>
      </button>

      {showModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 lg:p-8 animate-in fade-in duration-200"
            style={{
              zIndex: 999999,
              position: 'fixed',
              isolation: 'isolate',
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              className="w-full max-w-5xl relative animate-in zoom-in-95 duration-300"
              style={{ zIndex: 1000000 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center border border-primary-500/30">
                    <Play className="h-5 w-5 text-primary-400" fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg sm:text-xl">{title}</h3>
                    <p className="text-gray-400 text-sm">Official Trailer</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 flex items-center justify-center transition-all backdrop-blur-sm touch-manipulation hover:scale-110 active:scale-95"
                  aria-label="Close trailer"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-2xl border-2 border-white/20 ring-4 ring-primary-500/20">
                {embedUrl ? (
                  <iframe
                    key={embedUrl}
                    src={embedUrl}
                    title={`${title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="w-full h-full"
                    frameBorder="0"
                    style={{ border: 'none' }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 to-black">
                    <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                      <Play className="h-8 w-8 text-gray-500" />
                    </div>
                    <p className="text-white text-lg font-semibold mb-2">Unable to load trailer</p>
                    <p className="text-gray-400 text-sm mb-6 text-center max-w-md">The trailer URL format is not recognized. You can try opening it directly in a new tab.</p>
                    <a
                      href={normalizedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-primary-500/50"
                    >
                      Open Trailer in New Tab
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
