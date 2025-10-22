/**
 * Skip Link Component
 *
 * Provides keyboard users with a way to skip to main content
 * WCAG 2.1 AA: 2.4.1 Bypass Blocks (Level A)
 */

'use client'

import { useRef, useEffect } from 'react'

export function SkipLink() {
  const skipLinkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show skip link when Tab is pressed for the first time
      if (e.key === 'Tab' && skipLinkRef.current) {
        skipLinkRef.current.classList.remove('sr-only')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    // Find main content element
    const mainContent =
      document.querySelector('main') ||
      document.querySelector('[role="main"]') ||
      document.querySelector('#main-content')

    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' })

      // Hide skip link after navigation
      if (skipLinkRef.current) {
        skipLinkRef.current.classList.add('sr-only')
      }
    }
  }

  return (
    <a
      ref={skipLinkRef}
      href="#main-content"
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-primary-500 focus:text-white focus:rounded-lg focus:shadow-lg focus:font-semibold focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900"
    >
      Skip to main content
    </a>
  )
}
