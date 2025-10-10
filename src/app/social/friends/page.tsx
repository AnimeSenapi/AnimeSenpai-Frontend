'use client'

import { useState } from 'react'
import { Users, UserPlus, UserCheck } from 'lucide-react'
import { FollowList } from '../../../components/social/FollowList'
import { useAuth } from '../../lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'

type TabType = 'friends' | 'followers' | 'following'

export default function FriendsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('friends')

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    router.push('/auth/signin')
    return null
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  const tabs: Array<{ id: TabType; label: string; icon: any }> = [
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'followers', label: 'Followers', icon: UserCheck },
    { id: 'following', label: 'Following', icon: UserPlus }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors text-sm mb-4 inline-block"
            >
              ← Back to Dashboard
            </Link>
            
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center">
                <Users className="h-7 w-7 text-primary-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  Social
                </h1>
                <p className="text-gray-400">Connect with other anime fans</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="glass rounded-2xl p-2 mb-8">
            <div className="flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                      ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="glass rounded-2xl p-6">
            {activeTab === 'friends' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-2">Mutual Follows</h2>
                  <p className="text-gray-400 text-sm">People you follow who also follow you back</p>
                </div>
                <FollowList userId={user.id} type="friends" limit={50} />
              </div>
            )}

            {activeTab === 'followers' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-2">Your Followers</h2>
                  <p className="text-gray-400 text-sm">People who follow you</p>
                </div>
                <FollowList userId={user.id} type="followers" limit={50} />
              </div>
            )}

            {activeTab === 'following' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-2">Following</h2>
                  <p className="text-gray-400 text-sm">People you follow</p>
                </div>
                <FollowList userId={user.id} type="following" limit={50} />
              </div>
            )}
          </div>

          {/* Discover More */}
          <div className="glass rounded-2xl p-6 mt-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserPlus className="h-6 w-6 text-secondary-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Discover More Users</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Find people with similar anime taste by viewing public profiles
                </p>
                <Link href="/search">
                  <Button className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white">
                    Browse Anime
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

