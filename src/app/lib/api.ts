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
  AuthUser,
  AuthResponse,
  SignupInput,
  AnimeListItem,
  UserListResponse,
  ListStatus,
  FeatureFlag,
  FeatureAccess,
} from '../../types/anime'
import { handleApiError } from '../../lib/api-errors'
import { clientCache, CacheTTL } from '../../lib/client-cache'
import { logger, captureException } from '../../lib/logger'
import { trackAPI } from '../../lib/performance-monitor'
import { env } from '../../lib/env'
import * as Sentry from '@sentry/nextjs'

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

// Always use the Next.js proxy route for same-origin requests (no CORS issues)
// The proxy route at /api/trpc will forward to the backend using NEXT_PUBLIC_API_URL
export const TRPC_URL = '/api/trpc'

// API URL configuration
// TRPC_URL is set from environment variables

// Track if we're currently refreshing to prevent multiple simultaneous refreshes
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

const OPTIONAL_ENDPOINT_PATTERNS = [
  'notifications.getUnreadCount',
  'social.getFriendRecommendations',
  'social.getRelationshipStatus',
  'recommendations.getForYou',
  'recommendations.getFansLikeYou',
  'recommendations.getHiddenGems',
  'recommendations.getDiscovery',
  'recommendations.getContinueWatching',
  'anime.getTrending',
  'anime.getAll',
  'anime.',
]

const OPTIONAL_CACHE_KEY_PREFIX = 'trpc-optional-cache:'
const OPTIONAL_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

type OptionalCacheEntry = {
  timestamp: number
  data: unknown
}

type FetchRetryConfig = {
  retries: number
  initialDelayMs: number
  backoffFactor: number
  timeoutMs: number
}

const DEFAULT_RETRY_CONFIG: FetchRetryConfig = {
  retries: 2,
  initialDelayMs: 250,
  backoffFactor: 2,
  timeoutMs: 10_000,
}

const OPTIONAL_RETRY_CONFIG: FetchRetryConfig = {
  retries: 1,
  initialDelayMs: 150,
  backoffFactor: 2,
  timeoutMs: 8_000,
}

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504, 522, 524])

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}

  // Check both localStorage (Remember Me) and sessionStorage (current session only)
  const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
  const headers: Record<string, string> = {}
  
  if (accessToken) {
    headers.Authorization = 'Bearer ' + accessToken
  }
  
  // Get CSRF token from cookies
  const csrfToken = getCsrfTokenFromCookie()
  if (csrfToken) {
    headers['x-csrf-token'] = csrfToken
  }
  
  return headers
}

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  
        // First, try to get existing token from cookie
        const cookies = document.cookie.split(';')
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=')
          if (name === 'csrf_token' && value) {
            return decodeURIComponent(value)
          }
        }
  
  // If no token exists, generate one and store it in a cookie
  const token = generateCsrfToken()
  setCsrfTokenCookie(token)
  return token
}

function generateCsrfToken(): string {
  // Generate a random 32-byte hex string (64 characters)
  const array = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

function setCsrfTokenCookie(token: string): void {
  if (typeof document === 'undefined') return
  
  // Set cookie with 1 year expiry, SameSite=Lax for CSRF protection
  const isProd = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')
  const maxAge = 60 * 60 * 24 * 365 // 1 year
  const cookieOptions = `Path=/; Max-Age=${maxAge}; SameSite=Lax${isProd ? '; Secure' : ''}`
  document.cookie = `csrf_token=${encodeURIComponent(token)}; ${cookieOptions}`
}

function generateClientTraceId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

// Refresh the access token using the refresh token
async function refreshAccessToken(): Promise<boolean> {
  // Tokens are rotated server-side via cookies; nothing to do client-side
  return false
}

// Convert technical error codes to user-friendly messages
// Re-export for backwards compatibility
// Custom error class for database configuration errors that shouldn't spam the console
class DatabaseConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseConfigError'
    // Mark as suppressible to prevent console error logging
    ;(this as any).__suppressConsoleError = true
  }
}

function isOptionalQuery(path: string): boolean {
  return OPTIONAL_ENDPOINT_PATTERNS.some((pattern) => path.includes(pattern))
}

function getOptionalCacheKey(path: string): string {
  return `${OPTIONAL_CACHE_KEY_PREFIX}${path}`
}

