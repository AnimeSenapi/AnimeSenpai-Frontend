'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SearchAnimeCard } from '../../components/anime/SearchAnimeCard'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { AnimeCardSkeleton, SearchResultSkeleton } from '../../components/ui/skeleton'
import { EmptyState } from '../../components/ui/error-state'
import { Anime } from '../../types/anime'
import { apiGetAllSeries } from '../lib/api'
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
} from 'lucide-react'

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
  const [allAnime, setAllAnime] = useState<Anime[]>([])
  const [filteredAnime, setFilteredAnime] = useState<Anime[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
        console.error('API URL:', process.env.NEXT_PUBLIC_API_URL)
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
        const rating = anime.rating || 0
        return rating >= minRating && rating <= maxRating
      })
    }

    // Sort results
    switch (sortBy) {
      case 'rating_desc':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'rating_asc':
        results.sort((a, b) => (a.rating || 0) - (b.rating || 0))
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
    updateURL()
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

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <main className="container px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-32 pb-8 sm:pb-16 lg:pb-20 relative z-10">
          {/* Header Section - Responsive */}
          <div className="mb-4 sm:mb-8 lg:mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                {category
                  ? `${category.charAt(0).toUpperCase() + category.slice(1)}`
                  : 'Discover Anime'}
              </h1>
              {category && (
                <Badge className="bg-primary-500/20 text-primary-300 border-primary-500/30 px-3 py-1 self-start">
                  {category}
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-base lg:text-lg text-gray-400">
              {isLoading ? 'Loading...' : `${filteredAnime.length} anime found`}
            </p>
          </div>

          {/* Search Bar - Responsive */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <div className="relative max-w-3xl">
              <Search className="absolute left-3 sm:left-4 md:left-5 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, studio, genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl pl-10 sm:pl-12 md:pl-14 pr-10 sm:pr-12 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Controls Bar - Responsive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`border-white/20 text-white hover:bg-white/10 transition-all text-sm flex-1 sm:flex-initial min-h-[44px] ${
                  showFilters ? 'bg-white/10 border-primary-400/50' : ''
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-400 hover:text-white hover:bg-white/5 text-sm min-h-[44px]"
                >
                  Clear all
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sort Options */}
              <SortOptions
                value={sortBy}
                onChange={(sort) => {
                  setSortBy(sort)
                  updateURL({ sort })
                }}
              />

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-white/5 border border-white/20 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <ListIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mb-6 sm:mb-8">
              <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-6">
                {/* Sidebar Filters - Desktop */}
                <div className="hidden lg:block">
                  <div className="sticky top-24">
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

                {/* Mobile Filters */}
                <div className="lg:hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-4">
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

                {/* Results Column */}
                <div className="hidden lg:block">
                  <div className="text-sm text-gray-400 mb-4">
                    Showing {filteredAnime.length} results
                  </div>
                </div>
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
                  <SearchAnimeCard
                    key={anime.id}
                    anime={anime}
                    variant="grid"
                    onFavorite={() => toggleFavorite(anime.id)}
                    isFavorited={isFavorited(anime.id)}
                  />
                )}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                {filteredAnime.map((anime) => (
                  <SearchAnimeCard
                    key={anime.id}
                    anime={anime}
                    variant="grid"
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
                <SearchAnimeCard
                  key={anime.id}
                  anime={anime}
                  variant="list"
                  onFavorite={() => toggleFavorite(anime.id)}
                  isFavorited={isFavorited(anime.id)}
                />
              )}
            />
          ) : (
            <div className="space-y-3">
              {filteredAnime.map((anime) => (
                <SearchAnimeCard
                  key={anime.id}
                  anime={anime}
                  variant="list"
                  onFavorite={() => toggleFavorite(anime.id)}
                  isFavorited={isFavorited(anime.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
