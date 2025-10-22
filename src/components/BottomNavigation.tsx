'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, Bookmark, User, Compass } from 'lucide-react'
import { useIsMobile } from '../hooks/use-touch-gestures'
import { useEffect, useState } from 'react'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  activePatterns: string[]
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <Home className="h-5 w-5" />,
    href: '/dashboard',
    activePatterns: ['/dashboard', '/'],
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: <Compass className="h-5 w-5" />,
    href: '/discover',
    activePatterns: ['/discover'],
  },
  {
    id: 'search',
    label: 'Search',
    icon: <Search className="h-5 w-5" />,
    href: '/search',
    activePatterns: ['/search'],
  },
  {
    id: 'mylist',
    label: 'My List',
    icon: <Bookmark className="h-5 w-5" />,
    href: '/mylist',
    activePatterns: ['/mylist'],
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <User className="h-5 w-5" />,
    href: '/user/profile',
    activePatterns: ['/user/profile', '/user/settings'],
  },
]

/**
 * Bottom Navigation for Mobile
 * Thumb-friendly navigation at the bottom of the screen
 */
export function BottomNavigation() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    if (!isMobile) return

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide
        setIsVisible(false)
      } else {
        // Scrolling up - show
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isMobile])

  // Don't show on desktop
  if (!isMobile) {
    return null
  }

  // Don't show on auth pages
  if (pathname?.startsWith('/auth/')) {
    return null
  }

  const isActive = (item: NavItem) => {
    return item.activePatterns.some((pattern) => pathname === pattern)
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-20 md:hidden" />

      {/* Bottom Navigation */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Backdrop blur */}
        <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-xl border-t border-white/10" />

        {/* Navigation Items */}
        <div className="relative flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item)

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all min-w-[60px] ${
                  active
                    ? 'text-primary-400 bg-primary-500/10'
                    : 'text-gray-400 hover:text-white active:scale-95'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {active && (
                    <div className="absolute -inset-1 bg-primary-500/20 rounded-full blur-sm -z-10" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium transition-all ${
                    active ? 'text-primary-400' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

/**
 * Floating Action Button (FAB)
 * For primary mobile actions
 */
interface FABProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left'
}

export function FloatingActionButton({
  icon,
  label,
  onClick,
  position = 'bottom-right',
}: FABProps) {
  const isMobile = useIsMobile()

  if (!isMobile) {
    return null
  }

  const positions = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2',
    'bottom-left': 'bottom-20 left-4',
  }

  return (
    <button
      onClick={onClick}
      className={`fixed ${positions[position]} z-30 w-14 h-14 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center text-white`}
      aria-label={label}
      style={{
        marginBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {icon}
    </button>
  )
}
