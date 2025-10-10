'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { RequireGuest } from '../../../lib/protected-route'
import { useAuth } from '../../../lib/auth-context'
import { 
  Mail, 
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Sparkles
} from 'lucide-react'

interface VerifyEmailPageProps {
  params: Promise<{
    token: string
  }>
}

export default function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const [token, setToken] = useState<string>('')
  const { verifyEmail } = useAuth()

  useEffect(() => {
    params.then(({ token }) => setToken(token))
  }, [params])
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token) return

    const verifyEmailToken = async () => {
      try {
        setIsLoading(true)
        await verifyEmail(token)
        setIsSuccess(true)
      } catch (error: any) {
        setIsError(true)
        setErrorMessage(error.message || 'Verification failed. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    verifyEmailToken()
  }, [token, verifyEmail])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="max-w-md mx-auto px-4 relative z-10">
          <div className="glass rounded-2xl p-12 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary-400 animate-bounce" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verifying Your Email...</h1>
            <p className="text-gray-400">Please wait a moment while we confirm your email address.</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-error-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
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

            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-error-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                <AlertCircle className="h-10 w-10 text-error-400" />
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4">
                Verification Failed
              </h1>
              
              <p className="text-gray-300 mb-2 text-lg">
                {errorMessage}
              </p>
              
              <p className="text-gray-500 text-sm mb-8">
                This link may have expired or already been used. Please request a new verification email.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = '/auth/signin'}
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-4 text-lg"
                >
                  Back to Sign In
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/auth/signup'}
                  className="w-full border-white/20 text-white hover:bg-white/10 py-4"
                >
                  Create New Account
                </Button>
              </div>
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
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-success-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-success-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
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

            {/* Success Card */}
            <div className="glass rounded-2xl p-12 text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-success-500/20 rounded-2xl animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-success-400" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-warning-400 animate-pulse" />
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4">
                Email Verified! 🎉
              </h1>
              
              <p className="text-gray-300 mb-2 text-lg">
                Your email address has been successfully verified.
              </p>
              
              <p className="text-gray-500 text-sm mb-8">
                You now have full access to AnimeSenpai. Start discovering amazing anime!
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-semibold py-4 text-lg shadow-lg shadow-success-500/25"
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/auth/signin'}
                  className="w-full border-white/20 text-white hover:bg-white/10 py-4"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireGuest>
  )
}
