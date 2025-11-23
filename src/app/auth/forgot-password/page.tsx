'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Mail, ArrowLeft, Send, Clock, Loader2 } from 'lucide-react'
import { useAuth } from '../../lib/auth-context'
import { RequireGuest } from '../../lib/protected-route'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const { forgotPassword, isLoading, error, clearError } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      await forgotPassword(email)
      setIsSubmitted(true)
      // Start countdown
      let count = 60
      const timer = setInterval(() => {
        count--
        setCountdown(count)
        if (count === 0) {
          clearInterval(timer)
          setCountdown(60)
        }
      }, 1000)
    } catch (err) {
      // Error is handled by the auth context
    }
  }

  const handleResend = async () => {
    clearError()
    try {
      await forgotPassword(email)
      setCountdown(60)
      // Restart countdown
      let count = 60
      const timer = setInterval(() => {
        count--
        setCountdown(count)
        if (count === 0) {
          clearInterval(timer)
          setCountdown(60)
        }
      }, 1000)
    } catch (err) {
      // Error handled
    }
  }

  if (isSubmitted) {
    return (
      <RequireGuest>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden flex items-center justify-center p-4 pt-20 sm:pt-32">
        {/* Subtle Background */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 -right-40 w-96 h-96 bg-green-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-40 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Back Link */}
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 sm:mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </Link>

          {/* Success Card */}
          <div className="glass rounded-3xl p-6 sm:p-8 md:p-10 text-center shadow-2xl border border-white/10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Send className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">Check Your Inbox</h1>

              <p className="text-gray-300 mb-2">We've sent a password reset link to:</p>

              <p className="text-primary-400 font-semibold mb-6">{email}</p>

              <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-gray-300 mb-2">
                  <strong className="text-white">What to do next:</strong>
                </p>
                <ol className="text-sm text-gray-400 space-y-1 pl-4">
                  <li>1. Check your inbox and spam folder</li>
                  <li>2. Click the reset link in the email</li>
                  <li>3. Enter your new password</li>
                </ol>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => (window.location.href = 'mailto:')}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Open Email App
                </Button>

                <div className="pt-3 border-t border-white/10">
                  <p className="text-gray-400 text-sm mb-3">Didn't receive the email?</p>
                  {countdown > 0 ? (
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Resend in {countdown}s</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={isLoading}
                      className="text-primary-400 hover:text-primary-300 transition-colors font-medium text-sm"
                    >
                      {isLoading ? 'Sending...' : 'Resend Reset Link'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </RequireGuest>
    )
  }

  return (
    <RequireGuest>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden flex items-center justify-center p-4 pt-20 sm:pt-32">
        {/* Subtle Background */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 -right-40 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-40 w-96 h-96 bg-secondary-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Back Link */}
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 sm:mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </Link>

          {/* Forgot Password Card */}
          <div className="glass rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white/10">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-primary-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Forgot Password?</h1>
              <p className="text-gray-400 text-sm sm:text-base">No worries, we'll email you a reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-base"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Enter the email you used to sign up</p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-3 sm:py-3.5 disabled:opacity-50 shadow-lg shadow-primary-500/25 min-h-[48px] text-base"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="h-5 w-5" />
                    Send Reset Link
                  </span>
                )}
              </Button>

              {/* Sign In Link */}
              <div className="text-center pt-4 border-t border-white/10">
                <p className="text-gray-400 text-sm">
                  Remember your password?{' '}
                  <Link
                    href="/auth/signin"
                    className="text-primary-400 hover:text-primary-300 transition-colors font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Footer Note */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Reset link expires after 1 hour for security
          </p>
        </div>
      </div>
    </RequireGuest>
  )
}
