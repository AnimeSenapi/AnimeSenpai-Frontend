import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from '../components/navbar/navbar'
import { Providers } from './providers'
import { CookieConsent } from '../components/CookieConsent'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = 'https://animesenpai.app'
const siteName = 'AnimeSenpai'
const siteDescription = 'Discover, track, and explore your favorite anime. Get personalized recommendations, connect with fellow fans, and build your ultimate anime collection.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AnimeSenpai - Track, Discover & Watch Anime | Free Anime Tracker',
    template: '%s | AnimeSenpai'
  },
  description: siteDescription,
  keywords: [
    'anime',
    'anime tracker',
    'anime list',
    'anime recommendations',
    'watch anime',
    'anime database',
    'anime community',
    'track anime',
    'anime watchlist',
    'discover anime',
    'anime collection',
    'free anime tracker',
    'myanimelist alternative',
    'anilist alternative',
    'anime organizer',
    'manga',
    'japanese animation',
    'anime streaming guide',
    'seasonal anime',
    'anime reviews',
    'anime ratings',
    'best anime',
    'new anime',
    'popular anime',
    'AnimeSenpai',
    'anime senpai'
  ],
  authors: [{ name: 'AnimeSenpai Team' }],
  creator: 'AnimeSenpai',
  publisher: 'AnimeSenpai',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: siteName,
    title: 'AnimeSenpai - Track, Discover & Watch Anime | Free Anime Tracker',
    description: siteDescription,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AnimeSenpai - Your Ultimate Anime Tracking & Discovery Platform',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnimeSenpai - Track, Discover & Watch Anime',
    description: siteDescription,
    images: ['/og-image.png'],
    creator: '@AnimeSenpai',
    site: '@AnimeSenpai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    // Add these later when you have the codes
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'entertainment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          {children}
          <CookieConsent />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
