'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, Users, Loader2 } from 'lucide-react'
import { FollowButton } from './FollowButton'
import { useAuth } from '../../app/lib/auth-context'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface FollowUser {
  id: string
  username: string
  name?: string
  avatar?: string
  bio?: string
  animeCount?: number
  isFollowing?: boolean
  isMutual?: boolean
}

interface FollowListProps {
  userId: string
  type: 'followers' | 'following' | 'friends'
  limit?: number
}

export function FollowList({ userId, type, limit = 20 }: FollowListProps) {
  const { getAuthHeaders } = useAuth()
  const [users, setUsers] = useState<FollowUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, type, limit])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      let endpoint = ''
      let params: any = {}

      if (type === 'followers') {
        endpoint = 'social.getFollowers'
        params = { userId, limit, offset: 0 }
      } else if (type === 'following') {
        endpoint = 'social.getFollowing'
        params = { userId, limit, offset: 0 }
      } else if (type === 'friends') {
        endpoint = 'social.getFriends'
        params = { limit }
      }

      const response = await fetch(
        `${API_URL}/${endpoint}?input=${encodeURIComponent(JSON.stringify(params))}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      )

      const data = await response.json()

      if (data.error) {
        setError(data.error.message || 'Failed to load users')
        return
      }

      if (data.result?.data) {
        if (type === 'friends') {
          setUsers(data.result.data.friends || [])
          setTotal(data.result.data.total || 0)
        } else {
          setUsers(data.result.data.users || [])
          setTotal(data.result.data.total || 0)
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowChange = (userId: string, isFollowing: boolean) => {
    // Update local state
    setUsers((prevUsers) => prevUsers.map((u) => (u.id === userId ? { ...u, isFollowing } : u)))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-primary-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-400">{error}</p>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">
          {type === 'followers' && 'No followers yet'}
          {type === 'following' && 'Not following anyone yet'}
          {type === 'friends' && 'No mutual follows yet'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 mb-4">
        {total} {type === 'friends' ? 'mutual' : ''} {type}
      </div>

      {users.map((user) => (
        <div
          key={user.id}
          className="glass rounded-xl p-4 flex items-start gap-4 hover:bg-white/5 transition-colors"
        >
          {/* Avatar */}
          <Link href={`/user/@${user.username}`}>
            {user.avatar ? (
              <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                <Image
                  src={user.avatar}
                  alt={user.username}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            )}
          </Link>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <Link href={`/user/@${user.username}`}>
              <h3 className="text-white font-semibold hover:text-primary-400 transition-colors truncate">
                @{user.username}
              </h3>
            </Link>
            {user.name && <p className="text-gray-400 text-sm truncate">{user.name}</p>}
            {user.bio && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{user.bio}</p>}
            {user.animeCount !== undefined && (
              <p className="text-gray-500 text-xs mt-1">{user.animeCount} anime in list</p>
            )}
            {user.isMutual && (
              <span className="inline-flex items-center gap-1 text-xs text-primary-400 mt-1">
                <Users className="h-3 w-3" />
                Mutual
              </span>
            )}
          </div>

          {/* Follow Button */}
          <div className="flex-shrink-0">
            <FollowButton
              userId={user.id}
              username={user.username}
              initialFollowing={user.isFollowing}
              onFollowChange={(isFollowing) => handleFollowChange(user.id, isFollowing)}
              size="sm"
              variant="outline"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
