import { Providers } from './providers'
import { UnifiedNavigation } from '../components/navbar/UnifiedNavigation'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import Script from 'next/script'
import { buildOrganizationJsonLd, buildWebsiteJsonLd } from '@/lib/seo'

const siteUrl = 'https://animesenpai.app'
const defaultTitle = 'AnimeSenpai'
const defaultDescription =
  'Discover, track, and explore your favorite anime. Personalized recommendations, lists, stats, and a friendly anime community.'
const ogImage = `${siteUrl}/assets/logo/AnimeSenpai-logo.png`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'AnimeSenpai',
  title: {
    default: defaultTitle,
    template: '%s | AnimeSenpai',
  },
  description: defaultDescription,
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'en-US': '/',
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'AnimeSenpai',
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'AnimeSenpai',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: [ogImage],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Optional CSP nonce (currently disabled or provided via middleware elsewhere)
  const nonce = undefined

  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="canonical" href={siteUrl} />
      </head>
      <body>
        <Providers>
          {/* Skip link for keyboard users */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:px-3 focus:py-2 focus:bg-white/90 focus:text-black focus:shadow-lg"
          >
            Skip to main content
          </a>
          <header>
            <UnifiedNavigation />
          </header>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </Providers>
        <Script
          id="ld-org"
          type="application/ld+json"
          strategy="afterInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd()) }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="afterInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebsiteJsonLd()) }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
