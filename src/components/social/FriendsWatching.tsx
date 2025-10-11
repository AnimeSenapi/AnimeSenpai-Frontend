'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Users, TrendingUp, Loader2, User } from 'lucide-react'
import { useAuth } from '../../app/lib/auth-context'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface FriendRecommendation {
  anime: {
    id: string
    slug: string
    title: string
    coverImage?: string
    year?: number
    averageRating?: number
    genres?: Array<{ id: string; name: string }>
  }
  friendCount: number
  averageFriendRating?: number
  friendNames: string[]
  reason: string
}

export function FriendsWatching() {
  const { getAuthHeaders, user } = useAuth()
  const [recommendations, setRecommendations] = useState<FriendRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchFriendRecommendations()
    } else {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchFriendRecommendations = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${API_URL}/social.getFriendRecommendations?input=${encodeURIComponent(JSON.stringify({ limit: 12 }))}`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      )

      const data = await response.json()

      if (data.error) {
        setError(data.error.message || 'Failed to load recommendations')
        return
      }

      if (data.result?.data?.recommendations) {
        setRecommendations(data.result.data.recommendations)
      }
    } catch (err) {
      console.error('Error fetching friend recommendations:', err)
      setError('Failed to load recommendations')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || isLoading) {
    return (
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">What Friends Are Watching</h2>
            <p className="text-gray-400 text-sm">Popular among people you follow</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary-400 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || recommendations.length === 0) {
    return null // Hide if no data
  }

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">What Friends Are Watching</h2>
            <p className="text-gray-400 text-sm">Popular among people you follow</p>
          </div>
        </div>

        <Link
          href="/social/friends"
          className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
        >
          View All Friends →
        </Link>
      </div>

      {/* Anime Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {recommendations.map((rec) => (
          <Link
            key={rec.anime.id}
            href={`/anime/${rec.anime.slug}`}
            className="group relative"
          >
            {/* Anime Card */}
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
              {rec.anime.coverImage ? (
                <Image
                  src={rec.anime.coverImage}
                  alt={rec.anime.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <span className="text-gray-500 text-sm text-center px-2">{rec.anime.title}</span>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

              {/* Friend Count Badge */}
              <div className="absolute top-2 right-2">
                <div className="bg-primary-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Users className="h-3 w-3" />
                  {rec.friendCount}
                </div>
              </div>

              {/* Info on Hover */}
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                  {rec.anime.title}
                </h3>

                {/* Friend Names */}
                <p className="text-xs text-gray-300 mb-2 line-clamp-1">
                  {rec.friendNames.slice(0, 2).map((name, i) => (
                    <span key={i}>
                      @{name}
                      {i < Math.min(rec.friendNames.length - 1, 1) ? ', ' : ''}
                    </span>
                  ))}
                  {rec.friendNames.length > 2 && ` +${rec.friendNames.length - 2} more`}
                </p>

                {/* Rating */}
                {rec.averageFriendRating && (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1 text-xs text-yellow-400">
                      <TrendingUp className="h-3 w-3" />
                      <span>{rec.averageFriendRating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-gray-400">avg friend rating</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
