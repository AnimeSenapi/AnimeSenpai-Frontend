'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RestartOnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    // Simple redirect to onboarding flow
    const t = setTimeout(() => router.push('/onboarding'), 400)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center p-6">
      <div className="text-center glass rounded-2xl p-8 border border-white/10">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg mb-1">Taking you to onboarding…</p>
        <p className="text-gray-400 text-sm">You can re-pick your preferences anytime.</p>
      </div>
    </div>
  )
}


