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
export const MemoizedAnimeCard = memo(
  AnimeCard,
  (prevProps, nextProps) => {
    return (
      prevProps.anime.id === nextProps.anime.id &&
      prevProps.isFavorited === nextProps.isFavorited &&
      prevProps.variant === nextProps.variant
    )
  }
)

MemoizedAnimeCard.displayName = 'MemoizedAnimeCard'

/**
 * Memoized SearchAnimeCard
 * Optimized for search results rendering
 */
export const MemoizedSearchAnimeCard = memo(
  SearchAnimeCard,
  (prevProps, nextProps) => {
    return (
      prevProps.anime.id === nextProps.anime.id &&
      prevProps.isFavorited === nextProps.isFavorited &&
      prevProps.variant === nextProps.variant
    )
  }
)

MemoizedSearchAnimeCard.displayName = 'MemoizedSearchAnimeCard'

/**
 * Memoized MyListAnimeCard
 * Optimized for my list rendering
 */
export const MemoizedMyListAnimeCard = memo(
  MyListAnimeCard,
  (prevProps, nextProps) => {
    return (
      prevProps.item.anime.id === nextProps.item.anime.id &&
      prevProps.item.listStatus === nextProps.item.listStatus &&
      prevProps.item.progress === nextProps.item.progress &&
      prevProps.item.score === nextProps.item.score &&
      prevProps.item.isFavorite === nextProps.item.isFavorite
    )
  }
)

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

