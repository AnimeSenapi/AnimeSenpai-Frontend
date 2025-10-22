/**
 * Memoized component wrappers
 * Prevents unnecessary re-renders for performance-critical components
 */

import { memo } from 'react'
import { AnimeCard } from './anime/AnimeCard'
import { SearchAnimeCard } from './anime/SearchAnimeCard'
import { MyListAnimeCard } from './anime/MyListAnimeCard'

/**
 * Memoized AnimeCard
 * Only re-renders when props actually change
 */
export const MemoizedAnimeCard = memo(AnimeCard, (prevProps, nextProps) => {
  return (
    prevProps.anime.id === nextProps.anime.id &&
    prevProps.isFavorited === nextProps.isFavorited &&
    prevProps.variant === nextProps.variant
  )
})

MemoizedAnimeCard.displayName = 'MemoizedAnimeCard'

/**
 * Memoized SearchAnimeCard
 * Optimized for search results rendering
 */
export const MemoizedSearchAnimeCard = memo(SearchAnimeCard, (prevProps, nextProps) => {
  return (
    prevProps.anime.id === nextProps.anime.id &&
    prevProps.isFavorited === nextProps.isFavorited &&
    prevProps.variant === nextProps.variant
  )
})

MemoizedSearchAnimeCard.displayName = 'MemoizedSearchAnimeCard'

/**
 * Memoized MyListAnimeCard
 * Optimized for my list rendering
 */
export const MemoizedMyListAnimeCard = memo(MyListAnimeCard, (prevProps, nextProps) => {
  return (
    prevProps.anime.id === nextProps.anime.id &&
    prevProps.anime.listStatus === nextProps.anime.listStatus &&
    prevProps.anime.progress === nextProps.anime.progress &&
    prevProps.isFavorited === nextProps.isFavorited &&
    prevProps.variant === nextProps.variant
  )
})

MemoizedMyListAnimeCard.displayName = 'MemoizedMyListAnimeCard'

/**
 * Helper function to create memoized component with custom comparison
 */
export function createMemoized<P extends object>(
  Component: React.ComponentType<P>,
  compare?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  return memo(Component, compare)
}
