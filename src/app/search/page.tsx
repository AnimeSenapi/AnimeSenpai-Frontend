'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SearchAnimeCard } from '../../components/anime/SearchAnimeCard'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { AnimeCardSkeleton, SearchResultSkeleton } from '../../components/ui/skeleton'
import { LoadingState } from '../../components/ui/loading-state'
import { EmptyState } from '../../components/ui/error-state'
import { Anime } from '../../types/anime'
import { getTagById } from '../../types/tags'
import { apiGetAllAnime, apiGetAllSeries } from '../lib/api'
import { useFavorites } from '../lib/favorites-context'
import { VirtualGrid, VirtualList } from '../../components/VirtualList'
import { 
  Search, 
  Filter, 
  Grid, 
  List as ListIcon, 
  Calendar,
  Building,
  Tag,
  Clock,
  X,
  Sparkles
} from 'lucide-react'

// Extended anime data with additional fields for search
const searchAnime: (Anime & { 
  listStatus?: 'favorite' | 'watching' | 'completed' | 'plan-to-watch',
  studios: string[],
  seasons: string[],
  popularity: number,
  releaseDate: string
})[] = [
  {
    id: '1',
    slug: 'attack-on-titan',
    title: 'Attack on Titan',
    year: 2023,
    rating: 9.2,
    status: 'new',
    tags: ['action', 'drama', 'supernatural'],
    episodes: 25,
    duration: 24,
    studio: 'Wit Studio',
    studios: ['Wit Studio'],
    seasons: ['Spring 2023'],
    popularity: 95,
    releaseDate: '2023-04-01',
    listStatus: 'favorite'
  },
  {
    id: '2',
    slug: 'demon-slayer',
    title: 'Demon Slayer',
    year: 2023,
    rating: 9.1,
    status: 'trending',
    tags: ['action', 'supernatural', 'shounen'],
    episodes: 26,
    duration: 23,
    studio: 'Ufotable',
    studios: ['Ufotable'],
    seasons: ['Spring 2023'],
    popularity: 92,
    releaseDate: '2023-04-15',
    listStatus: 'watching'
  },
  {
    id: '3',
    slug: 'one-piece',
    title: 'One Piece',
    year: 2023,
    rating: 9.5,
    status: 'hot',
    tags: ['adventure', 'comedy', 'shounen'],
    episodes: 1000,
    duration: 24,
    studio: 'Toei Animation',
    studios: ['Toei Animation'],
    seasons: ['Ongoing'],
    popularity: 98,
    releaseDate: '1999-10-20',
    listStatus: 'completed'
  },
  {
    id: '4',
    slug: 'fullmetal-alchemist',
    title: 'Fullmetal Alchemist',
    year: 2009,
    rating: 9.3,
    status: 'classic',
    tags: ['action', 'fantasy', 'drama'],
    episodes: 64,
    duration: 24,
    studio: 'Bones',
    studios: ['Bones'],
    seasons: ['Fall 2009'],
    popularity: 94,
    releaseDate: '2009-04-05',
    listStatus: 'completed'
  },
  {
    id: '5',
    slug: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    year: 2023,
    rating: 8.9,
    status: 'trending',
    tags: ['action', 'supernatural', 'school'],
    episodes: 24,
    duration: 24,
    studio: 'MAPPA',
    studios: ['MAPPA'],
    seasons: ['Fall 2023'],
    popularity: 89,
    releaseDate: '2023-10-01',
    listStatus: 'watching'
  },
  {
    id: '6',
    slug: 'my-hero-academia',
    title: 'My Hero Academia',
    year: 2023,
    rating: 8.7,
    status: 'hot',
    tags: ['action', 'school', 'shounen'],
    episodes: 138,
    duration: 24,
    studio: 'Bones',
    studios: ['Bones'],
    seasons: ['Spring 2023'],
    popularity: 87,
    releaseDate: '2023-04-01',
    listStatus: 'plan-to-watch'
  },
  {
    id: '7',
    slug: 'chainsaw-man',
    title: 'Chainsaw Man',
    year: 2022,
    rating: 8.8,
    status: 'trending',
    tags: ['action', 'supernatural', 'seinen'],
    episodes: 12,
    duration: 24,
    studio: 'MAPPA',
    studios: ['MAPPA'],
    seasons: ['Fall 2022'],
    popularity: 88,
    releaseDate: '2022-10-11',
    listStatus: 'favorite'
  },
  {
    id: '8',
    slug: 'spy-x-family',
    title: 'Spy x Family',
    year: 2022,
    rating: 8.7,
    status: 'trending',
    tags: ['comedy', 'action', 'family'],
    episodes: 25,
    duration: 24,
    studio: 'Wit Studio',
    studios: ['Wit Studio'],
    seasons: ['Spring 2022'],
    popularity: 85,
    releaseDate: '2022-04-09',
    listStatus: 'completed'
  }
]

