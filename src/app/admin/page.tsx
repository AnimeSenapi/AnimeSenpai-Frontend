'use client'

import { useState } from 'react'
import { AdminRoute } from '../lib/admin-route'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Film,
  Activity,
  BarChart3,
  Settings,
  Shield,
  Lock,
} from 'lucide-react'

// Import tab components dynamically for code splitting (lazy load)
import {
  DynamicDashboardTab,
  DynamicUsersTab,
  DynamicAnimeTab,
  DynamicSettingsTab,
} from '../../components/DynamicComponents'
import { ContentTab } from './components/ContentTab'
import { PerformanceTab } from './components/PerformanceTab'
import { AnalyticsTab } from './components/AnalyticsTab'
import { RoleManagementTab } from './components/RoleManagementTab'
import PermissionsTab from './components/PermissionsTab'
import { SystemSettingsTab } from './components/SystemSettingsTab'

type Tab =
  | 'dashboard'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'content'
  | 'anime'
  | 'performance'
  | 'analytics'
  | 'settings'
  | 'system'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users' as Tab, label: 'Users', icon: Users },
    { id: 'roles' as Tab, label: 'Roles', icon: Shield },
    { id: 'permissions' as Tab, label: 'Permissions', icon: Lock },
    { id: 'content' as Tab, label: 'Content', icon: MessageSquare },
    { id: 'anime' as Tab, label: 'Anime', icon: Film },
    { id: 'performance' as Tab, label: 'Performance', icon: Activity },
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
    { id: 'system' as Tab, label: 'System', icon: Settings },
    { id: 'settings' as Tab, label: 'User Settings', icon: Settings },
  ]

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header - Responsive */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Manage your AnimeSenpai platform
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Navigation - Mobile-optimized with better touch targets */}
            <div className="mb-4 sm:mb-6">
              <div className="glass rounded-xl p-2 sm:p-2 border border-white/10">
                {/* Mobile: Vertical stack for better usability */}
                <div className="sm:hidden grid grid-cols-2 gap-2">
                  {tabs.slice(0, 6).map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-all touch-manipulation min-h-[48px] ${
                          activeTab === tab.id
                            ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
                
                {/* Desktop: Horizontal scroll */}
                <div className="hidden sm:flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 touch-manipulation ${
                          activeTab === tab.id
                            ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.slice(0, 1)}</span>
                      </button>
                    )
                  })}
                </div>
                
                {/* Mobile: Additional tabs in second row if needed */}
                {tabs.length > 6 && (
                  <div className="sm:hidden grid grid-cols-2 gap-2 mt-2">
                    {tabs.slice(6).map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-all touch-manipulation min-h-[48px] ${
                            activeTab === tab.id
                              ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Tab Content - Mobile-optimized with better spacing */}
            <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/10 min-h-[400px] sm:min-h-[500px]">
              <div className="space-y-4 sm:space-y-6">
                {activeTab === 'dashboard' && <DynamicDashboardTab />}
                {activeTab === 'users' && <DynamicUsersTab />}
                {activeTab === 'roles' && <RoleManagementTab />}
                {activeTab === 'permissions' && <PermissionsTab />}
                {activeTab === 'content' && <ContentTab />}
                {activeTab === 'anime' && <DynamicAnimeTab />}
                {activeTab === 'performance' && <PerformanceTab />}
                {activeTab === 'analytics' && <AnalyticsTab />}
                {activeTab === 'system' && <SystemSettingsTab />}
                {activeTab === 'settings' && <DynamicSettingsTab />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  )
}
