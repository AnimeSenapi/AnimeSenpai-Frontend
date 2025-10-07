'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import { useAuth } from '../../lib/auth-context'
import { RequireGuest } from '../../lib/protected-route'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({})
  const { signin, isLoading, error, clearError } = useAuth()
  const router = useRouter()

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
      
      // Wait a bit longer to ensure user state is properly set
      await new Promise(resolve => setTimeout(resolve, 100))
      
      router.push('/dashboard')
    } catch (err) {
      // Error is handled by the auth context
    }
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

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <div className="mb-8">
              <Link 
                href="/dashboard"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>

            {/* Sign In Form */}
            <div className="glass rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">AS</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-gray-400">Sign in to your AnimeSenpai account</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-error-500/10 border border-error-500/20 rounded-xl flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-error-500/20 flex items-center justify-center mt-0.5">
                    <span className="text-error-400 text-xs font-bold">!</span>
                  </div>
                  <p className="text-error-400 text-sm flex-1">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                      className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        formErrors.email 
                          ? 'border-error-500/50 focus:ring-error-400' 
                          : 'border-white/10 focus:ring-brand-primary-400'
                      }`}
                      placeholder="Enter your email"
                      suppressHydrationWarning
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-error-400">{formErrors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                      className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        formErrors.password 
                          ? 'border-error-500/50 focus:ring-error-400' 
                          : 'border-white/10 focus:ring-brand-primary-400'
                      }`}
                      placeholder="Enter your password"
                      suppressHydrationWarning
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-error-400">{formErrors.password}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <label
                      htmlFor="remember-me"
                      className="text-sm text-gray-300 cursor-pointer"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link 
                    href="/auth/forgot-password"
                    className="text-sm text-primary-400 hover:text-primary-400 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary-400 to-secondary-400 hover:from-primary-500 hover:to-secondary-500 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>

                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="text-gray-400">
                    Don&apos;t have an account?{' '}
                    <Link 
                      href="/auth/signup"
                      className="text-primary-400 hover:text-primary-400 transition-colors font-medium"
                    >
                      Sign up
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