'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '../../../components/ui/toast'
import { api } from '../../lib/api'
import {
  Settings,
  Save,
  RotateCcw,
  Shield,
  Zap,
  Database,
  Globe,
} from 'lucide-react'

interface SystemSettings {
  id: string
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
  maintenanceMessage?: string | null
  registrationEnabled: boolean
  emailVerificationRequired: boolean
  maxUploadSize: number
  rateLimit: number
  sessionTimeout: number
  maxUserListItems: number
  enableRecommendations: boolean
  enableSocialFeatures: boolean
  createdAt: string
  updatedAt: string
}

export function SystemSettingsTab() {
  const toast = useToast()
  const [_settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    maintenanceMode: false,
    maintenanceMessage: '',
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxUploadSize: 5242880,
    rateLimit: 100,
    sessionTimeout: 86400,
    maxUserListItems: 5000,
    enableRecommendations: true,
    enableSocialFeatures: true,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const data = await api.trpcQuery('systemSettings.getSettings')
      setSettings(data)
      setFormData({
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        maintenanceMode: data.maintenanceMode,
        maintenanceMessage: data.maintenanceMessage || '',
        registrationEnabled: data.registrationEnabled,
        emailVerificationRequired: data.emailVerificationRequired,
        maxUploadSize: data.maxUploadSize,
        rateLimit: data.rateLimit,
        sessionTimeout: data.sessionTimeout,
        maxUserListItems: data.maxUserListItems,
        enableRecommendations: data.enableRecommendations,
        enableSocialFeatures: data.enableSocialFeatures,
      })
    } catch (error) {
      console.error('Failed to load system settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.trpcMutation('systemSettings.updateSettings', formData)
      toast.success('System settings updated successfully')
      await loadSettings()
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) return

    setSaving(true)
    try {
      await api.trpcMutation('systemSettings.resetToDefaults', {})
      toast.success('Settings reset to defaults')
      await loadSettings()
    } catch (error) {
      console.error('Failed to reset settings:', error)
      toast.error('Failed to reset settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">System Settings</h2>
            <p className="text-sm text-gray-400">Configure global application settings</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={saving}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-primary-500 to-secondary-500"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="glass rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">General</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Site Description
              </label>
              <textarea
                value={formData.siteDescription}
                onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* User Limits */}
        <div className="glass rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">User Limits</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Anime Per User List
              </label>
              <input
                type="number"
                min="100"
                max="50000"
                value={formData.maxUserListItems}
                onChange={(e) =>
                  setFormData({ ...formData, maxUserListItems: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">Range: 100 - 50,000</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Upload Size (bytes)
              </label>
              <input
                type="number"
                min="1048576"
                max="104857600"
                value={formData.maxUploadSize}
                onChange={(e) =>
                  setFormData({ ...formData, maxUploadSize: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {(formData.maxUploadSize / 1048576).toFixed(1)}MB
              </p>
            </div>
          </div>
        </div>

        {/* Security & Rate Limiting */}
        <div className="glass rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Security</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rate Limit (requests/minute)
              </label>
              <input
                type="number"
                min="10"
                max="10000"
                value={formData.rateLimit}
                onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Session Timeout (seconds)
              </label>
              <input
                type="number"
                min="3600"
                max="2592000"
                value={formData.sessionTimeout}
                onChange={(e) =>
                  setFormData({ ...formData, sessionTimeout: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {(formData.sessionTimeout / 3600).toFixed(1)} hours
              </p>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="glass rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Features</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Enable Recommendations</span>
              <input
                type="checkbox"
                checked={formData.enableRecommendations}
                onChange={(e) =>
                  setFormData({ ...formData, enableRecommendations: e.target.checked })
                }
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Enable Social Features</span>
              <input
                type="checkbox"
                checked={formData.enableSocialFeatures}
                onChange={(e) =>
                  setFormData({ ...formData, enableSocialFeatures: e.target.checked })
                }
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Registration Enabled</span>
              <input
                type="checkbox"
                checked={formData.registrationEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, registrationEnabled: e.target.checked })
                }
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Email Verification Required</span>
              <input
                type="checkbox"
                checked={formData.emailVerificationRequired}
                onChange={(e) =>
                  setFormData({ ...formData, emailVerificationRequired: e.target.checked })
                }
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Maintenance Mode</span>
              <input
                type="checkbox"
                checked={formData.maintenanceMode}
                onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-red-500 focus:ring-red-500"
              />
            </label>

            {formData.maintenanceMode && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Maintenance Message
                </label>
                <textarea
                  value={formData.maintenanceMessage}
                  onChange={(e) => setFormData({ ...formData, maintenanceMessage: e.target.value })}
                  rows={3}
                  placeholder="We'll be back soon!"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="glass rounded-xl p-4 border border-blue-500/20 bg-blue-500/5">
        <p className="text-sm text-gray-300">
          <strong className="text-blue-400">Note:</strong> Changes to these settings will affect all
          users immediately. Be careful when enabling maintenance mode or changing rate limits.
        </p>
      </div>
    </div>
  )
}
