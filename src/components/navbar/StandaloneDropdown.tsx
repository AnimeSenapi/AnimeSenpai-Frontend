'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { 
  User, 
  Settings, 
  LogOut, 
  Bookmark,
  Star
} from 'lucide-react'
import { useAuth } from '../../app/lib/auth-context'

interface StandaloneDropdownProps {
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

export function StandaloneDropdown({ user }: StandaloneDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { signout } = useAuth()
  const router = useRouter()
  const displayName = user.name || user.email || 'User'
  const displayInitial = (displayName || 'U').trim().charAt(0).toUpperCase()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 8, // 8px gap below the button
        right: window.innerWidth - rect.right // Align with right edge of button
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
            className="relative h-9 w-9 rounded-full p-0 hover:bg-white/10 transition-all duration-200 focus:ring-2 focus:ring-cyan-400/50"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-pink-400 rounded-full flex items-center justify-center ring-2 ring-white/20 hover:ring-white/40 transition-all duration-200">
              <span className="text-white font-bold text-xs">{displayInitial}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
      
      {/* Portal the dropdown content to document.body */}
      {isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9998]"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="fixed w-56 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-[9999]"
            style={{
              top: `${position.top}px`,
              right: `${position.right}px`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex flex-col space-y-1 mb-3">
                <p className="text-sm font-medium leading-none text-white">{displayName}</p>
                <p className="text-xs leading-none text-gray-400">{user.email}</p>
              </div>
              <div className="border-t border-white/10 mb-2"></div>
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
                    router.push('/mylist')
                  }}
                >
                  <Bookmark className="mr-3 h-4 w-4" />
                  <span className="text-sm">My List</span>
                </button>
                <button 
                  className="w-full text-left text-gray-300 hover:text-white hover:bg-white/10 rounded-lg px-3 py-2.5 transition-all duration-200 flex items-center"
                  onClick={() => {
                    setIsOpen(false)
                    router.push('/mylist?filter=favorites')
                  }}
                >
                  <Star className="mr-3 h-4 w-4" />
                  <span className="text-sm">Favorites</span>
                </button>
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
                  className="w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg px-3 py-2.5 transition-all duration-200 flex items-center"
                  onClick={() => {
                    setIsOpen(false)
                    signout()
                  }}
                >
                  <LogOut className="mr-3 h-4 w-4" />
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
