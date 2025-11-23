/**
 * Two-Factor Authentication Verification Page
 *
 * Users enter their 2FA code after providing email/password
 */

'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Button } from '@/components/ui/button'
import { apiVerify2FALogin, apiSend2FALoginCode } from '@/app/lib/api'
import { Shield, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function Verify2FAPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    if (!email) {
      setError('Email not found')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await apiVerify2FALogin({
        email,
        code,
      })

      // Store user ID for session creation
      if (result.userId) {
        // Redirect to complete login
        router.push(`/auth/signin?2fa=verified&userId=${result.userId}`)
      }
    } catch (error: any) {
      setError(error.message || 'Invalid code. Please try again.')
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return

    try {
      setResending(true)
      setError(null)
      await apiSend2FALoginCode({ email })
      setError('Code resent! Check your email.')
    } catch (error: any) {
      setError(error.message || 'Failed to resend code')
    } finally {
      setResending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerify()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden flex items-center justify-center p-4 pt-20 sm:pt-32">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Back Button */}
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>

        {/* Main Card */}
        <div className="glass rounded-xl p-6 sm:p-8 space-y-4 sm:space-y-6">
          {/* Icon */}
          <div className="text-center">
            <div className="bg-primary-500/10 rounded-full p-3 sm:p-4 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4">
              <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-primary-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Two-Factor Authentication</h1>
            <p className="text-gray-400 text-sm sm:text-base">Enter the 6-digit code sent to</p>
            <p className="text-white font-medium mt-1 text-sm sm:text-base">{email}</p>
          </div>

          {/* Code Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3 text-center">
                Verification Code
              </label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={(value) => setCode(value)}
                  onKeyDown={handleKeyDown}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {error && (
              <div
                className={`rounded-lg p-3 text-sm ${
                  error.includes('resent')
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {error}
              </div>
            )}

            <Button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="w-full min-h-[48px] text-base"
              size="lg"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-400">
                <p className="text-white font-medium mb-1">Didn't receive the code?</p>
                <p>Check your spam folder or click "Resend Code" to send a new one.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
