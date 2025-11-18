'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import { useAuth } from '../../lib/auth-context'
import { useToast } from '../../../components/ui/toast'
import { RequireGuest } from '../../lib/protected-route'
import { PageErrorBoundary } from '../../../components/PageErrorBoundary'
import PageLoading from '../../../components/ui/page-loading'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({})
  const [isMounted, setIsMounted] = useState(false)
  const { signin, isLoading, error, clearError } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()

  // Handle hydration mismatch from browser extensions
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {}

    if (!email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setFormErrors({})

    if (!validateForm()) {
      return
    }

    try {
      await signin(email, password, rememberMe)

      await new Promise((resolve) => setTimeout(resolve, 100))

      addToast({
        title: 'Signed In',
        description: 'Welcome back!',
        variant: 'success',
      })
      router.push('/dashboard')
    } catch (err) {
      if (error) {
        addToast({
        title: 'Sign In Failed',
        description: error,
        variant: 'destructive',
      })
      }
    }
  }

  // Prevent hydration mismatch by only rendering form after mount
  if (!isMounted) {
    return (
      <RequireGuest>
        <PageLoading text="Preparing sign-in form..." />
      </RequireGuest>
    )
  }

  return (
    <PageErrorBoundary pageName="Sign In">
    <RequireGuest>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden flex items-center justify-center p-4 pt-32 sm:pt-36 md:pt-40">
        {/* Subtle Background */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 -right-40 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-40 w-96 h-96 bg-secondary-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Back Link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 sm:mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </Link>

          {/* Main Card */}
          <div className="glass rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white/10">
            {/* Logo & Title */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-primary-500/20">
                <span className="text-white font-bold text-xl sm:text-2xl">AS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-400 text-sm sm:text-base">Sign in to continue your anime journey</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form 
              onSubmit={handleSubmit} 
              className="space-y-4 sm:space-y-5"
              suppressHydrationWarning
              data-testid="signin-form"
            >
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (formErrors.email) {
                        setFormErrors({ ...formErrors, email: undefined })
                      }
                    }}
                    className={`w-full pl-12 pr-4 py-3 sm:py-3.5 bg-white/5 border rounded-md rounded-input text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all text-base ${
                      formErrors.email ? 'border-red-500/50' : 'border-white/10'
                    }`}
                    placeholder="you@example.com"
                    suppressHydrationWarning
                    autoComplete="email"
                    data-testid="email-input"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-400">{formErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (formErrors.password) {
                        setFormErrors({ ...formErrors, password: undefined })
                      }
                    }}
                    className={`w-full pl-12 pr-12 py-3 sm:py-3.5 bg-white/5 border rounded-md rounded-input text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all text-base ${
                      formErrors.password ? 'border-red-500/50' : 'border-white/10'
                    }`}
                    placeholder="••••••••"
                    suppressHydrationWarning
                    autoComplete="current-password"
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-2 text-sm text-red-400">{formErrors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="h-3 w-3 md:h-4 md:w-4"
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-sm text-gray-300 cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors text-center sm:text-right"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-3 sm:py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/25 min-h-[48px] text-base"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <Link
                    href="/auth/signup"
                    className="text-primary-400 hover:text-primary-300 transition-colors font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Footer Note */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Track, discover, and share your favorite anime
          </p>
        </div>
      </div>
    </RequireGuest>
    </PageErrorBoundary>
  )
}
