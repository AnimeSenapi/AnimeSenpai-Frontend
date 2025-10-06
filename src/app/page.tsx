'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './lib/auth-context'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Always redirect to dashboard
    if (!isLoading) {
      router.push('/dashboard')
    }
  }, [isLoading, router])

  // Show loading screen while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white font-bold text-2xl">AS</span>
        </div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  )
}
