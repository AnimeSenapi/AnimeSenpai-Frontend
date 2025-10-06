'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiMe, clearSession, apiSignin, apiSignup, apiForgotPassword, apiResetPassword, apiVerifyEmail } from './api'

export interface User {
  id: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  avatar?: string
  bio?: string
  emailVerified?: boolean
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
    password: string
    firstName: string
    lastName?: string
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isInitialized = useState(true)[0]

  const isAuthenticated = !!user

    // Initialize auth context on mount
    useEffect(() => {
      const initAuth = async () => {
        const accessToken = localStorage.getItem('accessToken')
        
        if (accessToken) {
          try {
            setIsLoading(true)
            const userData = await apiMe()
            setUser(userData)
          } catch (err: unknown) {
            // Only clear tokens if it's a token-related error, not a network error
            const errorMessage = err instanceof Error ? err.message : ''
            if (errorMessage.includes('TOKEN_INVALID') || errorMessage.includes('UNAUTHORIZED') || errorMessage.includes('expired')) {
              clearSession()
            }
          } finally {
            setIsLoading(false)
          }
        } else {
          // No token found, set loading to false immediately
          setIsLoading(false)
        }
      }
      
      initAuth()
    }, [])

  // Removed unused checkAuth function

  const signin = async (email: string, password: string, rememberMe?: boolean) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Wait for initialization to complete
      if (!isInitialized) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      const data = await apiSignin({ email, password, rememberMe })
      setUser(data.user)
      
      // Store tokens
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
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
    password: string
    firstName: string
    lastName?: string
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
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      const result = await apiSignup(data)
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
      const userData = await apiMe()
      setUser(userData)
    } catch (err: unknown) {
      console.error('Failed to refresh user:', err)
      signout()
    }
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
  }


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
