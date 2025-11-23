'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Star, Trash2, Send, Loader2, Edit, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useAuth } from '../../app/lib/auth-context'
import { useToast } from '../ui/toast'
import { cn } from '../../app/lib/utils'

interface Review {
  id: string
  userId: string
  animeId: string
  title: string
  content: string
  score: number
  isSpoiler: boolean
  likes: number
  dislikes: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    username: string
    name: string | null
    avatar: string | null
  }
  anime?: {
    id: string
    slug: string
    title: string
    titleEnglish: string | null
    coverImage: string | null
  }
}

interface ReviewCardProps {
  review: Review
  onLike?: (reviewId: string) => void
  onUnlike?: (reviewId: string) => void
  onDelete?: (reviewId: string) => void
  onEdit?: (review: Review) => void
  onHelpful?: (reviewId: string) => void
  onNotHelpful?: (reviewId: string) => void
  isLiked?: boolean
  isHelpful?: boolean
  isNotHelpful?: boolean
  helpfulCount?: number
  notHelpfulCount?: number
  commentCount?: number
}

export function ReviewCard({
  review,
  onLike,
  onUnlike,
  onDelete,
  onEdit,
  onHelpful,
  onNotHelpful,
  isLiked = false,
  isHelpful = false,
  isNotHelpful = false,
  helpfulCount = 0,
  notHelpfulCount = 0,
  commentCount = 0,
}: ReviewCardProps) {
  const { user: currentUser, isAuthenticated } = useAuth()
  const { addToast } = useToast()

  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [liked, setLiked] = useState(isLiked)
  const [likeCount, setLikeCount] = useState(review.likes)
  const [helpful, setHelpful] = useState(isHelpful)
  const [notHelpful, setNotHelpful] = useState(isNotHelpful)
  const [helpfulCountState, setHelpfulCountState] = useState(helpfulCount)
  const [notHelpfulCountState, setNotHelpfulCountState] = useState(notHelpfulCount)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      addToast({
        title: 'Sign In Required',
        description: 'Please sign in to like reviews',
        variant: 'default',
      })
      return
    }

    // Optimistically update UI
    const newLikedState = !liked
    setLiked(newLikedState)
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1))

    try {
      const { apiLikeReview, apiUnlikeReview } = await import('../../app/lib/api')
      
      if (liked) {
        await apiUnlikeReview(review.id)
      } else {
        await apiLikeReview(review.id)
      }

      if (onLike && !liked) onLike(review.id)
      if (onUnlike && liked) onUnlike(review.id)
    } catch (error) {
      console.error('Failed to update like:', error)
      // Revert optimistic update
      setLiked(liked)
      setLikeCount((prev) => (liked ? prev + 1 : prev - 1))
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update like',
        variant: 'destructive',
      })
    }
  }

  const loadComments = async () => {
    if (comments.length > 0) {
      setShowComments(!showComments)
      return
    }

    try {
      setLoadingComments(true)

      const { TRPC_URL: API_URL } = await import('../../app/lib/api')
      const url = `${API_URL}/reviewInteractions.getComments?input=${encodeURIComponent(
        JSON.stringify({
          reviewId: review.id,
          limit: 20,
        })
      )}`

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to load comments')
      }

      const json = await response.json()
      const data = json.result?.data

      if (data?.comments) {
        setComments(data.comments)
        setShowComments(true)
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
      addToast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive',
      })
    } finally {
      setLoadingComments(false)
    }
  }

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      addToast({
        title: 'Sign In Required',
        description: 'Please sign in to comment',
        variant: 'default',
      })
      return
    }

    if (!newComment.trim()) return

    try {
      setSubmittingComment(true)

      const { apiAddReviewComment } = await import('../../app/lib/api')

      const result = await apiAddReviewComment(review.id, newComment)

      if (result?.comment) {
        setComments((prev) => [result.comment, ...prev])
        setNewComment('')
        addToast({
        title: 'Success',
        description: 'Comment added!',
        variant: 'success',
      })
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
      addToast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      })
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleHelpful = async () => {
    if (!isAuthenticated) {
      addToast({
        title: 'Sign In Required',
        description: 'Please sign in to vote on reviews',
        variant: 'default',
      })
      return
    }

    const newHelpfulState = !helpful
    const wasNotHelpful = notHelpful
    
    setHelpful(newHelpfulState)
    if (wasNotHelpful) {
      setNotHelpful(false)
      setNotHelpfulCountState((prev) => Math.max(0, prev - 1))
    }
    setHelpfulCountState((prev) => (helpful ? prev - 1 : prev + 1))

    try {
      if (onHelpful) {
        await onHelpful(review.id)
      }
    } catch (error) {
      // Revert optimistic update
      setHelpful(helpful)
      if (wasNotHelpful) {
        setNotHelpful(true)
        setNotHelpfulCountState((prev) => prev + 1)
      }
      setHelpfulCountState((prev) => (helpful ? prev + 1 : prev - 1))
      addToast({
        title: 'Error',
        description: 'Failed to update vote',
        variant: 'destructive',
      })
    }
  }

  const handleNotHelpful = async () => {
    if (!isAuthenticated) {
      addToast({
        title: 'Sign In Required',
        description: 'Please sign in to vote on reviews',
        variant: 'default',
      })
      return
    }

    const newNotHelpfulState = !notHelpful
    const wasHelpful = helpful
    
    setNotHelpful(newNotHelpfulState)
    if (wasHelpful) {
      setHelpful(false)
      setHelpfulCountState((prev) => Math.max(0, prev - 1))
    }
    setNotHelpfulCountState((prev) => (notHelpful ? prev - 1 : prev + 1))

    try {
      if (onNotHelpful) {
        await onNotHelpful(review.id)
      }
    } catch (error) {
      // Revert optimistic update
      setNotHelpful(notHelpful)
      if (wasHelpful) {
        setHelpful(true)
        setHelpfulCountState((prev) => prev + 1)
      }
      setNotHelpfulCountState((prev) => (notHelpful ? prev + 1 : prev - 1))
      addToast({
        title: 'Error',
        description: 'Failed to update vote',
        variant: 'destructive',
      })
    }
  }

  const isOwner = currentUser?.id === review.userId
  const wasEdited = review.updatedAt && review.updatedAt !== review.createdAt

  return (
    <div className="glass rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href={`/user/${review.user.username}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 overflow-hidden border border-white/10">
              {review.user.avatar ? (
                <Image
                  src={review.user.avatar}
                  alt={review.user.username}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-primary-400">
                  {review.user.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </Link>

          <div>
            <Link
              href={`/user/${review.user.username}`}
              className="font-semibold text-white hover:text-primary-400"
            >
              {review.user.username || 'Unknown user'}
            </Link>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
              {wasEdited && (
                <span className="text-gray-500" title={`Edited ${formatDistanceToNow(new Date(review.updatedAt), { addSuffix: true })}`}>
                  (edited)
                </span>
              )}
              {review.isSpoiler && (
                <Badge className="bg-error-500/20 text-error-400 border-error-500/30 text-[10px] px-1.5 py-0">
                  SPOILER
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="font-bold text-white">{review.score}/10</span>
        </div>
      </div>

      {/* Anime Info */}
      {review.anime && (
        <Link href={`/anime/${review.anime.slug}`} className="block mb-4">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
            {review.anime.coverImage && (
              <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0 relative">
                <Image
                  src={review.anime.coverImage}
                  alt={review.anime.title}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">
                {review.anime.titleEnglish || review.anime.title}
              </p>
              <p className="text-xs text-gray-400">View anime details →</p>
            </div>
          </div>
        </Link>
      )}

      {/* Review Title */}
      <h3 className="text-lg font-semibold text-white mb-2">{review.title}</h3>

      {/* Review Content */}
      <p className="text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">{review.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-white/10">
        {/* Helpful/Not Helpful Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleHelpful}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-sm',
              helpful
                ? 'bg-success-500/20 text-success-400 hover:bg-success-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            )}
            aria-label="Mark as helpful"
          >
            <ThumbsUp className={cn('h-4 w-4', helpful && 'fill-current')} />
            <span className="font-medium">{helpfulCountState}</span>
          </button>
          <button
            onClick={handleNotHelpful}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-sm',
              notHelpful
                ? 'bg-error-500/20 text-error-400 hover:bg-error-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            )}
            aria-label="Mark as not helpful"
          >
            <ThumbsDown className={cn('h-4 w-4', notHelpful && 'fill-current')} />
            <span className="font-medium">{notHelpfulCountState}</span>
          </button>
        </div>

        {/* Like Button (Legacy support) */}
        <button
          onClick={handleLike}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all',
            liked
              ? 'bg-error-500/20 text-error-400 hover:bg-error-500/30'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
          )}
        >
          <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
          <span className="text-sm font-medium">{likeCount}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={loadComments}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-medium">{commentCount || comments.length}</span>
        </button>

        {/* Owner Actions */}
        {isOwner && (
          <div className="ml-auto flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(review)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-primary-400 hover:bg-primary-500/20 transition-all"
                aria-label="Edit review"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(review.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-error-400 hover:bg-error-500/20 transition-all"
                aria-label="Delete review"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-white/10">
          {/* Add Comment */}
          {isAuthenticated && (
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50"
                  maxLength={500}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={submittingComment || !newComment.trim()}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  {submittingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Comments List */}
          {loadingComments ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">No comments yet</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-3 bg-white/5 rounded-lg">
                  <Link href={`/user/${comment.user.username}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 overflow-hidden border border-white/10">
                      {comment.user.avatar ? (
                        <Image
                          src={comment.user.avatar}
                          alt={comment.user.username}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary-400">
                          {comment.user.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/user/${comment.user.username}`}
                        className="font-semibold text-white text-sm hover:text-primary-400"
                      >
                        {comment.user.username || 'Unknown user'}
                      </Link>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
