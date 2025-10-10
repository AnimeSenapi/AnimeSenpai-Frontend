/**
 * 🏆 Achievement System
 * 
 * Gamification features to increase user engagement
 */

import { 
  Trophy, 
  Star, 
  Heart, 
  Flame, 
  Target, 
  Award, 
  Zap,
  Crown,
  Gem,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Eye,
  MessageSquare,
  Calendar,
  Film,
  BookOpen,
  Compass,
  type LucideIcon
} from 'lucide-react'

export type AchievementCategory = 'watching' | 'rating' | 'social' | 'exploration' | 'special'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: LucideIcon
  category: AchievementCategory
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  requirement: number
  unlockedAt?: Date
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  // Watching Achievements
  {
    id: 'first_anime',
    name: 'First Steps',
    description: 'Add your first anime to your list',
    icon: Film,
    category: 'watching',
    tier: 'bronze',
    requirement: 1
  },
  {
    id: 'anime_10',
    name: 'Getting Started',
    description: 'Add 10 anime to your list',
    icon: BookOpen,
    category: 'watching',
    tier: 'bronze',
    requirement: 10
  },
  {
    id: 'anime_25',
    name: 'Casual Viewer',
    description: 'Add 25 anime to your list',
    icon: Eye,
    category: 'watching',
    tier: 'silver',
    requirement: 25
  },
  {
    id: 'anime_50',
    name: 'Dedicated Fan',
    description: 'Add 50 anime to your list',
    icon: Star,
    category: 'watching',
    tier: 'silver',
    requirement: 50
  },
  {
    id: 'anime_100',
    name: 'Anime Enthusiast',
    description: 'Add 100 anime to your list',
    icon: Trophy,
    category: 'watching',
    tier: 'gold',
    requirement: 100
  },
  {
    id: 'anime_250',
    name: 'Anime Expert',
    description: 'Add 250 anime to your list',
    icon: Award,
    category: 'watching',
    tier: 'gold',
    requirement: 250
  },
  {
    id: 'anime_500',
    name: 'Anime Master',
    description: 'Add 500 anime to your list',
    icon: Crown,
    category: 'watching',
    tier: 'platinum',
    requirement: 500
  },
  {
    id: 'anime_1000',
    name: 'Anime Legend',
    description: 'Add 1000 anime to your list',
    icon: Gem,
    category: 'watching',
    tier: 'diamond',
    requirement: 1000
  },

  // Completion Achievements
  {
    id: 'completed_10',
    name: 'Completionist',
    description: 'Complete 10 anime',
    icon: Target,
    category: 'watching',
    tier: 'bronze',
    requirement: 10
  },
  {
    id: 'completed_50',
    name: 'Series Finisher',
    description: 'Complete 50 anime',
    icon: Trophy,
    category: 'watching',
    tier: 'silver',
    requirement: 50
  },
  {
    id: 'completed_100',
    name: 'Binge Master',
    description: 'Complete 100 anime',
    icon: Crown,
    category: 'watching',
    tier: 'gold',
    requirement: 100
  },

  // Rating Achievements
  {
    id: 'first_rating',
    name: 'Critic Debut',
    description: 'Rate your first anime',
    icon: Star,
    category: 'rating',
    tier: 'bronze',
    requirement: 1
  },
  {
    id: 'ratings_10',
    name: 'Opinion Matters',
    description: 'Rate 10 anime',
    icon: MessageSquare,
    category: 'rating',
    tier: 'bronze',
    requirement: 10
  },
  {
    id: 'ratings_50',
    name: 'Seasoned Critic',
    description: 'Rate 50 anime',
    icon: Award,
    category: 'rating',
    tier: 'silver',
    requirement: 50
  },
  {
    id: 'ratings_100',
    name: 'Master Critic',
    description: 'Rate 100 anime',
    icon: Crown,
    category: 'rating',
    tier: 'gold',
    requirement: 100
  },

  // Social Achievements
  {
    id: 'first_follower',
    name: 'Making Friends',
    description: 'Get your first follower',
    icon: Users,
    category: 'social',
    tier: 'bronze',
    requirement: 1
  },
  {
    id: 'followers_10',
    name: 'Popular',
    description: 'Get 10 followers',
    icon: Users,
    category: 'social',
    tier: 'silver',
    requirement: 10
  },
  {
    id: 'followers_50',
    name: 'Influencer',
    description: 'Get 50 followers',
    icon: TrendingUp,
    category: 'social',
    tier: 'gold',
    requirement: 50
  },
  {
    id: 'followers_100',
    name: 'Celebrity',
    description: 'Get 100 followers',
    icon: Crown,
    category: 'social',
    tier: 'platinum',
    requirement: 100
  },
  {
    id: 'following_10',
    name: 'Social Butterfly',
    description: 'Follow 10 users',
    icon: Heart,
    category: 'social',
    tier: 'bronze',
    requirement: 10
  },
  {
    id: 'friends_5',
    name: 'Mutual Connections',
    description: 'Have 5 mutual follows',
    icon: Users,
    category: 'social',
    tier: 'silver',
    requirement: 5
  },

  // Exploration Achievements
  {
    id: 'genres_5',
    name: 'Genre Explorer',
    description: 'Watch anime from 5 different genres',
    icon: Compass,
    category: 'exploration',
    tier: 'bronze',
    requirement: 5
  },
  {
    id: 'genres_10',
    name: 'Diverse Taste',
    description: 'Watch anime from 10 different genres',
    icon: Sparkles,
    category: 'exploration',
    tier: 'silver',
    requirement: 10
  },
  {
    id: 'genres_15',
    name: 'Genre Master',
    description: 'Watch anime from 15 different genres',
    icon: Gem,
    category: 'exploration',
    tier: 'gold',
    requirement: 15
  },

  // Special Achievements
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Join AnimeSenpai in the first month',
    icon: Zap,
    category: 'special',
    tier: 'gold',
    requirement: 1
  },
  {
    id: 'profile_complete',
    name: 'Profile Pro',
    description: 'Complete your profile (avatar, bio, preferences)',
    icon: Shield,
    category: 'special',
    tier: 'bronze',
    requirement: 1
  },
  {
    id: 'streak_7',
    name: 'Weekly Warrior',
    description: 'Active for 7 consecutive days',
    icon: Flame,
    category: 'special',
    tier: 'silver',
    requirement: 7
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Active for 30 consecutive days',
    icon: Calendar,
    category: 'special',
    tier: 'gold',
    requirement: 30
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Rate 10 anime with a perfect 10/10',
    icon: Star,
    category: 'rating',
    tier: 'silver',
    requirement: 10
  }
]

