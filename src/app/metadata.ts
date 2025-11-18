import type { Metadata } from 'next'
import { baseAlternates, siteOpenGraph, siteTwitter } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Discover Anime',
  description:
    'Discover and track your favorite anime with personalized recommendations, lists, stats, and more on AnimeSenpai.',
  alternates: baseAlternates('/'),
  robots: { index: true, follow: true },
  openGraph: siteOpenGraph({
    title: 'Discover Anime',
    description:
      'Discover and track your favorite anime with personalized recommendations, lists, stats, and more on AnimeSenpai.',
    url: 'https://animesenpai.app/',
  }),
  twitter: siteTwitter({
    title: 'Discover Anime',
    description:
      'Discover and track your favorite anime with personalized recommendations, lists, stats, and more on AnimeSenpai.',
  }),
}


