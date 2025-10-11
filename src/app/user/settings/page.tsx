'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import { Badge } from '../../../components/ui/badge'
import { RequireAuth } from '../../lib/protected-route'
import { useAuth } from '../../lib/auth-context'
import { useToast } from '../../../lib/toast-context'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Save,
  ArrowLeft,
  Mail,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2
} from 'lucide-react'

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
  const toast = useToast()
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
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/trpc'
  
  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  useEffect(() => {
    loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadSettings() {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/user.getPreferences`, {
        method: 'GET',
        headers: getAuthHeaders()
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

  async function handleSaveProfile() {
    try {
      setIsSaving(true)
      setError(null)
      
      const response = await fetch(`${API_URL}/auth.updateProfile`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username,
          bio
        })
      })
      
      const data = await response.json()
      if (data.error) {
        setError(data.error.message || 'Failed to update profile')
        toast.error(data.error.message || 'Failed to update profile', 'Error')
        return
      }
      
      setSaveSuccess(true)
      await refreshUser()
      toast.success('Profile updated successfully!', 'Success')
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError('Failed to update profile. Please try again.')
      toast.error('Failed to update profile. Please try again.', 'Error')
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
        body: JSON.stringify(preferences)
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
          confirmPassword
        })
      })
      
      const data = await response.json()
      if (data.error) {
        setPasswordError(data.error.message || 'Failed to change password')
        toast.error(data.error.message || 'Failed to change password', 'Error')
        return
      }
      
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password changed successfully!', 'Success')
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err) {
      setPasswordError('Failed to change password. Please try again.')
      toast.error('Failed to change password. Please try again.', 'Error')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield }
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

      <main className="container pt-28 pb-20 relative z-10">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center">
              <Settings className="h-7 w-7 text-primary-400" />
              </div>
              <div>
              <h1 className="text-4xl font-bold text-white">Settings</h1>
              <p className="text-gray-400 text-lg">Manage your account and preferences</p>
            </div>
          </div>
        </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="mb-6 p-4 bg-success-500/10 border border-success-500/20 rounded-xl flex items-center gap-3">
              <Check className="h-5 w-5 text-success-400" />
              <p className="text-success-400">Settings saved successfully!</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error-500/10 border border-error-500/20 rounded-xl flex items-center gap-3">
              <X className="h-5 w-5 text-error-400" />
              <p className="text-error-400">{error}</p>
        </div>
          )}

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-3 sticky top-24">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-semibold">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-8 min-h-[600px]">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Profile Information</h2>
                    <p className="text-gray-400">Update your personal details</p>
                  </div>

                  {/* Profile Preview Card */}
                  <div className="glass rounded-xl p-6 border border-primary-500/20">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-3xl font-bold">
                        {username ? username[0].toUpperCase() : user?.email?.[0].toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">@{username || 'username'}</h3>
                        <p className="text-gray-400 text-sm">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="glass rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                      <User className="h-5 w-5 text-primary-400" />
                      Account Details
                    </h3>
                    
                    <div className="space-y-5">
                      {/* Email (read-only) */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
                          <Lock className="h-3 w-3" />
                          Email cannot be changed for security reasons
                        </p>
                      </div>

                      <div className="h-px bg-white/10"></div>

                      {/* Username */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Username</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choose a username"
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all"
                          />
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1">
                            <p className="text-xs text-gray-400">Your profile URL:</p>
                            <p className="text-xs text-primary-400 font-medium">animesenpai.com/users/@{username || 'username'}</p>
                          </div>
                          {username && username.length >= 3 && (
                            <div className="text-success-400 text-xs flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* About You */}
                  <div className="glass rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                      <Mail className="h-5 w-5 text-secondary-400" />
                      About You
                    </h3>
                    
                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={5}
                        maxLength={200}
                        placeholder="Tell others about yourself... What anime do you love? What are you currently watching?"
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all resize-none"
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-gray-400">Share your anime journey with others</p>
                        <div className="flex items-center gap-2">
                          <div className={`h-1 w-20 rounded-full ${bio.length > 150 ? 'bg-warning-500' : 'bg-gray-700'}`}>
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all"
                              style={{ width: `${(bio.length / 200) * 100}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-medium ${bio.length > 180 ? 'text-warning-400' : 'text-gray-400'}`}>
                            {bio.length}/200
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving || !username || username.length < 3}
                    className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold px-6 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Saving Changes...</>
                    ) : (
                      <><Save className="h-5 w-5 mr-2" />Save Profile Changes</>
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
                        <p className="text-success-400 font-medium">Password changed successfully!</p>
                      </div>
                    )}

                    {passwordError && (
                      <div className="p-4 bg-error-500/10 border border-error-500/20 rounded-xl flex items-center gap-3">
                        <X className="h-5 w-5 text-error-400" />
                        <p className="text-error-400 font-medium">{passwordError}</p>
                      </div>
                    )}

                    <div className="glass rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                          <Lock className="h-6 w-6 text-primary-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Change Password</h3>
                          <p className="text-sm text-gray-400">Update your password regularly for security</p>
                        </div>
                    </div>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Current Password</label>
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
                              {showPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="h-px bg-white/10"></div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">New Password</label>
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
                            <div className={`h-1 flex-1 rounded-full ${newPassword.length >= 8 ? 'bg-success-500' : 'bg-gray-700'}`}></div>
                            <div className={`h-1 flex-1 rounded-full ${newPassword.length >= 12 ? 'bg-success-500' : 'bg-gray-700'}`}></div>
                            <div className={`h-1 flex-1 rounded-full ${/[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 'bg-success-500' : 'bg-gray-700'}`}></div>
                          </div>
                          <p className="mt-2 text-xs text-gray-400">
                            {newPassword.length >= 8 ? '✓ At least 8 characters' : '○ At least 8 characters'}
                          </p>
                    </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Confirm New Password</label>
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
                            <p className={`mt-2 text-xs ${newPassword === confirmPassword ? 'text-success-400' : 'text-error-400'}`}>
                              {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={handleChangePassword}
                          disabled={isSaving || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                          className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold px-6 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Changing Password...</>
                          ) : (
                            <><Lock className="h-5 w-5 mr-2" />Change Password</>
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
                    <h2 className="text-2xl font-bold text-white mb-2">Notification Preferences</h2>
                    <p className="text-gray-400">Choose what notifications you want to receive</p>
                  </div>

                  {/* Notification Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email Notifications */}
                    <div className="glass rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer group"
                         onClick={() => setPreferences({...preferences, emailNotifications: !preferences.emailNotifications})}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                          <Mail className="h-6 w-6 text-primary-400" />
                        </div>
                        <Checkbox
                          checked={preferences.emailNotifications ?? true}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={(checked) => setPreferences({...preferences, emailNotifications: checked as boolean})}
                        />
                      </div>
                      <h3 className="text-white font-semibold mb-1">Email Notifications</h3>
                      <p className="text-gray-400 text-sm">Receive updates via email</p>
                    </div>

                    {/* Push Notifications */}
                    <div className="glass rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer group opacity-50"
                         title="Coming soon">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-secondary-500/10 flex items-center justify-center">
                          <Smartphone className="h-6 w-6 text-secondary-400" />
                      </div>
                      <Checkbox
                          checked={false}
                          disabled={true}
                      />
                      </div>
                      <h3 className="text-white font-semibold mb-1">Push Notifications</h3>
                      <p className="text-gray-400 text-sm">Coming soon</p>
                    </div>

                    {/* New Episodes */}
                    <div className="glass rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer group"
                         onClick={() => setPreferences({...preferences, newEpisodes: !preferences.newEpisodes})}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-warning-500/10 flex items-center justify-center group-hover:bg-warning-500/20 transition-colors">
                          <Bell className="h-6 w-6 text-warning-400" />
                        </div>
                        <Checkbox
                          checked={preferences.newEpisodes ?? true}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={(checked) => setPreferences({...preferences, newEpisodes: checked as boolean})}
                        />
                      </div>
                      <h3 className="text-white font-semibold mb-1">New Episodes</h3>
                      <p className="text-gray-400 text-sm">Alert when episodes are released</p>
                    </div>

                    {/* Recommendations */}
                    <div className="glass rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer group"
                         onClick={() => setPreferences({...preferences, recommendations: !preferences.recommendations})}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                          <Bell className="h-6 w-6 text-primary-400" />
                      </div>
                      <Checkbox
                          checked={preferences.recommendations ?? true}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={(checked) => setPreferences({...preferences, recommendations: checked as boolean})}
                      />
                      </div>
                      <h3 className="text-white font-semibold mb-1">Recommendations</h3>
                      <p className="text-gray-400 text-sm">Personalized anime suggestions</p>
                    </div>

                    {/* Weekly Digest */}
                    <div className="glass rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer group"
                         onClick={() => setPreferences({...preferences, weeklyDigest: !preferences.weeklyDigest})}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-secondary-500/10 flex items-center justify-center group-hover:bg-secondary-500/20 transition-colors">
                          <Mail className="h-6 w-6 text-secondary-400" />
                        </div>
                        <Checkbox
                          checked={preferences.weeklyDigest ?? false}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={(checked) => setPreferences({...preferences, weeklyDigest: checked as boolean})}
                        />
                      </div>
                      <h3 className="text-white font-semibold mb-1">Weekly Digest</h3>
                      <p className="text-gray-400 text-sm">Weekly content summary</p>
                    </div>

                    {/* Social Updates */}
                    <div className="glass rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer group"
                         onClick={() => setPreferences({...preferences, socialUpdates: !preferences.socialUpdates})}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-success-500/10 flex items-center justify-center group-hover:bg-success-500/20 transition-colors">
                          <User className="h-6 w-6 text-success-400" />
                      </div>
                      <Checkbox
                          checked={preferences.socialUpdates ?? true}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={(checked) => setPreferences({...preferences, socialUpdates: checked as boolean})}
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
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="h-4 w-4 mr-2" />Save Notification Settings</>
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
                        onClick={() => setPreferences({...preferences, profileVisibility: 'public'})}
                        className={`p-4 rounded-xl border-2 transition-all text-left group ${
                          preferences.profileVisibility === 'public'
                            ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-primary-500 shadow-lg shadow-primary-500/10'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              preferences.profileVisibility === 'public' 
                                ? 'bg-primary-500/20' 
                                : 'bg-white/5 group-hover:bg-white/10'
                            }`}>
                              <Eye className={`h-5 w-5 ${
                                preferences.profileVisibility === 'public' ? 'text-primary-400' : 'text-gray-400'
                              }`} />
                            </div>
                    <div>
                              <div className="text-white font-semibold mb-0.5">Public</div>
                              <div className="text-gray-400 text-sm">Anyone can view your profile</div>
                            </div>
                          </div>
                          {preferences.profileVisibility === 'public' && (
                            <Check className="h-5 w-5 text-primary-400" />
                          )}
                        </div>
                      </button>

                      <button
                        onClick={() => setPreferences({...preferences, profileVisibility: 'friends'})}
                        className={`p-4 rounded-xl border-2 transition-all text-left group ${
                          preferences.profileVisibility === 'friends'
                            ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-primary-500 shadow-lg shadow-primary-500/10'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              preferences.profileVisibility === 'friends' 
                                ? 'bg-primary-500/20' 
                                : 'bg-white/5 group-hover:bg-white/10'
                            }`}>
                              <User className={`h-5 w-5 ${
                                preferences.profileVisibility === 'friends' ? 'text-primary-400' : 'text-gray-400'
                              }`} />
                    </div>
                    <div>
                              <div className="text-white font-semibold mb-0.5">Friends Only</div>
                              <div className="text-gray-400 text-sm">Only people you follow can see your profile</div>
                            </div>
                          </div>
                          {preferences.profileVisibility === 'friends' && (
                            <Check className="h-5 w-5 text-primary-400" />
                          )}
                        </div>
                      </button>

                      <button
                        onClick={() => setPreferences({...preferences, profileVisibility: 'private'})}
                        className={`p-4 rounded-xl border-2 transition-all text-left group ${
                          preferences.profileVisibility === 'private'
                            ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-primary-500 shadow-lg shadow-primary-500/10'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              preferences.profileVisibility === 'private' 
                                ? 'bg-primary-500/20' 
                                : 'bg-white/5 group-hover:bg-white/10'
                            }`}>
                              <Lock className={`h-5 w-5 ${
                                preferences.profileVisibility === 'private' ? 'text-primary-400' : 'text-gray-400'
                              }`} />
                            </div>
                            <div>
                              <div className="text-white font-semibold mb-0.5">Private</div>
                              <div className="text-gray-400 text-sm">Only you can see your profile</div>
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
                      <div className="glass rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                           onClick={() => setPreferences({...preferences, showWatchHistory: !preferences.showWatchHistory})}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                            <Eye className="h-5 w-5 text-primary-400" />
                          </div>
                          <Checkbox
                            checked={preferences.showWatchHistory ?? true}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) => setPreferences({...preferences, showWatchHistory: checked as boolean})}
                          />
                        </div>
                        <h4 className="text-white font-semibold mb-1">Watch History</h4>
                        <p className="text-gray-400 text-sm">Show your anime list</p>
                </div>

                      {/* Show Favorites */}
                      <div className="glass rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                           onClick={() => setPreferences({...preferences, showFavorites: !preferences.showFavorites})}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary-500/10 flex items-center justify-center">
                            <Eye className="h-5 w-5 text-secondary-400" />
                          </div>
                          <Checkbox
                            checked={preferences.showFavorites ?? true}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) => setPreferences({...preferences, showFavorites: checked as boolean})}
                          />
                        </div>
                        <h4 className="text-white font-semibold mb-1">Favorites</h4>
                        <p className="text-gray-400 text-sm">Display favorite anime</p>
                      </div>

                      {/* Show Ratings */}
                      <div className="glass rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                           onClick={() => setPreferences({...preferences, showRatings: !preferences.showRatings})}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-warning-500/10 flex items-center justify-center">
                            <Eye className="h-5 w-5 text-warning-400" />
                      </div>
                      <Checkbox
                            checked={preferences.showRatings ?? true}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) => setPreferences({...preferences, showRatings: checked as boolean})}
                      />
                        </div>
                        <h4 className="text-white font-semibold mb-1">Ratings</h4>
                        <p className="text-gray-400 text-sm">Show your ratings</p>
                    </div>

                      {/* Allow Messages */}
                      <div className="glass rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                           onClick={() => setPreferences({...preferences, allowMessages: !preferences.allowMessages})}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-success-400" />
                          </div>
                          <Checkbox
                            checked={preferences.allowMessages ?? true}
                            onClick={(e) => e.stopPropagation()}
                            onCheckedChange={(checked) => setPreferences({...preferences, allowMessages: checked as boolean})}
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
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="h-4 w-4 mr-2" />Save Privacy Settings</>
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