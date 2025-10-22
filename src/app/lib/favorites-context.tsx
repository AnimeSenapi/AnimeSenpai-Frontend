'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiGetFavoritedAnimeIds, apiToggleFavoriteByAnimeId } from './api'
import { useAuth } from './auth-context'

interface FavoritesContextType {
  favoritedAnimeIds: string[]
  isFavorited: (animeId: string) => boolean
  toggleFavorite: (animeId: string) => Promise<void>
  isLoading: boolean
  refreshFavorites: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [favoritedAnimeIds, setFavoritedAnimeIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadFavorites = async () => {
    if (!isAuthenticated) {
      setFavoritedAnimeIds([])
      setIsLoading(false)
      return
    }

    try {
      const ids = (await apiGetFavoritedAnimeIds()) as any
      setFavoritedAnimeIds(ids)
    } catch (error) {
      console.error('Failed to load favorites:', error)
      setFavoritedAnimeIds([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFavorites()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const isFavorited = (animeId: string): boolean => {
    return favoritedAnimeIds.includes(animeId)
  }

  const toggleFavorite = async (animeId: string): Promise<void> => {
    if (!isAuthenticated) {
      // You could show a toast here: "Please sign in to favorite anime"
      return
    }

    // Optimistic update
    setFavoritedAnimeIds((prev) =>
      prev.includes(animeId) ? prev.filter((id) => id !== animeId) : [...prev, animeId]
    )

    try {
      await apiToggleFavoriteByAnimeId(animeId)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      // Revert on error
      setFavoritedAnimeIds((prev) =>
        prev.includes(animeId) ? prev.filter((id) => id !== animeId) : [...prev, animeId]
      )
    }
  }

  const refreshFavorites = async () => {
    await loadFavorites()
  }

  return (
    <FavoritesContext.Provider
      value={{
        favoritedAnimeIds,
        isFavorited,
        toggleFavorite,
        isLoading,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