// Tier colors and display info
export const TIER_INFO = {
  bronze: {
    color: 'from-orange-700 to-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    glow: 'shadow-orange-500/20'
  },
  silver: {
    color: 'from-gray-400 to-gray-200',
    bgColor: 'bg-gray-400/10',
    borderColor: 'border-gray-400/30',
    textColor: 'text-gray-300',
    glow: 'shadow-gray-400/20'
  },
  gold: {
    color: 'from-yellow-600 to-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
    glow: 'shadow-yellow-500/20'
  },
  platinum: {
    color: 'from-cyan-400 to-blue-400',
    bgColor: 'bg-cyan-400/10',
    borderColor: 'border-cyan-400/30',
    textColor: 'text-cyan-400',
    glow: 'shadow-cyan-400/20'
  },
  diamond: {
    color: 'from-purple-400 to-pink-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/30',
    textColor: 'text-purple-400',
    glow: 'shadow-purple-400/20'
  }
}

/**
 * Calculate which achievements a user has unlocked
 */
export function calculateAchievements(stats: {
  totalAnime: number
  completedAnime: number
  totalRatings: number
  followers: number
  following: number
  mutualFollows: number
  uniqueGenres: number
  perfectRatings: number
  hasAvatar: boolean
  hasBio: boolean
  createdAt: Date
}): Achievement[] {
  const unlocked: Achievement[] = []
  const now = new Date()

  for (const achievement of ACHIEVEMENTS) {
    let isUnlocked = false

    switch (achievement.id) {
      // Watching
      case 'first_anime':
      case 'anime_10':
      case 'anime_25':
      case 'anime_50':
      case 'anime_100':
      case 'anime_250':
      case 'anime_500':
      case 'anime_1000':
        isUnlocked = stats.totalAnime >= achievement.requirement
        break

      // Completion
      case 'completed_10':
      case 'completed_50':
      case 'completed_100':
        isUnlocked = stats.completedAnime >= achievement.requirement
        break

      // Ratings
      case 'first_rating':
      case 'ratings_10':
      case 'ratings_50':
      case 'ratings_100':
        isUnlocked = stats.totalRatings >= achievement.requirement
        break

      // Social
      case 'first_follower':
      case 'followers_10':
      case 'followers_50':
      case 'followers_100':
        isUnlocked = stats.followers >= achievement.requirement
        break

      case 'following_10':
        isUnlocked = stats.following >= achievement.requirement
        break

      case 'friends_5':
        isUnlocked = stats.mutualFollows >= achievement.requirement
        break

      // Exploration
      case 'genres_5':
      case 'genres_10':
      case 'genres_15':
        isUnlocked = stats.uniqueGenres >= achievement.requirement
        break

      // Special
      case 'early_adopter':
        // Check if account created within first month of launch (placeholder date)
        const launchDate = new Date('2025-01-01')
        const oneMonthAfterLaunch = new Date(launchDate)
        oneMonthAfterLaunch.setMonth(oneMonthAfterLaunch.getMonth() + 1)
        isUnlocked = stats.createdAt <= oneMonthAfterLaunch
        break

      case 'profile_complete':
        isUnlocked = stats.hasAvatar && stats.hasBio
        break

      case 'perfectionist':
        isUnlocked = stats.perfectRatings >= achievement.requirement
        break

      // Streak achievements would need backend tracking
      case 'streak_7':
      case 'streak_30':
        // Placeholder - would need actual streak data from backend
        isUnlocked = false
        break
    }

    if (isUnlocked) {
      unlocked.push({ ...achievement, unlockedAt: now })
    }
  }

  return unlocked
}

/**
 * Get achievement progress (0-1)
 */
export function getAchievementProgress(
  achievement: Achievement,
  currentValue: number
): number {
  return Math.min(currentValue / achievement.requirement, 1)
}

/**
 * Get next achievement to unlock in a category
 */
export function getNextAchievement(
  category: AchievementCategory,
  unlockedIds: string[]
): Achievement | null {
  const categoryAchievements = ACHIEVEMENTS
    .filter(a => a.category === category)
    .filter(a => !unlockedIds.includes(a.id))
    .sort((a, b) => a.requirement - b.requirement)

  return categoryAchievements[0] || null
}

/**
 * Group achievements by category
 */
export function groupAchievementsByCategory(
  achievements: Achievement[]
): Record<AchievementCategory, Achievement[]> {
  const grouped: Record<AchievementCategory, Achievement[]> = {
    watching: [],
    rating: [],
    social: [],
    exploration: [],
    special: []
  }

  for (const achievement of achievements) {
    grouped[achievement.category].push(achievement)
  }

  return grouped
}

