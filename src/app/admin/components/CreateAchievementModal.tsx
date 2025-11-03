'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Trophy,
  Eye,
  Check,
  X,
  Settings,
  AlertCircle,
  Sparkles,
  Film,
  BookOpen,
  CheckCircle,
  Star as StarIcon,
  UserPlus,
  Users,
  Users2,
  Compass,
  PenTool,
  MessageSquare,
  Rocket,
  UserCheck,
  Gem,
  Flame,
  Calendar,
  Heart,
  Crown,
  Plus
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { AccessibleInput } from '@/components/ui/accessible-input'
import { cn } from '@/lib/utils'
import { apiCreateAchievement } from '../../lib/api'

interface CreateAchievementModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface AchievementTier {
  tier: number
  requirement: number
  points: number
  name: string
  description: string
}

interface AchievementFormData {
  key: string
  baseName: string
  baseDescription: string
  icon: string
  category: 'watching' | 'rating' | 'social' | 'discovery' | 'special'
  maxTier: number
  tiers: AchievementTier[]
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

// Icon mapping for achievement types
const ACHIEVEMENT_ICONS = {
  'anime_watched': BookOpen,
  'anime_completed': CheckCircle,
  'anime_rated': StarIcon,
  'followers_gained': Users,
  'following_count': Users2,
  'genres_explored': Compass,
  'reviews_written': MessageSquare,
  'perfect_ratings': Gem,
  'profile_complete': UserCheck,
  'early_adopter': Rocket,
  'default': Trophy
}

// Helper function to get the appropriate icon component
const getAchievementIcon = (key: string) => {
  const IconComponent = ACHIEVEMENT_ICONS[key as keyof typeof ACHIEVEMENT_ICONS] || ACHIEVEMENT_ICONS.default
  return IconComponent
}

export function CreateAchievementModal({ isOpen, onClose, onSuccess }: CreateAchievementModalProps) {
  const { addToast } = useToast()
  const [formData, setFormData] = useState<AchievementFormData>({
    key: '',
    baseName: '',
    baseDescription: '',
    icon: 'trophy',
    category: 'watching',
    maxTier: 3,
    tiers: [
      { tier: 1, requirement: 1, points: 10, name: 'First Steps', description: 'Complete the first milestone' },
      { tier: 2, requirement: 10, points: 25, name: 'Getting Started', description: 'Complete 10 milestones' },
      { tier: 3, requirement: 50, points: 50, name: 'Expert', description: 'Complete 50 milestones' }
    ]
  })

  const [isVisible, setIsVisible] = useState(false)

  const isFormValid = formData.key && formData.baseName && formData.baseDescription && formData.category && formData.tiers.length > 0

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      const timeout = setTimeout(() => setIsVisible(false), 300)
      document.body.style.overflow = ''
      return () => clearTimeout(timeout)
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleSubmit = async () => {
    try {
      // TODO: Replace with actual API call for tier-based achievements
      // await apiCreateAchievementType(formData)
      // Creating achievement type
      addToast({
        title: 'Success',
        description: 'Achievement type created successfully'
      })
      onSuccess()
      resetForm()
      onClose()
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to create achievement type',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      key: '',
      baseName: '',
      baseDescription: '',
      icon: 'trophy',
      category: 'watching',
      maxTier: 3,
      tiers: [
        { tier: 1, requirement: 1, points: 10, name: 'First Steps', description: 'Complete the first milestone' },
        { tier: 2, requirement: 10, points: 25, name: 'Getting Started', description: 'Complete 10 milestones' },
        { tier: 3, requirement: 50, points: 50, name: 'Expert', description: 'Complete 50 milestones' }
      ]
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const addTier = () => {
    const newTierNumber = formData.tiers.length + 1
    const lastTier = formData.tiers[formData.tiers.length - 1]
    const newTier: AchievementTier = {
      tier: newTierNumber,
      requirement: lastTier ? lastTier.requirement * 2 : 10,
      points: lastTier ? lastTier.points * 2 : 20,
      name: `Tier ${newTierNumber}`,
      description: `Complete ${lastTier ? lastTier.requirement * 2 : 10} milestones`
    }
    setFormData({
      ...formData,
      maxTier: newTierNumber,
      tiers: [...formData.tiers, newTier]
    })
  }

  const removeTier = (tierNumber: number) => {
    if (formData.tiers.length <= 1) return
    const newTiers = formData.tiers.filter(tier => tier.tier !== tierNumber)
    setFormData({
      ...formData,
      maxTier: newTiers.length,
      tiers: newTiers.map((tier, index) => ({ ...tier, tier: index + 1 }))
    })
  }

  const updateTier = (tierNumber: number, field: keyof AchievementTier, value: any) => {
    setFormData({
      ...formData,
      tiers: formData.tiers.map(tier => 
        tier.tier === tierNumber ? { ...tier, [field]: value } : tier
      )
    })
  }

  if (!isVisible && !isOpen) return null

  // Ensure we're in the browser before rendering portal
  if (typeof window === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal - Centered on screen */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'absolute inset-0 flex items-center justify-center p-4 pointer-events-none',
          'transition-all duration-300 ease-out',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div
          className={cn(
            'w-full max-w-2xl transition-all duration-300 ease-out relative z-10 pointer-events-auto',
            isOpen ? 'scale-100' : 'scale-95'
          )}
          onClick={(e) => e.stopPropagation()}
        >
        <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gray-900">
            <h2 id="modal-title" className="text-xl font-bold text-white">
              Create Achievement Type
            </h2>
            <button
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6 space-y-4">
              {/* Preview Section */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary-400" />
                  Live Preview
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                      {(() => {
                        const IconComponent = getAchievementIcon(formData.key || 'default')
                        return <IconComponent className="h-8 w-8 text-primary-400" />
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-white text-lg">{formData.baseName || 'Achievement Type'}</h4>
                        <span className={cn('text-xs px-3 py-1 rounded-full font-medium', CATEGORY_COLORS[formData.category])}>
                          {formData.category?.toUpperCase() || 'WATCHING'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">{formData.baseDescription || 'Achievement type description'}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{formData.tiers.length} tiers • {formData.maxTier} max tier</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tiers Preview */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">Tiers Preview</h5>
                    {formData.tiers.map((tier) => (
                      <div
                        key={tier.tier}
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
                            <h6 className="font-semibold text-white text-sm">{tier.name}</h6>
                            <span className="text-xs text-yellow-400">{tier.points} pts</span>
                          </div>
                          <p className="text-xs text-gray-400 mb-1">{tier.description}</p>
                          <span className="text-xs text-gray-500">{tier.requirement} required</span>
                        </div>
                      </div>
                    ))}
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
                        value={formData.key}
                        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                        placeholder="anime_watched"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">Unique identifier (snake_case)</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-xs text-gray-500">Suggestions:</span>
                        {['anime_watched', 'anime_completed', 'anime_rated', 'followers_gained', 'reviews_written'].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => setFormData({ ...formData, key: suggestion })}
                            className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
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
                      Base Name <span className="text-red-400">*</span>
                    </label>
                    <AccessibleInput
                      value={formData.baseName}
                      onChange={(e) => setFormData({ ...formData, baseName: e.target.value })}
                      placeholder="Anime Watcher"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Base Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={formData.baseDescription}
                      onChange={(e) => setFormData({ ...formData, baseDescription: e.target.value })}
                      placeholder="Watch anime and build your collection"
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
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
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
                        Max Tiers <span className="text-red-400">*</span>
                      </label>
                      <AccessibleInput
                        type="number"
                        value={formData.maxTier}
                        onChange={(e) => {
                          const newMaxTier = parseInt(e.target.value) || 1
                          setFormData({ ...formData, maxTier: newMaxTier })
                        }}
                        min="1"
                        max="8"
                        placeholder="3"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">Number of tiers (1-8)</p>
                    </div>
                  </div>
                </div>

                {/* Tiers Management */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Crown className="h-5 w-5 text-primary-400" />
                      Achievement Tiers
                    </h4>
                    <Button
                      type="button"
                      onClick={addTier}
                      disabled={formData.tiers.length >= 8}
                      size="sm"
                      className="bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 border border-primary-500/30"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tier
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.tiers.map((tier) => (
                      <div key={tier.tier} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-4">
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
                          <h5 className="font-semibold text-white">Tier {tier.tier}</h5>
                          {formData.tiers.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeTier(tier.tier)}
                              size="sm"
                              variant="ghost"
                              className="ml-auto text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Tier Name <span className="text-red-400">*</span>
                            </label>
                            <AccessibleInput
                              value={tier.name}
                              onChange={(e) => updateTier(tier.tier, 'name', e.target.value)}
                              placeholder="First Steps"
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-colors"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Requirement <span className="text-red-400">*</span>
                            </label>
                            <AccessibleInput
                              type="number"
                              value={tier.requirement}
                              onChange={(e) => updateTier(tier.tier, 'requirement', parseInt(e.target.value) || 1)}
                              min="1"
                              placeholder="1"
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-colors"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Points <span className="text-red-400">*</span>
                            </label>
                            <AccessibleInput
                              type="number"
                              value={tier.points}
                              onChange={(e) => updateTier(tier.tier, 'points', parseInt(e.target.value) || 10)}
                              min="1"
                              max="1000"
                              placeholder="10"
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-colors"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Description <span className="text-red-400">*</span>
                            </label>
                            <textarea
                              value={tier.description}
                              onChange={(e) => updateTier(tier.tier, 'description', e.target.value)}
                              placeholder="Complete the first milestone"
                              rows={2}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white rounded-lg placeholder-gray-500 focus:outline-none focus:border-primary-500/50 resize-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10">
                <Button 
                  onClick={handleSubmit} 
                  disabled={!isFormValid}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-primary-500/25 disabled:shadow-none"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Create Achievement Type
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClose}
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
          </div>
        </div>
        </div>
      </div>
    </div>,
    document.body
  )
}