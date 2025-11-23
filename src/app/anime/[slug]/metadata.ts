import type { Metadata } from 'next'
import { baseAlternates, siteOpenGraph, siteTwitter, buildCanonical, buildBreadcrumbJsonLd, buildTvSeriesJsonLd } from '@/lib/seo'

import { TRPC_URL } from '../../lib/api'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const input = encodeURIComponent(JSON.stringify({ slug }))
    const res = await fetch(`${TRPC_URL}/anime.getBySlug?input=${input}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 },
    })
    if (!res.ok) {
      return { title: 'Anime Not Found', description: 'This anime could not be found.', robots: { index: false, follow: false } }
    }
    const data = await res.json()
    const anime = data?.result?.data || data
    if (!anime) {
      return { title: 'Anime Not Found', description: 'This anime could not be found.', robots: { index: false, follow: false } }
    }
    const title = `${anime.titleEnglish || anime.title}`
    const desc = anime.description?.slice(0, 155) || `Details, ratings, and where to watch ${title} on AnimeSenpai.`
    const urlPath = `/anime/${anime.slug}`
    const image = anime.bannerImage || anime.coverImage
    return {
      title,
      description: desc,
      alternates: baseAlternates(urlPath),
      robots: { index: true, follow: true },
      openGraph: siteOpenGraph(undefined, {
        type: 'video.tv_show',
        title,
        description: desc,
        url: `https://animesenpai.app${urlPath}`,
        images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined,
      }),
      twitter: siteTwitter({ title, description: desc }),
      other: {
        'script:ld+json:BreadcrumbList': JSON.stringify(
          buildBreadcrumbJsonLd([
            { name: 'Home', item: buildCanonical('/') },
            { name: 'Anime', item: buildCanonical('/search') },
            { name: title, item: buildCanonical(urlPath) },
          ])
        ),
        'script:ld+json:TVSeries': JSON.stringify(
          buildTvSeriesJsonLd({
            title,
            description: anime.description || undefined,
            image: image,
            genre: anime.genres?.map((g: any) => g.name) || anime.genres,
            datePublished: anime.year ? `${anime.year}-01-01` : undefined,
            aggregateRating: anime.rating ? { ratingValue: anime.rating, ratingCount: anime.popularity || 0 } : undefined,
            url: `https://animesenpai.app${urlPath}`,
          })
        ),
      },
    }
  } catch {
    return { title: 'Anime', description: 'Anime details on AnimeSenpai.', robots: { index: false, follow: true } }
  }
}


