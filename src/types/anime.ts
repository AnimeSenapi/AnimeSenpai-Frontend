import { Tag } from './tags'

export interface Genre {
  id: string
  name: string
  slug: string
  color?: string
}

export interface Anime {
  id: string
  slug: string
  title: string
  description?: string
  year: number
  season?: 'Spring' | 'Summer' | 'Fall' | 'Winter'
  rating: number
  status: 'new' | 'hot' | 'trending' | 'classic' | 'ongoing' | 'completed' | 'upcoming'
  tags: string[] // Tag IDs
  genres?: Genre[] // API format includes genres
  episodes?: number
  duration?: number // in minutes
  studio?: string
  director?: string
  imageUrl?: string
  trailerUrl?: string
  malId?: number // MyAnimeList ID
  anilistId?: number // AniList ID
}

export interface AnimeCardProps {
  anime: Anime
  variant?: 'featured' | 'list' | 'grid' | 'compact'
  className?: string
  onPlay?: () => void
  onBookmark?: () => void
  onLike?: () => void
}

// API Response Types
export interface AnimeListResponse {
  anime: Anime[]
  total: number
}

// Auth Response Types
export interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  name?: string
  avatar?: string
  emailVerified?: boolean
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export interface SignupInput {
  email: string
  password: string
  firstName: string
  lastName?: string
  gdprConsent: boolean
  dataProcessingConsent: boolean
  marketingConsent?: boolean
  confirmPassword?: string
}
