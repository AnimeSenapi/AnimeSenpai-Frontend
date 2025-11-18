import { MetadataRoute } from 'next'

const baseUrl = 'https://animesenpai.app'
import { TRPC_URL } from '../app/lib/api'

async function trpcQuery(path: string): Promise<any> {
  const url = `${TRPC_URL}/${path}`
  const res = await fetch(url, { 
    method: 'GET', 
    headers: { 'Content-Type': 'application/json' }, 
    next: { revalidate: 3600 }
  })
  if (!res.ok) throw new Error(`Failed tRPC: ${path}`)
  return res.json()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/search`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/genres`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/help`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/calendar`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
  ]

  // Fetch dynamic anime slugs - limited to prevent build timeouts on Vercel (60s limit)
  const animeEntries: MetadataRoute.Sitemap = []
  try {
    // Only fetch first 100 most recent anime to keep sitemap generation fast
    const input = encodeURIComponent(JSON.stringify({ page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }))
    const data = await trpcQuery(`anime.getAll?input=${input}`)
    const items = data?.anime || data?.result?.data?.anime || []
    
    if (Array.isArray(items)) {
      for (const item of items) {
        if (!item?.slug) continue
        animeEntries.push({
          url: `${baseUrl}/anime/${item.slug}`,
          lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }
    }
  } catch {
    // ignore sitemap dynamic errors; return static + any available
  }

  // Fetch public user profiles - limited to prevent build timeouts
  const userEntries: MetadataRoute.Sitemap = []
  try {
    // Only fetch top 20 users to keep it fast
    const endpoint = `leaderboards.getTopWatchers?input=${encodeURIComponent(JSON.stringify({ limit: 20 }))}`
    const data = await trpcQuery(endpoint)
    const lb = data?.leaderboard || data?.result?.data?.leaderboard || []
    
    if (Array.isArray(lb)) {
      for (const entry of lb) {
        const u = entry?.user?.username
        if (u) {
          userEntries.push({
            url: `${baseUrl}/user/${encodeURIComponent(u)}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.6,
          })
        }
      }
    }
  } catch {
    // ignore - sitemap will work with just static routes if this fails
  }

  // If we exceed 50k, return the first 50k (index-based chunking can be added via route groups)
  const all = [...staticRoutes, ...animeEntries, ...userEntries]
  return all.slice(0, 50000)
}
