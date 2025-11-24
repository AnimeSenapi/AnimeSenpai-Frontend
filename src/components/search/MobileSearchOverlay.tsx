/**
 * Mobile Search Overlay
 * Beautiful bottom sheet search experience for mobile devices
 * Works like desktop SearchBar with real-time results
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X, Mic, MicOff, Clock, TrendingUp, Sparkles, User, ArrowRight, Filter } from 'lucide-react'
import { MobileBottomSheet } from '../ui/MobileBottomSheet'
import { AnimeCard } from '../anime/AnimeCard'
import { apiSearchAnime, apiGetTrending, apiSearchUsers, apiGetUserProfile } from '../../app/lib/api'
import { useAnalytics } from '../AnalyticsProvider'
import { useHapticFeedback } from '../../hooks/use-haptic-feedback'
import { cn } from '../../app/lib/utils'

interface MobileSearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  onSearch?: (query: string) => void
  recentSearches?: string[]
  onClearRecent?: () => void
  trendingSearches?: string[]
}

export function MobileSearchOverlay({
  isOpen,
  onClose,
  onSearch,
  recentSearches = [],
  onClearRecent,
  trendingSearches = [],
}: MobileSearchOverlayProps) {
  const router = useRouter()
  const analytics = useAnalytics()
  const haptic = useHapticFeedback()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([])
  const [userResults, setUserResults] = useState<any[]>([])
  const [popularAnime, setPopularAnime] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [detectedFilters, setDetectedFilters] = useState<string[]>([])
  const [searchType, setSearchType] = useState<'anime' | 'user'>('anime')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Load popular anime from API on mount
  useEffect(() => {
    const loadPopularAnime = async () => {
      try {
        const trending = (await apiGetTrending()) as any
        const validTrending = (trending || []).filter((anime: any) => anime && anime.slug)
        setPopularAnime(validTrending.slice(0, 3))
      } catch (error) {
        setPopularAnime([])
      }
    }
    if (isOpen) {
      loadPopularAnime()
    }
  }, [isOpen])

  // Focus input when sheet opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.click()
      }, 300)
    } else {
      setSearchQuery('')
      setFilteredSuggestions([])
      setUserResults([])
      setIsSearching(false)
      setSelectedIndex(-1)
    }
  }, [isOpen])

  // Debounced search filter using API (same as desktop)
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
    }, 200) // 200ms debounce - same as desktop
  }, [])

  // Update search when query changes
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

  // Detect advanced search syntax (same as desktop)
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

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceError('Voice search not supported')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setVoiceError(null)
      haptic.medium()
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results?.[0]?.[0]?.transcript
      if (transcript) {
        setSearchQuery(transcript)
        setIsListening(false)
        haptic.success()
      }
    }

    recognition.onerror = (event: any) => {
      setIsListening(false)
      haptic.error()
      if (event.error === 'no-speech') {
        setVoiceError('No speech detected')
      } else if (event.error === 'not-allowed') {
        setVoiceError('Microphone permission denied')
      } else {
        setVoiceError('Voice recognition error')
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [haptic])

  const handleVoiceSearch = useCallback(() => {
    if (!recognitionRef.current) {
      setVoiceError('Voice search not available')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
      } catch (error) {
        setVoiceError('Failed to start voice recognition')
      }
    }
  }, [isListening])

  const parseAdvancedSearch = (query: string) => {
    const trimmed = query.trim()
    const params = new URLSearchParams()

    if (trimmed.startsWith('@')) {
      return { type: 'user' as const, value: trimmed.slice(1).trim(), params }
    }

    const filterRegex = /(\w+):([^\s]+)/g
    let match
    let hasFilters = false
    let remainingQuery = trimmed

    while ((match = filterRegex.exec(trimmed)) !== null) {
      const [fullMatch, filterType, filterValue] = match
      hasFilters = true
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
          remainingQuery += ` ${fullMatch}`
          break
      }
    }

    if (remainingQuery) {
      params.set('q', remainingQuery)
    }

    if (hasFilters || remainingQuery) {
      return { type: 'anime' as const, value: trimmed, params }
    }

    params.set('q', trimmed)
    return { type: 'anime' as const, value: trimmed, params }
  }

  const handleSearch = useCallback(
    (query: string) => {
      if (query.trim()) {
        const { type, value, params } = parseAdvancedSearch(query)

        // Track search analytics
        analytics.trackSearch(query, 0, { type, filters: detectedFilters })

        // Navigate based on search type
        if (type === 'user') {
          router.push(`/user/${encodeURIComponent(value)}`)
        } else {
          router.push(`/search?${params.toString()}`)
        }

        haptic.selection()
        if (onSearch) {
          onSearch(query)
        }
        handleClose()
      }
    },
    [router, analytics, detectedFilters, onSearch, haptic]
  )

  const selectSuggestion = (anime: any) => {
    router.push(`/anime/${anime.slug}`)
    haptic.selection()
    handleClose()
  }

  const selectUser = (user: any) => {
    router.push(`/user/${user.username}`)
    haptic.selection()
    handleClose()
  }

  const handleClose = useCallback(() => {
    haptic.light()
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setSearchQuery('')
    setFilteredSuggestions([])
    setUserResults([])
    setIsSearching(false)
    setVoiceError(null)
    setSelectedIndex(-1)
    onClose()
  }, [onClose, haptic, isListening])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalItems = searchQuery.trim()
      ? searchType === 'user'
        ? userResults.length
        : filteredSuggestions.length
      : popularAnime.length

    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0) {
        if (searchType === 'user' && userResults[selectedIndex]) {
          selectUser(userResults[selectedIndex])
        } else if (filteredSuggestions[selectedIndex]) {
          selectSuggestion(filteredSuggestions[selectedIndex])
        }
      } else {
        handleSearch(searchQuery.trim())
      }
    } else if (e.key === 'Escape') {
      handleClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    }
  }

  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Search"
      className="max-h-[90vh]"
      snapPoints={['85vh', '95vh']}
      showHeader={false}
    >
      {/* Custom Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-950/95 to-gray-950/80 backdrop-blur-xl border-b border-white/10 pb-3 pt-2">
        <div className="flex items-center gap-3 px-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Try: @user, genre:action, year:2024..."
              className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20 focus:bg-white/10 text-base transition-all"
              autoFocus
              autoComplete="off"
            />
            {/* Voice Search Button */}
            <button
              onClick={handleVoiceSearch}
              disabled={!!voiceError}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center transition-all touch-manipulation active:scale-95',
                isListening
                  ? 'bg-error-500/20 text-error-400 animate-pulse'
                  : 'text-gray-400 hover:text-primary-400 hover:bg-white/10',
                voiceError && 'opacity-50 cursor-not-allowed'
              )}
              aria-label={isListening ? 'Stop listening' : 'Start voice search'}
            >
              {isListening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all touch-manipulation active:scale-95 flex-shrink-0"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>


        {/* Voice Error */}
        {voiceError && (
          <div className="px-4 mt-2">
            <div className="px-3 py-2 bg-error-500/10 border border-error-500/20 rounded-lg">
              <p className="text-xs text-error-400">{voiceError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="overflow-y-auto flex-1 pb-safe-area-bottom">
        {searchQuery.trim() ? (
          // Search Results (same as desktop)
          <div className="p-4">
            {isSearching ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Search className="h-8 w-8 text-primary-400" />
                </div>
                <p className="text-sm text-gray-400">Searching...</p>
              </div>
            ) : (
              <>
                {/* User Search Results - Show when searching with @ or when users found in regular search */}
                {userResults.length > 0 && (
                  <>
                    <div className="px-2 py-2 text-xs text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      {userResults.length} {userResults.length === 1 ? 'User' : 'Users'}
                    </div>
                    <div className="space-y-2">
                      {userResults.map((user, index) => {
                        // Users always come first, so index is correct
                        const isSelected = selectedIndex === index
                        return (
                        <button
                          key={user.id}
                          onClick={() => selectUser(user)}
                          className={cn(
                            'w-full p-3 transition-all duration-200 rounded-xl cursor-pointer flex items-center gap-3 touch-manipulation active:scale-[0.98]',
                            isSelected
                              ? 'bg-primary-500/20 ring-2 ring-primary-500/50 shadow-lg shadow-primary-500/10'
                              : 'bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20'
                          )}
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-white font-semibold flex-shrink-0 relative overflow-hidden">
                            {user.avatar ? (
                              <Image
                                src={user.avatar}
                                alt={user.username}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              user.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="font-medium text-white text-sm truncate">
                              @{user.username}
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        </button>
                        )
                      })}
                    </div>
                  </>
                )}

                {/* User Search Empty State - Only show when searching with @ */}
                {searchType === 'user' && userResults.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-8 w-8 text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-400 mb-1">
                      {searchQuery.slice(1).trim().length < 2 ? 'Type a username' : 'No users found'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {searchQuery.slice(1).trim().length < 2 ? 'Type at least 2 characters after @' : 'Try a different username'}
                    </p>
                  </div>
                )}

                {/* Anime Search Results */}
                {filteredSuggestions.length > 0 ? (
                  <>
                    <div className="px-2 py-2 text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">
                      {filteredSuggestions.length}{' '}
                      {filteredSuggestions.length === 1 ? 'Result' : 'Results'}
                    </div>
                    <div className="space-y-2">
                      {filteredSuggestions.map((anime, index) => {
                        // For regular search, adjust index to account for user results
                        // For @ search, this won't be shown
                        const animeIndex = searchType === 'anime' ? userResults.length + index : index
                        const isSelected = selectedIndex === animeIndex
                        return (
                        <div
                          key={anime.id}
                          onClick={() => selectSuggestion(anime)}
                          className={cn(
                            'transition-all duration-200 rounded-xl cursor-pointer touch-manipulation active:scale-[0.98]',
                            isSelected
                              ? 'ring-2 ring-primary-500/50 shadow-lg shadow-primary-500/10'
                              : ''
                          )}
                        >
                          <AnimeCard anime={anime} variant="compact" context="search" />
                        </div>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => handleSearch(searchQuery)}
                      className="w-full mt-4 px-4 py-3 text-sm font-medium text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation active:scale-95 border border-primary-500/20 backdrop-blur-sm shadow-lg shadow-primary-500/10"
                    >
                      <span>View All Results</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </>
                ) : searchType === 'anime' && userResults.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-400 mb-1">No results found</p>
                    <p className="text-xs text-gray-500">Try a different search</p>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : (
          // Suggestions and Recent Searches (same as before but improved)
          <div className="p-4 space-y-6">
            {/* Popular Anime */}
            {popularAnime.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-primary-400" />
                  <h3 className="text-sm font-semibold text-gray-300">Popular Now</h3>
                </div>
                <div className="space-y-2">
                  {popularAnime.map((anime) => (
                    <div
                      key={anime.id}
                      onClick={() => selectSuggestion(anime)}
                      className="cursor-pointer touch-manipulation active:scale-[0.98]"
                    >
                      <AnimeCard anime={anime} variant="compact" context="search" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Suggestions */}
            {trendingSearches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-primary-400" />
                  <h3 className="text-sm font-semibold text-gray-300">Trending</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.slice(0, 6).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(search)
                        handleSearch(search)
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-primary-500/20 to-primary-500/10 border border-primary-500/30 rounded-xl text-sm font-medium text-primary-300 hover:text-primary-200 hover:from-primary-500/30 hover:to-primary-500/20 transition-all touch-manipulation active:scale-95 backdrop-blur-sm shadow-lg shadow-primary-500/10"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-300">Recent Searches</h3>
                  </div>
                  {onClearRecent && (
                    <button
                      onClick={() => {
                        haptic.selection()
                        onClearRecent()
                      }}
                      className="text-xs text-primary-400 hover:text-primary-300 transition-colors touch-manipulation"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(search)
                        handleSearch(search)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all touch-manipulation active:scale-[0.98] text-left group"
                    >
                      <Clock className="h-4 w-4 text-gray-500 group-hover:text-gray-400 flex-shrink-0" />
                      <span className="flex-1 truncate">{search}</span>
                      <Search className="h-4 w-4 text-gray-500 group-hover:text-primary-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {recentSearches.length === 0 && trendingSearches.length === 0 && popularAnime.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-primary-400" />
                </div>
                <p className="text-base font-medium text-gray-300 mb-2">Start searching</p>
                <p className="text-sm text-gray-500 mb-6">
                  Search for anime, characters, or users
                </p>
                {!voiceError && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                    <Mic className="h-4 w-4 text-primary-400" />
                    <span className="text-xs text-gray-400">Try voice search</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </MobileBottomSheet>
  )
}

// Type definitions for Speech Recognition API
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onstart: ((event: Event) => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}
