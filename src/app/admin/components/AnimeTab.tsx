'use client'

import { useState, useEffect } from 'react'
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
  Play
} from 'lucide-react'
import { Button } from '../../../components/ui/button'
import Link from 'next/link'

interface Anime {
  id: string
  slug: string
  title: string
  titleEnglish?: string
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

export function AnimeTab() {
  const [anime, setAnime] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const limit = viewMode === 'grid' ? 12 : 20

  useEffect(() => {
    loadAnime()
  }, [page, viewMode])

  const loadAnime = async () => {
    try {
      setLoading(true)
      const TRPC_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3003/api/trpc'
      const url = `${TRPC_URL}/anime.getAll?input=${encodeURIComponent(JSON.stringify({ 
        page, 
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }))}`
      
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
        setAnime(data.anime || [])
        setTotalPages(data.pagination?.pages || 1)
        setTotal(data.pagination?.total || 0)
      }
    } catch (error: any) {
      console.error('Failed to load anime:', error)
      alert('Failed to load anime. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadAnime()
      return
    }

    try {
      setLoading(true)
      const TRPC_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3003/api/trpc'
      const url = `${TRPC_URL}/anime.search?input=${encodeURIComponent(JSON.stringify({ 
        query: searchQuery 
      }))}`
      
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
      const results = json.result?.data || []
      setAnime(results)
      setTotalPages(1)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (anime: Anime) => {
    setSelectedAnime(anime)
    setShowDetailsModal(true)
  }

  const handleDeleteAnime = async (animeId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone!`)) {
      return
    }

    try {
      // TODO: Implement delete endpoint
      alert('Delete functionality will be implemented in the backend')
      // After implementation:
      // await apiDeleteAnime(animeId)
      // loadAnime()
      // alert('Anime deleted successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to delete anime')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Anime Database</h2>
          <p className="text-gray-400">Manage anime entries and metadata</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-lg ${
              viewMode === 'list' 
                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' 
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-lg ${
              viewMode === 'grid' 
                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' 
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Grid
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
              <Film className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{total.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Total Anime</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-500/10 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-success-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{anime.length}</p>
              <p className="text-sm text-gray-400">On This Page</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary-500/10 rounded-lg flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-secondary-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Last Updated</p>
              <p className="text-xs text-gray-400">
                {anime[0] ? new Date(anime[0].updatedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search anime by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
        />
        <Button
          onClick={handleSearch}
          className="px-4 py-2 bg-primary-500/20 border border-primary-500/30 text-primary-300 hover:bg-primary-500/30 rounded-lg"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => {
            setSearchQuery('')
            loadAnime()
          }}
          className="px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-lg"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Anime Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading anime...</div>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Anime</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Episodes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {anime.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                            {item.coverImage ? (
                              <img 
                                src={item.coverImage} 
                                alt={item.title}
                                className="w-full h-full object-cover"
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
                                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-primary-500/10 text-primary-300 rounded">
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
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {item.year}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {item.episodes || 'Unknown'}
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
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/anime/${item.slug}`}
                            target="_blank"
                            className="p-1.5 hover:bg-primary-500/20 rounded text-primary-400 hover:text-primary-300"
                            title="View Page"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="p-1.5 hover:bg-secondary-500/20 rounded text-secondary-400 hover:text-secondary-300"
                            title="View Details"
                          >
                            <Film className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => alert('Edit functionality coming soon')}
                            className="p-1.5 hover:bg-warning-500/20 rounded text-warning-400 hover:text-warning-300"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnime(item.id, item.title)}
                            className="p-1.5 hover:bg-error-500/20 rounded text-error-400 hover:text-error-300"
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
              Page {page} of {totalPages} • {total.toLocaleString()} total anime
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm">
                {page}
              </span>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        /* Grid View */
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {anime.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-primary-500/30 transition-all group cursor-pointer"
                onClick={() => handleViewDetails(item)}
              >
                <div className="aspect-[2/3] bg-gray-800 relative">
                  {item.coverImage ? (
                    <img 
                      src={item.coverImage} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
                  {item.rating && (
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-bold text-white">{Number(item.rating).toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-white line-clamp-2 mb-1 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {item.year} • {item.type || 'TV'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination for Grid */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Page {page} of {totalPages} • {total.toLocaleString()} total anime
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm">
                {page}
              </span>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Anime Details Modal */}
      {showDetailsModal && selectedAnime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}>
          <div className="glass rounded-2xl p-6 max-w-2xl w-full mx-4 border border-white/10 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Anime Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Cover Image */}
              {selectedAnime.coverImage && (
                <div className="w-full max-w-xs mx-auto">
                  <img 
                    src={selectedAnime.coverImage} 
                    alt={selectedAnime.title}
                    className="w-full rounded-xl"
                  />
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Title</p>
                  <p className="text-white font-medium">{selectedAnime.title}</p>
                </div>
                {selectedAnime.titleEnglish && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">English Title</p>
                    <p className="text-white font-medium">{selectedAnime.titleEnglish}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400 mb-1">ID</p>
                  <p className="text-white font-mono text-xs">{selectedAnime.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Slug</p>
                  <p className="text-white font-mono text-xs">{selectedAnime.slug}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Year</p>
                  <p className="text-white">{selectedAnime.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Type</p>
                  <p className="text-white">{selectedAnime.type || 'TV'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Episodes</p>
                  <p className="text-white">{selectedAnime.episodes || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <p className="text-white capitalize">{selectedAnime.status?.replace(/-/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <p className="text-white font-bold">
                      {selectedAnime.rating ? Number(selectedAnime.rating).toFixed(2) : 'N/A'}
                    </p>
                  </div>
                </div>
                {selectedAnime.studio && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Studio</p>
                    <p className="text-white">{selectedAnime.studio}</p>
                  </div>
                )}
              </div>

              {/* Genres */}
              {selectedAnime.genres && selectedAnime.genres.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Genres</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnime.genres.map((genre, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 bg-primary-500/10 text-primary-300 rounded-lg border border-primary-500/20 text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Created At</p>
                  <p className="text-white text-sm">{new Date(selectedAnime.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Updated At</p>
                  <p className="text-white text-sm">{new Date(selectedAnime.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Link
                  href={`/anime/${selectedAnime.slug}`}
                  target="_blank"
                  className="flex-1 px-4 py-2 bg-primary-500/20 border border-primary-500/30 text-primary-300 hover:bg-primary-500/30 rounded-lg text-center font-medium flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  View Page
                </Link>
                <button
                  onClick={() => alert('Edit functionality coming soon')}
                  className="flex-1 px-4 py-2 bg-warning-500/20 border border-warning-500/30 text-warning-300 hover:bg-warning-500/30 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleDeleteAnime(selectedAnime.id, selectedAnime.title)
                  }}
                  className="px-4 py-2 bg-error-500/20 border border-error-500/30 text-error-300 hover:bg-error-500/30 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