function readOptionalCache<T>(path: string): T | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = sessionStorage.getItem(getOptionalCacheKey(path))
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as OptionalCacheEntry
    if (!parsed || typeof parsed.timestamp !== 'number') {
      sessionStorage.removeItem(getOptionalCacheKey(path))
      return null
    }

    if (Date.now() - parsed.timestamp > OPTIONAL_CACHE_TTL_MS) {
      sessionStorage.removeItem(getOptionalCacheKey(path))
      return null
    }

    return parsed.data as T
  } catch (error) {
    logger.debug('Failed to read cached optional endpoint result', {
      path,
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

function writeOptionalCache<T>(path: string, data: T): void {
  if (typeof window === 'undefined') return

  try {
    const entry: OptionalCacheEntry = {
      timestamp: Date.now(),
      data,
    }
    sessionStorage.setItem(getOptionalCacheKey(path), JSON.stringify(entry))
  } catch (error) {
    logger.debug('Failed to cache optional endpoint result', {
      path,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function shouldRetryResponse(response: Response): boolean {
  return (
    RETRYABLE_STATUS_CODES.has(response.status) ||
    (response.status >= 500 && response.status < 600)
  )
}

function isRetryableError(error: unknown): boolean {
  if (typeof window === 'undefined' && typeof process !== 'undefined') {
    // Node fetch errors
    return error instanceof Error && (error.name === 'AbortError' || error.message.includes('network'))
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return true
  }

  if (error instanceof TypeError) {
    return error.message.includes('NetworkError') || error.message.includes('Failed to fetch')
  }

  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('NetworkError') ||
      error.message.includes('fetch')
    )
  }

  return false
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  config: FetchRetryConfig
): Promise<Response> {
  let attempt = 0
  let delayMs = config.initialDelayMs

  while (true) {
    const controller =
      typeof AbortController !== 'undefined' && !init.signal ? new AbortController() : null
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    if (controller && config.timeoutMs > 0) {
      timeoutId = setTimeout(() => controller.abort(), config.timeoutMs)
    }

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller ? controller.signal : init.signal,
      })

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      if (attempt < config.retries && shouldRetryResponse(response)) {
        response.body?.cancel?.()
        attempt += 1
        await delay(delayMs)
        delayMs *= config.backoffFactor
        continue
      }

      return response
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      if (attempt < config.retries && isRetryableError(error)) {
        attempt += 1
        await delay(delayMs)
        delayMs *= config.backoffFactor
        continue
      }

      throw error
    }
  }
}

function getUserFriendlyError(code: string, message: string): string {
  return handleApiError({ error: { data: { code }, message } })
}

async function trpcQuery<TOutput>(
  path: string,
  init?: RequestInit,
  retryCount = 0
): Promise<TOutput> {
  const url = `${TRPC_URL}/${path}`

  // Debug: Check if we have auth token
  const authHeaders = getAuthHeaders()
  const hasToken = 'Authorization' in authHeaders
  const optionalEndpoint = isOptionalQuery(path)
  const retryConfig = optionalEndpoint ? OPTIONAL_RETRY_CONFIG : DEFAULT_RETRY_CONFIG
  
  // Debug logging for auth.me specifically
  if (path === 'auth.me' && typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    console.log('[API] auth.me called - Token exists:', !!token, 'Has auth header:', hasToken)
    if (token) {
      console.log('[API] Token preview:', token.substring(0, 20) + '...')
    }
  }
  
  if (!hasToken && typeof window !== 'undefined' && path !== 'auth.me') {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    console.warn('⚠️ No auth token found for request:', path, 'Token exists:', !!token)
  }

  // Start performance tracking
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now()
  
  try {
    const clientTraceId = generateClientTraceId()
    const res = await Sentry.startSpan({ op: 'http.client', name: `GET ${url}` }, async () => {
      const r = await fetchWithRetry(
        url,
        {
          method: 'GET',
          headers: {
            'x-client-trace-id': clientTraceId,
            ...authHeaders,
            ...(init?.headers || {}),
          },
          credentials: 'include',
          ...init,
        },
        retryConfig
      )
      return r
    })

    // Calculate duration
    const duration =
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime

    // Track API performance
    trackAPI(
      path,
      init?.method || 'GET',
      duration,
      res.status,
      false,
      !res.ok ? `HTTP ${res.status}` : undefined
    )
    // Tag Sentry span with correlation IDs
    const reqId = res.headers.get('x-request-id') || res.headers.get('X-Request-ID') || undefined
    const activeSpan = (Sentry as any).getActiveSpan?.()
    if (activeSpan && typeof activeSpan.setAttribute === 'function') {
      if (reqId) activeSpan.setAttribute('request.id', reqId)
      activeSpan.setAttribute('client.trace_id', clientTraceId)
      activeSpan.setAttribute('api.path', path)
      activeSpan.setAttribute('http.status_code', res.status)
    }

    if (!res.ok) {
      // Try to parse tRPC error
      let payload: TRPCResponse<unknown> | undefined
      try {
        payload = await res.json()
      } catch {
        if (optionalEndpoint) {
          const cachedResult = readOptionalCache<TOutput>(path)
          if (cachedResult !== null) {
            logger.warn('Using cached result for optional endpoint after parse failure', { path })
            return cachedResult
          }
          logger.info('Optional endpoint returned invalid payload; falling back to null', { path })
          return null as TOutput
        }
        throw new Error(getUserFriendlyError('NETWORK_ERROR', 'Unable to connect to the server'))
      }
      const message = payload && 'error' in payload ? payload.error.message : 'Request failed'
      const code = (payload && 'error' in payload && payload.error.data?.code) || 'UNKNOWN_ERROR'
      
      // Skip logging for expected errors on optional endpoints
      // Auth-related codes that are expected when not logged in
      const isExpectedAuthError =
        code === 'UNAUTHORIZED' ||
        code === 'TOKEN_INVALID' ||
        code === 'TOKEN_EXPIRED' ||
        message.includes('session') ||
        message.includes('token')

      // Database configuration errors should always be logged
      const isDatabaseConfigError = 
        code === 'DATABASE_CONFIGURATION_ERROR' ||
        code === 'P6002' ||
        code === 'P5000' ||
        message.includes('API key is invalid') ||
        message.includes('Accelerate API key') ||
        message.includes('P6002') ||
        message.includes('P5000')

      // auth.me and user endpoints - skip all expected auth errors
      const isAuthCheck = path.includes('auth.me')
      const isUserEndpoint = path.includes('user.getFavoritedAnimeIds') || path.includes('user.')

      const shouldSkipLogging =
        ((isAuthCheck || isUserEndpoint) && isExpectedAuthError) || (optionalEndpoint && isExpectedAuthError)

      // Handle database configuration errors with session-based logging
      if (isDatabaseConfigError) {
        // Only log once per session to avoid console spam
        if (typeof window !== 'undefined' && !(window as any).__dbConfigErrorLogged) {
          console.warn('⚠️ Database Configuration Error: Backend has invalid Prisma Accelerate API key.')
          console.warn('   This is a backend configuration issue. Please check the backend .env file.')
          console.warn('   Update DATABASE_URL to use a direct PostgreSQL connection or provide a valid Accelerate API key.')
          ;(window as any).__dbConfigErrorLogged = true
        }
        
        // For optional endpoints, return null instead of throwing to prevent UI crashes
        if (optionalEndpoint || path.includes('anime.') || path.includes('recommendations.')) {
          const cachedResult = readOptionalCache<TOutput>(path)
          if (cachedResult !== null) {
            logger.warn('Using cached result for optional endpoint during database config error', {
              path,
            })
            return cachedResult
          }
          return null as TOutput
        }
      } else if (!shouldSkipLogging) {
        // Log other errors normally
        console.error('❌ API Error Details:')
        console.error('Path:', path)
        console.error('Status:', res.status)
        console.error('Code:', code)
        console.error('Message:', message)
        console.error('Full Payload:', JSON.stringify(payload, null, 2))
        console.error('Response Headers:', Object.fromEntries(res.headers.entries()))

        if (optionalEndpoint) {
          const cachedResult = readOptionalCache<TOutput>(path)
          if (cachedResult !== null) {
            logger.warn('Optional endpoint failed; using cached data', { path, code })
            return cachedResult
          }
          logger.info('Optional endpoint failed; returning null result', { path, code })
          return null as TOutput
        }
      }

      // For expected auth errors on user endpoints, return null instead of throwing
      // This prevents UI crashes when user is not logged in
      // EXCEPT for auth.me - we need to throw so auth context can handle it properly
      if (isExpectedAuthError && (isUserEndpoint || isAuthCheck) && !path.includes('auth.me')) {
        return null as TOutput
      }

      // For auth.me, always throw errors so auth context can handle them
      if (path === 'auth.me' && isExpectedAuthError) {
        console.log('[API] auth.me auth error - throwing:', code, message)
        throw new Error(getUserFriendlyError(code, message))
      }

      // No client-side token refresh; rely on cookie-based sessions
      if (
        false
      ) {
        // no-op
      }
      
      throw new Error(getUserFriendlyError(code, message))
    }

    const json = (await res.json()) as TRPCResponse<TOutput>

    if ('error' in json) {
      const err = json.error
      const code = err.data?.code || 'UNKNOWN_ERROR'
      const message = err.message || 'Unknown error'
      
      // For auth.me, always throw errors so auth context can handle them
      if (path === 'auth.me') {
        console.log('[API] auth.me tRPC error - throwing:', code, message)
        throw new Error(getUserFriendlyError(code, message))
      }
      
      console.error('❌ tRPC GET Error:', { code, message })

      // No client-side token refresh; rely on cookie-based sessions
      if (
        false
      ) {
        // no-op
      }
      
      if (optionalEndpoint) {
        const cachedResult = readOptionalCache<TOutput>(path)
        if (cachedResult !== null) {
          logger.warn('Optional endpoint returned tRPC error; using cached data', { path, code })
          return cachedResult
        }
        logger.info('Optional endpoint returned tRPC error; returning null result', { path, code })
        return null as TOutput
      }
      
      throw new Error(getUserFriendlyError(code, message))
    }

    // Filter out any undefined/null items from array responses
    let data = json.result.data as unknown
    if (Array.isArray(data)) {
      data = data.filter((item) => item != null)
    }

    if (optionalEndpoint) {
      writeOptionalCache(path, data as TOutput)
    }

    return data as TOutput
  } catch (error: unknown) {
    const duration =
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (optionalEndpoint) {
      const cachedResult = readOptionalCache<TOutput>(path)
      if (cachedResult !== null) {
        trackAPI(path, init?.method || 'GET', duration, 0, true, 'cached_optional_fallback')
        logger.warn('Optional endpoint fetch failed; using cached data', { path, error: errorMessage })
        return cachedResult
      }

      trackAPI(path, init?.method || 'GET', duration, 0, false, 'optional_null_fallback')
      logger.info('Optional endpoint fetch failed; returning null result', {
        path,
        error: errorMessage,
      })
      return null as TOutput
    }

    logger.error('tRPC GET request failed', {
      url,
      trpcUrl: TRPC_URL,
      error: errorMessage,
    })
    captureException(error, {
      context: { url, endpoint: path },
      tags: { operation: 'trpc_query' },
    })

    // Handle network errors
    if (error instanceof Error && error.message.includes('fetch')) {
      const errorMsg = `Unable to connect to backend at ${url}. Is the backend running on port 3005?`
      console.error('❌ Network Error:', errorMsg)
      throw new Error(getUserFriendlyError('NETWORK_ERROR', errorMsg))
    }
    throw error
  }
}

async function trpcMutation<TInput, TOutput>(
  path: string,
  input?: TInput,
  init?: RequestInit,
  retryCount = 0
): Promise<TOutput> {
  const url = `${TRPC_URL}/${path}`

  // Start performance tracking
  const startTime = performance.now()
  
  try {
    const clientTraceId = generateClientTraceId()
    const res = await Sentry.startSpan({ op: 'http.client', name: `POST ${url}` }, async () => {
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-trace-id': clientTraceId,
          ...getAuthHeaders(),
          ...(init?.headers || {}),
        },
        body: input !== undefined ? JSON.stringify(input) : undefined,
        credentials: 'include',
        ...init,
      })
      return r
    })

    // Calculate duration
    const duration = performance.now() - startTime

    // Track API performance
    trackAPI(path, 'POST', duration, res.status, false, !res.ok ? `HTTP ${res.status}` : undefined)
    // Tag Sentry span with correlation IDs
    const reqId = res.headers.get('x-request-id') || res.headers.get('X-Request-ID') || undefined
    const activeSpan = (Sentry as any).getActiveSpan?.()
    if (activeSpan && typeof activeSpan.setAttribute === 'function') {
      if (reqId) activeSpan.setAttribute('request.id', reqId)
      activeSpan.setAttribute('client.trace_id', clientTraceId)
      activeSpan.setAttribute('api.path', path)
      activeSpan.setAttribute('http.status_code', res.status)
    }

    if (!res.ok) {
      // Try to parse tRPC error
      let payload: TRPCResponse<unknown> | undefined
      let responseText = ''
      
      // Log response details first
      const responseHeaders: Record<string, string> = {}
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })
      console.error('[API] Error response received:')
      console.error('  Status:', res.status)
      console.error('  StatusText:', res.statusText)
      console.error('  URL:', res.url || url)
      console.error('  Headers:', responseHeaders)
      
      try {
        responseText = await res.text()
        console.error('[API] Response text length:', responseText.length)
        console.error('[API] Response text (first 1000 chars):', responseText.substring(0, 1000))
        
        if (!responseText || responseText.trim() === '') {
          console.error('[API] ERROR: Empty response body from server!')
          throw new Error('Empty response body')
        }
        
        payload = JSON.parse(responseText) as TRPCResponse<unknown>
        console.error('[API] Parsed payload:', payload)
      } catch (parseError) {
        console.error('[API] Failed to parse error response:')
        console.error('  Status:', res.status)
        console.error('  StatusText:', res.statusText)
        console.error('  ResponseText length:', responseText.length)
        console.error('  ResponseText (first 500 chars):', responseText.substring(0, 500))
        console.error('  ParseError:', parseError instanceof Error ? parseError.message : String(parseError))
        throw new Error(getUserFriendlyError('NETWORK_ERROR', `Unable to connect to the server (${res.status} ${res.statusText})`))
      }
      
      // Log the full error response for debugging
      if (path === 'auth.signin') {
        console.error('[API] Signin error response details:')
        console.error('  Status:', res.status)
        console.error('  StatusText:', res.statusText)
        console.error('  Payload:', payload)
        console.error('  Payload type:', typeof payload)
        console.error('  Has error key:', payload ? 'error' in payload : false)
        if (payload && 'error' in payload) {
          console.error('  Error object:', payload.error)
        }
      }
      
      const message = payload && 'error' in payload ? payload.error.message : 'Request failed'
      const code = (payload && 'error' in payload && payload.error.data?.code) || 'UNKNOWN_ERROR'
      
      // Database configuration errors (Prisma Accelerate API key issues)
      const isDatabaseConfigError = 
        code === 'DATABASE_CONFIGURATION_ERROR' ||
        code === 'P6002' ||
        code === 'P5000' ||
        message.includes('API key is invalid') ||
        message.includes('Accelerate API key') ||
        message.includes('P6002') ||
        message.includes('P5000')
      
      // Skip logging for expected errors on optional/non-critical mutations
      // Auth-related codes that are expected when not logged in or during initialization
      const isExpectedAuthError =
        code === 'UNAUTHORIZED' ||
        code === 'TOKEN_INVALID' ||
        code === 'TOKEN_EXPIRED' ||
        message.includes('session') ||
        message.includes('token') ||
        message.includes('expired')

      // Optional mutations that may fail during page load without affecting functionality
      const isOptionalMutation =
        path.includes('achievements.checkAndUnlock') ||
        path.includes('onboarding.getStatus') ||
        path.includes('notifications.subscribeToPush') ||
        path.includes('notifications.unsubscribeFromPush')

      // Only log to Sentry if it's an unexpected error or a critical mutation
      const shouldSkipSentryLogging = isOptionalMutation && isExpectedAuthError

      // Handle database configuration errors with session-based logging
      if (isDatabaseConfigError) {
        // Only log once per session to avoid console spam
        if (typeof window !== 'undefined' && !(window as any).__dbConfigErrorLogged) {
          console.warn('⚠️ Database Configuration Error: Backend has invalid Prisma Accelerate API key.')
          console.warn('   This is a backend configuration issue. Please check the backend .env file.')
          console.warn('   Update DATABASE_URL to use a direct PostgreSQL connection or provide a valid Accelerate API key.')
          ;(window as any).__dbConfigErrorLogged = true
        }
        
        // Don't log database config errors to Sentry - these are configuration issues
        // that will persist until the backend is fixed, so logging them would spam error tracking
      } else if (!shouldSkipSentryLogging) {
      // Always log locally for debugging
      logger.error('tRPC mutation error', {
        path,
        status: res.status,
        code,
        message,
        payload: JSON.stringify(payload),
      })
      captureException(new Error(`tRPC mutation failed: ${code}`), {
        context: { path, code, message, status: res.status },
        tags: { operation: 'trpc_mutation' },
      })
      } else {
        // Log at debug level for optional mutations with expected errors
        logger.debug('tRPC mutation expected error (skipped Sentry)', {
          path,
          code,
          message,
        })
      }

      // Try to refresh token on auth errors (only once)
      if (
        (code === 'UNAUTHORIZED' ||
          message.includes('session') ||
          message.includes('expired') ||
          message.includes('token')) &&
        retryCount === 0
      ) {
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
      
      // For database configuration errors, provide a more user-friendly error message
      if (isDatabaseConfigError) {
        throw new DatabaseConfigError('Unable to connect to the server. Please try again later or contact support if the problem persists.')
      }
      
      throw new Error(getUserFriendlyError(code, message))
    }

    // Parse response - read as JSON
    let json: TRPCResponse<TOutput>
    try {
      const responseText = await res.text()
      console.log('[API] Success response text length:', responseText.length)
      if (path === 'auth.signin') {
        console.log('[API] Signin success response text:', responseText.substring(0, 500))
      }
      json = JSON.parse(responseText) as TRPCResponse<TOutput>
      if (path === 'auth.signin') {
        console.log('[API] Signin parsed JSON:', JSON.stringify(json, null, 2))
      }
    } catch (parseError) {
      console.error('[API] Failed to parse success response:', parseError)
      throw new Error('Invalid response from server')
    }
    
    if ('error' in json) {
      const err = json.error
      const code = err.data?.code || 'UNKNOWN_ERROR'
      
      // Log signin errors for debugging
      if (path === 'auth.signin') {
        console.error('[API] Signin tRPC error in response:', {
          code,
          message: err.message,
          fullError: JSON.stringify(err, null, 2)
        })
      }
      
      // Database configuration errors (Prisma Accelerate API key issues)
      const isDatabaseConfigError = 
        code === 'DATABASE_CONFIGURATION_ERROR' ||
        code === 'P6002' ||
        code === 'P5000' ||
        err.message.includes('API key is invalid') ||
        err.message.includes('Accelerate API key') ||
        err.message.includes('P6002') ||
        err.message.includes('P5000')
      
      // Skip logging for expected errors on optional/non-critical mutations
      const isExpectedAuthError =
        code === 'UNAUTHORIZED' ||
        code === 'TOKEN_INVALID' ||
        code === 'TOKEN_EXPIRED' ||
        err.message.includes('session') ||
        err.message.includes('token') ||
        err.message.includes('expired')

      const isOptionalMutation =
        path.includes('achievements.checkAndUnlock') ||
        path.includes('onboarding.getStatus') ||
        path.includes('notifications.subscribeToPush') ||
        path.includes('notifications.unsubscribeFromPush')

      const shouldSkipSentryLogging = isOptionalMutation && isExpectedAuthError

      // Handle database configuration errors with session-based logging
      if (isDatabaseConfigError) {
        // Only log once per session to avoid console spam
        if (typeof window !== 'undefined' && !(window as any).__dbConfigErrorLogged) {
          console.warn('⚠️ Database Configuration Error: Backend has invalid Prisma Accelerate API key.')
          console.warn('   This is a backend configuration issue. Please check the backend .env file.')
          console.warn('   Update DATABASE_URL to use a direct PostgreSQL connection or provide a valid Accelerate API key.')
          ;(window as any).__dbConfigErrorLogged = true
        }
        
        // Don't log database config errors to Sentry - these are configuration issues
        // that will persist until the backend is fixed, so logging them would spam error tracking
      } else if (!shouldSkipSentryLogging) {
      // Always log locally for debugging
      logger.error('tRPC mutation error in response', {
        path,
        code,
        message: err.message,
        data: err.data,
      })
      captureException(new Error(`tRPC mutation failed: ${code}`), {
        context: { path, code, message: err.message },
        tags: { operation: 'trpc_mutation' },
      })
      } else {
        // Log at debug level for optional mutations with expected errors
        logger.debug('tRPC mutation expected error in response (skipped Sentry)', {
          path,
          code,
          message: err.message,
        })
      }

      // Try to refresh token on auth errors (only once)
      if (
        (code === 'UNAUTHORIZED' ||
          err.message.includes('session') ||
          err.message.includes('expired') ||
          err.message.includes('token')) &&
        retryCount === 0
      ) {
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
      
      // For database configuration errors, provide a more user-friendly error message
      if (isDatabaseConfigError) {
        throw new DatabaseConfigError('Unable to connect to the server. Please try again later or contact support if the problem persists.')
      }
      
      throw new Error(getUserFriendlyError(code, err.message))
    }

    // Extract data from tRPC response format: { result: { data: ... } }
    let data: TOutput
    
    if ('result' in json && json.result && 'data' in json.result) {
      // Standard tRPC response format
      data = json.result.data as TOutput
    } else if ('result' in json && json.result && !('data' in json.result)) {
      // Some tRPC responses might return data directly in result
      data = json.result as TOutput
    } else if (!('result' in json) && !('error' in json)) {
      // Response might be the data directly (non-standard but possible)
      console.warn('[API] Non-standard response format, treating entire response as data:', json)
      data = json as unknown as TOutput
    } else {
      console.error('[API] Invalid tRPC response format:', json)
      console.error('[API] Response keys:', Object.keys(json))
      throw new Error('Invalid response format from server')
    }
    
    if (path === 'auth.signin') {
      console.log('[API] Signin extracted data:', data)
      console.log('[API] Signin data type:', typeof data)
      console.log('[API] Signin data keys:', data && typeof data === 'object' ? Object.keys(data) : 'not an object')
    }
    
    // Filter out any undefined/null items from array responses
    if (Array.isArray(data)) {
      return data.filter((item) => item != null) as TOutput
    }

    return data as TOutput
  } catch (error: unknown) {
    // Skip Sentry logging for network errors on optional mutations
    // These are often transient and don't indicate a real problem
    const isOptionalMutation =
      path.includes('achievements.checkAndUnlock') ||
      path.includes('onboarding.getStatus') ||
      path.includes('notifications.subscribeToPush') ||
      path.includes('notifications.unsubscribeFromPush')

    const isNetworkError = error instanceof Error && error.message.includes('fetch')

    // Only log to Sentry if it's not a network error on an optional mutation
    if (!(isOptionalMutation && isNetworkError)) {
    logger.error('tRPC mutation failed', {
      path,
      trpcUrl: TRPC_URL,
      error: error instanceof Error ? error.message : String(error),
    })
    captureException(error, {
      context: { path, input },
      tags: { operation: 'trpc_mutation' },
    })
    } else {
      // Log network errors on optional mutations at debug level
      logger.debug('tRPC mutation network error on optional endpoint (skipped Sentry)', {
        path,
        error: error instanceof Error ? error.message : String(error),
      })
    }

    // Handle network errors
    if (isNetworkError) {
      throw new Error(getUserFriendlyError('NETWORK_ERROR', 'Unable to connect to the server'))
    }
    throw error
  }
}

