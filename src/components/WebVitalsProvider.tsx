'use client'

import { useEffect } from 'react'
import { webVitalsTracker } from '../lib/web-vitals'
import { useAuth } from '../app/lib/auth-context'

export function WebVitalsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  useEffect(() => {
    // Set user ID for web vitals tracking
    if (user?.id) {
      webVitalsTracker.setUserId(user.id)
    }
  }, [user?.id])

  return <>{children}</>
}
