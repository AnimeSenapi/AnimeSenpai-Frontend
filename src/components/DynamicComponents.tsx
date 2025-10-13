/**
 * Dynamic component imports for code splitting
 * Heavy components are loaded only when needed
 */

import dynamic from 'next/dynamic'
import { LoadingState, Spinner } from './ui/loading-state'

// Loading fallbacks
const LoadingFallback = () => <LoadingState variant="inline" text="Loading component..." />
const SpinnerFallback = () => <Spinner className="h-8 w-8 text-primary-400" />
const OverlayFallback = () => <LoadingState variant="overlay" text="Loading..." />

/**
 * Admin Components - Heavy, only load for admins
 */
export const DynamicAnimeTab = dynamic(
  () => import('../app/admin/components/AnimeTab').then(mod => ({ default: mod.AnimeTab })),
  { loading: LoadingFallback, ssr: false }
)

export const DynamicUsersTab = dynamic(
  () => import('../app/admin/components/UsersTab').then(mod => ({ default: mod.UsersTab })),
  { loading: LoadingFallback, ssr: false }
)

export const DynamicSettingsTab = dynamic(
  () => import('../app/admin/components/SettingsTab').then(mod => ({ default: mod.SettingsTab })),
  { loading: LoadingFallback, ssr: false }
)

export const DynamicDashboardTab = dynamic(
  () => import('../app/admin/components/DashboardTab').then(mod => ({ default: mod.DashboardTab })),
  { loading: LoadingFallback, ssr: false }
)

/**
 * Social Components - Load when user interacts
 */
export const DynamicShareAnimeCard = dynamic(
  () => import('./social/ShareAnimeCard').then(mod => ({ default: mod.ShareAnimeCard })),
  { loading: SpinnerFallback, ssr: false }
)

export const DynamicFollowButton = dynamic(
  () => import('./social/FollowButton').then(mod => ({ default: mod.FollowButton })),
  { loading: SpinnerFallback, ssr: false }
)

export const DynamicFriendsWatching = dynamic(
  () => import('./social/FriendsWatching'),
  { loading: LoadingFallback, ssr: false }
)

/**
 * Media Components - Heavy, load on demand
 */
export const DynamicTrailerPlayer = dynamic(
  () => import('./anime/TrailerPlayer').then(mod => ({ default: mod.TrailerPlayer })),
  { loading: OverlayFallback, ssr: false }
)

/**
 * Chart Components - Heavy libraries, load on demand
 */
export const DynamicCharts = dynamic(
  () => import('../app/admin/components/DashboardTab').then(mod => ({ default: mod.DashboardTab })),
  { loading: LoadingFallback, ssr: false }
)

/**
 * Recommendation Carousel - Can be lazy loaded
 */
export const DynamicRecommendationCarousel = dynamic(
  () => import('./recommendations/RecommendationCarousel').then(mod => ({ default: mod.RecommendationCarousel })),
  { loading: LoadingFallback }
)

/**
 * Cookie Consent - Not critical for initial render
 */
export const DynamicCookieConsent = dynamic(
  () => import('./CookieConsent').then(mod => ({ default: mod.CookieConsent })),
  { ssr: false }
)

/**
 * Helper to create lazy loaded component
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    loading?: () => JSX.Element
    ssr?: boolean
  }
) {
  return dynamic(importFn, {
    loading: options?.loading || LoadingFallback,
    ssr: options?.ssr ?? true,
  })
}

