import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://animesenpai.app'
  
  // Static pages
  const staticPages = [
    '',
    '/search',
    '/dashboard',
    '/mylist',
    '/auth/signin',
    '/auth/signup',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Add dynamic pages here later if needed
  // For now, return static pages
  return staticPages
}