// Available filters
const genres = ['Action', 'Comedy', 'Drama', 'Fantasy', 'Supernatural', 'School', 'Shounen', 'Seinen', 'Adventure', 'Family', 'Military']
const studios = ['Wit Studio', 'Ufotable', 'Toei Animation', 'Bones', 'MAPPA']
const seasons = ['Spring 2023', 'Fall 2023', 'Spring 2022', 'Fall 2022', 'Fall 2009', 'Ongoing']
const years = ['2023', '2022', '2009', '1999']

export default function SearchPage() {
  const searchParams = useSearchParams()
  const { isFavorited, toggleFavorite } = useFavorites()
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'year' | 'popularity'>('relevance')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedStudios, setSelectedStudios] = useState<string[]>([])
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [allAnime, setAllAnime] = useState<Anime[]>([])
  const [filteredAnime, setFilteredAnime] = useState<Anime[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load anime from API (use series grouping)
  useEffect(() => {
    async function loadAnime() {
      setIsLoading(true)
      try {
        const data = await apiGetAllSeries()
        if (data && typeof data === 'object' && 'series' in data) {
          // Convert series to anime format with season metadata
          const seriesList = Array.isArray(data.series) ? data.series : []
          const animeList = seriesList.map(series => ({
            ...series,
            titleEnglish: series.titleEnglish || series.displayTitle,
            // Add series metadata
            seasonCount: series.seasonCount,
            totalEpisodes: series.totalEpisodes,
            seasons: series.seasons
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
    const genre = searchParams.get('genre')
    const year = searchParams.get('year')
    const studio = searchParams.get('studio')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    
    if (query) {
      setSearchQuery(query)
    }
    if (cat) {
      setCategory(cat)
    }
    // Capitalize first letter for display, but filtering is case-insensitive
    if (genre) {
      const capitalizedGenre = genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase()
      setSelectedGenres([capitalizedGenre])
    }
    if (year) {
      setSelectedYears([year])
    }
    if (studio) {
      // Capitalize each word for display (e.g., "mappa" → "MAPPA", "wit studio" → "Wit Studio")
      const capitalizedStudio = studio.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
      setSelectedStudios([capitalizedStudio])
    }
    // Keep filters closed when coming from advanced search
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
      results = results.filter(anime => 
        anime.title.toLowerCase().includes(query) ||
        anime.studio?.toLowerCase().includes(query) ||
        (anime.genres && anime.genres.some((g: any) => g.name.toLowerCase().includes(query))) ||
        anime.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      )
    }

    // Genre filter (case-insensitive)
    if (selectedGenres.length > 0) {
      results = results.filter(anime => {
        const hasGenre = anime.genres && selectedGenres.some(genre => 
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
      results = results.filter(anime => 
        anime.studio && selectedStudios.some(studio => 
          anime.studio?.toLowerCase() === studio.toLowerCase()
        )
      )
    }

    // Year filter
    if (selectedYears.length > 0) {
      results = results.filter(anime => 
        anime.year && selectedYears.includes(anime.year.toString())
      )
    }

    // Sort results
    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'year':
        results.sort((a, b) => (b.year || 0) - (a.year || 0))
        break
      default:
        // Keep original order for relevance
        break
    }

    setFilteredAnime(results)
  }, [allAnime, searchQuery, selectedGenres, selectedStudios, selectedSeasons, selectedYears, sortBy])

  const clearFilters = () => {
    setSelectedGenres([])
    setSelectedStudios([])
    setSelectedSeasons([])
    setSelectedYears([])
    setSearchQuery('')
  }

  const toggleFilter = (type: string, value: string) => {
    switch (type) {
      case 'genre':
        setSelectedGenres(prev => 
          prev.includes(value) 
            ? prev.filter(g => g !== value)
            : [...prev, value]
        )
        break
      case 'studio':
        setSelectedStudios(prev => 
          prev.includes(value) 
            ? prev.filter(s => s !== value)
            : [...prev, value]
        )
        break
      case 'season':
        setSelectedSeasons(prev => 
          prev.includes(value) 
            ? prev.filter(s => s !== value)
            : [...prev, value]
        )
        break
      case 'year':
        setSelectedYears(prev => 
          prev.includes(value) 
            ? prev.filter(y => y !== value)
            : [...prev, value]
        )
        break
    }
  }

  const activeFiltersCount = selectedGenres.length + selectedStudios.length + selectedSeasons.length + selectedYears.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="container px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 relative z-10">
        {/* Header Section - Responsive */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              {category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'Discover Anime'}
            </h1>
            {category && (
              <Badge className="bg-primary-500/20 text-primary-300 border-primary-500/30 px-3 py-1 self-start">
                {category}
              </Badge>
            )}
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400">
            {isLoading ? 'Loading...' : `${filteredAnime.length} anime found`}
          </p>
        </div>

        {/* Search Bar - Responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-3xl">
            <Search className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, studio, genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl pl-11 sm:pl-14 pr-10 sm:pr-12 py-3 sm:py-4 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Controls Bar - Responsive */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-white/20 text-white hover:bg-white/10 transition-all text-sm flex-1 sm:flex-initial ${
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
                className="text-gray-400 hover:text-white hover:bg-white/5 text-sm"
              >
                Clear all
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'relevance' | 'rating' | 'year' | 'popularity')}
              className="bg-white/5 border border-white/20 text-white rounded-xl px-4 py-2 text-sm hover:bg-white/10 transition-all cursor-pointer focus:outline-none focus:border-primary-400/50"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="rating">Sort: Rating</option>
              <option value="year">Sort: Year</option>
              <option value="popularity">Sort: Popularity</option>
            </select>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/20 rounded-xl p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
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

        {/* Filters Panel - Redesigned */}
        {showFilters && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Genres */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-primary-400" />
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map(genre => (
                    <button
                      key={genre}
                      onClick={() => toggleFilter('genre', genre)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        selectedGenres.includes(genre)
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Studios */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-secondary-400" />
                  Studios
                </h3>
                <div className="flex flex-wrap gap-2">
                  {studios.map(studio => (
                    <button
                      key={studio}
                      onClick={() => toggleFilter('studio', studio)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        selectedStudios.includes(studio)
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                      }`}
                    >
                      {studio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seasons */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-success-400" />
                  Seasons
                </h3>
                <div className="flex flex-wrap gap-2">
                  {seasons.map(season => (
                    <button
                      key={season}
                      onClick={() => toggleFilter('season', season)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        selectedSeasons.includes(season)
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                      }`}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              </div>

              {/* Years */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-warning-400" />
                  Years
                </h3>
                <div className="flex flex-wrap gap-2">
                  {years.map(year => (
                    <button
                      key={year}
                      onClick={() => toggleFilter('year', year)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        selectedYears.includes(year)
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
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
            actionLabel={(searchQuery || activeFiltersCount > 0) ? 'Clear All Filters' : undefined}
            onAction={(searchQuery || activeFiltersCount > 0) ? clearFilters : undefined}
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
        ) : (
          // Use virtual scrolling for list view with large results
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
          )
        )}
      </main>
    </div>
  )
}
