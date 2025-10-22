'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { AtSign, X } from 'lucide-react'
import { Badge } from '../ui/badge'
import { useAuth } from '../../app/lib/auth-context'

interface Friend {
  id: string
  username: string
  name: string | null
  avatar: string | null
}

interface FriendTaggerProps {
  onTagsChange: (taggedUserIds: string[]) => void
  initialTags?: string[]
}

export function FriendTagger({ onTagsChange, initialTags: _initialTags = [] }: FriendTaggerProps) {
  const { user: _user } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [taggedFriends, setTaggedFriends] = useState<Friend[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [_loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadFriends()

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const loadFriends = async () => {
    try {
      setLoading(true)

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3003/api/trpc'
      const url = `${API_URL}/social.getFriends`

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to load friends')
      }

      const json = await response.json()
      const data = json.result?.data

      if (data?.friends) {
        setFriends(data.friends)
      }
    } catch (error) {
      console.error('Failed to load friends:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFriend = (friend: Friend) => {
    const isTagged = taggedFriends.some((f) => f.id === friend.id)

    let newTagged: Friend[]
    if (isTagged) {
      newTagged = taggedFriends.filter((f) => f.id !== friend.id)
    } else {
      newTagged = [...taggedFriends, friend]
    }

    setTaggedFriends(newTagged)
    onTagsChange(newTagged.map((f) => f.id))
    setSearchQuery('')
  }

  const removeFriend = (friendId: string) => {
    const newTagged = taggedFriends.filter((f) => f.id !== friendId)
    setTaggedFriends(newTagged)
    onTagsChange(newTagged.map((f) => f.id))
  }

  const filteredFriends = friends.filter(
    (friend) =>
      !taggedFriends.some((f) => f.id === friend.id) &&
      (friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-3">
      {/* Tagged Friends */}
      {taggedFriends.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {taggedFriends.map((friend) => (
            <Badge
              key={friend.id}
              className="bg-primary-500/20 text-primary-300 border-primary-500/30 pl-2 pr-1 py-1 flex items-center gap-1"
            >
              <AtSign className="h-3 w-3" />
              <span>{friend.name || friend.username}</span>
              <button
                onClick={() => removeFriend(friend.id)}
                className="ml-1 hover:bg-white/10 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Friend Search */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tag friends... (type to search)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50"
          />
          {showDropdown && searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setShowDropdown(false)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && filteredFriends.length > 0 && (
          <div className="absolute z-10 w-full mt-2 glass rounded-lg border border-white/10 overflow-hidden max-h-64 overflow-y-auto">
            {filteredFriends.slice(0, 10).map((friend) => (
              <button
                key={friend.id}
                onClick={() => toggleFriend(friend)}
                className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 overflow-hidden border border-white/10">
                  {friend.avatar ? (
                    <Image
                      src={friend.avatar}
                      alt={friend.username}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary-400">
                      {friend.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {friend.name || friend.username}
                  </div>
                  <div className="text-xs text-gray-400 truncate">@{friend.username}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {showDropdown && searchQuery && filteredFriends.length === 0 && (
          <div className="absolute z-10 w-full mt-2 glass rounded-lg border border-white/10 p-4 text-center">
            <p className="text-sm text-gray-400">No friends found</p>
          </div>
        )}
      </div>

      {/* Info Text */}
      <p className="text-xs text-gray-500">Tag friends to recommend this anime to them</p>
    </div>
  )
}
