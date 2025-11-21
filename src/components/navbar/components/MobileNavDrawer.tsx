'use client'

import { memo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MobileBottomSheet } from '../../ui/MobileBottomSheet'
import type { NavItemConfig } from '../types'
import { isNavItemActive } from '../nav-config'
import { useHapticFeedback } from '../../../hooks/use-haptic-feedback'
import { useNavbarDrawers } from '../navbar-drawer-context'
import { cn } from '../../../app/lib/utils'

interface MobileNavDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: NavItemConfig[]
  pathname: string | null
}

/**
 * Mobile Navigation Drawer
 * Beautiful drawer with navigation items in a vertical list
 * Opens from hamburger menu button
 * Completely different from desktop - optimized for mobile touch
 */
export const MobileNavDrawer = memo(function MobileNavDrawer({
  isOpen,
  onClose,
  items,
  pathname,
}: MobileNavDrawerProps) {
  const router = useRouter()
  const haptic = useHapticFeedback()
  const { setIsAuthDrawerOpen } = useNavbarDrawers()

  // Close other drawers when nav drawer opens
  useEffect(() => {
    if (isOpen) {
      setIsAuthDrawerOpen(false)
    }
  }, [isOpen, setIsAuthDrawerOpen])

  const handleItemClick = (item: NavItemConfig) => {
    haptic.selection()
    router.push(item.href)
    onClose()
  }

  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Menu"
      className="max-h-[85vh]"
      snapPoints={['70vh', '85vh']}
    >
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = isNavItemActive(item, pathname)
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
            className={cn(
              'w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 touch-manipulation text-left min-h-[56px] group',
              isActive
                ? 'bg-gradient-to-r from-primary-500/20 to-primary-500/10 text-primary-400 border border-primary-500/30 shadow-lg shadow-primary-500/10'
                : 'text-gray-300 hover:text-white hover:bg-white/10 active:bg-white/15 border border-white/5 hover:border-white/10'
            )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <div
                className={cn(
                  'flex-shrink-0 transition-all duration-200 p-2.5 rounded-xl',
                  isActive
                    ? 'text-primary-400 bg-primary-500/20 border border-primary-500/30'
                    : 'text-gray-400 group-hover:text-white group-hover:bg-white/10 border border-transparent group-hover:border-white/10'
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <span className="flex-1 text-base font-semibold">{item.label}</span>
              {isActive && (
                <div className="flex-shrink-0 w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
              )}
            </button>
          )
        })}
      </div>
    </MobileBottomSheet>
  )
})

