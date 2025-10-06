/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dropdown-menu', '@radix-ui/react-checkbox'],
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
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Standalone output for better performance
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig
