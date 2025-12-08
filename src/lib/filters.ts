/**
 * Frontend Anime Content Filters
 * 
 * Client-side filtering utilities using shared filter configuration.
 * This provides an additional safety layer on top of backend filtering.
 */

import { ANIME_FILTERS } from '../types/anime-filters'
import { Anime } from '../types/anime'

/**
 * Check if an anime should be filtered out based on filter configuration
 * This is a client-side safety check - backend already filters, but this
 * provides an extra layer of protection
 */
export function shouldFilterAnime(anime: Anime): boolean {
  // Cast to any to access fields that might not be in the type definition
  const animeAny = anime as any
  
  // Check excluded ratings (content rating like "Rx", "Hentai", etc.)
  // The rating field can be a number (averageRating) or string (content rating)
  // Priority: contentRating field > rating if it's a string
  let ratingStr: string | null = null
  if (animeAny.contentRating) {
    ratingStr = String(animeAny.contentRating).toLowerCase()
  } else if (typeof anime.rating === 'string') {
    ratingStr = anime.rating.toLowerCase()
  }
  
  if (ratingStr) {
    for (const excludedRating of ANIME_FILTERS.excludedRatings) {
      if (ratingStr.includes(excludedRating.toLowerCase()) || ratingStr.startsWith(excludedRating.toLowerCase())) {
        return true
      }
    }
  }

  // Check excluded genres
  if (anime.genres && anime.genres.length > 0) {
    for (const genre of anime.genres) {
      for (const excludedGenre of ANIME_FILTERS.excludedGenres) {
        if (genre.name.toLowerCase() === excludedGenre.toLowerCase()) {
          return true
        }
      }
    }
  }

  // Note: Demographics and themes are not typically in the frontend Anime type
  // but we check if they exist (some API responses might include them)

  // Check excluded demographics (if available)
  if (animeAny.demographics && Array.isArray(animeAny.demographics)) {
    for (const demo of animeAny.demographics) {
      const demoName = typeof demo === 'string' ? demo : demo.name
      for (const excludedDemo of ANIME_FILTERS.excludedDemographics) {
        if (demoName.toLowerCase() === excludedDemo.toLowerCase()) {
          return true
        }
      }
    }
  }

  // Check excluded themes (if available)
  if (animeAny.themes && Array.isArray(animeAny.themes)) {
    for (const theme of animeAny.themes) {
      const themeName = typeof theme === 'string' ? theme : theme.name
      for (const excludedTheme of ANIME_FILTERS.excludedThemes) {
        if (themeName.toLowerCase() === excludedTheme.toLowerCase()) {
          return true
        }
      }
    }
  }

  // Check excluded types (if available)
  if (ANIME_FILTERS.excludedTypes && anime.type) {
    for (const excludedType of ANIME_FILTERS.excludedTypes) {
      if (anime.type.toLowerCase() === excludedType.toLowerCase()) {
        return true
      }
    }
  }

  // Check minimum quality rating
  if (ANIME_FILTERS.minQualityRating && anime.averageRating !== undefined) {
    if (anime.averageRating < ANIME_FILTERS.minQualityRating) {
      return true
    }
  }

  return false
}

/**
 * Filter an array of anime, removing any that match exclusion criteria
 */
export function filterAnimeList(animeList: Anime[]): Anime[] {
  return animeList.filter(anime => !shouldFilterAnime(anime))
}

/**
 * Check if an anime passes all filters (inverse of shouldFilterAnime)
 */
export function passesFilters(anime: Anime): boolean {
  return !shouldFilterAnime(anime)
}

/**
 * Filter episodes by checking if their anime should be filtered
 * Episodes contain anime metadata (genres, etc.) that we can check
 */
export function filterEpisodesByAnime<T extends {
  animeId: string
  genres?: string[]
}>(episodes: T[]): T[] {
  return episodes.filter(episode => {
    // Check excluded genres from episode data
    if (episode.genres && episode.genres.length > 0) {
      for (const genre of episode.genres) {
        for (const excludedGenre of ANIME_FILTERS.excludedGenres) {
          if (genre.toLowerCase() === excludedGenre.toLowerCase()) {
            return false // Filter out this episode
          }
        }
      }
    }
    return true // Keep this episode
  })
}

/**
 * Filter seasonal anime list
 */
export function filterSeasonalAnime<T extends {
  genres: string[]
}>(seasonalAnime: T[]): T[] {
  return seasonalAnime.filter(anime => {
    // Check excluded genres
    if (anime.genres && anime.genres.length > 0) {
      for (const genre of anime.genres) {
        for (const excludedGenre of ANIME_FILTERS.excludedGenres) {
          if (genre.toLowerCase() === excludedGenre.toLowerCase()) {
            return false // Filter out this anime
          }
        }
      }
    }
    return true // Keep this anime
  })
}