// Auth API
export async function apiSignup(input: SignupInput) {
  const data = await trpcMutation<SignupInput, AuthResponse>('auth.signup', input)
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

export async function apiResetPassword(input: {
  token: string
  newPassword: string
  confirmNewPassword: string
}) {
  return trpcMutation<typeof input, { success: boolean }>('auth.resetPassword', input)
}

export async function apiVerifyEmail(input: { token: string }) {
  return trpcMutation<typeof input, { success: boolean }>('auth.verifyEmail', input)
}

// Two-Factor Authentication
export async function apiGet2FAStatus() {
  return trpcQuery<{ enabled: boolean }>('twoFactor.getStatus')
}

export async function apiEnable2FA() {
  return trpcMutation<undefined, { success: boolean; message: string }>('twoFactor.enable')
}

export async function apiVerify2FASetup(input: { code: string }) {
  return trpcMutation<typeof input, { success: boolean; message: string }>(
    'twoFactor.verifySetup',
    input
  )
}

export async function apiDisable2FA(input: { password: string }) {
  return trpcMutation<typeof input, { success: boolean; message: string }>(
    'twoFactor.disable',
    input
  )
}

export async function apiSend2FALoginCode(input: { email: string }) {
  return trpcMutation<typeof input, { success: boolean; message: string }>(
    'twoFactor.sendLoginCode',
    input
  )
}

export async function apiVerify2FALogin(input: { email: string; code: string }) {
  return trpcMutation<typeof input, { success: boolean; userId: string }>(
    'twoFactor.verifyLogin',
    input
  )
}

export function clearSession() {
  // Clear tokens from both storage locations
  if (typeof window !== 'undefined') {
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
  const result = json.result?.data || {
    anime: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  }

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
  const result = json.result?.data || {
    series: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  }

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

export async function apiGetGenres(useCache: boolean = true) {
  // v2 to invalidate older cached string[] shape
  const cacheKey = 'anime:genres:v2'

  // Check cache first
  if (useCache) {
    const cached = clientCache.get<{
      id: string
      name: string
      slug: string
      color?: string
    }[]>(cacheKey)
    if (cached !== null) {
      return cached
    }
  }

  let result = await trpcQuery<{
    id: string
    name: string
    slug: string
    color?: string
  }[]>('anime.getGenres')

  // Backward compatibility: if server returns string[] (older shape), normalize
  if (Array.isArray(result) && result.length > 0 && typeof (result as any)[0] === 'string') {
    const arr = result as unknown as string[]
    result = arr.map((name) => ({
      id: name,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    })) as any
  }

  // Cache for 1 hour (genres rarely change)
  clientCache.set(cacheKey, result, CacheTTL.veryLong)

  return result
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
  return animeArray.filter(
    (anime: Anime) =>
    anime.title.toLowerCase().includes(lowerQuery) ||
    anime.description?.toLowerCase().includes(lowerQuery) ||
    anime.studio?.toLowerCase().includes(lowerQuery)
  )
}

// ===== CALENDAR API =====

export interface Episode {
  id: string
  animeId: string
  animeTitle: string
  animeSlug: string
  animeImage?: string
  episodeNumber: number
  title?: string
  airDate: string
  airTime: string
  duration?: number
  isNewEpisode: boolean
  isWatching: boolean
  isCompleted: boolean
  studio?: string
  season?: string
  year?: number
  genres?: string[]
  type?: string
}

export interface SeasonalAnime {
  id: string
  title: string
  titleEnglish?: string
  slug: string
  image?: string
  season: 'Winter' | 'Spring' | 'Summer' | 'Fall'
  year: number
  status: 'Airing' | 'Upcoming' | 'Completed'
  episodes: number
  episodesAired?: number
  genres: string[]
  studios: string[]
  score?: number
  popularity: number
  isWatching: boolean
  isCompleted: boolean
  isPlanToWatch: boolean
  airDate?: string
  endDate?: string
  description?: string
}

export interface CalendarStats {
  episodesThisWeek: number
  watchingEpisodes: number
  trendingCount: number
}

export async function apiGetEpisodeSchedule(
  startDate: string,
  endDate: string,
  useCache: boolean = true
): Promise<Episode[]> {
  const cacheKey = `calendar:episodes:${startDate}:${endDate}`

  if (useCache) {
    const cached = clientCache.get<Episode[]>(cacheKey)
    if (cached !== null) {
      return cached
    }
  }

  const url = `${TRPC_URL}/calendar.getEpisodeSchedule?input=${encodeURIComponent(
    JSON.stringify({ startDate, endDate })
  )}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch episode schedule: ${response.statusText}`)
  }

  const data: TRPCResponse<Episode[]> = await response.json()

  if ('error' in data) {
    const code = data.error.data?.code || 'UNKNOWN_ERROR'
    const message = data.error.message || 'An error occurred'
    throw new Error(getUserFriendlyError(code, message))
  }

  const result = data.result.data

  // Cache for 5 minutes (episode schedules change weekly)
  clientCache.set(cacheKey, result, CacheTTL.short)

  return result
}

export async function apiGetSeasonalAnime(
  season: 'Winter' | 'Spring' | 'Summer' | 'Fall',
  year: number,
  useCache: boolean = true
): Promise<SeasonalAnime[]> {
  const cacheKey = `calendar:seasonal:${season}:${year}`

  if (useCache) {
    const cached = clientCache.get<SeasonalAnime[]>(cacheKey)
    if (cached !== null) {
      return cached
    }
  }

  const url = `${TRPC_URL}/calendar.getSeasonalAnime?input=${encodeURIComponent(
    JSON.stringify({ season, year })
  )}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch seasonal anime: ${response.statusText}`)
  }

  const data: TRPCResponse<SeasonalAnime[]> = await response.json()

  if ('error' in data) {
    const code = data.error.data?.code || 'UNKNOWN_ERROR'
    const message = data.error.message || 'An error occurred'
    throw new Error(getUserFriendlyError(code, message))
  }

  const result = data.result.data

  // Cache for 10 minutes (seasonal data changes infrequently)
  clientCache.set(cacheKey, result, CacheTTL.medium)

  return result
}

