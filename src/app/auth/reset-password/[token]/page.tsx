'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { RequireGuest } from '../../../lib/protected-route'
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ResetPasswordPageProps {
  params: Promise<{
    token: string
  }>
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    params.then(({ token }) => setToken(token))
  }, [params])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  // Simulate token validation
  useEffect(() => {
    const validateToken = async () => {
      // Simulate API call to validate token
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, assume token is valid if it's not empty
      setIsValidToken(!!(token && token.length > 0))
    }
    
    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSuccess(true)
    setIsLoading(false)
  }

  const isPasswordValid = password.length >= 8
  const isPasswordMatch = password === confirmPassword && confirmPassword.length > 0
  const isFormValid = isPasswordValid && isPasswordMatch

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-md mx-auto">
            <div className="glass rounded-2xl p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-brand-primary-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-300">Validating reset token...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
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

          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-error-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-error-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Invalid Reset Link
            </h1>
            
            <p className="text-gray-300 mb-8">
              This password reset link is invalid or has expired. Please request a new one.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = '/auth/forgot-password'}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-brand-primary-500/25"
              >
                Request New Reset Link
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/auth/signin'}
                className="w-full border-white/20 text-white hover:bg-white/10"
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

          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-success-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-success-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Password Reset Successfully!
            </h1>
            
            <p className="text-gray-300 mb-8">
              Your password has been updated. You can now sign in with your new password.
            </p>

            <Button
              onClick={() => window.location.href = '/auth/signin'}
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-brand-primary-500/25"
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
              className="inline-flex items-center text-gray-300 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Link>
          </div>

          {/* Reset Password Card */}
          <div className="glass rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-primary-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Reset Your Password
              </h1>
              <p className="text-gray-300">
                Enter your new password below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary-400/50 focus:border-transparent transition-all duration-200"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {password && !isPasswordValid && (
                  <p className="text-error-400 text-sm mt-1">Password must be at least 8 characters</p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary-400/50 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword && !isPasswordMatch && (
                  <p className="text-error-400 text-sm mt-1">Passwords do not match</p>
                )}
                {confirmPassword && isPasswordMatch && (
                  <p className="text-success-400 text-sm mt-1">Passwords match</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-brand-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </form>
          </div>
        </div>
      </div>
      </div>
    </RequireGuest>
  )
}
