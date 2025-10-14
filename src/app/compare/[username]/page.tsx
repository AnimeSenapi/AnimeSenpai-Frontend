'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  GitCompare, 
  Check, 
  X, 
  Star,
  ArrowRight,
  TrendingUp,
  Heart
} from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { LoadingState } from '../../../components/ui/loading-state'
import { useAuth } from '../../lib/auth-context'
import { useToast } from '../../../lib/toast-context'
import { cn } from '../../lib/utils'

export default function CompareListsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  
  const [comparison, setComparison] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [friendId, setFriendId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }
    
    loadFriend()
  }, [isAuthenticated, username])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  const loadFriend = async () => {
    try {
      // Get friend ID from username
      const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3003/api/trpc'
      const url = `${API_URL}/social.getUserProfile?input=${encodeURIComponent(JSON.stringify({ username }))}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      const json = await response.json()
      const userId = json.result?.data?.user?.id
      
      if (userId) {
        setFriendId(userId)
        loadComparison(userId)
      }
    } catch (error) {
      console.error('Failed to load friend:', error)
      toast.error('Failed to load user', 'Error')
      setLoading(false)
    }
  }

  const loadComparison = async (userId: string) => {
    try {
      setLoading(true)
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3003/api/trpc'
      const url = `${API_URL}/listTools.compareWithFriend?input=${encodeURIComponent(JSON.stringify({
        friendId: userId
      }))}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Failed to load comparison')
      }
      
      const json = await response.json()
      const data = json.result?.data
      
      if (data) {
        setComparison(data)
      }
    } catch (error) {
      console.error('Failed to load comparison:', error)
      toast.error('Failed to compare lists', 'Error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState variant="full" text="Comparing lists..." size="lg" />
  }

  if (!comparison) {
    return null
  }

  const { common, friendRecommendations, yourRecommendations, stats } = comparison

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center">
              <GitCompare className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">List Comparison</h1>
              <p className="text-gray-400">See what you have in common with {username}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">{stats.commonCount}</div>
              <div className="text-sm text-gray-400">In Common</div>
            </div>
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">{stats.compatibilityScore}%</div>
              <div className="text-sm text-gray-400">Compatibility</div>
            </div>
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">{stats.tasteSimilarity}%</div>
              <div className="text-sm text-gray-400">Taste Match</div>
            </div>
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">{stats.myTotal}</div>
              <div className="text-sm text-gray-400">Your Total</div>
            </div>
          </div>
        </div>

        {/* Common Anime */}
        {common.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Check className="h-6 w-6 text-success-400" />
              Anime You Both Watch ({common.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {common.slice(0, 12).map((item: any) => (
                <Link key={item.anime.id} href={`/anime/${item.anime.slug}`}>
                  <div className="glass rounded-xl overflow-hidden border border-white/10 hover:border-primary-500/50 transition-all">
                    <div className="aspect-[2/3] relative">
                      {item.anime.coverImage ? (
                        <Image 
                          src={item.anime.coverImage} 
                          alt={item.anime.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <span className="text-4xl">🎬</span>
                        </div>
                      )}
                      {item.scoreDifference !== null && (
                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <span className="text-xs font-bold">
                            ±{item.scoreDifference}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-white text-sm line-clamp-2 mb-2">
                        {item.anime.titleEnglish || item.anime.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">You:</span>
                          <Badge className="bg-primary-500/20 text-primary-300 border-primary-500/30 text-[10px]">
                            {item.myScore || item.myStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">Them:</span>
                          <Badge className="bg-secondary-500/20 text-secondary-300 border-secondary-500/30 text-[10px]">
                            {item.friendScore || item.friendStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Friend's Recommendations */}
        {friendRecommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <ArrowRight className="h-6 w-6 text-primary-400" />
              {username} Recommends ({friendRecommendations.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {friendRecommendations.slice(0, 10).map((item: any) => (
                <Link key={item.anime.id} href={`/anime/${item.anime.slug}`}>
                  <div className="glass rounded-xl overflow-hidden border border-white/10 hover:border-primary-500/50 transition-all group">
                    <div className="aspect-[2/3] relative">
                      {item.anime.coverImage ? (
                        <Image 
                          src={item.anime.coverImage} 
                          alt={item.anime.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="(max-width: 768px) 50vw, 20vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <span className="text-4xl">🎬</span>
                        </div>
                      )}
                      {item.friendScore && (
                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-bold">{item.friendScore}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-white text-sm line-clamp-2">
                        {item.anime.titleEnglish || item.anime.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Your Recommendations */}
        {yourRecommendations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="h-6 w-6 text-error-400" />
              You Recommend ({yourRecommendations.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {yourRecommendations.slice(0, 10).map((item: any) => (
                <Link key={item.anime.id} href={`/anime/${item.anime.slug}`}>
                  <div className="glass rounded-xl overflow-hidden border border-white/10 hover:border-error-500/50 transition-all group">
                    <div className="aspect-[2/3] relative">
                      {item.anime.coverImage ? (
                        <Image 
                          src={item.anime.coverImage} 
                          alt={item.anime.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="(max-width: 768px) 50vw, 20vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <span className="text-4xl">🎬</span>
                        </div>
                      )}
                      {item.myScore && (
                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-bold">{item.myScore}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-white text-sm line-clamp-2">
                        {item.anime.titleEnglish || item.anime.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

