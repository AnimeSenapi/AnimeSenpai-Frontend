'use client'

import { Loader2, Sparkles } from 'lucide-react'

interface LoadingStateProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'page' | 'inline' | 'overlay' | 'skeleton' | 'dots' | 'pulse'
  className?: string
  showProgress?: boolean
  progress?: number
}

/**
 * Loading State Component
 * Displays loading spinners with optional text and progress
 */
export function LoadingState({
  text = 'Loading...',
  size = 'md',
  variant = 'inline',
  className = '',
  showProgress = false,
  progress = 0,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  // Skeleton loading (for content placeholders)
  if (variant === 'skeleton') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-800 rounded-lg h-4 w-3/4 mb-2"></div>
        <div className="bg-gray-800 rounded-lg h-4 w-1/2"></div>
      </div>
    )
  }

  // Dots loading animation
  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <div
          className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        ></div>
        <div
          className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        ></div>
        <div
          className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        ></div>
        {text && <span className={`ml-2 text-gray-400 ${textSizeClasses[size]}`}>{text}</span>}
      </div>
    )
  }

  // Pulse loading animation
  if (variant === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className="relative">
          <div className={`${sizeClasses[size]} bg-primary-400/20 rounded-full animate-ping`}></div>
          <div
            className={`${sizeClasses[size]} bg-primary-400/40 rounded-full animate-ping absolute inset-0`}
            style={{ animationDelay: '300ms' }}
          ></div>
          <div
            className={`${sizeClasses[size]} bg-primary-400 rounded-full absolute inset-0 flex items-center justify-center`}
          >
            <Sparkles className="h-1/2 w-1/2 text-white" />
          </div>
        </div>
        {text && <p className={`text-gray-400 mt-4 ${textSizeClasses[size]}`}>{text}</p>}
      </div>
    )
  }

  // Full page loading
  if (variant === 'full') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-12 sm:pb-16 lg:pb-20 relative z-10">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <Loader2
                  className={`${sizeClasses[size]} text-primary-400 animate-spin mx-auto`}
                />
                <div className="absolute inset-0 bg-primary-400/20 rounded-full blur-xl"></div>
              </div>
              <p className={`text-gray-400 ${textSizeClasses[size]} mb-4`}>{text}</p>
              {showProgress && (
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Page variant (for route-level loading with proper layout)
  if (variant === 'page') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-12 sm:pb-16 lg:pb-20 relative z-10">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="glass rounded-xl p-12 border border-white/10 text-center max-w-md">
              <div className="relative inline-block mb-6">
                <Loader2
                  className={`${sizeClasses[size]} text-primary-400 animate-spin mx-auto`}
                />
                <div className="absolute inset-0 bg-primary-400/20 rounded-full blur-xl"></div>
              </div>
              <p className={`text-gray-300 ${textSizeClasses[size]} mb-4`}>{text}</p>
              {showProgress && (
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Overlay loading (over existing content)
  if (variant === 'overlay') {
    return (
      <div
        className={`absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}
      >
        <div className="text-center">
          <div className="relative inline-block">
            <Loader2
              className={`${sizeClasses[size]} text-primary-400 animate-spin mx-auto mb-4`}
            />
            <div className="absolute inset-0 bg-primary-400/20 rounded-full blur-xl"></div>
          </div>
          <p className={`text-gray-300 ${textSizeClasses[size]} mb-2`}>{text}</p>
          {showProgress && (
            <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Inline loading (default)
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="relative inline-block">
        <Loader2 className={`${sizeClasses[size]} text-primary-400 animate-spin mb-4`} />
        <div className="absolute inset-0 bg-primary-400/20 rounded-full blur-xl"></div>
      </div>
      <p className={`text-gray-400 ${textSizeClasses[size]} mb-2`}>{text}</p>
      {showProgress && (
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          ></div>
        </div>
      )}
    </div>
  )
}

/**
 * Inline Spinner (for buttons, etc.)
 */
export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />
}

/**
 * Loading Button Component
 * Button with built-in loading state
 */
interface LoadingButtonProps {
  isLoading: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline'
}

export function LoadingButton({
  isLoading,
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  variant = 'primary',
}: LoadingButtonProps) {
  const variantClasses = {
    primary:
      'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    outline: 'border border-white/20 hover:bg-white/10 text-white',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${variantClasses[variant]}
        px-4 py-2 rounded-lg font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {isLoading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  )
}

/**
 * Loading Skeleton for Cards
 */
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-800/50 rounded-xl p-4 animate-pulse ${className}`}>
      <div className="bg-gray-700 rounded-lg h-48 mb-4"></div>
      <div className="bg-gray-700 rounded h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-700 rounded h-4 w-1/2"></div>
    </div>
  )
}

/**
 * Loading Skeleton for Lists
 */
export function ListSkeleton({
  count = 3,
  className = '',
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="bg-gray-700 rounded-lg h-16 w-16 flex-shrink-0"></div>
            <div className="flex-1">
              <div className="bg-gray-700 rounded h-4 w-3/4 mb-2"></div>
              <div className="bg-gray-700 rounded h-3 w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
