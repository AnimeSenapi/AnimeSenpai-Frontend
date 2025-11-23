import type { Metadata } from 'next'
import { baseAlternates, siteOpenGraph, siteTwitter } from '@/lib/seo'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const params = await searchParams
  const q = (params?.q as string) || ''
  const hasFilters = params?.genres || params?.studios || params?.years || params?.statuses || params?.types
  const pageTitle = q ? `Search: ${q}` : 'Search Anime'
  const desc = q
    ? `Search results for "${q}" on AnimeSenpai. Filter by genre, studio, year, rating, and more.`
    : 'Search and explore anime by genre, studio, year, rating, and more on AnimeSenpai.'
  const path = q ? `/search?q=${encodeURIComponent(q)}` : '/search'
  
  // Don't index search result pages with queries or filters
  const shouldIndex = !q && !hasFilters
  
  return {
    title: pageTitle,
    description: desc,
    alternates: baseAlternates(path),
    robots: { 
      index: shouldIndex, 
      follow: true,
      ...(q && { 'max-snippet': -1, 'max-image-preview': 'large' }),
    },
    openGraph: siteOpenGraph(undefined, { 
      title: pageTitle, 
      description: desc, 
      url: `https://animesenpai.app${path}`,
      type: 'website',
    }),
    twitter: siteTwitter({ 
      title: pageTitle, 
      description: desc,
    }),
  }
}


