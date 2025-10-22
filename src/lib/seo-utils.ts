/**
 * SEO Utilities
 * Helper functions for generating SEO-friendly content
 */

import type { Anime } from '../types/anime'

/**
 * Generate structured data (JSON-LD) for anime
 */
export function generateAnimeStructuredData(anime: Anime) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: anime.titleEnglish || anime.title,
    alternateName: [anime.title, anime.titleJapanese, ...(anime.titleSynonyms || [])].filter(
      Boolean
    ),
    description:
      anime.description ||
      anime.synopsis ||
      `Watch ${anime.titleEnglish || anime.title} on AnimeSenpai`,
    image: anime.coverImage || anime.bannerImage,
    genre: anime.genres?.map((g: any) => g.name || g) || [],
    datePublished: (anime as any).aired || (anime.year ? `${anime.year}-01-01` : undefined),
    aggregateRating:
      anime.averageRating || anime.rating
        ? {
            '@type': 'AggregateRating',
            ratingValue: anime.averageRating || anime.rating,
            bestRating: 10,
            worstRating: 0,
            ratingCount: (anime as any).ratingCount || 1,
          }
        : undefined,
    numberOfEpisodes: anime.episodes,
    numberOfSeasons: anime.seasonCount || 1,
    productionCompany: anime.studio
      ? {
          '@type': 'Organization',
          name: anime.studio,
        }
      : undefined,
    url: `https://animesenpai.app/anime/${anime.slug}`,
  }
}

/**
 * Generate Open Graph data for anime
 */
export function generateAnimeOGData(anime: Anime) {
  const title = anime.titleEnglish || anime.title
  const description =
    anime.description ||
    anime.synopsis ||
    `Watch ${title} and discover your next favorite anime on AnimeSenpai`

  return {
    title: `${title} | AnimeSenpai`,
    description: description.slice(0, 200),
    type: 'video.tv_show' as const,
    url: `https://animesenpai.app/anime/${anime.slug}`,
    siteName: 'AnimeSenpai',
    images: [
      {
        url: anime.bannerImage || anime.coverImage || '/og-image.png',
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  }
}

/**
 * Generate Twitter Card data for anime
 */
export function generateAnimeTwitterData(anime: Anime) {
  const title = anime.titleEnglish || anime.title
  const description = anime.description || anime.synopsis || `Watch ${title} on AnimeSenpai`

  return {
    card: 'summary_large_image' as const,
    title: `${title} | AnimeSenpai`,
    description: description.slice(0, 200),
    images: [anime.bannerImage || anime.coverImage || '/og-image.png'],
    creator: '@animesenpai_app',
    site: '@animesenpai_app',
  }
}

/**
 * Generate meta description from anime data
 */
export function generateAnimeMetaDescription(anime: Anime): string {
  const title = anime.titleEnglish || anime.title
  const year = anime.year ? ` (${anime.year})` : ''
  const ratingValue = anime.averageRating || anime.rating
  const rating = ratingValue ? ` Rated ${Number(ratingValue).toFixed(1)}/10.` : ''
  const episodes = anime.episodes ? ` ${anime.episodes} episodes.` : ''
  const genres =
    anime.genres && anime.genres.length > 0
      ? ` Genres: ${anime.genres
          .slice(0, 3)
          .map((g: any) => g.name || g)
          .join(', ')}.`
      : ''

  const baseDescription = `Watch ${title}${year} on AnimeSenpai.${rating}${episodes}${genres}`

  const fullDescription =
    anime.description || anime.synopsis
      ? `${baseDescription} ${anime.description || anime.synopsis}`
      : baseDescription

  // Limit to 160 characters for optimal SEO
  return fullDescription.slice(0, 160).trim()
}

/**
 * Generate meta keywords from anime data
 */
export function generateAnimeKeywords(anime: Anime): string[] {
  const keywords = [
    anime.titleEnglish || anime.title,
    anime.title,
    anime.titleJapanese,
    'anime',
    'watch anime',
    'anime online',
    'anime streaming',
    ...(anime.genres?.map((g: any) => g.name || g) || []),
    anime.studio,
    anime.type,
    `anime ${anime.year}`,
    'anime tracker',
    'anime list',
    'myanimelist',
    'anilist',
  ].filter(Boolean) as string[]

  return keywords
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://animesenpai.app${item.url}`,
    })),
  }
}

/**
 * Generate search structured data for site search
 */
export function generateSearchStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AnimeSenpai',
    url: 'https://animesenpai.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://animesenpai.app/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generate organization structured data
 */
export function generateOrganizationData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AnimeSenpai',
    url: 'https://animesenpai.app',
    logo: 'https://animesenpai.app/assets/logo/AnimeSenpai_Inline.svg',
    description:
      'Track, discover, and explore your favorite anime. Get personalized recommendations and build your ultimate anime collection.',
    sameAs: [
      'https://www.tiktok.com/@animesenpai.app',
      // Add more social links as they become available
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@animesenpai.app',
      contactType: 'Customer Support',
    },
  }
}

/**
 * Clean text for SEO (remove special characters, trim)
 */
export function cleanForSEO(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Generate canonical URL
 */
export function generateCanonicalURL(path: string): string {
  const baseUrl = 'https://animesenpai.app'
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}
