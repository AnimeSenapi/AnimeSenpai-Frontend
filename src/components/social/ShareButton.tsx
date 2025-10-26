'use client'

import { useState } from 'react'
import { Share2, Twitter, Facebook, MessageCircle, Check, Copy } from 'lucide-react'
import { Button } from '../ui/button'
import { useToast } from '../ui/toast'

interface ShareButtonProps {
  title: string
  url: string
  description?: string
  hashtags?: string[]
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  showLabel?: boolean
}

export function ShareButton({
  title,
  url,
  description,
  hashtags = ['AnimeSenpai', 'Anime'],
  variant = 'outline',
  size = 'default',
  showLabel = true,
}: ShareButtonProps) {
  const { addToast } = useToast()
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  // Full URL (in case relative URL is passed)
  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`

  // Encode for URLs
  const encodedUrl = encodeURIComponent(fullUrl)
  const encodedTitle = encodeURIComponent(title)
  const hashtagString = hashtags.map((tag) => tag.replace(/^#/, '')).join(',')

  // Share URLs for different platforms
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=${hashtagString}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    discord: fullUrl, // Discord uses native share or copy link
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
  }

  // Native Share API (for mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: fullUrl,
        })
        addToast({
        title: 'Success',
        description: 'Shared successfully!',
        variant: 'success',
      })
        setShowMenu(false)
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err)
          handleCopyLink()
        }
      }
    } else {
      setShowMenu(!showMenu)
    }
  }

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      addToast({
        title: 'Copied',
        description: 'Link copied to clipboard!',
        variant: 'success',
      })
      setTimeout(() => {
        setCopied(false)
        setShowMenu(false)
      }, 2000)
    } catch (err) {
      console.error('Copy failed:', err)
      addToast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      })
    }
  }

  // Share to specific platform
  const handleShare = (platform: keyof typeof shareUrls) => {
    if (platform === 'discord') {
      handleCopyLink()
      addToast({
        title: 'Discord',
        description: 'Link copied! Paste it in Discord',
        variant: 'default',
      })
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
      addToast({
        title: 'Shared'
      ,
        description: 
        `Sharing to ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`,
        variant: 'success',
      })
    }
    setShowMenu(false)
  }

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={handleNativeShare}
        className={variant === 'outline' ? 'border-white/20 text-white hover:bg-white/10' : ''}
      >
        <Share2 className="h-4 w-4" />
        {showLabel && <span className="ml-2">Share</span>}
      </Button>

      {/* Share Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 glass rounded-xl shadow-2xl z-50 overflow-hidden border border-white/10 animate-in slide-in-from-top-2 duration-200">
            <div className="p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </h3>

              {/* Social Platform Buttons */}
              <div className="space-y-2">
                {/* Twitter */}
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="w-8 h-8 bg-[#1DA1F2]/20 rounded-lg flex items-center justify-center group-hover:bg-[#1DA1F2]/30 transition-colors">
                    <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                  </div>
                  <span className="text-white text-sm">Twitter</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="w-8 h-8 bg-[#1877F2]/20 rounded-lg flex items-center justify-center group-hover:bg-[#1877F2]/30 transition-colors">
                    <Facebook className="h-4 w-4 text-[#1877F2]" />
                  </div>
                  <span className="text-white text-sm">Facebook</span>
                </button>

                {/* Discord */}
                <button
                  onClick={() => handleShare('discord')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="w-8 h-8 bg-[#5865F2]/20 rounded-lg flex items-center justify-center group-hover:bg-[#5865F2]/30 transition-colors">
                    <MessageCircle className="h-4 w-4 text-[#5865F2]" />
                  </div>
                  <span className="text-white text-sm">Discord</span>
                </button>

                {/* Reddit */}
                <button
                  onClick={() => handleShare('reddit')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="w-8 h-8 bg-[#FF4500]/20 rounded-lg flex items-center justify-center group-hover:bg-[#FF4500]/30 transition-colors">
                    <svg className="h-4 w-4 text-[#FF4500]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                    </svg>
                  </div>
                  <span className="text-white text-sm">Reddit</span>
                </button>

                <div className="border-t border-white/10 my-2"></div>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
                    {copied ? (
                      <Check className="h-4 w-4 text-success-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-primary-400" />
                    )}
                  </div>
                  <span className="text-white text-sm">{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
