'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'

import {
  Film,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Star,
  Calendar,
  Play,
  Tv,
  Tag,
  Hash,
  Building2,
  Clock,
  Filter,
  RotateCcw,
} from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { LoadingState } from '../../../components/ui/loading-state'
import { EmptyState, ErrorState } from '../../../components/ui/error-state'
import { useToast } from '../../../components/ui/toast'
import Link from 'next/link'

interface Anime {
  id: string
  slug: string
  title: string
  titleEnglish?: string
  titleJapanese?: string
  year: number
  type?: string
  episodes?: number
  status: string
  rating?: number
  coverImage?: string
  genres?: { name: string }[]
  studio?: string
  createdAt: string
  updatedAt: string
}

type MetaCard = {
  label: string
  value: string
  icon?: LucideIcon
}

type InfoCard = {
  label: string
  value: string
}

export function AnimeTab() {
  const { addToast } = useToast()
  const [anime, setAnime] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const limit = 20

  useEffect(() => {
    if (!isSearchMode) {
    loadAnime()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isSearchMode])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  let statusLabel: string | undefined
  let statusChipClass = 'bg-slate-500/20 border border-slate-500/30 text-slate-100'
  let metaCards: MetaCard[] = []
  let referenceCards: InfoCard[] = []
  let timestampCards: InfoCard[] = []

  if (selectedAnime) {
    const rawStatus = selectedAnime.status?.replace(/[_-]/g, ' ') ?? ''
    if (rawStatus) {
      statusLabel = rawStatus
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    const normalizedStatus = selectedAnime.status?.toLowerCase() ?? ''
    if (normalizedStatus.includes('finished')) {
      statusChipClass = 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-200'
    } else if (normalizedStatus.includes('current')) {
      statusChipClass = 'bg-sky-500/15 border border-sky-500/30 text-sky-200'
    } else if (normalizedStatus.includes('not')) {
      statusChipClass = 'bg-amber-500/15 border border-amber-500/30 text-amber-200'
    }

    metaCards = [{ label: 'Type', value: selectedAnime.type || 'TV', icon: Tv }]

    if (selectedAnime.episodes != null) {
      metaCards.push({ label: 'Episodes', value: selectedAnime.episodes.toString(), icon: Film })
    }

    if (statusLabel) {
      metaCards.push({ label: 'Status', value: statusLabel, icon: Building2 })
    }

    if (selectedAnime.rating != null) {
      metaCards.push({
        label: 'Rating',
        value: `${Number(selectedAnime.rating).toFixed(2)} / 10`,
        icon: Star,
      })
    }

    if (selectedAnime.year != null) {
      metaCards.push({
        label: 'Year',
        value: selectedAnime.year.toString(),
        icon: Calendar,
      })
    }

    if (selectedAnime.studio && selectedAnime.studio.trim().length > 0) {
      metaCards.push({
        label: 'Studio',
        value: selectedAnime.studio,
        icon: Building2,
      })
    }

    referenceCards = [
      { label: 'Anime ID', value: selectedAnime.id },
      { label: 'Slug', value: selectedAnime.slug },
    ]

    timestampCards = [
      {
        label: 'Created At',
        value: new Date(selectedAnime.createdAt).toLocaleString(),
      },
      {
        label: 'Updated At',
        value: new Date(selectedAnime.updatedAt).toLocaleString(),
      },
    ]
  }

  const hasGenres = Boolean(selectedAnime?.genres && selectedAnime.genres.length > 0)

  const formattedSlug = selectedAnime?.slug?.replace(/-/g, ' ')

  const loadAnime = async (overridePage?: number) => {
    const currentPage = overridePage ?? page
    try {
      setLoading(true)
      setLoadError(null)
      setIsSearchMode(false)

      const { TRPC_URL } = await import('@/app/lib/api')
      const url = `${TRPC_URL}/anime.getAll?input=${encodeURIComponent(
        JSON.stringify({
          page: currentPage,
          limit,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
      )}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to load anime')
      }

      const json = await response.json()
      const data = json.result?.data

      if (data) {
        setAnime(Array.isArray(data.anime) ? data.anime : [])
        setTotalPages(Math.max(data.pagination?.pages || 1, 1))
        setTotal(data.pagination?.total || 0)
      } else {
        setAnime([])
        setTotalPages(1)
        setTotal(0)
      }
    } catch (error: any) {
      console.error('Failed to load anime:', error)
      setAnime([])
      setTotalPages(1)
      setTotal(0)
      setLoadError(
        error instanceof Error ? error.message || 'Failed to load anime list.' : 'Failed to load anime list.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleReset = (shouldReload = true) => {
    setSearchQuery('')
    setSearchTerm('')
    setIsSearchMode(false)
    setLoadError(null)
    setPage(1)
    if (shouldReload) {
      loadAnime(1)
    }
  }

  const handleSearch = async (overrideQuery?: string) => {
    const term = (overrideQuery ?? searchQuery).trim()

    if (!term) {
      handleReset()
      return
    }

    try {
      setLoading(true)
      setLoadError(null)
      const { TRPC_URL } = await import('@/app/lib/api')
      const url = `${TRPC_URL}/anime.search?input=${encodeURIComponent(
        JSON.stringify({
          query: term,
        })
      )}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const json = await response.json()
      const data = json.result?.data
      const results: Anime[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.anime)
          ? data.anime
          : []

      setAnime(results)
      setTotal(results.length)
      setTotalPages(1)
      setPage(1)
      setIsSearchMode(true)
      setSearchTerm(term)
    } catch (error: any) {
      console.error('Search failed:', error)
      setAnime([])
      setTotal(0)
      setTotalPages(1)
      setLoadError(error instanceof Error ? error.message || 'Search failed.' : 'Search failed.')
    } finally {
      setLoading(false)
    }
  }

  const showInitialLoading = loading && anime.length === 0 && !loadError
  const showError = !loading && Boolean(loadError)
  const showEmpty = !loading && !loadError && anime.length === 0
  const resolvedErrorMessage = loadError || 'Failed to load anime list. Please try again.'
  const showingCount = anime.length
  const totalCountDisplay = isSearchMode ? anime.length : total
  const paginationDisabled = isSearchMode || totalPages <= 1
  const hasActiveSearch = isSearchMode || searchTerm.length > 0

  const handleRetry = () => {
    if (isSearchMode) {
      void handleSearch(searchTerm || searchQuery)
    } else {
      void loadAnime(page)
    }
  }

  const lastUpdatedLabel = anime[0]
    ? new Date(anime[0].updatedAt).toLocaleString()
    : isSearchMode
      ? 'Search results'
      : 'N/A'

  const handleViewDetails = (anime: Anime) => {
    setSelectedAnime(anime)
    setShowDetailsModal(true)
  }

  const handleEditAnime = (anime: Anime) => {
    setSelectedAnime(anime)
    setEditFormData({
      title: anime.title,
      titleEnglish: anime.titleEnglish || '',
      titleJapanese: anime.titleJapanese || '',
      year: anime.year,
      episodes: anime.episodes || '',
      status: anime.status,
      type: anime.type || '',
      rating: anime.rating || '',
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedAnime) return

    setIsSaving(true)
    try {
      const { apiUpdateAnime } = await import('../../lib/api')

      // Prepare update data (only send changed fields)
      const updateData: any = {}
      if (editFormData.title !== selectedAnime.title) updateData.title = editFormData.title
      if (editFormData.titleEnglish !== selectedAnime.titleEnglish)
        updateData.titleEnglish = editFormData.titleEnglish
      if (editFormData.titleJapanese !== selectedAnime.titleJapanese)
        updateData.titleJapanese = editFormData.titleJapanese
      if (editFormData.year !== selectedAnime.year) updateData.year = parseInt(editFormData.year)
      if (editFormData.episodes !== selectedAnime.episodes)
        updateData.episodes = parseInt(editFormData.episodes)
      if (editFormData.status !== selectedAnime.status) updateData.status = editFormData.status
      if (editFormData.type !== selectedAnime.type) updateData.type = editFormData.type
      if (editFormData.rating !== selectedAnime.rating) updateData.rating = editFormData.rating

      await apiUpdateAnime(selectedAnime.id, updateData)

      setShowEditModal(false)
      loadAnime()
    } catch (error: any) {
      // Error logging is handled by the API error handler
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAnime = async (animeId: string, title: string) => {
    // Will be handled by delete confirmation modal (to be implemented)
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone!`)) {
      return
    }

    try {
      const { apiDeleteAnime } = await import('../../lib/api')
      await apiDeleteAnime(animeId)
      addToast({
        title: 'Anime deleted',
        description: `"${title}" was removed successfully.`,
        variant: 'success',
      })
      if (isSearchMode) {
        await handleSearch(searchTerm || searchQuery)
      } else {
        await loadAnime()
      }
    } catch (error: any) {
      console.error('Failed to delete anime:', error)
      addToast({
        title: 'Delete failed',
        description:
          error instanceof Error ? error.message || 'Could not delete anime.' : 'Could not delete anime.',
        variant: 'destructive',
      })
      setLoadError(
        error instanceof Error ? error.message || 'Failed to delete anime entry.' : 'Failed to delete anime entry.'
      )
    }
  }

  const detailsModal =
    isMounted && showDetailsModal && selectedAnime
      ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
              className="glass rounded-2xl p-6 max-w-3xl w-full mx-4 border border-white/10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Anime Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

              <div className="space-y-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="relative mx-auto lg:mx-0 w-full max-w-xs aspect-[2/3] overflow-hidden rounded-3xl border border-white/10 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
                    {selectedAnime.coverImage ? (
                  <Image
                    src={selectedAnime.coverImage}
                    alt={selectedAnime.title}
                    fill
                        className="object-cover"
                    sizes="(max-width: 768px) 100vw, 384px"
                  />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        <Film className="h-10 w-10" />
                </div>
              )}
                    {selectedAnime.rating && (
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 border border-white/10 shadow">
                        <Star className="h-3.5 w-3.5 text-yellow-300 fill-yellow-300" />
                        <span className="text-sm font-semibold text-white">
                          {Number(selectedAnime.rating).toFixed(1)}
                        </span>
                </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.4em] text-primary-100/70">
                        Anime Overview
                      </span>
                      <h3 className="text-3xl font-bold text-white leading-tight">
                        {selectedAnime.title}
                      </h3>
                      {selectedAnime.titleEnglish && (
                        <p className="text-sm text-gray-300">{selectedAnime.titleEnglish}</p>
                      )}
                      {selectedAnime.titleJapanese && (
                        <p className="text-sm text-gray-500">{selectedAnime.titleJapanese}</p>
                      )}
                </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {formattedSlug && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-gray-300">
                          <span className="uppercase tracking-[0.28em] text-gray-500">Slug</span>
                          <span className="font-mono text-white">{selectedAnime.slug}</span>
                </div>
                      )}
                      {statusLabel && (
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${statusChipClass}`}
                        >
                          <span className="h-2 w-2 rounded-full bg-current" />
                          {statusLabel}
                        </span>
                      )}
                </div>

                    {metaCards.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {metaCards.map((card) => (
                          <div
                            key={card.label}
                            className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-inner"
                          >
                            <div className="flex items-center gap-2">
                              {card.icon ? <card.icon className="h-4 w-4 text-primary-200" /> : null}
                              <p className="text-xs uppercase tracking-wide text-gray-400">
                                {card.label}
                  </p>
                </div>
                            <p className="mt-2 text-base font-semibold text-white">{card.value}</p>
                  </div>
                        ))}
                  </div>
                )}
                  </div>
              </div>

                {hasGenres && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wide mb-3">
                      Genres
                    </h4>
                  <div className="flex flex-wrap gap-2">
                      {selectedAnime.genres?.map((genre, i) => (
                        <Badge
                          key={`${genre.name}-${i}`}
                          className="bg-primary-500/10 text-primary-200 border border-primary-500/20"
                      >
                        {genre.name}
                        </Badge>
                    ))}
                  </div>
                </div>
              )}

                {referenceCards.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
                      Reference
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {referenceCards.map((card) => (
                        <div
                          key={card.label}
                          className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-4"
                        >
                          <p className="text-xs uppercase tracking-wide text-gray-400">
                            {card.label}
                          </p>
                          <p className="mt-1 text-sm font-medium text-white break-all">
                            {card.value}
                  </p>
                </div>
                      ))}
                    </div>
                  </div>
                )}

                {timestampCards.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
                      Timeline
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {timestampCards.map((card) => (
                        <div
                          key={card.label}
                          className="rounded-xl border border-white/10 bg-white/5 p-4"
                        >
                          <p className="text-xs uppercase tracking-wide text-gray-400">
                            {card.label}
                          </p>
                          <p className="mt-1 text-sm font-medium text-white">{card.value}</p>
                </div>
                      ))}
              </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-white/10">
                <Link
                  href={`/anime/${selectedAnime.slug}`}
                  target="_blank"
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-primary-500/30 bg-primary-500/15 px-4 py-2 text-primary-200 hover:bg-primary-500/25 transition"
                >
                  <Play className="h-4 w-4" />
                  View Page
                </Link>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleEditAnime(selectedAnime)
                  }}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-primary-500/30 bg-primary-500/15 px-4 py-2 text-primary-200 hover:bg-primary-500/25 transition"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleDeleteAnime(selectedAnime.id, selectedAnime.title)
                  }}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-error-500/30 bg-error-500/15 px-4 py-2 text-error-200 hover:bg-error-500/25 transition"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
          </div>,
          document.body
        )
      : null;

  const editModal =
    isMounted && showEditModal && selectedAnime
      ? createPortal(
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="glass rounded-2xl p-6 max-w-2xl w-full mx-4 border border-white/10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <Edit className="h-6 w-6 text-primary-400" />
                Edit Anime
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title (Romanized) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Title (Romanized)
                </label>
                <input
                  type="text"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                />
              </div>

              {/* Title (English) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Title (English)
                </label>
                <input
                  type="text"
                  value={editFormData.titleEnglish || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, titleEnglish: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                />
              </div>

              {/* Title (Japanese) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Title (Japanese)
                </label>
                <input
                  type="text"
                  value={editFormData.titleJapanese || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, titleJapanese: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                />
              </div>

              {/* Year & Episodes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Year</label>
                  <input
                    type="number"
                    value={editFormData.year || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, year: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Episodes</label>
                  <input
                    type="number"
                    value={editFormData.episodes || ''}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, episodes: e.target.value })
                      }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                  />
                </div>
              </div>

              {/* Status & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                  <select
                    value={editFormData.status || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                  >
                      <option value="currently-airing">Currently Airing</option>
                      <option value="finished-airing">Finished Airing</option>
                      <option value="not-yet-aired">Not Yet Aired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                  <select
                    value={editFormData.type || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                  >
                    <option value="TV">TV</option>
                    <option value="Movie">Movie</option>
                    <option value="OVA">OVA</option>
                    <option value="ONA">ONA</option>
                      <option value="Special">Special</option>
                  </select>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Rating</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                  value={editFormData.rating || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, rating: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                  />
              </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <Button
                    variant="ghost"
                  onClick={() => setShowEditModal(false)}
                    className="border border-white/10 text-gray-400 hover:text-white"
                  disabled={isSaving}
                >
                  Cancel
                  </Button>
                  <Button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                    className="bg-primary-500/20 border border-primary-500/30 text-primary-300 hover:bg-primary-500/30"
                >
                  {isSaving ? (
                      <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Saving...
                      </span>
                  ) : (
                    'Save Changes'
                  )}
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-primary-500/10 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-3 rounded-xl bg-white/5 px-3 py-1.5 border border-white/10 text-sm text-primary-200">
              <Film className="h-4 w-4" />
              Anime Library
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-white">Curate the Catalog</h2>
              <p className="text-sm text-gray-400">
                Search, review, and maintain anime metadata with confidence.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Button
              onClick={() => handleReset(true)}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button
              onClick={() => loadAnime(page)}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-500/15 flex items-center justify-center">
                <Film className="h-5 w-5 text-primary-300" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">{totalCountDisplay.toLocaleString()}</p>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  {isSearchMode ? 'Matching Results' : 'Total Titles'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-500/15 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-success-300" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">{showingCount}</p>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  {isSearchMode ? 'Visible Results' : 'On This Page'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary-500/15 flex items-center justify-center">
                <Clock className="h-5 w-5 text-secondary-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Last Updated</p>
                <p className="text-sm font-medium text-white">{lastUpdatedLabel}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search anime by title or slug"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleSearch()}
              size="sm"
              className="min-w-[110px] bg-primary-500/20 border border-primary-500/40 text-primary-100 hover:bg-primary-500/30"
            >
              <Search className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Search</span>
            </Button>
            <Button
              onClick={() => handleReset(true)}
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

      {/* Anime Content */}
      {showInitialLoading ? (
        <LoadingState variant="inline" text="Loading anime..." size="md" />
      ) : showError ? (
        <ErrorState
          variant="inline"
          title="Unable to load anime"
          message={resolvedErrorMessage}
          showRetry
          showHome={false}
          onRetry={handleRetry}
        />
      ) : showEmpty ? (
        <EmptyState
          icon={<Film className="h-10 w-10 text-primary-300" />}
          title={hasActiveSearch ? 'No anime match your filters' : 'No anime available yet'}
          message={
            hasActiveSearch
              ? 'Try adjusting your search terms or clearing the filters to see more results.'
              : 'Once anime entries are added, they will appear here.'
          }
          actionLabel={hasActiveSearch ? 'Reset filters' : undefined}
          onAction={hasActiveSearch ? () => handleReset() : undefined}
          secondaryActionLabel="Reload"
          onSecondaryAction={handleRetry}
        />
      ) : (
        <>
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Anime
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Episodes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {anime.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0 relative">
                            {item.coverImage ? (
                              <Image
                                src={item.coverImage}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="h-4 w-4 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{item.title}</p>
                            {item.titleEnglish && (
                              <p className="text-xs text-gray-400 truncate">{item.titleEnglish}</p>
                            )}
                            <div className="flex gap-1 mt-1">
                              {item.genres?.slice(0, 2).map((genre, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-1.5 py-0.5 bg-primary-500/10 text-primary-300 rounded"
                                >
                                  {genre.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-300">{item.type || 'TV'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.year}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {item.episodes ?? 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        {item.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-white font-medium">
                              {Number(item.rating).toFixed(1)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/anime/${item.slug}`}
                            target="_blank"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-primary-500/15 text-primary-200 hover:bg-primary-500/25"
                            title="View Page"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-secondary-500/15 text-secondary-200 hover:bg-secondary-500/25"
                            title="View Details"
                          >
                            <Film className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditAnime(item)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-primary-500/15 text-primary-200 hover:bg-primary-500/25"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnime(item.id, item.title)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-error-500/15 text-error-200 hover:bg-error-500/25"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                </button>
              </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {isSearchMode
                ? `${showingCount.toLocaleString()} search result${showingCount === 1 ? '' : 's'}`
                : `Page ${page} of ${totalPages} • ${total.toLocaleString()} total anime`}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={paginationDisabled || page === 1}
                className="px-3 py-1.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm">
                {page}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={paginationDisabled || page === totalPages}
                className="px-3 py-1.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
        </div>
          </div>
        </>
      )}
    </div>
  )
}