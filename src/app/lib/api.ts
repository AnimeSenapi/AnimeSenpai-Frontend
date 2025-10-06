// Lightweight client to talk to the backend tRPC HTTP endpoint
// Uses the tRPC HTTP format: POST /api/trpc/<router.procedure>

import type { Anime, AnimeListResponse, AuthUser, AuthResponse, SignupInput } from '../../types/anime'

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

const TRPC_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3004/api/trpc'

function getAuthHeaders(): Record<string, string> {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}

// Convert technical error codes to user-friendly messages
function getUserFriendlyError(code: string, message: string): string {
  const errorMessages: Record<string, string> = {
    'UNAUTHORIZED': 'Your session has expired. Please sign in again.',
    'TOKEN_INVALID': 'Your session has expired. Please sign in again.',
    'TOKEN_EXPIRED': 'Your session has expired. Please sign in again.',
    'USER_NOT_FOUND': 'We couldn\'t find an account with that email address.',
    'INVALID_CREDENTIALS': 'The email or password you entered is incorrect.',
    'EMAIL_ALREADY_EXISTS': 'An account with this email already exists.',
    'EMAIL_NOT_VERIFIED': 'Please verify your email address before signing in.',
    'ACCOUNT_LOCKED': 'Your account has been locked due to too many failed login attempts. Please try again later.',
    'VALIDATION_ERROR': 'Please check your input and try again.',
    'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment and try again.',
    'NETWORK_ERROR': 'Unable to connect to the server. Please check your internet connection.',
    'INTERNAL_SERVER_ERROR': 'Something went wrong on our end. Please try again later.',
    'BAD_REQUEST': 'Invalid request. Please check your input.',
    'FORBIDDEN': 'You don\'t have permission to perform this action.',
    'NOT_FOUND': 'The requested resource was not found.',
    'CONFLICT': 'This action conflicts with existing data.',
    'WEAK_PASSWORD': 'Please choose a stronger password with at least 8 characters.',
    'INVALID_TOKEN': 'This link is invalid or has expired. Please request a new one.',
    'PASSWORD_MISMATCH': 'The passwords you entered don\'t match.',
  }

  return errorMessages[code] || message || 'Something went wrong. Please try again.'
}

async function trpcQuery<TOutput>(path: string, init?: RequestInit): Promise<TOutput> {
  const url = `${TRPC_URL}/${path}`
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        ...(init?.headers || {}),
      },
      credentials: 'omit',
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
      
      // Handle session expired errors gracefully
      if (code === 'UNAUTHORIZED' || message.includes('session') || message.includes('expired')) {
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
      
      // Handle session expired errors gracefully
      if (code === 'UNAUTHORIZED' || err.message.includes('session') || err.message.includes('expired')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      }
      
      throw new Error(getUserFriendlyError(code, err.message))
    }
    return json.result.data
  } catch (error: unknown) {
    // Handle network errors
    if (error instanceof Error && error.message.includes('fetch')) {
      throw new Error(getUserFriendlyError('NETWORK_ERROR', 'Unable to connect to the server'))
    }
    throw error
  }
}

async function trpcMutation<TInput, TOutput>(path: string, input?: TInput, init?: RequestInit): Promise<TOutput> {
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
      credentials: 'omit',
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
      
      // Handle session expired errors gracefully
      if (code === 'UNAUTHORIZED' || message.includes('session') || message.includes('expired')) {
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
      
      // Handle session expired errors gracefully
      if (code === 'UNAUTHORIZED' || err.message.includes('session') || err.message.includes('expired')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      }
      
      throw new Error(getUserFriendlyError(code, err.message))
    }
    return json.result.data
  } catch (error: unknown) {
    // Handle network errors
    if (error instanceof Error && error.message.includes('fetch')) {
      throw new Error(getUserFriendlyError('NETWORK_ERROR', 'Unable to connect to the server'))
    }
    throw error
  }
}

// Auth API
export async function apiSignup(input: SignupInput) {
  const data = await trpcMutation<SignupInput & { confirmPassword: string }, AuthResponse>('auth.signup', {
    ...input,
    confirmPassword: input.password // Backend requires confirmPassword
  })
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
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}

// Anime API calls
export async function apiGetAllAnime() {
  return trpcQuery<AnimeListResponse | Anime[]>('anime.getAll')
}

export async function apiGetTrending() {
  return trpcQuery<Anime[]>('anime.getTrending')
}

export async function apiGetAnimeBySlug(slug: string) {
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

  return data.result.data
}

export async function apiGetGenres() {
  return trpcQuery<string[]>('anime.getGenres')
}

export async function apiSearchAnime(query: string): Promise<Anime[]> {
  // For now, use getAll and filter client-side
  // In production, add a dedicated search endpoint
  const allAnime = await apiGetAllAnime()
  const animeArray = Array.isArray(allAnime) ? allAnime : allAnime.anime
  const lowerQuery = query.toLowerCase()
  return animeArray.filter((anime: Anime) => 
    anime.title.toLowerCase().includes(lowerQuery) ||
    anime.description?.toLowerCase().includes(lowerQuery) ||
    anime.studio?.toLowerCase().includes(lowerQuery)
  )
}


