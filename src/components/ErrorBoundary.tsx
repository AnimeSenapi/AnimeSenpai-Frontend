/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the component tree,
 * logs those errors, and displays a fallback UI.
 *
 * Based on React Error Boundary pattern
 */

'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw, Home, ChevronDown } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '../app/lib/utils'
import * as Sentry from '@sentry/nextjs'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
  level?: 'page' | 'section' | 'component'
  className?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return {
      hasError: true,
      error,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }

    // Update state with error info
    this.setState({
      errorInfo,
    })

    // Report to Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: true,
        level: this.props.level || 'component',
      },
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      extra: {
        errorId: this.state.errorId,
        props: this.props.resetKeys,
      },
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    // Reset error boundary when resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      )

      if (hasResetKeyChanged) {
        this.resetErrorBoundary()
      }
    }

    // Reset error boundary on any prop change if enabled
    if (hasError && resetOnPropsChange) {
      this.resetErrorBoundary()
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    })
  }

  handleRetry = () => {
    this.resetErrorBoundary()
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Render default error UI based on level
      return this.renderDefaultError()
    }

    return this.props.children
  }

  private renderDefaultError() {
    const { level = 'component', className } = this.props
    const { error, errorInfo, errorId } = this.state

    const isPageLevel = level === 'page'
    const isSectionLevel = level === 'section'

    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center',
          isPageLevel && 'min-h-screen p-4 sm:p-6 lg:p-8',
          isSectionLevel && 'min-h-[400px] p-8',
          !isPageLevel && !isSectionLevel && 'min-h-[200px] p-4',
          className
        )}
      >
        <div
          className={cn(
            'glass rounded-xl p-6 sm:p-8 max-w-2xl w-full',
            'flex flex-col items-center text-center space-y-6'
          )}
        >
          {/* Error Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
            <div className="relative bg-red-500/10 rounded-full p-4">
              <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 text-red-400" />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {isPageLevel
                ? 'Oops! Something went wrong'
                : isSectionLevel
                  ? 'Unable to load this section'
                  : 'Component Error'}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              {isPageLevel
                ? 'We encountered an unexpected error. Please try again or return home.'
                : isSectionLevel
                  ? 'This section encountered an error. You can try refreshing or continue using other parts of the app.'
                  : 'This component encountered an error. The rest of the page should still work.'}
            </p>
          </div>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="w-full text-left">
              <summary className="cursor-pointer text-sm text-gray-400 hover:text-white flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                Error Details (Development Only)
              </summary>
              <div className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-sm text-red-400 font-mono break-all">{error.toString()}</p>
                {errorInfo && (
                  <pre className="mt-4 text-xs text-gray-400 overflow-auto max-h-60">
                    {errorInfo.componentStack}
                  </pre>
                )}
                {errorId && <p className="mt-2 text-xs text-gray-500">Error ID: {errorId}</p>}
              </div>
            </details>
          )}

          {/* Error ID (Production) */}
          {process.env.NODE_ENV === 'production' && errorId && (
            <p className="text-xs text-gray-500">Error ID: {errorId}</p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={this.handleRetry} variant="default" size="lg" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>

            {isPageLevel && (
              <>
                <Button onClick={this.handleReload} variant="outline" size="lg" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                <Button onClick={this.handleGoHome} variant="ghost" size="lg" className="gap-2">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </>
            )}

            {isSectionLevel && (
              <Button onClick={this.handleGoHome} variant="ghost" size="lg" className="gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            )}
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 max-w-md">
            If this problem persists, please contact support with the error ID above.
          </p>
        </div>
      </div>
    )
  }
}

/**
 * Hook to trigger error boundary from functional components
 */
export function useErrorHandler() {
  return (error: Error) => {
    throw error
  }
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
