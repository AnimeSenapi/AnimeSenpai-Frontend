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
    default: 'AnimeSenpai - Your Ultimate Anime Companion',
    template: '%s | AnimeSenpai'
  },
  description: siteDescription,
  keywords: [
    'anime',
    'anime tracker',
    'anime recommendations',
    'anime list',
    'watch anime',
    'anime database',
    'anime community',
    'manga',
    'japanese animation',
    'anime streaming',
    'my anime list',
    'anime discovery',
    'seasonal anime',
    'anime reviews'
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
    title: 'AnimeSenpai - Your Ultimate Anime Companion',
    description: siteDescription,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AnimeSenpai - Discover Your Next Favorite Anime',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnimeSenpai - Your Ultimate Anime Companion',
    description: siteDescription,
    images: ['/og-image.png'],
    creator: '@AnimeSenpai',
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
