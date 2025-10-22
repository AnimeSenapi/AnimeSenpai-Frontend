'use client'

import { useEffect } from 'react'

/**
 * Client-side SEO Head Component
 * Dynamically updates meta tags for client components
 */
interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  ogType?: string
  structuredData?: any
}

export function SEOHead({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  structuredData,
}: SEOHeadProps) {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = title
    }

    // Create or update meta tags
    const updateMetaTag = (
      name: string,
      content: string,
      attribute: 'name' | 'property' = 'name'
    ) => {
      if (!content) return

      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement

      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attribute, name)
        document.head.appendChild(meta)
      }

      meta.content = content
    }

    // Update description
    if (description) {
      updateMetaTag('description', description)
      updateMetaTag('og:description', description, 'property')
      updateMetaTag('twitter:description', description)
    }

    // Update keywords
    if (keywords && keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '))
    }

    // Update Open Graph
    if (title) {
      updateMetaTag('og:title', title, 'property')
      updateMetaTag('twitter:title', title)
    }

    if (ogImage) {
      updateMetaTag('og:image', ogImage, 'property')
      updateMetaTag('twitter:image', ogImage)
    }

    if (ogType) {
      updateMetaTag('og:type', ogType, 'property')
    }

    // Update canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement

      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.appendChild(link)
      }

      link.href = canonical
    }

    // Add structured data
    if (structuredData) {
      // Remove existing anime structured data
      const existingScript = document.querySelector('script[data-type="anime-structured-data"]')
      if (existingScript) {
        existingScript.remove()
      }

      // Add new structured data
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-type', 'anime-structured-data')
      script.text = JSON.stringify(structuredData)
      document.head.appendChild(script)
    }

    // Cleanup function
    return () => {
      // Remove anime-specific structured data when unmounting
      if (structuredData) {
        const script = document.querySelector('script[data-type="anime-structured-data"]')
        if (script) {
          script.remove()
        }
      }
    }
  }, [title, description, keywords, canonical, ogImage, ogType, structuredData])

  return null
}
