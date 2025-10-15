'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, User, UserPlus, UserMinus, UserCheck, Users, 
  Heart, BookMarked, MessageCircle, Settings as SettingsIcon,
  Lock, Loader2, Calendar, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LoadingState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/error-state'
import { useAuth } from '@/app/lib/auth-context'
import {
  apiGetUserProfile,
  apiGetRelationshipStatus,
  apiFollowUser,
  apiUnfollowUser,
  apiSendFriendRequest,
  apiUnfriend
} from '@/app/lib/api'
import { cn } from '@/app/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface UserProfile {
  user: {
    id: string
    username: string
    name?: string | null
    avatar?: string | null
    bio?: string | null
    createdAt: string
    role: string
  }
  stats: {
    followers: number
    following: number
    friends: number
    animeCount: number
    reviewsCount: number
  }
  privacy: {
    profileVisibility: string
    listVisibility: string
    activityVisibility: string
    friendsVisibility: string
    reviewsVisibility: string
  }
}

interface RelationshipStatus {
  isFollowing: boolean
  isFollowedBy: boolean
  isFriend: boolean
  pendingFriendRequest: {
    id: string
    sentByMe: boolean
    sender: { id: string; username: string }
    receiver: { id: string; username: string }
  } | null
}

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = use(params)
  const router = useRouter()
  const { user: currentUser } = useAuth()
  
  // Strip @ symbol if present in the URL (UPDATED - Cache Bust v2)
  const username = rawUsername.startsWith('@') ? rawUsername.slice(1) : rawUsername
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [relationship, setRelationship] = useState<RelationshipStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOwnProfile = currentUser?.username === username

  useEffect(() => {
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const profileData = await apiGetUserProfile(username) as any
      setProfile(profileData as UserProfile)
      
      // Get relationship status if logged in and not own profile
      if (currentUser && !isOwnProfile) {
        try {
          const relationshipData = await apiGetRelationshipStatus(profileData.user.id)
          setRelationship(relationshipData as RelationshipStatus)
        } catch (relErr) {
          // Silently fail - relationship status is not critical
          console.debug('Could not load relationship status:', relErr)
          setRelationship(null)
        }
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!profile || !currentUser) return
    
    try {
      setActionLoading(true)
      
      if (relationship?.isFollowing) {
        await apiUnfollowUser(profile.user.id)
        setRelationship(relationship ? { ...relationship, isFollowing: false } : null)
      } else {
        await apiFollowUser(profile.user.id)
        setRelationship(relationship ? { ...relationship, isFollowing: true } : null)
      }
      
      // Reload profile to get fresh relationship status
      await loadProfile()
      
    } catch (err: any) {
      console.error('Follow action failed:', err)
      alert('Failed to follow user. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleFriendRequest = async () => {
    if (!profile || !currentUser) return
    
    try {
      setActionLoading(true)
      
      if (relationship?.isFriend) {
        // Unfriend
        if (confirm('Are you sure you want to unfriend this user?')) {
          await apiUnfriend(profile.user.id)
          setRelationship(relationship ? { ...relationship, isFriend: false } : null)
          await loadProfile()
        } else {
          setActionLoading(false)
          return
        }
      } else if (relationship?.pendingFriendRequest) {
        // Can't do anything if request pending
        setActionLoading(false)
        return
      } else {
        // Send request
        await apiSendFriendRequest(profile.user.id)
        await loadProfile()
      }
      
    } catch (err: any) {
      console.error('Friend action failed:', err)
      alert('Failed to send friend request. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <LoadingState text="Loading profile..." />
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center p-6">
        <EmptyState
          icon={<User className="h-12 w-12 text-gray-500" />}
          title="User Not Found"
          message={error || 'The user you\'re looking for doesn\'t exist.'}
          actionLabel="Back to Dashboard"
          onAction={() => router.push('/dashboard')}
        />
      </div>
    )
  }

  const { user, stats, privacy } = profile

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      {/* Header Background */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-r from-primary-900/30 via-secondary-900/30 to-primary-900/30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950" />
      </div>

      {/* Profile Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        {/* Back Button */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            {/* Avatar */}
            <div className="relative">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.username}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-white/10"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border-4 border-white/10 flex items-center justify-center">
                  <User className="h-12 w-12 sm:h-16 sm:w-16 text-primary-400" />
                </div>
              )}
              
              {/* Role Badge */}
              {user.role !== 'user' && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <Badge className={cn(
                    "text-xs font-semibold px-3 py-1",
                    user.role === 'admin' ? 'bg-error-500/20 text-error-400 border-error-500/30' :
                    user.role === 'tester' ? 'bg-warning-500/20 text-warning-400 border-warning-500/30' :
                    'bg-primary-500/20 text-primary-400 border-primary-500/30'
                  )}>
                    {user.role.toUpperCase()}
                  </Badge>
                </div>
              )}
            </div>

            {/* Info & Actions */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {user.name || user.username}
                  </h1>
                  <p className="text-gray-400">@{user.username}</p>
                </div>

                {/* Action Buttons */}
                {!isOwnProfile && currentUser && (
                  <div className="flex gap-2">
                    {/* Follow Button */}
                    <Button
                      onClick={handleFollow}
                      disabled={actionLoading}
                      variant={relationship?.isFollowing ? 'outline' : 'default'}
                      className={cn(
                        relationship?.isFollowing
                          ? 'border-white/20 text-white hover:bg-white/10'
                          : 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600'
                      )}
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : relationship?.isFollowing ? (
                        <UserMinus className="h-4 w-4 mr-2" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      {relationship?.isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>

                    {/* Friend Button */}
                    <Button
                      onClick={handleFriendRequest}
                      disabled={actionLoading || !!relationship?.pendingFriendRequest}
                      variant={relationship?.isFriend ? 'outline' : 'default'}
                      className={cn(
                        relationship?.isFriend || relationship?.pendingFriendRequest
                          ? 'border-white/20 text-white hover:bg-white/10'
                          : 'bg-gradient-to-r from-secondary-500 to-primary-500 hover:from-secondary-600 hover:to-primary-600'
                      )}
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : relationship?.isFriend ? (
                        <UserCheck className="h-4 w-4 mr-2" />
                      ) : relationship?.pendingFriendRequest ? (
                        <UserCheck className="h-4 w-4 mr-2" />
                      ) : (
                        <Users className="h-4 w-4 mr-2" />
                      )}
                      {relationship?.isFriend
                        ? 'Friends'
                        : relationship?.pendingFriendRequest?.sentByMe
                        ? 'Request Sent'
                        : relationship?.pendingFriendRequest
                        ? 'Request Pending'
                        : 'Add Friend'}
                    </Button>
                  </div>
                )}

                {/* Settings Button (Own Profile) */}
                {isOwnProfile && (
                  <Link href="/user/settings">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-gray-300 mb-4 max-w-2xl">{user.bio}</p>
              )}

              {/* Member Since */}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Member since {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          <Separator className="my-6 bg-white/10" />

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl sm:text-3xl font-bold text-primary-400 mb-1">
                {stats.animeCount}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Anime</div>
            </div>
            
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl sm:text-3xl font-bold text-secondary-400 mb-1">
                {stats.reviewsCount}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Reviews</div>
            </div>
            
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl sm:text-3xl font-bold text-success-400 mb-1">
                {stats.friends}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Friends</div>
            </div>
            
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl sm:text-3xl font-bold text-warning-400 mb-1">
                {stats.followers}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Followers</div>
            </div>
            
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl sm:text-3xl font-bold text-planning-400 mb-1">
                {stats.following}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Following</div>
            </div>
          </div>

          {/* Privacy Notice */}
          {privacy.profileVisibility === 'private' && !isOwnProfile && (
            <div className="bg-warning-500/10 border border-warning-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Lock className="h-5 w-5 text-warning-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-warning-400 font-semibold mb-1">Private Profile</h3>
                <p className="text-sm text-gray-300">
                  This user's profile is private. Some information may be hidden.
                </p>
              </div>
            </div>
          )}

          {/* Content Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Anime List */}
            {(privacy.listVisibility === 'public' || isOwnProfile) && (
              <Link href={`/user/${username}/list`}>
                <div className="glass rounded-xl p-6 border border-white/10 hover:border-primary-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <BookMarked className="h-8 w-8 text-primary-400" />
                    <span className="text-2xl font-bold text-white">{stats.animeCount}</span>
                  </div>
                  <h3 className="text-white font-semibold mb-1 group-hover:text-primary-400 transition-colors">
                    Anime List
                  </h3>
                  <p className="text-sm text-gray-400">View their collection</p>
                </div>
              </Link>
            )}

            {/* Reviews */}
            {(privacy.reviewsVisibility === 'public' || isOwnProfile) && (
              <Link href={`/user/${username}/reviews`}>
                <div className="glass rounded-xl p-6 border border-white/10 hover:border-secondary-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <Star className="h-8 w-8 text-secondary-400" />
                    <span className="text-2xl font-bold text-white">{stats.reviewsCount}</span>
                  </div>
                  <h3 className="text-white font-semibold mb-1 group-hover:text-secondary-400 transition-colors">
                    Reviews
                  </h3>
                  <p className="text-sm text-gray-400">Read their thoughts</p>
                </div>
              </Link>
            )}

            {/* Friends */}
            {(privacy.friendsVisibility === 'public' || isOwnProfile) && (
              <Link href={`/user/${username}/friends`}>
                <div className="glass rounded-xl p-6 border border-white/10 hover:border-success-500/50 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <Users className="h-8 w-8 text-success-400" />
                    <span className="text-2xl font-bold text-white">{stats.friends}</span>
                  </div>
                  <h3 className="text-white font-semibold mb-1 group-hover:text-success-400 transition-colors">
                    Friends
                  </h3>
                  <p className="text-sm text-gray-400">See their connections</p>
                </div>
              </Link>
            )}
          </div>

          {/* Relationship Status */}
          {!isOwnProfile && relationship && (
            <div className="mt-6 flex flex-wrap gap-2 items-center text-sm">
              {relationship.isFollowedBy && (
                <Badge variant="outline" className="border-primary-500/30 text-primary-400">
                  Follows you
                </Badge>
              )}
              {relationship.isFriend && (
                <Badge variant="outline" className="border-success-500/30 text-success-400">
                  <Heart className="h-3 w-3 mr-1 fill-success-400" />
                  Friends
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

