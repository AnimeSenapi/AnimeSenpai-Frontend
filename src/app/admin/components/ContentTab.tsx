'use client'

import { useState, useEffect } from 'react'
import {
  MessageSquare,
  Flag,
  Eye,
  EyeOff,
  Trash2,
  Search,
  RefreshCw,
  Filter,
  RotateCcw,
} from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { ErrorState, EmptyState } from '../../../components/ui/error-state'
import { useToast } from '../../../components/ui/toast'
import {
  apiGetReviews,
  apiGetModerationStats,
  apiToggleReviewVisibility,
  apiDeleteReview,
} from '../../lib/api'
import { LoadingState } from '../../../components/ui/loading-state'

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
  const { addToast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'public' | 'hidden' | 'recent'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null)
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [filter, page, searchTerm])

  const loadData = async () => {
    setLoading(true)
    setLoadError(null)

    const activeFilter = filter
    const activePage = page
    const activeSearch = searchTerm.trim()

    try {
      const [reviewsResponse, statsResponse] = (await Promise.all([
        apiGetReviews({ page: activePage, limit: 20, filter: activeFilter, search: activeSearch }),
        apiGetModerationStats(),
      ])) as any[]

      let extractedReviews: Review[] = []
      let extractedTotalPages = 1

      if (reviewsResponse && typeof reviewsResponse === 'object') {
        if ('result' in reviewsResponse && reviewsResponse.result?.data) {
          const data = reviewsResponse.result.data
          extractedReviews = data.reviews || []
          extractedTotalPages = data.pagination?.totalPages || data.pagination?.pages || 1
        } else if ('reviews' in reviewsResponse) {
          extractedReviews = reviewsResponse.reviews || []
          extractedTotalPages =
            reviewsResponse.pagination?.totalPages || reviewsResponse.pagination?.pages || 1
        }
      }

      setReviews(extractedReviews)
      setTotalPages(Math.max(extractedTotalPages || 1, 1))

      if (statsResponse && typeof statsResponse === 'object') {
        if ('result' in statsResponse && statsResponse.result?.data) {
          setStats(statsResponse.result.data)
        } else {
          setStats(statsResponse as Stats)
        }
      } else {
        setStats(null)
      }
    } catch (error: any) {
      console.error('Failed to load moderation data:', error)

      if (error?.message?.includes('FORBIDDEN') || error?.message?.includes('admin')) {
        alert('Access denied. You must be an admin to view this page.')
        window.location.href = '/dashboard'
        return
      }

      setLoadError(
        error instanceof Error
          ? error.message || 'Failed to load moderation data. Please try again.'
          : 'Failed to load moderation data. Please try again.'
      )
      setReviews([])
      setTotalPages(1)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVisibility = async (reviewId: string, isPublic: boolean) => {
    try {
      setToggleLoadingId(reviewId)
      await apiToggleReviewVisibility(reviewId, !isPublic)
      addToast({
        title: isPublic ? 'Review hidden' : 'Review published',
        description: isPublic
          ? 'The review is no longer visible to the public.'
          : 'The review is now visible to the community.',
        variant: 'success',
      })
      await loadData()
    } catch (error: any) {
      console.error('Failed to toggle review visibility:', error)
      addToast({
        title: 'Visibility update failed',
        description:
          error instanceof Error
            ? error.message || 'Could not update review visibility.'
            : 'Could not update review visibility.',
        variant: 'destructive',
      })
      setLoadError(
        error instanceof Error
          ? error.message || 'Failed to toggle review visibility.'
          : 'Failed to toggle review visibility.'
      )
    } finally {
      setToggleLoadingId(null)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return
    }

    try {
      setDeleteLoadingId(reviewId)
      await apiDeleteReview(reviewId)
      addToast({
        title: 'Review deleted',
        description: 'The review was removed successfully.',
        variant: 'success',
      })
      await loadData()
    } catch (error: any) {
      console.error('Failed to delete review:', error)
      addToast({
        title: 'Delete failed',
        description:
          error instanceof Error ? error.message || 'Could not delete review.' : 'Could not delete review.',
        variant: 'destructive',
      })
      setLoadError(
        error instanceof Error ? error.message || 'Failed to delete review.' : 'Failed to delete review.'
      )
    } finally {
      setDeleteLoadingId(null)
    }
  }

  const handleSearch = () => {
    const trimmed = searchQuery.trim()
    const willChangeSearch = trimmed !== searchTerm
    const willChangePage = page !== 1

    setSearchTerm(trimmed)
    if (willChangePage) {
      setPage(1)
    }

    if (!willChangeSearch && !willChangePage) {
      loadData()
    }
  }

  const handleResetFilters = () => {
    setFilter('all')
    setPage(1)
    setSearchQuery('')
    setSearchTerm('')
    loadData()
  }

  const showInitialLoading = loading && reviews.length === 0 && !loadError
  const showError = !loading && Boolean(loadError)
  const showEmpty = !loading && !loadError && reviews.length === 0
  const hasActiveFilters = filter !== 'all' || searchTerm.length > 0
  const emptyStateSuggestions = hasActiveFilters
    ? [
        'Try resetting your filters to view all reviews',
        'Search for a different keyword or anime title',
        'Encourage users to submit new reviews',
      ]
    : [
        'Ask the community to share their first reviews',
        'Add curated content to showcase in this section',
      ]

  const resolvedErrorMessage = loadError || 'Failed to load moderation data. Please try again.'
  const showingCount = reviews.length
  const totalCount = stats?.total ?? showingCount
  const handleRetry = () => {
    void loadData()
  }

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-primary-500/10 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-3 rounded-xl bg-white/5 px-3 py-1.5 border border-white/10 text-sm text-primary-200">
              <MessageSquare className="h-4 w-4" />
              Content Moderation
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-white">Keep Reviews Healthy</h2>
              <p className="text-sm text-gray-400">
                Monitor community feedback and act quickly on flagged submissions.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Button
              onClick={handleResetFilters}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {stats && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary-300" />
                <div>
                  <p className="text-2xl font-semibold text-white">{totalCount.toLocaleString()}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    {hasActiveFilters ? 'Matching Reviews' : 'Total Reviews'}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-success-300" />
                <div>
                  <p className="text-2xl font-semibold text-white">{stats.public}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Public</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <EyeOff className="h-5 w-5 text-warning-300" />
                <div>
                  <p className="text-2xl font-semibold text-white">{stats.hidden}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Hidden</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-info-300" />
                <div>
                  <p className="text-2xl font-semibold text-white">{stats.recent}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Last 24h</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Flag className="h-5 w-5 text-error-300" />
                <div>
                  <p className="text-2xl font-semibold text-white">{stats.flagged}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Flagged</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'all', label: 'All Reviews' },
                { id: 'public', label: 'Public' },
                { id: 'hidden', label: 'Hidden' },
                { id: 'recent', label: 'Recent' },
              ] as const
            ).map((option) => (
              <Button
                key={option.id}
                variant={filter === option.id ? 'default' : 'outline'}
                size="sm"
                className={`${filter === option.id ? 'bg-primary-500/30 border-primary-500/40 text-primary-100' : 'border-white/15 text-gray-300 hover:text-white'}`}
                onClick={() => {
                  setFilter(option.id)
                  setPage(1)
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews by title, user, or anime"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/40"
              />
            </div>
            <Button
              onClick={() => handleSearch()}
              size="sm"
              className="min-w-[110px] bg-primary-500/20 border border-primary-500/40 text-primary-100 hover:bg-primary-500/30"
            >
              <Search className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Search</span>
            </Button>
            <Button
              onClick={handleResetFilters}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Reviews List */}
      {showInitialLoading ? (
        <LoadingState variant="inline" text="Loading reviews..." size="md" />
      ) : showError ? (
        <ErrorState
          variant="inline"
          title="Unable to load reviews"
          message={resolvedErrorMessage}
          showRetry
          showHome={false}
          onRetry={handleRetry}
        />
      ) : showEmpty ? (
        <EmptyState
          icon={<MessageSquare className="h-10 w-10 text-primary-300" />}
          title="No reviews yet"
          message="We couldn't find any reviews for your current filters."
          suggestions={emptyStateSuggestions}
          actionLabel="Reset filters"
          onAction={handleResetFilters}
          secondaryActionLabel="Reload"
          onSecondaryAction={handleRetry}
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {review.anime.coverImage && (
                      <img
                        src={review.anime.coverImage}
                        alt={review.anime.title}
                        className="w-14 h-20 object-cover rounded-xl border border-white/10"
                      />
                    )}
                    <div>
                      <h4 className="text-lg font-semibold text-white">{review.title}</h4>
                      <p className="text-sm text-gray-400">
                        {review.anime.titleEnglish || review.anime.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>by {review.user.username}</span>
                        <span>•</span>
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="text-warning-300 font-medium">Score: {review.score}/10</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-4">
                    {review.content}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    {review.isSpoiler && (
                      <span className="px-2 py-1 bg-warning-500/20 text-warning-400 rounded text-xs">
                        Spoiler
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        review.isPublic
                          ? 'bg-success-500/20 text-success-400'
                          : 'bg-error-500/20 text-error-400'
                      }`}
                    >
                      {review.isPublic ? 'Public' : 'Hidden'}
                    </span>
                    <span className="text-gray-500 text-xs">👍 {review.likes}</span>
                    <span className="text-gray-500 text-xs">👎 {review.dislikes}</span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleVisibility(review.id, review.isPublic)}
                    className="border-white/15 text-gray-200 hover:text-white"
                    disabled={toggleLoadingId === review.id || deleteLoadingId === review.id}
                  >
                    {review.isPublic ? (
                      <span className="flex items-center gap-2 text-xs">
                        <EyeOff className="h-4 w-4" />
                        Hide
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-xs">
                        <Eye className="h-4 w-4" />
                        Show
                      </span>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={deleteLoadingId === review.id}
                  >
                    {deleteLoadingId === review.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {showingCount} {showingCount === 1 ? 'review' : 'reviews'} • Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-white/20"
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="border-white/20"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
