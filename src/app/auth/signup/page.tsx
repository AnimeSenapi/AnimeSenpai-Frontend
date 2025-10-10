'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Check, X, Loader2, AtSign, Sparkles, Shield, Zap } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import { useAuth } from '../../lib/auth-context'
import { useToast } from '../../../lib/toast-context'
import { RequireGuest } from '../../lib/protected-route'
import { apiCheckUsernameAvailability } from '../../lib/api'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [formErrors, setFormErrors] = useState<{ 
    username?: string
    email?: string
    password?: string
    confirmPassword?: string
    terms?: string
  }>({})
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const { signup, isLoading, error, clearError } = useAuth()
  const toast = useToast()
  const router = useRouter()

  // Debounced username availability check
  useEffect(() => {
    if (!formData.username || formData.username.length < 2) {
      setUsernameStatus('idle')
      return
    }

    // Check format first
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      setUsernameStatus('idle')
      setFormErrors(prev => ({ ...prev, username: 'Only letters, numbers, _ and - allowed' }))
      return
    }

    setUsernameStatus('checking')
    const timeoutId = setTimeout(async () => {
      try {
        const result = await apiCheckUsernameAvailability(formData.username)
        setUsernameStatus(result.available ? 'available' : 'taken')
        if (!result.available) {
          setFormErrors(prev => ({ ...prev, username: 'Username is already taken' }))
        } else {
          setFormErrors(prev => ({ ...prev, username: undefined }))
        }
      } catch (error) {
        setUsernameStatus('idle')
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [formData.username])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) clearError()
    // Clear specific field error
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({ ...formErrors, [name]: undefined })
    }
  }

  const validateForm = () => {
    const errors: typeof formErrors = {}

    if (!formData.username.trim()) {
      errors.username = 'Username is required'
    } else if (formData.username.trim().length < 2) {
      errors.username = 'Username must be at least 2 characters'
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, underscores, and hyphens'
    } else if (usernameStatus === 'taken') {
      errors.username = 'This username is already taken'
    }
    
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and numbers'
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords don\'t match'
    }
    
    if (!agreeToTerms) {
      errors.terms = 'You must agree to the terms and privacy policy'
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
      await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        gdprConsent: true,
        dataProcessingConsent: true,
        marketingConsent: false
      })
      // Wait a bit longer to ensure user state is properly set
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // New users should go through onboarding
      toast.success('Account created! Let\'s get you started.', 'Welcome to AnimeSenpai')
      router.push('/onboarding')
    } catch (err) {
      // Error is handled by the auth context
      if (error) {
        toast.error(error, 'Sign Up Failed')
      }
    }
  }

  // Password validation checks
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
  }
  const isPasswordValid = passwordChecks.length && passwordChecks.uppercase && passwordChecks.lowercase && passwordChecks.number
  const isPasswordMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0

  return (
    <RequireGuest>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute -top-1/2 -right-1/3 w-[800px] h-[800px] bg-secondary-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/3 -left-1/4 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-secondary-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
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
          {/* Left Side - Branding & Benefits (Hidden on mobile) */}
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
                <div className="w-20 h-20 bg-gradient-to-br from-secondary-400 via-secondary-500 to-primary-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-secondary-500/30 animate-float">
                  <span className="text-white font-bold text-3xl">AS</span>
                </div>
                <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                  Start Your<br />
                  <span className="bg-gradient-to-r from-secondary-400 to-primary-400 bg-clip-text text-transparent">
                    Anime Journey
                  </span>
                </h1>
                <p className="text-xl text-gray-400">
                  Join thousands of anime fans and discover your next favorite series
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-6">
                <div className="flex items-start gap-4 group cursor-default">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 rounded-xl flex items-center justify-center border border-secondary-500/20 group-hover:border-secondary-500/40 transition-all">
                    <Sparkles className="h-6 w-6 text-secondary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Personalized For You</h3>
                    <p className="text-gray-400 text-sm">Get recommendations tailored to your unique taste</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group cursor-default">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl flex items-center justify-center border border-primary-500/20 group-hover:border-primary-500/40 transition-all">
                    <Zap className="h-6 w-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Track Everything</h3>
                    <p className="text-gray-400 text-sm">Manage your watchlist and progress effortlessly</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group cursor-default">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-secondary-500/20 to-primary-500/20 rounded-xl flex items-center justify-center border border-secondary-500/20 group-hover:border-secondary-500/40 transition-all">
                    <Shield className="h-6 w-6 text-secondary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Privacy First</h3>
                    <p className="text-gray-400 text-sm">Your data is secure and never shared</p>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="pt-8 border-t border-white/10">
                <p className="text-gray-400 text-sm mb-4">Trusted by anime fans worldwide</p>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 border-2 border-gray-900"></div>
                    ))}
                  </div>
                  <span className="text-white font-semibold">50,000+ members</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Sign Up Form */}
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
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary-400 to-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-secondary-500/30">
                    <span className="text-white font-bold text-2xl">AS</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">Join AnimeSenpai</h1>
                  <p className="text-gray-400">Create your free account</p>
                </div>

                {/* Desktop Title */}
                <div className="hidden lg:block text-center mb-10">
                  <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                  <p className="text-gray-400">Let's get you started</p>
                </div>

                {/* Error Messages */}
                {error && (
                  <div className="mb-6 p-4 bg-error-500/10 border border-error-500/30 rounded-2xl flex items-start gap-3 animate-shake">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-error-500/20 flex items-center justify-center mt-0.5">
                      <span className="text-error-400 text-sm font-bold">!</span>
                    </div>
                    <p className="text-error-400 text-sm flex-1">{error}</p>
                  </div>
                )}

                {formErrors.terms && (
                  <div className="mb-6 p-4 bg-error-500/10 border border-error-500/30 rounded-2xl flex items-start gap-3 animate-shake">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-error-500/20 flex items-center justify-center mt-0.5">
                      <span className="text-error-400 text-sm font-bold">!</span>
                    </div>
                    <p className="text-error-400 text-sm flex-1">{formErrors.terms}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                      Username
                    </label>
                    <div className="relative group">
                      <AtSign className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${
                        focusedField === 'username' ? 'text-primary-400' : 'text-gray-400'
                      }`} />
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onFocus={() => setFocusedField('username')}
                        onBlur={() => setFocusedField(null)}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-12 py-4 bg-white/5 border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                          formErrors.username 
                            ? 'border-error-500/50 focus:ring-error-400/50' 
                            : usernameStatus === 'available'
                            ? 'border-success-500/50 focus:ring-success-400/50 focus:bg-white/10'
                            : 'border-white/10 focus:ring-primary-400/50 focus:bg-white/10'
                        }`}
                        placeholder="Choose a cool username"
                        suppressHydrationWarning
                      />
                      {/* Status Indicator */}
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        {usernameStatus === 'checking' && (
                          <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                        )}
                        {usernameStatus === 'available' && (
                          <Check className="h-5 w-5 text-success-400" />
                        )}
                        {usernameStatus === 'taken' && (
                          <X className="h-5 w-5 text-error-400" />
                        )}
                      </div>
                    </div>
                    {formErrors.username && (
                      <p className="text-sm text-error-400 animate-fadeIn">{formErrors.username}</p>
                    )}
                    {usernameStatus === 'available' && !formErrors.username && (
                      <p className="text-sm text-success-400 animate-fadeIn flex items-center gap-1">
                        <Check className="h-3 w-3" /> Username is available!
                      </p>
                    )}
                  </div>

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
                        name="email"
                        type="email"
                        value={formData.email}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        onChange={handleInputChange}
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
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-14 py-4 bg-white/5 border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                          formErrors.password 
                            ? 'border-error-500/50 focus:ring-error-400/50' 
                            : 'border-white/10 focus:ring-primary-400/50 focus:bg-white/10'
                        }`}
                        placeholder="Create a strong password"
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
                    
                    {/* Password Requirements */}
                    {formData.password && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className={`flex items-center gap-2 text-xs ${passwordChecks.length ? 'text-success-400' : 'text-gray-500'}`}>
                          {passwordChecks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          <span>8+ characters</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${passwordChecks.uppercase ? 'text-success-400' : 'text-gray-500'}`}>
                          {passwordChecks.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          <span>Uppercase</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${passwordChecks.lowercase ? 'text-success-400' : 'text-gray-500'}`}>
                          {passwordChecks.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          <span>Lowercase</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${passwordChecks.number ? 'text-success-400' : 'text-gray-500'}`}>
                          {passwordChecks.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          <span>Number</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${
                        focusedField === 'confirmPassword' ? 'text-primary-400' : 'text-gray-400'
                      }`} />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-14 py-4 bg-white/5 border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                          formErrors.confirmPassword 
                            ? 'border-error-500/50 focus:ring-error-400/50' 
                            : isPasswordMatch
                            ? 'border-success-500/50 focus:ring-success-400/50'
                            : 'border-white/10 focus:ring-primary-400/50 focus:bg-white/10'
                        }`}
                        placeholder="Confirm your password"
                        suppressHydrationWarning
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-sm text-error-400 animate-fadeIn">{formErrors.confirmPassword}</p>
                    )}
                    
                    {/* Password Match Indicator */}
                    {formData.confirmPassword && !formErrors.confirmPassword && (
                      <div className={`flex items-center gap-2 text-xs animate-fadeIn ${isPasswordMatch ? 'text-success-400' : 'text-error-400'}`}>
                        {isPasswordMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        <span>{isPasswordMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                      </div>
                    )}
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex items-start gap-3 py-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                      className="mt-0.5"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer select-none hover:text-white transition-colors">
                      I agree to the{' '}
                      <Link href="/terms" className="text-primary-400 hover:text-primary-300 transition-colors font-medium">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-primary-400 hover:text-primary-300 transition-colors font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Sign Up Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-secondary-500 via-secondary-400 to-primary-500 hover:from-secondary-600 hover:via-secondary-500 hover:to-primary-600 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-secondary-500/30 hover:shadow-xl hover:shadow-secondary-500/40"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating Account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gray-900/50 text-gray-400">Already have an account?</span>
                    </div>
                  </div>

                  {/* Sign In Link */}
                  <div className="text-center">
                    <Link 
                      href="/auth/signin"
                      className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors font-medium group"
                    >
                      Sign in instead
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
