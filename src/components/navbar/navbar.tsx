'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '../ui/button'
import { GuestAuth } from './GuestAuth'
import { StandaloneDropdown } from './StandaloneDropdown'
import { SearchBar } from '../search/SearchBar'
import { useAuth } from '../../app/lib/auth-context'
import {
  Home,
  Bookmark,
  Search,
  Menu,
  X
} from 'lucide-react'

export function Navbar() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'My List', href: '/mylist', icon: Bookmark },
    { name: 'Search', href: '/search', icon: Search },
  ]

  return (
    <>
      <nav className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[96%] sm:w-[95%] max-w-7xl px-2 sm:px-0">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl px-3 sm:px-6 lg:px-8 py-3 sm:py-4 overflow-visible transition-all duration-300">
          <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
            {/* Logo Section - Responsive */}
            <Link href="/dashboard" className="flex items-center flex-shrink-0">
              <Image 
                src="/assets/logo/AnimeSenpai_Inline.svg" 
                alt="AnimeSenpai" 
                width={450}
                height={112}
                className="h-8 sm:h-12 lg:h-14 w-auto invert"
                priority
              />
            </Link>

            {/* Navigation Items - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
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
            <div className="hidden sm:block flex-1 max-w-xs lg:max-w-sm xl:max-w-md transition-all duration-300">
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
                <StandaloneDropdown
                  user={{
                    id: user.id,
                    name: user.username || user.name || 'User',
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role
                  }}
                />
              ) : (
                <div className="hidden sm:block">
                  <GuestAuth />
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Slide down */}
      {isMobileMenuOpen && (
        <div className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-40 w-[96%] sm:w-[95%] max-w-7xl px-2 sm:px-0 lg:hidden">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            {/* Mobile Search */}
            <div className="mb-4 sm:hidden">
              <SearchBar
                placeholder="Search anime..."
                showDropdown={true}
                size="sm"
                variant="navbar"
              />
            </div>

            {/* Mobile Navigation */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 text-base font-medium"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>

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
