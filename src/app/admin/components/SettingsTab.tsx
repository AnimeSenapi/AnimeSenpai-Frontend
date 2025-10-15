'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  Bell, 
  Lock, 
  Globe, 
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Shield,
  Mail,
  BarChart,
  AlertTriangle
} from 'lucide-react'
import { Button } from '../../../components/ui/button'

interface SiteSettings {
  general: {
    siteName: string
    siteDescription: string
    maintenanceMode: boolean
    allowRegistration: boolean
    requireEmailVerification: boolean
  }
  features: {
    enableSocialFeatures: boolean
    enableRecommendations: boolean
    enableComments: boolean
    enableReviews: boolean
    enableAchievements?: boolean
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    requireStrongPasswords?: boolean
    enableTwoFactor: boolean
  }
  notifications: {
    emailNotifications?: boolean
    enableEmailNotifications?: boolean
    emailProvider?: string
    smtpHost?: string
    smtpPort?: number
    smtpUser?: string
    smtpPassword?: string
    newUserAlert?: boolean
    errorReporting?: boolean
  }
  analytics: {
    enableAnalytics?: boolean
    enableTracking?: boolean
    googleAnalyticsId: string
    enableErrorTracking?: boolean
  }
}

export function SettingsTab() {
  const [settings, setSettings] = useState<SiteSettings>({
    general: {
      siteName: 'AnimeSenpai',
      siteDescription: 'Your ultimate anime companion',
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: false,
    },
    features: {
      enableSocialFeatures: true,
      enableRecommendations: true,
      enableComments: false,
      enableReviews: false,
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      enableTwoFactor: false,
    },
    notifications: {
      enableEmailNotifications: false,
      emailProvider: 'smtp',
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
    },
    analytics: {
      enableAnalytics: false,
      googleAnalyticsId: '',
      enableErrorTracking: false,
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [activeSection, setActiveSection] = useState<'general' | 'features' | 'security' | 'notifications' | 'analytics'>('general')
  const [showPassword, setShowPassword] = useState(false)

  // Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        const { apiGetSettings } = await import('../../lib/api')
        const loadedSettings = await apiGetSettings() as any
        setSettings(loadedSettings)
      } catch (error: any) {
        console.error('Failed to load settings:', error)
        // Keep default settings if loading fails
      } finally {
        setLoading(false)
      }
    }
    
    loadSettings()
  }, [])

  const handleSave = async () => {
    try {
      setSaveStatus('saving')
      
      const { apiSaveSettings } = await import('../../lib/api')
      await apiSaveSettings(settings as any)
      
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
      
      alert('Settings saved successfully!')
    } catch (error: any) {
      setSaveStatus('error')
      alert(error.message || 'Failed to save settings')
    }
  }

  const handleReset = () => {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) {
      return
    }
    
    // Reset to defaults
    setSettings({
      general: {
        siteName: 'AnimeSenpai',
        siteDescription: 'Your ultimate anime companion',
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: false,
      },
      features: {
        enableSocialFeatures: true,
        enableRecommendations: true,
        enableComments: false,
        enableReviews: false,
      },
      security: {
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        enableTwoFactor: false,
      },
      notifications: {
        enableEmailNotifications: false,
        emailProvider: 'smtp',
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
      },
      analytics: {
        enableAnalytics: false,
        googleAnalyticsId: '',
        enableErrorTracking: false,
      }
    })
  }

  const updateSetting = (section: keyof SiteSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const sections = [
    { id: 'general' as const, label: 'General', icon: Globe },
    { id: 'features' as const, label: 'Features', icon: Settings },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">System Settings</h2>
          <p className="text-gray-400">Configure platform settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleReset}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-lg flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="px-4 py-2 bg-primary-500/20 border border-primary-500/30 text-primary-300 hover:bg-primary-500/30 rounded-lg flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 rounded-xl p-2 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{section.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
            {/* General Settings */}
            {activeSection === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary-400" />
                    General Settings
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Site Description</label>
                  <textarea
                    value={settings.general.siteDescription}
                    onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Maintenance Mode</p>
                    <p className="text-sm text-gray-400">Put the site in maintenance mode</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.general.maintenanceMode}
                      onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Allow New Signups</p>
                    <p className="text-sm text-gray-400">Enable user registration</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.general.allowRegistration}
                      onChange={(e) => updateSetting('general', 'allowRegistration', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-500"></div>
                  </label>
                </div>

                {settings.general.maintenanceMode && (
                  <div className="flex items-center gap-3 p-4 bg-warning-500/10 border border-warning-500/30 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-warning-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-warning-300">Maintenance Mode Active</p>
                      <p className="text-sm text-warning-400/80">Only admins can access the site</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Feature Flags */}
            {activeSection === 'features' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary-400" />
                    Feature Flags
                  </h3>
                  <p className="text-sm text-gray-400">Enable or disable platform features</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Social Features</p>
                      <p className="text-sm text-gray-400">Following, feeds, and social interactions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.features.enableSocialFeatures}
                        onChange={(e) => updateSetting('features', 'enableSocialFeatures', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Recommendations</p>
                      <p className="text-sm text-gray-400">AI-powered anime recommendations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.features.enableRecommendations}
                        onChange={(e) => updateSetting('features', 'enableRecommendations', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Comments</p>
                      <p className="text-sm text-gray-400">User comments on anime pages</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.features.enableComments}
                        onChange={(e) => updateSetting('features', 'enableComments', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-medium text-white">User Reviews</p>
                      <p className="text-sm text-gray-400">Detailed anime reviews by users</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.features.enableReviews}
                        onChange={(e) => updateSetting('features', 'enableReviews', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary-400" />
                    Security Settings
                  </h3>
                  <p className="text-sm text-gray-400">Manage authentication and security policies</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Email Verification</p>
                    <p className="text-sm text-gray-400">Require email verification for new accounts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.general.requireEmailVerification}
                      onChange={(e) => updateSetting('general', 'requireEmailVerification', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-400">Enable 2FA for all users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.enableTwoFactor}
                      onChange={(e) => updateSetting('security', 'enableTwoFactor', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout (days)</label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    min={1}
                    max={365}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Users will be logged out after this many days</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Login Attempts</label>
                  <input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    min={3}
                    max={10}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Account will be locked after this many failed attempts</p>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary-400" />
                    Notification Settings
                  </h3>
                  <p className="text-sm text-gray-400">Configure email and notification settings</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Email Notifications</p>
                    <p className="text-sm text-gray-400">Send email notifications to users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.enableEmailNotifications}
                      onChange={(e) => updateSetting('notifications', 'enableEmailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                {settings.notifications.enableEmailNotifications && (
                  <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Host</label>
                      <input
                        type="text"
                        value={settings.notifications.smtpHost}
                        onChange={(e) => updateSetting('notifications', 'smtpHost', e.target.value)}
                        placeholder="smtp.gmail.com"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Port</label>
                        <input
                          type="number"
                          value={settings.notifications.smtpPort}
                          onChange={(e) => updateSetting('notifications', 'smtpPort', parseInt(e.target.value))}
                          placeholder="587"
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Provider</label>
                        <select
                          value={settings.notifications.emailProvider}
                          onChange={(e) => updateSetting('notifications', 'emailProvider', e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                        >
                          <option value="smtp">SMTP</option>
                          <option value="sendgrid">SendGrid</option>
                          <option value="mailgun">Mailgun</option>
                          <option value="ses">AWS SES</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Username</label>
                      <input
                        type="text"
                        value={settings.notifications.smtpUser}
                        onChange={(e) => updateSetting('notifications', 'smtpUser', e.target.value)}
                        placeholder="your-email@gmail.com"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={settings.notifications.smtpPassword}
                          onChange={(e) => updateSetting('notifications', 'smtpPassword', e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary-400" />
                    Advanced Security
                  </h3>
                  <p className="text-sm text-gray-400">Configure advanced security options</p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-info-500/10 border border-info-500/30 rounded-lg">
                  <Shield className="h-5 w-5 text-info-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-info-300">Security Best Practices</p>
                    <p className="text-sm text-info-400/80">
                      Enable email verification and 2FA for maximum security
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Session Timeout</p>
                    <p className="text-2xl font-bold text-white">{settings.security.sessionTimeout} days</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Max Login Attempts</p>
                    <p className="text-2xl font-bold text-white">{settings.security.maxLoginAttempts}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Email Verification</p>
                    <p className={`text-sm font-bold ${settings.general.requireEmailVerification ? 'text-success-400' : 'text-error-400'}`}>
                      {settings.general.requireEmailVerification ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Two-Factor Auth</p>
                    <p className={`text-sm font-bold ${settings.security.enableTwoFactor ? 'text-success-400' : 'text-error-400'}`}>
                      {settings.security.enableTwoFactor ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Settings */}
            {activeSection === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-primary-400" />
                    Analytics & Tracking
                  </h3>
                  <p className="text-sm text-gray-400">Configure analytics and error tracking</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Google Analytics</p>
                    <p className="text-sm text-gray-400">Track user behavior and site analytics</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.analytics.enableAnalytics}
                      onChange={(e) => updateSetting('analytics', 'enableAnalytics', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                {settings.analytics.enableAnalytics && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Google Analytics ID</label>
                    <input
                      type="text"
                      value={settings.analytics.googleAnalyticsId}
                      onChange={(e) => updateSetting('analytics', 'googleAnalyticsId', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Your Google Analytics measurement ID</p>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Error Tracking</p>
                    <p className="text-sm text-gray-400">Monitor and log application errors</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.analytics.enableErrorTracking}
                      onChange={(e) => updateSetting('analytics', 'enableErrorTracking', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Status Footer */}
      {saveStatus !== 'idle' && (
        <div className={`p-4 rounded-lg border ${
          saveStatus === 'saved' 
            ? 'bg-success-500/10 border-success-500/30' 
            : saveStatus === 'error'
            ? 'bg-error-500/10 border-error-500/30'
            : 'bg-primary-500/10 border-primary-500/30'
        }`}>
          <p className={`text-sm font-medium ${
            saveStatus === 'saved' 
              ? 'text-success-300' 
              : saveStatus === 'error'
              ? 'text-error-300'
              : 'text-primary-300'
          }`}>
            {saveStatus === 'saved' && '✓ Settings saved successfully!'}
            {saveStatus === 'error' && '✗ Failed to save settings'}
            {saveStatus === 'saving' && '⏳ Saving settings...'}
          </p>
        </div>
      )}
    </div>
  )
}
