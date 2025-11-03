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
  Settings
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { LoadingState } from '@/components/ui/loading-state'
import { Button } from '@/components/ui/button'
import { AccessibleInput } from '@/components/ui/accessible-input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MobileModal } from '@/components/ui/mobile-modal'
import { cn } from '@/lib/utils'
import { 
  apiGetAchievements, 
  apiUpdateAchievement, 
  apiDeleteAchievement,
  apiGetAchievementStats,
  apiBulkCreateAchievements
} from '../../lib/api'
import { CreateAchievementModal } from './CreateAchievementModal'

interface Achievement {
  id: string
  key: string
  name: string
  description: string
  icon: string
  category: 'watching' | 'rating' | 'social' | 'discovery' | 'special'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  requirement: number
  points: number
  createdAt: string
  _count: {
    userAchievements: number
  }
}

interface AchievementStats {
  totalAchievements: number
  totalUnlocks: number
  categoryStats: Array<{ category: string; _count: { id: number } }>
  tierStats: Array<{ tier: string; _count: { id: number } }>
  recentUnlocks: Array<{
    id: string
    unlockedAt: string
    user: { id: string; name: string; username: string }
    achievement: { id: string; name: string; icon: string; tier: string }
  }>
}

const TIER_ICONS = {
  bronze: Award,
  silver: Star,
  gold: Trophy,
  platinum: Crown,
  diamond: Gem
}

const CATEGORY_ICONS = {
  watching: Eye,
  rating: Star,
  social: Users,
  discovery: Zap,
  special: Heart
}

const CATEGORY_COLORS = {
  watching: 'text-blue-400',
  rating: 'text-yellow-400',
  social: 'text-green-400',
  discovery: 'text-purple-400',
  special: 'text-pink-400'
}

// Icon mapping for achievements
const ACHIEVEMENT_ICONS = {
  // Watching achievements
  'first_anime': Film,
  'anime_10': BookOpen,
  'anime_25': BookOpen,
  'anime_50': BookOpen,
  'anime_100': BookOpen,
  'anime_250': BookOpen,
  'anime_500': BookOpen,
  'anime_1000': BookOpen,
  
  // Completion achievements
  'completed_10': CheckCircle,
  'completed_50': CheckCircle,
  'completed_100': CheckCircle,
  'completed_250': CheckCircle,
  
  // Rating achievements
  'first_rating': StarIcon,
  'ratings_10': StarIcon,
  'ratings_50': StarIcon,
  'ratings_100': StarIcon,
  'ratings_250': StarIcon,
  
  // Social achievements
  'first_follower': UserPlus,
  'followers_10': Users,
  'followers_50': Users,
  'followers_100': Users,
  'following_10': Users2,
  'friends_5': Heart,
  
  // Discovery achievements
  'genres_5': Compass,
  'genres_10': Compass,
  'genres_15': Compass,
  
  // Review achievements
  'first_review': PenTool,
  'reviewer_10': MessageSquare,
  'reviewer_50': MessageSquare,
  
  // Special achievements
  'early_adopter': Rocket,
  'profile_complete': UserCheck,
  'perfectionist': Gem,
  'streak_7': Flame,
  'streak_30': Calendar,
  
  // Default fallback
  'default': Trophy
}

const TIER_COLORS = {
  bronze: 'from-amber-600 via-amber-500 to-amber-700',
  silver: 'from-gray-300 via-gray-400 to-gray-600',
  gold: 'from-yellow-300 via-yellow-400 to-yellow-600',
  platinum: 'from-cyan-300 via-cyan-400 to-blue-600',
  diamond: 'from-purple-300 via-purple-400 to-pink-600'
}

const TIER_GRADIENTS = {
  bronze: 'bg-gradient-to-br from-amber-500/20 to-amber-700/30 border-amber-500/30',
  silver: 'bg-gradient-to-br from-gray-400/20 to-gray-600/30 border-gray-400/30',
  gold: 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/30 border-yellow-400/30',
  platinum: 'bg-gradient-to-br from-cyan-400/20 to-blue-600/30 border-cyan-400/30',
  diamond: 'bg-gradient-to-br from-purple-400/20 to-pink-600/30 border-purple-400/30'
}

// Helper function to get the appropriate icon component
const getAchievementIcon = (key: string) => {
  const IconComponent = ACHIEVEMENT_ICONS[key as keyof typeof ACHIEVEMENT_ICONS] || ACHIEVEMENT_ICONS.default
  return IconComponent
}

