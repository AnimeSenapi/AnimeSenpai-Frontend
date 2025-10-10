'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { 
  Mail, 
  ArrowLeft,
  CheckCircle,
  Send,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react'
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-success-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-success-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-md mx-auto">
              {/* Back Button */}
              <div className="mb-6">
                <Link 
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>

              {/* Success Card */}
              <div className="glass rounded-2xl p-12 text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-success-500/20 rounded-2xl"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Send className="h-10 w-10 text-success-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-4">
                  Check Your Inbox! 📬
                </h1>
                
                <p className="text-gray-300 mb-2 text-lg">
                  We've sent a password reset link to:
                </p>
                
                <p className="text-primary-400 font-semibold text-lg mb-6">
                  {email}
                </p>
                
                <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4 mb-8">
                  <p className="text-sm text-gray-300 mb-2">
                    <strong className="text-white">📧 What to do next:</strong>
                  </p>
                  <ol className="text-sm text-gray-400 text-left space-y-1 pl-4">
                    <li>1. Check your inbox and spam folder</li>
                    <li>2. Click the reset link in the email</li>
                    <li>3. Enter your new password</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => window.location.href = 'mailto:'}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Open Email App
                  </Button>
                  
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-gray-400 text-sm mb-3">
                      Didn't receive the email?
                    </p>
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
        </div>
      </RequireGuest>
    )
  }

  return (
    <RequireGuest>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-md mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Link 
                href="/auth/signin"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>

            {/* Forgot Password Card */}
            <div className="glass rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Forgot Password?
                </h1>
                <p className="text-gray-400">
                  No worries! We'll email you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-error-500/10 border border-error-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-error-400 flex-shrink-0 mt-0.5" />
                    <p className="text-error-400 text-sm flex-1">{error}</p>
                  </div>
                )}
                
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Enter the email you used to sign up
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-4 text-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Reset Link
                    </>
                  )}
                </Button>

                {/* Sign In Link */}
                <div className="text-center pt-4 border-t border-white/10">
                  <p className="text-gray-400">
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
          </div>
        </div>
      </div>
    </RequireGuest>
  )
}
