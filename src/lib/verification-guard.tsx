'use client'

import { useAuth } from '../app/lib/auth-context'
import { EmailVerificationBanner } from '../components/EmailVerificationBanner'
import { ShieldAlert, Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../components/ui/button'

interface VerificationGuardProps {
  children: React.ReactNode
  /**
   * If true, completely blocks access to the feature
   * If false, shows a banner but allows limited access
   */
  requireVerification?: boolean
  /**
   * Custom message when blocking access
   */
  message?: string
}

/**
 * Verification Guard Component
 * Protects features by checking if user has verified their email
 */
export function VerificationGuard({ 
  children, 
  requireVerification = false,
  message 
}: VerificationGuardProps) {
  const { user, isAuthenticated } = useAuth()

  // If not authenticated, let the ProtectedRoute handle it
  if (!isAuthenticated || !user) {
    return <>{children}</>
  }

  // If email is verified, show content
  if (user.emailVerified) {
    return <>{children}</>
  }

  // If verification is required and not verified, block access
  if (requireVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-warning-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="h-8 w-8 text-warning-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">Email Verification Required</h2>
            
            <p className="text-gray-400 mb-6">
              {message || 'This feature requires email verification to prevent spam and ensure account security.'}
            </p>

            <EmailVerificationBanner 
              email={user.email} 
            />

            <div className="mt-6 pt-6 border-t border-white/10">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If verification is not required, show banner and content
  return (
    <>
      <EmailVerificationBanner email={user.email} />
      {children}
    </>
  )
}

/**
 * Hook to check if user is verified
 */
export function useEmailVerification() {
  const { user, isAuthenticated } = useAuth()

  return {
    isVerified: user?.emailVerified || false,
    needsVerification: isAuthenticated && !user?.emailVerified,
    user
  }
}

/**
 * Higher-order component to require email verification
 */
export function withEmailVerification<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requireVerification?: boolean
    message?: string
  }
) {
  return function VerifiedComponent(props: P) {
    return (
      <VerificationGuard 
        requireVerification={options?.requireVerification} 
        message={options?.message}
      >
        <Component {...props} />
      </VerificationGuard>
    )
  }
}

