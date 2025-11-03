/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily ignore ESLint errors during build (TypeScript errors still checked)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dropdown-menu', '@radix-ui/react-checkbox'],
    // Optimize CSS
    optimizeCss: true,
  },
  // Reduce bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      skipDefaultConversion: true,
    },
  },
  images: {
    // Add your image CDN domains here
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '**.animesenpai.app', // For future CDN
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com', // Popular image CDN
      },
      {
        protocol: 'https',
        hostname: '**.imagekit.io', // Alternative CDN
      },
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net', // MyAnimeList CDN for anime images
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com', // GitHub avatars
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com', // YouTube thumbnails
      },
    ],
    // Use modern image formats for better compression
    formats: ['image/avif', 'image/webp'],
    // Responsive image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 1 year
    minimumCacheTTL: 31536000,
    // Disable SVG for security
    dangerouslyAllowSVG: false,
    // Enable unoptimized for development speed
    unoptimized: process.env.NODE_ENV === 'development',
  },
  compiler: {
    // Remove console statements in production (except console.error for Sentry)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'], // Keep console.error for Sentry integration
    } : false,
  },
  
  // Performance optimizations
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  
  // Standalone output for better performance
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  outputFileTracingRoot: __dirname,
  
  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
      // Cache static assets
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache API responses (short TTL)
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ]
  },
  
  // Redirects for performance
  async redirects() {
    return []
  },
  
  // Rewrites for API optimization
  async rewrites() {
    return []
  },
}

module.exports = nextConfig


// Temporarily disabled Sentry to fix OpenTelemetry issues
// const { withSentryConfig } = require("@sentry/nextjs");

// module.exports = withSentryConfig(
//   module.exports,
//   {
//     org: "animesenpai",
//     project: "animesenpai",
//     silent: !process.env.CI,
//     widenClientFileUpload: true,
//     tunnelRoute: "/monitoring",
//     disableLogger: true,
//     automaticVercelMonitors: true,
//   }
// );
