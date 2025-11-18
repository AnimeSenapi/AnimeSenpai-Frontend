'use client'

import { Navbar } from './navbar'
import { NavbarDrawersWrapper } from './navbar'

/**
 * Unified Navigation Component
 * Top navbar navigation system that works across all screen sizes
 */
export function UnifiedNavigation() {
  return (
    <>
      <Navbar />
      <NavbarDrawersWrapper />
    </>
  )
}

