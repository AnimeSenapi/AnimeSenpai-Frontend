'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Grid3x3, List as ListIcon, SortDesc, Building2, TvMinimalPlay, Calendar, Star, Loader2, Search } from 'lucide-react'
import { SearchAnimeCard } from '../../../components/anime/SearchAnimeCard'
import { Button } from '../../../components/ui/button'
import { LoadingState } from '../../../components/ui/loading-state'
import { EmptyState } from '../../../components/ui/error-state'
import { cn } from '../../lib/utils'

interface Studio {
  name: string
  slug: string
  displayName: string
  animeCount: number
}

interface Anime {
  id: string
  slug: string
  title: string
  titleEnglish?: string | null
  titleJapanese?: string | null
  type: string
  status: string
  episodes?: number | null
  season?: string | null
  year?: number | null
  coverImage?: string | null
  synopsis?: string | null
  averageRating?: number | null
  rating?: number | null
  members?: number | null
  genres: Array<{
    id: string
    name: string
    slug: string
  }>
}

interface StudioPageData {
  studio: Studio
  anime: Anime[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export default function StudioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  
  const [studioData, setStudioData] = useState<StudioPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'popularity' | 'title'>('year')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadStudioData()
  }, [slug, currentPage, sortBy, sortOrder])

  const loadStudioData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/trpc'
      const url = `${API_URL}/studio.getStudioBySlug?input=${encodeURIComponent(JSON.stringify({
        slug,
        page: currentPage,
        limit: 24,
        sortBy,
        order: sortOrder
      }))}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch studio data')
      }
      
      const json = await response.json()
      if (json.error) {
        throw new Error(json.error.message || 'Failed to load studio')
      }
      
      setStudioData(json.result.data as StudioPageData)
    } catch (err: any) {
      setError(err.message || 'Failed to load studio')
    } finally {
      setLoading(false)
    }
  }

  // Filter anime by search query (client-side)
  const filteredAnime = studioData?.anime.filter(anime => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      anime.title.toLowerCase().includes(query) ||
      anime.titleEnglish?.toLowerCase().includes(query) ||
      anime.titleJapanese?.toLowerCase().includes(query)
    )
  }) || []

  if (loading && !studioData) {
    return <LoadingState text="Loading studio..." />
  }

  if (error || !studioData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center p-6">
        <EmptyState
          icon={<Building2 className="h-12 w-12 text-gray-500" />}
          title="Studio Not Found"
          message={error || 'The studio you\'re looking for doesn\'t exist or has no anime yet.'}
          actionLabel="Back to Search"
          onAction={() => router.push('/search')}
        />
      </div>
    )
  }

  const { studio, pagination } = studioData

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      {/* Studio Header - Similar to Anime Page */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 via-transparent to-transparent h-96" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          {/* Back Button */}
          <Link 
            href="/search"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Search</span>
          </Link>

          {/* Studio Info */}
          <div className="flex items-start gap-6">
            {/* Studio Icon */}
            <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-sm">
              <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-primary-400" />
            </div>

            {/* Studio Details */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                {studio.displayName}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <TvMinimalPlay className="h-4 w-4" />
                  <span>{studio.animeCount} Anime</span>
                </div>
              </div>

              <p className="text-gray-300 text-sm sm:text-base max-w-3xl">
                Browse all anime produced by {studio.displayName}. 
                {studio.animeCount > 1 && ` Discover ${studio.animeCount} titles from this studio.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls - Similar to Search Page */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass rounded-2xl p-4 sm:p-6 border border-white/10 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search anime..."
                  value={searchQuery}
                  onChange={(e: any) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50"
                />
              </div>
            </div>

            {/* Sort By */}
            <select 
              value={sortBy} 
              onChange={(e: any) => {
                setSortBy(e.target.value as 'rating' | 'year' | 'popularity' | 'title')
                setCurrentPage(1)
              }}
              className="w-full lg:w-48 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50"
            >
              <option value="year" className="bg-gray-800">Release Year</option>
              <option value="rating" className="bg-gray-800">Highest Rated</option>
              <option value="popularity" className="bg-gray-800">Most Popular</option>
              <option value="title" className="bg-gray-800">Title (A-Z)</option>
            </select>

            {/* Sort Order */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                setCurrentPage(1)
              }}
              className="border-white/20 text-white hover:bg-white/10"
              title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
            >
              <SortDesc className={cn(
                "h-5 w-5 transition-transform",
                sortOrder === 'asc' && "rotate-180"
              )} />
            </Button>

            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={cn(
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                    : 'border-white/20 text-white hover:bg-white/10'
                )}
                title="Grid View"
              >
                <Grid3x3 className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={cn(
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                    : 'border-white/20 text-white hover:bg-white/10'
                )}
                title="List View"
              >
                <ListIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400">
            {searchQuery ? (
              <>Showing {filteredAnime.length} of {pagination.total} results</>
            ) : (
              <>Showing {filteredAnime.length} anime{pagination.totalPages > 1 && ` (Page ${currentPage} of ${pagination.totalPages})`}</>
            )}
          </p>
        </div>

        {/* Anime Grid/List */}
        {loading ? (
          <LoadingState text="Loading anime..." />
        ) : filteredAnime.length === 0 ? (
          <EmptyState
            icon={<Search className="h-12 w-12 text-gray-500" />}
            title="No Anime Found"
            message={searchQuery ? `No results match "${searchQuery}"` : 'No anime from this studio yet.'}
            actionLabel={searchQuery ? 'Clear Search' : 'Browse All Anime'}
            onAction={() => searchQuery ? setSearchQuery('') : router.push('/search')}
          />
        ) : (
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6'
              : 'space-y-4'
          )}>
            {filteredAnime.map((anime) => (
              <SearchAnimeCard
                key={anime.id}
                anime={anime}
                variant={viewMode}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!searchQuery && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                        : 'border-white/20 text-white hover:bg-white/10'
                    )}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
              className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

