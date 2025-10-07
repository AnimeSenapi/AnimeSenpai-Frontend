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
  role?: 'user' | 'tester' | 'admin' // Role-based access control
  createdAt?: string
  updatedAt?: string
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

// MyList Types (User Anime List)
export type ListStatus = 'watching' | 'completed' | 'plan-to-watch' | 'on-hold' | 'dropped'

export interface AnimeListItem {
  id: string
  userId: string
  animeId: string
  status: ListStatus
  isFavorite: boolean
  currentEpisode: number
  rating?: number // User's rating (1-10)
  notes?: string
  startedAt?: string
  completedAt?: string
  updatedAt: string
  createdAt: string
  anime?: Anime // Populated anime data
}

export interface UserListResponse {
  items: AnimeListItem[]
  total: number
  stats: {
    watching: number
    completed: number
    planToWatch: number
    onHold: number
    dropped: number
    favorites: number
  }
}

// Feature Flags (Beta Testing)
export interface FeatureFlag {
  id: string
  key: string
  name: string
  description?: string
  enabled: boolean
  roles: ('user' | 'tester' | 'admin')[]
  createdAt: string
  updatedAt: string
}

export interface FeatureAccess {
  feature: string
  hasAccess: boolean
  reason?: string
}