export async function apiGetCalendarStats(
  startDate?: string,
  endDate?: string,
  useCache: boolean = true
): Promise<CalendarStats> {
  const cacheKey = `calendar:stats:${startDate || 'default'}:${endDate || 'default'}`

  if (useCache) {
    const cached = clientCache.get<CalendarStats>(cacheKey)
    if (cached !== null) {
      return cached
    }
  }

  const input: { startDate?: string; endDate?: string } = {}
  if (startDate) input.startDate = startDate
  if (endDate) input.endDate = endDate

  const url = `${TRPC_URL}/calendar.getCalendarStats?input=${encodeURIComponent(JSON.stringify(input))}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch calendar stats: ${response.statusText}`)
  }

  const data: TRPCResponse<CalendarStats> = await response.json()

  if ('error' in data) {
    const code = data.error.data?.code || 'UNKNOWN_ERROR'
    const message = data.error.message || 'An error occurred'
    throw new Error(getUserFriendlyError(code, message))
  }

  const result = data.result.data

  // Cache for 5 minutes
  clientCache.set(cacheKey, result, CacheTTL.short)

  return result
}

export async function apiSyncCalendarData(animeId?: string): Promise<{ success: boolean; message: string }> {
  const url = `${TRPC_URL}/calendar.syncCalendarData`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ input: animeId ? { animeId } : {} }),
  })

  if (!response.ok) {
    throw new Error(`Failed to sync calendar data: ${response.statusText}`)
  }

  const data: TRPCResponse<{ success: boolean; message: string }> = await response.json()

  if ('error' in data) {
    const code = data.error.data?.code || 'UNKNOWN_ERROR'
    const message = data.error.message || 'An error occurred'
    throw new Error(getUserFriendlyError(code, message))
  }

  return data.result.data
}

