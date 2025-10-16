/**
 * 🌐 AnimeSenpai API Client
 * 
 * Your friendly bridge to the backend! This lightweight client handles all communication
 * with the tRPC API, including auth, anime data, and user lists.
 * 
 * Format: POST /api/trpc/<router.procedure>
 * 
 * Note: Error messages are automatically translated to user-friendly text.
 * Technical errors like "UNAUTHORIZED" become "Your session has expired. Please sign in again."
 */

import type { 
  Anime, 
  AnimeListResponse, 
  AuthUser, 
  AuthResponse, 
  SignupInput,
  AnimeListItem,
  UserListResponse,
  ListStatus,
  FeatureFlag,
  FeatureAccess
} from '../../types/anime'
import { handleApiError, isAuthError, UserFriendlyError } from '../../lib/api-errors'
import { clientCache, CacheTTL } from '../../lib/client-cache'
import { logger, captureException } from '../../lib/logger'

type TRPCErrorShape = {
  message: string
  code: number
  data?: {
    code?: string
    httpStatus?: number
    path?: string
    timestamp?: string
    requestId?: string
  }
}

type TRPCResponse<T> = { result: { data: T } } | { error: TRPCErrorShape }

// Backend runs on port 3003 (check .env.local file)
const TRPC_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3003/api/trpc'

// API URL configuration
// TRPC_URL is set from environment variables

// Track if we're currently refreshing to prevent multiple simultaneous refreshes
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  
  // Check both localStorage (Remember Me) and sessionStorage (current session only)
  const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
  return accessToken ? { Authorization: 'Bearer ' + accessToken } : {}
}

// Refresh the access token using the refresh token
async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  // If already refreshing, wait for that to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }
  
  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
      if (!refreshToken) {
        return false
      }
      
      const url = `${TRPC_URL}/auth.refreshToken`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      })
      
      if (!res.ok) {
        // If refresh token is invalid/expired (401), clear all tokens
        if (res.status === 401) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          sessionStorage.removeItem('accessToken')
          sessionStorage.removeItem('refreshToken')
        }
        return false
      }
      
      const json = (await res.json()) as TRPCResponse<{
        accessToken: string
        refreshToken: string
        expiresAt: string
      }>
      
      if ('error' in json) {
        return false
      }
      
      const data = json.result.data
      
      // Store new tokens in the same storage that had the old refresh token
      const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage
      storage.setItem('accessToken', data.accessToken)
      storage.setItem('refreshToken', data.refreshToken)
      
      return true
    } catch (error) {
      logger.error('Token refresh failed', { error: error instanceof Error ? error.message : String(error) })
      captureException(error, { context: { operation: 'token_refresh' } })
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()
  
  return refreshPromise
}

// Convert technical error codes to user-friendly messages
// Re-export for backwards compatibility
function getUserFriendlyError(code: string, message: string): string {
  return handleApiError({ error: { data: { code }, message } })
}

