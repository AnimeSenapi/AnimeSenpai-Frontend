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
      gradient: 'from-orange-500 to-orange-600',
      hoverGradient: 'from-orange-600 to-orange-700',
      icon: '🍥'
    },
    {
      name: 'Netflix',
      url: `https://www.netflix.com/search?q=${searchQuery}`,
      gradient: 'from-red-600 to-red-700',
      hoverGradient: 'from-red-700 to-red-800',
      icon: 'N'
    },
    {
      name: 'Hulu',
      url: `https://www.hulu.com/search?q=${searchQuery}`,
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'from-green-600 to-green-700',
      icon: 'H'
    },
    {
      name: 'Funimation',
      url: `https://www.funimation.com/search/?q=${searchQuery}`,
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'from-purple-600 to-purple-700',
      icon: '🎭'
    }
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Streaming Platforms */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Play className="h-4 w-4 text-primary-400" />
          Watch on Streaming Platforms
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {platforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className={`
                bg-gradient-to-br ${platform.gradient} 
                hover:bg-gradient-to-br hover:${platform.hoverGradient}
                text-white rounded-xl p-4 
                flex flex-col items-center justify-center gap-2
                transition-all duration-200 
                hover:scale-105 hover:shadow-lg hover:shadow-black/30
                active:scale-95
                touch-manipulation
                border border-white/10
              `}>
                <div className="text-2xl font-bold">{platform.icon}</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold">{platform.name}</span>
                  <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
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

