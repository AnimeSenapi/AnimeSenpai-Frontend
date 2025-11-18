import type { Metadata } from 'next'
import { baseAlternates, siteOpenGraph, siteTwitter, buildItemListJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Browse Genres',
  description: 'Explore anime by genre on AnimeSenpai. Find top-rated and popular genres to discover your next show.',
  alternates: baseAlternates('/genres'),
  robots: { index: true, follow: true },
  openGraph: siteOpenGraph({
    title: 'Browse Genres',
    description: 'Explore anime by genre on AnimeSenpai. Find top-rated and popular genres to discover your next show.',
    url: 'https://animesenpai.app/genres',
  }),
  twitter: siteTwitter({
    title: 'Browse Genres',
    description: 'Explore anime by genre on AnimeSenpai. Find top-rated and popular genres to discover your next show.',
  }),
  other: {
    'script:ld+json:ItemList': JSON.stringify(
      buildItemListJsonLd({
        name: 'Genres',
        url: 'https://animesenpai.app/genres',
        items: [],
      })
    ),
  },
}


