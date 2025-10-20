'use client'

import { ExternalLink } from 'lucide-react'
import { Button } from '../ui/button'

interface StreamingLinksProps {
  animeTitle: string
  className?: string
}

/**
 * StreamingLinks Component
 * 
 * Provides quick links to popular streaming platforms
 * Links are constructed based on anime title for search convenience
 */
export function StreamingLinks({ animeTitle, className = '' }: StreamingLinksProps) {
  const searchQuery = encodeURIComponent(animeTitle)
  
  const platforms = [
    {
      name: 'Crunchyroll',
      url: `https://www.crunchyroll.com/search?q=${searchQuery}`,
      color: 'bg-orange-500 hover:bg-orange-600',
      logo: '🍥'
    },
    {
      name: 'Funimation',
      url: `https://www.funimation.com/search/?q=${searchQuery}`,
      color: 'bg-purple-500 hover:bg-purple-600',
      logo: '🎭'
    },
    {
      name: 'Netflix',
      url: `https://www.netflix.com/search?q=${searchQuery}`,
      color: 'bg-red-600 hover:bg-red-700',
      logo: 'N'
    },
    {
      name: 'Hulu',
      url: `https://www.hulu.com/search?q=${searchQuery}`,
      color: 'bg-green-500 hover:bg-green-600',
      logo: 'H'
    }
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Streaming Platforms */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Watch on Streaming Platforms</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {platforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className={`${platform.color} text-white rounded-lg p-3 flex items-center justify-between transition-all hover:scale-105 active:scale-95 touch-manipulation`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{platform.logo}</span>
                  <span className="text-sm font-medium">{platform.name}</span>
                </div>
                <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100" />
              </div>
            </a>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 italic">
        * Links open search results on each platform. Availability may vary by region.
      </p>
    </div>
  )
}

