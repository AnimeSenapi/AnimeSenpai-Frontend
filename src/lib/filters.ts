/**
 * Frontend Anime Content Filters
 * 
 * Client-side filtering utilities using shared filter configuration.
 * This provides an additional safety layer on top of backend filtering.
 */

import { ANIME_FILTERS } from '../types/anime-filters'
import { Anime } from '../types/anime'

// Pre-compute lowercase sets for O(1) lookups (performance optimization)
const EXCLUDED_GENRES_SET = new Set(ANIME_FILTERS.excludedGenres.map(g => g.toLowerCase()))
const EXCLUDED_RATINGS_SET = new Set(ANIME_FILTERS.excludedRatings.map(r => r.toLowerCase()))
const EXCLUDED_DEMOGRAPHICS_SET = new Set(ANIME_FILTERS.excludedDemographics.map(d => d.toLowerCase()))
const EXCLUDED_THEMES_SET = new Set(ANIME_FILTERS.excludedThemes.map(t => t.toLowerCase()))

// Genre variations and synonyms for better matching
const GENRE_VARIATIONS: Record<string, string[]> = {
  'hentai': ['hentai', 'ecchi', 'erotica', 'adult'],
  'ecchi': ['ecchi', 'hentai', 'erotica'],
  'yaoi': ['yaoi', 'shounen ai', 'boys love', 'bl'],
  'yuri': ['yuri', 'shoujo ai', 'girls love', 'gl'],
  'shoujo ai': ['shoujo ai', 'yuri', 'girls love', 'gl'],
  'shounen ai': ['shounen ai', 'yaoi', 'boys love', 'bl'],
}

// Helper function to check if a string matches any variation
function matchesVariation(text: string, variations: string[]): boolean {
  const textLower = text.toLowerCase()
  return variations.some(v => textLower.includes(v.toLowerCase()) || v.toLowerCase().includes(textLower))
}

/**
 * Check if an anime should be filtered out based on filter configuration
 * This is a client-side safety check - backend already filters, but this
 * provides an extra layer of protection
 * Optimized with Set lookups for better performance
 */
export function shouldFilterAnime(anime: Anime): boolean {
  // Cast to any to access fields that might not be in the type definition
  const animeAny = anime as any
  
  // Filter out anime without genres or tags (incomplete data)
  const hasGenres = anime.genres && anime.genres.length > 0
  const hasThemes = animeAny.themes && Array.isArray(animeAny.themes) && animeAny.themes.length > 0
  const hasTags = animeAny.tags && Array.isArray(animeAny.tags) && animeAny.tags.length > 0
  if (!hasGenres && !hasThemes && !hasTags) {
    return true // Filter out anime with no genres, themes, or tags
  }
  
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
    // Check exact matches and partial matches with Set lookup
    for (const excludedRating of EXCLUDED_RATINGS_SET) {
      if (ratingStr === excludedRating || 
          ratingStr.includes(excludedRating) || 
          ratingStr.startsWith(excludedRating) ||
          excludedRating.includes(ratingStr)) {
        return true
      }
    }
  }

  // Check excluded genres (optimized with Set lookup + variations)
  if (anime.genres && anime.genres.length > 0) {
    for (const genre of anime.genres) {
      const genreNameLower = genre.name.toLowerCase()
      
      // Direct match check
      if (EXCLUDED_GENRES_SET.has(genreNameLower)) {
        return true
      }
      
      // Check for variations and synonyms
      for (const [baseGenre, variations] of Object.entries(GENRE_VARIATIONS)) {
        if (EXCLUDED_GENRES_SET.has(baseGenre) && matchesVariation(genreNameLower, variations)) {
          return true
        }
      }
    }
  }

  // Note: Demographics and themes are not typically in the frontend Anime type
  // but we check if they exist (some API responses might include them)

  // Check excluded demographics (if available) - optimized with Set lookup
  if (animeAny.demographics && Array.isArray(animeAny.demographics)) {
    for (const demo of animeAny.demographics) {
      const demoName = typeof demo === 'string' ? demo : demo.name
      if (EXCLUDED_DEMOGRAPHICS_SET.has(demoName.toLowerCase())) {
        return true
      }
    }
  }

  // Check excluded themes (if available) - optimized with Set lookup
  if (animeAny.themes && Array.isArray(animeAny.themes)) {
    for (const theme of animeAny.themes) {
      const themeName = typeof theme === 'string' ? theme : theme.name
      const themeNameLower = themeName.toLowerCase()
      if (EXCLUDED_THEMES_SET.has(themeNameLower)) {
        return true
      }
      // Also check for partial matches
      for (const excludedTheme of EXCLUDED_THEMES_SET) {
        if (themeNameLower.includes(excludedTheme) || excludedTheme.includes(themeNameLower)) {
          return true
        }
      }
    }
  }

  // Check excluded types (filter out non-anime content like Music, Manga, etc.)
  if (ANIME_FILTERS.excludedTypes && anime.type) {
    const excludedTypesSet = new Set(ANIME_FILTERS.excludedTypes.map(t => t.toLowerCase()))
    const typeLower = anime.type.toLowerCase()
    if (excludedTypesSet.has(typeLower)) {
      return true
    }
    // Also check for partial matches (e.g., "Music Video" contains "Music")
    for (const excludedType of excludedTypesSet) {
      if (typeLower.includes(excludedType) || excludedType.includes(typeLower)) {
        return true
      }
    }
  }

  // Check additional filter options
  if (ANIME_FILTERS.excludeEcchi && anime.genres) {
    const hasEcchi = anime.genres.some(g => {
      const name = g.name.toLowerCase()
      return name.includes('ecchi') || name.includes('hentai') || name.includes('erotica')
    })
    if (hasEcchi) return true
  }

  if (ANIME_FILTERS.excludeYaoi && anime.genres) {
    const hasYaoi = anime.genres.some(g => {
      const name = g.name.toLowerCase()
      return name.includes('yaoi') || name.includes('shounen ai') || name.includes('boys love')
    })
    if (hasYaoi) return true
  }

  if (ANIME_FILTERS.excludeYuri && anime.genres) {
    const hasYuri = anime.genres.some(g => {
      const name = g.name.toLowerCase()
      return name.includes('yuri') || name.includes('shoujo ai') || name.includes('girls love')
    })
    if (hasYuri) return true
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
    // Check excluded genres from episode data (optimized with Set lookup)
    if (episode.genres && episode.genres.length > 0) {
      for (const genre of episode.genres) {
        const genreLower = genre.toLowerCase()
        if (EXCLUDED_GENRES_SET.has(genreLower)) {
          return false // Filter out this episode
        }
        // Check for variations
        for (const [baseGenre, variations] of Object.entries(GENRE_VARIATIONS)) {
          if (EXCLUDED_GENRES_SET.has(baseGenre) && matchesVariation(genreLower, variations)) {
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
    // Check excluded genres (optimized with Set lookup)
    if (anime.genres && anime.genres.length > 0) {
      for (const genre of anime.genres) {
        const genreLower = genre.toLowerCase()
        if (EXCLUDED_GENRES_SET.has(genreLower)) {
          return false // Filter out this anime
        }
        // Check for variations
        for (const [baseGenre, variations] of Object.entries(GENRE_VARIATIONS)) {
          if (EXCLUDED_GENRES_SET.has(baseGenre) && matchesVariation(genreLower, variations)) {
            return false // Filter out this anime
          }
        }
      }
    }
    return true // Keep this anime
  })
}

