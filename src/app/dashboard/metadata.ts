import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Your Anime Journey',
  description:
    'View your personalized anime dashboard with recommendations, trending shows, and your watch progress. Discover what to watch next based on your taste.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'My Anime Dashboard - AnimeSenpai',
    description:
      'Track your anime journey, get personalized recommendations, and discover new shows.',
    images: ['/og-dashboard.png'],
  },
}
