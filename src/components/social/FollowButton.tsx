'use client'

import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { useAuth } from '../../app/lib/auth-context'
import { useToast } from '../ui/toast'

import { TRPC_URL as API_URL } from '@/app/lib/api'

interface FollowButtonProps {
  userId: string
  username: string
  initialFollowing?: boolean
  onFollowChange?: (isFollowing: boolean) => void
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline'
}

export function FollowButton({
  userId,
  username,
  initialFollowing = false,
  onFollowChange,
  size = 'default',
  variant = 'default',
}: FollowButtonProps) {
  const { user, getAuthHeaders } = useAuth()
  const { addToast } = useToast()
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)

  // Check if already following on mount
  useEffect(() => {
    if (!user) {
      setIsCheckingStatus(false)
      return
    }

    checkFollowingStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userId])

  const checkFollowingStatus = async () => {
    if (!user) return

    try {
      const response = await fetch(
        `${API_URL}/social.checkFollowing?input=${encodeURIComponent(JSON.stringify({ followerId: user.id, followingId: userId }))}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      )

      const data = await response.json()
      if (data.result?.data) {
        setIsFollowing(data.result.data.following)
      }
    } catch (error) {
      console.error('Error checking follow status:', error)
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const handleFollow = async () => {
    if (!user) {
      addToast({
        title: 'Sign In Required',
        description: 'Please sign in to follow users',
        variant: 'destructive',
      })
      return
    }

    if (user.id === userId) {
      addToast({
        title: 'Invalid Action',
        description: 'You cannot follow yourself!',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const endpoint = isFollowing ? 'social.unfollow' : 'social.follow'

      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (data.error) {
        addToast({
        title: 'Error',
        description: data.error.message || 'Failed to update follow status',
        variant: 'destructive',
      })
        return
      }

      const newFollowingState = !isFollowing
      setIsFollowing(newFollowingState)
      onFollowChange?.(newFollowingState)

      if (newFollowingState) {
        addToast({
        title: 'Following',
        description: `You are now following ${username}!`,
        variant: 'success',
      })
      } else {
        addToast({
        title: 'Unfollowed',
        description: `You unfollowed ${username}`,
        variant: 'default',
      })
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      addToast({
        title: 'Error',
        description: 'Failed to update follow status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show button if viewing own profile
  if (user && user.id === userId) {
    return null
  }

  // Don't show button if not logged in
  if (!user) {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={() => addToast({
        title: 'Sign In Required',
        description: 'Please sign in to follow users',
        variant: 'default',
      })}
        className="border-white/20 text-white hover:bg-white/10"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Follow
      </Button>
    )
  }

  if (isCheckingStatus) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={variant === 'default' ? 'bg-white/10' : 'border-white/20'}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleFollow}
      disabled={isLoading}
      className={
        isFollowing
          ? 'border-white/20 text-white hover:bg-error-500/20 hover:border-error-500 hover:text-error-400 group'
          : variant === 'default'
            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white'
            : 'border-white/20 text-white hover:bg-white/10'
      }
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2 group-hover:text-error-400" />
          <span className="group-hover:hidden">Following</span>
          <span className="hidden group-hover:inline">Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  )
}
