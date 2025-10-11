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
  Search
} from 'lucide-react'

export function Navbar() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'My List', href: '/mylist', icon: Bookmark },
    { name: 'Search', href: '/search', icon: Search },
  ]

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-4 overflow-visible transition-all duration-300">
        <div className="flex items-center justify-between gap-6">
          {/* Logo Section */}
          <Link href="/dashboard" className="flex items-center flex-shrink-0">
            <Image 
              src="/assets/logo/AnimeSenpai_Inline.svg" 
              alt="AnimeSenpai" 
              width={450}
              height={112}
              className="h-16 w-auto invert"
              priority
            />
          </Link>

          {/* Navigation Items - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Enhanced Search Bar with navbar variant */}
          <div className="w-56 transition-all duration-300">
            <SearchBar
              placeholder="Search..."
              showDropdown={true}
              size="sm"
              variant="navbar"
            />
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
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
              <GuestAuth />
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
