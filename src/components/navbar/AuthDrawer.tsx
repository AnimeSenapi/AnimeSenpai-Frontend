'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MobileBottomSheet } from '../ui/MobileBottomSheet'
import { GuestAuth } from './GuestAuth'
import { NotificationsDropdown } from './NotificationsDropdown'
import { useAuth } from '../../app/lib/auth-context'
import { useHapticFeedback } from '../../hooks/use-haptic-feedback'
import { User, Settings, Shield, LogOut, Bell, ChevronRight, Activity, MessageCircle, Trophy, Calendar, Users } from 'lucide-react'
import { cn } from '../../app/lib/utils'

interface AuthDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthDrawer({ isOpen, onClose }: AuthDrawerProps) {
  const { isAuthenticated, user, signout } = useAuth()
  const router = useRouter()
  const haptic = useHapticFeedback()

  const handleSignOut = () => {
    haptic.medium()
    signout()
    onClose()
    router.push('/')
  }

  const handleLinkClick = () => {
    haptic.selection()
    onClose()
  }

  // Auth drawer content - handles user menu and auth buttons
  const AuthContent = () => {
    const displayIdentifier = user?.username || user?.email || 'User'
    const displayInitial = displayIdentifier.trim().charAt(0).toUpperCase()

    return (
      <div className="p-4 space-y-4">
        {/* Mobile User Menu */}
        {isAuthenticated && user && (
          <>
            {/* User Profile Card */}
            <div className="bg-gradient-to-br from-primary-500/20 via-primary-500/10 to-secondary-500/20 backdrop-blur-sm border border-primary-500/30 rounded-2xl p-5 shadow-lg shadow-primary-500/10">
              <div className="flex items-center gap-4">
                {user.avatar ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
                    <Image
                      src={user.avatar}
                      alt={displayIdentifier}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                    <span className="text-white font-bold text-2xl">{displayInitial}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-white truncate">{displayIdentifier}</p>
                  <p className="text-sm text-gray-300 truncate">{user.email}</p>
                  {user.role && (user.role === 'admin' || user.role === 'owner') && (
                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                      <Shield className="h-3 w-3 text-yellow-400" />
                      <span className="text-xs font-medium text-yellow-300 uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Menu Items - Matching Desktop Dropdown */}
            <div className="space-y-2">
              <Link
                href="/user/profile"
                onClick={handleLinkClick}
                className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-base font-medium touch-manipulation active:scale-[0.98] group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
                  <User className="h-5 w-5 text-primary-400" />
                </div>
                <span className="flex-1 text-white">Profile</span>
                <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-primary-400 transition-colors" />
              </Link>

              <Link
                href="/activity"
                onClick={handleLinkClick}
                className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-base font-medium touch-manipulation active:scale-[0.98] group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                  <Activity className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors" />
                </div>
                <span className="flex-1 text-white">Activity</span>
                <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-primary-400 transition-colors" />
              </Link>

              <Link
                href="/messages"
                onClick={handleLinkClick}
                className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-base font-medium touch-manipulation active:scale-[0.98] group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                  <MessageCircle className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors" />
                </div>
                <span className="flex-1 text-white">Messages</span>
                <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-primary-400 transition-colors" />
              </Link>

              <Link
                href="/achievements"
                onClick={handleLinkClick}
                className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-base font-medium touch-manipulation active:scale-[0.98] group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                  <Trophy className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors" />
                </div>
                <span className="flex-1 text-white">Achievements</span>
                <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-primary-400 transition-colors" />
              </Link>

              <Link
                href="/social/friends"
                onClick={handleLinkClick}
                className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-base font-medium touch-manipulation active:scale-[0.98] group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                  <Users className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors" />
                </div>
                <span className="flex-1 text-white">Friends</span>
                <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-primary-400 transition-colors" />
              </Link>

              <Link
                href="/calendar"
                onClick={handleLinkClick}
                className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-base font-medium touch-manipulation active:scale-[0.98] group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                  <Calendar className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors" />
                </div>
                <span className="flex-1 text-white">Calendar</span>
                <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-primary-400 transition-colors" />
              </Link>

              {(user.role === 'admin' || user.role === 'owner') && (
                <>
                  <div className="border-t border-white/10 my-2"></div>
                  <Link
                    href="/admin"
                    onClick={handleLinkClick}
                    className="flex items-center gap-4 px-5 py-4 rounded-xl bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/30 hover:bg-yellow-500/20 hover:border-yellow-500/40 transition-all duration-200 text-base font-medium touch-manipulation active:scale-[0.98] group shadow-lg shadow-yellow-500/10"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
                      <Shield className="h-5 w-5 text-yellow-400" />
                    </div>
                    <span className="flex-1 text-yellow-300 font-semibold">Admin Panel</span>
                    <ChevronRight className="h-5 w-5 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
                  </Link>
                </>
              )}

              <div className="border-t border-white/10 my-2"></div>

              <Link
                href="/user/settings"
                onClick={handleLinkClick}
                className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-base font-medium touch-manipulation active:scale-[0.98] group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                  <Settings className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors" />
                </div>
                <span className="flex-1 text-white">Settings</span>
                <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-primary-400 transition-colors" />
              </Link>
            </div>

            {/* Notifications Section */}
            <div className="pt-2 border-t border-white/10">
              <div className="px-1">
                <NotificationsDropdown />
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-xl bg-error-500/10 backdrop-blur-sm border border-error-500/30 hover:bg-error-500/20 hover:border-error-500/40 transition-all duration-200 text-base font-medium text-error-400 hover:text-error-300 touch-manipulation active:scale-[0.98] group shadow-lg shadow-error-500/10"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-error-500/20 border border-error-500/30 flex items-center justify-center group-hover:bg-error-500/30 transition-colors">
                <LogOut className="h-5 w-5 text-error-400" />
              </div>
              <span className="flex-1 text-left">Sign Out</span>
            </button>
          </>
        )}

        {/* Mobile Auth Buttons */}
        {!isAuthenticated && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-500/30">
                <User className="h-10 w-10 text-primary-400" />
              </div>
              <p className="text-lg font-semibold text-white mb-2">Welcome to AnimeSenpai</p>
              <p className="text-sm text-gray-400">
                Sign in to access your personalized anime list and more
              </p>
            </div>
            <GuestAuth onClose={onClose} variant="mobile" />
          </div>
        )}
      </div>
    )
  }

  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isAuthenticated ? 'Account' : 'Welcome'}
      className="max-h-[85vh]"
      snapPoints={['70vh', '85vh']}
    >
      <AuthContent />
    </MobileBottomSheet>
  )
}
