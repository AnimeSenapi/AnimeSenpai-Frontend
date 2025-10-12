'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Play, X } from 'lucide-react'
import { Button } from '../ui/button'

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
        /youtube\.com\/v\/([^&\n?#]+)/
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
          
          {/* Close Button */}
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-black/80 hover:bg-black rounded-full flex items-center justify-center transition-colors z-10"
          >
            <X className="h-5 w-5 text-white" />
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

  const getYouTubeId = (url: string): string | null => {
    try {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/
      ]

      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match && match[1]) {
          return match[1]
        }
      }

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

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="bg-primary-500 hover:bg-primary-600 text-white"
      >
        <Play className="h-4 w-4 mr-2" />
        Watch Trailer
      </Button>

      {showModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 lg:p-8"
          style={{ 
            zIndex: 999999,
            position: 'fixed',
            isolation: 'isolate'
          }}
          onClick={() => setShowModal(false)}
        >
          <div 
            className="w-full max-w-4xl relative"
            style={{ zIndex: 1000000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={`${title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
              
              {/* Close Button - Touch-friendly */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute -top-10 sm:-top-12 right-0 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-white/20 touch-manipulation"
                aria-label="Close trailer"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}


