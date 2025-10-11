'use client'

import { Settings, Bell, Lock, Globe } from 'lucide-react'

export function SettingsTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">System Settings</h2>
        <p className="text-gray-400">Configure platform settings and preferences</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
        <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Settings className="h-8 w-8 text-primary-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">System Settings Coming Soon</h3>
        <p className="text-gray-400 mb-6">This feature will allow you to configure site-wide settings, feature flags, and system preferences.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="bg-white/5 rounded-lg p-4">
            <Bell className="h-6 w-6 text-primary-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">Notifications</p>
            <p className="text-xs text-gray-500 mt-1">Configure email & alerts</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <Lock className="h-6 w-6 text-warning-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">Security</p>
            <p className="text-xs text-gray-500 mt-1">Manage security settings</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <Globe className="h-6 w-6 text-success-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">Site Config</p>
            <p className="text-xs text-gray-500 mt-1">General site settings</p>
          </div>
        </div>
      </div>
    </div>
  )
}

