'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import { Badge } from '../../../components/ui/badge'
import { EmailVerificationPrompt } from '../../../components/EmailVerificationBanner'
import { RequireAuth } from '../../lib/protected-route'
import { useAuth } from '../../lib/auth-context'
import { useToast } from '../../../components/ui/toast'
import { NotificationSettings } from '../../../components/settings/NotificationSettings'
import { apiGet2FAStatus, apiEnable2FA, apiVerify2FASetup, apiDisable2FA } from '../../lib/api'
import {
  Settings,
  User,
  Bell,
  Shield,
  Save,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../../components/ui/input-otp'

interface UserPreferences {
  emailNotifications?: boolean
  pushNotifications?: boolean
  weeklyDigest?: boolean
  newEpisodes?: boolean
  recommendations?: boolean
  socialUpdates?: boolean
  profileVisibility?: string
  showWatchHistory?: boolean
  showFavorites?: boolean
  showRatings?: boolean
  allowMessages?: boolean
}

export default function UserSettingsPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { addToast } = useToast()
  const [preferences, setPreferences] = useState<UserPreferences>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('profile')

  // Profile edit state
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
  const [twoFactorStep, setTwoFactorStep] = useState<'status' | 'verify' | 'disable'>('status')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorPassword, setTwoFactorPassword] = useState('')
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api/trpc'

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = 'Bearer ' + token
    }
    return headers
  }

  useEffect(() => {
    loadSettings()
    load2FAStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadSettings() {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/user.getPreferences`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      const data = await response.json()
      if (data.result?.data) {
        setPreferences(data.result.data)
      }

      // Set user profile data
      if (user) {
        setUsername(user.username || '')
        setBio(user.bio || '')
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function load2FAStatus() {
    try {
      const result = await apiGet2FAStatus()
      setTwoFactorEnabled(result.enabled)
    } catch (error) {
      console.error('Failed to load 2FA status:', error)
    }
  }

  async function handleEnable2FA() {
    try {
      setTwoFactorLoading(true)
      setTwoFactorError(null)
      await apiEnable2FA()
      setTwoFactorStep('verify')
      addToast({
        title: 'Check your inbox',
        description: 'Code sent to your email!',
        variant: 'success',
      })
    } catch (error: any) {
      setTwoFactorError(error.message || 'Failed to enable 2FA')
      addToast({
        title: 'Error',
        description: error.message || 'Failed to enable 2FA',
        variant: 'destructive',
      })
    } finally {
      setTwoFactorLoading(false)
    }
  }

  async function handleVerify2FA() {
    if (twoFactorCode.length !== 6) {
      setTwoFactorError('Please enter a 6-digit code')
      return
    }

    try {
      setTwoFactorLoading(true)
      setTwoFactorError(null)
      await apiVerify2FASetup({ code: twoFactorCode })
      setTwoFactorEnabled(true)
      setTwoFactorStep('status')
      setTwoFactorCode('')
      addToast({
        title: 'Your account is now more secure',
        description: '2FA enabled successfully!',
        variant: 'success',
      })
    } catch (error: any) {
      setTwoFactorError(error.message || 'Invalid code')
      setTwoFactorCode('')
      addToast({
        title: 'Error',
        description: error.message || 'Invalid code',
        variant: 'destructive',
      })
    } finally {
      setTwoFactorLoading(false)
    }
  }

  async function handleDisable2FA() {
    if (!twoFactorPassword) {
      setTwoFactorError('Please enter your password')
      return
    }

    try {
      setTwoFactorLoading(true)
      setTwoFactorError(null)
      await apiDisable2FA({ password: twoFactorPassword })
      setTwoFactorEnabled(false)
      setTwoFactorStep('status')
      setTwoFactorPassword('')
      addToast({
        title: 'Your account security has been updated',
        description: '2FA disabled successfully',
        variant: 'success',
      })
    } catch (error: any) {
      setTwoFactorError(error.message || 'Failed to disable 2FA')
      addToast({
        title: 'Error',
        description: error.message || 'Failed to disable 2FA',
        variant: 'destructive',
      })
    } finally {
      setTwoFactorLoading(false)
    }
  }

  async function handleSaveProfile() {
    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch(`${API_URL}/auth.updateProfile`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username,
          bio,
        }),
      })

      const data = await response.json()
      if (data.error) {
        setError(data.error.message || 'Failed to update profile')
        addToast({
        title: 'Error',
        description: data.error.message || 'Failed to update profile',
        variant: 'destructive',
      })
        return
      }

      setSaveSuccess(true)
      await refreshUser()
      addToast({
        title: 'Success',
        description: 'Profile updated successfully!',
        variant: 'success',
      })
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError('Failed to update profile. Please try again.')
      addToast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSavePreferences() {
    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch(`${API_URL}/user.updatePreferences`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences),
      })

      const data = await response.json()
      if (data.error) {
        setError(data.error.message || 'Failed to save settings')
        return
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleChangePassword() {
    try {
      setPasswordError(null)
      setPasswordSuccess(false)

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError('All fields are required')
        return
      }

      if (newPassword.length < 8) {
        setPasswordError('New password must be at least 8 characters')
        return
      }

      if (newPassword !== confirmPassword) {
        setPasswordError('New passwords do not match')
        return
      }

      setIsSaving(true)

      const response = await fetch(`${API_URL}/auth.changePassword`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      })

      const data = await response.json()
      if (data.error) {
        setPasswordError(data.error.message || 'Failed to change password')
        addToast({
        title: 'Error',
        description: data.error.message || 'Failed to change password',
        variant: 'destructive',
      })
        return
      }

      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      addToast({
        title: 'Success',
        description: 'Password changed successfully!',
        variant: 'success',
      })
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err) {
      setPasswordError('Failed to change password. Please try again.')
      addToast({
        title: 'Error',
        description: 'Failed to change password. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ]

  if (isLoading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary-400 animate-spin" />
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <main className="container pt-20 sm:pt-24 lg:pt-28 pb-8 sm:pb-12 lg:pb-16 xl:pb-20 relative z-10 px-4 sm:px-6 lg:px-8">
          {/* Header - Mobile Optimized */}
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <div className="mb-4 sm:mb-6">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-gray-300 hover:text-white hover:bg-white/10 text-sm sm:text-base py-2 sm:py-2.5 px-3 sm:px-4"
              >
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Settings</h1>
                <p className="text-gray-400 text-sm sm:text-base lg:text-lg">Manage your account and preferences</p>
              </div>
            </div>
          </div>

          {/* Success Message - Mobile Optimized */}
          {saveSuccess && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-success-500/10 border border-success-500/20 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3">
              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-success-400" />
              <p className="text-success-400 text-sm sm:text-base">Settings saved successfully!</p>
            </div>
          )}

          {/* Error Message - Mobile Optimized */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-error-500/10 border border-error-500/20 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3">
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-error-400" />
              <p className="text-error-400 text-sm sm:text-base">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 sm:gap-6 lg:gap-8">
            {/* Settings Navigation - Mobile Optimized */}
            <div className="lg:col-span-1">
              <div className="glass rounded-xl sm:rounded-2xl p-2 sm:p-3 sticky top-20 sm:top-24">
                <nav className="space-y-1 sm:space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-base ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="font-semibold">{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* Settings Content - Mobile Optimized */}
            <div className="lg:col-span-1">
              <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
                {/* Profile Settings - Mobile Optimized */}
                {activeTab === 'profile' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Profile Information</h2>
                      <p className="text-gray-400 text-sm sm:text-base">Update your personal details</p>
                    </div>

                    {/* Profile Preview Card - Mobile Optimized */}
                    <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-6 border border-primary-500/20">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                          {username
                            ? username[0]?.toUpperCase()
                            : user?.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate">
                            @{username || 'username'}
                          </h3>
                          <p className="text-gray-400 text-xs sm:text-sm truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Account Details - Mobile Optimized */}
                    <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-5 flex items-center gap-2">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400" />
                        Account Details
                      </h3>

                      <div className="space-y-4 sm:space-y-5">
                        {/* Email (read-only) - Mobile Optimized */}
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5 sm:mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            <input
                              type="email"
                              value={user?.email || ''}
                              disabled
                              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3.5 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-gray-400 cursor-not-allowed text-sm sm:text-base"
                            />
                          </div>
                          <p className="mt-1.5 sm:mt-2 text-xs text-gray-500 flex items-center gap-1.5">
                            <Lock className="h-3 w-3" />
                            Email cannot be changed for security reasons
                          </p>
                        </div>

                        {/* Email Verification Status */}
                        {user && !user.emailVerified && (
                          <EmailVerificationPrompt email={user.email} />
                        )}

                        <div className="h-px bg-white/10"></div>

                        {/* Username - Mobile Optimized */}
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5 sm:mb-2">
                            Username
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              placeholder="Choose a username"
                              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3.5 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all text-sm sm:text-base"
                            />
                          </div>
                          <div className="mt-1.5 sm:mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-400">Your profile URL:</p>
                              <p className="text-xs text-primary-400 font-medium truncate">
                                animesenpai.com/user/@{username || 'username'}
                              </p>
                            </div>
                            {username && username.length >= 3 && (
                              <div className="text-success-400 text-xs flex items-center gap-1 flex-shrink-0">
                                <Check className="h-3 w-3" />
                                Available
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* About You - Mobile Optimized */}
                    <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-5 flex items-center gap-2">
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-400" />
                        About You
                      </h3>

                      {/* Bio - Mobile Optimized */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-1.5 sm:mb-2">
                          Bio
                        </label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={4}
                          maxLength={200}
                          placeholder="Tell others about yourself... What anime do you love? What are you currently watching?"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all resize-none text-sm sm:text-base"
                        />
                        <div className="mt-1.5 sm:mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <p className="text-xs text-gray-400">
                            Share your anime journey with others
                          </p>
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-1 w-16 sm:w-20 rounded-full ${bio.length > 150 ? 'bg-warning-500' : 'bg-gray-700'}`}
                            >
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all"
                                style={{ width: `${(bio.length / 200) * 100}%` }}
                              ></div>
                            </div>
                            <span
                              className={`text-xs font-medium ${bio.length > 180 ? 'text-warning-400' : 'text-gray-400'}`}
                            >
                              {bio.length}/200
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving || !username || username.length < 3}
                      className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 animate-spin" />
                          <span className="hidden sm:inline">Saving Changes...</span>
                          <span className="sm:hidden">Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                          <span className="hidden sm:inline">Save Profile Changes</span>
                          <span className="sm:hidden">Save Changes</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Security Settings</h2>
                      <p className="text-gray-400">Keep your account secure</p>
                    </div>

                    {passwordSuccess && (
                      <div className="p-4 bg-success-500/10 border border-success-500/20 rounded-xl flex items-center gap-3">
                        <Check className="h-5 w-5 text-success-400" />
                        <p className="text-success-400 font-medium">
                          Password changed successfully!
                        </p>
                      </div>
                    )}

                    {passwordError && (
                      <div className="p-4 bg-error-500/10 border border-error-500/20 rounded-xl flex items-center gap-3">
                        <X className="h-5 w-5 text-error-400" />
                        <p className="text-error-400 font-medium">{passwordError}</p>
                      </div>
                    )}

                    {/* Two-Factor Authentication */}
                    <div className="glass rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            Two-Factor Authentication
                          </h3>
                          <p className="text-sm text-gray-400">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        {twoFactorEnabled ? (
                          <Badge
                            variant="default"
                            className="bg-green-500/10 text-green-400 border-green-500/20"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-gray-500/10 text-gray-400 border-gray-500/20"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Disabled
                          </Badge>
                        )}
                      </div>

                      {twoFactorError && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="text-sm text-red-400">{twoFactorError}</p>
                        </div>
                      )}

                      {twoFactorStep === 'status' && (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-400">
                            {twoFactorEnabled
                              ? 'Your account is protected with two-factor authentication. You can disable it below.'
                              : 'Enable two-factor authentication to add an extra layer of security to your account. You will receive a code via email each time you log in.'}
                          </p>
                          <div className="flex gap-3">
                            {!twoFactorEnabled ? (
                              <Button
                                onClick={handleEnable2FA}
                                disabled={twoFactorLoading}
                                className="flex-1"
                              >
                                {twoFactorLoading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending Code...
                                  </>
                                ) : (
                                  <>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Enable 2FA
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                onClick={() => setTwoFactorStep('disable')}
                                variant="destructive"
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Disable 2FA
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {twoFactorStep === 'verify' && (
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-sm text-blue-400 flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              We've sent a 6-digit code to your email. Please enter it below.
                            </p>
                          </div>

                          <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-300">
                              Verification Code
                            </label>
                            <div className="flex justify-center">
                              <InputOTP
                                maxLength={6}
                                value={twoFactorCode}
                                onChange={(value) => setTwoFactorCode(value)}
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

                          <div className="flex gap-3">
                            <Button
                              onClick={handleVerify2FA}
                              disabled={twoFactorLoading || twoFactorCode.length !== 6}
                              className="flex-1"
                            >
                              {twoFactorLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Verify Code
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => {
                                setTwoFactorStep('status')
                                setTwoFactorCode('')
                                setTwoFactorError(null)
                              }}
                              variant="outline"
                              disabled={twoFactorLoading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {twoFactorStep === 'disable' && (
                        <div className="space-y-4">
                          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-sm text-yellow-400">
                              ⚠️ Disabling 2FA will make your account less secure. Please enter your
                              password to confirm.
                            </p>
                          </div>

                          <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-300">
                              Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="password"
                                value={twoFactorPassword}
                                onChange={(e) => setTwoFactorPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all"
                              />
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              onClick={handleDisable2FA}
                              disabled={twoFactorLoading || !twoFactorPassword}
                              variant="destructive"
                              className="flex-1"
                            >
                              {twoFactorLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Disabling...
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Disable 2FA
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => {
                                setTwoFactorStep('status')
                                setTwoFactorPassword('')
                                setTwoFactorError(null)
                              }}
                              variant="outline"
                              disabled={twoFactorLoading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="glass rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                          <Lock className="h-6 w-6 text-primary-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Change Password</h3>
                          <p className="text-sm text-gray-400">
                            Update your password regularly for security
                          </p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type={showPasswords ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Enter current password"
                              className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(!showPasswords)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                              {showPasswords ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="h-px bg-white/10"></div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type={showPasswords ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password"
                              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all"
                            />
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div
                              className={`h-1 flex-1 rounded-full ${newPassword.length >= 8 ? 'bg-success-500' : 'bg-gray-700'}`}
                            ></div>
                            <div
                              className={`h-1 flex-1 rounded-full ${newPassword.length >= 12 ? 'bg-success-500' : 'bg-gray-700'}`}
                            ></div>
                            <div
                              className={`h-1 flex-1 rounded-full ${/[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 'bg-success-500' : 'bg-gray-700'}`}
                            ></div>
                          </div>
                          <p className="mt-2 text-xs text-gray-400">
                            {newPassword.length >= 8
                              ? '✓ At least 8 characters'
                              : '○ At least 8 characters'}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type={showPasswords ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm new password"
                              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all"
                            />
                          </div>
                          {confirmPassword && (
                            <p
                              className={`mt-2 text-xs ${newPassword === confirmPassword ? 'text-success-400' : 'text-error-400'}`}
                            >
                              {newPassword === confirmPassword
                                ? '✓ Passwords match'
                                : '✗ Passwords do not match'}
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={handleChangePassword}
                          disabled={
                            isSaving ||
                            !currentPassword ||
                            !newPassword ||
                            !confirmPassword ||
                            newPassword !== confirmPassword
                          }
                          className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold px-6 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Changing Password...
                            </>
                          ) : (
                            <>
                              <Lock className="h-5 w-5 mr-2" />
                              Change Password
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Security Tips */}
                    <div className="glass rounded-xl p-5 border border-primary-500/20">
                      <div className="flex gap-3">
                        <Shield className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white font-semibold mb-2">Security Tips</p>
                          <ul className="text-sm text-gray-400 space-y-1">
                            <li>• Use a unique password that you don't use anywhere else</li>
                            <li>• Include uppercase, lowercase, numbers, and symbols</li>
                            <li>• Avoid using personal information in your password</li>
                            <li>• Change your password regularly</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Notification Preferences
                      </h2>
                      <p className="text-gray-400">Choose what notifications you want to receive</p>
                    </div>

                    {/* Push Notifications (Full Width) */}
                    <NotificationSettings />

                    {/* Notification Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {/* Email Notifications */}
                      <div
                        className="glass rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer group"
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            emailNotifications: !preferences.emailNotifications,
                          })
                        }
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                            <Mail className="h-6 w-6 text-primary-400" />
                          </div>
                          <Checkbox
                            checked={preferences.emailNotifications ?? true}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) =>
                              setPreferences({
                                ...preferences,
                                emailNotifications: checked as boolean,
                              })
                            }
                          />
                        </div>
                        <h3 className="text-white font-semibold mb-1">Email Notifications</h3>
                        <p className="text-gray-400 text-sm">Receive updates via email</p>
                      </div>

                      {/* New Episodes */}
                      <div
                        className="glass rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer group"
                        onClick={() =>
                          setPreferences({ ...preferences, newEpisodes: !preferences.newEpisodes })
                        }
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl bg-warning-500/10 flex items-center justify-center group-hover:bg-warning-500/20 transition-colors">
                            <Bell className="h-6 w-6 text-warning-400" />
                          </div>
                          <Checkbox
                            checked={preferences.newEpisodes ?? true}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) =>
                              setPreferences({ ...preferences, newEpisodes: checked as boolean })
                            }
                          />
                        </div>
                        <h3 className="text-white font-semibold mb-1">New Episodes</h3>
                        <p className="text-gray-400 text-sm">Alert when episodes are released</p>
                      </div>

                      {/* Recommendations */}
                      <div
                        className="glass rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer group"
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            recommendations: !preferences.recommendations,
                          })
                        }
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                            <Bell className="h-6 w-6 text-primary-400" />
                          </div>
                          <Checkbox
                            checked={preferences.recommendations ?? true}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) =>
                              setPreferences({
                                ...preferences,
                                recommendations: checked as boolean,
                              })
                            }
                          />
                        </div>
                        <h3 className="text-white font-semibold mb-1">Recommendations</h3>
                        <p className="text-gray-400 text-sm">Personalized anime suggestions</p>
                      </div>

                      {/* Weekly Digest */}
                      <div
                        className="glass rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer group"
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            weeklyDigest: !preferences.weeklyDigest,
                          })
                        }
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl bg-secondary-500/10 flex items-center justify-center group-hover:bg-secondary-500/20 transition-colors">
                            <Mail className="h-6 w-6 text-secondary-400" />
                          </div>
                          <Checkbox
                            checked={preferences.weeklyDigest ?? false}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) =>
                              setPreferences({ ...preferences, weeklyDigest: checked as boolean })
                            }
                          />
                        </div>
                        <h3 className="text-white font-semibold mb-1">Weekly Digest</h3>
                        <p className="text-gray-400 text-sm">Weekly content summary</p>
                      </div>

                      {/* Social Updates */}
                      <div
                        className="glass rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer group"
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            socialUpdates: !preferences.socialUpdates,
                          })
                        }
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl bg-success-500/10 flex items-center justify-center group-hover:bg-success-500/20 transition-colors">
                            <User className="h-6 w-6 text-success-400" />
                          </div>
                          <Checkbox
                            checked={preferences.socialUpdates ?? true}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) =>
                              setPreferences({ ...preferences, socialUpdates: checked as boolean })
                            }
                          />
                        </div>
                        <h3 className="text-white font-semibold mb-1">Social Updates</h3>
                        <p className="text-gray-400 text-sm">Friend activities and follows</p>
                      </div>
                    </div>

                    {/* Info Note */}
                    <div className="glass rounded-xl p-4 border border-primary-500/20">
                      <div className="flex gap-3">
                        <Bell className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white font-medium mb-1">Active Features</p>
                          <p className="text-gray-400 text-sm">
                            Email notifications and social activity alerts are currently active.
                            Push notifications will be available soon.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleSavePreferences}
                      disabled={isSaving}
                      className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold px-6 py-3"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Notification Settings
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Privacy Settings */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Privacy & Visibility</h2>
                      <p className="text-gray-400">Control who can see your profile and activity</p>
                    </div>

                    {/* Profile Visibility */}
                    <div className="glass rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary-400" />
                        Profile Visibility
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        <button
                          onClick={() =>
                            setPreferences({ ...preferences, profileVisibility: 'public' })
                          }
                          className={`p-4 rounded-xl border-2 transition-all text-left group ${
                            preferences.profileVisibility === 'public'
                              ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-primary-500 shadow-lg shadow-primary-500/10'
                              : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  preferences.profileVisibility === 'public'
                                    ? 'bg-primary-500/20'
                                    : 'bg-white/5 group-hover:bg-white/10'
                                }`}
                              >
                                <Eye
                                  className={`h-5 w-5 ${
                                    preferences.profileVisibility === 'public'
                                      ? 'text-primary-400'
                                      : 'text-gray-400'
                                  }`}
                                />
                              </div>
                              <div>
                                <div className="text-white font-semibold mb-0.5">Public</div>
                                <div className="text-gray-400 text-sm">
                                  Anyone can view your profile
                                </div>
                              </div>
                            </div>
                            {preferences.profileVisibility === 'public' && (
                              <Check className="h-5 w-5 text-primary-400" />
                            )}
                          </div>
                        </button>

                        <button
                          onClick={() =>
                            setPreferences({ ...preferences, profileVisibility: 'friends' })
                          }
                          className={`p-4 rounded-xl border-2 transition-all text-left group ${
                            preferences.profileVisibility === 'friends'
                              ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-primary-500 shadow-lg shadow-primary-500/10'
                              : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  preferences.profileVisibility === 'friends'
                                    ? 'bg-primary-500/20'
                                    : 'bg-white/5 group-hover:bg-white/10'
                                }`}
                              >
                                <User
                                  className={`h-5 w-5 ${
                                    preferences.profileVisibility === 'friends'
                                      ? 'text-primary-400'
                                      : 'text-gray-400'
                                  }`}
                                />
                              </div>
                              <div>
                                <div className="text-white font-semibold mb-0.5">Friends Only</div>
                                <div className="text-gray-400 text-sm">
                                  Only people you follow can see your profile
                                </div>
                              </div>
                            </div>
                            {preferences.profileVisibility === 'friends' && (
                              <Check className="h-5 w-5 text-primary-400" />
                            )}
                          </div>
                        </button>

                        <button
                          onClick={() =>
                            setPreferences({ ...preferences, profileVisibility: 'private' })
                          }
                          className={`p-4 rounded-xl border-2 transition-all text-left group ${
                            preferences.profileVisibility === 'private'
                              ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-primary-500 shadow-lg shadow-primary-500/10'
                              : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  preferences.profileVisibility === 'private'
                                    ? 'bg-primary-500/20'
                                    : 'bg-white/5 group-hover:bg-white/10'
                                }`}
                              >
                                <Lock
                                  className={`h-5 w-5 ${
                                    preferences.profileVisibility === 'private'
                                      ? 'text-primary-400'
                                      : 'text-gray-400'
                                  }`}
                                />
                              </div>
                              <div>
                                <div className="text-white font-semibold mb-0.5">Private</div>
                                <div className="text-gray-400 text-sm">
                                  Only you can see your profile
                                </div>
                              </div>
                            </div>
                            {preferences.profileVisibility === 'private' && (
                              <Check className="h-5 w-5 text-primary-400" />
                            )}
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* What's Visible */}
                    <div className="glass rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-secondary-400" />
                        What's Visible
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Show Watch History */}
                        <div
                          className="glass rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                          onClick={() =>
                            setPreferences({
                              ...preferences,
                              showWatchHistory: !preferences.showWatchHistory,
                            })
                          }
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                              <Eye className="h-5 w-5 text-primary-400" />
                            </div>
                            <Checkbox
                              checked={preferences.showWatchHistory ?? true}
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={(checked) =>
                                setPreferences({
                                  ...preferences,
                                  showWatchHistory: checked as boolean,
                                })
                              }
                            />
                          </div>
                          <h4 className="text-white font-semibold mb-1">Watch History</h4>
                          <p className="text-gray-400 text-sm">Show your anime list</p>
                        </div>

                        {/* Show Favorites */}
                        <div
                          className="glass rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                          onClick={() =>
                            setPreferences({
                              ...preferences,
                              showFavorites: !preferences.showFavorites,
                            })
                          }
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-secondary-500/10 flex items-center justify-center">
                              <Eye className="h-5 w-5 text-secondary-400" />
                            </div>
                            <Checkbox
                              checked={preferences.showFavorites ?? true}
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={(checked) =>
                                setPreferences({
                                  ...preferences,
                                  showFavorites: checked as boolean,
                                })
                              }
                            />
                          </div>
                          <h4 className="text-white font-semibold mb-1">Favorites</h4>
                          <p className="text-gray-400 text-sm">Display favorite anime</p>
                        </div>

                        {/* Show Ratings */}
                        <div
                          className="glass rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                          onClick={() =>
                            setPreferences({
                              ...preferences,
                              showRatings: !preferences.showRatings,
                            })
                          }
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-warning-500/10 flex items-center justify-center">
                              <Eye className="h-5 w-5 text-warning-400" />
                            </div>
                            <Checkbox
                              checked={preferences.showRatings ?? true}
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={(checked) =>
                                setPreferences({ ...preferences, showRatings: checked as boolean })
                              }
                            />
                          </div>
                          <h4 className="text-white font-semibold mb-1">Ratings</h4>
                          <p className="text-gray-400 text-sm">Show your ratings</p>
                        </div>

                        {/* Allow Messages */}
                        <div
                          className="glass rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                          onClick={() =>
                            setPreferences({
                              ...preferences,
                              allowMessages: !preferences.allowMessages,
                            })
                          }
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center">
                              <Mail className="h-5 w-5 text-success-400" />
                            </div>
                            <Checkbox
                              checked={preferences.allowMessages ?? true}
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={(checked) =>
                                setPreferences({
                                  ...preferences,
                                  allowMessages: checked as boolean,
                                })
                              }
                            />
                          </div>
                          <h4 className="text-white font-semibold mb-1">Messages</h4>
                          <p className="text-gray-400 text-sm">Allow DMs from users</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleSavePreferences}
                      disabled={isSaving}
                      className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold px-6 py-3"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Privacy Settings
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  )
}
