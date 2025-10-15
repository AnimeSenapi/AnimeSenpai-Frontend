'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Users, 
  MessageCircle, 
  UserPlus,
  Activity as ActivityIcon,
  List,
  MessageSquare,
  Check,
  Loader2,
  Lock,
  Globe,
  Info
} from 'lucide-react'
import { Button } from '../../../../components/ui/button'
import { LoadingState } from '../../../../components/ui/loading-state'
import { useAuth } from '../../../lib/auth-context'
import { useToast } from '../../../../lib/toast-context'
import { cn } from '../../../lib/utils'

interface PrivacySettings {
  id: string
  userId: string
  profileVisibility: 'public' | 'friends' | 'private'
  showAnimeList: boolean
  showReviews: boolean
  showActivity: boolean
  showFriends: boolean
  allowMessages: boolean
  allowFriendRequests: boolean
  createdAt: string
  updatedAt: string
}

export default function PrivacySettingsPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const toast = useToast()
  
  const [settings, setSettings] = useState<PrivacySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }
    
    loadSettings()
  }, [isAuthenticated])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3003/api/trpc'
      const url = `${API_URL}/privacy.getSettings`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Failed to load privacy settings')
      }
      
      const json = await response.json()
      const data = json.result?.data
      
      if (data?.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error)
      toast.error('Failed to load privacy settings', 'Error')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: keyof PrivacySettings, value: any) => {
    if (!settings) return
    
    try {
      setSaving(true)
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3003/api/trpc'
      const url = `${API_URL}/privacy.updateSettings`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          [key]: value
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update privacy settings')
      }
      
      const json = await response.json()
      const data = json.result?.data
      
      if (data?.settings) {
        setSettings(data.settings)
        toast.success('Privacy settings updated', 'Success')
      }
    } catch (error) {
      console.error('Failed to update privacy settings:', error)
      toast.error('Failed to update privacy settings', 'Error')
    } finally {
      setSaving(false)
    }
  }

  const applyPreset = async (preset: 'public' | 'friends_only' | 'private') => {
    try {
      setSaving(true)
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3003/api/trpc'
      const url = `${API_URL}/privacy.applyPreset`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          preset
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to apply preset')
      }
      
      const json = await response.json()
      const data = json.result?.data
      
      if (data?.settings) {
        setSettings(data.settings)
        toast.success(`Applied "${preset.replace('_', ' ')}" preset`, 'Success')
      }
    } catch (error) {
      console.error('Failed to apply preset:', error)
      toast.error('Failed to apply preset', 'Error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingState variant="full" text="Loading privacy settings..." size="lg" />
  }

  if (!settings) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      <main className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Privacy Settings</h1>
              <p className="text-gray-400">Control who can see your content</p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="glass rounded-xl p-6 border border-white/10 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-primary-400" />
              Quick Presets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={() => applyPreset('public')}
                disabled={saving}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 justify-start"
              >
                <Globe className="h-4 w-4 mr-2" />
                <div className="text-left flex-1">
                  <div className="font-semibold">Public</div>
                  <div className="text-xs text-gray-400">Everyone can see</div>
                </div>
              </Button>
              <Button
                onClick={() => applyPreset('friends_only')}
                disabled={saving}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                <div className="text-left flex-1">
                  <div className="font-semibold">Friends Only</div>
                  <div className="text-xs text-gray-400">Only friends</div>
                </div>
              </Button>
              <Button
                onClick={() => applyPreset('private')}
                disabled={saving}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 justify-start"
              >
                <Lock className="h-4 w-4 mr-2" />
                <div className="text-left flex-1">
                  <div className="font-semibold">Private</div>
                  <div className="text-xs text-gray-400">Only you</div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Visibility */}
        <div className="glass rounded-xl p-6 border border-white/10 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Profile Visibility</h3>
          <p className="text-sm text-gray-400 mb-4">Who can see your profile</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => updateSetting('profileVisibility', 'public')}
              disabled={saving}
              className={cn(
                "p-4 rounded-lg border-2 transition-all text-left",
                settings.profileVisibility === 'public'
                  ? 'bg-primary-500/20 border-primary-500/50'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              )}
            >
              <Globe className={cn(
                "h-5 w-5 mb-2",
                settings.profileVisibility === 'public' ? 'text-primary-400' : 'text-gray-400'
              )} />
              <div className="font-semibold text-white">Public</div>
              <div className="text-xs text-gray-400">Everyone</div>
            </button>
            
            <button
              onClick={() => updateSetting('profileVisibility', 'friends')}
              disabled={saving}
              className={cn(
                "p-4 rounded-lg border-2 transition-all text-left",
                settings.profileVisibility === 'friends'
                  ? 'bg-primary-500/20 border-primary-500/50'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              )}
            >
              <Users className={cn(
                "h-5 w-5 mb-2",
                settings.profileVisibility === 'friends' ? 'text-primary-400' : 'text-gray-400'
              )} />
              <div className="font-semibold text-white">Friends Only</div>
              <div className="text-xs text-gray-400">Only friends</div>
            </button>
            
            <button
              onClick={() => updateSetting('profileVisibility', 'private')}
              disabled={saving}
              className={cn(
                "p-4 rounded-lg border-2 transition-all text-left",
                settings.profileVisibility === 'private'
                  ? 'bg-primary-500/20 border-primary-500/50'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              )}
            >
              <Lock className={cn(
                "h-5 w-5 mb-2",
                settings.profileVisibility === 'private' ? 'text-primary-400' : 'text-gray-400'
              )} />
              <div className="font-semibold text-white">Private</div>
              <div className="text-xs text-gray-400">Only you</div>
            </button>
          </div>
        </div>

        {/* Content Visibility */}
        <div className="glass rounded-xl p-6 border border-white/10 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Content Visibility</h3>
          <p className="text-sm text-gray-400 mb-6">Control what others can see</p>
          
          <div className="space-y-4">
            {/* Anime List */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <List className="h-5 w-5 text-primary-400" />
                <div>
                  <div className="font-medium text-white">Anime List</div>
                  <div className="text-xs text-gray-400">Your watchlist and favorites</div>
                </div>
              </div>
              <button
                onClick={() => updateSetting('showAnimeList', !settings.showAnimeList)}
                disabled={saving}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  settings.showAnimeList ? 'bg-success-500' : 'bg-gray-600'
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                  settings.showAnimeList ? 'right-0.5' : 'left-0.5'
                )} />
              </button>
            </div>

            {/* Reviews */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary-400" />
                <div>
                  <div className="font-medium text-white">Reviews</div>
                  <div className="text-xs text-gray-400">Your anime reviews</div>
                </div>
              </div>
              <button
                onClick={() => updateSetting('showReviews', !settings.showReviews)}
                disabled={saving}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  settings.showReviews ? 'bg-success-500' : 'bg-gray-600'
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                  settings.showReviews ? 'right-0.5' : 'left-0.5'
                )} />
              </button>
            </div>

            {/* Activity */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <ActivityIcon className="h-5 w-5 text-primary-400" />
                <div>
                  <div className="font-medium text-white">Activity</div>
                  <div className="text-xs text-gray-400">What you're currently watching</div>
                </div>
              </div>
              <button
                onClick={() => updateSetting('showActivity', !settings.showActivity)}
                disabled={saving}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  settings.showActivity ? 'bg-success-500' : 'bg-gray-600'
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                  settings.showActivity ? 'right-0.5' : 'left-0.5'
                )} />
              </button>
            </div>

            {/* Friends List */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary-400" />
                <div>
                  <div className="font-medium text-white">Friends List</div>
                  <div className="text-xs text-gray-400">Who you're friends with</div>
                </div>
              </div>
              <button
                onClick={() => updateSetting('showFriends', !settings.showFriends)}
                disabled={saving}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  settings.showFriends ? 'bg-success-500' : 'bg-gray-600'
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                  settings.showFriends ? 'right-0.5' : 'left-0.5'
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* Interaction Settings */}
        <div className="glass rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Interaction Settings</h3>
          <p className="text-sm text-gray-400 mb-6">Control how others can interact with you</p>
          
          <div className="space-y-4">
            {/* Allow Messages */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-primary-400" />
                <div>
                  <div className="font-medium text-white">Direct Messages</div>
                  <div className="text-xs text-gray-400">Allow friends to message you</div>
                </div>
              </div>
              <button
                onClick={() => updateSetting('allowMessages', !settings.allowMessages)}
                disabled={saving}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  settings.allowMessages ? 'bg-success-500' : 'bg-gray-600'
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                  settings.allowMessages ? 'right-0.5' : 'left-0.5'
                )} />
              </button>
            </div>

            {/* Allow Friend Requests */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <UserPlus className="h-5 w-5 text-primary-400" />
                <div>
                  <div className="font-medium text-white">Friend Requests</div>
                  <div className="text-xs text-gray-400">Allow others to send friend requests</div>
                </div>
              </div>
              <button
                onClick={() => updateSetting('allowFriendRequests', !settings.allowFriendRequests)}
                disabled={saving}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  settings.allowFriendRequests ? 'bg-success-500' : 'bg-gray-600'
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                  settings.allowFriendRequests ? 'right-0.5' : 'left-0.5'
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Info */}
        <div className="mt-6 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-2">About Privacy Settings</p>
              <ul className="space-y-1 text-gray-400">
                <li>• <strong>Public:</strong> Everyone can see this content</li>
                <li>• <strong>Friends Only:</strong> Only your friends can see this content</li>
                <li>• <strong>Private:</strong> Only you can see this content</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Saving Indicator */}
        {saving && (
          <div className="fixed bottom-4 right-4 glass px-4 py-3 rounded-lg border border-white/10 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary-400" />
            <span className="text-sm text-white">Saving...</span>
          </div>
        )}
      </main>
    </div>
  )
}

