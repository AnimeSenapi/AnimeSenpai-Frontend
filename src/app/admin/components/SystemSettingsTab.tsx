'use client'

import { useState, useEffect, useMemo, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState, EmptyState } from '@/components/ui/error-state'
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
  RefreshCw,
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

interface SystemSettingsFormState {
  maintenanceMode: boolean
  maintenanceMessage: string
  registrationEnabled: boolean
  emailVerificationRequired: boolean
  maxUploadSize: number
  rateLimit: number
  sessionTimeout: number
  maxUserListItems: number
  enableRecommendations: boolean
  enableSocialFeatures: boolean
}

const INITIAL_FORM_STATE: SystemSettingsFormState = {
    maintenanceMode: false,
    maintenanceMessage: '',
    registrationEnabled: true,
    emailVerificationRequired: true,
  maxUploadSize: 5_242_880,
    rateLimit: 100,
  sessionTimeout: 86_400,
  maxUserListItems: 5_000,
    enableRecommendations: true,
    enableSocialFeatures: true,
}

const formatNumber = (value: number) => new Intl.NumberFormat().format(value)

const formatBytes = (value: number) => `${(value / 1_048_576).toFixed(1)} MB`

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  const hours = seconds / 3600
  if (hours < 24) return `${hours.toFixed(hours % 1 === 0 ? 0 : 1)}h`
  const days = hours / 24
  return `${days.toFixed(days % 1 === 0 ? 0 : 1)}d`
}

