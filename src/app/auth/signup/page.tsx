'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Check, X, Loader2, AtSign } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import { useAuth } from '../../lib/auth-context'
import { useToast } from '../../../components/ui/toast'
import { RequireGuest } from '../../lib/protected-route'
import { apiCheckUsernameAvailability } from '../../lib/api'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>(
    'idle'
  )
  const { signup, isLoading, error, clearError } = useAuth()
  const toast = useToast()
  const router = useRouter()

  // Debounced username availability check
  useEffect(() => {
    if (!formData.username || formData.username.length < 2) {
      setUsernameStatus('idle')
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      setUsernameStatus('idle')
      setFormErrors((prev) => ({ ...prev, username: 'Only letters, numbers, _ and - allowed' }))
      return
    }

    setUsernameStatus('checking')
    const timeoutId = setTimeout(async () => {
      try {
        const result = (await apiCheckUsernameAvailability(formData.username)) as any
        setUsernameStatus(result.available ? 'available' : 'taken')
        if (!result.available) {
          setFormErrors((prev) => ({ ...prev, username: 'Username is already taken' }))
        } else {
          setFormErrors((prev) => ({ ...prev, username: undefined }))
        }
      } catch (error) {
        setUsernameStatus('idle')
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.username])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) clearError()
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
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(formData.password)
    ) {
      errors.password = 'Password must contain uppercase, lowercase, number, and special character'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match"
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
        marketingConsent: false,
      })
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Show success message with email verification reminder
      toast.success(
        `Check your email (${formData.email}) to verify your account!`,
        'Account Created! 🎉'
      )

      // Show secondary toast with next steps
      setTimeout(() => {
        toast.info(
          'You can start exploring anime now, but verify your email to unlock all features!',
          'Quick Tip'
        )
      }, 3000)

      router.push('/dashboard')
    } catch (err) {
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
    special: /[@$!%*?&]/.test(formData.password),
  }
  const isPasswordMatch =
    formData.password === formData.confirmPassword && formData.confirmPassword.length > 0

  return (
    <RequireGuest>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden flex items-center justify-center p-4 pt-20 sm:pt-32 pb-8">
        {/* Subtle Background */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 -right-40 w-96 h-96 bg-secondary-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-40 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg">
          {/* Back Link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 sm:mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </Link>

          {/* Main Card */}
          <div className="glass rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/10">
            {/* Logo & Title */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-secondary-400 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl shadow-secondary-500/20">
                <span className="text-white font-bold text-lg sm:text-xl">AS</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Create Account</h1>
              <p className="text-gray-400 text-sm">Join AnimeSenpai today</p>
            </div>

            {/* Error Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {formErrors.terms && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{formErrors.terms}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all text-base ${
                      formErrors.username
                        ? 'border-red-500/50'
                        : usernameStatus === 'available'
                          ? 'border-green-500/50'
                          : 'border-white/10'
                    }`}
                    placeholder="yourname"
                    suppressHydrationWarning
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {usernameStatus === 'checking' && (
                      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    )}
                    {usernameStatus === 'available' && <Check className="h-5 w-5 text-green-400" />}
                    {usernameStatus === 'taken' && <X className="h-5 w-5 text-red-400" />}
                  </div>
                </div>
                {formErrors.username && (
                  <p className="mt-2 text-sm text-red-400">{formErrors.username}</p>
                )}
                {usernameStatus === 'available' && !formErrors.username && (
                  <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Available
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all text-base ${
                      formErrors.email ? 'border-red-500/50' : 'border-white/10'
                    }`}
                    placeholder="you@example.com"
                    suppressHydrationWarning
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
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all text-base ${
                      formErrors.password ? 'border-red-500/50' : 'border-white/10'
                    }`}
                    placeholder="••••••••"
                    suppressHydrationWarning
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

                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-xs font-medium text-gray-400 mb-2">Password must contain:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        className={`flex items-center gap-1.5 text-xs ${passwordChecks.length ? 'text-green-400' : 'text-gray-400'}`}
                      >
                        {passwordChecks.length ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                        <span>8+ characters</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 text-xs ${passwordChecks.uppercase ? 'text-green-400' : 'text-gray-400'}`}
                      >
                        {passwordChecks.uppercase ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                        <span>Uppercase letter</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 text-xs ${passwordChecks.lowercase ? 'text-green-400' : 'text-gray-400'}`}
                      >
                        {passwordChecks.lowercase ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                        <span>Lowercase letter</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 text-xs ${passwordChecks.number ? 'text-green-400' : 'text-gray-400'}`}
                      >
                        {passwordChecks.number ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                        <span>Number</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 text-xs col-span-2 ${passwordChecks.special ? 'text-green-400' : 'text-gray-400'}`}
                      >
                        {passwordChecks.special ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                        <span>Special character (@$!%*?&)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all text-base ${
                      formErrors.confirmPassword
                        ? 'border-red-500/50'
                        : isPasswordMatch
                          ? 'border-green-500/50'
                          : 'border-white/10'
                    }`}
                    placeholder="••••••••"
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-400">{formErrors.confirmPassword}</p>
                )}

                {formData.confirmPassword && !formErrors.confirmPassword && (
                  <div
                    className={`mt-2 flex items-center gap-1.5 text-xs ${isPasswordMatch ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {isPasswordMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    <span>{isPasswordMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-2.5 pt-1">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                  className="h-3 w-3"
                />
                <label htmlFor="terms" className="text-xs text-gray-300 cursor-pointer select-none">
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-secondary-500 to-primary-500 hover:from-secondary-600 hover:to-primary-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-secondary-500/25 mt-4 min-h-[48px] text-base"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Sign In Link */}
              <div className="text-center pt-3">
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
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
            Track, discover, and share your favorite anime
          </p>
        </div>
      </div>
    </RequireGuest>
  )
}
