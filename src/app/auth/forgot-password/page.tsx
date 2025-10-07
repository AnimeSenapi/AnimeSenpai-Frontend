'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { 
  Mail, 
  ArrowLeft,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '../../lib/auth-context'
import { RequireGuest } from '../../lib/protected-route'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { forgotPassword, isLoading, error, clearError } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    try {
      await forgotPassword(email)
      setIsSubmitted(true)
    } catch (err) {
      // Error is handled by the auth context
    }
  }

  if (isSubmitted) {
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
                className="inline-flex items-center text-gray-300 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>
            </div>

            {/* Success Card */}
            <div className="glass rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-success-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-success-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-4">
                Check Your Email
              </h1>
              
              <p className="text-gray-300 mb-6">
                We've sent a password reset link to <span className="text-primary-400 font-medium">{email}</span>
              </p>
              
              <p className="text-sm text-gray-400 mb-8">
                Didn't receive the email? Check your spam folder or{' '}
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-primary-400 hover:text-primary-400 transition-colors"
                >
                  try again
                </button>
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = '/auth/signin'}
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-brand-primary-500/25"
                >
                  Back to Sign In
                </Button>
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
              className="inline-flex items-center text-gray-300 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Link>
          </div>

          {/* Forgot Password Card */}
          <div className="glass rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Forgot Password?
              </h1>
              <p className="text-gray-300">
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg border border-error-500/30 bg-error-500/10 text-red-300 px-3 py-2 text-sm">
                  {error}
                </div>
              )}
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary-400/50 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-brand-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-gray-400">
                  Remember your password?{' '}
                  <Link 
                    href="/auth/signin"
                    className="text-primary-400 hover:text-primary-400 transition-colors font-medium"
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
