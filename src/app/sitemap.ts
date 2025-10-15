import { MetadataRoute } from 'next'

/**
 * Dynamic Sitemap Generator
 * Automatically generates sitemap for all pages
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://animesenpai.app'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mylist`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Fetch anime pages dynamically
  let animePages: MetadataRoute.Sitemap = []
  
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/trpc'
    
    // Fetch all anime (limit to prevent timeout)
    const response = await fetch(
      `${API_URL}/anime.getAll?input=${encodeURIComponent(JSON.stringify({ limit: 1000, page: 1 }))}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Add timeout
        signal: AbortSignal.timeout(5000),
      }
    )

    if (response.ok) {
      const data = await response.json()
      const animeList = data.result?.data?.anime || []

      animePages = animeList.map((anime: any) => ({
        url: `${baseUrl}/anime/${anime.slug}`,
        lastModified: anime.updatedAt ? new Date(anime.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: anime.averageRating > 8 ? 0.9 : 0.7,
      }))
    }
  } catch (error) {
    console.error('Failed to fetch anime for sitemap:', error)
    // Return static pages only if anime fetch fails
  }

  return [...staticPages, ...animePages]
}
