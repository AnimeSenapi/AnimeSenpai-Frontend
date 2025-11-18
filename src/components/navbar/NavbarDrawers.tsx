'use client'

import { MobileMoreMenu } from './MobileMoreMenu'
import { AuthDrawer } from './AuthDrawer'
import { MobileSearchOverlay } from '../search/MobileSearchOverlay'
import { MobileNavDrawer } from './components/MobileNavDrawer'
import type { NavItemConfig } from './types'

interface NavbarDrawersProps {
  isMoreMenuOpen: boolean
  setIsMoreMenuOpen: (open: boolean) => void
  isAuthDrawerOpen: boolean
  setIsAuthDrawerOpen: (open: boolean) => void
  isMobileSearchOpen: boolean
  setIsMobileSearchOpen: (open: boolean) => void
  isMobileNavOpen: boolean
  setIsMobileNavOpen: (open: boolean) => void
  mobileNavItems: NavItemConfig[]
  pathname: string | null
  onSearch: (query: string) => void
  recentSearches: string[]
  onClearRecent: () => void
}

export function NavbarDrawers({
  isMoreMenuOpen,
  setIsMoreMenuOpen,
  isAuthDrawerOpen,
  setIsAuthDrawerOpen,
  isMobileSearchOpen,
  setIsMobileSearchOpen,
  isMobileNavOpen,
  setIsMobileNavOpen,
  mobileNavItems,
  pathname,
  onSearch,
  recentSearches,
  onClearRecent,
}: NavbarDrawersProps) {
  return (
    <>
      {/* Mobile Navigation Drawer - Portal Component */}
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        items={mobileNavItems}
        pathname={pathname}
      />

      {/* Mobile More Menu - Portal Component */}
      <MobileMoreMenu
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
      />

      {/* Mobile Auth Drawer - Portal Component */}
      <AuthDrawer
        isOpen={isAuthDrawerOpen}
        onClose={() => setIsAuthDrawerOpen(false)}
      />

      {/* Mobile Search Overlay */}
      <MobileSearchOverlay
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
        onSearch={onSearch}
        recentSearches={recentSearches}
        onClearRecent={onClearRecent}
        trendingSearches={['Attack on Titan', 'Demon Slayer', 'One Piece', 'Jujutsu Kaisen']}
      />
    </>
  )
}

