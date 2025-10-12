'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Share2, Twitter, Download, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useToast } from '../../lib/toast-context'
import type { Anime } from '../../types/anime'

interface ShareAnimeCardProps {
  anime: {
    id: string
    slug: string
    title: string
    titleEnglish?: string
    coverImage?: string
    year?: number
    averageRating?: number
    genres?: Array<{ id: string; name: string }>
    type?: string
  }
  userRating?: number
  userStatus?: string
}

export function ShareAnimeCard({ anime, userRating, userStatus }: ShareAnimeCardProps) {
  const toast = useToast()
  const [showModal, setShowModal] = useState(false)

  const animeUrl = `${window.location.origin}/anime/${anime.slug}`
  
  // Generate share text based on user's interaction
  const getShareText = () => {
    if (userRating && userStatus === 'completed') {
      return `I just finished ${anime.title} and rated it ${userRating}/10! 🎌`
    } else if (userStatus === 'watching') {
      return `Currently watching ${anime.title} on AnimeSenpai! 📺`
    } else if (userStatus === 'favorite') {
      return `${anime.title} is one of my all-time favorite anime! ⭐`
    } else {
      return `Check out ${anime.title} on AnimeSenpai!`
    }
  }

  // Twitter share with custom text
  const shareToTwitter = () => {
    const text = getShareText()
    const hashtags = 'AnimeSenpai,Anime'
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(animeUrl)}&hashtags=${hashtags}`
    window.open(url, '_blank', 'width=600,height=400')
    toast.success('Sharing to Twitter...', 'Success')
  }

  // Generate share image (for future implementation)
  const generateShareImage = async () => {
    toast.info('Share image generation coming soon!', 'Feature Preview')
    // Future: Generate a beautiful card with anime info for sharing
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className="border-white/20 text-white hover:bg-white/10"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      {/* Share Modal - Using Portal to render at document.body */}
      {showModal && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          style={{ 
            zIndex: 999999,
            position: 'fixed',
            isolation: 'isolate'
          }}
        >
          <div className="glass rounded-2xl max-w-md w-full p-6 relative border border-white/10 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Share2 className="h-6 w-6 text-primary-400" />
              Share Anime
            </h3>

            {/* Anime Preview Card */}
            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
              <div className="flex gap-4">
                {anime.coverImage && (
                  <div className="relative w-20 h-28 rounded-lg overflow-hidden">
                    <Image
                      src={anime.coverImage}
                      alt={anime.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold mb-1 line-clamp-2">
                    {anime.title}
                  </h4>
                  {anime.titleEnglish && anime.titleEnglish !== anime.title && (
                    <p className="text-gray-400 text-sm mb-2 line-clamp-1">
                      {anime.titleEnglish}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 items-center">
                    {anime.year && (
                      <span className="text-xs text-gray-500">{anime.year}</span>
                    )}
                    {anime.type && (
                      <Badge className="bg-primary-500/20 text-primary-400 text-xs px-2 py-0">
                        {anime.type.toUpperCase()}
                      </Badge>
                    )}
                    {anime.averageRating && (
                      <div className="flex items-center gap-1 text-xs text-yellow-400">
                        ⭐ {anime.averageRating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User's Interaction */}
              {(userRating || userStatus) && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-sm">
                    {userStatus && (
                      <Badge className="bg-secondary-500/20 text-secondary-400 text-xs">
                        {userStatus.replace('_', ' ').toUpperCase()}
                      </Badge>
                    )}
                    {userRating && (
                      <span className="text-primary-400 font-semibold">
                        My Rating: {userRating}/10
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Share Text Preview */}
            <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/10">
              <p className="text-sm text-gray-300 italic">"{getShareText()}"</p>
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              {/* Twitter */}
              <button
                onClick={shareToTwitter}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/20 transition-colors group"
              >
                <div className="w-10 h-10 bg-[#1DA1F2]/20 rounded-lg flex items-center justify-center group-hover:bg-[#1DA1F2]/30 transition-colors">
                  <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">Share on Twitter</p>
                  <p className="text-gray-400 text-xs">Post to your timeline</p>
                </div>
              </button>

              {/* Generate Share Image (Coming Soon) */}
              <button
                onClick={generateShareImage}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
              >
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
                  <Download className="h-5 w-5 text-primary-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">Download Share Card</p>
                    <Badge className="bg-warning-500/20 text-warning-400 text-xs px-2 py-0">
                      Soon
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-xs">Generate beautiful share image</p>
                </div>
              </button>

              {/* Copy Link */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(animeUrl)
                  toast.success('Link copied to clipboard!', 'Copied')
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
              >
                <div className="w-10 h-10 bg-secondary-500/20 rounded-lg flex items-center justify-center group-hover:bg-secondary-500/30 transition-colors">
                  <Share2 className="h-5 w-5 text-secondary-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">Copy Link</p>
                  <p className="text-gray-400 text-xs truncate">{animeUrl}</p>
                </div>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

