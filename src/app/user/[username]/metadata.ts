import type { Metadata } from 'next'
import { baseAlternates, siteOpenGraph, siteTwitter, buildBreadcrumbJsonLd, buildPersonJsonLd, buildCanonical } from '@/lib/seo'

import { TRPC_URL } from '../../lib/api'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  try {
    const input = encodeURIComponent(JSON.stringify({ username }))
    const res = await fetch(`${TRPC_URL}/social.getUserProfile?input=${input}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 },
    })
    if (!res.ok) {
      return { title: 'Profile', description: 'User profile is private or not found.', robots: { index: false, follow: true } }
    }
    const data = await res.json()
    const profile = data?.result?.data || data
    if (!profile || profile.privacy?.profileVisibility === 'private') {
      return { title: 'Profile', description: 'User profile is private or not found.', robots: { index: false, follow: true } }
    }
    const display = profile.user?.name || profile.user?.username || username
    const title = `${display} • Profile`
    const desc = profile.user?.bio?.slice(0, 160) || `View ${display}'s anime profile, favorites, stats, and activity on AnimeSenpai.`
    const urlPath = `/user/${profile.user?.username || username}`
    const image = profile.user?.avatar || undefined
    return {
      title,
      description: desc,
      alternates: baseAlternates(urlPath),
      robots: { index: true, follow: true },
      openGraph: siteOpenGraph(undefined, {
        title,
        description: desc,
        url: `https://animesenpai.app${urlPath}`,
        images: image ? [{ url: image, width: 1200, height: 630, alt: display }] : undefined,
      }),
      twitter: siteTwitter({ title, description: desc }),
      other: {
        'script:ld+json:BreadcrumbList': JSON.stringify(
          buildBreadcrumbJsonLd([
            { name: 'Home', item: buildCanonical('/') },
            { name: 'Users', item: buildCanonical('/discover') },
            { name: display, item: buildCanonical(urlPath) },
          ])
        ),
        'script:ld+json:Person': JSON.stringify(
          buildPersonJsonLd({
            username: profile.user?.username || username,
            name: display,
            url: `https://animesenpai.app${urlPath}`,
            image,
            description: profile.user?.bio || undefined,
          })
        ),
      },
    }
  } catch {
    return { title: 'Profile', description: 'User profile.', robots: { index: false, follow: true } }
  }
}


