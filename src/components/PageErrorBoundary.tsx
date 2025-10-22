/**
 * Page-Level Error Boundary
 *
 * Wraps entire pages to catch and display errors gracefully
 * Use this for top-level page components
 */

'use client'

import { ErrorBoundary } from './ErrorBoundary'
import { ReactNode } from 'react'

interface PageErrorBoundaryProps {
  children: ReactNode
  pageName?: string
}

export function PageErrorBoundary({ children, pageName }: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="page"
      onError={(error, errorInfo) => {
        console.error(`Page Error (${pageName || 'Unknown'}):`, error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
