import React from 'react'

interface StructuredDataProps {
  data: Record<string, any>
}

/**
 * StructuredData Component
 *
 * Renders JSON-LD structured data for SEO
 * Helps search engines understand your content better
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  )
}

// Helper functions to generate common structured data types

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AnimeSenpai',
    url: 'https://animesenpai.app',
    logo: 'https://animesenpai.app/logo.png',
    description:
      'Discover, track, and explore your favorite anime. Get personalized recommendations and connect with fellow fans.',
    sameAs: [
      // Add your social media URLs here
      // 'https://twitter.com/AnimeSenpai',
      // 'https://facebook.com/AnimeSenpai',
    ],
  }
}

export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AnimeSenpai',
    url: 'https://animesenpai.app',
    description: 'Your ultimate anime companion for discovering, tracking, and exploring anime.',
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

export function getAnimeSchema(anime: {
  title: string
  description?: string
  slug: string
  coverImage?: string
  rating?: number
  year?: number
  genres?: Array<{ name: string }>
  episodes?: number
  type?: string
  status?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: anime.title,
    description: anime.description || `Watch and track ${anime.title} on AnimeSenpai`,
    url: `https://animesenpai.app/anime/${anime.slug}`,
    image: anime.coverImage,
    ...(anime.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: anime.rating,
        bestRating: 10,
        worstRating: 0,
      },
    }),
    ...(anime.year && { datePublished: `${anime.year}-01-01` }),
    ...(anime.genres &&
      anime.genres.length > 0 && {
        genre: anime.genres.map((g) => g.name),
      }),
    ...(anime.episodes && { numberOfEpisodes: anime.episodes }),
    ...(anime.type && { genre: [anime.type] }),
    productionCompany: {
      '@type': 'Organization',
      name: 'AnimeSenpai',
    },
  }
}

export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function getWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AnimeSenpai',
    url: 'https://animesenpai.app',
    description:
      'Track your anime watching progress, get personalized recommendations, and connect with the anime community.',
    applicationCategory: 'EntertainmentApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1000',
      bestRating: '5',
      worstRating: '1',
    },
  }
}

export function getUserProfileSchema(user: {
  username: string
  name?: string
  bio?: string
  avatar?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: user.name || user.username,
      description: user.bio || `AnimeSenpai profile for ${user.username}`,
      ...(user.avatar && { image: user.avatar }),
      url: `https://animesenpai.app/user/${user.username}`,
    },
  }
}

export function getReviewSchema(review: {
  title: string
  content: string
  rating: number
  author: string
  animeTitle: string
  animeSlug: string
  dateCreated: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'TVSeries',
      name: review.animeTitle,
      url: `https://animesenpai.app/anime/${review.animeSlug}`,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 10,
      worstRating: 0,
    },
    author: {
      '@type': 'Person',
      name: review.author,
    },
    reviewBody: review.content,
    headline: review.title,
    datePublished: review.dateCreated,
  }
}

export function getVideoObjectSchema(video: {
  name: string
  description: string
  thumbnailUrl: string
  contentUrl: string
  uploadDate: string
  duration?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    contentUrl: video.contentUrl,
    uploadDate: video.uploadDate,
    ...(video.duration && { duration: video.duration }),
    publisher: {
      '@type': 'Organization',
      name: 'AnimeSenpai',
      logo: {
        '@type': 'ImageObject',
        url: 'https://animesenpai.app/logo.png',
      },
    },
  }
}

export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function getArticleSchema(article: {
  title: string
  description: string
  author: string
  datePublished: string
  image?: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AnimeSenpai',
      logo: {
        '@type': 'ImageObject',
        url: 'https://animesenpai.app/logo.png',
      },
    },
    datePublished: article.datePublished,
    ...(article.image && { image: article.image }),
    url: article.url,
  }
}

export function getSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AnimeSenpai',
    applicationCategory: 'EntertainmentApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1000',
    },
  }
}
