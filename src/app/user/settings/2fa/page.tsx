/**
 * Two-Factor Authentication Setup Page
 *
 * Allows users to enable/disable 2FA with email verification
 */

'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/loading-state'
import { useAuth } from '@/app/lib/auth-context'
import { apiGet2FAStatus, apiEnable2FA, apiVerify2FASetup, apiDisable2FA } from '@/app/lib/api'
import { Shield, Mail, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TwoFactorAuthPage() {
  const { user } = useAuth()
  const [step, setStep] = useState<'status' | 'enable' | 'verify' | 'disable'>('status')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [password, setPassword] = useState('')

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      setLoading(true)
      const result = await apiGet2FAStatus()
      setEnabled(result.enabled)
      setStep('status')
    } catch (error) {
      console.error('Failed to check 2FA status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnable = async () => {
    try {
      setLoading(true)
      setError(null)
      await apiEnable2FA()
      setStep('verify')
    } catch (error: any) {
      setError(error.message || 'Failed to enable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await apiVerify2FASetup({ code })
      setEnabled(true)
      setStep('status')
      setCode('')
    } catch (error: any) {
      setError(error.message || 'Invalid code')
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    if (!password) {
      setError('Please enter your password')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await apiDisable2FA({ password })
      setEnabled(false)
      setStep('status')
      setPassword('')
    } catch (error: any) {
      setError(error.message || 'Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  if (loading && step === 'status') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center">
        <LoadingState variant="full" text="Loading 2FA settings..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <main className="container px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-32 pb-8 sm:pb-16 lg:pb-20 relative z-10">
        {/* Back Button */}
        <Link
          href="/user/settings"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>

        {/* Header */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary-500/10 rounded-xl p-3">
              <Shield className="h-8 w-8 text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Two-Factor Authentication
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>

          {/* Status Card */}
          {step === 'status' && (
            <div className="glass rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-1">
                    {enabled ? '2FA Enabled' : '2FA Disabled'}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {enabled
                      ? 'Your account is protected with two-factor authentication'
                      : 'Enable 2FA to secure your account with email verification'}
                  </p>
                </div>
                <div className={enabled ? 'text-green-400' : 'text-gray-500'}>
                  {enabled ? <CheckCircle className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
                </div>
              </div>

              {enabled ? (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-white mb-1">2FA is Active</h3>
                        <p className="text-gray-400 text-sm">
                          You'll receive a code via email each time you sign in
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    onClick={() => setStep('disable')}
                    className="w-full"
                  >
                    Disable 2FA
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-yellow-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-white mb-1">2FA is Disabled</h3>
                        <p className="text-gray-400 text-sm">
                          Your account is only protected by your password
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleEnable} disabled={loading} className="w-full">
                    Enable 2FA
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Enable Step */}
          {step === 'enable' && (
            <div className="glass rounded-xl p-6 space-y-6">
              <div className="text-center">
                <div className="bg-primary-500/10 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
                <p className="text-gray-400">
                  We've sent a 6-digit code to <strong className="text-white">{user?.email}</strong>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Enter the code from your email
                  </label>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={code} onChange={(value) => setCode(value)}>
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
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleVerify}
                  disabled={loading || code.length !== 6}
                  className="w-full"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('status')
                    setCode('')
                    setError(null)
                  }}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Verify Step */}
          {step === 'verify' && (
            <div className="glass rounded-xl p-6 space-y-6">
              <div className="text-center">
                <div className="bg-primary-500/10 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Verify Your Email</h2>
                <p className="text-gray-400">
                  Enter the 6-digit code sent to{' '}
                  <strong className="text-white">{user?.email}</strong>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Verification Code
                  </label>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={code} onChange={(value) => setCode(value)}>
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
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleVerify}
                  disabled={loading || code.length !== 6}
                  className="w-full"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('status')
                    setCode('')
                    setError(null)
                  }}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Disable Step */}
          {step === 'disable' && (
            <div className="glass rounded-xl p-6 space-y-6">
              <div className="text-center">
                <div className="bg-red-500/10 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Disable 2FA</h2>
                <p className="text-gray-400">
                  This will remove the extra security layer from your account
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Enter your password to confirm
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  variant="destructive"
                  onClick={handleDisable}
                  disabled={loading || !password}
                  className="w-full"
                >
                  {loading ? 'Disabling...' : 'Disable 2FA'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('status')
                    setPassword('')
                    setError(null)
                  }}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="glass rounded-xl p-4 border border-blue-500/20 bg-blue-500/5 mt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white mb-1">About Two-Factor Authentication</h4>
                <p className="text-gray-400 text-sm">
                  Two-factor authentication adds an extra layer of security to your account. When
                  enabled, you'll receive a 6-digit code via email each time you sign in. This helps
                  protect your account even if your password is compromised.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
