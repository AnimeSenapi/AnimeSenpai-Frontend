import type { Metadata, Viewport } from 'next'
import { Navbar } from '../components/navbar/navbar'
import { Providers } from './providers'
import { CookieConsent } from '../components/CookieConsent'
import { SkipNav } from '../components/SkipNav'
import { LayoutErrorBoundary } from '../components/LayoutErrorBoundary'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { InstallPrompt, IOSInstallInstructions } from '../components/pwa/InstallPrompt'
import { WebVitalsProvider } from '../components/WebVitalsProvider'
import { AnalyticsProvider } from '../components/AnalyticsProvider'
import './globals.css'

// Use system fonts for faster builds and better compatibility
const fontFamily = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const siteUrl = 'https://animesenpai.app'
const siteName = 'AnimeSenpai'
const siteDescription =
  'Discover, track, and explore your favorite anime. Get personalized recommendations, connect with fellow fans, and build your ultimate anime collection.'

// Viewport configuration (Next.js 15+)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover', // Enable safe area for iPhone notch/dynamic island
  interactiveWidget: 'resizes-content', // iOS 15+ keyboard behavior
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AnimeSenpai - Track, Discover & Watch Anime | Free Anime Tracker',
    template: '%s | AnimeSenpai',
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
    'anime senpai',
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
      },
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
  // Icons are automatically handled by Next.js 15 from app/icon.{png,svg}
  // No need to specify them here
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AnimeSenpai',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'entertainment',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Structured data for organization
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AnimeSenpai',
    url: siteUrl,
    logo: `${siteUrl}/assets/logo/AnimeSenpai_Inline.svg`,
    description: siteDescription,
    sameAs: ['https://www.tiktok.com/@animesenpai.app'],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@animesenpai.app',
      contactType: 'Customer Support',
    },
  }

  // Structured data for website search
  const searchData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AnimeSenpai',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="AnimeSenpai" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AnimeSenpai" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#6366f1" />
        
        {/* iOS Splash Screens */}
        <link rel="apple-touch-startup-image" href="/splash/iphone-se.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/iphone-plus.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/iphone-x.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/iphone-xr.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/iphone-12.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/ipad.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
        />
        {/* Structured Data - Website Search */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(searchData) }}
        />
      </head>
      <body style={fontFamily}>
        <LayoutErrorBoundary>
          <Providers>
            <WebVitalsProvider>
              <AnalyticsProvider>
                {/* Skip Navigation Links for Screen Readers */}
                <SkipNav />

            {/* Alpha Badge - Simple & Clean */}
            <div
              className="fixed top-3 left-3 sm:top-4 sm:left-4 z-[999] pointer-events-none animate-in fade-in duration-700"
              aria-hidden="true"
            >
              <div className="relative">
                {/* Subtle glow */}
                <div className="absolute -inset-0.5 bg-violet-500/20 rounded-lg blur-sm"></div>

                {/* Badge container */}
                <div className="relative flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5 shadow-lg">
                  {/* Pulse dot */}
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute h-2 w-2 rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative block h-1.5 w-1.5 rounded-full bg-violet-400"></span>
                  </div>

                  {/* Text */}
                  <span className="text-[11px] sm:text-xs font-bold text-violet-300 uppercase tracking-wide">
                    Alpha
                  </span>
                </div>
              </div>
            </div>

            <Navbar />
            <main id="main-content" role="main">
              {children}
            </main>
            <CookieConsent />
            
            {/* PWA Install Prompts */}
            <InstallPrompt />
            <IOSInstallInstructions />
          </AnalyticsProvider>
        </WebVitalsProvider>
      </Providers>
      <Analytics />
      <SpeedInsights />
        </LayoutErrorBoundary>
      </body>
    </html>
  )
}
