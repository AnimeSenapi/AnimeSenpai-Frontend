'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { SearchBar } from '../search/SearchBar'
import { useAuth } from '../../app/lib/auth-context'
import { Home, Bookmark, Search } from 'lucide-react'

interface MobileNavigationDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNavigationDrawer({ isOpen, onClose }: MobileNavigationDrawerProps) {
  const { isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'My List', href: '/mylist', icon: Bookmark, authOnly: true },
    { name: 'Search', href: '/search', icon: Search },
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Mobile navigation content - focused on navigation only
  const MobileNavigationContent = () => (
    <div className="p-4">
      {/* Mobile Search */}
      <div className="sm:hidden mb-4" role="search" aria-label="Search anime">
        <SearchBar
          placeholder="Search anime..."
          showDropdown={true}
          size="sm"
          variant="navbar"
          dropdownDirection="up"
          renderDropdownOutside={true}
        />
      </div>

      {/* Mobile Navigation */}
      <nav className="space-y-2" aria-label="Mobile menu navigation">
        {navItems
          .filter((item) => !item.authOnly || isAuthenticated)
          .map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-4 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all duration-200 text-base font-medium touch-manipulation min-h-[48px] group"
                aria-label={`Go to ${item.name}`}
              >
                <Icon
                  className="h-5 w-5 group-hover:scale-110 transition-transform"
                  aria-hidden="true"
                />
                <span>{item.name}</span>
              </Link>
            )
          })}
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile Drawer - Following StandaloneDropdown pattern */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9998]" onClick={onClose}>
            <div
              className="fixed inset-x-0 bottom-0 z-[9999] bg-gray-900 border-t border-white/10 rounded-t-2xl shadow-2xl h-[50vh] overflow-hidden animate-in slide-in-from-bottom-2 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle */}
              <div className="flex justify-center py-3">
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-4 pb-3 border-b border-white/10">
                <h3 className="text-lg font-bold text-white text-center">Navigation</h3>
              </div>

              {/* Content */}
              <div className="overflow-y-auto h-[calc(50vh-80px)] safe-area-bottom">
                <MobileNavigationContent />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
