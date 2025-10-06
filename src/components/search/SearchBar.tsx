'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SearchAnimeCard } from '../anime/SearchAnimeCard'
import { Search, X, Clock, TrendingUp, Star, ArrowRight, Filter, Sparkles } from 'lucide-react'
import { Anime } from '../../types/anime'
import { apiSearchAnime, apiGetTrending } from '../../app/lib/api'

interface SearchBarProps {
  className?: string
  placeholder?: string
  showDropdown?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'navbar' | 'standalone'
  onFocus?: () => void
  onBlur?: () => void
}

// Popular anime will be loaded from API

export function SearchBar({ 
  className = '', 
  placeholder = 'Search anime, studios, genres...',
  showDropdown = true,
  size = 'md',
  variant = 'navbar',
  onFocus,
  onBlur
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([])
  const [popularAnime, setPopularAnime] = useState<any[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trendingSearches] = useState(['Attack on Titan', 'Demon Slayer', 'One Piece', 'Jujutsu Kaisen'])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Load popular anime from API on mount
  useEffect(() => {
    const loadPopularAnime = async () => {
      try {
        const trending = await apiGetTrending()
        setPopularAnime(trending.slice(0, 3))
      } catch (error) {
        console.error('Failed to load popular anime:', error)
      }
    }
    loadPopularAnime()
  }, [])

  // Debounced search filter using API
  const debouncedFilter = useCallback((query: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(async () => {
      if (query.trim()) {
        setIsSearching(true)
        try {
          const results = await apiSearchAnime(query)
          setFilteredSuggestions(results.slice(0, 5)) // Limit to 5 results
        } catch (error) {
          console.error('Search failed:', error)
          setFilteredSuggestions([])
        }
        setIsSearching(false)
      } else {
        setFilteredSuggestions([])
      }
    }, 150) // 150ms debounce
  }, [])

  // Filter suggestions based on search query with debounce
  useEffect(() => {
    debouncedFilter(searchQuery)
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchQuery, debouncedFilter])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Save to recent searches
      const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
      setRecentSearches(newRecent)
      localStorage.setItem('recentSearches', JSON.stringify(newRecent))
      
      // Navigate to search page
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = searchQuery.trim() ? filteredSuggestions.length : 
      (recentSearches.length + trendingSearches.length + 3)

    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
        selectSuggestion(filteredSuggestions[selectedIndex])
      } else {
        handleSearch(searchQuery)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
      setSelectedIndex(-1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    inputRef.current?.focus()
  }

  const selectSuggestion = (anime: any) => {
    router.push(`/anime/${anime.slug}`)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleInputFocus = () => {
    setIsOpen(true)
    setIsFocused(true)
    onFocus?.()
  }

  const handleInputBlur = () => {
    // Delay blur to allow click events on dropdown
    setTimeout(() => {
      setIsFocused(false)
      onBlur?.()
    }, 200)
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className={`relative transition-all duration-300 ${isFocused && variant === 'navbar' ? 'scale-105' : ''}`}>
        <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
          isFocused ? 'text-cyan-400' : 'text-gray-400'
        }`} />
        
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className={`w-full bg-white/5 backdrop-blur-xl border text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ${
            isFocused 
              ? 'border-cyan-400/50 ring-2 ring-cyan-400/20 shadow-lg shadow-cyan-400/10' 
              : 'border-white/10 hover:border-white/20'
          } ${
            variant === 'navbar' ? 'rounded-xl' : 'rounded-2xl'
          } ${
            size === 'sm' ? 'pl-10 pr-10 py-2 text-sm' : 
            size === 'lg' ? 'pl-12 pr-12 py-4 text-lg' : 
            'pl-10 pr-10 py-2.5 text-sm'
          }`}
        />
        
        {/* Loading indicator or Clear button */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {isSearching && (
            <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          )}
          {searchQuery && !isSearching && (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search hint */}
        {variant === 'standalone' && !isFocused && !searchQuery && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-xs text-gray-500">
            <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded">K</kbd>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl shadow-black/50 z-50 max-h-96 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="overflow-y-auto max-h-96 custom-scrollbar">
            {searchQuery.trim() ? (
              // Search Results
              <div className="p-2">
                {filteredSuggestions.length > 0 ? (
                  <>
                    <div className="px-3 py-2 text-xs text-gray-400 font-medium flex items-center gap-2">
                      <Sparkles className="h-3 w-3" />
                      <span>Search Results</span>
                      <span className="ml-auto text-cyan-400">{filteredSuggestions.length} found</span>
                    </div>
                    {filteredSuggestions.map((anime, index) => (
                      <div 
                        key={anime.id} 
                        onClick={() => selectSuggestion(anime)}
                        className={`transition-all duration-150 ${
                          selectedIndex === index 
                            ? 'bg-cyan-500/20 ring-1 ring-cyan-400/50 rounded-xl' 
                            : 'hover:bg-white/5 rounded-xl'
                        }`}
                      >
                        <SearchAnimeCard anime={anime} variant="compact" />
                      </div>
                    ))}
                    <div className="px-3 py-2 border-t border-white/10 mt-2">
                      <button
                        onClick={() => handleSearch(searchQuery)}
                        className="w-full text-left px-3 py-2.5 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all duration-200 flex items-center justify-between group"
                      >
                        <span className="font-medium">View all results for "{searchQuery}"</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="px-3 py-8 text-center text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                      <Search className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="text-sm font-medium mb-2">No results found</p>
                    <p className="text-xs text-gray-500 mb-4">Try a different search term</p>
                    <button
                      onClick={() => handleSearch(searchQuery)}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium inline-flex items-center gap-2 hover:gap-3 transition-all"
                    >
                      Search anyway <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
            // Default suggestions
            <div className="p-2">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-3">
                  <div className="px-3 py-2 text-xs text-gray-400 font-medium flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Recent Searches</span>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-150 flex items-center justify-between group"
                      >
                        <span>{search}</span>
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div className="mb-3">
                <div className="px-3 py-2 text-xs text-gray-400 font-medium flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>Trending Searches</span>
                </div>
                <div className="flex flex-wrap gap-2 px-3">
                  {trendingSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/50 rounded-full transition-all duration-200"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Anime */}
              <div className="mb-2">
                <div className="px-3 py-2 text-xs text-gray-400 font-medium flex items-center gap-2">
                  <Star className="h-3 w-3" />
                  <span>Popular Anime</span>
                </div>
                {popularAnime.length > 0 ? (
                  popularAnime.map((anime, index) => (
                    <div 
                      key={anime.id} 
                      onClick={() => selectSuggestion(anime)}
                      className="hover:bg-white/5 rounded-xl transition-all duration-150 cursor-pointer"
                    >
                      <SearchAnimeCard anime={anime} variant="compact" />
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-gray-500 text-xs">
                    Loading popular anime...
                  </div>
                )}
              </div>

              {/* Go to Search Page */}
              <div className="px-3 py-2 border-t border-white/10">
                <button
                  onClick={() => router.push('/search')}
                  className="w-full text-left px-3 py-2.5 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all duration-200 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="font-medium">Advanced Search</span>
                  </div>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
          </div>

          {/* Custom Scrollbar Styles */}
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(6, 182, 212, 0.3);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(6, 182, 212, 0.5);
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
