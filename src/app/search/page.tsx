'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AnimeCard } from '../../components/anime/AnimeCard'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { AnimeCardSkeleton, SearchResultSkeleton } from '../../components/ui/skeleton'
import { EmptyState } from '../../components/ui/error-state'
import { Anime } from '../../types/anime'
import { apiGetAllSeries, api } from '../lib/api'
import { useFavorites } from '../lib/favorites-context'
import { VirtualGrid, VirtualList } from '../../components/VirtualList'
import { SearchSEOMetadata } from '../../components/SEOMetadata'
import { AdvancedFilters } from '../../components/search/AdvancedFilters'
import { SortOptions, SortOption } from '../../components/search/SortOptions'
import {
  Search,
  Filter,
  Grid,
  List as ListIcon,
  X,
  TrendingUp,
  Sparkles,
  Star,
  Clock,
} from 'lucide-react'


// Map UI sort options to API sort params
const mapSortToAPI = (sortBy: SortOption): { sortBy: string; sortOrder: string } => {
  switch (sortBy) {
    case 'rating_desc':
      return { sortBy: 'averageRating', sortOrder: 'desc' }
    case 'rating_asc':
      return { sortBy: 'averageRating', sortOrder: 'asc' }
    case 'year_desc':
      return { sortBy: 'year', sortOrder: 'desc' }
    case 'year_asc':
      return { sortBy: 'year', sortOrder: 'asc' }
    case 'title_asc':
      return { sortBy: 'title', sortOrder: 'asc' }
    case 'title_desc':
      return { sortBy: 'title', sortOrder: 'desc' }
    case 'popularity_desc':
      return { sortBy: 'popularity', sortOrder: 'desc' }
    case 'popularity_asc':
      return { sortBy: 'popularity', sortOrder: 'asc' }
    case 'episodes_desc':
      return { sortBy: 'episodes', sortOrder: 'desc' }
    case 'episodes_asc':
      return { sortBy: 'episodes', sortOrder: 'asc' }
    case 'recently_added':
      return { sortBy: 'createdAt', sortOrder: 'desc' }
    case 'relevance':
    default:
      return { sortBy: 'averageRating', sortOrder: 'desc' }
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isFavorited, toggleFavorite } = useFavorites()
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedStudios, setSelectedStudios] = useState<string[]>([])
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [maxRating, setMaxRating] = useState(10)
  const [showFilters, setShowFilters] = useState(false)
  
  // State for search functionality
  const [allAnime, setAllAnime] = useState<Anime[]>([])
  const [filteredAnime, setFilteredAnime] = useState<Anime[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Compute unique values for filters from all anime
  const genres = Array.from(
    new Set(allAnime.flatMap((anime) => anime.genres?.map((g: any) => g.name || g.slug || g) || []))
  ).sort()

  const studios = Array.from(
    new Set(allAnime.map((anime) => anime.studio).filter(Boolean))
  ).sort() as string[]

  const seasons = Array.from(
    new Set(allAnime.map((anime) => anime.season).filter(Boolean))
  ).sort() as string[]

  const years = Array.from(
    new Set(
      allAnime.map((anime) => anime.year).filter((y): y is number => y !== null && y !== undefined)
    )
  )
    .sort((a, b) => b - a)
    .map(String)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch {
        setRecentSearches([])
      }
    }
  }, [])

  // Save search query to recent searches when searching
  useEffect(() => {
    if (searchQuery.trim() && hasSearched) {
      const newRecent = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 10)
      setRecentSearches(newRecent)
      localStorage.setItem('recentSearches', JSON.stringify(newRecent))
    }
  }, [searchQuery, hasSearched])

  // Load anime from API (use series grouping)
  useEffect(() => {
    async function loadAnime() {
      setIsLoading(true)
      try {
        const data = (await apiGetAllSeries()) as any
        if (data && typeof data === 'object' && 'series' in data) {
          // Convert series to anime format with season metadata
          const seriesList = Array.isArray(data.series) ? data.series : []
          const animeList = seriesList.map((series: any) => ({
            ...series,
            titleEnglish: series.titleEnglish || series.displayTitle,
            // Add series metadata
            seasonCount: series.seasonCount,
            totalEpisodes: series.totalEpisodes,
            seasons: series.seasons,
          }))
          setAllAnime(animeList)
        } else if (Array.isArray(data)) {
          setAllAnime(data)
        }
      } catch (err) {
        console.error('❌ Failed to load anime from API:', err)
        // Using centralized TRPC_URL; logged above if needed
        setAllAnime([])
      } finally {
        setIsLoading(false)
      }
    }
    loadAnime()
  }, [])

  // Handle URL parameters (including advanced search syntax)
  useEffect(() => {
    const query = searchParams.get('q')
    const cat = searchParams.get('category')
    const genresParam = searchParams.get('genres') || searchParams.get('genre')
    const studiosParam = searchParams.get('studios') || searchParams.get('studio')
    const seasonsParam = searchParams.get('seasons')
    const yearsParam = searchParams.get('years') || searchParams.get('year')
    const statusesParam = searchParams.get('statuses') || searchParams.get('status')
    const typesParam = searchParams.get('types') || searchParams.get('type')
    const sortParam = searchParams.get('sort')
    const minRatingParam = searchParams.get('minRating')
    const maxRatingParam = searchParams.get('maxRating')

    if (query) {
      setSearchQuery(query)
    }
    if (cat) {
      setCategory(cat)
    }
    // Capitalize first letter for display, but filtering is case-insensitive
    if (genresParam) {
      const genres = genresParam
        .split(',')
        .map((g) => g.charAt(0).toUpperCase() + g.slice(1).toLowerCase())
      setSelectedGenres(genres)
    }
    if (yearsParam) {
      setSelectedYears(yearsParam.split(','))
    }
    if (studiosParam) {
      // Capitalize each word for display (e.g., "mappa" → "MAPPA", "wit studio" → "Wit Studio")
      const studios = studiosParam.split(',').map((studio) =>
        studio
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      )
      setSelectedStudios(studios)
    }
    if (seasonsParam) {
      setSelectedSeasons(seasonsParam.split(','))
    }
    if (statusesParam) {
      setSelectedStatuses(statusesParam.split(','))
    }
    if (typesParam) {
      setSelectedTypes(typesParam.split(','))
    }
    if (sortParam) {
      setSortBy(sortParam as SortOption)
    }
    if (minRatingParam) {
      setMinRating(parseFloat(minRatingParam))
    }
    if (maxRatingParam) {
      setMaxRating(parseFloat(maxRatingParam))
    }

    // Auto-open filters if any are active from URL
    if (
      genresParam ||
      studiosParam ||
      seasonsParam ||
      yearsParam ||
      statusesParam ||
      typesParam ||
      minRatingParam ||
      maxRatingParam
    ) {
      setShowFilters(true)
    }
  }, [searchParams])

  // Filter and search logic
  useEffect(() => {
    if (allAnime.length === 0) {
      setFilteredAnime([])
      return
    }

    let results = [...allAnime]

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (anime) =>
          anime.title.toLowerCase().includes(query) ||
          (anime as any).titleEnglish?.toLowerCase().includes(query) ||
          anime.studio?.toLowerCase().includes(query) ||
          (anime.genres && anime.genres.some((g: any) => g.name.toLowerCase().includes(query))) ||
          anime.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      )
    }

    // Genre filter (case-insensitive)
    if (selectedGenres.length > 0) {
      results = results.filter((anime) => {
        const hasGenre =
          anime.genres &&
          selectedGenres.some((genre) =>
            anime.genres?.some((g: any) => {
              const match = g.name.toLowerCase() === genre.toLowerCase()
              return match
            })
          )
        return hasGenre
      })
    }

    // Studio filter (case-insensitive)
    if (selectedStudios.length > 0) {
      results = results.filter(
        (anime) =>
          anime.studio &&
          selectedStudios.some((studio) => anime.studio?.toLowerCase() === studio.toLowerCase())
      )
    }

    // Season filter
    if (selectedSeasons.length > 0) {
      results = results.filter((anime) => anime.season && selectedSeasons.includes(anime.season))
    }

    // Year filter
    if (selectedYears.length > 0) {
      results = results.filter(
        (anime) => anime.year && selectedYears.includes(anime.year.toString())
      )
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      results = results.filter(
        (anime) => (anime as any).status && selectedStatuses.includes((anime as any).status)
      )
    }

    // Type filter
    if (selectedTypes.length > 0) {
      results = results.filter((anime) => anime.type && selectedTypes.includes(anime.type))
    }

    // Rating range filter
    if (minRating > 0 || maxRating < 10) {
      results = results.filter((anime) => {
        const rating = typeof anime.rating === 'number' ? anime.rating : (typeof anime.rating === 'string' ? parseFloat(anime.rating) || 0 : 0)
        return rating >= minRating && rating <= maxRating
      })
    }

    // Sort results
    switch (sortBy) {
      case 'rating_desc':
        results.sort((a, b) => {
          const ratingA = typeof a.rating === 'number' ? a.rating : (typeof a.rating === 'string' ? parseFloat(a.rating) || 0 : 0)
          const ratingB = typeof b.rating === 'number' ? b.rating : (typeof b.rating === 'string' ? parseFloat(b.rating) || 0 : 0)
          return ratingB - ratingA
        })
        break
      case 'rating_asc':
        results.sort((a, b) => {
          const ratingA = typeof a.rating === 'number' ? a.rating : (typeof a.rating === 'string' ? parseFloat(a.rating) || 0 : 0)
          const ratingB = typeof b.rating === 'number' ? b.rating : (typeof b.rating === 'string' ? parseFloat(b.rating) || 0 : 0)
          return ratingA - ratingB
        })
        break
      case 'year_desc':
        results.sort((a, b) => (b.year || 0) - (a.year || 0))
        break
      case 'year_asc':
        results.sort((a, b) => (a.year || 0) - (b.year || 0))
        break
      case 'title_asc':
        results.sort((a, b) => {
          const titleA = (a as any).titleEnglish || a.title
          const titleB = (b as any).titleEnglish || b.title
          return titleA.localeCompare(titleB)
        })
        break
      case 'title_desc':
        results.sort((a, b) => {
          const titleA = (a as any).titleEnglish || a.title
          const titleB = (b as any).titleEnglish || b.title
          return titleB.localeCompare(titleA)
        })
        break
      case 'popularity_desc':
        results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        break
      case 'popularity_asc':
        results.sort((a, b) => (a.popularity || 0) - (b.popularity || 0))
        break
      case 'episodes_desc':
        results.sort((a, b) => (b.episodes || 0) - (a.episodes || 0))
        break
      case 'episodes_asc':
        results.sort((a, b) => (a.episodes || 0) - (b.episodes || 0))
        break
      case 'recently_added':
        results.sort((a, b) => {
          const dateA = new Date((a as any).createdAt || 0).getTime()
          const dateB = new Date((b as any).createdAt || 0).getTime()
          return dateB - dateA
        })
        break
      case 'relevance':
      default:
        // Keep original order for relevance
        break
    }

    setFilteredAnime(results)
  }, [
    allAnime,
    searchQuery,
    selectedGenres,
    selectedStudios,
    selectedSeasons,
    selectedYears,
    selectedStatuses,
    selectedTypes,
    minRating,
    maxRating,
    sortBy,
  ])

  const clearFilters = () => {
    setSelectedGenres([])
    setSelectedStudios([])
    setSelectedSeasons([])
    setSelectedYears([])
    setSelectedStatuses([])
    setSelectedTypes([])
    setMinRating(0)
    setMaxRating(10)
    setSearchQuery('')
    setSortBy('relevance')
    setHasSearched(false)
    updateURL()
  }

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query)
    setHasSearched(true)
    const newRecent = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 10)
    setRecentSearches(newRecent)
    localStorage.setItem('recentSearches', JSON.stringify(newRecent))
  }

  // Update URL with current filter state for shareable links
  const updateURL = (updates?: {
    query?: string
    genres?: string[]
    studios?: string[]
    seasons?: string[]
    years?: string[]
    statuses?: string[]
    types?: string[]
    sort?: SortOption
    minRating?: number
    maxRating?: number
  }) => {
    const params = new URLSearchParams()

    const q = updates?.query !== undefined ? updates.query : searchQuery
    const g = updates?.genres !== undefined ? updates.genres : selectedGenres
    const st = updates?.studios !== undefined ? updates.studios : selectedStudios
    const se = updates?.seasons !== undefined ? updates.seasons : selectedSeasons
    const y = updates?.years !== undefined ? updates.years : selectedYears
    const sta = updates?.statuses !== undefined ? updates.statuses : selectedStatuses
    const t = updates?.types !== undefined ? updates.types : selectedTypes
    const so = updates?.sort !== undefined ? updates.sort : sortBy
    const minR = updates?.minRating !== undefined ? updates.minRating : minRating
    const maxR = updates?.maxRating !== undefined ? updates.maxRating : maxRating

    if (q) params.set('q', q)
    if (g.length > 0) params.set('genres', g.join(','))
    if (st.length > 0) params.set('studios', st.join(','))
    if (se.length > 0) params.set('seasons', se.join(','))
    if (y.length > 0) params.set('years', y.join(','))
    if (sta.length > 0) params.set('statuses', sta.join(','))
    if (t.length > 0) params.set('types', t.join(','))
    if (so !== 'relevance') params.set('sort', so)
    if (minR > 0) params.set('minRating', minR.toString())
    if (maxR < 10) params.set('maxRating', maxR.toString())

    const newURL = params.toString() ? `/search?${params.toString()}` : '/search'
    router.replace(newURL, { scroll: false })
  }


  const activeFiltersCount =
    selectedGenres.length +
    selectedStudios.length +
    selectedSeasons.length +
    selectedYears.length +
    selectedStatuses.length +
    selectedTypes.length +
    (minRating > 0 || maxRating < 10 ? 1 : 0)

  return (
    <>
      {/* SEO Metadata */}
      <SearchSEOMetadata query={searchQuery || undefined} />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <main className="container px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-8 sm:pb-16 lg:pb-20 relative z-10">
          {/* Two-column layout: Sidebar + Main Content */}
          <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6">
            {/* Left Sidebar - Desktop (Always Visible, Sticky) */}
            <aside className="hidden lg:block">
              <div className="sticky top-40 max-h-[calc(100vh-11rem)] overflow-y-auto custom-scrollbar">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg">
                      <Filter className="h-3.5 w-3.5 text-white" />
            </div>
                    <h2 className="text-base font-bold text-white">Filters</h2>
                {activeFiltersCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-bold rounded-full shadow-lg">
                    {activeFiltersCount}
                  </span>
                )}
          </div>
                    <AdvancedFilters
                      genres={genres}
                      studios={studios}
                      seasons={seasons}
                      years={years}
                      selectedGenres={selectedGenres}
                      selectedStudios={selectedStudios}
                      selectedSeasons={selectedSeasons}
                      selectedYears={selectedYears}
                      selectedStatuses={selectedStatuses}
                      selectedTypes={selectedTypes}
                      minRating={minRating}
                      maxRating={maxRating}
                      onGenresChange={(genres) => {
                        setSelectedGenres(genres)
                        updateURL({ genres })
                      }}
                      onStudiosChange={(studios) => {
                        setSelectedStudios(studios)
                        updateURL({ studios })
                      }}
                      onSeasonsChange={(seasons) => {
                        setSelectedSeasons(seasons)
                        updateURL({ seasons })
                      }}
                      onYearsChange={(years) => {
                        setSelectedYears(years)
                        updateURL({ years })
                      }}
                      onStatusesChange={(statuses) => {
                        setSelectedStatuses(statuses)
                        updateURL({ statuses })
                      }}
                      onTypesChange={(types) => {
                        setSelectedTypes(types)
                        updateURL({ types })
                      }}
                      onRatingChange={(min, max) => {
                        setMinRating(min)
                        setMaxRating(max)
                        updateURL({ minRating: min, maxRating: max })
                      }}
                      onClearAll={clearFilters}
                    />
                  {activeFiltersCount > 0 && (
                    <div className="mt-5 pt-5 border-t border-white/10">
                      <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="w-full text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm py-2"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear all
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="min-w-0">
              {/* Header Section - Enhanced with gradient and icon */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-start gap-4 mb-3">
                  <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/25">
                    <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                        {category
                          ? `${category.charAt(0).toUpperCase() + category.slice(1)}`
                          : 'Discover Anime'}
                      </h1>
                      {category && (
                        <Badge className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-200 border-primary-500/30 px-4 py-1.5 self-start shadow-lg">
                          {category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm sm:text-base lg:text-lg text-gray-400">
                        {isLoading ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="animate-spin">⏳</span> Loading...
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <span className="text-primary-400 font-semibold">{filteredAnime.length}</span>
                            anime found
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Search Bar */}
              <div className="sticky top-0 z-40 mb-6 pb-4">
                <div className="relative group">
                  {/* Animated glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/30 via-secondary-500/30 to-primary-500/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="relative flex items-center">
                      <div className="absolute left-4 flex items-center justify-center z-10">
                        <Search className="h-5 w-5 text-primary-300 group-hover:text-primary-200 transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search by title, studio, genre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSearchSubmit(searchQuery)
                          }
                        }}
                        className="w-full bg-transparent border-none outline-none pl-11 pr-11 py-3.5 text-base text-white placeholder-gray-400 focus:placeholder-gray-500 transition-all font-medium"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/20 transition-all group/clear z-10"
                        >
                          <X className="h-4 w-4 text-gray-400 group-hover/clear:text-white transition-colors" />
                        </button>
                      )}
                      
                      {/* Decorative accent */}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls Bar - Sort and View Toggle Only */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-3 sm:gap-4">
                {/* Mobile: Show Filter Toggle */}
                <div className="lg:hidden flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`relative overflow-hidden border-2 transition-all text-sm font-medium flex-1 min-h-[48px] backdrop-blur-xl ${
                      showFilters
                        ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-primary-400/50 text-primary-200 shadow-lg shadow-primary-500/25'
                        : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                    {activeFiltersCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-bold rounded-full shadow-lg">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="min-h-[48px] px-3 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                      aria-label="Clear all filters"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                  {/* Sort Options */}
                  <SortOptions
                    value={sortBy}
                    onChange={(sort) => {
                      setSortBy(sort)
                      updateURL({ sort })
                    }}
                  />

                  {/* View Mode Toggle - Enhanced */}
                  <div className="flex items-center gap-1 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-1 shadow-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`relative p-2.5 rounded-lg transition-all min-h-[48px] min-w-[48px] flex items-center justify-center group ${
                        viewMode === 'grid'
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/50'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Grid className="h-4 w-4 transition-transform group-hover:scale-110" />
                      {viewMode === 'grid' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 animate-pulse rounded-lg"></div>
                      )}
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`relative p-2.5 rounded-lg transition-all min-h-[48px] min-w-[48px] flex items-center justify-center group ${
                        viewMode === 'list'
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/50'
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <ListIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                      {viewMode === 'list' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 animate-pulse rounded-lg"></div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Filters - Toggleable */}
              {showFilters && (
                <div className="lg:hidden mb-6">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                  <AdvancedFilters
                    genres={genres}
                    studios={studios}
                    seasons={seasons}
                    years={years}
                    selectedGenres={selectedGenres}
                    selectedStudios={selectedStudios}
                    selectedSeasons={selectedSeasons}
                    selectedYears={selectedYears}
                    selectedStatuses={selectedStatuses}
                    selectedTypes={selectedTypes}
                    minRating={minRating}
                    maxRating={maxRating}
                    onGenresChange={(genres) => {
                      setSelectedGenres(genres)
                      updateURL({ genres })
                    }}
                    onStudiosChange={(studios) => {
                      setSelectedStudios(studios)
                      updateURL({ studios })
                    }}
                    onSeasonsChange={(seasons) => {
                      setSelectedSeasons(seasons)
                      updateURL({ seasons })
                    }}
                    onYearsChange={(years) => {
                      setSelectedYears(years)
                      updateURL({ years })
                    }}
                    onStatusesChange={(statuses) => {
                      setSelectedStatuses(statuses)
                      updateURL({ statuses })
                    }}
                    onTypesChange={(types) => {
                      setSelectedTypes(types)
                      updateURL({ types })
                    }}
                    onRatingChange={(min, max) => {
                      setMinRating(min)
                      setMaxRating(max)
                      updateURL({ minRating: min, maxRating: max })
                    }}
                    onClearAll={clearFilters}
                  />
              </div>
            </div>
          )}

          {/* Anime Display */}
          {isLoading ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 20 }).map((_, i) => (
                  <AnimeCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <SearchResultSkeleton key={i} />
                ))}
              </div>
            )
          ) : filteredAnime.length === 0 ? (
            /* Empty State */
            <EmptyState
              icon={<Search className="h-12 w-12 text-gray-500" />}
              title="No anime found"
              message={
                searchQuery
                  ? `No results match "${searchQuery}". Try different keywords or adjust your filters.`
                  : activeFiltersCount > 0
                    ? `No anime match your current filters (${activeFiltersCount} active). Try adjusting them to see more results.`
                    : 'The anime database is being populated. Check back soon for thousands of titles!'
              }
              suggestions={
                searchQuery || activeFiltersCount > 0
                  ? [
                      'Check your spelling and try again',
                      'Use broader search terms (e.g., "action" instead of "action comedy")',
                      'Remove some filters to see more results',
                      'Try searching by genre or year instead',
                    ]
                  : undefined
              }
              actionLabel={searchQuery || activeFiltersCount > 0 ? 'Clear All Filters' : undefined}
              onAction={searchQuery || activeFiltersCount > 0 ? clearFilters : undefined}
              secondaryActionLabel={
                searchQuery || activeFiltersCount > 0 ? 'Browse All' : undefined
              }
              onSecondaryAction={
                searchQuery || activeFiltersCount > 0
                  ? () => {
                      clearFilters()
                      setSearchQuery('')
                    }
                  : undefined
              }
            />
          ) : viewMode === 'grid' ? (
            // Use virtual scrolling for large result sets (100+ items)
            filteredAnime.length > 100 ? (
              <VirtualGrid
                items={filteredAnime}
                itemWidth={200}
                itemHeight={340}
                columns={6}
                gap={20}
                height={900}
                className="pb-8"
                renderItem={(anime) => (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    variant="grid"
                    context="search"
                    onFavorite={() => toggleFavorite(anime.id)}
                    isFavorited={isFavorited(anime.id)}
                  />
                )}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                {filteredAnime.map((anime) => (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    variant="grid"
                    context="search"
                    onFavorite={() => toggleFavorite(anime.id)}
                    isFavorited={isFavorited(anime.id)}
                  />
                ))}
              </div>
            )
          ) : // Use virtual scrolling for list view with large results
          filteredAnime.length > 100 ? (
            <VirtualList
              items={filteredAnime}
              itemHeight={110}
              height={900}
              gap={12}
              className="pb-8"
              renderItem={(anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  variant="list"
                  context="search"
                  onFavorite={() => toggleFavorite(anime.id)}
                  isFavorited={isFavorited(anime.id)}
                />
              )}
            />
          ) : (
            <div className="space-y-3">
              {filteredAnime.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  variant="list"
                  context="search"
                  onFavorite={() => toggleFavorite(anime.id)}
                  isFavorited={isFavorited(anime.id)}
                />
              ))}
            </div>
          )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
