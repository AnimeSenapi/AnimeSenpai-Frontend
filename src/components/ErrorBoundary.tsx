/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the component tree,
 * logs those errors, and displays a fallback UI.
 *
 * Based on React Error Boundary pattern
 */

'use client'

import React, { Component, ReactNode, ErrorInfo, useState } from 'react'
import { AlertTriangle, RefreshCw, Home, ChevronDown, Mail, Copy, Check } from 'lucide-react'
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
  showReportForm: boolean
  reportSubmitted: boolean
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
      showReportForm: false,
      reportSubmitted: false,
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

  handleCopyErrorId = async () => {
    if (this.state.errorId) {
      try {
        await navigator.clipboard.writeText(this.state.errorId)
        // Show feedback (could use toast here)
        const button = document.querySelector('[data-error-id-copy]')
        if (button) {
          const originalText = button.textContent
          button.textContent = 'Copied!'
          setTimeout(() => {
            if (button) button.textContent = originalText
          }, 2000)
        }
      } catch (err) {
        console.error('Failed to copy error ID:', err)
      }
    }
  }

  handleReportError = () => {
    this.setState({ showReportForm: true })
  }

  handleSubmitReport = () => {
    const { error, errorId, errorInfo } = this.state
    const reportData = {
      errorId,
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }

    // Send to Sentry with user context
    Sentry.captureException(error, {
      tags: {
        errorBoundary: true,
        userReported: true,
        level: this.props.level || 'component',
      },
      extra: reportData,
    })

    this.setState({ reportSubmitted: true, showReportForm: false })
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
            <div className="flex items-center gap-2 justify-center">
              <p className="text-xs text-gray-500">Error ID: {errorId}</p>
              <button
                onClick={this.handleCopyErrorId}
                data-error-id-copy
                className="text-gray-500 hover:text-white transition-colors p-1"
                aria-label="Copy error ID"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
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

          {/* Report Error Button */}
          {!this.state.showReportForm && !this.state.reportSubmitted && (
            <Button
              onClick={this.handleReportError}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Report This Error
            </Button>
          )}

          {/* Report Submitted Confirmation */}
          {this.state.reportSubmitted && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <Check className="h-4 w-4" />
              <span>Error report submitted. Thank you!</span>
            </div>
          )}

          {/* Help Text */}
          <p className="text-xs text-gray-500 max-w-md">
            {this.state.reportSubmitted
              ? 'Our team has been notified and will investigate this issue.'
              : 'If this problem persists, please contact support with the error ID above.'}
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

/**
 * Convenience wrappers for different error boundary levels
 */

interface ComponentErrorBoundaryProps {
  children: ReactNode
  componentName?: string
  fallback?: ReactNode
  className?: string
}

export function ComponentErrorBoundary({
  children,
  componentName,
  fallback,
  className,
}: ComponentErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="component"
      fallback={fallback}
      className={className}
      onError={(error, errorInfo) => {
        Sentry.captureException(error, {
          tags: { errorBoundary: true, level: 'component', componentName },
          contexts: { react: { componentStack: errorInfo.componentStack } },
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

interface PageErrorBoundaryProps {
  children: ReactNode
  pageName?: string
}

export function PageErrorBoundary({ children, pageName }: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="page"
      onError={(error, errorInfo) => {
        Sentry.captureException(error, {
          tags: { errorBoundary: true, level: 'page', pageName },
          contexts: { react: { componentStack: errorInfo.componentStack } },
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

interface SectionErrorBoundaryProps {
  children: ReactNode
  sectionName?: string
  className?: string
}

export function SectionErrorBoundary({
  children,
  sectionName,
  className,
}: SectionErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="section"
      className={className}
      onError={(error, errorInfo) => {
        Sentry.captureException(error, {
          tags: { errorBoundary: true, level: 'section', sectionName },
          contexts: { react: { componentStack: errorInfo.componentStack } },
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

interface LayoutErrorBoundaryProps {
  children: ReactNode
}

export function LayoutErrorBoundary({ children }: LayoutErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="page"
      onError={(error, errorInfo) => {
        Sentry.captureException(error, {
          tags: { errorBoundary: true, level: 'layout' },
          contexts: { react: { componentStack: errorInfo.componentStack } },
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Feature-specific error boundaries for better granularity
 */
interface FeatureErrorBoundaryProps {
  children: ReactNode
  featureName: string
  fallback?: ReactNode
}

export function FeatureErrorBoundary({
  children,
  featureName,
  fallback,
}: FeatureErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="section"
      fallback={fallback}
      onError={(error, errorInfo) => {
        Sentry.captureException(error, {
          tags: {
            errorBoundary: true,
            level: 'feature',
            featureName,
          },
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Data-fetching error boundary
 */
interface DataErrorBoundaryProps {
  children: ReactNode
  dataSource: string
  fallback?: ReactNode
}

export function DataErrorBoundary({
  children,
  dataSource,
  fallback,
}: DataErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="section"
      fallback={
        fallback || (
          <div className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-warning-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              Failed to load {dataSource}. Please try refreshing.
            </p>
          </div>
        )
      }
      onError={(error, errorInfo) => {
        Sentry.captureException(error, {
          tags: {
            errorBoundary: true,
            level: 'data',
            dataSource,
          },
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
