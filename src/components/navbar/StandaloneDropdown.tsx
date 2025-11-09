'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { MobileDrawer } from '../ui/mobile-modal'
import {
  User,
  Settings,
  LogOut,
  ShieldAlert,
  Activity,
  MessageCircle,
  Trophy,
} from 'lucide-react'
import { getRoleConfig, getRoleIcon, getRoleBadgeClasses } from '../../lib/role-config'
import { useAuth } from '../../app/lib/auth-context'
import { useIsMobile } from '../../lib/use-mobile'

interface StandaloneDropdownProps {
  user: {
    id: string
    username?: string
    email: string
    avatar?: string
    role?: string
  }
}

export function StandaloneDropdown({ user }: StandaloneDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [avatarError, setAvatarError] = useState(false)
  const [isPositioned, setIsPositioned] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { signout } = useAuth()
  const router = useRouter()
  const isMobile = useIsMobile()
  const displayName = user.username || user.email || 'User'
  const displayInitial = (displayName || 'U').trim().charAt(0).toUpperCase()

  // Get role badge configuration
  const getRoleBadge = () => {
    if (!user.role || user.role.toLowerCase() === 'user') return null
    return getRoleConfig(user.role)
  }

  const roleBadge = getRoleBadge()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const dropdownWidth = 240 // w-60 = 15rem = 240px
      const dropdownHeight = 320 // Estimated height
      
      // Calculate position with mobile-friendly adjustments
      let left = rect.left
      let top = rect.bottom + 4
      
      // Ensure dropdown doesn't go off the right edge
      if (left + dropdownWidth > viewportWidth) {
        left = viewportWidth - dropdownWidth - 12 // 12px margin from edge
      }
      
      // Ensure dropdown doesn't go off the left edge
      if (left < 12) {
        left = 12
      }
      
      // If dropdown would go off bottom, position it above the button
      if (top + dropdownHeight > viewportHeight) {
        top = rect.top - dropdownHeight - 4
      }
      
      // Ensure dropdown doesn't go off the top
      if (top < 12) {
        top = 12
      }
      
      setPosition({
        top,
        left,
      })
      setIsPositioned(true)
    } else {
      setIsPositioned(false)
    }
  }, [isOpen])

  if (!mounted) return null

  // Mobile drawer content
  const UserMenuContent = () => (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
        {user.avatar && !avatarError ? (
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={user.avatar}
              alt={displayName}
              fill
              className="object-cover"
              sizes="32px"
              onError={() => setAvatarError(true)}
            />
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">{displayInitial}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-sm font-medium text-white truncate">
              {displayName}
            </p>
            {roleBadge && user.role && (
              <span className={getRoleBadgeClasses(user.role)}>
                {(() => {
                  const { IconComponent, className } = getRoleIcon(user.role!, 'h-2.5 w-2.5')
                  return <IconComponent className={className} />
                })()}
                <span>{roleBadge.label}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
      </div>
      <div className="space-y-1">
        <button
          className="w-full text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-md px-3 py-2 transition-all duration-150 flex items-center touch-manipulation min-h-[40px]"
          onClick={() => {
            setIsOpen(false)
            router.push('/user/profile')
          }}
        >
          <User className="mr-3 h-4 w-4" />
          <span className="text-sm">Profile</span>
        </button>
        <button
          className="w-full text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-md px-3 py-2 transition-all duration-150 flex items-center touch-manipulation min-h-[40px]"
          onClick={() => {
            setIsOpen(false)
            router.push('/activity')
          }}
        >
          <Activity className="mr-3 h-4 w-4" />
          <span className="text-sm">Activity</span>
        </button>
        <button
          className="w-full text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-md px-3 py-2 transition-all duration-150 flex items-center touch-manipulation min-h-[40px]"
          onClick={() => {
            setIsOpen(false)
            router.push('/messages')
          }}
        >
          <MessageCircle className="mr-3 h-4 w-4" />
          <span className="text-sm">Messages</span>
        </button>
        <button
          className="w-full text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-md px-3 py-2 transition-all duration-150 flex items-center touch-manipulation min-h-[40px]"
          onClick={() => {
            setIsOpen(false)
            router.push('/achievements')
          }}
        >
          <Trophy className="mr-3 h-4 w-4" />
          <span className="text-sm">Achievements</span>
        </button>
        {(user.role === 'admin' || user.role === 'owner') && (
          <>
            <div className="border-t border-white/10 my-2"></div>
            <button
              className="w-full text-left text-yellow-300 hover:text-white hover:bg-gradient-to-r hover:from-yellow-500/20 hover:to-yellow-600/20 rounded-md px-3 py-2 transition-all duration-150 flex items-center font-medium group touch-manipulation min-h-[40px]"
              onClick={() => {
                setIsOpen(false)
                router.push('/admin')
              }}
            >
              <ShieldAlert className="mr-3 h-4 w-4 group-hover:animate-pulse" />
              <span className="text-sm">Admin Panel</span>
            </button>
          </>
        )}
        <div className="border-t border-white/10 my-2"></div>
        <button
          className="w-full text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-md px-3 py-2 transition-all duration-150 flex items-center touch-manipulation min-h-[40px]"
          onClick={() => {
            setIsOpen(false)
            router.push('/user/settings')
          }}
        >
          <Settings className="mr-3 h-4 w-4" />
          <span className="text-sm">Settings</span>
        </button>
        <button
          className="w-full text-left text-error-400 hover:text-white hover:bg-gradient-to-r hover:from-error-500 hover:to-error-600 rounded-md px-3 py-2 transition-all duration-150 flex items-center group shadow-none hover:shadow-lg hover:shadow-error-500/30 font-medium touch-manipulation min-h-[40px]"
          onClick={() => {
            setIsOpen(false)
            signout()
          }}
        >
          <LogOut className="mr-3 h-4 w-4 group-hover:animate-pulse" />
          <span className="text-sm">Log out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        className="relative h-8 w-8 rounded-full p-0 hover:bg-white/10 transition-all duration-150 focus:ring-2 focus:ring-brand-primary-400/50 overflow-hidden"
        onClick={() => setIsOpen(true)}
      >
        {user.avatar && !avatarError ? (
          <div className="relative w-full h-full rounded-full ring-1 ring-white/20 hover:ring-white/40 transition-all duration-150 overflow-hidden">
            <Image
              src={user.avatar}
              alt={displayName}
              fill
              className="object-cover rounded-full"
              sizes="32px"
              onError={() => setAvatarError(true)}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center ring-1 ring-white/20 hover:ring-white/40 transition-all duration-150">
            <span className="text-white font-bold text-xs">{displayInitial}</span>
          </div>
        )}
      </Button>

      {/* Mobile Drawer */}
      {isMobile ? (
        <MobileDrawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="User Menu"
        >
          <UserMenuContent />
        </MobileDrawer>
      ) : (
        /* Desktop Dropdown */
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <div></div>
          </DropdownMenuTrigger>
        </DropdownMenu>
      )}

      {/* Desktop dropdown content */}
      {!isMobile && isOpen && isPositioned &&
        createPortal(
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)}>
            <div
              className="fixed w-60 max-w-[calc(100vw-24px)] glass rounded-lg shadow-xl border border-white/10 z-[9999] animate-in slide-in-from-top-2 fade-in duration-200"
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <UserMenuContent />
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
