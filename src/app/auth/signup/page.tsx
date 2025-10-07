'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, Check, X } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import { useAuth } from '../../lib/auth-context'
import { RequireGuest } from '../../lib/protected-route'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [formErrors, setFormErrors] = useState<{ 
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
    terms?: string
  }>({})
  const { signup, isLoading, error, clearError } = useAuth()
  const router = useRouter()

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
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
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
        firstName: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        gdprConsent: true,
        dataProcessingConsent: true,
        marketingConsent: false
      })
      // Wait a bit longer to ensure user state is properly set
      await new Promise(resolve => setTimeout(resolve, 100))
      router.push('/dashboard')
    } catch (err) {
      // Error is handled by the auth context
    }
  }

  // Password validation checks
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  }
  const isPasswordValid = Object.values(passwordChecks).every(Boolean)
  const isPasswordMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
  const isFormValid = formData.name && formData.email && isPasswordValid && isPasswordMatch && agreeToTerms

  return (
    <RequireGuest>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
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

            {/* Sign Up Form */}
            <div className="glass rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">AS</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Join AnimeSenpai</h1>
                <p className="text-gray-400">Create your account to get started</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-error-500/10 border border-error-500/20 rounded-xl flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-error-500/20 flex items-center justify-center mt-0.5">
                    <span className="text-error-400 text-xs font-bold">!</span>
                  </div>
                  <p className="text-error-400 text-sm flex-1">{error}</p>
                </div>
              )}

              {formErrors.terms && (
                <div className="mb-6 p-4 bg-error-500/10 border border-error-500/20 rounded-xl flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-error-500/20 flex items-center justify-center mt-0.5">
                    <span className="text-error-400 text-xs font-bold">!</span>
                  </div>
                  <p className="text-error-400 text-sm flex-1">{formErrors.terms}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        formErrors.name 
                          ? 'border-error-500/50 focus:ring-error-400' 
                          : 'border-white/10 focus:ring-brand-primary-400'
                      }`}
                      placeholder="Enter your full name"
                      suppressHydrationWarning
                    />
                  </div>
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-error-400">{formErrors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
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
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        formErrors.password 
                          ? 'border-error-500/50 focus:ring-error-400' 
                          : 'border-white/10 focus:ring-brand-primary-400'
                      }`}
                      placeholder="Create a strong password"
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
                  
                  {/* Password Requirements */}
                  {formData.password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        {passwordChecks.length ? <Check className="h-3 w-3 text-success-400" /> : <X className="h-3 w-3 text-error-400" />}
                        <span className={passwordChecks.length ? 'text-success-400' : 'text-error-400'}>At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordChecks.uppercase ? <Check className="h-3 w-3 text-success-400" /> : <X className="h-3 w-3 text-error-400" />}
                        <span className={passwordChecks.uppercase ? 'text-success-400' : 'text-error-400'}>One uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordChecks.lowercase ? <Check className="h-3 w-3 text-success-400" /> : <X className="h-3 w-3 text-error-400" />}
                        <span className={passwordChecks.lowercase ? 'text-success-400' : 'text-error-400'}>One lowercase letter</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordChecks.number ? <Check className="h-3 w-3 text-success-400" /> : <X className="h-3 w-3 text-error-400" />}
                        <span className={passwordChecks.number ? 'text-success-400' : 'text-error-400'}>One number</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordChecks.special ? <Check className="h-3 w-3 text-success-400" /> : <X className="h-3 w-3 text-error-400" />}
                        <span className={passwordChecks.special ? 'text-success-400' : 'text-error-400'}>One special character</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        formErrors.confirmPassword 
                          ? 'border-error-500/50 focus:ring-error-400' 
                          : 'border-white/10 focus:ring-brand-primary-400'
                      }`}
                      placeholder="Confirm your password"
                      suppressHydrationWarning
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-error-400">{formErrors.confirmPassword}</p>
                  )}
                  
                  {/* Password Match Indicator */}
                  {formData.confirmPassword && !formErrors.confirmPassword && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      {isPasswordMatch ? <Check className="h-3 w-3 text-success-400" /> : <X className="h-3 w-3 text-error-400" />}
                      <span className={isPasswordMatch ? 'text-success-400' : 'text-error-400'}>
                        {isPasswordMatch ? 'Passwords match' : 'Passwords do not match'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary-400 hover:text-primary-400 transition-colors">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-primary-400 hover:text-primary-400 transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Sign Up Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className="w-full bg-gradient-to-r from-primary-400 to-secondary-400 hover:from-primary-500 hover:to-secondary-500 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>

                {/* Sign In Link */}
                <div className="text-center">
                  <p className="text-gray-400">
                    Already have an account?{' '}
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