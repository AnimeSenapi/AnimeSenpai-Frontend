# SEO Guide for AnimeSenpai

## Overview

This guide covers all SEO (Search Engine Optimization) implementations in AnimeSenpai. Our SEO strategy is designed to maximize visibility on search engines like Google, Bing, and other platforms, helping users discover anime content easily.

## Table of Contents

1. [Core SEO Features](#core-seo-features)
2. [Dynamic Sitemap](#dynamic-sitemap)
3. [Robots.txt Configuration](#robotstxt-configuration)
4. [Structured Data (Schema.org)](#structured-data-schemaorg)
5. [Meta Tags & Open Graph](#meta-tags--open-graph)
6. [SEO Utilities](#seo-utilities)
7. [Implementation Examples](#implementation-examples)
8. [Best Practices](#best-practices)
9. [Testing & Validation](#testing--validation)
10. [Performance Metrics](#performance-metrics)

---

## Core SEO Features

AnimeSenpai implements comprehensive SEO features:

### ✅ Implemented Features

- **Dynamic Sitemap Generation**: Automatically includes all anime pages
- **Robots.txt**: Optimized crawler access control
- **Structured Data (JSON-LD)**: Schema.org markup for anime, organization, and website
- **Dynamic Meta Tags**: Page-specific titles, descriptions, and keywords
- **Open Graph Tags**: Optimized for social media sharing
- **Twitter Cards**: Rich previews for Twitter/X
- **Canonical URLs**: Prevents duplicate content issues
- **Mobile Optimization**: Responsive viewport configuration
- **Performance Optimization**: Fast page loads (Core Web Vitals)

### 📊 SEO Targets

- **Google Search**: Primary focus
- **Bing**: Secondary focus
- **Social Media**: Twitter/X, TikTok, Discord
- **Anime Databases**: MAL, AniList integration potential

---

## Dynamic Sitemap

**Location**: `src/app/sitemap.ts`

### How It Works

The sitemap is automatically generated at build time and includes:

1. **Static Pages**: Homepage, Dashboard, Search, MyList, Auth pages, Legal pages
2. **Dynamic Anime Pages**: Fetches up to 1,000 anime entries
3. **Priority System**: 
   - Homepage: 1.0 (highest)
   - Dashboard/Search: 0.9
   - High-rated anime (>8): 0.9
   - Standard anime: 0.7
   - Auth/Legal pages: 0.3-0.7

### Update Frequency

```typescript
changeFrequency: 'daily'    // For homepage, dashboard, search
changeFrequency: 'weekly'   // For anime pages
changeFrequency: 'monthly'  // For auth pages
changeFrequency: 'yearly'   // For legal pages
```

### Accessing the Sitemap

```
https://animesenpai.app/sitemap.xml
```

### Example Output

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://animesenpai.app</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://animesenpai.app/anime/attack-on-titan</loc>
    <lastmod>2025-01-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
```

---

## Robots.txt Configuration

**Location**: `src/app/robots.ts`

### Access Control

```typescript
// Allowed paths for all crawlers
allow: '/'

// Disallowed paths (private/sensitive)
disallow: [
  '/api/',           // API endpoints
  '/admin/',         // Admin dashboard
  '/user/settings',  // User settings
  '/auth/*',         // Authentication pages
  '/_next/',         // Next.js internals
]
```

### Crawler-Specific Rules

- **Googlebot**: No crawl delay, full access to public pages
- **Bingbot**: Same as Googlebot
- **Other bots**: Standard rules apply

### Accessing Robots.txt

```
https://animesenpai.app/robots.txt
```

### Example Output

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /user/settings
Disallow: /auth/
Disallow: /_next/

User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /user/settings
Disallow: /auth/
Disallow: /_next/
Crawl-delay: 0

Sitemap: https://animesenpai.app/sitemap.xml
```

---

## Structured Data (Schema.org)

AnimeSenpai uses JSON-LD structured data to help search engines understand content.

### Organization Schema

**Location**: `src/app/layout.tsx`

Describes AnimeSenpai as an organization.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AnimeSenpai",
  "url": "https://animesenpai.app",
  "logo": "https://animesenpai.app/assets/logo/AnimeSenpai_Inline.svg",
  "description": "Track, discover, and explore your favorite anime.",
  "sameAs": [
    "https://www.tiktok.com/@animesenpai.app"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "contact@animesenpai.app",
    "contactType": "Customer Support"
  }
}
```

### Website Search Schema

**Location**: `src/app/layout.tsx`

Enables Google's site search box.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AnimeSenpai",
  "url": "https://animesenpai.app",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://animesenpai.app/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### TV Series Schema (Anime)

**Location**: `src/lib/seo-utils.ts` → `generateAnimeStructuredData()`

Describes each anime as a TV series.

```json
{
  "@context": "https://schema.org",
  "@type": "TVSeries",
  "name": "Attack on Titan",
  "alternateName": ["Shingeki no Kyojin", "進撃の巨人"],
  "description": "Humans live in cities surrounded by...",
  "image": "https://cdn.myanimelist.net/images/anime/...",
  "genre": ["Action", "Drama", "Fantasy"],
  "datePublished": "2013-04-07",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 9.0,
    "bestRating": 10,
    "worstRating": 0,
    "ratingCount": 2500000
  },
  "numberOfEpisodes": 25,
  "numberOfSeasons": 4,
  "productionCompany": {
    "@type": "Organization",
    "name": "Wit Studio"
  },
  "url": "https://animesenpai.app/anime/attack-on-titan"
}
```

---

## Meta Tags & Open Graph

### Root Layout Metadata

**Location**: `src/app/layout.tsx`

Defines default metadata for the entire site:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://animesenpai.app'),
  title: {
    default: 'AnimeSenpai - Track, Discover & Watch Anime',
    template: '%s | AnimeSenpai'
  },
  description: 'Discover, track, and explore your favorite anime...',
  keywords: ['anime', 'anime tracker', 'anime list', ...],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://animesenpai.app',
    siteName: 'AnimeSenpai',
    title: 'AnimeSenpai - Track, Discover & Watch Anime',
    description: '...',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnimeSenpai - Track, Discover & Watch Anime',
    description: '...',
    images: ['/og-image.png'],
    creator: '@AnimeSenpai'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}
```

### Dynamic Anime Page Metadata

**Location**: `src/app/anime/[slug]/page.tsx` + `src/components/SEOHead.tsx`

Each anime page dynamically generates:

1. **Page Title**: `"Attack on Titan | AnimeSenpai"`
2. **Meta Description**: Auto-generated from anime data (max 160 chars)
3. **Keywords**: Anime title, genres, studio, year, etc.
4. **Canonical URL**: Prevents duplicate content
5. **Open Graph Image**: Uses anime banner/cover
6. **Structured Data**: TVSeries schema (see above)

### Example Anime Meta Tags

```html
<head>
  <title>Attack on Titan | AnimeSenpai</title>
  <meta name="description" content="Watch Attack on Titan (2013) on AnimeSenpai. Rated 9.0/10. 25 episodes. Genres: Action, Drama, Fantasy." />
  <meta name="keywords" content="Attack on Titan, Shingeki no Kyojin, anime, watch anime, action anime, drama anime, fantasy anime, Wit Studio, anime 2013" />
  <link rel="canonical" href="https://animesenpai.app/anime/attack-on-titan" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="video.tv_show" />
  <meta property="og:title" content="Attack on Titan | AnimeSenpai" />
  <meta property="og:description" content="Watch Attack on Titan (2013)..." />
  <meta property="og:image" content="https://cdn.myanimelist.net/..." />
  <meta property="og:url" content="https://animesenpai.app/anime/attack-on-titan" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Attack on Titan | AnimeSenpai" />
  <meta name="twitter:description" content="Watch Attack on Titan..." />
  <meta name="twitter:image" content="https://cdn.myanimelist.net/..." />
  
  <!-- Structured Data -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "TVSeries",
      "name": "Attack on Titan",
      ...
    }
  </script>
</head>
```

---

## SEO Utilities

**Location**: `src/lib/seo-utils.ts`

A comprehensive set of utility functions for SEO:

### Available Functions

#### 1. `generateAnimeStructuredData(anime: Anime)`

Generates Schema.org JSON-LD for a TV series.

```typescript
const structuredData = generateAnimeStructuredData(anime)
// Returns: { "@context": "https://schema.org", "@type": "TVSeries", ... }
```

#### 2. `generateAnimeOGData(anime: Anime)`

Generates Open Graph metadata.

```typescript
const ogData = generateAnimeOGData(anime)
// Returns: { title, description, type, url, images, siteName }
```

#### 3. `generateAnimeTwitterData(anime: Anime)`

Generates Twitter Card metadata.

```typescript
const twitterData = generateAnimeTwitterData(anime)
// Returns: { card, title, description, images, creator, site }
```

#### 4. `generateAnimeMetaDescription(anime: Anime): string`

Generates optimized meta description (max 160 chars).

```typescript
const description = generateAnimeMetaDescription(anime)
// "Watch Attack on Titan (2013) on AnimeSenpai. Rated 9.0/10. 25 episodes. Genres: Action, Drama, Fantasy."
```

#### 5. `generateAnimeKeywords(anime: Anime): string[]`

Generates SEO keywords array.

```typescript
const keywords = generateAnimeKeywords(anime)
// ["Attack on Titan", "Shingeki no Kyojin", "anime", "watch anime", "action", ...]
```

#### 6. `generateBreadcrumbData(items: Array<{ name: string; url: string }>)`

Generates breadcrumb structured data.

```typescript
const breadcrumbs = generateBreadcrumbData([
  { name: 'Home', url: '/' },
  { name: 'Search', url: '/search' },
  { name: 'Attack on Titan', url: '/anime/attack-on-titan' }
])
```

#### 7. `generateCanonicalURL(path: string): string`

Generates canonical URL.

```typescript
const canonical = generateCanonicalURL('/anime/attack-on-titan')
// "https://animesenpai.app/anime/attack-on-titan"
```

#### 8. `cleanForSEO(text: string): string`

Cleans text for SEO (removes HTML, normalizes whitespace).

```typescript
const clean = cleanForSEO('<p>Watch now!</p>')
// "Watch now!"
```

---

## Implementation Examples

### Adding SEO to a New Page

#### Example 1: Client Component (like Anime Detail Page)

```typescript
'use client'

import { SEOHead } from '@/components/SEOHead'
import { generateAnimeStructuredData, generateAnimeMetaDescription } from '@/lib/seo-utils'

export default function AnimePage() {
  const anime = ... // fetch anime data

  return (
    <div>
      <SEOHead
        title={`${anime.titleEnglish || anime.title} | AnimeSenpai`}
        description={generateAnimeMetaDescription(anime)}
        keywords={generateAnimeKeywords(anime)}
        canonical={generateCanonicalURL(`/anime/${anime.slug}`)}
        ogImage={anime.bannerImage}
        ogType="video.tv_show"
        structuredData={generateAnimeStructuredData(anime)}
      />
      
      {/* Rest of your component */}
    </div>
  )
}
```

#### Example 2: Server Component (Recommended for Static Pages)

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Anime',
  description: 'Search and discover thousands of anime titles.',
  openGraph: {
    title: 'Search Anime | AnimeSenpai',
    description: 'Search and discover thousands of anime titles.',
    images: ['/og-search.png']
  }
}

export default function SearchPage() {
  return <div>...</div>
}
```

### Adding Structured Data

```typescript
// In your component
useEffect(() => {
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.text = JSON.stringify(generateAnimeStructuredData(anime))
  document.head.appendChild(script)

  return () => {
    document.head.removeChild(script)
  }
}, [anime])
```

Or use the `SEOHead` component (preferred):

```typescript
<SEOHead structuredData={generateAnimeStructuredData(anime)} />
```

---

## Best Practices

### 1. Title Tags

✅ **DO:**
- Keep under 60 characters
- Include brand name: `"Page Title | AnimeSenpai"`
- Use primary keyword
- Make it descriptive and compelling

❌ **DON'T:**
- Keyword stuff
- Use ALL CAPS
- Duplicate titles across pages
- Exceed 60 characters

### 2. Meta Descriptions

✅ **DO:**
- Keep under 160 characters
- Include call-to-action
- Use primary and secondary keywords naturally
- Make it compelling to increase CTR

❌ **DON'T:**
- Copy title verbatim
- Keyword stuff
- Use generic descriptions
- Exceed 160 characters

### 3. Keywords

✅ **DO:**
- Use 5-10 relevant keywords
- Include variations (e.g., "anime", "watch anime", "anime online")
- Include anime-specific terms (title, genres, studio)

❌ **DON'T:**
- Keyword stuff
- Use irrelevant keywords
- Repeat same keyword multiple times

### 4. Images

✅ **DO:**
- Use descriptive alt text
- Optimize file size (WebP, AVIF)
- Use appropriate dimensions (OG: 1200x630)
- Lazy load non-critical images

❌ **DON'T:**
- Leave alt text empty
- Use huge unoptimized images
- Use generic alt like "image1.jpg"

### 5. URLs

✅ **DO:**
- Use descriptive slugs: `/anime/attack-on-titan`
- Use lowercase and hyphens
- Keep it short and readable
- Use canonical URLs

❌ **DON'T:**
- Use parameters for main content: `/anime?id=123`
- Use underscores or special characters
- Create overly long URLs
- Duplicate content on multiple URLs

### 6. Mobile Optimization

✅ **DO:**
- Test on real devices
- Ensure fast load times (<3s)
- Use responsive design
- Pass Core Web Vitals

❌ **DON'T:**
- Use separate mobile URLs (m.example.com)
- Serve different content on mobile
- Ignore mobile performance

---

## Testing & Validation

### Tools to Use

1. **Google Search Console**
   - Submit sitemap: `https://animesenpai.app/sitemap.xml`
   - Monitor indexing status
   - Check for crawl errors
   - View search performance

2. **Google Rich Results Test**
   - URL: https://search.google.com/test/rich-results
   - Test structured data validity
   - Preview how content appears in search

3. **Lighthouse (Chrome DevTools)**
   - Run SEO audit
   - Check performance, accessibility, best practices
   - Aim for 90+ SEO score

4. **Schema Markup Validator**
   - URL: https://validator.schema.org/
   - Validate JSON-LD structured data

5. **Open Graph Debugger**
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter/X: https://cards-dev.twitter.com/validator

### Manual Testing Checklist

- [ ] Sitemap loads and includes all pages
- [ ] Robots.txt is accessible and correct
- [ ] Meta titles are unique and under 60 chars
- [ ] Meta descriptions are unique and under 160 chars
- [ ] Canonical URLs are set correctly
- [ ] Open Graph tags are present
- [ ] Twitter Card tags are present
- [ ] Structured data validates (no errors)
- [ ] Images have alt text
- [ ] Pages load fast (<3s)
- [ ] Mobile-friendly (responsive)
- [ ] No broken links

---

## Performance Metrics

### Target Metrics

#### Core Web Vitals

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

#### Lighthouse Scores

- **Performance**: 90+
- **Accessibility**: 90+
- **Best Practices**: 90+
- **SEO**: 95+

#### Search Console Metrics

- **Indexed Pages**: 95%+ of submitted pages
- **Average Position**: Top 10 for primary keywords
- **CTR (Click-Through Rate)**: 5%+ average
- **Core Web Vitals**: 90%+ "Good" URLs

### Monitoring

1. **Weekly**: Check Google Search Console for errors
2. **Monthly**: Review search rankings for target keywords
3. **Quarterly**: Full SEO audit with Lighthouse
4. **Yearly**: Comprehensive SEO strategy review

---

## Common Issues & Solutions

### Issue 1: Pages Not Indexed

**Symptoms**: Pages don't appear in Google search

**Solutions**:
1. Check if page is in sitemap
2. Verify robots.txt allows crawling
3. Submit URL to Google Search Console
4. Ensure page returns 200 status
5. Check for `noindex` meta tag

### Issue 2: Duplicate Content

**Symptoms**: Multiple URLs for same content

**Solutions**:
1. Add canonical URL: `<link rel="canonical" href="..." />`
2. Use 301 redirects for old URLs
3. Ensure consistent URL structure

### Issue 3: Poor Mobile Performance

**Symptoms**: Low Core Web Vitals scores on mobile

**Solutions**:
1. Optimize images (WebP, lazy loading)
2. Reduce JavaScript bundle size (code splitting)
3. Use CDN for static assets
4. Enable compression (Gzip/Brotli)

### Issue 4: Structured Data Errors

**Symptoms**: Rich Results Test shows errors

**Solutions**:
1. Validate JSON-LD syntax
2. Ensure all required fields are present
3. Use correct Schema.org types
4. Test with Schema Markup Validator

---

## Future Enhancements

### Planned Features

- [ ] Multi-language support (hreflang tags)
- [ ] Video structured data for trailers
- [ ] FAQ schema for anime details
- [ ] Review schema for user ratings
- [ ] Breadcrumb navigation with structured data
- [ ] AMP (Accelerated Mobile Pages) support
- [ ] PWA (Progressive Web App) features

### Target Keywords Strategy

Primary keywords to target:

1. **Brand**: "AnimeSenpai", "anime senpai"
2. **Generic**: "anime tracker", "anime list", "watch anime"
3. **Competitor**: "myanimelist alternative", "anilist alternative"
4. **Long-tail**: "track anime progress", "best anime to watch", "anime recommendations"

---

## Resources

### Documentation

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Docs](https://developer.twitter.com/en/docs/twitter-for-websites/cards)
- [Next.js SEO](https://nextjs.org/learn/seo/introduction-to-seo)

### Tools

- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics](https://analytics.google.com/)
- [Ahrefs](https://ahrefs.com/) (Keyword research)
- [SEMrush](https://www.semrush.com/) (SEO audit)
- [Screaming Frog](https://www.screamingfrogSEO.com/) (Site crawler)

---

## Support

For SEO-related questions or issues:

- **Email**: contact@animesenpai.app
- **Documentation**: This guide
- **Issue Tracker**: GitHub (if applicable)

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintained By**: AnimeSenpai Team

