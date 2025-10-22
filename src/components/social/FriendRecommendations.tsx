'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useToast } from '../ui/toast'
import { Users, Star, Sparkles, UserPlus, Check } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface FriendRecommendation {
  friend: {
    id: string
    username: string
    avatar?: string
  }
  anime: {
    id: string
    slug: string
    title: string
    coverImage?: string
    rating?: number
    genres?: string[]
  }
  friendRating?: number
  matchScore?: number
}

interface FriendRecommendationsProps {
  recommendations: FriendRecommendation[]
  onAddToList?: (animeId: string) => void
}

export function FriendRecommendations({
  recommendations,
  onAddToList,
}: FriendRecommendationsProps) {
  const toast = useToast()
  const [added, setAdded] = useState<Set<string>>(new Set())

  const handleAdd = async (animeId: string) => {
    if (onAddToList) {
      onAddToList(animeId)
    }

    setAdded((prev) => new Set([...prev, animeId]))
    toast.success('Added to your list!')
  }

  if (recommendations.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center border border-white/10">
        <Users className="w-12 h-12 text-gray-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-white mb-2">No friend recommendations yet</h3>
        <p className="text-gray-400">Add friends to see what they're watching!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => {
        const isAdded = added.has(rec.anime.id)

        return (
          <div
            key={`${rec.friend.id}-${rec.anime.id}`}
            className="glass rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex gap-4">
              {/* Anime Cover */}
              <Link href={`/anime/${rec.anime.slug}`} className="flex-shrink-0">
                <img
                  src={rec.anime.coverImage || '/placeholder-anime.jpg'}
                  alt={rec.anime.title}
                  className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-lg hover:opacity-80 transition-opacity"
                />
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Friend Info */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-xs font-bold">
                    {rec.friend.avatar ? (
                      <img src={rec.friend.avatar} alt="" className="w-full h-full rounded-full" />
                    ) : (
                      rec.friend.username?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <Link
                    href={`/user/${rec.friend.username}`}
                    className="text-sm font-medium text-primary-300 hover:text-primary-200 transition-colors"
                  >
                    {rec.friend.username}
                  </Link>
                  <span className="text-xs text-gray-500">recommends</span>
                </div>

                {/* Anime Title */}
                <Link href={`/anime/${rec.anime.slug}`}>
                  <h4 className="font-bold text-white hover:text-primary-300 transition-colors mb-2 line-clamp-2">
                    {rec.anime.title}
                  </h4>
                </Link>

                {/* Rating & Match */}
                <div className="flex items-center gap-3 mb-3">
                  {rec.friendRating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-white">{rec.friendRating}/10</span>
                      <span className="text-xs text-gray-500">by friend</span>
                    </div>
                  )}

                  {rec.matchScore && rec.matchScore > 70 && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {rec.matchScore}% match
                    </Badge>
                  )}
                </div>

                {/* Genres */}
                {rec.anime.genres && rec.anime.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {rec.anime.genres.slice(0, 3).map((genre, i) => (
                      <Badge
                        key={i}
                        className="bg-white/5 text-gray-400 border-white/10 text-xs px-2 py-0.5"
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action */}
                <Button
                  onClick={() => handleAdd(rec.anime.id)}
                  disabled={isAdded}
                  size="sm"
                  className={cn(
                    'w-full sm:w-auto',
                    isAdded
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600'
                  )}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Added
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add to List
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
