'use client'

import { Lightbulb, Users, Star, TrendingUp, Heart, Tag, Calendar, Sparkles } from 'lucide-react'
import { SimpleTooltip } from './ui/tooltip'

interface RecommendationReason {
  type:
    | 'genre-match'
    | 'user-similarity'
    | 'high-rated'
    | 'trending'
    | 'favorite-similar'
    | 'same-studio'
    | 'same-year'
  score: number
  details?: string
}

interface RecommendationExplanationProps {
  reasons: RecommendationReason[]
  variant?: 'badge' | 'card' | 'tooltip'
  showScore?: boolean
}

/**
 * Recommendation Explanation Component
 * Explains why an anime was recommended to the user
 */
export function RecommendationExplanation({
  reasons,
  variant = 'tooltip',
  showScore = false,
}: RecommendationExplanationProps) {
  if (!reasons || reasons.length === 0) {
    return null
  }

  const primaryReason = reasons[0]
  const totalScore = reasons.reduce((sum, r) => sum + r.score, 0)

  // Get icon and label for reason type
  const getReasonInfo = (type: RecommendationReason['type']) => {
    switch (type) {
      case 'genre-match':
        return {
          icon: <Tag className="h-4 w-4" />,
          label: 'Similar Genres',
          color: 'text-blue-400',
          description: 'Based on genres you enjoy',
        }
      case 'user-similarity':
        return {
          icon: <Users className="h-4 w-4" />,
          label: 'Friends Like This',
          color: 'text-purple-400',
          description: 'Popular with users similar to you',
        }
      case 'high-rated':
        return {
          icon: <Star className="h-4 w-4" />,
          label: 'Highly Rated',
          color: 'text-yellow-400',
          description: 'Highly rated by the community',
        }
      case 'trending':
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          label: 'Trending',
          color: 'text-green-400',
          description: 'Currently popular',
        }
      case 'favorite-similar':
        return {
          icon: <Heart className="h-4 w-4" />,
          label: 'Similar to Favorites',
          color: 'text-red-400',
          description: 'Similar to your favorite anime',
        }
      case 'same-studio':
        return {
          icon: <Sparkles className="h-4 w-4" />,
          label: 'Same Studio',
          color: 'text-cyan-400',
          description: 'From a studio you like',
        }
      case 'same-year':
        return {
          icon: <Calendar className="h-4 w-4" />,
          label: 'Same Era',
          color: 'text-orange-400',
          description: 'From the same time period',
        }
    }
  }

  const reasonInfo = primaryReason ? getReasonInfo(primaryReason.type) : getReasonInfo('genre-match')

  // Badge variant (small, minimal)
  if (variant === 'badge') {
    const content = (
      <div className="space-y-2">
        {reasons.map((reason, index) => {
          const info = getReasonInfo(reason.type)
          return (
            <div key={index} className="flex items-center gap-2">
              <div className={info.color}>{info.icon}</div>
              <div>
                <div className="font-medium">{info.label}</div>
                {reason.details && <div className="text-xs text-gray-400">{reason.details}</div>}
                {showScore && (
                  <div className="text-xs text-gray-500">
                    Match: {Math.round(reason.score * 100)}%
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )

    return (
      <SimpleTooltip content={content}>
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 ${reasonInfo.color}`}
        >
          {reasonInfo.icon}
          {reasonInfo.label}
          {showScore && <span className="ml-1 opacity-70">{Math.round(totalScore * 100)}%</span>}
        </span>
      </SimpleTooltip>
    )
  }

  // Card variant (detailed)
  if (variant === 'card') {
    return (
      <div className="p-4 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-primary-400" />
          <h3 className="font-semibold text-white">Why this recommendation?</h3>
        </div>

        <div className="space-y-2">
          {reasons.map((reason, index) => {
            const info = getReasonInfo(reason.type)
            return (
              <div key={index} className="flex items-start gap-3 p-2 bg-white/5 rounded-lg">
                <div className={`flex-shrink-0 ${info.color}`}>{info.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm">{info.label}</div>
                  <div className="text-xs text-gray-400">{info.description}</div>
                  {reason.details && (
                    <div className="text-xs text-gray-500 mt-1">{reason.details}</div>
                  )}
                  {showScore && (
                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all`}
                            style={{ width: `${reason.score * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(reason.score * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {showScore && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Overall Match</span>
              <span className="font-semibold text-primary-400">
                {Math.round(totalScore * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Tooltip variant (default)
  const tooltipContent = (
    <div className="space-y-2 max-w-xs">
      <div className="font-semibold text-white mb-2">Recommended because:</div>
      {reasons.map((reason, index) => {
        const info = getReasonInfo(reason.type)
        return (
          <div key={index} className="flex items-start gap-2">
            <div className={`flex-shrink-0 ${info.color}`}>{info.icon}</div>
            <div>
              <div className="font-medium text-xs">{info.label}</div>
              <div className="text-[10px] text-gray-400">{info.description}</div>
              {reason.details && (
                <div className="text-[10px] text-gray-500 mt-0.5">{reason.details}</div>
              )}
            </div>
          </div>
        )
      })}
      {showScore && (
        <div className="pt-2 border-t border-white/20 text-xs text-gray-400">
          Match: {Math.round(totalScore * 100)}%
        </div>
      )}
    </div>
  )

  return (
    <SimpleTooltip content={tooltipContent}>
      <button
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 ${reasonInfo.color} hover:bg-white/10 transition-colors`}
      >
        {reasonInfo.icon}
        <span className="hidden sm:inline">{reasonInfo.label}</span>
        {showScore && <span className="opacity-70">{Math.round(totalScore * 100)}%</span>}
      </button>
    </SimpleTooltip>
  )
}

/**
 * Generate recommendation reasons from anime data
 */
export function generateRecommendationReasons(
  anime: any,
  userPreferences?: {
    favoriteGenres?: string[]
    favoriteStudios?: string[]
    averageRating?: number
  }
): RecommendationReason[] {
  const reasons: RecommendationReason[] = []

  // Genre match
  if (userPreferences?.favoriteGenres && anime.genres) {
    const matchingGenres = anime.genres.filter((g: any) =>
      userPreferences.favoriteGenres?.includes(g.name || g)
    )
    if (matchingGenres.length > 0) {
      reasons.push({
        type: 'genre-match',
        score: Math.min(matchingGenres.length / 3, 1), // Cap at 1.0
        details: `Matches ${matchingGenres.length} of your favorite genres`,
      })
    }
  }

  // High rated
  if (anime.rating && anime.rating >= 8.0) {
    reasons.push({
      type: 'high-rated',
      score: anime.rating / 10,
      details: `Community rating: ${anime.rating}/10`,
    })
  }

  // Trending
  if (anime.trending || anime.popularity) {
    reasons.push({
      type: 'trending',
      score: 0.8,
      details: 'Currently trending',
    })
  }

  // Same studio
  if (userPreferences?.favoriteStudios && anime.studio) {
    if (userPreferences.favoriteStudios.includes(anime.studio)) {
      reasons.push({
        type: 'same-studio',
        score: 0.7,
        details: `From ${anime.studio}`,
      })
    }
  }

  // Sort by score
  return reasons.sort((a, b) => b.score - a.score)
}
