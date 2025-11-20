'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { SearchAnimeCard } from '../anime/SearchAnimeCard'
import { Search, X, ArrowRight, Filter, User } from 'lucide-react'
import { apiSearchAnime, apiGetTrending, apiSearchUsers, apiGetUserProfile } from '../../app/lib/api'
import { useAnalytics } from '../AnalyticsProvider'

interface SearchBarProps {
  className?: string
  placeholder?: string
  showDropdown?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'navbar' | 'standalone'
  onFocus?: () => void
  onBlur?: () => void
  dropdownDirection?: 'up' | 'down'
  renderDropdownOutside?: boolean
}

// Popular anime will be loaded from API

export function SearchBar({
  className = '',
  placeholder = 'Try: @user, genre:action, year:2024...',
  showDropdown = true,
  size = 'md',
  variant = 'navbar',
  onFocus,
  onBlur,
  dropdownDirection = 'down',
  renderDropdownOutside = false,
}: SearchBarProps) {
  const analytics = useAnalytics()
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
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 })
  const [isPositioned, setIsPositioned] = useState(false)

  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mount effect for SSR safety
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load popular anime from API on mount
  useEffect(() => {
    const loadPopularAnime = async () => {
      try {
        const trending = (await apiGetTrending()) as any
        // Filter out any undefined/null items or items without slugs before slicing
        const validTrending = (trending || []).filter((anime: any) => anime && anime.slug)
        setPopularAnime(validTrending.slice(0, 3))
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

        // Check if it's a user search (starts with @)
        if (query.startsWith('@')) {
          setSearchType('user')
          setSelectedIndex(-1) // Reset selected index when switching to user search
          const username = query.slice(1).trim()
          if (username.length >= 2) {
            try {
              // Try to search users first (if endpoint exists)
              let users = await apiSearchUsers(username, 5)
              let userResultsArray = Array.isArray(users) ? users : []
              
              // If no results from search and username looks complete (no spaces, reasonable length),
              // try fetching the user profile directly as a fallback
              // This handles the case where searchUsers endpoint doesn't exist
              if (userResultsArray.length === 0 && username.length >= 3 && !username.includes(' ')) {
                try {
                  // Use silentErrors=true to suppress error logging for expected "user not found" cases
                  const userProfile = await apiGetUserProfile(username, false, true)
                  if (userProfile && userProfile.user) {
                    // Format user profile to match expected structure
                    userResultsArray = [{
                      id: userProfile.user.id,
                      username: userProfile.user.username,
                      avatar: userProfile.user.avatar,
                      name: userProfile.user.name || userProfile.user.username
                    }]
                  }
                } catch (profileError) {
                  // User doesn't exist - silently ignore (expected behavior)
                  userResultsArray = []
                }
              }
              
              // Always update results, even if empty, to show the current state
              setUserResults(userResultsArray)
              setFilteredSuggestions([])
            } catch (error) {
              // Silently handle search errors
              setUserResults([])
            }
          } else {
            // Show empty state for user search when typing just "@" or "@x"
            setUserResults([])
            setFilteredSuggestions([])
          }
        } else {
          // Regular search - search both anime and users
          setSearchType('anime')
          setSelectedIndex(-1) // Reset selected index when switching to anime search
          
          // Search anime
          try {
            const results = (await apiSearchAnime(query)) as any
            // Filter out any undefined/null items or items without slugs
            const validResults = (results || []).filter((anime: any) => anime && anime.slug)
            setFilteredSuggestions(validResults.slice(0, 5))
          } catch (error) {
            setFilteredSuggestions([])
          }

          // Also search users if query is long enough (3+ characters for better results)
          // Only search users if query doesn't contain spaces (likely not a username)
          if (query.trim().length >= 3 && !query.trim().includes(' ')) {
            try {
              // Try to search users first (if endpoint exists)
              let users = await apiSearchUsers(query.trim(), 3)
              let userResultsArray = Array.isArray(users) ? users : []
              
              // If no results from search and query looks like a complete username,
              // try fetching the user profile directly as a fallback
              // This handles the case where searchUsers endpoint doesn't exist
              if (userResultsArray.length === 0 && query.trim().length >= 3 && !query.trim().includes(' ')) {
                try {
                  // Use silentErrors=true to suppress error logging for expected "user not found" cases
                  const userProfile = await apiGetUserProfile(query.trim(), false, true)
                  if (userProfile && userProfile.user) {
                    // Format user profile to match expected structure
                    userResultsArray = [{
                      id: userProfile.user.id,
                      username: userProfile.user.username,
                      avatar: userProfile.user.avatar,
                      name: userProfile.user.name || userProfile.user.username
                    }]
                  }
                } catch (profileError) {
                  // User doesn't exist - silently ignore (expected behavior)
                  userResultsArray = []
                }
              }
              
              // Always update results, even if empty, to show the current state
              setUserResults(userResultsArray)
            } catch (error) {
              // Silently handle search errors
              setUserResults([])
            }
          } else {
            setUserResults([])
          }
        }

        setIsSearching(false)
      } else {
        setFilteredSuggestions([])
        setUserResults([])
      }
    }, 200) // 200ms debounce - slightly longer to ensure user has stopped typing
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

  // Trigger final search when user stops typing (after a longer delay)
  useEffect(() => {
    if (!searchQuery.trim()) return

    const finalSearchTimer = setTimeout(() => {
      // Trigger a final search to ensure we have the latest results
      debouncedFilter(searchQuery)
    }, 500) // 500ms after last keystroke

    return () => {
      clearTimeout(finalSearchTimer)
    }
  }, [searchQuery, debouncedFilter])

  // Reset selected index when search type changes
  useEffect(() => {
    setSelectedIndex(-1)
  }, [searchType])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (searchRef.current && !searchRef.current.contains(target)) {
        // Also check if click is on the backdrop or dropdown
        if (renderDropdownOutside && dropdownRef.current) {
          if (!dropdownRef.current.contains(target)) {
            setIsOpen(false)
          }
        } else {
          setIsOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [renderDropdownOutside])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const parseAdvancedSearch = (
    query: string
  ): { type: string; value: string; params: URLSearchParams } => {
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

      if (!filterType || !filterValue) continue

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

      // Track search analytics
      analytics.trackSearch(query, 0, { type, filters: detectedFilters })

      // Save to recent searches
      const newRecent = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5)
      setRecentSearches(newRecent)
      localStorage.setItem('recentSearches', JSON.stringify(newRecent))

      // Navigate based on search type
      if (type === 'user') {
        router.push(`/user/${encodeURIComponent(value)}`)
      } else {
        router.push(`/search?${params.toString()}`)
      }

      setIsOpen(false)
      setSearchQuery('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Calculate total items based on search type
    // When searching normally (not @), show both anime and users
    let totalItems = 0
    if (searchQuery.trim()) {
      if (searchType === 'user') {
        totalItems = userResults.length
      } else {
        // Combine anime and user results for keyboard navigation
        totalItems = filteredSuggestions.length + userResults.length
      }
    } else {
      totalItems = popularAnime.length
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0) {
        // Handle user selection (users come first when both are shown)
        if (searchType === 'anime' && selectedIndex < userResults.length) {
          const user = userResults[selectedIndex]
          router.push(`/user/${user.username}`)
          setIsOpen(false)
          setSearchQuery('')
        } else if (searchType === 'user' && selectedIndex < userResults.length) {
          const user = userResults[selectedIndex]
          router.push(`/user/${user.username}`)
          setIsOpen(false)
          setSearchQuery('')
        } else {
          // Handle anime selection (adjust index for user results)
          const animeIndex = searchType === 'anime' ? selectedIndex - userResults.length : selectedIndex
          if (animeIndex >= 0 && animeIndex < filteredSuggestions.length) {
            selectSuggestion(filteredSuggestions[animeIndex])
          } else {
            handleSearch(searchQuery)
          }
        }
      } else {
        handleSearch(searchQuery)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
      setSelectedIndex(-1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
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
    // Trigger search if there's already a query
    if (searchQuery.trim()) {
      debouncedFilter(searchQuery)
    }
    onFocus?.()
  }

  const handleInputBlur = () => {
    // Delay blur to allow click events on dropdown
    // Keep dropdown open longer if there are results to give user time to click
    const delay = userResults.length > 0 || filteredSuggestions.length > 0 ? 300 : 200
    setTimeout(() => {
      setIsFocused(false)
      onBlur?.()
    }, delay)
  }

  // Enhanced dropdown position calculation with viewport boundary detection
  const calculateDropdownPosition = useCallback(() => {
    if (!searchRef.current || !inputRef.current) {
      return { top: 0, left: 0, width: 0 }
    }
    
    // Use input element position instead of searchRef to avoid filters affecting position
    const inputRect = inputRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Estimate dropdown dimensions
    const dropdownMaxHeight = 384 // max-h-96 = 24rem = 384px
    const margin = 12 // Margin from viewport edges
    
    // Calculate initial position (using viewport coordinates for fixed positioning)
    // Position relative to input, not the entire searchRef container
    let top = dropdownDirection === 'up' 
      ? inputRect.top - dropdownMaxHeight - margin
      : inputRect.bottom + margin
    let left = inputRect.left
    let width = Math.min(Math.max(inputRect.width, 300), 448) // min-w-[300px], max-w-md = 28rem = 448px
    
    // Ensure dropdown doesn't go off the right edge
    if (left + width > viewportWidth - margin) {
      left = viewportWidth - width - margin
    }
    
    // Ensure dropdown doesn't go off the left edge
    if (left < margin) {
      left = margin
      // If we're constrained on the left, try to expand width if possible
      width = Math.min(viewportWidth - margin * 2, Math.max(inputRect.width, 300))
    }
    
    // If dropdown would go off bottom, try to position it above
    const dropdownBottom = top + dropdownMaxHeight
    if (dropdownBottom > viewportHeight - margin && dropdownDirection === 'down') {
      const spaceAbove = inputRect.top - margin
      const spaceBelow = viewportHeight - inputRect.bottom - margin
      
      // Position above if there's more space above
      if (spaceAbove > spaceBelow && spaceAbove > dropdownMaxHeight) {
        top = inputRect.top - dropdownMaxHeight - margin
      }
    }
    
    // Ensure dropdown doesn't go off the top
    if (top < margin) {
      top = margin
    }
    
    return { top, left, width }
  }, [dropdownDirection])

  // Update dropdown position when it opens or window resizes
  useEffect(() => {
    if (isOpen && showDropdown && renderDropdownOutside && mounted && searchRef.current) {
      const position = calculateDropdownPosition()
      setDropdownPosition(position)
      setIsPositioned(true)
    } else {
      setIsPositioned(false)
    }
  }, [isOpen, showDropdown, renderDropdownOutside, mounted, calculateDropdownPosition])

  // Handle window resize to recalculate position
  useEffect(() => {
    if (!renderDropdownOutside || !isOpen) return

    const handleResize = () => {
      if (isOpen && searchRef.current) {
        const position = calculateDropdownPosition()
        setDropdownPosition(position)
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize, true) // Listen to scroll events too
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize, true)
    }
  }, [isOpen, renderDropdownOutside, calculateDropdownPosition])

  // Dropdown content component
  const DropdownContent = () => (
    <div className="overflow-y-auto overflow-x-hidden max-h-96 custom-scrollbar">
      {searchQuery.trim() ? (
        // Search Results
        <div className="p-2">
          {/* User Search Results - Show when searching with @ or when users found in regular search */}
          {userResults.length > 0 && (
            <>
              <div className="px-4 py-2 text-[11px] text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-2">
                <User className="h-3 w-3" />
                {userResults.length} {userResults.length === 1 ? 'User' : 'Users'}
              </div>
              <div className="space-y-1 px-1">
                {userResults.map((user, index) => {
                  // Users always come first, so index is correct
                  const isSelected = selectedIndex === index
                  return (
                  <div
                    key={user.id}
                    onClick={() => {
                      router.push(`/user/${user.username}`)
                      setIsOpen(false)
                      setSearchQuery('')
                    }}
                    className={`p-3 transition-all duration-200 rounded-lg cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-gray-800/80 ring-1 ring-primary-500/50'
                        : 'hover:bg-gray-800/40'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-white font-semibold flex-shrink-0 relative overflow-hidden">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.username}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">
                        @{user.username}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-primary-400 flex-shrink-0" />
                  </div>
                  )
                })}
              </div>
            </>
          )}

          {/* User Search Empty State - Only show when searching with @ */}
          {searchType === 'user' && userResults.length === 0 && (
            <div className="px-3 py-8 text-center text-gray-500">
              {searchQuery.slice(1).trim().length < 2 ? (
                <>
                  <User className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm mb-1">Type a username</p>
                  <p className="text-[10px] text-gray-600">Type at least 2 characters after @</p>
                </>
              ) : (
                <>
                  <User className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm mb-1">No users found</p>
                  <p className="text-[10px] text-gray-600">Try a different username</p>
                </>
              )}
            </div>
          )}

          {/* Anime Search Results */}
          {filteredSuggestions.length > 0 ? (
            <>
              <div className="px-4 py-2 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
                {filteredSuggestions.length}{' '}
                {filteredSuggestions.length === 1 ? 'Result' : 'Results'}
              </div>
              <div className="space-y-1 px-1">
                {filteredSuggestions.map((anime, index) => {
                  // For regular search, adjust index to account for user results
                  // For @ search, this won't be shown
                  const animeIndex = searchType === 'anime' ? userResults.length + index : index
                  const isSelected = selectedIndex === animeIndex
                  return (
                  <div
                    key={anime.id}
                    onClick={() => selectSuggestion(anime)}
                    className={`transition-all duration-200 rounded-lg cursor-pointer ${
                      isSelected
                        ? 'bg-gray-800/80 ring-1 ring-gray-700'
                        : 'hover:bg-gray-800/40'
                    }`}
                  >
                    <SearchAnimeCard anime={anime} variant="compact" />
                  </div>
                  )
                })}
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
          ) : searchType === 'anime' && userResults.length === 0 ? (
            <div className="px-3 py-8 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm mb-1">No results found</p>
              <p className="text-[10px] text-gray-600">Try a different search</p>
            </div>
          ) : null}
        </div>
      ) : (
        // Default suggestions
        <div className="p-2">
          {/* Compact Search Tips */}
          <div className="mb-2">
            <div className="px-3 py-2 text-[10px] text-gray-500 flex flex-wrap items-center gap-1">
              <span>💡 Try:</span>
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded font-mono whitespace-nowrap">
                @user
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded font-mono whitespace-nowrap">
                genre:action
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded font-mono whitespace-nowrap">
                year:2024
              </kbd>
            </div>
          </div>

          {/* Popular Anime */}
          {popularAnime.length > 0 && (
            <div className="mb-2">
              <div className="px-4 py-2 text-[11px] text-gray-500 font-semibold uppercase tracking-wider border-t border-gray-800/50 pt-3">
                Popular
              </div>
              <div className="space-y-1 px-1">
                {popularAnime.map((anime) => (
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
  )

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div
        className={`relative transition-all duration-300 ${isFocused && variant === 'navbar' ? 'scale-105' : ''}`}
      >
        <Search
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
            isFocused ? 'text-primary-400' : 'text-gray-400'
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className={`w-full bg-white/5 backdrop-blur-xl border text-white placeholder-gray-400 focus:outline-none transition-all duration-300 !rounded-xl ${
            isFocused
              ? 'border-primary-400/50 ring-2 ring-primary-400/20 shadow-lg shadow-primary-400/10'
              : 'border-white/10 hover:border-white/20'
          } ${
            size === 'sm'
              ? 'pl-10 pr-10 py-2.5 text-sm'
              : size === 'lg'
                ? 'pl-12 pr-12 py-4 text-lg'
                : 'pl-10 pr-10 py-3 text-sm'
          }`}
          style={{ borderRadius: '0.75rem' }}
        />

        {/* Loading indicator or Clear button */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {isSearching && (
            <div className="w-4 h-4 border-2 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
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


      {/* Dropdown - Enhanced Design with Backdrop */}
      {isOpen && showDropdown && mounted && (
        renderDropdownOutside ? (
          isPositioned && createPortal(
            <>
              {/* Backdrop Overlay */}
              <div 
                className="fixed inset-0 z-[9998] bg-black/20 transition-opacity duration-200"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />
              {/* Dropdown */}
              <div 
                ref={dropdownRef}
                className="fixed bg-gray-950/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-[9999] max-h-96 overflow-hidden min-w-[300px] max-w-md animate-in slide-in-from-top-2 fade-in duration-200"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownContent />
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
            </>,
            document.body
          )
        ) : (
          <div className={`absolute left-0 right-0 bg-gray-950/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-50 max-h-96 overflow-hidden min-w-[300px] max-w-md animate-in slide-in-from-top-2 fade-in duration-200 ${
            dropdownDirection === 'up' 
              ? 'bottom-full mb-3 slide-in-from-bottom-2' 
              : 'top-full mt-3'
          }`}>
            <DropdownContent />
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
        )
      )}
    </div>
  )
}