import { MetadataRoute } from 'next'

const baseUrl = 'https://animesenpai.app'
import { TRPC_URL } from '../app/lib/api'

// Timeout helper - ensures fetch calls don't hang
function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    )
  ])
}

async function trpcQuery(path: string, timeoutMs = 5000): Promise<any> {
  const url = `${TRPC_URL}/${path}`
  const fetchPromise = fetch(url, { 
    method: 'GET', 
    headers: { 'Content-Type': 'application/json' }, 
    next: { revalidate: 3600 }
  })
  
  const res = await timeout(fetchPromise, timeoutMs)
  if (!res.ok) throw new Error(`Failed tRPC: ${path}`)
  return timeout(res.json(), timeoutMs)
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

  // Try to fetch dynamic data with very aggressive timeouts
  // If API is slow/unavailable, return static routes only (still valid sitemap)
  const [animeEntries, userEntries] = await Promise.allSettled([
    // Anime entries - 3 second timeout max
    (async () => {
      try {
        const input = encodeURIComponent(JSON.stringify({ page: 1, limit: 25, sortBy: 'createdAt', sortOrder: 'desc' }))
        const data = await Promise.race([
          trpcQuery(`anime.getAll?input=${input}`, 3000),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]) as any
        
        const items = data?.anime || data?.result?.data?.anime || []
        const entries: MetadataRoute.Sitemap = []
        if (Array.isArray(items)) {
          for (const item of items.slice(0, 25)) {
            if (!item?.slug) continue
            entries.push({
              url: `${baseUrl}/anime/${item.slug}`,
              lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
              changeFrequency: 'weekly',
              priority: 0.8,
            })
          }
        }
        return entries
      } catch {
        return []
      }
    })(),
    // User entries - 2 second timeout max
    (async () => {
      try {
        const endpoint = `leaderboards.getTopWatchers?input=${encodeURIComponent(JSON.stringify({ limit: 10 }))}`
        const data = await Promise.race([
          trpcQuery(endpoint, 2000),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]) as any
        
        const lb = data?.leaderboard || data?.result?.data?.leaderboard || []
        const entries: MetadataRoute.Sitemap = []
        if (Array.isArray(lb)) {
          for (const entry of lb.slice(0, 10)) {
            const u = entry?.user?.username
            if (u) {
              entries.push({
                url: `${baseUrl}/user/${encodeURIComponent(u)}`,
                lastModified: now,
                changeFrequency: 'weekly',
                priority: 0.6,
              })
            }
          }
        }
        return entries
      } catch {
        return []
      }
    })()
  ])

  const anime = animeEntries.status === 'fulfilled' ? animeEntries.value : []
  const users = userEntries.status === 'fulfilled' ? userEntries.value : []

  return [...staticRoutes, ...anime, ...users]
}