async function trpcQuery<TOutput>(path: string, init?: RequestInit, retryCount = 0): Promise<TOutput> {
  const url = `${TRPC_URL}/${path}`
  
  // Debug: Check if we have auth token
  const authHeaders = getAuthHeaders()
  const hasToken = 'Authorization' in authHeaders
  if (!hasToken && typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    console.warn('⚠️ No auth token found for request:', path, 'Token exists:', !!token)
  }
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...authHeaders,
        ...(init?.headers || {}),
      },
      credentials: 'include',
      ...init,
    })

    if (!res.ok) {
      // Try to parse tRPC error
      let payload: TRPCResponse<unknown> | undefined
      try {
        payload = await res.json()
      } catch {
        throw new Error(getUserFriendlyError('NETWORK_ERROR', 'Unable to connect to the server'))
      }
      const message = (payload && 'error' in payload) ? payload.error.message : 'Request failed'
      const code = (payload && 'error' in payload && payload.error.data?.code) || 'UNKNOWN_ERROR'
      
      // Skip logging for expected errors on optional endpoints
      // Auth-related codes that are expected when not logged in
      const isExpectedAuthError = code === 'UNAUTHORIZED' || 
                                   code === 'TOKEN_INVALID' || 
                                   code === 'TOKEN_EXPIRED' ||
                                   message.includes('session') ||
                                   message.includes('token')
      
      // auth.me - skip all expected auth errors
      const isAuthCheck = path.includes('auth.me')
      
      // Other optional endpoints - skip only auth errors
      const isOtherOptionalEndpoint = path.includes('notifications.getUnreadCount') || 
                                       path.includes('social.getFriendRecommendations') ||
                                       path.includes('social.getRelationshipStatus')
      
      const shouldSkipLogging = (isAuthCheck && isExpectedAuthError) || 
                                 (isOtherOptionalEndpoint && isExpectedAuthError)
      
      if (!shouldSkipLogging) {
        console.error('❌ API Error Details:')
        console.error('Path:', path)
        console.error('Status:', res.status)
        console.error('Code:', code)
        console.error('Message:', message)
        console.error('Full Payload:', JSON.stringify(payload, null, 2))
      }
      
      // Try to refresh token on auth errors (only once)
      if ((code === 'UNAUTHORIZED' || message.includes('session') || message.includes('expired') || message.includes('token')) && retryCount === 0) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          // Retry the request with new token
          return trpcQuery<TOutput>(path, init, retryCount + 1)
        }
        
        // If refresh failed, clear tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      }
      
      throw new Error(getUserFriendlyError(code, message))
    }

    const json = (await res.json()) as TRPCResponse<TOutput>
    
    if ('error' in json) {
      const err = json.error
      const code = err.data?.code || 'UNKNOWN_ERROR'
      
      console.error('❌ tRPC GET Error:', { code, message: err.message })
      
      // Try to refresh token on auth errors (only once)
      if ((code === 'UNAUTHORIZED' || err.message.includes('session') || err.message.includes('expired') || err.message.includes('token')) && retryCount === 0) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          // Retry the request with new token
          return trpcQuery<TOutput>(path, init, retryCount + 1)
        }
        
        // If refresh failed, clear tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      }
      
      throw new Error(getUserFriendlyError(code, err.message))
    }
    
    // Filter out any undefined/null items from array responses
    const data = json.result.data
    if (Array.isArray(data)) {
      return data.filter(item => item != null) as TOutput
    }
    
    return data
  } catch (error: unknown) {
    logger.error('tRPC GET request failed', { 
      url, 
      trpcUrl: TRPC_URL,
      error: error instanceof Error ? error.message : String(error)
    })
    captureException(error, { 
      context: { url, endpoint: path },
      tags: { operation: 'trpc_query' }
    })
    
    // Handle network errors
    if (error instanceof Error && error.message.includes('fetch')) {
      const errorMsg = `Unable to connect to backend at ${url}. Is the backend running on port 3003?`
      console.error('❌ Network Error:', errorMsg)
      throw new Error(getUserFriendlyError('NETWORK_ERROR', errorMsg))
    }
    throw error
  }
}

async function trpcMutation<TInput, TOutput>(path: string, input?: TInput, init?: RequestInit, retryCount = 0): Promise<TOutput> {
  const url = `${TRPC_URL}/${path}`
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...(init?.headers || {}),
      },
      body: input !== undefined ? JSON.stringify(input) : undefined,
      credentials: 'include',
      ...init,
    })

    if (!res.ok) {
      // Try to parse tRPC error
      let payload: TRPCResponse<unknown> | undefined
      try {
        payload = await res.json()
      } catch {
        throw new Error(getUserFriendlyError('NETWORK_ERROR', 'Unable to connect to the server'))
      }
      const message = (payload && 'error' in payload) ? payload.error.message : 'Request failed'
      const code = (payload && 'error' in payload && payload.error.data?.code) || 'UNKNOWN_ERROR'
      
      // Try to refresh token on auth errors (only once)
      if ((code === 'UNAUTHORIZED' || message.includes('session') || message.includes('expired') || message.includes('token')) && retryCount === 0) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          // Retry the request with new token
          return trpcMutation<TInput, TOutput>(path, input, init, retryCount + 1)
        }
        
        // If refresh failed, clear tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      }
      
      throw new Error(getUserFriendlyError(code, message))
    }

    const json = (await res.json()) as TRPCResponse<TOutput>
    if ('error' in json) {
      const err = json.error
      const code = err.data?.code || 'UNKNOWN_ERROR'
      
      // Try to refresh token on auth errors (only once)
      if ((code === 'UNAUTHORIZED' || err.message.includes('session') || err.message.includes('expired') || err.message.includes('token')) && retryCount === 0) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          // Retry the request with new token
          return trpcMutation<TInput, TOutput>(path, input, init, retryCount + 1)
        }
        
        // If refresh failed, clear tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      }
      
      throw new Error(getUserFriendlyError(code, err.message))
    }
    
    // Filter out any undefined/null items from array responses
    const data = json.result.data
    if (Array.isArray(data)) {
      return data.filter(item => item != null) as TOutput
    }
    
    return data
  } catch (error: unknown) {
    logger.error('tRPC mutation failed', { 
      path, 
      trpcUrl: TRPC_URL,
      error: error instanceof Error ? error.message : String(error)
    })
    captureException(error, { 
      context: { path, input },
      tags: { operation: 'trpc_mutation' }
    })
    
    // Handle network errors
    if (error instanceof Error && error.message.includes('fetch')) {
      throw new Error(getUserFriendlyError('NETWORK_ERROR', 'Unable to connect to the server'))
    }
    throw error
  }
}

