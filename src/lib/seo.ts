import type { Metadata } from 'next'

const siteUrl = 'https://animesenpai.app'
const brandName = 'AnimeSenpai'
const defaultOg = `${siteUrl}/assets/logo/AnimeSenpai-logo.png`

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

export function siteOpenGraph(overrides?: Partial<NonNullable<Metadata['openGraph']>>): NonNullable<Metadata['openGraph']> {
  return {
    type: 'website',
    url: siteUrl,
    siteName: brandName,
    images: [{ url: defaultOg, width: 1200, height: 630, alt: brandName }],
    locale: 'en_US',
    ...overrides,
  }
}

export function siteTwitter(overrides?: Partial<NonNullable<Metadata['twitter']>>): NonNullable<Metadata['twitter']> {
  return {
    card: 'summary_large_image',
    images: [defaultOg],
    ...overrides,
  }
}

// JSON-LD builders
export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brandName,
    url: siteUrl,
    logo: defaultOg,
  }
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brandName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
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


