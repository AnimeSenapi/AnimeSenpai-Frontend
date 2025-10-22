/**
 * Component-Level Error Boundary
 *
 * Wraps individual components that might fail
 * Use this for complex or third-party components
 */

'use client'

import { ErrorBoundary } from './ErrorBoundary'
import { ReactNode } from 'react'

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
        console.error(`Component Error (${componentName || 'Unknown'}):`, error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
