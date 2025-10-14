'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Trophy, 
  Medal, 
  Star, 
  Users, 
  MessageSquare,
  Crown,
  TrendingUp
} from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { LoadingState } from '../../components/ui/loading-state'
import { cn } from '../lib/utils'

interface LeaderboardEntry {
  rank: number
  user: {
    id: string
    username: string
    name: string | null
    avatar: string | null
  }
  count: number
}

export default function LeaderboardsPage() {
  const [topWatchers, setTopWatchers] = useState<LeaderboardEntry[]>([])
  const [topReviewers, setTopReviewers] = useState<LeaderboardEntry[]>([])
  const [mostSocial, setMostSocial] = useState<LeaderboardEntry[]>([])
  const [selectedBoard, setSelectedBoard] = useState<'watchers' | 'reviewers' | 'social'>('watchers')
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboards()
  }, [timeRange])

  const loadLeaderboards = async () => {
    try {
      setLoading(true)
      
      const { apiGetTopWatchers, apiGetTopReviewers, apiGetMostSocial } = await import('../lib/api')
      
      const [watchers, reviewers, social] = await Promise.all([
        apiGetTopWatchers({ limit: 50, timeRange }),
        apiGetTopReviewers({ limit: 50 }),
        apiGetMostSocial({ limit: 50 })
      ])
      
      setTopWatchers(watchers?.leaderboard || [])
      setTopReviewers(reviewers?.leaderboard || [])
      setMostSocial(social?.leaderboard || [])
    } catch (error) {
      console.error('Failed to load leaderboards:', error)
      setTopWatchers([])
      setTopReviewers([])
      setMostSocial([])
    } finally {
      setLoading(false)
    }
  }

  const getRankMedal = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-400" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-700" />
    return null
  }

  const currentLeaderboard = selectedBoard === 'watchers' 
    ? topWatchers 
    : selectedBoard === 'reviewers'
    ? topReviewers
    : mostSocial

  const getCountLabel = () => {
    switch (selectedBoard) {
      case 'watchers':
        return 'Anime Watched'
      case 'reviewers':
        return 'Reviews Written'
      case 'social':
        return 'Friends'
    }
  }

  if (loading) {
    return <LoadingState variant="full" text="Loading leaderboards..." size="lg" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      <main className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Leaderboards</h1>
              <p className="text-gray-400">See who's at the top!</p>
            </div>
          </div>

          {/* Board Selector */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              variant={selectedBoard === 'watchers' ? 'default' : 'outline'}
              onClick={() => setSelectedBoard('watchers')}
              className={cn(
                selectedBoard === 'watchers'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                  : 'border-white/20 text-white hover:bg-white/10'
              )}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Top Watchers
            </Button>
            <Button
              variant={selectedBoard === 'reviewers' ? 'default' : 'outline'}
              onClick={() => setSelectedBoard('reviewers')}
              className={cn(
                selectedBoard === 'reviewers'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                  : 'border-white/20 text-white hover:bg-white/10'
              )}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Top Reviewers
            </Button>
            <Button
              variant={selectedBoard === 'social' ? 'default' : 'outline'}
              onClick={() => setSelectedBoard('social')}
              className={cn(
                selectedBoard === 'social'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                  : 'border-white/20 text-white hover:bg-white/10'
              )}
            >
              <Users className="h-4 w-4 mr-2" />
              Most Social
            </Button>
          </div>

          {/* Time Range (only for watchers) */}
          {selectedBoard === 'watchers' && (
            <div className="flex gap-2">
              {(['week', 'month', 'all'] as const).map(range => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    timeRange === range
                      ? 'bg-primary-500'
                      : 'border-white/20 text-white hover:bg-white/10'
                  )}
                >
                  {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'All Time'}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="glass rounded-xl border border-white/10 overflow-hidden">
          {currentLeaderboard.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No entries yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {currentLeaderboard.map((entry, index) => (
                <Link
                  key={entry.user.id}
                  href={`/user/${entry.user.username}`}
                  className="flex items-center gap-4 p-4 hover:bg-white/5 transition-all"
                >
                  {/* Rank */}
                  <div className="w-12 text-center flex-shrink-0">
                    {getRankMedal(entry.rank) || (
                      <span className="text-2xl font-bold text-gray-400">#{entry.rank}</span>
                    )}
                  </div>

                  {/* User */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 overflow-hidden border border-white/10 flex-shrink-0">
                    {entry.user.avatar ? (
                      <Image 
                        src={entry.user.avatar} 
                        alt={entry.user.username}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold text-primary-400">
                        {entry.user.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">
                      {entry.user.name || entry.user.username}
                    </div>
                    <div className="text-sm text-gray-400 truncate">
                      @{entry.user.username}
                    </div>
                  </div>

                  {/* Count */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{entry.count.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">{getCountLabel()}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

