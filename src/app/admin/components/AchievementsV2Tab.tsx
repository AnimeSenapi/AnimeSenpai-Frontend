'use client'

import { useState, useEffect } from 'react'
import {
  Trophy,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Download,
  Upload,
  BarChart3,
  Users,
  Star,
  Crown,
  Award,
  Target,
  Heart,
  Eye,
  MessageSquare,
  Zap,
  Gem,
  Check,
  X,
  Film,
  BookOpen,
  CheckCircle,
  Star as StarIcon,
  UserPlus,
  Users2,
  Compass,
  PenTool,
  Rocket,
  UserCheck,
  Flame,
  Calendar,
  Bookmark,
  BookmarkCheck,
  ThumbsUp,
  Globe,
  Sparkles,
  TrendingUp,
  Activity,
  AlertCircle,
  Settings,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { LoadingState } from '@/components/ui/loading-state'
import { Button } from '@/components/ui/button'
import { AccessibleInput } from '@/components/ui/accessible-input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MobileModal } from '@/components/ui/mobile-modal'
import { cn } from '@/lib/utils'

interface AchievementTier {
  id: string
  tier: number
  requirement: number
  points: number
  name: string
  description: string
  createdAt: string
}

interface Achievement {
  id: string
  key: string
  baseName: string
  baseDescription: string
  icon: string
  category: 'watching' | 'rating' | 'social' | 'discovery' | 'special'
  maxTier: number
  createdAt: string
  tiers: AchievementTier[]
  _count: {
    userAchievements: number
  }
}

interface AchievementStats {
  totalAchievements: number
  totalTiers: number
  totalUnlocks: number
  categoryStats: Array<{ category: string; _count: { id: number } }>
  tierStats: Array<{ tier: number; _count: { id: number } }>
  recentUnlocks: Array<{
    id: string
    unlockedAt: string
    user: { id: string; name: string; username: string }
    tier: { id: string; name: string; tier: number }
    achievement: { id: string; baseName: string; icon: string }
  }>
}

const CATEGORY_ICONS = {
  watching: BookOpen,
  rating: Star,
  social: Users,
  discovery: Compass,
  special: Gem
}

const CATEGORY_COLORS = {
  watching: 'text-blue-400',
  rating: 'text-yellow-400',
  social: 'text-green-400',
  discovery: 'text-purple-400',
  special: 'text-pink-400'
}

const TIER_COLORS = {
  1: 'text-amber-400',
  2: 'text-gray-400',
  3: 'text-yellow-400',
  4: 'text-cyan-400',
  5: 'text-purple-400',
  6: 'text-pink-400',
  7: 'text-red-400',
  8: 'text-indigo-400'
}

const TIER_BG_COLORS = {
  1: 'bg-amber-500/10',
  2: 'bg-gray-500/10',
  3: 'bg-yellow-500/10',
  4: 'bg-cyan-500/10',
  5: 'bg-purple-500/10',
  6: 'bg-pink-500/10',
  7: 'bg-red-500/10',
  8: 'bg-indigo-500/10'
}

export function AchievementsV2Tab() {
  const { addToast } = useToast()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState<AchievementStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [expandedAchievements, setExpandedAchievements] = useState<Set<string>>(new Set())
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    loadAchievements()
    loadStats()
  }, [])

  const loadAchievements = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const response = await apiGetAchievementsV2()
      // setAchievements(response.achievements)
      
      // Mock data for now
      setAchievements([])
    } catch (error) {
      console.error('Failed to load achievements:', error)
      addToast({
        title: 'Error',
        description: 'Failed to load achievements',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiGetAchievementStatsV2()
      // setStats(response)
      
      // Mock data for now
      setStats({
        totalAchievements: 0,
        totalTiers: 0,
        totalUnlocks: 0,
        categoryStats: [],
        tierStats: [],
        recentUnlocks: []
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const toggleExpanded = (achievementId: string) => {
    const newExpanded = new Set(expandedAchievements)
    if (newExpanded.has(achievementId)) {
      newExpanded.delete(achievementId)
    } else {
      newExpanded.add(achievementId)
    }
    setExpandedAchievements(newExpanded)
  }

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.baseName.toLowerCase().includes(search.toLowerCase()) ||
                         achievement.baseDescription.toLowerCase().includes(search.toLowerCase()) ||
                         achievement.key.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || achievement.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (loading && achievements.length === 0) {
    return <LoadingState variant="full" text="Loading achievements..." size="lg" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10 p-6 border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5"></div>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary-400/20 to-secondary-400/20">
                <Trophy className="h-6 w-6 text-primary-400" />
              </div>
              Tier-Based Achievements
            </h2>
            <p className="text-gray-300 text-lg">Manage achievement types and their tiers</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>

            <Button 
              size="sm" 
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-primary-500/25 px-6 py-2.5 text-sm font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Achievement Type
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 hover:border-primary-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">{stats.totalAchievements}</p>
                <p className="text-sm font-medium text-gray-300 truncate">Achievement Types</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">Total created</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 hover:border-primary-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">{stats.totalTiers}</p>
                <p className="text-sm font-medium text-gray-300 truncate">Total Tiers</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">Across all types</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 hover:border-primary-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">{stats.totalUnlocks}</p>
                <p className="text-sm font-medium text-gray-300 truncate">Tier Unlocks</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">By all users</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 hover:border-primary-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                  {stats.totalTiers > 0 ? Math.round(stats.totalUnlocks / stats.totalTiers) : 0}
                </p>
                <p className="text-sm font-medium text-gray-300 truncate">Avg per tier</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">Unlocks per tier</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <AccessibleInput
            placeholder="Search achievement types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
          />
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
        >
          <option value="all">All Categories</option>
          <option value="watching">Watching</option>
          <option value="rating">Rating</option>
          <option value="social">Social</option>
          <option value="discovery">Discovery</option>
          <option value="special">Special</option>
        </select>
      </div>

      {/* Achievements List */}
      <div className="space-y-4">
        {filteredAchievements.map((achievement) => {
          const CategoryIcon = CATEGORY_ICONS[achievement.category]
          const categoryColor = CATEGORY_COLORS[achievement.category]
          const isExpanded = expandedAchievements.has(achievement.id)
          
          return (
            <div key={achievement.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
              {/* Achievement Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                  <CategoryIcon className="h-6 w-6 text-primary-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-white text-lg">{achievement.baseName}</h3>
                    <span className={cn('text-xs px-2 py-1 rounded-full font-medium', categoryColor)}>
                      {achievement.category}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {achievement.tiers.length} tiers
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{achievement.baseDescription}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Key: <code className="bg-white/10 px-1 rounded">{achievement.key}</code></span>
                    <span>Max Tier: {achievement.maxTier}</span>
                    <span>Unlocks: {achievement._count.userAchievements}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(achievement.id)}
                    className="h-8 w-8 p-0 hover:bg-white/10 transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-white/10 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tiers (Expanded) */}
              {isExpanded && (
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Tiers</h4>
                  {achievement.tiers.map((tier) => (
                    <div
                      key={tier.id}
                      className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg"
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                        TIER_BG_COLORS[tier.tier as keyof typeof TIER_BG_COLORS] || 'bg-gray-500/20'
                      )}>
                        <span className={cn(
                          TIER_COLORS[tier.tier as keyof typeof TIER_COLORS] || 'text-gray-400'
                        )}>
                          {tier.tier}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-white text-sm">{tier.name}</h5>
                          <span className="text-xs text-yellow-400">{tier.points} pts</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-1">{tier.description}</p>
                        <span className="text-xs text-gray-500">{tier.requirement} required</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredAchievements.length === 0 && !loading && (
        <div className="text-center py-20">
          <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No achievement types found</h3>
          <p className="text-gray-500 mb-6">Create your first achievement type to get started.</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Achievement Type
          </Button>
        </div>
      )}

      {/* Create Achievement Modal */}
      <MobileModal
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        title="Create Achievement Type"
        fullScreen={false}
      >
        <div className="p-6">
          <p className="text-gray-400 text-center">Achievement type creation form will be implemented here.</p>
        </div>
      </MobileModal>
    </div>
  )
}
