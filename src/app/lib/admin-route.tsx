'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-context'
import { Shield, AlertTriangle } from 'lucide-react'

interface AdminRouteProps {
  children: React.ReactNode
}

/**
 * Protected route wrapper for admin-only pages
 *
 * Features:
 * - Checks user authentication
 * - Verifies admin role
 * - Redirects non-admins to dashboard
 * - Shows loading state
 * - Handles edge cases
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin?redirect=/admin')
    }

    // Redirect if not admin or owner
    if (!isLoading && isAuthenticated && user?.role !== 'admin' && user?.role !== 'owner') {
      router.push('/dashboard')
    }
  }, [isLoading, isAuthenticated, user, router])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-warning-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">Authentication Required</p>
          <p className="text-gray-400">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  // Not admin or owner
  if (user?.role !== 'admin' && user?.role !== 'owner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center glass rounded-2xl p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-error-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-error-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            You don't have permission to access the admin panel. This page is restricted to
            administrators only.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2.5 bg-primary-500/20 border border-primary-500/30 text-primary-300 hover:bg-primary-500/30 rounded-lg font-medium transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Render admin content
  return <>{children}</>
}
