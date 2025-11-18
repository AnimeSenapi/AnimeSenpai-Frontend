'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { useToast } from '../ui/toast'
import { Star, X, Save, Loader2 } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface ReviewFormProps {
  animeId: string
  animeTitle: string
  existingReview?: {
    rating: number
    comment: string
  }
  onSuccess: () => void
  onCancel: () => void
}

export function ReviewForm({
  animeId,
  animeTitle,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const { addToast } = useToast()
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({})

  const validate = () => {
    const newErrors: typeof errors = {}

    if (rating === 0) {
      newErrors.rating = 'Please select a rating'
    }

    if (!comment.trim()) {
      newErrors.comment = 'Please write a review'
    } else if (comment.trim().length < 20) {
      newErrors.comment = 'Review must be at least 20 characters'
    } else if (comment.trim().length > 2000) {
      newErrors.comment = 'Review must be less than 2000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)

    try {
      // API call to submit review
      const { TRPC_URL } = await import('@/app/lib/api')
      const response = await fetch(`${TRPC_URL}/reviews.create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          animeId,
          rating,
          comment: comment.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      addToast({
        title: 'Success',
        description: 'Review submitted successfully!',
        variant: 'success',
      })
      onSuccess()
    } catch (error) {
      console.error('Failed to submit review:', error)
      addToast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">
            {existingReview ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <p className="text-sm text-gray-400 mt-1">{animeTitle}</p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">Your Rating *</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="touch-manipulation transition-transform hover:scale-110 active:scale-95"
              aria-label={`Rate ${star} out of 10`}
            >
              <Star
                className={cn(
                  'w-8 h-8 transition-colors',
                  (hoverRating || rating) >= star
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-600 hover:text-gray-500'
                )}
              />
            </button>
          ))}
          <span className="ml-3 text-2xl font-bold text-white">
            {hoverRating || rating || '-'}/10
          </span>
        </div>
        {errors.rating && <p className="text-red-400 text-sm mt-2">{errors.rating}</p>}
      </div>

      {/* Review Text */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Your Review *</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this anime... What did you like? What stood out? Would you recommend it?"
          rows={6}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20 resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">{comment.length}/2000 characters (minimum 20)</p>
          {errors.comment && <p className="text-red-400 text-sm">{errors.comment}</p>}
        </div>
      </div>

      {/* Review Guidelines */}
      <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-300 font-medium mb-2">💡 Review Tips:</p>
        <ul className="text-xs text-blue-200/80 space-y-1">
          <li>• Be respectful and constructive</li>
          <li>• Avoid spoilers or use warnings</li>
          <li>• Share what made it special (or not)</li>
          <li>• Help others decide if they'll enjoy it</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !rating || !comment.trim()}
          className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {existingReview ? 'Update Review' : 'Submit Review'}
            </>
          )}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          disabled={isSubmitting}
          className="border-white/20 text-white hover:bg-white/10"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
