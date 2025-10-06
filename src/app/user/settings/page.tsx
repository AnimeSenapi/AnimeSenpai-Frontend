'use client'

import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import { RequireAuth } from '../../lib/protected-route'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Eye, 
  EyeOff,
  Save,
  ArrowLeft,
  Mail,
  Lock,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX
} from 'lucide-react'

export default function UserSettingsPage() {
  const [settings, setSettings] = useState({
    // Profile Settings
    name: 'Anime Fan',
    email: 'user@animesenpai.app',
    bio: 'Passionate anime enthusiast exploring new worlds through animation.',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    newEpisodes: true,
    recommendations: false,
    socialUpdates: true,
    
    // Privacy Settings
    profileVisibility: 'public', // public, friends, private
    showWatchHistory: true,
    showFavorites: true,
    showRatings: true,
    allowMessages: true,
    
    // Display Settings
    theme: 'dark', // light, dark, auto
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    
    // Playback Settings
    autoplay: true,
    skipIntro: true,
    skipOutro: true,
    defaultQuality: '1080p',
    subtitles: true,
    volume: 80
  })

  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    // Simulate saving settings
    console.log('Settings saved:', settings)
    setIsEditing(false)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'display', label: 'Display', icon: Palette },
    { id: 'playback', label: 'Playback', icon: Monitor }
  ]

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="container pt-32 pb-20 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <Settings className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-gray-300">Manage your account preferences</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600"
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => setSettings({...settings, name: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({...settings, email: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                    <textarea
                      value={settings.bio}
                      onChange={(e) => setSettings({...settings, bio: e.target.value})}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Notification Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-cyan-400" />
                        <div>
                          <div className="text-white font-medium">Email Notifications</div>
                          <div className="text-gray-400 text-sm">Receive updates via email</div>
                        </div>
                      </div>
                      <Checkbox
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked as boolean})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-cyan-400" />
                        <div>
                          <div className="text-white font-medium">Push Notifications</div>
                          <div className="text-gray-400 text-sm">Get notified on your device</div>
                        </div>
                      </div>
                      <Checkbox
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked as boolean})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-cyan-400" />
                        <div>
                          <div className="text-white font-medium">Weekly Digest</div>
                          <div className="text-gray-400 text-sm">Weekly summary of new content</div>
                        </div>
                      </div>
                      <Checkbox
                        checked={settings.weeklyDigest}
                        onCheckedChange={(checked) => setSettings({...settings, weeklyDigest: checked as boolean})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-cyan-400" />
                        <div>
                          <div className="text-white font-medium">New Episodes</div>
                          <div className="text-gray-400 text-sm">Notify when new episodes are available</div>
                        </div>
                      </div>
                      <Checkbox
                        checked={settings.newEpisodes}
                        onCheckedChange={(checked) => setSettings({...settings, newEpisodes: checked as boolean})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Privacy Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-cyan-400" />
                        <div>
                          <div className="text-white font-medium">Show Watch History</div>
                          <div className="text-gray-400 text-sm">Allow others to see what you've watched</div>
                        </div>
                      </div>
                      <Checkbox
                        checked={settings.showWatchHistory}
                        onCheckedChange={(checked) => setSettings({...settings, showWatchHistory: checked as boolean})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-cyan-400" />
                        <div>
                          <div className="text-white font-medium">Show Favorites</div>
                          <div className="text-gray-400 text-sm">Display your favorite anime publicly</div>
                        </div>
                      </div>
                      <Checkbox
                        checked={settings.showFavorites}
                        onCheckedChange={(checked) => setSettings({...settings, showFavorites: checked as boolean})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-cyan-400" />
                        <div>
                          <div className="text-white font-medium">Allow Messages</div>
                          <div className="text-gray-400 text-sm">Let other users send you messages</div>
                        </div>
                      </div>
                      <Checkbox
                        checked={settings.allowMessages}
                        onCheckedChange={(checked) => setSettings({...settings, allowMessages: checked as boolean})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Display Settings */}
              {activeTab === 'display' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Display Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                      <select
                        value={settings.theme}
                        onChange={(e) => setSettings({...settings, theme: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                      <select
                        value={settings.language}
                        onChange={(e) => setSettings({...settings, language: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="ja">Japanese</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Playback Settings */}
              {activeTab === 'playback' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Playback Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-cyan-400" />
                        <div>
                          <div className="text-white font-medium">Autoplay</div>
                          <div className="text-gray-400 text-sm">Automatically play next episode</div>
                        </div>
                      </div>
                      <Checkbox
                        checked={settings.autoplay}
                        onCheckedChange={(checked) => setSettings({...settings, autoplay: checked as boolean})}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Volume2 className="h-5 w-5 text-cyan-400" />
                        <div>
                          <div className="text-white font-medium">Default Volume</div>
                          <div className="text-gray-400 text-sm">Set default volume level</div>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.volume}
                        onChange={(e) => setSettings({...settings, volume: parseInt(e.target.value)})}
                        className="w-24"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/25"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </RequireAuth>
  )
}