const formatRelativeTime = (date: Date | null) => {
  if (!date) return 'Not available'
  const diff = Date.now() - date.getTime()
  if (diff < 60_000) return 'Just now'
  if (diff < 3_600_000) {
    const minutes = Math.round(diff / 60_000)
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  }
  if (diff < 86_400_000) {
    const hours = Math.round(diff / 3_600_000)
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }
  const days = Math.round(diff / 86_400_000)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export function SystemSettingsTab() {
  const { addToast } = useToast()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  // Form state
  const [formData, setFormData] = useState<SystemSettingsFormState>(INITIAL_FORM_STATE)
  const [baselineData, setBaselineData] = useState<SystemSettingsFormState | null>(null)

  useEffect(() => {
    loadSettings()
    // Best-effort load of app status badge settings
    loadBadge()
  }, [])

  useEffect(() => {
    if (!formData.maintenanceMode) return
    if (formData.maintenanceMessage.trim().length > 0) return
    setFormData((prev) => ({
      ...prev,
      maintenanceMessage:
        'We are currently performing scheduled maintenance. Please check back shortly.',
    }))
  }, [formData.maintenanceMode])

  const loadSettings = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await api.trpcQuery('systemSettings.getSettings')
      const nextFormData: SystemSettingsFormState = {
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
      }
      setSettings(data)
      setFormData(nextFormData)
      setBaselineData(nextFormData)
      setHasLoadedOnce(true)
    } catch (error) {
      console.error('Failed to load system settings:', error)
      setSettings(null)
      setLoadError(
        error instanceof Error ? error.message || 'Failed to load settings.' : 'Failed to load settings.'
      )
      addToast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // -------- App Status Badge (Admin-controlled) ----------
  const [badgeLoading, setBadgeLoading] = useState(false)
  const [badgeSaving, setBadgeSaving] = useState(false)
  const [badgeError, setBadgeError] = useState<string | null>(null)
  const [badgeStatus, setBadgeStatus] = useState<string>('none')
  const presetStatuses = ['none', 'alpha', 'beta', 'preview', 'experimental', 'maintenance', 'deprecated', 'stable']

  async function loadBadge() {
    try {
      setBadgeLoading(true)
      setBadgeError(null)
      // Prefer admin endpoint; fallback to public
      const result =
        (await api.trpcQuery('admin.getAppStatus').catch(() => null)) ??
        (await api.trpcQuery('appStatus.getBadge').catch(() => null))
      if (result && typeof result === 'object') {
        setBadgeStatus(String(result.status || 'none'))
      } else {
        setBadgeStatus('none')
      }
    } catch (err: any) {
      setBadgeError(err?.message || 'Failed to load status badge')
    } finally {
      setBadgeLoading(false)
    }
  }

  async function saveBadge() {
    try {
      setBadgeSaving(true)
      setBadgeError(null)
      const payload = {
        status: badgeStatus,
        enabled: badgeStatus !== 'none',
      }
      // Try backend mutation first; if not present, persist locally as a fallback
      try {
        await api.trpcMutation('appStatus.setBadge', payload)
      } catch (err: any) {
        const msg = err?.message || ''
        const isNoMutation =
          msg.includes('No "mutation"-procedure') || msg.toLowerCase().includes('unknown_error')
        if (!isNoMutation) throw err
        // Local fallback (temporary) so UI can reflect status without backend support
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'ui:appStatusBadge',
            JSON.stringify({
              status: payload.status,
              enabled: payload.enabled,
            })
          )
        }
      }
      addToast({
        title: 'Saved',
        description: 'Status badge updated',
        variant: 'success',
      })
    } catch (err: any) {
      setBadgeError(err?.message || 'Failed to save status badge')
      addToast({
        title: 'Error',
        description: err?.message || 'Failed to save status badge',
        variant: 'destructive',
      })
    } finally {
      setBadgeSaving(false)
    }
  }

  const handleRefresh = async () => {
    if (hasChanges) {
      const shouldContinue = confirm(
        'Discard unsaved edits and refresh the latest saved configuration?'
      )
      if (!shouldContinue) return
    }
    await loadSettings()
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.trpcMutation('systemSettings.updateSettings', formData)
      addToast({
        title: 'Success',
        description: 'System settings updated successfully',
        variant: 'success',
      })
      await loadSettings()
    } catch (error) {
      console.error('Failed to save settings:', error)
      addToast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) return

    setIsResetting(true)
    try {
      await api.trpcMutation('systemSettings.resetToDefaults', {})
      addToast({
        title: 'Success',
        description: 'Settings reset to defaults',
        variant: 'success',
      })
      await loadSettings()
    } catch (error) {
      console.error('Failed to reset settings:', error)
      addToast({
        title: 'Error',
        description: 'Failed to reset settings',
        variant: 'destructive',
      })
    } finally {
      setIsResetting(false)
    }
  }

  const handleTextChange = (field: keyof SystemSettingsFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value
      setFormData((prev) => ({ ...prev, [field]: value }))
    }

  const handleNumericChange = (
    field: keyof SystemSettingsFormState,
    min: number,
    max: number
  ) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value)
      const clamped = Math.min(max, Math.max(min, value))
      setFormData((prev) => ({ ...prev, [field]: clamped }))
    }

  const handleCheckboxChange = (field: keyof SystemSettingsFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.checked }))
    }

  const hasChanges = useMemo(() => {
    if (!baselineData) return false
    return (Object.keys(formData) as Array<keyof SystemSettingsFormState>).some(
      (key) => formData[key] !== baselineData[key]
    )
  }, [baselineData, formData])

  const changedFields = useMemo(() => {
    if (!baselineData) return new Set<keyof SystemSettingsFormState>()
    return new Set(
      (Object.keys(formData) as Array<keyof SystemSettingsFormState>).filter(
        (key) => formData[key] !== baselineData[key]
      )
    )
  }, [baselineData, formData])

  const lastUpdatedAt = settings ? new Date(settings.updatedAt) : null
  const createdAt = settings ? new Date(settings.createdAt) : null

  const summaryCards = useMemo(
    () => [
      {
        label: 'Last Sync',
        value: formatRelativeTime(lastUpdatedAt),
        helper: [
          lastUpdatedAt ? `Updated ${lastUpdatedAt.toLocaleString()}` : 'Not yet saved',
          createdAt ? `Created ${createdAt.toLocaleDateString()}` : null,
        ]
          .filter(Boolean)
          .join(' • '),
        icon: RefreshCw,
        accent: 'text-primary-300',
        dirty: false,
      },
      {
        label: 'Maintenance Mode',
        value: formData.maintenanceMode ? 'Active' : 'Off',
        helper: formData.maintenanceMode
          ? 'Visitors see the maintenance banner.'
          : 'Platform fully accessible.',
        icon: Shield,
        accent: formData.maintenanceMode ? 'text-amber-300' : 'text-emerald-300',
        dirty:
          changedFields.has('maintenanceMode') || changedFields.has('maintenanceMessage'),
      },
      {
        label: 'Throughput & Limits',
        value: `${formatNumber(formData.rateLimit)} req/min`,
        helper: `Session timeout ${formatDuration(formData.sessionTimeout)} • Upload cap ${formatBytes(
          formData.maxUploadSize
        )}`,
        icon: Database,
        accent: 'text-blue-300',
        dirty:
          changedFields.has('rateLimit') ||
          changedFields.has('sessionTimeout') ||
          changedFields.has('maxUploadSize') ||
          changedFields.has('maxUserListItems'),
      },
      {
        label: 'Sign-ups',
        value: formData.registrationEnabled ? 'Open' : 'Closed',
        helper: formData.emailVerificationRequired
          ? 'Email verification required'
          : 'Email verification optional',
        icon: Globe,
        accent: formData.registrationEnabled ? 'text-primary-300' : 'text-rose-300',
        dirty:
          changedFields.has('registrationEnabled') ||
          changedFields.has('emailVerificationRequired'),
      },
    ],
    [changedFields, createdAt, formData, lastUpdatedAt]
  )

  const isSectionDirty = (keys: Array<keyof SystemSettingsFormState>) =>
    keys.some((key) => changedFields.has(key))

  const activeFeatureSummary = useMemo(() => {
    const list: string[] = []
    if (formData.enableRecommendations) list.push('Recommendations')
    if (formData.enableSocialFeatures) list.push('Social')
    if (formData.registrationEnabled) list.push('Registration')
    if (formData.emailVerificationRequired) list.push('Email verification')
    if (!formData.maintenanceMode) list.push('Live traffic')
    else list.push('Maintenance banner')
    return list
  }, [formData])

  const maintenanceMessageError =
    formData.maintenanceMode && formData.maintenanceMessage.trim().length === 0
      ? 'Maintenance message is required when maintenance mode is enabled.'
      : null

  const validationErrors: string[] = []
  if (maintenanceMessageError) validationErrors.push(maintenanceMessageError)

  const isFormValid = validationErrors.length === 0
  const disableSave = saving || isResetting || loading || !hasChanges || !isFormValid
  const disableReset = saving || isResetting || loading

  if (loading && !hasLoadedOnce) {
    return <LoadingState variant="inline" text="Loading system settings..." size="md" />
  }

  if (loadError && !settings) {
    return (
      <ErrorState
        variant="inline"
        title="Unable to load system settings"
        message={loadError}
        showRetry
        showHome={false}
        onRetry={loadSettings}
      />
    )
  }

  if (!settings) {
    return (
      <EmptyState
        icon={<Settings className="h-10 w-10 text-primary-300" />}
        title="No system settings found"
        message="System settings have not been configured yet. Reset to defaults to bootstrap initial values."
        actionLabel="Reset to defaults"
        onAction={handleReset}
        secondaryActionLabel="Retry"
        onSecondaryAction={loadSettings}
      />
    )
  }

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-primary-500/10 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-3 rounded-xl bg-white/5 px-3 py-1.5 border border-white/10 text-sm text-primary-200">
              <Settings className="h-4 w-4" />
              System Settings
          </div>
          <div>
              <h2 className="text-3xl font-semibold text-white">Control Platform Defaults</h2>
              <p className="text-sm text-gray-400">
                Manage global toggles, rate limits, and maintenance mode in one place.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Last synced {formatRelativeTime(lastUpdatedAt)}
                </span>
                {hasChanges && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-amber-200">
                    Pending edits
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button
              onClick={handleRefresh}
            variant="outline"
            size="sm"
              disabled={loading || saving}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
            <Button
            onClick={handleReset}
              variant="outline"
              size="sm"
              disabled={disableReset}
            className="border-white/20 text-white hover:bg-white/10"
          >
              <RotateCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Reset to Defaults</span>
          </Button>
          <Button
            onClick={handleSave}
              disabled={disableSave}
              className="bg-primary-500 text-white hover:bg-primary-500/90"
          >
              <Save className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={`rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-200 ${
                card.dirty ? 'border-primary-500/50 shadow-[0_0_25px_rgba(56,189,248,0.2)]' : ''
              }`}
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
                <Icon className={`h-4 w-4 ${card.accent}`} />
                <span>{card.label}</span>
                {card.dirty && (
                  <span className="rounded-full bg-primary-500/20 px-2 py-0.5 text-[10px] font-semibold text-primary-100">
                    Updated
                  </span>
                )}
              </div>
              <div className="mt-2 text-lg font-semibold text-white">{card.value}</div>
              {card.helper && <p className="mt-1 text-xs text-gray-400">{card.helper}</p>}
            </div>
          )
        })}
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-200">
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* App Status Badge (Simplified) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">App Status Badge</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={loadBadge}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
                disabled={badgeLoading}
              >
                <RefreshCw className={`h-4 w-4 ${badgeLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={saveBadge}
                size="sm"
                className="bg-amber-500/80 hover:bg-amber-500 text-white"
                disabled={badgeSaving}
              >
                <Save className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{badgeSaving ? 'Saving...' : 'Save'}</span>
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Control the small badge shown at the top-left of the app (e.g., alpha, beta). Choose
            “None” to hide the badge entirely.
          </p>
          {badgeError && (
            <div className="mb-3 rounded border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-200">
              {badgeError}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={badgeStatus}
                onChange={(e) => setBadgeStatus(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:border-primary-500/50"
              >
                {presetStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">
                Preset options. Select “None” to disable the badge.
              </p>
            </div>
          </div>
        </div>

        {/* User Limits */}
        <div
          className={`rounded-2xl border border-white/10 bg-white/5 p-6 transition-all ${
            isSectionDirty(['maxUserListItems', 'maxUploadSize']) ? 'border-primary-500/60 shadow-[0_0_25px_rgba(59,130,246,0.25)]' : ''
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">
              User Limits
              {isSectionDirty(['maxUserListItems', 'maxUploadSize']) && (
                <span className="ml-2 text-xs font-medium text-primary-200">Updated</span>
              )}
            </h3>
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
                onChange={handleNumericChange('maxUserListItems', 100, 50000)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:outline-none focus:border-primary-500"
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
                onChange={handleNumericChange('maxUploadSize', 1048576, 104857600)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:outline-none focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">Current: {formatBytes(formData.maxUploadSize)}</p>
            </div>
          </div>
        </div>

        {/* Security & Rate Limiting */}
        <div
          className={`rounded-2xl border border-white/10 bg-white/5 p-6 transition-all ${
            isSectionDirty(['rateLimit', 'sessionTimeout']) ? 'border-primary-500/60 shadow-[0_0_25px_rgba(59,130,246,0.25)]' : ''
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">
              Security
              {isSectionDirty(['rateLimit', 'sessionTimeout']) && (
                <span className="ml-2 text-xs font-medium text-primary-200">Updated</span>
              )}
            </h3>
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
                onChange={handleNumericChange('rateLimit', 10, 10000)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:outline-none focus:border-primary-500"
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
                onChange={handleNumericChange('sessionTimeout', 3600, 2592000)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:outline-none focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {formatDuration(formData.sessionTimeout)} (
                {Math.round(formData.sessionTimeout / 60)} minutes)
              </p>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div
          className={`rounded-2xl border border-white/10 bg-white/5 p-6 transition-all ${
            isSectionDirty([
              'enableRecommendations',
              'enableSocialFeatures',
              'registrationEnabled',
              'emailVerificationRequired',
              'maintenanceMode',
              'maintenanceMessage',
            ])
              ? 'border-primary-500/60 shadow-[0_0_25px_rgba(59,130,246,0.25)]'
              : ''
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">
              Features
              {isSectionDirty([
                'enableRecommendations',
                'enableSocialFeatures',
                'registrationEnabled',
                'emailVerificationRequired',
                'maintenanceMode',
                'maintenanceMessage',
              ]) && <span className="ml-2 text-xs font-medium text-primary-200">Updated</span>}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/10 p-3 text-xs text-gray-300">
              <span className="font-semibold text-white">Active:</span>{' '}
              {activeFeatureSummary.length > 0
                ? activeFeatureSummary.join(' • ')
                : 'No user-facing features enabled.'}
            </div>

            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Enable Recommendations</span>
              <input
                type="checkbox"
                checked={formData.enableRecommendations}
                onChange={handleCheckboxChange('enableRecommendations')}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Enable Social Features</span>
              <input
                type="checkbox"
                checked={formData.enableSocialFeatures}
                onChange={handleCheckboxChange('enableSocialFeatures')}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Registration Enabled</span>
              <input
                type="checkbox"
                checked={formData.registrationEnabled}
                onChange={handleCheckboxChange('registrationEnabled')}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Email Verification Required</span>
              <input
                type="checkbox"
                checked={formData.emailVerificationRequired}
                onChange={handleCheckboxChange('emailVerificationRequired')}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Maintenance Mode</span>
              <input
                type="checkbox"
                checked={formData.maintenanceMode}
                onChange={handleCheckboxChange('maintenanceMode')}
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
                  onChange={handleTextChange('maintenanceMessage')}
                  rows={3}
                  placeholder="We'll be back soon!"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:outline-none focus:border-red-500 resize-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
        <p className="text-sm text-gray-300">
          <strong className="text-blue-400">Note:</strong> Changes to these settings will affect all
          users immediately. Be careful when enabling maintenance mode or changing rate limits.
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Fields tagged as <span className="text-primary-300 font-semibold">Updated</span> reflect
          unsaved edits. Save or refresh to reconcile with the live configuration.
        </p>
      </div>
    </div>
  )
}
