'use client'

import { LoadingState } from './loading-state'

interface PageLoadingProps {
  text?: string
}

/**
 * Unified Page Loading Component
 * Use this for route-level loading states (loading.tsx files)
 * Matches the app's design system with consistent padding and styling
 */
export function PageLoading({ text = 'Loading...' }: PageLoadingProps) {
  return <LoadingState variant="page" text={text} size="lg" />
}

export default PageLoading

