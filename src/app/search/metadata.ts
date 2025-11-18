import type { Metadata } from 'next'
import { baseAlternates, siteOpenGraph, siteTwitter } from '@/lib/seo'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const params = await searchParams
  const q = (params?.q as string) || ''
  const pageTitle = q ? `Search: ${q}` : 'Search Anime'
  const desc = q
    ? `Search results for “${q}” on AnimeSenpai. Filter by genre, studio, year, rating, and more.`
    : 'Search and explore anime by genre, studio, year, rating, and more on AnimeSenpai.'
  const path = q ? `/search?q=${encodeURIComponent(q)}` : '/search'
  return {
    title: pageTitle,
    description: desc,
    alternates: baseAlternates(path),
    robots: { index: true, follow: true },
    openGraph: siteOpenGraph({ title: pageTitle, description: desc, url: `https://animesenpai.app${path}` }),
    twitter: siteTwitter({ title: pageTitle, description: desc }),
  }
}


