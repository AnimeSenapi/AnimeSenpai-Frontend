'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
  requireGuest?: boolean
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/signin', 
  requireAuth = true,
  requireGuest = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo)
      return
    }

    if (requireGuest && isAuthenticated) {
      router.push('/dashboard')
      return
    }
  }, [isAuthenticated, isLoading, requireAuth, requireGuest, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">AS</span>
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (requireGuest && isAuthenticated) {
    return null
  }

  return <>{children}</>
}

// Convenience components
export function RequireAuth({ children, redirectTo }: { children: React.ReactNode; redirectTo?: string }) {
  return (
    <ProtectedRoute requireAuth={true} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  )
}

export function RequireGuest({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false} requireGuest={true}>
      {children}
    </ProtectedRoute>
  )
}
