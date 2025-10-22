/**
 * Skip Navigation Component
 *
 * Provides skip links for screen reader users to bypass repetitive navigation
 * WCAG 2.1 Level A requirement
 */

'use client'

export function SkipNav() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-[100] bg-white text-gray-900 px-4 py-2 rounded-lg font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-500 transition-all"
      >
        Skip to main content
      </a>
      <a
        href="#search"
        className="fixed top-4 left-40 z-[100] bg-white text-gray-900 px-4 py-2 rounded-lg font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-500 transition-all"
      >
        Skip to search
      </a>
    </div>
  )
}
