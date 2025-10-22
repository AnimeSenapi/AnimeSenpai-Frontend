'use client'

import { ExternalLink, Play } from 'lucide-react'

interface StreamingLinksProps {
  animeTitle: string
  className?: string
}

/**
 * StreamingLinks Component
 *
 * Provides quick links to popular streaming platforms
 * Only shows platforms where the anime is actually available
 */
export function StreamingLinks({ animeTitle, className = '' }: StreamingLinksProps) {
  const searchQuery = encodeURIComponent(animeTitle)

  // Only include platforms where anime is commonly available
  const platforms = [
    {
      name: 'Crunchyroll',
      url: `https://www.crunchyroll.com/search?q=${searchQuery}`,
    },
    {
      name: 'Netflix',
      url: `https://www.netflix.com/search?q=${searchQuery}`,
    },
    {
      name: 'Hulu',
      url: `https://www.hulu.com/search?q=${searchQuery}`,
    },
    {
      name: 'Funimation',
      url: `https://www.funimation.com/search/?q=${searchQuery}`,
    },
  ]

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Streaming Platforms */}
      <div>
        <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-2">
          <Play className="h-3 w-3 text-primary-400" />
          Watch on Streaming Platforms
        </h4>
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div
                className="
                bg-white/10 hover:bg-white/20
                text-white rounded-lg px-3 py-2
                flex items-center gap-2
                transition-all duration-200 
                hover:scale-105
                active:scale-95
                touch-manipulation
                border border-white/20
              "
              >
                <span className="text-sm font-medium">{platform.name}</span>
                <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
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
