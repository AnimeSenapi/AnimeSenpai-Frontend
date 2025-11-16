/**
 * SEO Metadata Component
 *
 * Comprehensive SEO metadata for all pages
 * Includes Open Graph, Twitter Cards, and other meta tags
 */

import Head from 'next/head'

interface SEOMetadataProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile' | 'video'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  siteName?: string
  locale?: string
  alternateLocales?: string[]
  noindex?: boolean
  nofollow?: boolean
  canonical?: string
  ogType?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  twitterSite?: string
  twitterCreator?: string
  structuredData?: Record<string, any> | Record<string, any>[]
}

export function SEOMetadata({
  title = 'AnimeSenpai - Your Ultimate Anime Companion',
  description = 'Discover, track, and explore your favorite anime. Get personalized recommendations and connect with fellow anime fans.',
  keywords = [
    'anime',
    'manga',
    'tracking',
    'recommendations',
    'anime list',
    'myanimelist alternative',
  ],
  image = 'https://animesenpai.app/og-image.png',
  url = 'https://animesenpai.app',
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  siteName = 'AnimeSenpai',
  locale = 'en_US',
  alternateLocales = [],
  noindex = false,
  nofollow = false,
  canonical,
  ogType,
  twitterCard = 'summary_large_image',
  twitterSite = '@AnimeSenpai',
  twitterCreator,
  structuredData,
}: SEOMetadataProps) {
  const fullTitle = title.includes('AnimeSenpai') ? title : `${title} | AnimeSenpai`
  const canonicalUrl = canonical || url
  const ogTypeValue = ogType || type

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author || 'AnimeSenpai Team'} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta
        name="robots"
        content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`}
      />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={ogTypeValue} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {alternateLocales.map((locale) => (
        <meta key={locale} property="og:locale:alternate" content={locale} />
      ))}

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="AnimeSenpai" />
      <meta name="application-name" content="AnimeSenpai" />
      <meta name="msapplication-TileColor" content="#8B5CF6" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* Favicon and Icons */}
      <link rel="icon" href="/icon.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icon.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icon.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />

      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              Array.isArray(structuredData) ? structuredData : [structuredData]
            ),
          }}
        />
      )}
    </Head>
  )
}

/**
 * SEO Metadata for Anime Pages
 */
export function AnimeSEOMetadata({
  anime,
  url,
}: {
  anime: {
    title: string
    titleEnglish?: string
    description?: string
    coverImage?: string
    bannerImage?: string
    rating?: number
    year?: number
    genres?: Array<{ name: string }>
    slug: string
  }
  url?: string
}) {
  const title = anime.titleEnglish || anime.title
  const description =
    anime.description ||
    `Watch and track ${title} on AnimeSenpai. ${anime.year ? `Released in ${anime.year}.` : ''} ${anime.rating ? `Rated ${anime.rating}/10.` : ''}`
  const image = anime.bannerImage || anime.coverImage || 'https://animesenpai.app/og-image.png'
  const pageUrl = url || `https://animesenpai.app/anime/${anime.slug}`

  const keywords = [
    title,
    'anime',
    anime.year?.toString() || '',
    ...(anime.genres?.map((g) => g.name) || []),
  ].filter(Boolean)

  return (
    <SEOMetadata
      title={title}
      description={description}
      keywords={keywords}
      image={image}
      url={pageUrl}
      type="video"
      ogType="video.tv_show"
      twitterCard="summary_large_image"
      structuredData={{
        '@context': 'https://schema.org',
        '@type': 'TVSeries',
        name: title,
        description,
        url: pageUrl,
        image,
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
      }}
    />
  )
}

/**
 * SEO Metadata for User Profile Pages
 */
export function UserProfileSEOMetadata({
  user,
  url,
}: {
  user: {
    username: string
    name?: string
    bio?: string
    avatar?: string
  }
  url?: string
}) {
  const title = user.username
  const description = user.bio || `${user.username}'s anime list and profile on AnimeSenpai`
  const image = user.avatar || 'https://animesenpai.app/og-image.png'
  const pageUrl = url || `https://animesenpai.app/user/${user.username}`

  return (
    <SEOMetadata
      title={`${title}'s Profile`}
      description={description}
      keywords={[user.username, 'anime', 'profile', 'anime list']}
      image={image}
      url={pageUrl}
      type="profile"
      ogType="profile"
      twitterCard="summary"
      structuredData={{
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: user.username,
          ...(user.name && { alternateName: user.name }),
          description,
          ...(user.avatar && { image: user.avatar }),
          url: pageUrl,
        },
      }}
    />
  )
}

/**
 * SEO Metadata for Search Pages
 */
export function SearchSEOMetadata({ query, url }: { query?: string; url?: string }) {
  const title = query ? `Search: ${query}` : 'Search Anime'
  const description = query
    ? `Search results for "${query}" on AnimeSenpai`
    : 'Search and discover anime on AnimeSenpai'
  const pageUrl =
    url ||
    (query
      ? `https://animesenpai.app/search?q=${encodeURIComponent(query)}`
      : 'https://animesenpai.app/search')

  return (
    <SEOMetadata
      title={title}
      description={description}
      keywords={['anime search', 'find anime', query || ''].filter(Boolean)}
      url={pageUrl}
      type="website"
      noindex={!!query} // Don't index search result pages
    />
  )
}
