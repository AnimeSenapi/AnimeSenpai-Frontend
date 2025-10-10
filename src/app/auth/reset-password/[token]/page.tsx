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

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 -right-40 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-40 w-96 h-96 bg-secondary-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="glass rounded-3xl p-12 text-center shadow-2xl border border-white/10">
            <Loader2 className="h-10 w-10 text-primary-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Validating reset link...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 -right-40 w-96 h-96 bg-red-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-40 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <Link 
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </Link>

          <div className="glass rounded-3xl p-12 text-center shadow-2xl border border-white/10">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-3">
              Invalid Reset Link
            </h1>
            
            <p className="text-gray-300 mb-2">
              This password reset link is invalid or has expired
            </p>
            
            <p className="text-gray-500 text-sm mb-8">
              Reset links expire after 1 hour for security
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = '/auth/forgot-password'}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-3.5 shadow-lg shadow-primary-500/25"
              >
                Request New Reset Link
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/auth/signin'}
                className="w-full border-white/20 text-white hover:bg-white/10 py-3.5"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 -right-40 w-96 h-96 bg-green-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-40 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <Link 
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </Link>

          <div className="glass rounded-3xl p-12 text-center shadow-2xl border border-white/10">
            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-3">
              Password Reset! 🎉
            </h1>
            
            <p className="text-gray-300 mb-2">
              Your password has been successfully updated
            </p>
            
            <p className="text-gray-500 text-sm mb-8">
              You can now sign in with your new password
            </p>

            <Button
              onClick={() => window.location.href = '/auth/signin'}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3.5 shadow-lg shadow-green-500/25"
            >
              Sign In Now
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <RequireGuest>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 -right-40 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-40 w-96 h-96 bg-secondary-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <Link 
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </Link>

          {/* Reset Password Card */}
          <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl border border-white/10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="h-8 w-8 text-primary-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Reset Password
              </h1>
              <p className="text-gray-400">
                Choose a strong new password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* New Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-12 pr-12 py-3.5 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                      password && !isPasswordValid 
                        ? 'border-red-500/50 focus:ring-red-400/50' 
                        : 'border-white/10 focus:ring-primary-500/50'
                    }`}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {password && (
                  <div className="mt-3 space-y-1.5">
                    <div className={`flex items-center gap-2 text-xs ${isPasswordValid ? 'text-green-400' : 'text-gray-400'}`}>
                      {isPasswordValid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${hasUppercase ? 'text-green-400' : 'text-gray-400'}`}>
                      {hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Contains uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${hasNumber ? 'text-green-400' : 'text-gray-400'}`}>
                      {hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>Contains number</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-12 pr-12 py-3.5 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                      confirmPassword && !isPasswordMatch 
                        ? 'border-red-500/50 focus:ring-red-400/50' 
                        : confirmPassword && isPasswordMatch
                        ? 'border-green-500/50 focus:ring-green-400/50'
                        : 'border-white/10 focus:ring-primary-500/50'
                    }`}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword && !isPasswordMatch && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && isPasswordMatch && (
                  <p className="text-green-400 text-sm mt-2 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Passwords match!
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !isPasswordValid || !isPasswordMatch}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-3.5 disabled:opacity-50 shadow-lg shadow-primary-500/25"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Updating Password...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Shield className="h-5 w-5" />
                    Reset Password
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
        </div>
      </div>
    </RequireGuest>
  )
}