// ===== MY LIST API =====

export async function apiGetUserList(): Promise<UserListResponse> {
  // Note: Backend automatically uses maxUserListItems from SystemSettings
  return trpcQuery<UserListResponse>('user.getAnimeList?input={"limit":1000}')
}

export async function apiGetPublicUserAnimeList(username: string, limit: number = 20): Promise<any> {
  return trpcQuery(`user.getUserAnimeList?input=${JSON.stringify({ username, limit })}`)
}

export async function apiAddToList(input: { 
  animeId: string
  status: ListStatus
  isFavorite?: boolean 
}): Promise<AnimeListItem> {
  return trpcMutation<typeof input, AnimeListItem>('user.addToList', input)
}

export async function apiRemoveFromList(animeId: string): Promise<{ success: boolean }> {
  return trpcMutation<{ animeId: string }, { success: boolean }>('user.removeFromList', {
    animeId,
  })
}

export async function apiUpdateListStatus(input: {
  animeId: string
  status: ListStatus
}): Promise<AnimeListItem> {
  return trpcMutation<typeof input, AnimeListItem>('user.updateListEntry', input)
}

export async function apiUpdateListEntry(input: {
  animeId: string
  status?: ListStatus
  score?: number
  notes?: string
  isFavorite?: boolean
}): Promise<AnimeListItem> {
  return trpcMutation<typeof input, AnimeListItem>('user.updateListEntry', input)
}

