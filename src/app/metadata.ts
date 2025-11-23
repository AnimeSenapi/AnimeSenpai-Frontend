import type { Metadata } from 'next'
import { baseAlternates, siteOpenGraph, siteTwitter } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Discover Anime',
  description:
    'Your gateway to the anime world. Discover, track, and explore anime and manga effortlessly. Get personalized recommendations, build your watchlist, and connect with a welcoming community of fans. Where every fan feels seen — guided by passion, powered by community.',
  alternates: baseAlternates('/'),
  robots: { index: true, follow: true },
  openGraph: siteOpenGraph(undefined, {
    title: 'Discover Anime',
    description:
      'Your gateway to the anime world. Discover, track, and explore anime and manga effortlessly. Get personalized recommendations, build your watchlist, and connect with a welcoming community of fans. Where every fan feels seen — guided by passion, powered by community.',
    url: 'https://animesenpai.app/',
  }),
  twitter: siteTwitter({
    title: 'Discover Anime',
    description:
      'Your gateway to the anime world. Discover, track, and explore anime and manga effortlessly. Get personalized recommendations, build your watchlist, and connect with a welcoming community of fans. Where every fan feels seen — guided by passion, powered by community.',
  }),
}


