'use client'

import { memo } from 'react'
import { User } from 'lucide-react'
import { GuestAuth } from '../GuestAuth'
import { StandaloneDropdown } from '../StandaloneDropdown'
import { NotificationsDropdown } from '../NotificationsDropdown'
import { useAuth } from '../../../app/lib/auth-context'
import { useNavbarDrawers } from '../navbar-drawer-context'
import { NavbarAuthProps } from '../types'
import { cn } from '../../../app/lib/utils'

/**
 * Navbar Auth Component
 * Handles authentication UI for desktop and mobile
 */
export const NavbarAuth = memo(function NavbarAuth({ className }: NavbarAuthProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const { isAuthDrawerOpen, setIsAuthDrawerOpen } = useNavbarDrawers()

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-1 sm:gap-3 flex-shrink-0', className)}>
        <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse" />
      </div>
    )
  }

  if (isAuthenticated && user) {
    return (
      <div className={cn('flex items-center gap-1 sm:gap-3 flex-shrink-0', className)}>
        {/* Notifications Dropdown/Drawer - Desktop */}
        <div className="hidden sm:block">
          <NotificationsDropdown />
        </div>

        {/* Desktop User Dropdown */}
        <div className="hidden sm:block">
          <StandaloneDropdown
            user={{
              id: user.id,
              username: user.username || undefined,
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
              alt={user.username || user.email || 'User'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {(user.username || user.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </button>
      </div>
    )
  }

  // Guest user
  return (
    <div className={cn('flex items-center gap-1 sm:gap-3 flex-shrink-0', className)}>
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
    </div>
  )
})

