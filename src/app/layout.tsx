import { Providers } from './providers'
import { UnifiedNavigation } from '../components/navbar/UnifiedNavigation'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import Script from 'next/script'
import { buildOrganizationJsonLd, buildWebsiteJsonLd } from '@/lib/seo'
import { apiGetPublicSettings } from './lib/api'

// Force dynamic rendering to prevent build timeouts
export const dynamic = 'force-dynamic'

const siteUrl = 'https://animesenpai.app'
const defaultTitle = 'AnimeSenpai'
const defaultDescription =
  'Your gateway to the anime world. Discover, track, and explore anime and manga effortlessly. Get personalized recommendations, build your watchlist, and connect with a welcoming community of fans. Where every fan feels seen — guided by passion, powered by community.'
const ogImage = `${siteUrl}/assets/logos/AS-logo-800x200-300-C.png`

async function getSiteSettings() {
  try {
    // Add timeout to prevent build hangs
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 5000)
    )
    const settingsPromise = apiGetPublicSettings()
    const settings = await Promise.race([settingsPromise, timeoutPromise]) as Awaited<ReturnType<typeof apiGetPublicSettings>>
    return {
      siteName: settings.siteName || defaultTitle,
      siteDescription: settings.siteDescription || defaultDescription,
    }
  } catch (error) {
    // Fallback to defaults if fetch fails or times out
    return {
      siteName: defaultTitle,
      siteDescription: defaultDescription,
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { siteName, siteDescription } = await getSiteSettings()

  return {
    metadataBase: new URL(siteUrl),
    applicationName: siteName,
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
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
      siteName,
      title: siteName,
      description: siteDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${siteName} - Your Ultimate Anime Companion`,
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@AnimeSenpai',
      creator: '@AnimeSenpai',
      title: siteName,
      description: siteDescription,
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
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Optional CSP nonce (currently disabled or provided via middleware elsewhere)
  const nonce = undefined
  
  // Get site settings for structured data
  const { siteName, siteDescription } = await getSiteSettings()

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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd(siteName, siteDescription)) }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="afterInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebsiteJsonLd(siteName, siteDescription)) }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
