'use client'

import { useEffect } from 'react'
import { Button } from '../components/ui/button'
import { 
  Home, 
  RefreshCw, 
  AlertCircle,
  Bug,
  Wifi,
  Server
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-error-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-error-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Error Icon */}
          <div className="w-24 h-24 bg-error-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="h-12 w-12 text-error-400" />
          </div>

          {/* Error Content */}
          <div className="glass rounded-2xl p-12">
            <h1 className="text-6xl font-bold text-white mb-4">500</h1>
            <h2 className="text-3xl font-bold text-white mb-6">
              Oops! Something Went Wrong
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-lg mx-auto">
              We hit a snag on our end. Don't worry — Senpai's on it! Give it another try in a moment.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-error-500/10 border border-error-500/20 rounded-xl p-4 mb-8 text-left">
                <h3 className="text-error-400 font-semibold mb-2 flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Error Details (Development)
                </h3>
                <p className="text-red-300 text-sm font-mono break-all">
                  {error.message}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={reset}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-brand-primary-500/25"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = '/dashboard'}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-3"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>

            {/* Helpful Information */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Things to try:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-3 text-gray-300">
                  <RefreshCw className="h-4 w-4 text-primary-400" />
                  <span>Refresh the page</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Wifi className="h-4 w-4 text-primary-400" />
                  <span>Check your internet</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Server className="h-4 w-4 text-primary-400" />
                  <span>Wait a minute and retry</span>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="mt-8">
              <p className="text-gray-400 text-sm">
                Still stuck?{' '}
                <a 
                  href="mailto:support@animesenpai.app" 
                  className="text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Drop us a line
                </a>
                {' '}— we're here to help!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