// Update user profile
export async function apiUpdateProfile(input: {
  username?: string
  bio?: string
  avatar?: string
}): Promise<any> {
  return trpcMutation<typeof input, any>('auth.updateProfile', input)
}

// Update user preferences
export async function apiUpdatePreferences(input: {
  theme?: string
  language?: string
  timezone?: string
  dateFormat?: string
  emailNotifications?: boolean
  pushNotifications?: boolean
  weeklyDigest?: boolean
  newEpisodes?: boolean
  recommendations?: boolean
  socialUpdates?: boolean
  profileVisibility?: string
  showWatchHistory?: boolean
  showFavorites?: boolean
  showRatings?: boolean
  allowMessages?: boolean
  autoplay?: boolean
  skipIntro?: boolean
  skipOutro?: boolean
  defaultQuality?: string
  subtitles?: boolean
  volume?: number
}): Promise<any> {
  return trpcMutation<typeof input, any>('user.updatePreferences', input)
}

export async function apiToggleFavorite(listItemId: string): Promise<AnimeListItem> {
  return trpcMutation<{ listItemId: string }, AnimeListItem>('mylist.toggleFavorite', {
    listItemId,
  })
}

// Toggle favorite by anime ID (creates list entry if not exists)
export async function apiToggleFavoriteByAnimeId(
  animeId: string
): Promise<{ isFavorite: boolean }> {
  return trpcMutation<{ animeId: string }, { isFavorite: boolean }>('user.toggleFavorite', {
    animeId,
  })
}

