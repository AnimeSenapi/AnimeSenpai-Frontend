'use client'

import { useEffect } from 'react'
import { Button } from '../components/ui/button'
import { 
  Home, 
  RefreshCw, 
  AlertTriangle,
  Bug,
  ArrowLeft
} from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden flex items-center justify-center p-4 pt-32">
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-0 -right-40 w-96 h-96 bg-red-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Go back
        </button>

        {/* Error Card */}
        <div className="glass rounded-3xl p-8 md:p-12 text-center shadow-2xl border border-white/10">
          {/* Error Icon with Animation */}
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 bg-red-500/20 rounded-2xl animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-red-400" />
            </div>
          </div>

          {/* Error Content */}
          <h1 className="text-7xl md:text-8xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Oops!
            </span>
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Something went wrong
          </h2>
          
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            We encountered an unexpected error. Don't worry, our team has been notified.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Bug className="h-4 w-4 text-red-400" />
                <h3 className="text-red-400 font-semibold text-sm">
                  Debug Info (Development)
                </h3>
              </div>
              <p className="text-red-300 text-xs font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-red-400 text-xs mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button
              onClick={reset}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/25"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-3.5 rounded-xl"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>

          {/* Help Text */}
          <div className="pt-6 border-t border-white/10">
            <p className="text-gray-500 text-sm">
              If this keeps happening,{' '}
              <a 
                href="mailto:support@animesenpai.app" 
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
