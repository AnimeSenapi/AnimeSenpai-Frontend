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
import { apiGet2FAStatus, apiEnable2FA, apiVerify2FASetup, apiDisable2FA, apiExportUserData, apiRequestAccountDeletion, apiUpdateProfile, apiUpdatePreferences, TRPC_URL } from '../../lib/api'
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
  Trash2,
  Download,
  AlertTriangle,
  FileJson,
  HelpCircle,
  Info,
} from 'lucide-react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../../components/ui/input-otp'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../../components/ui/tooltip'

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

// Helper component for tooltip info icons
function InfoTooltip({ content }: { content: string | React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center text-gray-400 hover:text-gray-300 transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="text-sm">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
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

  // Account management state
  const [isExporting, setIsExporting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const API_URL = TRPC_URL

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
    // Optimistically update UI
    const previousUsername = user?.username
    const previousBio = user?.bio

    try {
      setIsSaving(true)
      setError(null)

      await apiUpdateProfile({
        username,
        bio,
      })

      setSaveSuccess(true)
      await refreshUser()
      addToast({
        title: 'Success',
        description: 'Profile updated successfully!',
        variant: 'success',
      })
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile. Please try again.')
      addToast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
      // Revert optimistic update
      if (user) {
        await refreshUser()
      }
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSavePreferences() {
    // Optimistically update UI - preferences are already in state
    const previousPreferences = { ...preferences }

    try {
      setIsSaving(true)
      setError(null)

      await apiUpdatePreferences(preferences)

      setSaveSuccess(true)
      addToast({
        title: 'Success',
        description: 'Preferences saved successfully!',
        variant: 'success',
      })
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings. Please try again.')
      // Revert optimistic update
      setPreferences(previousPreferences)
      addToast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleExportData() {
    try {
      setIsExporting(true)
      setError(null)
      const result = await apiExportUserData()
      
      // Create a blob and download it
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `animesenpai-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      addToast({
        title: 'Data exported successfully',
        description: 'Your data has been downloaded as a JSON file.',
        variant: 'success',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to export data')
      addToast({
        title: 'Error',
        description: err.message || 'Failed to export data',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword) {
      setError('Please enter your password to confirm account deletion')
      return
    }

    try {
      setIsDeleting(true)
      setError(null)
      
      await apiRequestAccountDeletion(deletePassword, deleteReason || undefined)
      
      addToast({
        title: 'Account deletion scheduled',
        description: 'Your account will be deleted in 30 days. You can cancel this by logging in before then.',
        variant: 'success',
      })

      // Logout and redirect to home
      setTimeout(() => {
        localStorage.clear()
        sessionStorage.clear()
        router.push('/')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to delete account')
      addToast({
        title: 'Error',
        description: err.message || 'Failed to delete account',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
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
    { id: 'account', label: 'Account', icon: Settings },
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <main className="container pt-32 sm:pt-36 md:pt-40 pb-8 sm:pb-12 lg:pb-16 xl:pb-20 relative z-10 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-gray-300 hover:text-white hover:bg-white/10 text-sm py-2 px-3 rounded-lg transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center border border-primary-500/30">
                <Settings className="h-6 w-6 text-primary-400" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Settings</h1>
                <p className="text-gray-400 text-sm sm:text-base">Manage your account and preferences</p>
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

          {/* Mobile Navigation - Horizontal Scroll */}
          <div className="lg:hidden mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm whitespace-nowrap flex-shrink-0 ${
                          activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/40 text-white shadow-md shadow-primary-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent glass'
                        }`}
                      >
                    <Icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-primary-300' : ''}`} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
            {/* Settings Navigation - Desktop Sticky Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-40 max-h-[calc(100vh-11rem)] overflow-y-auto">
                <div className="glass rounded-xl p-3 border border-white/10 shadow-xl backdrop-blur-xl">
                  <nav className="space-y-1.5">
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
                            activeTab === tab.id
                              ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/40 text-white shadow-md shadow-primary-500/10'
                              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-primary-300' : ''}`} />
                          <span className="font-medium">{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
            </aside>

            {/* Settings Content */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Profile Settings */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Profile Settings</h2>
                      <p className="text-gray-400 text-sm">Manage your profile information and personal details</p>
                    </div>

                    {/* Profile Preview */}
                    <div className="glass rounded-xl p-5 border border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold">
                          {username
                            ? username[0]?.toUpperCase()
                            : user?.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-1 truncate">
                            @{username || 'username'}
                          </h3>
                          <p className="text-gray-400 text-sm truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="glass rounded-xl p-5 border border-white/10">
                      <div className="mb-5 pb-4 border-b border-white/10">
                        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-1">
                          <User className="h-5 w-5 text-primary-400" />
                          Basic Information
                      </h3>
                        <p className="text-xs text-gray-400">Update your account details</p>
                      </div>

                      <div className="space-y-5">
                        {/* Email */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <label className="text-sm font-medium text-gray-300">
                            Email Address
                          </label>
                            <InfoTooltip content="Your email address is used for account verification, password resets, and important notifications. It cannot be changed for security reasons." />
                          </div>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="email"
                              value={user?.email || ''}
                              disabled
                              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed text-sm"
                              style={{ borderRadius: '0.5rem' }}
                            />
                          </div>
                          <p className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
                            <Lock className="h-3 w-3" />
                            Email cannot be changed for security reasons
                          </p>
                        {/* Email Verification Status */}
                        {user && !user.emailVerified && (
                            <div className="mt-3">
                          <EmailVerificationPrompt email={user.email} />
                            </div>
                        )}
                        </div>

                        {/* Username */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <label className="text-sm font-medium text-gray-300">
                            Username
                          </label>
                            <InfoTooltip content="Your username is your unique identifier on AnimeSenpai. It appears in your profile URL and is visible to other users. Choose something memorable and unique (minimum 3 characters)." />
                          </div>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              placeholder="Choose a username"
                              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all text-sm"
                              style={{ borderRadius: '0.5rem' }}
                            />
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2">
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

                    {/* Personal Details */}
                    <div className="glass rounded-xl p-5 border border-white/10">
                      <div className="mb-5 pb-4 border-b border-white/10">
                        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-1">
                          <Mail className="h-5 w-5 text-secondary-400" />
                          Personal Details
                      </h3>
                        <p className="text-xs text-gray-400">Tell others about yourself</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <label className="text-sm font-medium text-gray-300">
                          Bio
                        </label>
                          <InfoTooltip content="Share a bit about yourself! Mention your favorite anime, what you're currently watching, or your anime preferences. This helps other users discover you and your recommendations." />
                        </div>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={4}
                          maxLength={200}
                          placeholder="Tell others about yourself... What anime do you love? What are you currently watching?"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all resize-none text-sm"
                          style={{ borderRadius: '0.5rem' }}
                        />
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="text-xs text-gray-400">
                            Share your anime journey with others
                          </p>
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-1 w-20 rounded-full ${bio.length > 150 ? 'bg-warning-500' : 'bg-gray-700'}`}
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
                      className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Save Profile Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Security & Authentication</h2>
                      <p className="text-gray-400 text-sm">Manage your account security and authentication methods</p>
                    </div>

                    {/* Success/Error Messages */}
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

                    {/* Authentication & Access */}
                    <div className="space-y-4">
                      <div className="glass rounded-xl p-5 border border-white/10">
                        <div className="flex items-center gap-3 mb-5">
                          <Shield className="h-5 w-5 text-primary-400 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-semibold text-white">
                            Two-Factor Authentication
                          </h3>
                              <InfoTooltip content="2FA adds an extra layer of security by requiring a verification code sent to your email when you log in. This prevents unauthorized access even if someone knows your password." />
                            </div>
                            <p className="text-xs text-gray-400">
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
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <label className="text-sm font-semibold text-gray-300">
                              Verification Code
                            </label>
                              <InfoTooltip content="Enter the 6-digit code sent to your email. Check your inbox (and spam folder) for the verification email." />
                            </div>
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
                            <div className="flex items-center gap-2">
                            <label className="block text-sm font-semibold text-gray-300">
                              Password
                            </label>
                              <InfoTooltip content="Enter your account password to confirm disabling 2FA. This ensures only you can make security changes to your account." />
                            </div>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="password"
                                value={twoFactorPassword}
                                onChange={(e) => setTwoFactorPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all"
                                style={{ borderRadius: '0.5rem' }}
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

                    <div className="glass rounded-xl p-5 border border-white/10">
                      <div className="flex items-center gap-3 mb-5">
                        <Lock className="h-5 w-5 text-primary-400 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-white">Change Password</h3>
                            <InfoTooltip content="Change your password regularly to keep your account secure. Use a strong, unique password with at least 8 characters, including uppercase, lowercase, numbers, and symbols." />
                        </div>
                          <p className="text-xs text-gray-400">
                            Update your password regularly for security
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <label className="text-sm font-medium text-gray-300">
                            Current Password
                          </label>
                            <InfoTooltip content="Enter your current password to verify your identity before changing it." />
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type={showPasswords ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Enter current password"
                              className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all text-sm"
                              style={{ borderRadius: '0.5rem' }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(!showPasswords)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
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
                          <div className="flex items-center gap-2 mb-2">
                            <label className="block text-sm font-semibold text-gray-300">
                            New Password
                          </label>
                            <InfoTooltip content="Your new password must be at least 8 characters long. For better security, use a mix of uppercase, lowercase, numbers, and symbols." />
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type={showPasswords ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password"
                              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all"
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
                          <div className="flex items-center gap-2 mb-2">
                            <label className="block text-sm font-semibold text-gray-300">
                            Confirm New Password
                          </label>
                            <InfoTooltip content="Re-enter your new password to confirm it. Both passwords must match exactly." />
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type={showPasswords ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm new password"
                              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all"
                            />
                          </div>
                          {confirmPassword && (
                            <p
                              className={`mt-2 text-xs flex items-center gap-1.5 ${newPassword === confirmPassword ? 'text-success-400' : 'text-error-400'}`}
                            >
                              {newPassword === confirmPassword ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  Passwords match
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3" />
                                  Passwords do not match
                                </>
                              )}
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
                          className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold px-6 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
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
                    <div className="glass rounded-xl p-4 border border-white/10">
                      <div className="flex gap-3">
                        <Shield className="h-4 w-4 text-primary-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white font-medium mb-2 text-sm">Security Tips</p>
                          <ul className="text-xs text-gray-400 space-y-1">
                            <li>• Use a unique password that you don't use anywhere else</li>
                            <li>• Include uppercase, lowercase, numbers, and symbols</li>
                            <li>• Avoid using personal information in your password</li>
                            <li>• Change your password regularly</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                    {/* Account Preferences */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Settings className="h-5 w-5 text-secondary-400" />
                        <h3 className="text-lg font-semibold text-white">Account Preferences</h3>
                      </div>

                      {/* Onboarding - Redo Preferences */}
                      <div className="glass rounded-xl p-6 border border-white/10">
                        <div className="mb-4">
                          <h4 className="text-base font-semibold text-white mb-1">Onboarding Preferences</h4>
                          <p className="text-gray-400 text-sm">
                            Want to update your favorite genres, tags, or discovery mode? You can redo the onboarding flow anytime.
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={() => router.push('/onboarding/restart')}
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 shadow-lg shadow-primary-500/20"
                          >
                            Redo Onboarding
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => router.push('/onboarding')}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            Open Onboarding
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Notification Preferences
                      </h2>
                      <p className="text-gray-400 text-sm">Control how and when you receive notifications</p>
                    </div>

                    {/* Push Notifications */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Bell className="h-5 w-5 text-primary-400" />
                        <h3 className="text-lg font-semibold text-white">Push Notifications</h3>
                      </div>
                    <NotificationSettings />
                    </div>

                    {/* Email & Activity Notifications */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-5 w-5 text-secondary-400" />
                        <h3 className="text-lg font-semibold text-white">Email & Activity Notifications</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email Notifications */}
                      <div
                        className="glass rounded-xl p-4 hover:bg-white/5 transition-all cursor-pointer border border-white/10"
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            emailNotifications: !preferences.emailNotifications,
                          })
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                              <Mail className="h-5 w-5 text-primary-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white font-medium text-sm">Email Notifications</h3>
                                <InfoTooltip content="Receive important account updates, security alerts, and notifications via email. Keep this enabled for critical information." />
                              </div>
                              <p className="text-gray-400 text-xs">Receive updates via email</p>
                            </div>
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
                      </div>

                      {/* New Episodes */}
                      <div
                        className="glass rounded-xl p-4 hover:bg-white/5 transition-all cursor-pointer border border-white/10"
                        onClick={() =>
                          setPreferences({ ...preferences, newEpisodes: !preferences.newEpisodes })
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-warning-500/10 flex items-center justify-center flex-shrink-0">
                              <Bell className="h-5 w-5 text-warning-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white font-medium text-sm">New Episodes</h3>
                                <InfoTooltip content="Get notified when new episodes of anime in your list are released. Perfect for keeping up with ongoing series!" />
                              </div>
                              <p className="text-gray-400 text-xs">Alert when episodes are released</p>
                            </div>
                          </div>
                          <Checkbox
                            checked={preferences.newEpisodes ?? true}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) =>
                              setPreferences({ ...preferences, newEpisodes: checked as boolean })
                            }
                          />
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div
                        className="glass rounded-xl p-4 hover:bg-white/5 transition-all cursor-pointer border border-white/10"
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            recommendations: !preferences.recommendations,
                          })
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                              <Bell className="h-5 w-5 text-primary-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white font-medium text-sm">Recommendations</h3>
                                <InfoTooltip content="Receive notifications about personalized anime recommendations based on your preferences, watch history, and ratings." />
                              </div>
                              <p className="text-gray-400 text-xs">Personalized anime suggestions</p>
                            </div>
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
                      </div>

                      {/* Weekly Digest */}
                      <div
                        className="glass rounded-xl p-4 hover:bg-white/5 transition-all cursor-pointer border border-white/10"
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            weeklyDigest: !preferences.weeklyDigest,
                          })
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-secondary-500/10 flex items-center justify-center flex-shrink-0">
                              <Mail className="h-5 w-5 text-secondary-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white font-medium text-sm">Weekly Digest</h3>
                                <InfoTooltip content="Receive a weekly email summary of your activity, new releases, and personalized recommendations. Perfect for staying updated without daily notifications." />
                              </div>
                              <p className="text-gray-400 text-xs">Weekly content summary</p>
                            </div>
                          </div>
                          <Checkbox
                            checked={preferences.weeklyDigest ?? false}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) =>
                              setPreferences({ ...preferences, weeklyDigest: checked as boolean })
                            }
                          />
                        </div>
                      </div>

                      {/* Social Updates */}
                      <div
                        className="glass rounded-xl p-4 hover:bg-white/5 transition-all cursor-pointer border border-white/10"
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            socialUpdates: !preferences.socialUpdates,
                          })
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-success-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white font-medium text-sm">Social Updates</h3>
                                <InfoTooltip content="Get notified about friend activities, new followers, likes, and comments on your profile. Stay connected with the AnimeSenpai community!" />
                              </div>
                              <p className="text-gray-400 text-xs">Friend activities and follows</p>
                            </div>
                          </div>
                          <Checkbox
                            checked={preferences.socialUpdates ?? true}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) =>
                              setPreferences({ ...preferences, socialUpdates: checked as boolean })
                            }
                          />
                        </div>
                      </div>
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
                      className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold px-6 py-3.5 shadow-lg shadow-primary-500/20"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Save Notification Settings
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Privacy Settings */}
                {activeTab === 'privacy' && (
                  <div className="space-y-8">
                    {/* Header */}
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Privacy & Visibility</h2>
                      <p className="text-gray-400">Control who can see your profile and activity</p>
                    </div>

                    {/* Profile Visibility Settings */}
                    <div className="space-y-4">
                      <div className="glass rounded-xl p-5 border border-white/10">
                        <div className="mb-4">
                          <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary-400" />
                        Profile Visibility
                      </h3>
                          <p className="text-xs text-gray-400 mb-2">
                            Choose who can view your profile and basic information
                          </p>
                          <div className="flex items-start gap-2 text-xs text-gray-500">
                            <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                            <span>Your profile visibility affects how others can discover and view your anime lists, ratings, and activity.</span>
                          </div>
                        </div>
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
                    </div>

                    {/* Content Visibility Settings */}
                    <div className="space-y-4">
                      <div className="glass rounded-xl p-5 border border-white/10">
                        <div className="mb-4">
                          <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-secondary-400" />
                            Content Visibility
                      </h3>
                          <p className="text-xs text-gray-400 mb-2">
                            Control what information is visible on your profile
                          </p>
                          <div className="flex items-start gap-2 text-xs text-gray-500">
                            <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                            <span>Even if your profile is public, you can control which specific information is displayed to others.</span>
                          </div>
                        </div>
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
                            <div className="flex items-center gap-2">
                              <InfoTooltip content="Allow others to see your complete anime list including what you're watching, completed, and plan to watch." />
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
                            <div className="flex items-center gap-2">
                              <InfoTooltip content="Show your favorite anime on your profile. This helps others discover what you love and find similar recommendations." />
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
                            <div className="flex items-center gap-2">
                              <InfoTooltip content="Display your anime ratings on your profile. Others can see what scores you've given to different anime." />
                            <Checkbox
                              checked={preferences.showRatings ?? true}
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={(checked) =>
                                setPreferences({ ...preferences, showRatings: checked as boolean })
                              }
                            />
                            </div>
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
                            <div className="flex items-center gap-2">
                              <InfoTooltip content="Allow other users to send you direct messages. If disabled, users won't be able to contact you privately." />
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
                          </div>
                          <h4 className="text-white font-semibold mb-1">Messages</h4>
                          <p className="text-gray-400 text-sm">Allow DMs from users</p>
                        </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleSavePreferences}
                      disabled={isSaving}
                      className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* Account Settings */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Account Management</h2>
                      <p className="text-gray-400 text-sm">Manage your account data, privacy rights, and deletion</p>
              </div>

                    {/* Data & Privacy Rights */}
                    <div className="space-y-4">
                      {/* Data Export */}
                      <div className="glass rounded-xl p-5 border border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                          <Download className="h-5 w-5 text-primary-400 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-semibold text-white">
                                Export Your Data
                              </h3>
                              <InfoTooltip content="Download all your account data in a JSON file. This includes your profile, anime lists, ratings, watch history, and preferences. You can use this to backup your data or migrate to another service. The export is GDPR compliant and contains all information we store about you." />
                            </div>
                            <p className="text-xs text-gray-400">
                              Download a copy of all your data in JSON format (GDPR compliant)
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                        <p className="text-sm text-gray-300">
                          Your exported data will include:
                        </p>
                        <ul className="text-sm text-gray-400 space-y-2 ml-4 list-disc">
                          <li>Profile information and preferences</li>
                          <li>Your anime list and ratings</li>
                          <li>Watch history and activity</li>
                          <li>Social connections and interactions</li>
                          <li>All associated account data</li>
                        </ul>

                        <Button
                          onClick={handleExportData}
                          disabled={isExporting}
                          className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold px-6 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
                        >
                          {isExporting ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Exporting Data...
                            </>
                          ) : (
                            <>
                              <FileJson className="h-5 w-5 mr-2" />
                              Export My Data
                            </>
                          )}
                        </Button>
                        </div>
                      </div>
                    </div>

                    {/* Account Deletion */}
                    <div className="space-y-4">
                      <div className="glass rounded-xl p-5 border border-red-500/20 bg-red-500/5">
                        <div className="flex items-center gap-3 mb-4">
                          <Trash2 className="h-5 w-5 text-red-400 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-semibold text-white">
                                Delete Account
                              </h3>
                              <InfoTooltip content="Deleting your account will schedule it for permanent deletion in 30 days. All your data, lists, ratings, and preferences will be removed. You can cancel this within 30 days by logging in. This action cannot be undone after the grace period." />
                            </div>
                            <p className="text-xs text-gray-400">
                              Permanently delete your account and all associated data
                            </p>
                          </div>
                        </div>

                      {!showDeleteConfirm ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                            <div className="flex gap-3">
                              <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-white font-semibold mb-1">Warning: This action cannot be undone</p>
                                <ul className="text-sm text-gray-400 space-y-1">
                                  <li>• Your account will be scheduled for deletion in 30 days</li>
                                  <li>• All your data will be permanently removed</li>
                                  <li>• You can cancel deletion by logging in within 30 days</li>
                                  <li>• After 30 days, your account and data will be permanently deleted</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <Button
                            onClick={() => setShowDeleteConfirm(true)}
                            variant="destructive"
                            className="w-full"
                          >
                            <Trash2 className="h-5 w-5 mr-2" />
                            Request Account Deletion
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-sm text-red-400 font-semibold mb-2">
                              Are you absolutely sure you want to delete your account?
                            </p>
                            <p className="text-sm text-gray-400">
                              This will schedule your account for permanent deletion in 30 days. All your data will be removed and cannot be recovered.
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <label className="block text-sm font-semibold text-gray-300">
                                Enter your password to confirm
                              </label>
                              <InfoTooltip content="Enter your current password to verify your identity before deleting your account. This is a security measure to prevent unauthorized account deletion." />
                            </div>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Your password"
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400/50 transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <label className="block text-sm font-semibold text-gray-300">
                                Reason (optional)
                              </label>
                              <InfoTooltip content="Help us improve by sharing why you're leaving. Your feedback is valuable and helps us make AnimeSenpai better for everyone." />
                            </div>
                            <textarea
                              value={deleteReason}
                              onChange={(e) => setDeleteReason(e.target.value)}
                              placeholder="Help us improve by telling us why you're leaving..."
                              rows={3}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400/50 transition-all resize-none"
                              style={{ borderRadius: '0.5rem' }}
                            />
                          </div>

                          <div className="flex gap-3">
                            <Button
                              onClick={handleDeleteAccount}
                              disabled={isDeleting || !deletePassword}
                              variant="destructive"
                              className="flex-1"
                            >
                              {isDeleting ? (
                                <>
                                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                  Deleting Account...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-5 w-5 mr-2" />
                                  Confirm Deletion
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => {
                                setShowDeleteConfirm(false)
                                setDeletePassword('')
                                setDeleteReason('')
                                setError(null)
                              }}
                              variant="outline"
                              disabled={isDeleting}
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                      </div>
                    </div>

                    {/* GDPR Info */}
                    <div className="glass rounded-xl p-5 border border-primary-500/20 bg-primary-500/5">
                      <div className="flex gap-3">
                        <Shield className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white font-semibold mb-2">Your Privacy Rights</p>
                          <ul className="text-sm text-gray-400 space-y-1">
                            <li>• You have the right to access and export your personal data</li>
                            <li>• You have the right to request deletion of your account and data</li>
                            <li>• Your data is processed in accordance with GDPR regulations</li>
                            <li>• Account deletion includes a 30-day grace period for cancellation</li>
                          </ul>
                        </div>
                      </div>
                    </div>
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
