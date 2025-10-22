'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-white mb-2">Something went wrong!</h1>

              {/* Error Description */}
              <p className="text-gray-400 mb-6">
                An unexpected error occurred. We've been notified and will fix it as soon as
                possible.
              </p>

              {/* Error Details (in development) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-left">
                  <p className="text-xs font-mono text-red-400 break-all">
                    {error.message || 'Unknown error'}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-gray-500 mt-2">Error ID: {error.digest}</p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={reset}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => (window.location.href = '/')}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
