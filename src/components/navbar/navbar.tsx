'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { SectionErrorBoundary } from '../SectionErrorBoundary'
import { useNavbarDrawers } from './navbar-drawer-context'
import { NavbarDrawers } from './NavbarDrawers'
import { useAuth } from '../../app/lib/auth-context'
import { getDesktopNavItems, getMobileNavItems } from './nav-config'
import { NavbarLogo } from './components/NavbarLogo'
import { NavbarItems } from './components/NavbarItems'
import { NavbarSearch } from './components/NavbarSearch'
import { NavbarAuth } from './components/NavbarAuth'
import { MobileNavMenu } from './components/MobileNavMenu'

/**
 * Main Navbar Component
 * Unified navigation bar that works across all screen sizes
 */
export function Navbar() {
  const { isAuthenticated } = useAuth()
  const {
    isMobileSearchOpen,
    setIsMobileSearchOpen,
    isMobileNavOpen,
    setIsMobileNavOpen,
  } = useNavbarDrawers()
  const pathname = usePathname()

  // Memoize navigation items to prevent unnecessary recalculations
  const navItems = useMemo(() => getDesktopNavItems(isAuthenticated), [isAuthenticated])
  const mobileNavItems = useMemo(() => getMobileNavItems(isAuthenticated), [isAuthenticated])

  return (
    <SectionErrorBoundary sectionName="Navbar">
      <nav
        className="fixed top-2 sm:top-4 left-0 right-0 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50 w-full sm:w-[95%] sm:max-w-7xl px-2 sm:px-0 mx-auto safe-area-top"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="bg-gray-950/95 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl px-2 sm:px-4 lg:px-8 py-2 sm:py-2 lg:py-2.5 overflow-hidden transition-all duration-300 touch-manipulation shadow-2xl max-w-full">
          <div className="flex items-center justify-between gap-1 sm:gap-1.5 lg:gap-6 min-w-0">
            {/* Logo */}
            <NavbarLogo />

            {/* Desktop Navigation Items */}
            <NavbarItems items={navItems} pathname={pathname} variant="desktop" />

            {/* Mobile Navigation Menu Button (Hamburger) */}
            <MobileNavMenu
              isOpen={isMobileNavOpen}
              onToggle={() => setIsMobileNavOpen(!isMobileNavOpen)}
            />

            {/* Search */}
            <NavbarSearch onSearchClick={() => setIsMobileSearchOpen(true)} />

            {/* Auth Section */}
            <NavbarAuth />
          </div>
        </div>
      </nav>
    </SectionErrorBoundary>
  )
}

/**
 * Navbar Drawers Wrapper
 * Handles drawer state and recent searches
 * Rendered separately to ensure proper portal rendering
 */
export function NavbarDrawersWrapper() {
  const {
    isAuthDrawerOpen,
    setIsAuthDrawerOpen,
    isMobileSearchOpen,
    setIsMobileSearchOpen,
    isMobileNavOpen,
    setIsMobileNavOpen,
  } = useNavbarDrawers()
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const router = useRouter()

  // Memoize mobile nav items
  const mobileNavItems = useMemo(() => getMobileNavItems(isAuthenticated), [isAuthenticated])

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('recentSearches')
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored))
        } catch {
          setRecentSearches([])
        }
      }
    }
  }, [])

  const handleSearch = (query: string) => {
    // Save to recent searches
    if (query.trim()) {
      const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 10)
      setRecentSearches(updated)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    }
    setIsMobileSearchOpen(false)
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const handleClearRecent = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  return (
    <NavbarDrawers
      isAuthDrawerOpen={isAuthDrawerOpen}
      setIsAuthDrawerOpen={setIsAuthDrawerOpen}
      isMobileSearchOpen={isMobileSearchOpen}
      setIsMobileSearchOpen={setIsMobileSearchOpen}
      isMobileNavOpen={isMobileNavOpen}
      setIsMobileNavOpen={setIsMobileNavOpen}
      mobileNavItems={mobileNavItems}
      pathname={pathname}
      onSearch={handleSearch}
      recentSearches={recentSearches}
      onClearRecent={handleClearRecent}
    />
  )
}
