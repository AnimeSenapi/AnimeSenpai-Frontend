'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles, TrendingUp, Users, Heart } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import { useAuth } from '../../lib/auth-context'
import { useToast } from '../../../lib/toast-context'
import { RequireGuest } from '../../lib/protected-route'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({})
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const { signin, isLoading, error, clearError } = useAuth()
  const toast = useToast()
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
      
      toast.success('Welcome back!', 'Signed In')
      router.push('/dashboard')
    } catch (err) {
      // Error is handled by the auth context and shown in UI
      if (error) {
        toast.error(error, 'Sign In Failed')
      }
    }
  }

  return (
    <RequireGuest>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute -top-1/2 -right-1/3 w-[800px] h-[800px] bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/3 -left-1/4 w-[600px] h-[600px] bg-secondary-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] bg-primary-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 min-h-screen flex">
          {/* Left Side - Branding & Features (Hidden on mobile) */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-16 group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>

            <div className="space-y-8 max-w-lg">
              {/* Logo & Title */}
              <div>
                <div className="w-20 h-20 bg-gradient-to-br from-primary-400 via-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-primary-500/30 animate-float">
                  <span className="text-white font-bold text-3xl">AS</span>
                </div>
                <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                  Welcome Back to<br />
                  <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                    AnimeSenpai
                  </span>
                </h1>
                <p className="text-xl text-gray-400">
                  Your personalized anime companion awaits
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-6">
                <div className="flex items-start gap-4 group cursor-default">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl flex items-center justify-center border border-primary-500/20 group-hover:border-primary-500/40 transition-all">
                    <Sparkles className="h-6 w-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Personalized Recommendations</h3>
                    <p className="text-gray-400 text-sm">AI-powered suggestions based on your taste</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group cursor-default">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 rounded-xl flex items-center justify-center border border-secondary-500/20 group-hover:border-secondary-500/40 transition-all">
                    <TrendingUp className="h-6 w-6 text-secondary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Track Your Progress</h3>
                    <p className="text-gray-400 text-sm">Never lose track of where you left off</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group cursor-default">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center border border-primary-500/20 group-hover:border-primary-500/40 transition-all">
                    <Users className="h-6 w-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Connect with Fans</h3>
                    <p className="text-gray-400 text-sm">Join a community of passionate anime lovers</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-8 border-t border-white/10">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">10K+</div>
                  <div className="text-sm text-gray-400">Anime Titles</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">50K+</div>
                  <div className="text-sm text-gray-400">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">1M+</div>
                  <div className="text-sm text-gray-400">Reviews</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Sign In Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
              {/* Mobile Back Button */}
              <div className="lg:hidden mb-8">
                <Link 
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back to Home
                </Link>
              </div>

              {/* Form Card */}
              <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl border border-white/10 backdrop-blur-xl">
                {/* Mobile Logo */}
                <div className="lg:hidden text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/30">
                    <span className="text-white font-bold text-2xl">AS</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
                  <p className="text-gray-400">Sign in to continue your journey</p>
                </div>

                {/* Desktop Title */}
                <div className="hidden lg:block text-center mb-10">
                  <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                  <p className="text-gray-400">Welcome back, Senpai!</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-error-500/10 border border-error-500/30 rounded-2xl flex items-start gap-3 animate-shake">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-error-500/20 flex items-center justify-center mt-0.5">
                      <span className="text-error-400 text-sm font-bold">!</span>
                    </div>
                    <p className="text-error-400 text-sm flex-1">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${
                        focusedField === 'email' ? 'text-primary-400' : 'text-gray-400'
                      }`} />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          if (formErrors.email) {
                            setFormErrors({ ...formErrors, email: undefined })
                          }
                        }}
                        className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                          formErrors.email 
                            ? 'border-error-500/50 focus:ring-error-400/50' 
                            : 'border-white/10 focus:ring-primary-400/50 focus:bg-white/10'
                        }`}
                        placeholder="you@example.com"
                        suppressHydrationWarning
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-sm text-error-400 animate-fadeIn">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${
                        focusedField === 'password' ? 'text-primary-400' : 'text-gray-400'
                      }`} />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (formErrors.password) {
                            setFormErrors({ ...formErrors, password: undefined })
                          }
                        }}
                        className={`w-full pl-12 pr-14 py-4 bg-white/5 border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                          formErrors.password 
                            ? 'border-error-500/50 focus:ring-error-400/50' 
                            : 'border-white/10 focus:ring-primary-400/50 focus:bg-white/10'
                        }`}
                        placeholder="••••••••"
                        suppressHydrationWarning
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="text-sm text-error-400 animate-fadeIn">{formErrors.password}</p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                      />
                      <label
                        htmlFor="remember-me"
                        className="text-sm text-gray-300 cursor-pointer select-none hover:text-white transition-colors"
                      >
                        Remember me
                      </label>
                    </div>
                    <Link 
                      href="/auth/forgot-password"
                      className="text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Sign In Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary-500 via-primary-400 to-secondary-500 hover:from-primary-600 hover:via-primary-500 hover:to-secondary-600 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing In...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gray-900/50 text-gray-400">New to AnimeSenpai?</span>
                    </div>
                  </div>

                  {/* Sign Up Link */}
                  <div className="text-center">
                    <Link 
                      href="/auth/signup"
                      className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors font-medium group"
                    >
                      Create your account
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireGuest>
  )
}
