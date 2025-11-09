'use client'

import { useState } from 'react'
import { Badge } from '../ui/badge'
import { useToast } from '../ui/toast'
import { useAuth } from '@/app/lib/auth-context'
import {
  Star,
  ThumbsUp,
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  Share2,
} from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface Review {
  id: string
  userId: string
  user: {
    id: string
    username: string
    name?: string
    avatar?: string
  }
  rating: number
  comment: string
  helpful: number
  isHelpful?: boolean
  createdAt: string
  updatedAt: string
}

interface ReviewListProps {
  animeId: string
  reviews: Review[]
  onReviewUpdate: () => void
}

export function ReviewList({ animeId: _animeId, reviews, onReviewUpdate }: ReviewListProps) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set())

  const toggleExpand = (reviewId: string) => {
    setExpandedReviews((prev) => {
      const next = new Set(prev)
      if (next.has(reviewId)) {
        next.delete(reviewId)
      } else {
        next.add(reviewId)
      }
      return next
    })
  }

  const handleLike = async (reviewId: string) => {
    try {
      // Toggle like
      const isLiked = likedReviews.has(reviewId)

      // Optimistic update
      setLikedReviews((prev) => {
        const next = new Set(prev)
        if (isLiked) {
          next.delete(reviewId)
        } else {
          next.add(reviewId)
        }
        return next
      })

      // API call
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews.${isLiked ? 'unlike' : 'like'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ reviewId }),
      })

      onReviewUpdate()
    } catch (error) {
      // Revert on error
      setLikedReviews((prev) => {
        const next = new Set(prev)
        if (likedReviews.has(reviewId)) {
          next.delete(reviewId)
        } else {
          next.add(reviewId)
        }
        return next
      })
      addToast({
        title: 'Success',
        description: 'Like updated successfully',
        variant: 'success',
      })
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews.delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ reviewId }),
      })

      addToast({
        title: 'Success',
        description: 'Review deleted successfully',
        variant: 'success',
      })
      onReviewUpdate()
    } catch (error) {
      addToast({
        title: 'Error',
        description: 'Failed to delete review',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 30) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (reviews.length === 0) {
    return (
      <div className="glass rounded-xl p-12 text-center border border-white/10">
        <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">No reviews yet</h3>
        <p className="text-gray-400">Be the first to share your thoughts!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isExpanded = expandedReviews.has(review.id)
        const isLongReview = review.comment.length > 300
        const displayComment =
          isExpanded || !isLongReview ? review.comment : review.comment.slice(0, 300) + '...'
        const isOwnReview = user?.id === review.userId

        return (
          <div
            key={review.id}
            className="glass rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {review.user.avatar ? (
                    <img src={review.user.avatar} alt="" className="w-full h-full rounded-full" />
                  ) : (
                    review.user.username?.[0]?.toUpperCase() || 'U'
                  )}
                </div>

                {/* User Info & Rating */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">
                      {review.user.username || 'Anonymous'}
                    </span>
                    {isOwnReview && (
                      <Badge className="bg-primary-500/20 text-primary-300 border-primary-500/30 text-xs">
                        You
                      </Badge>
                    )}
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-3 h-3',
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-yellow-400">{review.rating}/10</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Actions Menu */}
              <div className="relative group">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <div className="p-1">
                    {isOwnReview ? (
                      <>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                          Edit Review
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Review
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors">
                          <Share2 className="w-4 h-4" />
                          Share Review
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors">
                          <Flag className="w-4 h-4" />
                          Report Review
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="mb-4">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{displayComment}</p>

              {isLongReview && (
                <button
                  onClick={() => toggleExpand(review.id)}
                  className="text-sm text-primary-400 hover:text-primary-300 mt-2 font-medium"
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              <button
                onClick={() => handleLike(review.id)}
                disabled={!user}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all touch-manipulation',
                  likedReviews.has(review.id) || review.isHelpful
                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <ThumbsUp
                  className={cn(
                    'w-4 h-4',
                    likedReviews.has(review.id) || review.isHelpful ? 'fill-current' : ''
                  )}
                />
                <span className="text-sm font-medium">{review.helpful}</span>
                <span className="text-xs hidden sm:inline">Helpful</span>
              </button>

              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">0</span>
                <span className="text-xs hidden sm:inline">Comments</span>
              </button>

              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all ml-auto">
                <Share2 className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
