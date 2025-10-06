'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SearchAnimeCard } from '../../components/anime/SearchAnimeCard'
import { Button } from '../../components/ui/button'
import { Anime } from '../../types/anime'
import { getTagById } from '../../types/tags'
import { 
  Search, 
  Filter, 
  SortAsc, 
  Grid, 
  List, 
  Calendar,
  Building,
  Tag,
  Star,
  TrendingUp,
  Clock,
  X
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
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'year' | 'popularity'>('relevance')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedStudios, setSelectedStudios] = useState<string[]>([])
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [filteredAnime, setFilteredAnime] = useState(searchAnime)

  // Handle URL parameters
  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
    }
  }, [searchParams])

  // Filter and search logic
  useEffect(() => {
    let results = searchAnime

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter(anime => 
        anime.title.toLowerCase().includes(query) ||
        anime.studio?.toLowerCase().includes(query) ||
        anime.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Genre filter
    if (selectedGenres.length > 0) {
      results = results.filter(anime => 
        selectedGenres.some(genre => anime.tags.includes(genre))
      )
    }

    // Studio filter
    if (selectedStudios.length > 0) {
      results = results.filter(anime => 
        selectedStudios.some(studio => anime.studios.includes(studio))
      )
    }

    // Season filter
    if (selectedSeasons.length > 0) {
      results = results.filter(anime => 
        selectedSeasons.some(season => anime.seasons.includes(season))
      )
    }

    // Year filter
    if (selectedYears.length > 0) {
      results = results.filter(anime => 
        selectedYears.includes(anime.year.toString())
      )
    }

    // Sort results
    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating)
        break
      case 'year':
        results.sort((a, b) => b.year - a.year)
        break
      case 'popularity':
        results.sort((a, b) => b.popularity - a.popularity)
        break
      default:
        // Keep original order for relevance
        break
    }

    setFilteredAnime(results)
  }, [searchQuery, selectedGenres, selectedStudios, selectedSeasons, selectedYears, sortBy])

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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="container pt-32 pb-20 relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white via-cyan-200 to-pink-200 bg-clip-text text-transparent">
            Search Anime
          </h1>
          <p className="text-xl text-gray-300">
            Discover your next favorite anime
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search anime, studios, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-white/20 text-white hover:bg-white/10 transition-all duration-200 ${
                showFilters ? 'bg-white/10' : ''
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <SortAsc className="h-4 w-4 mr-2" />
              Sort: {sortBy}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-gray-400 hover:text-white"
              >
                Clear all
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-1">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm" 
              onClick={() => setViewMode('grid')}
              className={`transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 shadow-lg shadow-cyan-500/25' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm" 
              onClick={() => setViewMode('list')}
              className={`transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 shadow-lg shadow-cyan-500/25' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Genres */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Genres
                </h3>
                <div className="space-y-2">
                  {genres.map(genre => (
                    <button
                      key={genre}
                      onClick={() => toggleFilter('genre', genre)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        selectedGenres.includes(genre)
                          ? 'bg-pink-500 text-white'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Studios */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Studios
                </h3>
                <div className="space-y-2">
                  {studios.map(studio => (
                    <button
                      key={studio}
                      onClick={() => toggleFilter('studio', studio)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        selectedStudios.includes(studio)
                          ? 'bg-cyan-500 text-white'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {studio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seasons */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Seasons
                </h3>
                <div className="space-y-2">
                  {seasons.map(season => (
                    <button
                      key={season}
                      onClick={() => toggleFilter('season', season)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        selectedSeasons.includes(season)
                          ? 'bg-green-500 text-white'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              </div>

              {/* Years */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Years
                </h3>
                <div className="space-y-2">
                  {years.map(year => (
                    <button
                      key={year}
                      onClick={() => toggleFilter('year', year)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        selectedYears.includes(year)
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
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

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {filteredAnime.length} results found
            </h2>
            {searchQuery && (
              <p className="text-gray-400">
                Results for "{searchQuery}"
              </p>
            )}
          </div>
        </div>

        {/* Anime Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAnime.map((anime) => (
              <SearchAnimeCard
                key={anime.id}
                anime={anime as Anime}
                variant="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnime.map((anime) => (
              <SearchAnimeCard
                key={anime.id}
                anime={anime}
                variant="list"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredAnime.length === 0 && (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              No results found
            </h3>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto text-lg">
              Try adjusting your search terms or filters to find what you're looking for
            </p>
            <Button 
              onClick={clearFilters}
              className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 shadow-lg shadow-cyan-500/25 px-8 py-3 text-lg font-semibold"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
