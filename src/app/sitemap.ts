import { MetadataRoute } from 'next'

// This generates a dynamic sitemap for AnimeSenpai
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://animesenpai.app'

  // Static routes with their priorities
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
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
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // In the future, you can dynamically fetch anime URLs from your API:
  // try {
  //   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/anime.getAll`)
  //   const data = await response.json()
  //   const animeRoutes = data.result.data.anime.map((anime: any) => ({
  //     url: `${baseUrl}/anime/${anime.slug}`,
  //     lastModified: new Date(anime.updatedAt || anime.createdAt),
  //     changeFrequency: 'weekly',
  //     priority: 0.8,
  //   }))
  //   return [...staticRoutes, ...animeRoutes]
  // } catch (error) {
  //   console.error('Failed to fetch anime for sitemap:', error)
  // }

  return staticRoutes
}