// Auth API
export async function apiSignup(input: SignupInput) {
  const data = await trpcMutation<SignupInput, AuthResponse>('auth.signup', input)
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
  }
  return data
}

export async function apiSignin(input: { email: string; password: string; rememberMe?: boolean }) {
  const data = await trpcMutation<typeof input, AuthResponse>('auth.signin', input)
  // Don't store tokens here - let the auth context handle it
  return data
}

export async function apiMe() {
  const result = await trpcQuery<AuthUser>('auth.me')
  return result
}

export async function apiForgotPassword(input: { email: string }) {
  return trpcMutation<typeof input, { success: boolean }>('auth.forgotPassword', input)
}

export async function apiResetPassword(input: { token: string; newPassword: string; confirmNewPassword: string }) {
  return trpcMutation<typeof input, { success: boolean }>('auth.resetPassword', input)
}

export async function apiVerifyEmail(input: { token: string }) {
  return trpcMutation<typeof input, { success: boolean }>('auth.verifyEmail', input)
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    // Clear tokens from both storage types
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('rememberMe')
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')
  }
}

// Anime API calls
export async function apiGetAllAnime(useCache: boolean = true) {
  const cacheKey = 'anime:all:limit100'
  
  // Check cache first
  if (useCache) {
    const cached = clientCache.get<any>(cacheKey)
    if (cached !== null) {
      return cached
    }
  }
  
  // Request reasonable limit to avoid API size limits (max 100)
  // With titleEnglish fields, large requests exceed 5MB response size
  const url = `${TRPC_URL}/anime.getAll?input=${encodeURIComponent(JSON.stringify({ limit: 100 }))}`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  })

  if (!response.ok) {
    console.error('Failed to fetch all anime:', response.status)
    return { anime: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }
  }

  const json = await response.json()
  const result = json.result?.data || { anime: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }
  
  // Cache for 5 minutes
  clientCache.set(cacheKey, result, CacheTTL.medium)
  
  return result
}

export async function apiGetAllSeries(useCache: boolean = true) {
  const cacheKey = 'anime:series:all:limit100'
  
  // Check cache first
  if (useCache) {
    const cached = clientCache.get<any>(cacheKey)
    if (cached !== null) {
      return cached
    }
  }
  
  // Get anime grouped by series (Crunchyroll-style)
  const url = `${TRPC_URL}/anime.getAllSeries?input=${encodeURIComponent(JSON.stringify({ limit: 100 }))}`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  })

  if (!response.ok) {
    console.error('Failed to fetch series:', response.status)
    return { series: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }
  }

  const json = await response.json()
  const result = json.result?.data || { series: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }
  
  // Cache for 5 minutes
  clientCache.set(cacheKey, result, CacheTTL.medium)
  
  return result
}

export async function apiGetTrending(useCache: boolean = true) {
  const cacheKey = 'anime:trending'
  
  // Check cache first (cached for 10 minutes - trending changes frequently)
  if (useCache) {
    const cached = clientCache.get<Anime[]>(cacheKey)
    if (cached !== null) {
      return cached
    }
  }
  
  const result = await trpcQuery<Anime[]>('anime.getTrending')
  
  // Cache for 15 minutes (using 'long' TTL)
  clientCache.set(cacheKey, result, CacheTTL.long)
  
  return result
}

