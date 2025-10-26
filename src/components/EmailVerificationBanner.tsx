'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Mail, X, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useToast } from './ui/toast'

interface EmailVerificationBannerProps {
  email: string
  onDismiss?: () => void
}

/**
 * Email Verification Banner
 * Shows a dismissible banner prompting users to verify their email
 */
export function EmailVerificationBanner({ email, onDismiss }: EmailVerificationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const { addToast } = useToast()

  const handleResend = async () => {
    try {
      setIsResending(true)

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/trpc'
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')

      const response = await fetch(`${API_URL}/auth.resendVerification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
        credentials: 'include',
      })

      const data = await response.json()

      if ('error' in data) {
        throw new Error(data.error.message || 'Failed to resend verification email')
      }

      setResendSuccess(true)
      addToast({
        title: 'Check your inbox',
        description: 'Verification email sent!',
        variant: 'success',
      })

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setResendSuccess(false)
      }, 5000)
    } catch (error: any) {
      addToast({
        title: 'Please try again',
        description: error.message || 'Failed to resend email',
        variant: 'destructive',
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()

    // Store dismissed state in localStorage (don't show again for 24 hours)
    const dismissedUntil = Date.now() + 24 * 60 * 60 * 1000
    localStorage.setItem('emailVerificationBannerDismissed', dismissedUntil.toString())
  }

  // Check if banner was recently dismissed
  const wasDismissed = () => {
    const dismissedUntil = localStorage.getItem('emailVerificationBannerDismissed')
    if (dismissedUntil) {
      return Date.now() < parseInt(dismissedUntil)
    }
    return false
  }

  if (isDismissed || wasDismissed()) return null

  if (resendSuccess) {
    return (
      <div className="bg-green-500/10 border-l-4 border-green-500 rounded-r-xl p-4 mx-4 sm:mx-6 lg:mx-8 mb-6 animate-in slide-in-from-top-2 duration-300">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-green-400 font-semibold mb-1">Email Sent!</h3>
            <p className="text-gray-300 text-sm">
              We've sent a verification link to <strong>{email}</strong>. Check your inbox and spam
              folder.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-warning-500/10 border-l-4 border-warning-500 rounded-r-xl p-4 mx-4 sm:mx-6 lg:mx-8 mb-6 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-warning-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-warning-400 font-semibold mb-1">Verify Your Email</h3>
          <p className="text-gray-300 text-sm mb-3">
            Please verify your email address (<strong>{email}</strong>) to unlock all features and
            ensure account security.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleResend}
              disabled={isResending}
              size="sm"
              className="bg-warning-500 hover:bg-warning-600 text-white"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              Remind Me Later
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/**
 * Compact Email Verification Prompt
 * For use in user settings or profile
 */
export function EmailVerificationPrompt({ email }: { email: string }) {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const { addToast } = useToast()

  const handleResend = async () => {
    try {
      setIsResending(true)

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/trpc'
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')

      const response = await fetch(`${API_URL}/auth.resendVerification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
        credentials: 'include',
      })

      const data = await response.json()

      if ('error' in data) {
        throw new Error(data.error.message || 'Failed to resend verification email')
      }

      setResendSuccess(true)
      addToast({
        title: 'Check your inbox',
        description: 'Verification email sent!',
        variant: 'success',
      })

      setTimeout(() => setResendSuccess(false), 5000)
    } catch (error: any) {
      addToast({
        title: 'Please try again',
        description: error.message || 'Failed to resend email',
        variant: 'destructive',
      })
    } finally {
      setIsResending(false)
    }
  }

  if (resendSuccess) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="h-5 w-5" />
          <p className="text-sm font-medium">Verification email sent to {email}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-warning-500/10 border border-warning-500/20 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Mail className="h-5 w-5 text-warning-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-warning-400 font-semibold mb-1 text-sm">Email Not Verified</h4>
          <p className="text-gray-400 text-xs mb-3">Verify your email to unlock all features</p>
          <Button
            onClick={handleResend}
            disabled={isResending}
            size="sm"
            className="bg-warning-500 hover:bg-warning-600 text-white text-xs"
          >
            {isResending ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-3 w-3 mr-2" />
                Send Verification Email
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
