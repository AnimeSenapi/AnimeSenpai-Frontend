'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  apiMe,
  clearSession,
  apiSignin,
  apiSignup,
  apiForgotPassword,
  apiResetPassword,
  apiVerifyEmail,
} from './api'
import { logger, captureException } from '../../lib/logger'

export interface User {
  id: string
  email: string
  username?: string
  name?: string
  firstName?: string
  lastName?: string
  avatar?: string
  bio?: string
  emailVerified?: boolean
  role?: string
  createdAt?: string
  preferences?: Record<string, unknown>
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  signin: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signup: (data: {
    email: string
    username: string
    password: string
    gdprConsent: boolean
    dataProcessingConsent: boolean
    marketingConsent?: boolean
    confirmPassword: string
  }) => Promise<void>
  signout: () => void
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string, confirmNewPassword: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  clearError: () => void
  refreshUser: () => Promise<void>
  getAuthHeaders: () => Record<string, string>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start as true to check auth on mount
  const [error, setError] = useState<string | null>(null)
  const isInitialized = useState(true)[0]

  const isAuthenticated = !!user

  // Initialize auth context on mount
  useEffect(() => {
    const initAuth = async () => {
      // Check both localStorage and sessionStorage for tokens
      const accessToken =
        localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')

      if (accessToken) {
        try {
          const userData = (await apiMe()) as any
          // If apiMe returns null, it means the token is invalid
          if (!userData) {
            console.warn('[Auth] apiMe returned null, attempting token refresh')
            // Try to refresh the token before clearing session
            const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
            if (refreshToken) {
              try {
                const { TRPC_URL } = await import('./api')
                const response = await fetch(TRPC_URL + '/auth.refreshToken', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ refreshToken }),
                  credentials: 'include',
                })

                if (response.ok) {
                  const json = await response.json()
                  if ('result' in json && json.result?.data) {
                    const data = json.result.data
                    const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage
                    storage.setItem('accessToken', data.accessToken)
                    storage.setItem('refreshToken', data.refreshToken)
                    console.log('[Auth] Token refreshed successfully, retrying auth.me')
                    // Retry apiMe with new token
                    try {
                      const retryUserData = (await apiMe()) as any
                      if (retryUserData) {
                        console.log('[Auth] Successfully authenticated user after refresh:', retryUserData.email)
                        setUser(retryUserData)
                        setIsLoading(false)
                        return
                      }
                    } catch (retryError: any) {
                      // Expected error - session is still invalid
                      console.warn('[Auth] Retry after refresh failed:', retryError.message)
                    }
                  }
                }
              } catch (refreshError) {
                console.warn('[Auth] Token refresh failed:', refreshError)
              }
            }
            // If refresh failed or no refresh token, clear session
            console.warn('[Auth] Clearing session after failed refresh')
            clearSession()
            setIsLoading(false)
            return
          }
          console.log('[Auth] Successfully authenticated user:', userData.email)
          setUser(userData)
        } catch (err: unknown) {
          // Only clear tokens if it's a token-related error, not a network error
          const errorMessage = err instanceof Error ? err.message : ''
          const isTokenError = 
            errorMessage.includes('TOKEN_INVALID') ||
            errorMessage.includes('UNAUTHORIZED') ||
            errorMessage.includes('expired') ||
            errorMessage.includes('session') ||
            errorMessage.includes('invalid') ||
            errorMessage.includes('Please sign in again')
          
          if (isTokenError) {
            // Silently handle expected auth errors - these are normal when not logged in
            // Only log if we have a token (meaning it's actually an error, not just no session)
            if (accessToken) {
              console.warn('[Auth] Token error detected, attempting refresh before clearing')
            }
            // Try to refresh the token before clearing
            const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
            if (refreshToken) {
              try {
                const { TRPC_URL } = await import('./api')
                const response = await fetch(TRPC_URL + '/auth.refreshToken', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ refreshToken }),
                  credentials: 'include',
                })

                if (response.ok) {
                  const json = await response.json()
                  if ('result' in json && json.result?.data) {
                    const data = json.result.data
                    const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage
                    storage.setItem('accessToken', data.accessToken)
                    storage.setItem('refreshToken', data.refreshToken)
                    console.log('[Auth] Token refreshed successfully, retrying auth.me')
                    // Retry apiMe with new token
                    const retryUserData = (await apiMe()) as any
                    if (retryUserData) {
                      console.log('[Auth] Successfully authenticated user after refresh:', retryUserData.email)
                      setUser(retryUserData)
                      setIsLoading(false)
                      return
                    }
                  }
                }
              } catch (refreshError) {
                console.warn('[Auth] Token refresh failed:', refreshError)
              }
            }
            // If refresh failed, clear session
            console.warn('[Auth] Clearing session after failed refresh')
            clearSession()
          } else {
            console.warn('[Auth] Non-token error during auth check (keeping session):', errorMessage)
          }
        } finally {
          setIsLoading(false)
        }
      } else {
        // No token found, set loading to false immediately
        console.log('[Auth] No token found in storage')
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Proactive token refresh - refresh token every 45 minutes to prevent expiration
  useEffect(() => {
    if (!isAuthenticated) return

    const refreshInterval = 45 * 60 * 1000 // 45 minutes (tokens expire in 1 hour)

    const intervalId = setInterval(async () => {
      const refreshToken =
        localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { TRPC_URL } = await import('./api')
          const response = await fetch(TRPC_URL + '/auth.refreshToken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
            credentials: 'include',
          })

          if (response.ok) {
            const json = await response.json()
            if ('result' in json && json.result?.data) {
              const data = json.result.data
              const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage
              storage.setItem('accessToken', data.accessToken)
              storage.setItem('refreshToken', data.refreshToken)
            }
          } else if (response.status === 401) {
            // Refresh token is invalid or expired - sign out user
            clearInterval(intervalId)
            signout()
          }
        } catch (error) {
          // Network error - will retry at next interval
        }
      }
    }, refreshInterval)

    return () => clearInterval(intervalId)
  }, [isAuthenticated])

  // Removed unused checkAuth function

  const signin = async (email: string, password: string, rememberMe?: boolean) => {
    try {
      setIsLoading(true)
      setError(null)

      // Wait for initialization to complete
      if (!isInitialized) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      const data = (await apiSignin({ email, password, rememberMe })) as any
      console.log('[Auth] Signin response:', { 
        hasUser: !!data.user, 
        hasAccessToken: !!data.accessToken, 
        hasRefreshToken: !!data.refreshToken,
        rememberMe 
      })
      
      if (!data.accessToken || !data.refreshToken) {
        console.error('[Auth] Signin response missing tokens!', data)
        throw new Error('Sign in failed: No tokens received from server')
      }

      setUser(data.user)

      // Store tokens based on "Remember Me" preference
      const storage = rememberMe ? localStorage : sessionStorage

      storage.setItem('accessToken', data.accessToken)
      storage.setItem('refreshToken', data.refreshToken)
      
      console.log('[Auth] Tokens stored in:', rememberMe ? 'localStorage' : 'sessionStorage')
      console.log('[Auth] Token stored - accessToken exists:', !!storage.getItem('accessToken'))
      console.log('[Auth] Token stored - refreshToken exists:', !!storage.getItem('refreshToken'))

      // If using sessionStorage, clear localStorage tokens
      if (!rememberMe) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('rememberMe')
      } else {
        // If using localStorage, clear sessionStorage tokens and mark remember me
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('refreshToken')
        localStorage.setItem('rememberMe', 'true')
      }
      
      // Verify tokens are actually stored
      const verifyStorage = rememberMe ? localStorage : sessionStorage
      const storedAccessToken = verifyStorage.getItem('accessToken')
      const storedRefreshToken = verifyStorage.getItem('refreshToken')
      console.log('[Auth] Verification - accessToken in storage:', !!storedAccessToken)
      console.log('[Auth] Verification - refreshToken in storage:', !!storedRefreshToken)
      
      if (!storedAccessToken || !storedRefreshToken) {
        console.error('[Auth] CRITICAL: Tokens were not stored correctly!')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (data: {
    email: string
    username: string
    password: string
    gdprConsent: boolean
    dataProcessingConsent: boolean
    marketingConsent?: boolean
    confirmPassword: string
  }) => {
    try {
      setIsLoading(true)
      setError(null)

      // Wait for initialization to complete
      if (!isInitialized) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      const result = (await apiSignup(data)) as any
      setUser(result.user)

      // Store tokens
      localStorage.setItem('accessToken', result.accessToken)
      localStorage.setItem('refreshToken', result.refreshToken)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signout = () => {
    clearSession()
    setUser(null)
    setError(null)
    setIsLoading(false)

    // Direct redirect to signin page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signin'
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true)
      setError(null)

      await apiForgotPassword({ email })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (token: string, newPassword: string, confirmNewPassword: string) => {
    try {
      setIsLoading(true)
      setError(null)

      await apiResetPassword({ token, newPassword, confirmNewPassword })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reset password'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEmail = async (token: string) => {
    try {
      setIsLoading(true)
      setError(null)

      await apiVerifyEmail({ token })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to verify email'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const refreshUser = async () => {
    try {
      const userData = (await apiMe()) as any
      setUser(userData)
    } catch (err: unknown) {
      logger.error('Failed to refresh user data', {
        error: err instanceof Error ? err.message : String(err),
      })
      captureException(err, { context: { operation: 'refresh_user' } })
      signout()
    }
  }

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = 'Bearer ' + token
    }
    return headers
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    signin,
    signup,
    signout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    clearError,
    refreshUser,
    getAuthHeaders,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