export function AchievementsTab() {
  const { addToast } = useToast()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState<AchievementStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)
  const [showBulkDialog, setShowBulkDialog] = useState(false)

  // Form state for editing
  const [formData, setFormData] = useState<{
    key: string
    name: string
    description: string
    icon: string
    category: 'watching' | 'rating' | 'social' | 'discovery' | 'special'
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
    requirement: number
    points: number
  }>({
    key: '',
    name: '',
    description: '',
    icon: 'trophy',
    category: 'watching',
    tier: 'bronze',
    requirement: 1,
    points: 10
  })

  const [bulkData, setBulkData] = useState('')

  useEffect(() => {
    loadAchievements()
    loadStats()
  }, [page, search, categoryFilter, tierFilter])

  const loadAchievements = async () => {
    try {
      setLoading(true)
      const response = await apiGetAchievements({
        page,
        limit: 20,
        search: search || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        tier: tierFilter !== 'all' ? tierFilter : undefined
      })

      // Handle different response formats
      if (response && typeof response === 'object') {
        const data = response as any
        if (data.result?.data) {
          // tRPC response format
          const resultData = data.result.data
          setAchievements(resultData.achievements || [])
          setTotalPages(resultData.pagination?.pages || 1)
        } else if (data.achievements && Array.isArray(data.achievements)) {
          // Direct data format
          setAchievements(data.achievements)
          setTotalPages(data.pagination?.pages || 1)
        } else {
          // Fallback
          setAchievements([])
          setTotalPages(1)
        }
      } else {
        setAchievements([])
        setTotalPages(1)
      }
    } catch (error) {
      console.error('Failed to load achievements:', error)
      addToast({
        title: 'Error',
        description: 'Failed to load achievements',
        variant: 'destructive'
      })
      // Set empty data on error
      setAchievements([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await apiGetAchievementStats()
      if (response && typeof response === 'object') {
        const data = response as any
        if (data.result?.data) {
          setStats(data.result.data as AchievementStats)
        } else {
          setStats(data as AchievementStats)
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
      setStats(null)
    }
  }

  const handleCreateSuccess = () => {
    loadAchievements()
    loadStats()
  }

  const handleUpdate = async () => {
    if (!editingAchievement) return

    try {
      await apiUpdateAchievement({
        id: editingAchievement.id,
        ...formData
      })
      addToast({
        title: 'Success',
        description: 'Achievement updated successfully'
      })
      setEditingAchievement(null)
      resetForm()
      loadAchievements()
      loadStats()
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to update achievement',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (achievement: Achievement) => {
    if (!confirm(`Are you sure you want to delete "${achievement.name}"?`)) return

    try {
      await apiDeleteAchievement(achievement.id)
      addToast({
        title: 'Success',
        description: 'Achievement deleted successfully'
      })
      loadAchievements()
      loadStats()
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to delete achievement',
        variant: 'destructive'
      })
    }
  }

  const handleBulkCreate = async () => {
    try {
      const lines = bulkData.split('\n').filter(line => line.trim())
      const achievements = lines.map(line => {
        const parts = line.split('|')
        return {
          key: parts[0]?.trim() || '',
          name: parts[1]?.trim() || '',
          description: parts[2]?.trim() || '',
          icon: parts[3]?.trim() || '🏆',
          category: (parts[4]?.trim() || 'watching') as 'watching' | 'rating' | 'social' | 'discovery' | 'special',
          tier: (parts[5]?.trim() || 'bronze') as 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond',
          requirement: parseInt(parts[6]?.trim() || '1'),
          points: parseInt(parts[7]?.trim() || '10') || 10
        }
      })

      await apiBulkCreateAchievements(achievements)
      addToast({
        title: 'Success',
        description: `${achievements.length} achievements created successfully`
      })
      setShowBulkDialog(false)
      setBulkData('')
      loadAchievements()
      loadStats()
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to create achievements',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      key: '',
      name: '',
      description: '',
      icon: 'trophy',
      category: 'watching',
      tier: 'bronze',
      requirement: 1,
      points: 10
    })
  }

  const startEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement)
    setFormData({
      key: achievement.key,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      tier: achievement.tier,
      requirement: achievement.requirement,
      points: achievement.points
    })
  }

  if (loading && achievements.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Achievement Management</h2>
          <p className="text-gray-400">Create and manage user achievements</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading achievements...</p>
          </div>
        </div>
      </div>
    )
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
              Achievements Management
            </h2>
            <p className="text-gray-300 text-lg">Manage user achievements and badges</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowBulkDialog(true)}
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
              Create Achievement
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
                <p className="text-sm font-medium text-gray-300 truncate">Achievements</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">Total created</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 hover:border-primary-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">{stats.totalUnlocks}</p>
                <p className="text-sm font-medium text-gray-300 truncate">Unlocks</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">Total earned</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 hover:border-primary-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">{stats.categoryStats.length}</p>
                <p className="text-sm font-medium text-gray-300 truncate">Categories</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">Different types</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 hover:border-primary-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                  {stats && stats.totalAchievements > 0 && typeof stats.totalUnlocks === 'number' 
                    ? Math.round(stats.totalUnlocks / stats.totalAchievements) 
                    : 0}
                </p>
                <p className="text-sm font-medium text-gray-300 truncate">Avg per achievement</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">Unlocks per achievement</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <AccessibleInput
            placeholder="Search achievements..."
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

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
        >
          <option value="all">All Tiers</option>
          <option value="bronze">Bronze</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
          <option value="platinum">Platinum</option>
          <option value="diamond">Diamond</option>
        </select>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {achievements.map((achievement) => {
          const TierIcon = TIER_ICONS[achievement.tier]
          const CategoryIcon = CATEGORY_ICONS[achievement.category]
          
          return (
            <div 
              key={achievement.id} 
              className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 hover:border-primary-500/30 transition-colors"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={cn(
                  'w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                  `bg-${achievement.tier === 'bronze' ? 'amber' : achievement.tier === 'silver' ? 'gray' : achievement.tier === 'gold' ? 'yellow' : achievement.tier === 'platinum' ? 'cyan' : 'purple'}-500/10`
                )}>
                  {(() => {
                    const IconComponent = getAchievementIcon(achievement.key)
                    return <IconComponent className={cn(
                      'h-5 w-5 sm:h-6 sm:w-6',
                      `text-${achievement.tier === 'bronze' ? 'amber' : achievement.tier === 'silver' ? 'gray' : achievement.tier === 'gold' ? 'yellow' : achievement.tier === 'platinum' ? 'cyan' : 'purple'}-400`
                    )} />
                  })()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-white truncate text-sm sm:text-base">{achievement.name}</h3>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full font-medium',
                      achievement.tier === 'bronze' && 'bg-amber-500/20 text-amber-300',
                      achievement.tier === 'silver' && 'bg-gray-500/20 text-gray-300',
                      achievement.tier === 'gold' && 'bg-yellow-500/20 text-yellow-300',
                      achievement.tier === 'platinum' && 'bg-cyan-500/20 text-cyan-300',
                      achievement.tier === 'diamond' && 'bg-purple-500/20 text-purple-300'
                    )}>
                      {achievement.tier}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{achievement.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span className={cn('capitalize font-medium', CATEGORY_COLORS[achievement.category])}>
                  {achievement.category}
                </span>
                <span className="text-gray-400">{achievement.requirement} required • {achievement.points} pts</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs text-gray-500">
                  <span className="font-semibold text-white">{achievement._count.userAchievements}</span> unlocks
                </span>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(achievement)}
                    className="h-8 w-8 p-0 hover:bg-white/10 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(achievement)}
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-400 px-3">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateAchievementModal
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleCreateSuccess}
      />

      <MobileModal
        isOpen={showBulkDialog}
        onClose={() => setShowBulkDialog(false)}
        title="Bulk Import Achievements"
        fullScreen={false}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Format: key|name|description|icon|category|tier|requirement|points
            </label>
            <textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              placeholder="first_anime|First Steps|Add your first anime|🎬|watching|bronze|1|10"
              rows={10}
              className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary-400/50"
            />
          </div>
          <Button onClick={handleBulkCreate} className="w-full">
            Import Achievements
          </Button>
        </div>
      </MobileModal>

      <MobileModal
        isOpen={!!editingAchievement}
        onClose={() => setEditingAchievement(null)}
        title="Edit Achievement"
        fullScreen={false}
      >
        <AchievementForm
          data={formData}
          onChange={setFormData}
          onSubmit={handleUpdate}
          onCancel={() => setEditingAchievement(null)}
        />
      </MobileModal>
    </div>
  )
}

