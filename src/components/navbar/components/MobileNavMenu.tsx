'use client'

import { memo } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '../../../app/lib/utils'

interface MobileNavMenuProps {
  isOpen: boolean
  onToggle: () => void
  className?: string
}

/**
 * Mobile Navigation Menu Button (Hamburger)
 * Opens/closes the mobile navigation drawer
 */
export const MobileNavMenu = memo(function MobileNavMenu({
  isOpen,
  onToggle,
  className,
}: MobileNavMenuProps) {
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
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-nav-drawer"
    >
      {isOpen ? (
        <X className="h-5 w-5 transition-transform duration-200" />
      ) : (
        <Menu className="h-5 w-5 transition-transform duration-200" />
      )}
    </button>
  )
})

