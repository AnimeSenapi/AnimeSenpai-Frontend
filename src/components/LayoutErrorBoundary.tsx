/**
 * Layout Error Boundary
 *
 * Wraps the entire layout to catch errors in the app shell
 * This is the outermost error boundary
 */

'use client'

import { ErrorBoundary } from './ErrorBoundary'
import { ReactNode } from 'react'

interface LayoutErrorBoundaryProps {
  children: ReactNode
}

export function LayoutErrorBoundary({ children }: LayoutErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="page"
      onError={(error, errorInfo) => {
        console.error('Layout Error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
