import { MetadataRoute } from 'next'

const baseUrl = 'https://animesenpai.app'
import { TRPC_URL } from '../app/lib/api'

async function trpcQuery(path: string): Promise<any> {
  const url = `${TRPC_URL}/${path}`
  const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 3600 } })
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

  // Fetch dynamic anime slugs by paging getAll
  const animeEntries: MetadataRoute.Sitemap = []
  try {
    const pageSize = 100
    let page = 1
    let fetched = 0
    const max = 10000 // cap to avoid huge payloads; chunking can be added if needed
    while (fetched < max) {
      const input = encodeURIComponent(JSON.stringify({ page, limit: pageSize, sortBy: 'createdAt', sortOrder: 'desc' }))
      const data = await trpcQuery(`anime.getAll?input=${input}`)
      const items = data?.anime || data?.result?.data?.anime || []
      if (!Array.isArray(items) || items.length === 0) break
      for (const item of items) {
        if (!item?.slug) continue
        animeEntries.push({
          url: `${baseUrl}/anime/${item.slug}`,
          lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }
      fetched += items.length
      if (items.length < pageSize) break
      page += 1
    }
  } catch {
    // ignore sitemap dynamic errors; return static + any available
  }

  // Fetch public user profiles by sampling leaderboards (public-only signals)
  const userEntries: MetadataRoute.Sitemap = []
  try {
    const endpoints = [
      `leaderboards.getTopWatchers?input=${encodeURIComponent(JSON.stringify({ limit: 100 }))}`,
      `leaderboards.getTopReviewers?input=${encodeURIComponent(JSON.stringify({ limit: 100 }))}`,
      `leaderboards.getMostSocial?input=${encodeURIComponent(JSON.stringify({ limit: 100 }))}`,
    ]
    const results = await Promise.allSettled(endpoints.map((p) => trpcQuery(p)))
    const usernames = new Set<string>()
    for (const r of results) {
      if (r.status === 'fulfilled') {
        const lb = r.value?.leaderboard || r.value?.result?.data?.leaderboard || []
        for (const entry of lb) {
          const u = entry?.user?.username
          if (u && !usernames.has(u)) {
            usernames.add(u)
            userEntries.push({
              url: `${baseUrl}/user/${encodeURIComponent(u)}`,
              lastModified: now,
              changeFrequency: 'weekly',
              priority: 0.6,
            })
          }
        }
      }
    }
  } catch {
    // ignore
  }

  // If we exceed 50k, return the first 50k (index-based chunking can be added via route groups)
  const all = [...staticRoutes, ...animeEntries, ...userEntries]
  return all.slice(0, 50000)
}
