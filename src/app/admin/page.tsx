'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../lib/auth-context'
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Film, 
  Settings,
  Shield,
  TrendingUp,
  UserPlus,
  Database,
  Activity
} from 'lucide-react'

// Import tab components
import { DashboardTab } from './components/DashboardTab'
import { UsersTab } from './components/UsersTab'
import { ContentTab } from './components/ContentTab'
import { AnimeTab } from './components/AnimeTab'
import { SettingsTab } from './components/SettingsTab'

type Tab = 'dashboard' | 'users' | 'content' | 'anime' | 'settings'

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  // Check if user is admin
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    router.push('/dashboard')
    return null
  }

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users' as Tab, label: 'Users', icon: Users },
    { id: 'content' as Tab, label: 'Content', icon: MessageSquare },
    { id: 'anime' as Tab, label: 'Anime', icon: Film },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-gray-400 text-sm">Manage your AnimeSenpai platform</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="glass rounded-xl p-2 border border-white/10 inline-flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'content' && <ContentTab />}
            {activeTab === 'anime' && <AnimeTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

