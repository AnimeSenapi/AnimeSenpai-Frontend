'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Share2, Twitter, Download, X, Users, Send, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useToast } from '../ui/toast'
import { useAuth } from '../../app/lib/auth-context'
import { apiGetFriends, apiSendMessage } from '../../app/lib/api'

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
  isFavorite?: boolean
}

export function ShareAnimeCard({ anime, userRating, userStatus, isFavorite }: ShareAnimeCardProps) {
  const { addToast } = useToast()
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [showFriendSelector, setShowFriendSelector] = useState(false)
  const [friends, setFriends] = useState<any[]>([])
  const [loadingFriends, setLoadingFriends] = useState(false)
  const [sendingTo, setSendingTo] = useState<string | null>(null)

  const animeUrl = `${window.location.origin}/anime/${anime.slug}`

  // Generate share text based on user's interaction
  const getShareText = () => {
    const title = anime.titleEnglish || anime.title
    if (userRating && userStatus === 'completed') {
      return `I just finished ${title} and rated it ${userRating}/10! 🎌`
    } else if (userStatus === 'watching') {
      return `Currently watching ${title} on AnimeSenpai! 📺`
    } else if (isFavorite) {
      return `${title} is one of my all-time favorite anime! ⭐`
    } else {
      return `Check out ${title} on AnimeSenpai!`
    }
  }

  // Twitter share with custom text
  const shareToTwitter = () => {
    const text = getShareText()
    const hashtags = 'AnimeSenpai,Anime'
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(animeUrl)}&hashtags=${hashtags}`
    window.open(url, '_blank', 'width=600,height=400')
    addToast({
        title: 'Success',
        description: 'Sharing to Twitter...',
        variant: 'success',
      })
  }

  // Generate share image (for future implementation)
  const generateShareImage = async () => {
    addToast({
        title: 'Feature Preview',
        description: 'Share image generation coming soon!',
        variant: 'default',
      })
    // Future: Generate a beautiful card with anime info for sharing
  }

  // Load friends when friend selector is opened
  useEffect(() => {
    if (showFriendSelector && friends.length === 0) {
      loadFriends()
    }
  }, [showFriendSelector])

  const loadFriends = async () => {
    try {
      setLoadingFriends(true)
      const data = (await apiGetFriends()) as any
      setFriends(data?.friends || [])
    } catch (error) {
      console.error('Failed to load friends:', error)
      addToast({
        title: 'Error',
        description: 'Failed to load friends',
        variant: 'destructive',
      })
    } finally {
      setLoadingFriends(false)
    }
  }

  // Share anime with a specific friend via message
  const shareWithFriend = async (friendId: string, friendName: string) => {
    try {
      setSendingTo(friendId)

      const message = getShareText() + `\n${animeUrl}`
      await apiSendMessage(friendId, message, anime.id)

      addToast({
        title: 'Success',
        description: `Shared with ${friendName}!`,
        variant: 'success',
      })
      setShowFriendSelector(false)
      setShowModal(false)
    } catch (error) {
      console.error('Failed to share with friend:', error)
      addToast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setSendingTo(null)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="py-3 px-4 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        <span className="text-sm font-medium">Share</span>
      </button>

      {/* Share Modal - Using Portal to render at document.body - Mobile Optimized */}
      {showModal &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            style={{
              zIndex: 999999,
              position: 'fixed',
              isolation: 'isolate',
            }}
            onClick={() => setShowModal(false)}
          >
            <div className="glass rounded-2xl max-w-md w-full p-6 relative border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}>
              {/* Close Button - Touch-friendly */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                aria-label="Close share modal"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header - Responsive */}
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 pr-8">
                <Share2 className="h-6 w-6 text-primary-400" />
                Share
              </h3>

              {/* Anime Preview Card - Responsive */}
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
                    <h4 className="text-white font-semibold mb-1 line-clamp-2">{anime.titleEnglish || anime.title}</h4>
                    {anime.titleEnglish && anime.titleEnglish !== anime.title && (
                      <p className="text-gray-400 text-sm mb-2 line-clamp-1">
                        {anime.title}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 items-center">
                      {anime.year && <span className="text-xs text-gray-500">{anime.year}</span>}
                      {anime.type && (
                        <Badge className="bg-primary-500/20 text-primary-400 text-xs px-2 py-0">
                          {anime.type.toUpperCase()}
                        </Badge>
                      )}
                      {(anime.averageRating || (anime as any).rating) && (
                        <div className="flex items-center gap-1 text-xs text-yellow-400">
                          ⭐ {Number(anime.averageRating || (anime as any).rating).toFixed(1)}
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
              <div className="grid grid-cols-2 gap-2">
                {/* Share with Friend - NEW FEATURE */}
                {user && (
                  <button
                    onClick={() => setShowFriendSelector(true)}
                    className="flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-lg bg-white/5 hover:bg-primary-500/10 border border-white/10 hover:border-primary-500/30 transition-all group"
                  >
                      <Users className="h-5 w-5 text-primary-400" />
                    <span className="text-xs font-medium text-white">Friends</span>
                  </button>
                )}

                {/* Twitter - Mobile Optimized */}
                <button
                  onClick={shareToTwitter}
                  className="flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-lg bg-white/5 hover:bg-[#1DA1F2]/10 border border-white/10 hover:border-[#1DA1F2]/30 transition-all group"
                >
                    <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                  <span className="text-xs font-medium text-white">Twitter</span>
                </button>

                {/* Generate Share Image (Coming Soon) - Mobile Optimized */}
                <button
                  onClick={generateShareImage}
                  className="flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group opacity-60"
                >
                  <Download className="h-5 w-5 text-gray-400" />
                  <span className="text-xs font-medium text-white">Image</span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(animeUrl)
                    addToast({
        title: 'Copied',
        description: 'Link copied to clipboard!',
        variant: 'success',
      })
                  }}
                  className="flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                >
                  <Share2 className="h-5 w-5 text-gray-400" />
                  <span className="text-xs font-medium text-white">Copy</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Friend Selector Modal */}
      {showFriendSelector &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            style={{
              zIndex: 1000000,
              position: 'fixed',
              isolation: 'isolate',
            }}
            onClick={() => setShowFriendSelector(false)}
          >
            <div className="glass rounded-2xl max-w-md w-full p-6 relative border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}>
              {/* Close Button */}
              <button
                onClick={() => setShowFriendSelector(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                aria-label="Close friend selector"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 pr-8">
                <Users className="h-6 w-6 text-primary-400" />
                Share with Friend
              </h3>

              {/* Anime Preview - Compact */}
              <div className="bg-white/5 rounded-lg p-3 mb-4 border border-white/10">
                <div className="flex gap-3 items-center">
                  {anime.coverImage && (
                    <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={anime.coverImage}
                        alt={anime.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm line-clamp-1">
                      {anime.titleEnglish || anime.title}
                    </h4>
                    <p className="text-gray-400 text-xs line-clamp-1">{getShareText()}</p>
                  </div>
                </div>
              </div>

              {/* Friends List */}
              <div className="flex-1 overflow-y-auto -mx-4 px-4">
                {loadingFriends ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No friends yet</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Add friends to share anime with them!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends.map((friend: any) => (
                      <button
                        key={friend.id}
                        onClick={() => shareWithFriend(friend.id, friend.username)}
                        disabled={sendingTo === friend.id}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {friend.avatar ? (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={friend.avatar}
                              alt={friend.username}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 text-primary-400" />
                          </div>
                        )}
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-white font-medium text-sm truncate">
                            {friend.username}
                          </p>
                          <p className="text-gray-400 text-xs truncate">@{friend.username}</p>
                        </div>
                        {sendingTo === friend.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary-400" />
                        ) : (
                          <Send className="h-4 w-4 text-gray-400 group-hover:text-primary-400 transition-colors" />
                        )}
                      </button>
                    ))}
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
