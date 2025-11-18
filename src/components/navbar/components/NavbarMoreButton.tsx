'use client'

import { memo } from 'react'
import { MoreVertical } from 'lucide-react'
import { NavbarMoreButtonProps } from '../types'
import { cn } from '../../../app/lib/utils'

/**
 * Navbar More Button Component
 * Triggers the mobile more menu drawer
 */
export const NavbarMoreButton = memo(function NavbarMoreButton({
  isOpen,
  onToggle,
  className,
}: NavbarMoreButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'lg:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 touch-manipulation active:scale-95',
        isOpen
          ? 'bg-primary-500/20 text-primary-400'
          : 'text-gray-300 hover:text-white hover:bg-white/10',
        className
      )}
      aria-label={isOpen ? 'Close more menu' : 'Open more menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-more-menu"
    >
      <MoreVertical className="h-5 w-5" />
    </button>
  )
})

