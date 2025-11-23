import type { Metadata } from 'next'

const siteUrl = 'https://animesenpai.app'
const defaultBrandName = 'AnimeSenpai'
const defaultOg = `${siteUrl}/assets/logos/AS-logo-800x200-300-C.png`
const defaultDescription = 'Your gateway to the anime world. Discover, track, and explore anime and manga effortlessly. Get personalized recommendations, build your watchlist, and connect with a welcoming community of fans. Where every fan feels seen — guided by passion, powered by community.'

export function buildCanonical(path: string = '/'): string {
  if (!path || path === '/') return siteUrl
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}

export function baseAlternates(path: string = '/'): Metadata['alternates'] {
  return {
    canonical: buildCanonical(path),
    languages: {
      en: buildCanonical(path),
      'en-US': buildCanonical(path),
    },
  }
}

export function siteOpenGraph(
  siteName: string = defaultBrandName,
  overrides?: Partial<NonNullable<Metadata['openGraph']>>
): NonNullable<Metadata['openGraph']> {
  return {
    type: 'website',
    url: siteUrl,
    siteName,
    images: [{ url: defaultOg, width: 1200, height: 630, alt: siteName }],
    locale: 'en_US',
    ...overrides,
  }
}

export function siteTwitter(overrides?: Partial<NonNullable<Metadata['twitter']>>): NonNullable<Metadata['twitter']> {
  return {
    card: 'summary_large_image',
    site: '@AnimeSenpai',
    creator: '@AnimeSenpai',
    images: overrides?.images || [defaultOg],
    ...overrides,
  }
}

// JSON-LD builders
export function buildOrganizationJsonLd(
  siteName: string = defaultBrandName,
  siteDescription: string = defaultDescription
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    logo: defaultOg,
    description: siteDescription,
    sameAs: [
      'https://www.tiktok.com/@animesenpai.app',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
    },
  }
}

export function buildWebsiteJsonLd(
  siteName: string = defaultBrandName,
  siteDescription: string = defaultDescription
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; item: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((b, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: b.name,
      item: b.item,
    })),
  }
}

export function buildTvSeriesJsonLd(input: {
  title: string
  description?: string
  image?: string
  genre?: string[] | string
  datePublished?: string
  aggregateRating?: { ratingValue: number; ratingCount: number }
  url: string
}) {
  const images = input.image ? [input.image] : [defaultOg]
  return {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: input.title,
    description: input.description,
    url: input.url,
    image: images,
    genre: input.genre,
    datePublished: input.datePublished,
    aggregateRating: input.aggregateRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: input.aggregateRating.ratingValue,
          ratingCount: input.aggregateRating.ratingCount,
        }
      : undefined,
  }
}

export function buildPersonJsonLd(input: {
  username: string
  name?: string
  url: string
  image?: string
  description?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.name || input.username,
    url: input.url,
    image: input.image,
    description: input.description,
    identifier: input.username,
  }
}

export function buildProfilePageJsonLd(input: {
  username: string
  name?: string
  url: string
  image?: string
  description?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: buildPersonJsonLd(input),
  }
}

export function buildItemListJsonLd(input: {
  name: string
  url: string
  items: Array<{ name: string; url: string }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: input.name,
    url: input.url,
    itemListElement: input.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Thing',
        name: item.name,
        url: item.url,
      },
    })),
  }
}


