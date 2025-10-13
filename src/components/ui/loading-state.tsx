'use client'

import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'inline' | 'overlay'
  className?: string
}

/**
 * Loading State Component
 * Displays loading spinners with optional text
 */
export function LoadingState({
  text = 'Loading...',
  size = 'md',
  variant = 'inline',
  className = '',
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

  // Full page loading
  if (variant === 'full') {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center p-4 ${className}`}>
        <div className="text-center">
          <Loader2 className={`${sizeClasses[size]} text-primary-400 animate-spin mx-auto mb-4`} />
          <p className={`text-gray-400 ${textSizeClasses[size]}`}>{text}</p>
        </div>
      </div>
    )
  }

  // Overlay loading (over existing content)
  if (variant === 'overlay') {
    return (
      <div className={`absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
        <div className="text-center">
          <Loader2 className={`${sizeClasses[size]} text-primary-400 animate-spin mx-auto mb-4`} />
          <p className={`text-gray-300 ${textSizeClasses[size]}`}>{text}</p>
        </div>
      </div>
    )
  }

  // Inline loading (default)
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-primary-400 animate-spin mb-4`} />
      <p className={`text-gray-400 ${textSizeClasses[size]}`}>{text}</p>
    </div>
  )
}

/**
 * Inline Spinner (for buttons, etc.)
 */
export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />
}

