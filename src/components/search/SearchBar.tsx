'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SearchAnimeCard } from '../anime/SearchAnimeCard'
import { Search, X, ArrowRight, Filter, User } from 'lucide-react'
import { apiSearchAnime, apiGetTrending, apiSearchUsers } from '../../app/lib/api'

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
  placeholder = 'Try: @user, genre:action, year:2024...',
  showDropdown = true,
  size = 'md',
  variant = 'navbar',
  onFocus,
  onBlur
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([])
  const [userResults, setUserResults] = useState<any[]>([])
  const [popularAnime, setPopularAnime] = useState<any[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [detectedFilters, setDetectedFilters] = useState<string[]>([])
  const [searchType, setSearchType] = useState<'anime' | 'user'>('anime')
  
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
        // Gracefully handle backend not running - just don't show popular anime
        // Silent fail - no console spam
        setPopularAnime([])
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
        
        // Check if it's a user search
        if (query.startsWith('@')) {
          setSearchType('user')
          const username = query.slice(1).trim()
          if (username.length >= 2) {
            try {
              const users = await apiSearchUsers(username, 5)
              setUserResults(users)
              setFilteredSuggestions([])
            } catch (error) {
              setUserResults([])
            }
          } else {
            setUserResults([])
          }
        } else {
          // Regular anime search
          setSearchType('anime')
          setUserResults([])
          try {
            const results = await apiSearchAnime(query)
            setFilteredSuggestions(results.slice(0, 5))
          } catch (error) {
            setFilteredSuggestions([])
          }
        }
        
        setIsSearching(false)
      } else {
        setFilteredSuggestions([])
        setUserResults([])
      }
    }, 150) // 150ms debounce
  }, [])

  // Detect advanced search syntax in real-time
  useEffect(() => {
    const filters: string[] = []
    
    if (searchQuery.startsWith('@')) {
      filters.push('👤 User Search')
    }
    
    if (searchQuery.includes('genre:') || searchQuery.includes('g:')) {
      filters.push('🎭 Genre Filter')
    }
    
    if (searchQuery.includes('year:') || searchQuery.includes('y:')) {
      filters.push('📅 Year Filter')
    }
    
    if (searchQuery.includes('studio:') || searchQuery.includes('s:')) {
      filters.push('🎬 Studio Filter')
    }
    
    if (searchQuery.includes('status:')) {
      filters.push('📊 Status Filter')
    }
    
    if (searchQuery.includes('type:') || searchQuery.includes('t:')) {
      filters.push('📺 Type Filter')
    }
    
    setDetectedFilters(filters)
  }, [searchQuery])

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

  const parseAdvancedSearch = (query: string): { type: string; value: string; params: URLSearchParams } => {
    const trimmed = query.trim()
    const params = new URLSearchParams()
    
    // Check for user search (@username)
    if (trimmed.startsWith('@')) {
      const username = trimmed.slice(1).trim()
      return { type: 'user', value: username, params }
    }
    
    // Check for advanced filters (genre:, year:, studio:, status:, type:)
    const filterRegex = /(\w+):([^\s]+)/g
    let match
    let hasFilters = false
    let remainingQuery = trimmed
    
    while ((match = filterRegex.exec(trimmed)) !== null) {
      const [fullMatch, filterType, filterValue] = match
      hasFilters = true
      
      // Remove the filter from the remaining query
      remainingQuery = remainingQuery.replace(fullMatch, '').trim()
      
      switch (filterType.toLowerCase()) {
        case 'genre':
        case 'g':
          params.set('genre', filterValue)
          break
        case 'year':
        case 'y':
          params.set('year', filterValue)
          break
        case 'studio':
        case 's':
          params.set('studio', filterValue)
          break
        case 'status':
          params.set('status', filterValue)
          break
        case 'type':
        case 't':
          params.set('type', filterValue)
          break
        default:
          // Unknown filter, add to text search
          remainingQuery += ` ${fullMatch}`
          break
      }
    }
    
    // Add remaining text as general search query
    if (remainingQuery) {
      params.set('q', remainingQuery)
    }
    
    if (hasFilters || remainingQuery) {
      return { type: 'anime', value: trimmed, params }
    }
    
    // Default: regular anime search
    params.set('q', trimmed)
    return { type: 'anime', value: trimmed, params }
  }

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const { type, value, params } = parseAdvancedSearch(query)
      
      // Save to recent searches
      const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
      setRecentSearches(newRecent)
      localStorage.setItem('recentSearches', JSON.stringify(newRecent))
      
      // Navigate based on search type
      if (type === 'user') {
        router.push(`/users/${encodeURIComponent(value)}`)
      } else {
        router.push(`/search?${params.toString()}`)
      }
      
      setIsOpen(false)
      setSearchQuery('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = searchQuery.trim() ? filteredSuggestions.length : popularAnime.length

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
          isFocused ? 'text-primary-400' : 'text-gray-400'
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
              ? 'border-brand-primary-400/50 ring-2 ring-brand-primary-400/20 shadow-lg shadow-brand-primary-400/10' 
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
            <div className="w-4 h-4 border-2 border-brand-primary-400/30 border-t-brand-primary-400 rounded-full animate-spin" />
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

      {/* Active Filters Display - Improved Design */}
      {detectedFilters.length > 0 && isFocused && (
        <div className="mt-2 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="text-[10px] text-gray-500 px-2 py-1">
            Active Filters:
          </div>
          {detectedFilters.map((filter, index) => (
            <div 
              key={index}
              className="text-xs px-3 py-1 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-300 rounded-full border border-primary-400/30 font-medium shadow-sm shadow-primary-500/10 animate-in fade-in slide-in-from-left-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {filter}
            </div>
          ))}
        </div>
      )}

      {/* Dropdown - Glassmorphic Design */}
      {isOpen && showDropdown && (
        <div 
          className="absolute top-full left-0 right-0 mt-3 border border-white/20 rounded-xl shadow-2xl shadow-black/50 z-50 max-h-96 overflow-hidden min-w-[300px]"
          style={{
            background: 'rgba(10, 10, 10, 0.6)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          <div className="overflow-y-auto overflow-x-hidden max-h-96 custom-scrollbar">
            {searchQuery.trim() ? (
              // Search Results
              <div className="p-2">
                {/* User Search Results */}
                {searchType === 'user' && userResults.length > 0 ? (
                  <>
                    <div className="px-4 py-2 text-[11px] text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {userResults.length} {userResults.length === 1 ? 'User' : 'Users'}
                    </div>
                    <div className="space-y-1 px-1">
                      {userResults.map((user, index) => (
                        <div 
                          key={user.id} 
                          onClick={() => {
                            router.push(`/users/${user.username}`)
                            setIsOpen(false)
                            setSearchQuery('')
                          }}
                          className={`p-3 transition-all duration-200 rounded-lg cursor-pointer flex items-center gap-3 ${
                            selectedIndex === index 
                              ? 'bg-gray-800/80 ring-1 ring-primary-500/50' 
                              : 'hover:bg-gray-800/40'
                          }`}
                        >
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              user.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-sm truncate">@{user.username}</div>
                            {user.name && <div className="text-xs text-gray-400 truncate">{user.name}</div>}
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-primary-400 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </>
                ) : searchType === 'anime' && filteredSuggestions.length > 0 ? (
                  <>
                    <div className="px-4 py-2 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
                      {filteredSuggestions.length} {filteredSuggestions.length === 1 ? 'Result' : 'Results'}
                    </div>
                    <div className="space-y-1 px-1">
                      {filteredSuggestions.map((anime, index) => (
                        <div 
                          key={anime.id} 
                          onClick={() => selectSuggestion(anime)}
                          className={`transition-all duration-200 rounded-lg cursor-pointer ${
                            selectedIndex === index 
                              ? 'bg-gray-800/80 ring-1 ring-gray-700' 
                              : 'hover:bg-gray-800/40'
                          }`}
                        >
                          <SearchAnimeCard anime={anime} variant="compact" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-800/50">
                      <button
                        onClick={() => handleSearch(searchQuery)}
                        className="w-full px-4 py-2.5 text-xs font-medium text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <span>View All Results</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="px-3 py-8 text-center text-gray-500">
                    {searchType === 'user' ? (
                      <>
                        <User className="h-8 w-8 mx-auto mb-3 opacity-20" />
                        <p className="text-sm mb-1">No users found</p>
                        <p className="text-[10px] text-gray-600">Try a different username</p>
                      </>
                    ) : (
                      <>
                        <Search className="h-8 w-8 mx-auto mb-3 opacity-20" />
                        <p className="text-sm mb-1">No anime found</p>
                        <p className="text-[10px] text-gray-600">Try a different search</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
            // Default suggestions
            <div className="p-2">
              {/* Compact Search Tips */}
              <div className="mb-2">
                <div className="px-3 py-2 text-[10px] text-gray-500 flex flex-wrap items-center gap-1">
                  <span>💡 Try:</span>
                  <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded font-mono whitespace-nowrap">@user</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded font-mono whitespace-nowrap">genre:action</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded font-mono whitespace-nowrap">year:2024</kbd>
                </div>
              </div>

              {/* Popular Anime */}
              {popularAnime.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-[11px] text-gray-500 font-semibold uppercase tracking-wider border-t border-gray-800/50 pt-3">
                    Popular
                  </div>
                  <div className="space-y-1 px-1">
                    {popularAnime.map((anime, index) => (
                      <div 
                        key={anime.id} 
                        onClick={() => selectSuggestion(anime)}
                        className="hover:bg-gray-800/40 rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        <SearchAnimeCard anime={anime} variant="compact" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Go to Search Page */}
              <div className="mt-2 pt-2 border-t border-gray-800/50">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    router.push('/search')
                  }}
                  className="w-full px-4 py-2.5 text-xs font-medium text-gray-400 hover:text-gray-300 hover:bg-gray-800/40 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>Advanced Search</span>
                  <Filter className="h-3.5 w-3.5" />
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
