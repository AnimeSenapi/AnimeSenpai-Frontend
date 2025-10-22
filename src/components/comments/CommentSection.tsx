'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useToast } from '../ui/toast'
import { useAuth } from '@/app/lib/auth-context'
import {
  MessageSquare,
  Send,
  ThumbsUp,
  Reply,
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface Comment {
  id: string
  userId: string
  user: {
    id: string
    username: string
    avatar?: string
  }
  content: string
  likes: number
  isLiked?: boolean
  createdAt: string
  replies?: Comment[]
}

interface CommentSectionProps {
  targetId: string
  targetType: 'anime' | 'review'
  comments: Comment[]
  onUpdate: () => void
}

export function CommentSection({ targetId, targetType, comments, onUpdate }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth()
  const toast = useToast()
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments.create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          targetId,
          targetType,
          content: newComment.trim(),
        }),
      })

      setNewComment('')
      toast.success('Comment posted!')
      onUpdate()
    } catch (error) {
      toast.error('Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = async (parentId: string) => {
    if (!replyText.trim()) return

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments.reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          parentId,
          content: replyText.trim(),
        }),
      })

      setReplyText('')
      setReplyingTo(null)
      toast.success('Reply posted!')
      onUpdate()
    } catch (error) {
      toast.error('Failed to post reply')
    }
  }

  const handleLike = async (commentId: string) => {
    if (!isAuthenticated) {
      toast.info('Sign in to like comments')
      return
    }

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments.like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ commentId }),
      })

      onUpdate()
    } catch (error) {
      toast.error('Failed to like comment')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 30) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwnComment = user?.id === comment.userId

    return (
      <div key={comment.id} className={cn('flex gap-3', isReply && 'ml-12')}>
        {/* Avatar */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
          {comment.user.avatar ? (
            <img src={comment.user.avatar} alt="" className="w-full h-full rounded-full" />
          ) : (
            comment.user.username?.[0]?.toUpperCase() || 'U'
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="glass rounded-lg p-4 border border-white/10">
            {/* User & Time */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">{comment.user.username}</span>
                {isOwnComment && (
                  <Badge className="bg-primary-500/20 text-primary-300 border-primary-500/30 text-xs px-1.5 py-0">
                    You
                  </Badge>
                )}
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
              </div>

              {/* Actions Menu */}
              {isOwnComment && (
                <div className="relative group/menu">
                  <button className="p-1 hover:bg-white/10 rounded transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>

                  <div className="absolute right-0 top-full mt-1 w-40 bg-gray-800/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                    <div className="p-1">
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors">
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded transition-colors">
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Comment Text */}
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2 ml-2">
            <button
              onClick={() => handleLike(comment.id)}
              disabled={!isAuthenticated}
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium transition-colors',
                comment.isLiked ? 'text-primary-400' : 'text-gray-400 hover:text-white'
              )}
            >
              <ThumbsUp className={cn('w-3 h-3', comment.isLiked && 'fill-current')} />
              {comment.likes > 0 && comment.likes}
            </button>

            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              disabled={!isAuthenticated}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
            >
              <Reply className="w-3 h-3" />
              Reply
            </button>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3 ml-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-primary-400/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleReply(comment.id)
                    }
                  }}
                />
                <Button
                  onClick={() => handleReply(comment.id)}
                  size="sm"
                  disabled={!replyText.trim()}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {comment.replies.map((reply) => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comment Count */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-bold text-white">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
      </div>

      {/* New Comment Form */}
      {isAuthenticated ? (
        <div className="glass rounded-xl p-4 border border-white/10">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full rounded-full" />
              ) : (
                user?.username?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-400/50 resize-none mb-2"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{newComment.length}/500 characters</span>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !newComment.trim()}
                  size="sm"
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                >
                  {isSubmitting ? (
                    <>Posting...</>
                  ) : (
                    <>
                      <Send className="w-3 h-3 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-xl p-6 text-center border border-white/10">
          <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 mb-3">Sign in to join the discussion</p>
          <Button
            onClick={() => (window.location.href = '/auth/signin')}
            size="sm"
            className="bg-gradient-to-r from-primary-500 to-secondary-500"
          >
            Sign In
          </Button>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center border border-white/10">
          <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">{comments.map((comment) => renderComment(comment))}</div>
      )}
    </div>
  )
}
