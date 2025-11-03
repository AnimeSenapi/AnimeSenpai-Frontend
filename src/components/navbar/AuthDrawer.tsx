'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { GuestAuth } from './GuestAuth'
import { NotificationsDropdown } from './NotificationsDropdown'
import { useAuth } from '../../app/lib/auth-context'
import { User, Settings, Shield } from 'lucide-react'

interface AuthDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthDrawer({ isOpen, onClose }: AuthDrawerProps) {
  const { isAuthenticated, user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Auth drawer content - handles user menu and auth buttons
  const AuthContent = () => (
    <div className="p-4">
      {/* Mobile User Menu */}
      {isAuthenticated && user && (
        <div>
          <div className="px-4 py-2 text-xs text-gray-400 font-medium uppercase tracking-wider">
            Account
          </div>
          <div className="px-4 py-2">
            <div className="flex items-center gap-3 mb-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username || user.name || 'User'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {(user.username || user.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-white truncate">
                  {user.username || user.name || 'User'}
                </p>
                <p className="text-sm text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/user/profile"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-4 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all duration-200 text-base font-medium touch-manipulation min-h-[48px]"
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <Link
                href="/user/settings"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-4 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all duration-200 text-base font-medium touch-manipulation min-h-[48px]"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              {(user.role === 'admin' || user.role === 'owner') && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-4 rounded-lg text-yellow-300 hover:text-white hover:bg-yellow-500/10 active:bg-yellow-500/15 transition-all duration-200 text-base font-medium touch-manipulation min-h-[48px]"
                >
                  <Shield className="h-5 w-5" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>
          </div>
          <div className="px-4 py-2 border-t border-white/10">
            <NotificationsDropdown />
          </div>
        </div>
      )}

      {/* Mobile Auth Buttons */}
      {!isAuthenticated && (
        <div>
          <GuestAuth onClose={onClose} />
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Auth Drawer - Following StandaloneDropdown pattern */}
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
                <h3 className="text-lg font-bold text-white text-center">
                  {isAuthenticated ? 'Account' : 'Sign In'}
                </h3>
              </div>

              {/* Content */}
              <div className="overflow-y-auto h-[calc(50vh-80px)] safe-area-bottom">
                <AuthContent />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
