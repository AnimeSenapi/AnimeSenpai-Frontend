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
import {
  User,
  Settings,
  LogOut,
  Shield,
  ShieldCheck,
  Crown,
  ShieldAlert,
  Activity,
  MessageCircle,
  Trophy,
} from 'lucide-react'
import { useAuth } from '../../app/lib/auth-context'

interface StandaloneDropdownProps {
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    role?: string
  }
}

export function StandaloneDropdown({ user }: StandaloneDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState({ top: 0, right: 0 })
  const [avatarError, setAvatarError] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { signout } = useAuth()
  const router = useRouter()
  const displayName = user.name || user.email || 'User'
  const displayInitial = (displayName || 'U').trim().charAt(0).toUpperCase()

  // Get role badge configuration
  const getRoleBadge = () => {
    if (!user.role || user.role.toLowerCase() === 'user') return null

    const roleConfig: Record<
      string,
      { label: string; icon: typeof Shield; color: string; bgColor: string }
    > = {
      admin: {
        label: 'Admin',
        icon: Crown,
        color: 'text-yellow-300',
        bgColor: 'bg-yellow-500/20',
      },
      moderator: {
        label: 'Mod',
        icon: ShieldCheck,
        color: 'text-blue-300',
        bgColor: 'bg-blue-500/20',
      },
    }

    const config = roleConfig[user.role.toLowerCase()] || {
      label: user.role.charAt(0).toUpperCase() + user.role.slice(1),
      icon: Shield,
      color: 'text-primary-300',
      bgColor: 'bg-primary-500/20',
    }

    return config
  }

  const roleBadge = getRoleBadge()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 8, // 8px gap below the button
        right: window.innerWidth - rect.right, // Align with right edge of button
      })
    }
  }, [isOpen])

  if (!mounted) return null

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            ref={buttonRef}
            variant="ghost"
            className="relative h-9 w-9 rounded-full p-0 hover:bg-white/10 transition-all duration-200 focus:ring-2 focus:ring-brand-primary-400/50 overflow-hidden"
          >
            {user.avatar && !avatarError ? (
              <div className="relative w-full h-full rounded-full ring-2 ring-white/20 hover:ring-white/40 transition-all duration-200 overflow-hidden">
                <Image
                  src={user.avatar}
                  alt={displayName}
                  fill
                  className="object-cover rounded-full"
                  sizes="36px"
                  onError={() => setAvatarError(true)}
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center ring-2 ring-white/20 hover:ring-white/40 transition-all duration-200">
                <span className="text-white font-bold text-xs">{displayInitial}</span>
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>

      {/* Portal the dropdown content to document.body */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)}>
            <div
              className="fixed w-72 glass rounded-xl shadow-2xl border border-white/10 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
              style={{
                top: `${position.top}px`,
                right: `${position.right}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                  {user.avatar && !avatarError ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={user.avatar}
                        alt={displayName}
                        fill
                        className="object-cover"
                        sizes="40px"
                        onError={() => setAvatarError(true)}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{displayInitial}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none text-white truncate">
                        {displayName}
                      </p>
                      {roleBadge && (
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${roleBadge.bgColor}`}
                        >
                          <roleBadge.icon className={`h-2.5 w-2.5 ${roleBadge.color}`} />
                          <span className={roleBadge.color}>{roleBadge.label}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-none text-gray-400 mt-1 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <button
                    className="w-full text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-lg px-3 py-2.5 transition-all duration-200 flex items-center"
                    onClick={() => {
                      setIsOpen(false)
                      router.push('/user/profile')
                    }}
                  >
                    <User className="mr-3 h-4 w-4" />
                    <span className="text-sm">Profile</span>
                  </button>
                  <button
                    className="w-full text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-lg px-3 py-2.5 transition-all duration-200 flex items-center"
                    onClick={() => {
                      setIsOpen(false)
                      router.push('/activity')
                    }}
                  >
                    <Activity className="mr-3 h-4 w-4" />
                    <span className="text-sm">Activity Feed</span>
                  </button>
                  <button
                    className="w-full text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-lg px-3 py-2.5 transition-all duration-200 flex items-center"
                    onClick={() => {
                      setIsOpen(false)
                      router.push('/messages')
                    }}
                  >
                    <MessageCircle className="mr-3 h-4 w-4" />
                    <span className="text-sm">Messages</span>
                  </button>
                  <button
                    className="w-full text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-lg px-3 py-2.5 transition-all duration-200 flex items-center"
                    onClick={() => {
                      setIsOpen(false)
                      router.push('/achievements')
                    }}
                  >
                    <Trophy className="mr-3 h-4 w-4" />
                    <span className="text-sm">Achievements</span>
                  </button>
                  {user.role === 'admin' && (
                    <>
                      <div className="border-t border-white/10 my-2"></div>
                      <button
                        className="w-full text-left text-yellow-300 hover:text-white hover:bg-gradient-to-r hover:from-yellow-500/20 hover:to-yellow-600/20 rounded-lg px-3 py-2.5 transition-all duration-200 flex items-center font-medium group"
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
                    className="w-full text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-lg px-3 py-2.5 transition-all duration-200 flex items-center"
                    onClick={() => {
                      setIsOpen(false)
                      router.push('/user/settings')
                    }}
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    <span className="text-sm">Settings</span>
                  </button>
                  <button
                    className="w-full text-left text-error-400 hover:text-white hover:bg-gradient-to-r hover:from-error-500 hover:to-error-600 rounded-lg px-3 py-2.5 transition-all duration-200 flex items-center group shadow-none hover:shadow-lg hover:shadow-error-500/30 font-medium"
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
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
