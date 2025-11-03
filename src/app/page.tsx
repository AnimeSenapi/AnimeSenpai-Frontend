'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './lib/auth-context'
import {
  getOrganizationSchema,
  getWebsiteSchema,
  getWebApplicationSchema,
} from '../components/StructuredData'
import { SEOMetadata } from '../components/SEOMetadata'
import { PageErrorBoundary } from '../components/PageErrorBoundary'

export default function HomePage() {
  const router = useRouter()
  const { isLoading } = useAuth()

  useEffect(() => {
    // Always redirect to dashboard
    if (!isLoading) {
      router.push('/dashboard')
    }
  }, [isLoading, router])

  // Show loading screen while redirecting
  return (
    <PageErrorBoundary pageName="Home">
      {/* SEO Metadata */}
      <SEOMetadata
        title="AnimeSenpai - Your Ultimate Anime Companion"
        description="Discover, track, and explore your favorite anime. Get personalized recommendations and connect with fellow anime fans."
        keywords={[
          'anime',
          'manga',
          'tracking',
          'recommendations',
          'anime list',
          'myanimelist alternative',
        ]}
        structuredData={[getOrganizationSchema(), getWebsiteSchema(), getWebApplicationSchema()]}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">AS</span>
          </div>
          <h1 className="sr-only">AnimeSenpai - Your Ultimate Anime Companion</h1>
          <p className="text-gray-400">Loading your anime journey...</p>
        </div>
      </div>
    </PageErrorBoundary>
  )
}
