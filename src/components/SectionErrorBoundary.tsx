/**
 * Section-Level Error Boundary
 *
 * Wraps major sections of a page (e.g., navigation, content areas)
 * Use this for components that shouldn't crash the entire page
 */

'use client'

import { ErrorBoundary } from './ErrorBoundary'
import { ReactNode } from 'react'

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
        console.error(`Section Error (${sectionName || 'Unknown'}):`, error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