export async function apiGetAnimeBySlug(slug: string, useCache: boolean = true) {
  const cacheKey = `anime:slug:${slug}`
  
  // Check cache first (anime details rarely change - cache for 30 minutes)
  if (useCache) {
    const cached = clientCache.get<Anime>(cacheKey)
    if (cached !== null) {
      return cached
    }
  }
  
  // For tRPC query with input, we need to pass it properly
  const url = `${TRPC_URL}/anime.getBySlug?input=${encodeURIComponent(JSON.stringify({ slug }))}`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch anime: ${response.statusText}`)
  }

  const data: TRPCResponse<Anime> = await response.json()

  if ('error' in data) {
    const code = data.error.data?.code || 'UNKNOWN_ERROR'
    const message = data.error.message || 'An error occurred'
    throw new Error(getUserFriendlyError(code, message))
  }

  const result = data.result.data
  
  // Cache for 1 hour (using 'veryLong' TTL)
  clientCache.set(cacheKey, result, CacheTTL.veryLong)
  
  return result
}

export async function apiGetGenres() {
  return trpcQuery<string[]>('anime.getGenres')
}

export async function apiSearchAnime(query: string): Promise<Anime[]> {
  try {
    // Try server-side search first (if backend supports it)
    const url = `${TRPC_URL}/anime.search?input=${encodeURIComponent(JSON.stringify({ query }))}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    })

    if (response.ok) {
      const data: TRPCResponse<Anime[]> = await response.json()
      if ('error' in data) throw new Error('Search endpoint failed')
      return data.result.data
    }
  } catch (error) {
    // Fallback to client-side search if backend doesn't support it yet
  }

  // Fallback: client-side search
  const allAnime = await apiGetAllAnime()
  const animeArray = Array.isArray(allAnime) ? allAnime : allAnime.anime
  const lowerQuery = query.toLowerCase()
  return animeArray.filter((anime: Anime) => 
    anime.title.toLowerCase().includes(lowerQuery) ||
    anime.description?.toLowerCase().includes(lowerQuery) ||
    anime.studio?.toLowerCase().includes(lowerQuery)
  )
}

// ===== MY LIST API =====

export async function apiGetUserList(): Promise<UserListResponse> {
  return trpcQuery<UserListResponse>('user.getAnimeList')
}

export async function apiAddToList(input: { 
  animeId: string
  status: ListStatus
  isFavorite?: boolean 
}): Promise<AnimeListItem> {
  return trpcMutation<typeof input, AnimeListItem>('mylist.addToList', input)
}

export async function apiRemoveFromList(listItemId: string): Promise<{ success: boolean }> {
  return trpcMutation<{ listItemId: string }, { success: boolean }>('mylist.removeFromList', { listItemId })
}

export async function apiUpdateListStatus(input: {
  listItemId: string
  status: ListStatus
}): Promise<AnimeListItem> {
  return trpcMutation<typeof input, AnimeListItem>('mylist.updateStatus', input)
}

export async function apiUpdateListProgress(input: {
  listItemId: string
  currentEpisode: number
}): Promise<AnimeListItem> {
  return trpcMutation<typeof input, AnimeListItem>('mylist.updateProgress', input)
}

export async function apiToggleFavorite(listItemId: string): Promise<AnimeListItem> {
  return trpcMutation<{ listItemId: string }, AnimeListItem>('mylist.toggleFavorite', { listItemId })
}

// Toggle favorite by anime ID (creates list entry if not exists)
export async function apiToggleFavoriteByAnimeId(animeId: string): Promise<{ isFavorite: boolean }> {
  return trpcMutation<{ animeId: string }, { isFavorite: boolean }>('user.toggleFavorite', { animeId })
}

// Get user's favorited anime IDs
export async function apiGetFavoritedAnimeIds(): Promise<string[]> {
  try {
    const result = await trpcQuery<{ animeIds: string[] }>('user.getFavoritedAnimeIds')
    return result.animeIds || []
  } catch (error) {
    console.error('Failed to fetch favorited anime IDs:', error)
    return []
  }
}

export async function apiUpdateListRating(input: {
  listItemId: string
  rating: number // 1-10
}): Promise<AnimeListItem> {
  return trpcMutation<typeof input, AnimeListItem>('mylist.updateRating', input)
}

// ===== FEATURE FLAGS API (Beta Testing) =====

export async function apiCheckFeature(feature: string): Promise<FeatureAccess> {
  const url = `${TRPC_URL}/user.checkFeature?input=${encodeURIComponent(JSON.stringify({ feature }))}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    return { feature, hasAccess: false, reason: 'Feature check failed' }
  }

  const data: TRPCResponse<FeatureAccess> = await response.json()
  if ('error' in data) {
    return { feature, hasAccess: false, reason: 'Not authenticated' }
  }

  return data.result.data
}

export async function apiGetAllFeatures(): Promise<FeatureFlag[]> {
  try {
    return await trpcQuery<FeatureFlag[]>('admin.getAllFeatures')
  } catch {
    return []
  }
}

// User Profile by Username
export async function apiGetUserByUsername(username: string): Promise<any> {
  const url = `${TRPC_URL}/user.getUserByUsername?input=${encodeURIComponent(JSON.stringify({ username }))}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error?.message || 'User not found')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// Check Username Availability
