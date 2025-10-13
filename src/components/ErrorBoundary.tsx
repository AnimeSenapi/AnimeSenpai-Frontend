'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from './ui/button'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })

    // Log to centralized error handler
    if (typeof window !== 'undefined') {
      const { errorHandler, ErrorType } = require('../lib/error-handler')
      errorHandler.createError(
        ErrorType.RENDER_ERROR,
        error.message,
        error,
        {
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
        }
      )
    }

    // TODO: Send to external error tracking service (e.g., Sentry)
    // if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    //   Sentry.captureException(error, { 
    //     contexts: { 
    //       react: { 
    //         componentStack: errorInfo.componentStack 
    //       } 
    //     } 
    //   })
    // }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-error-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-error-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <main className="container relative z-10 flex items-center justify-center min-h-screen py-20">
            <div className="text-center max-w-2xl px-4">
              <div className="glass rounded-2xl p-8 md:p-12">
                {/* Error Icon */}
                <div className="mb-6">
                  <div className="w-20 h-20 bg-error-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-10 w-10 text-error-400" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Oops! Something went wrong
                  </h1>
                  <p className="text-xl text-gray-300 mb-2">
                    We encountered an unexpected error
                  </p>
                  <p className="text-gray-400 mb-6">
                    Don't worry, our team has been notified and we're working on fixing it.
                  </p>
                </div>

                {/* Error Details (only in development) */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="mb-6 p-4 bg-error-500/10 border border-error-500/20 rounded-xl text-left">
                    <h3 className="text-sm font-semibold text-error-400 mb-2">Error Details (Dev Only):</h3>
                    <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap break-words">
                      {this.state.error.toString()}
                    </pre>
                    {this.state.errorInfo && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-400 cursor-pointer hover:text-white">
                          Component Stack
                        </summary>
                        <pre className="text-xs text-gray-400 mt-2 overflow-x-auto whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={this.handleReload}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Page
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                </div>

                {/* Additional Help */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-sm text-gray-400">
                    If this problem persists, please{' '}
                    <a
                      href="mailto:support@animesenpai.com"
                      className="text-primary-400 hover:text-primary-300 underline"
                    >
                      contact support
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return setError
}
