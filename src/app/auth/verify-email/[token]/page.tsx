'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { RequireGuest } from '../../../lib/protected-route'
import { 
  Mail, 
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'

interface VerifyEmailPageProps {
  params: Promise<{
    token: string
  }>
}

export default function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    params.then(({ token }) => setToken(token))
  }, [params])
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Simulate email verification
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Simulate API call to verify email
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // For demo purposes, assume token is valid if it's not empty
        if (token && token.length > 0) {
          setIsSuccess(true)
        } else {
          setIsError(true)
          setErrorMessage('Invalid verification token')
        }
      } catch (error) {
        setIsError(true)
        setErrorMessage('Verification failed. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    verifyEmail()
  }, [token])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-md mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h1 className="text-xl font-bold text-white mb-2">Verifying Email...</h1>
              <p className="text-gray-300">Please wait while we verify your email address.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden">
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

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-4">
                Verification Failed
              </h1>
              
              <p className="text-gray-300 mb-8">
                {errorMessage || 'This verification link is invalid or has expired.'}
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = '/auth/signin'}
                  className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/25"
                >
                  Back to Sign In
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/auth/signup'}
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Sign Up Again
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
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
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

          {/* Success Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Email Verified Successfully!
            </h1>
            
            <p className="text-gray-300 mb-8">
              Your email address has been verified. You can now access all features of AnimeSenpai.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/25"
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/auth/signin'}
                className="w-full border-white/20 text-white hover:bg-white/10"
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
