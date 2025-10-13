'use client'

import { ReactNode } from 'react'
import { Button } from './button'
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  WifiOff, 
  ServerCrash, 
  Lock,
  Search,
  FileQuestion
} from 'lucide-react'
import { ErrorType, AppError } from '../../lib/error-handler'

interface ErrorStateProps {
  error?: AppError | Error | string | null
  title?: string
  message?: string
  icon?: ReactNode
  showRetry?: boolean
  showHome?: boolean
  onRetry?: () => void
  onHome?: () => void
  variant?: 'full' | 'inline' | 'compact'
  className?: string
}

/**
 * Get appropriate icon for error type
 */
function getErrorIcon(error?: AppError | Error | string | null): ReactNode {
  if (!error) return <AlertTriangle className="h-10 w-10 text-error-400" />

  // If it's an AppError with type
  if (typeof error === 'object' && error !== null && 'type' in error) {
    const appError = error as AppError
    switch (appError.type) {
      case ErrorType.NETWORK_ERROR:
      case ErrorType.TIMEOUT_ERROR:
        return <WifiOff className="h-10 w-10 text-error-400" />
      case ErrorType.SERVER_ERROR:
      case ErrorType.API_ERROR:
        return <ServerCrash className="h-10 w-10 text-error-400" />
      case ErrorType.AUTH_ERROR:
      case ErrorType.UNAUTHORIZED:
        return <Lock className="h-10 w-10 text-error-400" />
      case ErrorType.NOT_FOUND:
        return <FileQuestion className="h-10 w-10 text-error-400" />
      default:
        return <AlertTriangle className="h-10 w-10 text-error-400" />
    }
  }

  return <AlertTriangle className="h-10 w-10 text-error-400" />
}

/**
 * Get error message
 */
function getErrorMessage(error?: AppError | Error | string | null): string {
  if (!error) return 'Something went wrong'
  
  if (typeof error === 'string') return error
  
  if ('userMessage' in error && error.userMessage) return error.userMessage
  if ('message' in error) return error.message
  
  return 'Something went wrong'
}

/**
 * Error State Component
 * Displays errors in a user-friendly way with retry and navigation options
 */
export function ErrorState({
  error,
  title,
  message,
  icon,
  showRetry = true,
  showHome = false,
  onRetry,
  onHome,
  variant = 'inline',
  className = '',
}: ErrorStateProps) {
  const errorIcon = icon || getErrorIcon(error)
  const errorMessage = message || getErrorMessage(error)
  const errorTitle = title || 'Oops! Something went wrong'

  // Full page error
  if (variant === 'full') {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden flex items-center justify-center p-4 ${className}`}>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-error-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-error-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-2xl w-full">
          <div className="glass rounded-2xl p-8 md:p-12 text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-error-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              {errorIcon}
            </div>

            {/* Content */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{errorTitle}</h1>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">{errorMessage}</p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {showRetry && onRetry && (
                <Button
                  onClick={onRetry}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              {showHome && (
                <Button
                  onClick={onHome || (() => window.location.href = '/dashboard')}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Compact error (for small spaces)
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 p-4 bg-error-500/10 border border-error-500/20 rounded-lg ${className}`}>
        <AlertTriangle className="h-5 w-5 text-error-400 flex-shrink-0" />
        <p className="text-error-300 text-sm flex-1">{errorMessage}</p>
        {showRetry && onRetry && (
          <Button
            onClick={onRetry}
            size="sm"
            variant="ghost"
            className="text-error-400 hover:text-error-300 hover:bg-error-500/10 flex-shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  // Inline error (default)
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="w-16 h-16 bg-error-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          {errorIcon}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-2">{errorTitle}</h3>
        <p className="text-gray-400 mb-6">{errorMessage}</p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          {showHome && (
            <Button
              onClick={onHome || (() => window.location.href = '/dashboard')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Empty State Component (for when there's no data, not an error)
 */
interface EmptyStateProps {
  icon?: ReactNode
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon = <Search className="h-10 w-10 text-gray-500" />,
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-6">{message}</p>
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

