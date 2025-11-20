'use client'

import { useState } from 'react'
import { AdminRoute } from '../lib/admin-route'

// Force dynamic rendering for admin page
export const dynamic = 'force-dynamic'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Film,
  Activity,
  BarChart3,
  Shield,
  Lock,
  Trophy,
  UserCog,
  Database,
  Monitor,
  Cog,
} from 'lucide-react'

// Import tab components dynamically for code splitting (lazy load)
import {
  DynamicDashboardTab,
  DynamicUsersTab,
  DynamicAnimeTab,
} from '../../components/DynamicComponents'
import { ContentTab } from './components/ContentTab'
import { PerformanceTab } from './components/PerformanceTab'
import { AnalyticsTab } from './components/AnalyticsTab'
import { RoleManagementTab } from './components/RoleManagementTab'
import PermissionsTab from './components/PermissionsTab'
import { SystemSettingsTab } from './components/SystemSettingsTab'
import { AchievementsTab } from './components/AchievementsTab'

type Tab =
  | 'dashboard'
  | 'user-management'
  | 'content-media'
  | 'analytics-performance'
  | 'system'


export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Overview', icon: LayoutDashboard },
    { id: 'user-management' as Tab, label: 'User Management', icon: UserCog },
    { id: 'content-media' as Tab, label: 'Content & Media', icon: Database },
    { id: 'analytics-performance' as Tab, label: 'Analytics & Performance', icon: Monitor },
    { id: 'system' as Tab, label: 'System', icon: Cog },
  ]

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-12 sm:pb-16 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header - Compact */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center border border-primary-500/30">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    Admin Panel
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Manage your AnimeSenpai platform
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Navigation - Compact and functional */}
            <div className="mb-4 sm:mb-6">
              <div className="glass rounded-xl p-2 border border-white/10">
                {/* Mobile: Compact grid */}
                <div className="sm:hidden grid grid-cols-2 gap-2">
                  {tabs.map((tab) => {
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
              </div>
            </div>

            {/* Tab Content - Mobile-optimized with better spacing */}
            <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/10 min-h-[400px] sm:min-h-[500px]">
              <div className="space-y-4 sm:space-y-6">
                {activeTab === 'dashboard' && <DynamicDashboardTab />}
                {activeTab === 'user-management' && <UserManagementTab />}
                {activeTab === 'content-media' && <ContentMediaTab />}
                {activeTab === 'analytics-performance' && <AnalyticsPerformanceTab />}
                {activeTab === 'system' && <SystemTab />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  )
}

// Combined Tab Components
function UserManagementTab() {
  const [subTab, setSubTab] = useState<'users' | 'roles' | 'permissions'>('users')

  return (
    <div className="space-y-4">
      {/* Compact Sub-tab Navigation */}
      <div className="flex gap-1 border-b border-white/10 pb-2">
        <button
          onClick={() => setSubTab('users')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            subTab === 'users'
              ? 'bg-primary-500/20 text-primary-300'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="h-4 w-4" />
          Users
        </button>
        <button
          onClick={() => setSubTab('roles')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            subTab === 'roles'
              ? 'bg-primary-500/20 text-primary-300'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="h-4 w-4" />
          Roles
        </button>
        <button
          onClick={() => setSubTab('permissions')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            subTab === 'permissions'
              ? 'bg-primary-500/20 text-primary-300'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Lock className="h-4 w-4" />
          Permissions
        </button>
      </div>

      {/* Sub-tab Content */}
      <div>
        {subTab === 'users' && <DynamicUsersTab />}
        {subTab === 'roles' && <RoleManagementTab />}
        {subTab === 'permissions' && <PermissionsTab />}
      </div>
    </div>
  )
}

function ContentMediaTab() {
  const [subTab, setSubTab] = useState<'anime' | 'content' | 'achievements'>('anime')

  return (
    <div className="space-y-4">
      {/* Compact Sub-tab Navigation */}
      <div className="flex gap-1 border-b border-white/10 pb-2">
        <button
          onClick={() => setSubTab('anime')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            subTab === 'anime'
              ? 'bg-primary-500/20 text-primary-300'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Film className="h-4 w-4" />
          Anime
        </button>
        <button
          onClick={() => setSubTab('content')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            subTab === 'content'
              ? 'bg-primary-500/20 text-primary-300'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Content
        </button>
        <button
          onClick={() => setSubTab('achievements')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            subTab === 'achievements'
              ? 'bg-primary-500/20 text-primary-300'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Trophy className="h-4 w-4" />
          Achievements
        </button>
      </div>

      {/* Sub-tab Content */}
      <div>
        {subTab === 'anime' && <DynamicAnimeTab />}
        {subTab === 'content' && <ContentTab />}
        {subTab === 'achievements' && <AchievementsTab />}
      </div>
    </div>
  )
}

function AnalyticsPerformanceTab() {
  const [subTab, setSubTab] = useState<'analytics' | 'performance'>('analytics')

  return (
    <div className="space-y-4">
      {/* Compact Sub-tab Navigation */}
      <div className="flex gap-1 border-b border-white/10 pb-2">
        <button
          onClick={() => setSubTab('analytics')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            subTab === 'analytics'
              ? 'bg-primary-500/20 text-primary-300'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Analytics
        </button>
        <button
          onClick={() => setSubTab('performance')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            subTab === 'performance'
              ? 'bg-primary-500/20 text-primary-300'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity className="h-4 w-4" />
          Performance
        </button>
      </div>

      {/* Sub-tab Content */}
      <div>
        {subTab === 'analytics' && <AnalyticsTab />}
        {subTab === 'performance' && <PerformanceTab />}
      </div>
    </div>
  )
}

function SystemTab() {
  return <SystemSettingsTab />
}
