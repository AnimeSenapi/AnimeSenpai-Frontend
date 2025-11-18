import type { Metadata } from 'next'
import { baseAlternates, siteOpenGraph, siteTwitter, buildItemListJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Leaderboards',
  description: 'Explore AnimeSenpai leaderboards: top watchers, top reviewers, and most social users.',
  alternates: baseAlternates('/leaderboards'),
  robots: { index: true, follow: true },
  openGraph: siteOpenGraph({
    title: 'Leaderboards',
    description: 'Explore AnimeSenpai leaderboards: top watchers, top reviewers, and most social users.',
    url: 'https://animesenpai.app/leaderboards',
  }),
  twitter: siteTwitter({
    title: 'Leaderboards',
    description: 'Explore AnimeSenpai leaderboards: top watchers, top reviewers, and most social users.',
  }),
  other: {
    'script:ld+json:ItemList': JSON.stringify(
      buildItemListJsonLd({
        name: 'Leaderboards',
        url: 'https://animesenpai.app/leaderboards',
        items: [
          { name: 'Top Watchers', url: 'https://animesenpai.app/leaderboards#watchers' },
          { name: 'Top Reviewers', url: 'https://animesenpai.app/leaderboards#reviewers' },
          { name: 'Most Social', url: 'https://animesenpai.app/leaderboards#social' },
        ],
      })
    ),
  },
}