// Get user's favorited anime IDs
export async function apiGetFavoritedAnimeIds(useCache: boolean = true): Promise<string[]> {
  const cacheKey = 'user:favoritedAnimeIds'

  // Check cache first
  if (useCache) {
    const cached = clientCache.get<string[]>(cacheKey)
    if (cached !== null) {
      return cached
    }
  }

  try {
    const result = await trpcQuery<{ animeIds: string[] }>('user.getFavoritedAnimeIds')
    // Handle null result (when user is not authenticated)
    if (!result) {
      return []
    }
    const animeIds = result.animeIds || []

    // Cache for 1 minute (favorites change frequently)
    clientCache.set(cacheKey, animeIds, CacheTTL.short)

    return animeIds
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
export async function apiGetUserByUsername(
  username: string,
  useCache: boolean = true
): Promise<any> {
  const cacheKey = `user:profile:${username}`

  // Check cache first
  if (useCache) {
    const cached = clientCache.get<any>(cacheKey)
    if (cached !== null) {
      return cached
    }
  }

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

  const result = data.result.data

  // Cache for 5 minutes (user profiles change occasionally)
  clientCache.set(cacheKey, result, CacheTTL.medium)

  return result
}

// Check Username Availability
export async function apiCheckUsernameAvailability(
  username: string
): Promise<{ available: boolean; username: string }> {
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
export async function apiUpdateUserRole(userId: string, role: 'user' | 'moderator' | 'admin' | 'owner') {
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

// Send Password Reset Email (Admin)
export async function apiSendPasswordResetEmail(userId: string) {
  const url = `${TRPC_URL}/admin.sendPasswordResetEmail`
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
    throw new Error(error?.error?.message || 'Failed to send password reset email')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// Toggle Email Verification (Admin)
export async function apiToggleEmailVerification(userId: string, verified: boolean) {
  const url = `${TRPC_URL}/admin.toggleEmailVerification`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ userId, verified }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to toggle email verification')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// Update User Details (Admin)
export async function apiUpdateUserDetails(
  userId: string,
  updates: { username?: string; email?: string }
) {
  const url = `${TRPC_URL}/admin.updateUserDetails`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ userId, ...updates }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to update user details')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// Get User Activity (Admin)
export async function apiGetUserActivity(userId: string) {
  const url = `${TRPC_URL}/admin.getUserActivity?input=${encodeURIComponent(JSON.stringify({ userId }))}`
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
    throw new Error(error?.error?.message || 'Failed to fetch user activity')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// Send Custom Email (Admin)
export async function apiSendCustomEmail(userId: string, subject: string, message: string) {
  const url = `${TRPC_URL}/admin.sendCustomEmail`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ userId, subject, message }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to send email')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// Role Management API Functions
export async function apiGetAllRoles() {
  const url = `${TRPC_URL}/roleManagement.getAllRoles`
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
    throw new Error(error?.error?.message || 'Failed to get roles')
  }

  const data: TRPCResponse<any[]> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

export async function apiGetAllPermissions() {
  const url = `${TRPC_URL}/roleManagement.getAllPermissions`
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
    throw new Error(error?.error?.message || 'Failed to get permissions')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

export async function apiGetRole(roleId: string) {
  const url = `${TRPC_URL}/roleManagement.getRole?input=${encodeURIComponent(JSON.stringify({ roleId }))}`
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
    throw new Error(error?.error?.message || 'Failed to get role')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

export async function apiCreateRole(input: {
  name: string
  displayName: string
  description?: string
  priority?: number
  permissionIds?: string[]
}) {
  const url = `${TRPC_URL}/roleManagement.createRole`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to create role')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

export async function apiUpdateRole(input: {
  roleId: string
  displayName?: string
  description?: string
  priority?: number
  permissionIds?: string[]
}) {
  const url = `${TRPC_URL}/roleManagement.updateRole`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to update role')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

export async function apiDeleteRole(roleId: string) {
  const url = `${TRPC_URL}/roleManagement.deleteRole`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ roleId }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to delete role')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

export async function apiAssignRoleToUser(userId: string, roleId: string) {
  const url = `${TRPC_URL}/roleManagement.assignRoleToUser`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ userId, roleId }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to assign role')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

export async function apiRemoveRoleFromUser(userId: string) {
  const url = `${TRPC_URL}/roleManagement.removeRoleFromUser`
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
    throw new Error(error?.error?.message || 'Failed to remove role')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

export async function apiCreatePermission(input: {
  key: string
  name: string
  description?: string
  category?: string
}) {
  const url = `${TRPC_URL}/roleManagement.createPermission`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to create permission')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

export async function apiUpdatePermission(input: {
  permissionId: string
  name?: string
  description?: string
  category?: string
}) {
  const url = `${TRPC_URL}/roleManagement.updatePermission`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to update permission')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

export async function apiDeletePermission(permissionId: string) {
  const url = `${TRPC_URL}/roleManagement.deletePermission`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({ permissionId }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message || 'Failed to delete permission')
  }

  const data: TRPCResponse<any> = await response.json()
  if ('error' in data) {
    throw new Error(data.error.message)
  }

  return data.result.data
}

// Update Anime (Admin)
export async function apiUpdateAnime(
  animeId: string,
  updateData: {
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
  }
) {
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

export async function apiGetReviews(params?: {
  page?: number
  limit?: number
  filter?: string
  search?: string
}) {
  if (!params) {
    return trpcQuery('moderation.getReviews')
  }
  
  const queryString = new URLSearchParams()
  if (params.page) queryString.append('page', params.page.toString())
  if (params.limit) queryString.append('limit', params.limit.toString())
  if (params.filter) queryString.append('filter', params.filter)
  if (params.search) queryString.append('search', params.search)

  const url = `moderation.getReviews?input=${encodeURIComponent(JSON.stringify(params))}`
  return trpcQuery(url)
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

export async function apiCreateReview(input: {
  animeId: string
  rating: number
  comment: string
}): Promise<any> {
  return trpcMutation('reviews.create', input)
}

export async function apiResendVerification(): Promise<any> {
  return trpcMutation('auth.resendVerification', {})
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
export async function apiGetUserProfile(username: string, useCache: boolean = true) {
  // Normalize username: decode, then strip any leading %40 or @ (defensive)
  let cleanUsername = username || ''
  try {
    cleanUsername = decodeURIComponent(cleanUsername)
  } catch (_) {
    // ignore decode errors; proceed with original
  }
  if (cleanUsername.startsWith('%40')) cleanUsername = cleanUsername.slice(3)
  if (cleanUsername.startsWith('@')) cleanUsername = cleanUsername.slice(1)
  const cacheKey = `social:userProfile:${cleanUsername}`

  // Check cache first
  if (useCache) {
    const cached = clientCache.get<any>(cacheKey)
    if (cached !== null) {
      return cached
    }
  }

  // For tRPC GET requests, input must be in query params using 'input' parameter
  const input = JSON.stringify({ username: cleanUsername })
  const path = `social.getUserProfile?input=${encodeURIComponent(input)}`

  const result = await trpcQuery(path)

  // Cache for 5 minutes (user profiles change occasionally)
  clientCache.set(cacheKey, result, CacheTTL.medium)

  return result
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

export async function apiGetActivityStats(params?: {
  userId?: string
  timeRange?: 'week' | 'month' | 'year' | 'all'
}) {
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

export async function apiGetReviewLikes(
  reviewId: string,
  params?: { limit?: number; cursor?: string }
) {
  const inputData: any = { reviewId }
  if (params?.limit) inputData.limit = params.limit
  if (params?.cursor) inputData.cursor = params.cursor

  const input = JSON.stringify(inputData)
  const path = `reviewInteractions.getReviewLikes?input=${encodeURIComponent(input)}`
  return trpcQuery(path)
}

export async function apiAddReviewComment(reviewId: string, content: string): Promise<{ success: boolean; comment: any }> {
  return trpcMutation('reviewInteractions.addComment', { reviewId, content })
}

export async function apiGetReviewComments(
  reviewId: string,
  params?: { limit?: number; cursor?: string }
) {
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

export async function apiGetNotifications(params?: {
  limit?: number
  cursor?: string
  unreadOnly?: boolean
}) {
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

// -------------------------------
// App Status Badge (Frontend UI)
// -------------------------------
// Fetches status badge configuration from the backend via tRPC proxy.
// Expected tRPC procedure on backend (example): appStatus.getBadge
// Return shape example:
// {
//   status: 'beta',
//   tooltip?: 'Public beta',
//   variant?: 'glass' | 'solid' | 'outline',
//   pulse?: boolean,
//   link?: string,
//   enabled?: boolean
// }
export interface AppStatusBadgeConfig {
  status: string
  tooltip?: string
  variant?: 'glass' | 'solid' | 'outline'
  pulse?: boolean
  link?: string
  enabled?: boolean
}

export async function apiGetAppStatus(): Promise<AppStatusBadgeConfig | null> {
  try {
    // Silent optional fetch (no console errors on 404/missing procedures)
    async function trpcQueryOptional(path: string): Promise<any | null> {
      try {
        const url = `${TRPC_URL}/${path}`
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          credentials: 'include',
        })
        if (!res.ok) return null
        const json: TRPCResponse<any> = await res.json().catch(() => ({}) as any)
        if (!json || typeof json !== 'object' || 'error' in json) return null
        return (json as any).result?.data ?? null
      } catch {
        return null
      }
    }

    // Prefer admin endpoint; fallback to public appStatus.getBadge; then to local storage
    const result =
      (await trpcQueryOptional('admin.getAppStatus')) ??
      (await trpcQueryOptional('appStatus.getBadge'))
    if (!result || typeof result !== 'object') {
      // Fallback: use client-side persisted value if API not available
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('ui:appStatusBadge')
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed && typeof parsed === 'object') {
              return parsed as AppStatusBadgeConfig
            }
          }
        } catch {
          // ignore parse errors
        }
      }
      return null
    }
    return result as AppStatusBadgeConfig
  } catch {
    // As a last resort, check local fallback
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('ui:appStatusBadge')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed && typeof parsed === 'object') {
            return parsed as AppStatusBadgeConfig
          }
        }
      } catch {
        // ignore
      }
    }
    return null
  }
}

export async function apiCanViewContent(
  targetUserId: string,
  contentType: 'profile' | 'animeList' | 'reviews' | 'activity' | 'friends'
) {
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

export async function apiGetAchievementStats() {
  return trpcQuery('achievements.getStats')
}

export async function apiCheckAndUnlockAchievements() {
  return trpcMutation('achievements.checkAndUnlock', {})
}

// Admin Achievement Management
export async function apiGetAchievements(params?: {
  page?: number
  limit?: number
  category?: string
  tier?: string
  search?: string
}) {
  if (!params) {
    return trpcQuery('admin.getAchievements')
  }
  
  const url = `admin.getAchievements?input=${encodeURIComponent(JSON.stringify(params))}`
  return trpcQuery(url)
}

export async function apiCreateAchievement(data: {
  key: string
  name: string
  description: string
  icon: string
  category: 'watching' | 'rating' | 'social' | 'discovery' | 'special'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  requirement: number
  points?: number
}) {
  return trpcMutation('admin.createAchievement', data)
}

export async function apiUpdateAchievement(data: {
  id: string
  name?: string
  description?: string
  icon?: string
  category?: 'watching' | 'rating' | 'social' | 'discovery' | 'special'
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  requirement?: number
  points?: number
}) {
  return trpcMutation('admin.updateAchievement', data)
}

export async function apiDeleteAchievement(achievementId: string) {
  return trpcMutation('admin.deleteAchievement', { id: achievementId })
}

// duplicate removed

export async function apiBulkCreateAchievements(achievements: Array<{
  key: string
  name: string
  description: string
  icon: string
  category: 'watching' | 'rating' | 'social' | 'discovery' | 'special'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  requirement: number
  points?: number
}>) {
  return trpcMutation('admin.bulkCreateAchievements', { achievements })
}

// Leaderboards
export async function apiGetTopWatchers(params?: {
  limit?: number
  timeRange?: 'week' | 'month' | 'all'
}) {
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

export async function apiUpdateSharedList(
  listId: string,
  params: {
    name?: string
    description?: string
    animeIds?: string[]
    collaborators?: string[]
    isPublic?: boolean
  }
) {
  return trpcMutation('listTools.updateSharedList', { listId, ...params })
}

// Generic tRPC helpers for new components
export const api = {
  trpcQuery: async (procedure: string, input?: any) => {
    const url = `${TRPC_URL}/${procedure}${input ? `?input=${encodeURIComponent(JSON.stringify(input))}` : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const code = errorData?.error?.data?.code || ''
      const message = errorData?.error?.message || `Failed to ${procedure}`
      
      // Check for database configuration errors (Prisma Accelerate API key issues)
      const isDatabaseConfigError = 
        code === 'DATABASE_CONFIGURATION_ERROR' ||
        message.includes('Accelerate API key') ||
        message.includes('DATABASE_URL') ||
        message.includes('P6002') ||
        (errorData?.error?.body?.code === 'P6002' && errorData?.error?.body?.message?.includes('API key'))
      
      if (isDatabaseConfigError) {
        // Only log once per session to avoid console spam
        if (typeof window !== 'undefined' && !(window as any).__dbConfigErrorLogged) {
          console.warn('⚠️ Database Configuration Error: Backend has invalid Prisma Accelerate API key.')
          console.warn('   This is a backend configuration issue. Please check the backend .env file.')
          console.warn('   Update DATABASE_URL to use a direct PostgreSQL connection or provide a valid Accelerate API key.')
          ;(window as any).__dbConfigErrorLogged = true
        }
        // Return null for database errors on recommendation endpoints to prevent UI crashes
        if (procedure.includes('recommendations.') || procedure.includes('anime.')) {
          return null
        }
        throw new Error('Database connection error. Please contact the administrator.')
      }
      
      // Check if this is an auth error on an optional endpoint
      const isOptionalRecommendationEndpoint =
        procedure.includes('recommendations.getForYou') ||
        procedure.includes('recommendations.getFansLikeYou') ||
        procedure.includes('recommendations.getHiddenGems') ||
        procedure.includes('recommendations.getDiscovery') ||
        procedure.includes('recommendations.getContinueWatching') ||
        procedure.includes('social.getFriendRecommendations')
      
      const isAuthError = code === 'UNAUTHORIZED' || 
        response.status === 401 ||
        message.toLowerCase().includes('session') ||
        message.toLowerCase().includes('invalid') ||
        message.toLowerCase().includes('expired')
      
      // For optional recommendation endpoints with auth errors, return null instead of throwing
      if (isOptionalRecommendationEndpoint && isAuthError) {
        return null
      }
      
      throw new Error(message)
    }

    const data = await response.json()
    return data?.result?.data
  },

  trpcMutation: async (procedure: string, input: any) => {
    const url = `${TRPC_URL}/${procedure}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(input),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const code = errorData?.error?.data?.code || ''
      const message = errorData?.error?.message || `Failed to ${procedure}`
      
      // Check for database configuration errors (Prisma Accelerate API key issues)
      const isDatabaseConfigError = 
        code === 'DATABASE_CONFIGURATION_ERROR' ||
        message.includes('Accelerate API key') ||
        message.includes('DATABASE_URL') ||
        message.includes('P6002') ||
        (errorData?.error?.body?.code === 'P6002' && errorData?.error?.body?.message?.includes('API key'))
      
      if (isDatabaseConfigError) {
        // Only log once per session to avoid console spam
        if (typeof window !== 'undefined' && !(window as any).__dbConfigErrorLogged) {
          console.warn('⚠️ Database Configuration Error: Backend has invalid Prisma Accelerate API key.')
          console.warn('   This is a backend configuration issue. Please check the backend .env file.')
          console.warn('   Update DATABASE_URL to use a direct PostgreSQL connection or provide a valid Accelerate API key.')
          ;(window as any).__dbConfigErrorLogged = true
        }
        throw new Error('Database connection error. Please contact the administrator.')
      }
      
      throw new Error(message)
    }

    const data = await response.json()
    return data?.result?.data
  },
}
