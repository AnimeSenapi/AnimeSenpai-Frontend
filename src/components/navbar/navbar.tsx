'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '../ui/button'
import { GuestAuth } from './GuestAuth'
import { StandaloneDropdown } from './StandaloneDropdown'
import { SearchBar } from '../search/SearchBar'
import { NotificationBell } from './NotificationBell'
import { useAuth } from '../../app/lib/auth-context'
import {
  Home,
  Bookmark,
  Search,
  Menu,
  X,
  Activity,
  MessageCircle,
  Trophy
} from 'lucide-react'

export function Navbar() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'My List', href: '/mylist', icon: Bookmark },
    { name: 'Activity', href: '/activity', icon: Activity, authOnly: true },
    { name: 'Messages', href: '/messages', icon: MessageCircle, authOnly: true },
    { name: 'Achievements', href: '/achievements', icon: Trophy, authOnly: true },
    { name: 'Search', href: '/search', icon: Search },
  ]

  return (
    <>
      <nav className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[96%] sm:w-[95%] max-w-7xl px-2 sm:px-0 safe-area-top" role="navigation" aria-label="Main navigation">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 overflow-visible transition-all duration-300 touch-manipulation">
          <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
            {/* Logo Section - Responsive */}
            <Link href="/dashboard" className="flex items-center flex-shrink-0" aria-label="AnimeSenpai home">
              <Image 
                src="/assets/logo/AnimeSenpai_Inline.svg" 
                alt="AnimeSenpai" 
                width={450}
                height={112}
                className="h-12 sm:h-16 lg:h-20 xl:h-24 w-auto invert"
                priority
              />
            </Link>

            {/* Navigation Items - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems
                .filter(item => !item.authOnly || isAuthenticated)
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
            <div className="hidden sm:block w-48 lg:w-56 xl:w-64 transition-all duration-300" role="search" aria-label="Search anime" id="search">
              <SearchBar
                placeholder="Search..."
                showDropdown={true}
                size="sm"
                variant="navbar"
              />
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isLoading ? (
                <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
              ) : isAuthenticated && user ? (
                <>
                  {/* Notification Bell */}
                  <NotificationBell />
                  
                  {/* User Dropdown */}
                  <StandaloneDropdown
                    user={{
                      id: user.id,
                      name: user.username || user.name || 'User',
                      email: user.email,
                      avatar: user.avatar,
                      role: user.role
                    }}
                  />
                </>
              ) : (
                <div className="hidden sm:block">
                  <GuestAuth />
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 touch-target"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Slide down */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-40 w-[96%] sm:w-[95%] max-w-7xl px-2 sm:px-0 lg:hidden"
          role="dialog"
          aria-label="Mobile navigation menu"
        >
          <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            {/* Mobile Search */}
            <div className="mb-4 sm:hidden" role="search" aria-label="Search anime">
              <SearchBar
                placeholder="Search anime..."
                showDropdown={true}
                size="sm"
                variant="navbar"
              />
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-1" aria-label="Mobile menu navigation">
              {navItems
                .filter(item => !item.authOnly || isAuthenticated)
                .map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 text-base font-medium"
                      aria-label={`Go to ${item.name}`}
                    >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Mobile Auth Buttons */}
            {!isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-white/10 sm:hidden">
                <GuestAuth />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
