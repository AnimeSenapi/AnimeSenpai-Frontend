'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { GuestAuth } from './GuestAuth'
import { StandaloneDropdown } from './StandaloneDropdown'
import { SearchBar } from '../search/SearchBar'
import { NotificationsDropdown } from './NotificationsDropdown'
import { SectionErrorBoundary } from '../SectionErrorBoundary'
import { MobileNavigationDrawer } from './MobileNavigationDrawer'
import { AuthDrawer } from './AuthDrawer'
import { useAuth } from '../../app/lib/auth-context'
import { cn } from '../../app/lib/utils'
import { Home, Bookmark, Search, Menu, X, User } from 'lucide-react'

export function Navbar() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false)

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'My List', href: '/mylist', icon: Bookmark, authOnly: true },
    { name: 'Search', href: '/search', icon: Search },
  ]

  return (
    <SectionErrorBoundary sectionName="Navbar">
      <nav
        className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[96%] sm:w-[95%] max-w-7xl px-2 sm:px-0 safe-area-top"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="bg-gray-950/95 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl px-3 sm:px-6 lg:px-8 py-2 sm:py-2 lg:py-2.5 overflow-visible transition-all duration-300 touch-manipulation shadow-2xl">
          <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
            {/* Logo Section - Responsive */}
            <Link
              href="/dashboard"
              className="flex items-center flex-shrink-0"
              aria-label="AnimeSenpai home"
            >
              <Image
                src="/assets/logo/AnimeSenpai_Inline.svg"
                alt="AnimeSenpai"
                width={450}
                height={112}
                className="h-10 sm:h-16 lg:h-20 xl:h-24 w-auto invert drop-shadow-lg"
                priority
              />
            </Link>

            {/* Navigation Items - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems
                .filter((item) => !item.authOnly || isAuthenticated)
                .map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-2 px-4 xl:px-5 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  )
                })}
            </div>

            {/* Enhanced Search Bar - Responsive */}
            <div
              className="hidden sm:block w-48 lg:w-56 xl:w-64 transition-all duration-300"
              role="search"
              aria-label="Search anime"
              id="search"
            >
              <SearchBar placeholder="Search..." showDropdown={true} size="sm" variant="navbar" />
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isLoading ? (
                <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
              ) : isAuthenticated && user ? (
                <>
                  {/* Notifications Dropdown/Drawer */}
                  <div className="hidden sm:block">
                    <NotificationsDropdown />
                  </div>

                  {/* Desktop User Dropdown */}
                  <div className="hidden sm:block">
                    <StandaloneDropdown
                      user={{
                        id: user.id,
                        name: user.username || user.name || 'User',
                        email: user.email,
                        avatar: user.avatar,
                        role: user.role,
                      }}
                    />
                  </div>

                  {/* Mobile User Avatar Button */}
                  <button
                    onClick={() => setIsAuthDrawerOpen(!isAuthDrawerOpen)}
                    className={cn(
                      'sm:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 touch-manipulation active:scale-95',
                      isAuthDrawerOpen
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    )}
                    aria-label={isAuthDrawerOpen ? 'Close account menu' : 'Open account menu'}
                    aria-expanded={isAuthDrawerOpen}
                    aria-controls="mobile-auth-menu"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username || user.name || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {(user.username || user.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="hidden sm:block">
                    <GuestAuth />
                  </div>
                  
                  {/* Mobile Auth Button for guests */}
                  <button
                    onClick={() => setIsAuthDrawerOpen(!isAuthDrawerOpen)}
                    className={cn(
                      'sm:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 touch-manipulation active:scale-95',
                      isAuthDrawerOpen
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    )}
                    aria-label={isAuthDrawerOpen ? 'Close account menu' : 'Open account menu'}
                    aria-expanded={isAuthDrawerOpen}
                    aria-controls="mobile-auth-menu"
                  >
                    <User className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  'lg:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 touch-manipulation active:scale-95',
                  isMobileMenuOpen
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                )}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Portal Component */}
      <MobileNavigationDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Auth Drawer - Portal Component */}
      <AuthDrawer
        isOpen={isAuthDrawerOpen}
        onClose={() => setIsAuthDrawerOpen(false)}
      />
    </SectionErrorBoundary>
  )
}