export async function apiCheckUsernameAvailability(username: string): Promise<{ available: boolean; username: string }> {
  const url = `${TRPC_URL}/user.checkUsernameAvailability?input=${encodeURIComponent(JSON.stringify({ username }))}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    return { available: false, username }
  }

  const data: TRPCResponse<{ available: boolean; username: string }> = await response.json()
  if ('error' in data) {
    return { available: false, username }
  }

  return data.result.data
}

// Search Users
export async function apiSearchUsers(query: string, limit: number = 10): Promise<any[]> {
  try {
    const url = `${TRPC_URL}/social.searchUsers?input=${encodeURIComponent(JSON.stringify({ query, limit }))}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return []
    }

    const data: TRPCResponse<{ users: any[] }> = await response.json()
    if ('error' in data) {
      return []
    }

    return data.result.data.users || []
  } catch (error) {
    console.error('Failed to search users:', error)
    return []
  }
}

// ============================================
// Admin API Functions
// ============================================

// Get Admin Statistics
export async function apiGetAdminStats() {
  const url = `${TRPC_URL}/admin.getStats`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to fetch admin stats')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// Get All Users (Admin)
export async function apiGetAllUsers(input?: { page?: number; limit?: number; role?: string }) {
  const url = `${TRPC_URL}/admin.getAllUsers${input ? `?input=${encodeURIComponent(JSON.stringify(input))}` : ''}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to fetch users')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// Search Users (Admin)
export async function apiAdminSearchUsers(query: string, limit: number = 20) {
  const url = `${TRPC_URL}/admin.searchUsers?input=${encodeURIComponent(JSON.stringify({ query, limit }))}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to search users')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// Get User Details (Admin)
export async function apiGetUserDetails(userId: string) {
  const url = `${TRPC_URL}/admin.getUserDetails?input=${encodeURIComponent(JSON.stringify({ userId }))}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to fetch user details')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// Update User Role (Admin)
export async function apiUpdateUserRole(userId: string, role: 'user' | 'moderator' | 'admin') {
  const url = `${TRPC_URL}/admin.updateUserRole`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ userId, role }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to update user role')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// Ban User (Admin)
export async function apiBanUser(userId: string, reason?: string) {
  const url = `${TRPC_URL}/admin.banUser`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ userId, reason }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to ban user')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// Delete User (Admin)
export async function apiDeleteUser(userId: string) {
  const url = `${TRPC_URL}/admin.deleteUser`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ userId }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to delete user')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// Update Anime (Admin)
export async function apiUpdateAnime(animeId: string, updateData: {
  title?: string
  titleEnglish?: string
  titleJapanese?: string
  synopsis?: string
  year?: number
  episodes?: number
  status?: string
  type?: string
  rating?: string
  coverImage?: string
  bannerImage?: string
  trailer?: string
}) {
  const url = `${TRPC_URL}/admin.updateAnime`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ animeId, ...updateData }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to update anime')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// Delete Anime (Admin)
export async function apiDeleteAnime(animeId: string) {
  const url = `${TRPC_URL}/admin.deleteAnime`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ animeId }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to delete anime')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// Get System Settings (Admin)
export async function apiGetSettings() {
  const url = `${TRPC_URL}/admin.getSettings`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to fetch settings')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// Save System Settings (Admin)
export async function apiSaveSettings(settings: {
  general?: {
    siteName: string
    siteDescription: string
    maintenanceMode: boolean
    allowRegistration: boolean
    requireEmailVerification: boolean
  }
  features?: {
    enableRecommendations: boolean
    enableSocialFeatures: boolean
    enableAchievements: boolean
    enableComments: boolean
  }
  security?: {
    sessionTimeout: number
    maxLoginAttempts: number
    requireStrongPasswords: boolean
    enableTwoFactor: boolean
  }
  notifications?: {
    emailNotifications: boolean
    newUserAlert: boolean
    errorReporting: boolean
  }
  analytics?: {
    googleAnalyticsId: string
    enableTracking: boolean
  }
}) {
  const url = `${TRPC_URL}/admin.saveSettings`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(settings),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to save settings')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// ============================================================================
// Moderation API
// ============================================================================

export async function apiGetReviews(params?: { page?: number; limit?: number; filter?: string; search?: string }) {
  const inputData: any = {}
  if (params?.page) inputData.page = params.page
  if (params?.limit) inputData.limit = params.limit
  if (params?.filter) inputData.filter = params.filter
  if (params?.search) inputData.search = params.search
  
  const input = JSON.stringify(inputData)
  const path = `moderation.getReviews?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

export async function apiGetModerationStats() {
  return trpcQuery('moderation.getStats')
}

export async function apiToggleReviewVisibility(reviewId: string, isPublic: boolean) {
  return trpcMutation('moderation.toggleReviewVisibility', { reviewId, isPublic })
}

export async function apiDeleteReview(reviewId: string) {
  return trpcMutation('moderation.deleteReview', { reviewId })
}

export async function apiGetFlaggedUsers() {
  return trpcQuery('moderation.getFlaggedUsers')
}

// ============================================================================
// GDPR Compliance API
// ============================================================================

export async function apiExportUserData() {
  return trpcQuery('gdpr.exportUserData')
}

export async function apiRequestAccountDeletion(password: string, reason?: string) {
  return trpcMutation('gdpr.requestAccountDeletion', { password, reason })
}

export async function apiCancelAccountDeletion() {
  return trpcMutation('gdpr.cancelAccountDeletion', {})
}

export async function apiGetDataProcessingInfo() {
  return trpcQuery('gdpr.getDataProcessingInfo')
}

// ============================================================================
// Social Features API - Phase 1
// ============================================================================

// Follow System
export async function apiFollowUser(userId: string) {
  return trpcMutation('social.followUser', { userId })
}

export async function apiUnfollowUser(userId: string) {
  return trpcMutation('social.unfollowUser', { userId })
}

// Friend System
export async function apiSendFriendRequest(userId: string) {
  return trpcMutation('social.sendFriendRequest', { userId })
}

export async function apiAcceptFriendRequest(requestId: string) {
  return trpcMutation('social.acceptFriendRequest', { requestId })
}

export async function apiDeclineFriendRequest(requestId: string) {
  return trpcMutation('social.declineFriendRequest', { requestId })
}

export async function apiUnfriend(userId: string) {
  return trpcMutation('social.unfriend', { userId })
}

// Relationships
export async function apiGetRelationshipStatus(userId: string) {
  const input = JSON.stringify({ userId })
  const path = `social.getRelationshipStatus?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

export async function apiGetFriends(userId?: string) {
  if (userId) {
    const input = JSON.stringify({ userId })
    const path = `social.getFriends?input=${encodeURIComponent(input)}`
    return trpcQuery(path)
  }
  return trpcQuery('social.getFriends')
}

export async function apiGetPendingFriendRequests() {
  return trpcQuery('social.getPendingFriendRequests')
}

export async function apiGetFollowers(userId?: string, page?: number, limit?: number) {
  const params: any = {}
  if (userId) params.userId = userId
  if (page) params.page = page
  if (limit) params.limit = limit
  
  if (Object.keys(params).length > 0) {
    const input = JSON.stringify(params)
    const path = `social.getFollowers?input=${encodeURIComponent(input)}`
    return trpcQuery(path)
  }
  return trpcQuery('social.getFollowers')
}

export async function apiGetFollowing(userId?: string, page?: number, limit?: number) {
  const params: any = {}
  if (userId) params.userId = userId
  if (page) params.page = page
  if (limit) params.limit = limit
  
  if (Object.keys(params).length > 0) {
    const input = JSON.stringify(params)
    const path = `social.getFollowing?input=${encodeURIComponent(input)}`
    return trpcQuery(path)
  }
  return trpcQuery('social.getFollowing')
}

// User Profiles
export async function apiGetUserProfile(username: string) {
  // Strip @ symbol if present (defensive check)
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username
  
  // For tRPC GET requests, input must be in query params using 'input' parameter
  const input = JSON.stringify({ username: cleanUsername })
  const path = `social.getUserProfile?input=${encodeURIComponent(input)}`
  
  return trpcQuery(path)
}

// Privacy Settings (Phase 1 - deprecated, use Phase 2 enhanced versions)
export async function apiGetPrivacySettings() {
  return trpcQuery('social.getPrivacySettings')
}

export async function apiUpdatePrivacySettings(settings: {
  profileVisibility?: 'public' | 'friends' | 'private'
  listVisibility?: 'public' | 'friends' | 'private'
  activityVisibility?: 'public' | 'friends' | 'private'
  friendsVisibility?: 'public' | 'friends' | 'private'
  reviewsVisibility?: 'public' | 'friends' | 'private'
  hiddenAnimeIds?: string[]
}) {
  return trpcMutation('social.updatePrivacySettings', settings)
}

export async function apiHideAnimeFromList(animeId: string) {
  return trpcMutation('social.hideAnimeFromList', { animeId })
}

export async function apiUnhideAnimeFromList(animeId: string) {
  return trpcMutation('social.unhideAnimeFromList', { animeId })
}

// ============================================
// Phase 2 Social Features API
// ============================================

// Activity Feed
export async function apiGetFriendActivities(params?: { limit?: number; cursor?: string }) {
  const inputData: any = {}
  if (params?.limit) inputData.limit = params.limit
  if (params?.cursor) inputData.cursor = params.cursor
  
  const input = JSON.stringify(inputData)
  const path = `activity.getFriendActivities?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

export async function apiGetMyActivities(params?: { limit?: number; cursor?: string }) {
  const inputData: any = {}
  if (params?.limit) inputData.limit = params.limit
  if (params?.cursor) inputData.cursor = params.cursor
  
  const input = JSON.stringify(inputData)
  const path = `activity.getMyActivities?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

export async function apiGetActivityStats(params?: { userId?: string; timeRange?: 'week' | 'month' | 'year' | 'all' }) {
  const inputData: any = {}
  if (params?.userId) inputData.userId = params.userId
  if (params?.timeRange) inputData.timeRange = params.timeRange
  
  const input = JSON.stringify(inputData)
  const path = `activity.getActivityStats?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

// Review Interactions
export async function apiLikeReview(reviewId: string) {
  return trpcMutation('reviewInteractions.likeReview', { reviewId })
}

export async function apiUnlikeReview(reviewId: string) {
  return trpcMutation('reviewInteractions.unlikeReview', { reviewId })
}

export async function apiGetReviewLikes(reviewId: string, params?: { limit?: number; cursor?: string }) {
  const inputData: any = { reviewId }
  if (params?.limit) inputData.limit = params.limit
  if (params?.cursor) inputData.cursor = params.cursor
  
  const input = JSON.stringify(inputData)
  const path = `reviewInteractions.getReviewLikes?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

export async function apiAddReviewComment(reviewId: string, content: string) {
  return trpcMutation('reviewInteractions.addComment', { reviewId, content })
}

export async function apiGetReviewComments(reviewId: string, params?: { limit?: number; cursor?: string }) {
  const inputData: any = { reviewId }
  if (params?.limit) inputData.limit = params.limit
  if (params?.cursor) inputData.cursor = params.cursor
  
  const input = JSON.stringify(inputData)
  const path = `reviewInteractions.getComments?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

export async function apiDeleteReviewComment(commentId: string) {
  return trpcMutation('reviewInteractions.deleteComment', { commentId })
}

export async function apiTagFriendsInReview(reviewId: string, userIds: string[]) {
  return trpcMutation('reviewInteractions.tagFriends', { reviewId, userIds })
}

export async function apiGetTaggedUsers(reviewId: string) {
  const input = JSON.stringify({ reviewId })
  const path = `reviewInteractions.getTaggedUsers?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

// Enhanced Notifications
export async function apiSubscribeToPush(subscription: {
  endpoint: string
  keys: { p256dh: string; auth: string }
  userAgent?: string
}) {
  return trpcMutation('notifications.subscribeToPush', subscription)
}

export async function apiUnsubscribeFromPush(endpoint: string) {
  return trpcMutation('notifications.unsubscribeFromPush', { endpoint })
}

export async function apiGetMyPushSubscriptions() {
  return trpcQuery('notifications.getMySubscriptions')
}

export async function apiGetNotifications(params?: { limit?: number; cursor?: string; unreadOnly?: boolean }) {
  const inputData: any = {}
  if (params?.limit) inputData.limit = params.limit
  if (params?.cursor) inputData.cursor = params.cursor
  if (params?.unreadOnly) inputData.unreadOnly = params.unreadOnly
  
  const input = JSON.stringify(inputData)
  const path = `notifications.getNotifications?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

export async function apiMarkNotificationAsRead(notificationId: string) {
  return trpcMutation('notifications.markAsRead', { notificationId })
}

export async function apiMarkAllNotificationsAsRead() {
  return trpcMutation('notifications.markAllAsRead', {})
}

export async function apiGetUnreadNotificationCount() {
  return trpcQuery('notifications.getUnreadCount')
}

export async function apiDeleteNotification(notificationId: string) {
  return trpcMutation('notifications.deleteNotification', { notificationId })
}

export async function apiClearReadNotifications() {
  return trpcMutation('notifications.clearReadNotifications', {})
}

// Enhanced Privacy Settings
export async function apiGetEnhancedPrivacySettings() {
  return trpcQuery('privacy.getSettings')
}

export async function apiUpdateEnhancedPrivacySettings(settings: {
  profileVisibility?: 'public' | 'friends' | 'private'
  showAnimeList?: boolean
  showReviews?: boolean
  showActivity?: boolean
  showFriends?: boolean
  allowMessages?: boolean
  allowFriendRequests?: boolean
}) {
  return trpcMutation('privacy.updateSettings', settings)
}

export async function apiApplyPrivacyPreset(preset: 'public' | 'friends_only' | 'private') {
  return trpcMutation('privacy.applyPreset', { preset })
}

export async function apiCanViewContent(targetUserId: string, contentType: 'profile' | 'animeList' | 'reviews' | 'activity' | 'friends') {
  const input = JSON.stringify({ targetUserId, contentType })
  const path = `privacy.canView?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

// Friend Recommendations
export async function apiGetFriendsAlsoWatched(animeId: string, limit: number = 10) {
  const input = JSON.stringify({ animeId, limit })
  const path = `recommendations.getFriendsAlsoWatched?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

// ============================================
// Phase 3 Social Features API
// ============================================

// Messaging
export async function apiSendMessage(receiverId: string, content: string, animeId?: string) {
  return trpcMutation('messaging.sendMessage', { receiverId, content, animeId })
}

export async function apiGetConversations() {
  return trpcQuery('messaging.getConversations')
}

export async function apiGetMessages(userId: string, params?: { limit?: number; cursor?: string }) {
  const inputData: any = { userId }
  if (params?.limit) inputData.limit = params.limit
  if (params?.cursor) inputData.cursor = params.cursor
  
  const input = JSON.stringify(inputData)
  const path = `messaging.getMessages?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

export async function apiGetUnreadMessageCount() {
  return trpcQuery('messaging.getUnreadCount')
}

export async function apiDeleteMessage(messageId: string) {
  return trpcMutation('messaging.deleteMessage', { messageId })
}

// Achievements
export async function apiGetAllAchievements() {
  return trpcQuery('achievements.getAll')
}

export async function apiGetMyAchievements() {
  return trpcQuery('achievements.getMyAchievements')
}

export async function apiCheckAndUnlockAchievements() {
  return trpcMutation('achievements.checkAndUnlock', {})
}

// Leaderboards
export async function apiGetTopWatchers(params?: { limit?: number; timeRange?: 'week' | 'month' | 'all' }) {
  const inputData: any = {}
  if (params?.limit) inputData.limit = params.limit
  if (params?.timeRange) inputData.timeRange = params.timeRange
  
  const input = JSON.stringify(inputData)
  const path = `leaderboards.getTopWatchers?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

export async function apiGetTopReviewers(params?: { limit?: number }) {
  const inputData: any = {}
  if (params?.limit) inputData.limit = params.limit
  
  const input = JSON.stringify(inputData)
  const path = `leaderboards.getTopReviewers?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

export async function apiGetMostSocial(params?: { limit?: number }) {
  const inputData: any = {}
  if (params?.limit) inputData.limit = params.limit
  
  const input = JSON.stringify(inputData)
  const path = `leaderboards.getMostSocial?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

export async function apiGetMyRank(category: 'watched' | 'reviews' | 'friends' | 'points') {
  const input = JSON.stringify({ category })
  const path = `leaderboards.getMyRank?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

// Safety (Block/Report)
export async function apiBlockUser(userId: string, reason?: string) {
  return trpcMutation('safety.blockUser', { userId, reason })
}

export async function apiUnblockUser(userId: string) {
  return trpcMutation('safety.unblockUser', { userId })
}

export async function apiGetBlockedUsers() {
  return trpcQuery('safety.getBlockedUsers')
}

export async function apiReportUser(userId: string, reason: string, description: string) {
  return trpcMutation('safety.reportUser', { userId, reason, description })
}

// List Tools
export async function apiCompareListsWithFriend(friendId: string) {
  const input = JSON.stringify({ friendId })
  const path = `listTools.compareWithFriend?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

export async function apiGetSharedLists() {
  return trpcQuery('listTools.getSharedLists')
}

export async function apiCreateSharedList(params: {
  name: string
  description?: string
  animeIds?: string[]
  collaborators?: string[]
  isPublic?: boolean
}) {
  return trpcMutation('listTools.createSharedList', params)
}

export async function apiUpdateSharedList(listId: string, params: {
  name?: string
  description?: string
  animeIds?: string[]
  collaborators?: string[]
  isPublic?: boolean
}) {
  return trpcMutation('listTools.updateSharedList', { listId, ...params })
}


