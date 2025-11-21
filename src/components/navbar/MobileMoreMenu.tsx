'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MobileDrawer } from '../ui/mobile-modal'
import { useAuth } from '../../app/lib/auth-context'
import { useHapticFeedback } from '../../hooks/use-haptic-feedback'
import {
  HelpCircle,
  Trophy,
  List,
  Users,
  User,
  Info,
  FileText,
  Lock,
} from 'lucide-react'

interface MobileMoreMenuProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
  badge?: number
  section?: string
  authOnly?: boolean
  adminOnly?: boolean
}

export function MobileMoreMenu({ isOpen, onClose }: MobileMoreMenuProps) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const haptic = useHapticFeedback()

  const handleItemClick = (item: MenuItem) => {
    haptic.selection()
    if (item.onClick) {
      item.onClick()
    }
    if (item.href) {
      router.push(item.href)
      onClose()
    }
  }

  // Quick Actions removed - these are now in AuthDrawer to match desktop
  const quickActions: MenuItem[] = []

  const secondaryNav: MenuItem[] = [
    {
      id: 'help',
      label: 'Help & Support',
      icon: <HelpCircle className="h-5 w-5" />,
      href: '/help',
    },
    {
      id: 'leaderboards',
      label: 'Leaderboards',
      icon: <Trophy className="h-5 w-5" />,
      href: '/leaderboards',
    },
    {
      id: 'lists',
      label: 'Public Lists',
      icon: <List className="h-5 w-5" />,
      href: '/lists',
    },
    {
      id: 'compare',
      label: 'Compare Users',
      icon: <Users className="h-5 w-5" />,
      href: '/compare',
      authOnly: true,
    },
  ]

  // Account items removed - these are now in AuthDrawer to match desktop
  const accountItems: MenuItem[] = []

  const appInfo: MenuItem[] = [
    {
      id: 'privacy',
      label: 'Privacy Policy',
      icon: <Lock className="h-5 w-5" />,
      href: '/privacy',
    },
    {
      id: 'terms',
      label: 'Terms of Service',
      icon: <FileText className="h-5 w-5" />,
      href: '/terms',
    },
    {
      id: 'about',
      label: 'About',
      icon: <Info className="h-5 w-5" />,
      href: '/help',
    },
  ]

  const guestActions: MenuItem[] = [
    {
      id: 'signin',
      label: 'Sign In',
      icon: <User className="h-5 w-5" />,
      href: '/auth/signin',
    },
    {
      id: 'signup',
      label: 'Sign Up',
      icon: <User className="h-5 w-5" />,
      href: '/auth/signup',
    },
  ]

  const filterItems = (items: MenuItem[]) => {
    return items.filter((item) => {
      if (item.authOnly && !isAuthenticated) return false
      if (item.adminOnly && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'owner')))
        return false
      return true
    })
  }

  const MoreMenuContent = () => {
    const displayIdentifier = user?.username || user?.email || 'User'
    const displayInitial = displayIdentifier.trim().charAt(0).toUpperCase()

    return (
      <div className="pb-4">
        {/* User Profile Card (if authenticated) */}
        {isAuthenticated && user && (
          <div className="px-4 py-4 mb-4 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={displayIdentifier}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{displayInitial}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-white truncate">{displayIdentifier}</p>
                <p className="text-sm text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Navigation Section */}
        {filterItems(secondaryNav).length > 0 && (
          <div className="mb-6">
            <div className="px-4 py-2 text-xs text-gray-400 font-medium uppercase tracking-wider">
              Explore
            </div>
            <div className="space-y-1">
              {filterItems(secondaryNav).map((item) => (
                <MenuItemButton key={item.id} item={item} onClick={() => handleItemClick(item)} />
              ))}
            </div>
          </div>
        )}

        {/* Guest Actions */}
        {!isAuthenticated && (
          <div className="mb-6">
            <div className="px-4 py-2 text-xs text-gray-400 font-medium uppercase tracking-wider">
              Get Started
            </div>
            <div className="space-y-1">
              {guestActions.map((item) => (
                <MenuItemButton key={item.id} item={item} onClick={() => handleItemClick(item)} />
              ))}
            </div>
          </div>
        )}

        {/* App Info Section */}
        <div className="mb-4">
          <div className="px-4 py-2 text-xs text-gray-400 font-medium uppercase tracking-wider">
            About
          </div>
          <div className="space-y-1">
            {appInfo.map((item) => (
              <MenuItemButton key={item.id} item={item} onClick={() => handleItemClick(item)} />
            ))}
          </div>
        </div>

        {/* Version Info */}
        <div className="px-4 py-2 text-xs text-gray-500 text-center">
          AnimeSenpai v1.0.0
        </div>
      </div>
    )
  }

  return (
    <MobileDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="More"
      className="max-h-[85vh]"
    >
      <MoreMenuContent />
    </MobileDrawer>
  )
}

interface MenuItemButtonProps {
  item: MenuItem
  onClick: () => void
}

function MenuItemButton({ item, onClick }: MenuItemButtonProps) {
  const isSignOut = item.id === 'signout'
  
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 ease-out text-base font-medium touch-manipulation min-h-[52px] group text-left ${
        isSignOut
          ? 'text-error-400 hover:text-white hover:bg-gradient-to-r hover:from-error-500/20 hover:to-error-600/20 active:bg-error-500/30'
          : 'text-gray-300 hover:text-white hover:bg-white/10 active:bg-white/15'
      }`}
      aria-label={item.label}
    >
      <div className={`flex-shrink-0 transition-colors duration-300 ${
        isSignOut ? 'text-error-400 group-hover:text-white' : 'text-gray-400 group-hover:text-white'
      }`}>
        {item.icon}
      </div>
      <span className="flex-1">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <div className="flex-shrink-0 min-w-[22px] h-5 bg-gradient-to-r from-error-500 to-error-600 rounded-full flex items-center justify-center border-2 border-gray-950 shadow-lg animate-pulse">
          <span className="text-[11px] font-bold text-white px-1">
            {item.badge > 9 ? '9+' : item.badge}
          </span>
        </div>
      )}
    </button>
  )
}

