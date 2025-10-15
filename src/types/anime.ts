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
  title: string // Romanized Japanese title
  titleEnglish?: string // English title - PREFER THIS
  titleJapanese?: string // Native Japanese title
  titleSynonyms?: string[] // Alternative titles
  description?: string
  synopsis?: string // Alias for description
  year: number | null
  season?: 'Spring' | 'Summer' | 'Fall' | 'Winter'
  type?: string // TV, Movie, OVA, ONA, Special, etc.
  rating: number
  averageRating?: number // Alias for rating
  status: 'new' | 'hot' | 'trending' | 'classic' | 'ongoing' | 'completed' | 'upcoming'
  tags: string[] // Tag IDs
  genres?: Genre[] // API format includes genres
  episodes?: number
  duration?: number // in minutes
  studio?: string
  director?: string
  coverImage?: string // Main poster/cover image
  bannerImage?: string // Banner/backdrop image
  imageUrl?: string // Alias for backward compatibility
  trailerUrl?: string
  malId?: number // MyAnimeList ID
  anilistId?: number // AniList ID
  // Series grouping metadata
  animeId?: string // For seasons (alias for id)
  displayTitle?: string // Computed display title
  seasonCount?: number // Number of seasons in the series
  totalEpisodes?: number // Total episodes across all seasons
  seasons?: any[] // All seasons data
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
  username: string
  firstName?: string
  lastName?: string
  name?: string
  avatar?: string
  bio?: string
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
  username: string
  password: string
  confirmPassword: string
  gdprConsent: boolean
  dataProcessingConsent: boolean
  marketingConsent?: boolean
}

// MyList Types (User Anime List)
export type ListStatus = 'watching' | 'completed' | 'plan-to-watch' | 'on-hold' | 'dropped'

export interface AnimeListItem {
  listId: string
  anime: Anime | null
  listStatus: 'favorite' | 'watching' | 'completed' | 'plan-to-watch'
  progress: number
  score?: number | null
  notes?: string | null
  startedAt?: string | null
  completedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface UserListResponse {
  items: AnimeListItem[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
  total?: number
  stats?: {
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
