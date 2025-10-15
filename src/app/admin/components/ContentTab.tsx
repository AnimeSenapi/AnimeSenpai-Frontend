'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Flag, 
  Eye, 
  EyeOff, 
  Trash2, 
  Search, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw 
} from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { 
  apiGetReviews, 
  apiGetModerationStats, 
  apiToggleReviewVisibility, 
  apiDeleteReview 
} from '../../lib/api'

interface Review {
  id: string
  title: string
  content: string
  score: number
  isSpoiler: boolean
  isPublic: boolean
  likes: number
  dislikes: number
  createdAt: string
  user: {
    id: string
    username: string
    email: string
    role: string
  }
  anime: {
    id: string
    title: string
    titleEnglish?: string
    slug: string
    coverImage?: string
  }
}

interface Stats {
  total: number
  public: number
  hidden: number
  recent: number
  flagged: number
}

export function ContentTab() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'public' | 'hidden' | 'recent'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadData()
  }, [filter, page])

  const loadData = async () => {
    setLoading(true)
    try {
      const [reviewsData, statsData] = await Promise.all([
        apiGetReviews({ page, limit: 20, filter, search: searchQuery }),
        apiGetModerationStats()
      ]) as any[]
      
      setReviews(reviewsData.reviews || [])
      setTotalPages(reviewsData.pagination?.totalPages || 1)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load moderation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVisibility = async (reviewId: string, isPublic: boolean) => {
    try {
      await apiToggleReviewVisibility(reviewId, !isPublic)
      loadData() // Reload to reflect changes
    } catch (error) {
      console.error('Failed to toggle review visibility:', error)
      alert('Failed to update review visibility')
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return
    }

    try {
      await apiDeleteReview(reviewId)
      loadData() // Reload to reflect changes
    } catch (error) {
      console.error('Failed to delete review:', error)
      alert('Failed to delete review')
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadData()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Content Moderation</h2>
        <p className="text-gray-400">Review and moderate user-generated content</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-primary-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-gray-400">Total Reviews</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-success-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.public}</p>
                <p className="text-sm text-gray-400">Public</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <EyeOff className="h-5 w-5 text-warning-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.hidden}</p>
                <p className="text-sm text-gray-400">Hidden</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-info-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.recent}</p>
                <p className="text-sm text-gray-400">Last 24h</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Flag className="h-5 w-5 text-error-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.flagged}</p>
                <p className="text-sm text-gray-400">Flagged</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilter('all'); setPage(1) }}
            className="border-white/20"
          >
            All Reviews
          </Button>
          <Button
            variant={filter === 'public' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilter('public'); setPage(1) }}
            className="border-white/20"
          >
            Public
          </Button>
          <Button
            variant={filter === 'hidden' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilter('hidden'); setPage(1) }}
            className="border-white/20"
          >
            Hidden
          </Button>
          <Button
            variant={filter === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilter('recent'); setPage(1) }}
            className="border-white/20"
          >
            Recent
          </Button>
        </div>

        <div className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button size="sm" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-400 mx-auto mb-2" />
          <p className="text-gray-400">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Reviews Found</h3>
          <p className="text-gray-400">No reviews match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {review.anime.coverImage && (
                      <img
                        src={review.anime.coverImage}
                        alt={review.anime.title}
                        className="w-12 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h4 className="text-lg font-semibold text-white">{review.title}</h4>
                      <p className="text-sm text-gray-400">
                        {review.anime.titleEnglish || review.anime.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          by {review.user.username}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-warning-400">
                          Score: {review.score}/10
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm line-clamp-3 mb-3">
                    {review.content}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    {review.isSpoiler && (
                      <span className="px-2 py-1 bg-warning-500/20 text-warning-400 rounded text-xs">
                        Spoiler
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs ${
                      review.isPublic 
                        ? 'bg-success-500/20 text-success-400' 
                        : 'bg-error-500/20 text-error-400'
                    }`}>
                      {review.isPublic ? 'Public' : 'Hidden'}
                    </span>
                    <span className="text-gray-500 text-xs">
                      👍 {review.likes}
                    </span>
                    <span className="text-gray-500 text-xs">
                      👎 {review.dislikes}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleVisibility(review.id, review.isPublic)}
                    className="border-white/20"
                  >
                    {review.isPublic ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Show
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteReview(review.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-white/20"
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-white">
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border-white/20"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
