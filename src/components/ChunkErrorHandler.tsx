'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Global handler for Next.js chunk loading errors
 * Provides automatic retry and graceful error handling
 */
export function ChunkErrorHandler() {
  const router = useRouter()

  useEffect(() => {
    // Handle unhandled chunk loading errors
    const handleChunkError = (event: ErrorEvent) => {
      const error = event.error || event.message || ''
      const errorString = String(error)

      // Check if it's a chunk loading error
      const isChunkError =
        errorString.includes('Load failed') ||
        errorString.includes('Loading chunk') ||
        errorString.includes('ChunkLoadError') ||
        errorString.includes('Failed to fetch dynamically imported module') ||
        errorString.includes('Loading CSS chunk') ||
        errorString.includes('_next/static/chunks')

      if (isChunkError) {
        // Prevent default error handling
        event.preventDefault()

        // Log locally for debugging
        console.warn('Chunk loading error detected, attempting recovery:', errorString)

        // Try to reload the page after a short delay
        // This often fixes transient network issues
        setTimeout(() => {
          // Soft reload - try to reload just the failed chunk
          if (typeof window !== 'undefined') {
            window.location.reload()
          }
        }, 1000)

        return true
      }

      return false
    }

    // Handle unhandled promise rejections (chunk loading errors often come as promise rejections)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason || ''
      const errorString = String(error)

      const isChunkError =
        errorString.includes('Load failed') ||
        errorString.includes('Loading chunk') ||
        errorString.includes('ChunkLoadError') ||
        errorString.includes('Failed to fetch dynamically imported module') ||
        errorString.includes('_next/static/chunks')

      if (isChunkError) {
        // Prevent default error handling
        event.preventDefault()

        console.warn('Chunk loading rejection detected, attempting recovery:', errorString)

        // Try to reload after a delay
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload()
          }
        }, 1000)

        return true
      }

      return false
    }

    // Add event listeners
    window.addEventListener('error', handleChunkError, true)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Cleanup
    return () => {
      window.removeEventListener('error', handleChunkError, true)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [router])

  return null
}

