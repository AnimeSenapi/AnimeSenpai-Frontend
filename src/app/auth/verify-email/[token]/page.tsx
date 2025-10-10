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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 -right-40 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-40 w-96 h-96 bg-secondary-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-50 w-full max-w-md">
          <div className="glass rounded-3xl p-12 text-center shadow-2xl border border-white/10">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-white animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verifying Email...</h1>
            <p className="text-gray-400">Please wait while we confirm your email address</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 -right-40 w-96 h-96 bg-red-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-40 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-50 w-full max-w-md">
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
              Verification Failed
            </h1>
            
            <p className="text-gray-300 mb-2">
              {errorMessage}
            </p>
            
            <p className="text-gray-500 text-sm mb-8">
              This link may have expired or already been used
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = '/auth/signin'}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-3.5 shadow-lg shadow-primary-500/25"
              >
                Back to Sign In
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/auth/signup'}
                className="w-full border-white/20 text-white hover:bg-white/10 py-3.5"
              >
                Create New Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <RequireGuest>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 -right-40 w-96 h-96 bg-green-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-40 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-50 w-full max-w-md">
          <Link 
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </Link>

          {/* Success Card */}
          <div className="glass rounded-3xl p-12 text-center shadow-2xl border border-white/10">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-3">
              Email Verified! 🎉
            </h1>
            
            <p className="text-gray-300 mb-2">
              Your email address has been successfully verified
            </p>
            
            <p className="text-gray-500 text-sm mb-8">
              You now have full access to AnimeSenpai
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3.5 shadow-lg shadow-green-500/25"
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/auth/signin'}
                className="w-full border-white/20 text-white hover:bg-white/10 py-3.5"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </RequireGuest>
  )
}
