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
  RefreshCw,
  RotateCcw
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { LoadingState } from '@/components/ui/loading-state'
import { ErrorState, EmptyState } from '@/components/ui/error-state'
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

const TIER_ICON_BG_CLASSES: Record<Achievement['tier'], string> = {
  bronze: 'bg-amber-500/10',
  silver: 'bg-gray-500/10',
  gold: 'bg-yellow-500/10',
  platinum: 'bg-cyan-500/10',
  diamond: 'bg-purple-500/10'
}

const TIER_ICON_TEXT_CLASSES: Record<Achievement['tier'], string> = {
  bronze: 'text-amber-400',
  silver: 'text-gray-300',
  gold: 'text-yellow-300',
  platinum: 'text-cyan-300',
  diamond: 'text-purple-300'
}

const TIER_BADGE_CLASSES: Record<Achievement['tier'], string> = {
  bronze: 'bg-amber-500/20 text-amber-300',
  silver: 'bg-gray-500/20 text-gray-300',
  gold: 'bg-yellow-500/20 text-yellow-300',
  platinum: 'bg-cyan-500/20 text-cyan-300',
  diamond: 'bg-purple-500/20 text-purple-300'
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
  const [achievementsLoading, setAchievementsLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isBulkSaving, setIsBulkSaving] = useState(false)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, categoryFilter, tierFilter])

  useEffect(() => {
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadAchievements = async () => {
    try {
      setAchievementsLoading(true)
      setLoadError(null)

      const response = await apiGetAchievements({
        page,
        limit: 20,
        search: searchTerm || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        tier: tierFilter !== 'all' ? tierFilter : undefined
      })

      if (response && typeof response === 'object') {
        const data = response as any
        if (data.result?.data) {
          const resultData = data.result.data
          setAchievements(resultData.achievements || [])
          setTotalPages(resultData.pagination?.pages || resultData.pagination?.totalPages || 1)
        } else if (Array.isArray(data.achievements)) {
          setAchievements(data.achievements)
          setTotalPages(data.pagination?.pages || data.pagination?.totalPages || 1)
        } else {
          setAchievements([])
          setTotalPages(1)
        }
      } else {
        setAchievements([])
        setTotalPages(1)
      }
    } catch (error: any) {
      console.error('Failed to load achievements:', error)
      setAchievements([])
      setTotalPages(1)
      setLoadError(
        error instanceof Error ? error.message || 'Failed to load achievements.' : 'Failed to load achievements.'
      )
      addToast({
        title: 'Unable to load achievements',
        description:
          error instanceof Error ? error.message || 'Please try again shortly.' : 'Please try again shortly.',
        variant: 'destructive'
      })
    } finally {
      setAchievementsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      setStatsLoading(true)
      setStatsError(null)
      const response = await apiGetAchievementStats()
      if (response && typeof response === 'object') {
        const data = response as any
        if (data.result?.data) {
          setStats(data.result.data as AchievementStats)
        } else {
          setStats(data as AchievementStats)
        }
      } else {
        setStats(null)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
      setStats(null)
      setStatsError(error instanceof Error ? error.message || 'Failed to load stats.' : 'Failed to load stats.')
    }
    setStatsLoading(false)
  }

  const handleCreateSuccess = () => {
    loadAchievements()
    loadStats()
  }

  const handleUpdate = async () => {
    if (!editingAchievement) return

    try {
      setIsUpdating(true)
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
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (achievement: Achievement) => {
    if (!confirm(`Are you sure you want to delete "${achievement.name}"?`)) return

    try {
      setDeleteLoadingId(achievement.id)
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
    } finally {
      setDeleteLoadingId(null)
    }
  }

  const handleBulkCreate = async () => {
    try {
      setIsBulkSaving(true)
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
    } finally {
      setIsBulkSaving(false)
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

  const handleSearch = () => {
    const trimmed = searchQuery.trim()
    const searchChanged = trimmed !== searchTerm
    const pageChanged = page !== 1

    setSearchTerm(trimmed)

    if (searchChanged || pageChanged) {
      setPage(1)
    } else {
      loadAchievements()
    }
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSearchTerm('')
    setCategoryFilter('all')
    setTierFilter('all')
    setPage(1)
    loadAchievements()
  }

  const showInitialLoading = achievementsLoading && achievements.length === 0 && !loadError
  const showError = !achievementsLoading && Boolean(loadError)
  const showEmpty = !achievementsLoading && !loadError && achievements.length === 0
  const hasActiveFilters =
    searchTerm.length > 0 || categoryFilter !== 'all' || tierFilter !== 'all'
  const resolvedErrorMessage = loadError || 'Failed to load achievements. Please try again.'
  const showingCount = achievements.length
  const totalCount = hasActiveFilters ? showingCount : stats?.totalAchievements ?? showingCount
  const handleAchievementsRetry = () => loadAchievements()
  const handleStatsRetry = () => loadStats()
  const statsUnavailable = !stats && statsError

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-primary-500/10 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-3 rounded-xl bg-white/5 px-3 py-1.5 border border-white/10 text-sm text-primary-200">
              <Trophy className="h-4 w-4" />
              Achievements Management
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-white">Inspire Player Progress</h2>
              <p className="text-sm text-gray-400">
                Curate badges, monitor unlocks, and celebrate fan milestones.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-start sm:items-center gap-3">
            <Button
              onClick={handleResetFilters}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button
              onClick={handleAchievementsRetry}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkDialog(true)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Upload className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Bulk Import</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="bg-primary-500/80 hover:bg-primary-500 text-white"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Create</span>
            </Button>
          </div>
        </div>

        {statsLoading && !stats ? null : stats ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-500/15 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-primary-300" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">{stats.totalAchievements}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Achievements</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-300" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">{stats.totalUnlocks}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Total unlocks</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-purple-300" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">{stats.categoryStats.length}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Categories</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/15 flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-300" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">
                    {stats.totalAchievements > 0 && typeof stats.totalUnlocks === 'number'
                      ? Math.round(stats.totalUnlocks / stats.totalAchievements)
                      : 0}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Avg unlocks</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <AccessibleInput
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSearch}
              size="sm"
              className="bg-primary-500/20 border border-primary-500/40 text-primary-100 hover:bg-primary-500/30"
            >
              <Search className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Search</span>
            </Button>
            <Button
              onClick={handleResetFilters}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPage(1)
            }}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500/40"
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
            onChange={(e) => {
              setTierFilter(e.target.value)
              setPage(1)
            }}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500/40"
          >
            <option value="all">All Tiers</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>
      </div>

      {/* Achievements Grid */}
      {showInitialLoading ? (
        <LoadingState variant="inline" text="Loading achievements..." size="md" />
      ) : showError ? (
        <ErrorState
          variant="inline"
          title="Unable to load achievements"
          message={resolvedErrorMessage}
          showRetry
          showHome={false}
          onRetry={handleAchievementsRetry}
        />
      ) : showEmpty ? (
        <EmptyState
          icon={<Trophy className="h-10 w-10 text-primary-300" />}
          title={hasActiveFilters ? 'No achievements match your filters' : 'No achievements yet'}
          message={
            hasActiveFilters
              ? 'Try adjusting the search term or clearing the filters to see more achievements.'
              : 'Create your first achievement to motivate the community.'
          }
          suggestions={
            hasActiveFilters
              ? ['Clear filters to view all achievements', 'Search by a different keyword', 'Try another category or tier']
              : ['Use the Create Achievement button to add your first badge', 'Bulk import existing achievements to fast-track setup']
          }
          actionLabel={hasActiveFilters ? 'Reset filters' : undefined}
          onAction={hasActiveFilters ? handleResetFilters : undefined}
          secondaryActionLabel="Reload"
          onSecondaryAction={handleAchievementsRetry}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={cn(
                      'w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                      TIER_ICON_BG_CLASSES[achievement.tier]
                    )}
                  >
                    {(() => {
                      const IconComponent = getAchievementIcon(achievement.key)
                      return (
                        <IconComponent
                          className={cn(
                            'h-5 w-5 sm:h-6 sm:w-6',
                            TIER_ICON_TEXT_CLASSES[achievement.tier]
                          )}
                        />
                      )
                    })()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-white truncate text-sm sm:text-base">
                        {achievement.name}
                      </h3>
                      <span
                        className={cn('text-xs px-2 py-1 rounded-full font-medium', TIER_BADGE_CLASSES[achievement.tier])}
                      >
                        {achievement.tier}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {achievement.description}
                    </p>
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
                    <span className="font-semibold text-white">{achievement._count.userAchievements}</span>{' '}
                    unlocks
                  </span>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(achievement)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 hover:bg-white/10"
                      disabled={Boolean(deleteLoadingId)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(achievement)}
                      disabled={deleteLoadingId === achievement.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-error-300 hover:bg-error-500/15 disabled:opacity-50"
                    >
                      {deleteLoadingId === achievement.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing {showingCount} • Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
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
          <Button onClick={handleBulkCreate} className="w-full" disabled={isBulkSaving}>
            {isBulkSaving ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Importing...
              </span>
            ) : (
              'Import Achievements'
            )}
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
          isSubmitting={isUpdating}
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
  isSubmitting: boolean
}

function AchievementForm({ data, onChange, onSubmit, onCancel, isSubmitting }: AchievementFormProps) {
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
              TIER_ICON_BG_CLASSES[data.tier]
            )}>
              {(() => {
                const IconComponent = getAchievementIcon(data.key || 'default')
                return <IconComponent className={cn(
                  'h-8 w-8',
                  TIER_ICON_TEXT_CLASSES[data.tier]
                )} />
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-bold text-white text-lg">{data.name || 'Achievement Name'}</h4>
                <span className={cn(
                  'text-xs px-3 py-1 rounded-full font-medium',
                  TIER_BADGE_CLASSES[data.tier]
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
          disabled={!isFormValid || isSubmitting}
          className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-primary-500/25 disabled:shadow-none"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4" />
              {data.id ? 'Update Achievement' : 'Create Achievement'}
            </span>
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
