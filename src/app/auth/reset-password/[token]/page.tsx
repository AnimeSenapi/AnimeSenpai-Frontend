'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { RequireGuest } from '../../../lib/protected-route'
import { useAuth } from '../../../lib/auth-context'
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Check,
  X
} from 'lucide-react'

interface ResetPasswordPageProps {
  params: Promise<{
    token: string
  }>
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const [token, setToken] = useState<string>('')
  const { resetPassword } = useAuth()

  useEffect(() => {
    params.then(({ token }) => setToken(token))
  }, [params])
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(true)
  const [isValidToken, setIsValidToken] = useState<boolean>(false)

  // Validate token on mount
  useEffect(() => {
    if (!token) return

    const validateToken = async () => {
      setIsValidating(true)
      // For now, just check if token exists
      // In production, you'd validate with backend
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsValidToken(token.length > 10)
      setIsValidating(false)
    }
    
    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!isPasswordValid) {
      setError('Password must be at least 8 characters')
      return
    }
    
    if (!isPasswordMatch) {
      setError('Passwords do not match')
      return
    }
    
    try {
      setIsLoading(true)
      await resetPassword(token, password, confirmPassword)
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isPasswordValid = password.length >= 8
  const isPasswordMatch = password === confirmPassword && confirmPassword.length > 0
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const isPasswordStrong = isPasswordValid && hasUppercase && hasLowercase && hasNumber

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-md mx-auto px-4 relative z-10">
          <div className="glass rounded-2xl p-12 text-center">
            <Loader2 className="h-10 w-10 text-primary-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Validating reset link...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-error-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <Link 
                href="/auth/signin"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>

            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-error-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-error-400" />
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4">
                Invalid Reset Link
              </h1>
              
              <p className="text-gray-300 mb-2 text-lg">
                This password reset link is invalid or has expired.
              </p>
              
              <p className="text-gray-500 text-sm mb-8">
                Reset links expire after 1 hour for security. Please request a new one.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = '/auth/forgot-password'}
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-4 text-lg"
                >
                  Request New Reset Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/auth/signin'}
                  className="w-full border-white/20 text-white hover:bg-white/10 py-4"
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-success-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-success-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <Link 
                href="/auth/signin"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>

            <div className="glass rounded-2xl p-12 text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-success-500/20 rounded-2xl animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-success-400" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4">
                Password Reset! 🎉
              </h1>
              
              <p className="text-gray-300 mb-2 text-lg">
                Your password has been successfully updated.
              </p>
              
              <p className="text-gray-500 text-sm mb-8">
                You can now sign in with your new password.
              </p>

              <Button
                onClick={() => window.location.href = '/auth/signin'}
                className="w-full bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-semibold py-4 text-lg shadow-lg shadow-success-500/25"
              >
                Sign In Now
              </Button>
            </div>
          </div>
        </div>
      </div>
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

            {/* Reset Password Card */}
            <div className="glass rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-primary-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Reset Your Password
                </h1>
                <p className="text-gray-400">
                  Choose a strong new password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-error-500/10 border border-error-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-error-400 flex-shrink-0 mt-0.5" />
                    <p className="text-error-400 text-sm flex-1">{error}</p>
                  </div>
                )}

                {/* New Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        password && !isPasswordValid 
                          ? 'border-error-500/50 focus:ring-error-400/50' 
                          : 'border-white/10 focus:ring-primary-400/50'
                      }`}
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        {isPasswordValid ? (
                          <Check className="h-3 w-3 text-success-400" />
                        ) : (
                          <X className="h-3 w-3 text-error-400" />
                        )}
                        <span className={isPasswordValid ? 'text-success-400' : 'text-gray-400'}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {hasUppercase ? (
                          <Check className="h-3 w-3 text-success-400" />
                        ) : (
                          <X className="h-3 w-3 text-gray-600" />
                        )}
                        <span className={hasUppercase ? 'text-success-400' : 'text-gray-400'}>
                          Contains uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {hasNumber ? (
                          <Check className="h-3 w-3 text-success-400" />
                        ) : (
                          <X className="h-3 w-3 text-gray-600" />
                        )}
                        <span className={hasNumber ? 'text-success-400' : 'text-gray-400'}>
                          Contains number
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        confirmPassword && !isPasswordMatch 
                          ? 'border-error-500/50 focus:ring-error-400/50' 
                          : confirmPassword && isPasswordMatch
                          ? 'border-success-500/50 focus:ring-success-400/50'
                          : 'border-white/10 focus:ring-primary-400/50'
                      }`}
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {confirmPassword && !isPasswordMatch && (
                    <p className="text-error-400 text-sm mt-2 flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Passwords do not match
                    </p>
                  )}
                  {confirmPassword && isPasswordMatch && (
                    <p className="text-success-400 text-sm mt-2 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Passwords match!
                    </p>
                  )}
                </div>

                {/* Password Strength Bar */}
                {password && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Password Strength:</span>
                      <span className={`text-sm font-semibold ${
                        isPasswordStrong ? 'text-success-400' : isPasswordValid ? 'text-warning-400' : 'text-error-400'
                      }`}>
                        {isPasswordStrong ? 'Strong' : isPasswordValid ? 'Medium' : 'Weak'}
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          isPasswordStrong 
                            ? 'bg-gradient-to-r from-success-500 to-success-400 w-full' 
                            : isPasswordValid 
                            ? 'bg-gradient-to-r from-warning-500 to-warning-400 w-2/3' 
                            : 'bg-gradient-to-r from-error-500 to-error-400 w-1/3'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !isPasswordValid || !isPasswordMatch}
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-4 text-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      Reset Password
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