interface AchievementFormProps {
  data: {
    id?: string
    key: string
    name: string
    description: string
    icon: string
    category: 'watching' | 'rating' | 'social' | 'discovery' | 'special'
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
    requirement: number
    points: number
  }
  onChange: (data: AchievementFormProps['data']) => void
  onSubmit: () => void
  onCancel: () => void
}

function AchievementForm({ data, onChange, onSubmit, onCancel }: AchievementFormProps) {
  const isFormValid = data.key && data.name && data.description && data.category && data.tier && data.requirement && data.points
  
  return (
    <div className="space-y-4">
      {/* Preview Section */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary-400" />
          Live Preview
        </h3>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-start gap-4">
            <div className={cn(
              'w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0',
              `bg-${data.tier === 'bronze' ? 'amber' : data.tier === 'silver' ? 'gray' : data.tier === 'gold' ? 'yellow' : data.tier === 'platinum' ? 'cyan' : 'purple'}-500/10`
            )}>
              {(() => {
                const IconComponent = getAchievementIcon(data.key || 'default')
                return <IconComponent className={cn(
                  'h-8 w-8',
                  `text-${data.tier === 'bronze' ? 'amber' : data.tier === 'silver' ? 'gray' : data.tier === 'gold' ? 'yellow' : data.tier === 'platinum' ? 'cyan' : 'purple'}-400`
                )} />
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-bold text-white text-lg">{data.name || 'Achievement Name'}</h4>
                <span className={cn(
                  'text-xs px-3 py-1 rounded-full font-medium',
                  data.tier === 'bronze' && 'bg-amber-500/20 text-amber-300',
                  data.tier === 'silver' && 'bg-gray-500/20 text-gray-300',
                  data.tier === 'gold' && 'bg-yellow-500/20 text-yellow-300',
                  data.tier === 'platinum' && 'bg-cyan-500/20 text-cyan-300',
                  data.tier === 'diamond' && 'bg-purple-500/20 text-purple-300'
                )}>
                  {data.tier?.toUpperCase() || 'BRONZE'}
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-3">{data.description || 'Achievement description'}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className={cn('capitalize font-medium', CATEGORY_COLORS[data.category])}>
                  {data.category || 'watching'}
                </span>
                <span>{data.requirement || 1} required • {data.points || 10} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary-400" />
            Basic Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Achievement Key <span className="text-red-400">*</span>
              </label>
              <AccessibleInput
                value={data.key}
                onChange={(e) => onChange({ ...data, key: e.target.value })}
                placeholder="first_anime"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Unique identifier (snake_case)</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
              <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Auto-assigned based on key
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Achievement Name <span className="text-red-400">*</span>
            </label>
            <AccessibleInput
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              placeholder="First Steps"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={data.description}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              placeholder="Add your first anime to your list"
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg placeholder-gray-500 focus:outline-none focus:border-primary-500/50 resize-none transition-colors"
            />
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary-400" />
            Configuration
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={data.category}
                onChange={(e) => onChange({ ...data, category: e.target.value as any })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50 transition-colors"
              >
                <option value="watching">📺 Watching</option>
                <option value="rating">⭐ Rating</option>
                <option value="social">👥 Social</option>
                <option value="discovery">🗺️ Discovery</option>
                <option value="special">✨ Special</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tier <span className="text-red-400">*</span>
              </label>
              <select
                value={data.tier}
                onChange={(e) => onChange({ ...data, tier: e.target.value as any })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50 transition-colors"
              >
                <option value="bronze">🥉 Bronze</option>
                <option value="silver">🥈 Silver</option>
                <option value="gold">🥇 Gold</option>
                <option value="platinum">💎 Platinum</option>
                <option value="diamond">💠 Diamond</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Requirement <span className="text-red-400">*</span>
              </label>
              <AccessibleInput
                type="number"
                value={data.requirement}
                onChange={(e) => onChange({ ...data, requirement: parseInt(e.target.value) || 1 })}
                min="1"
                placeholder="1"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Number needed to unlock</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Points <span className="text-red-400">*</span>
              </label>
              <AccessibleInput
                type="number"
                value={data.points}
                onChange={(e) => onChange({ ...data, points: parseInt(e.target.value) || 10 })}
                min="1"
                max="1000"
                placeholder="10"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Reward points (1-1000)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10">
        <Button 
          onClick={onSubmit} 
          disabled={!isFormValid}
          className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-primary-500/25 disabled:shadow-none"
        >
          <Check className="h-4 w-4 mr-2" />
          {data.id ? 'Update Achievement' : 'Create Achievement'}
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="flex-1 bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
      
      {!isFormValid && (
        <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Please fill in all required fields to create the achievement
          </p>
        </div>
      )}
    </div>
  )
}
