'use client'

import { memo } from 'react'
import Link from 'next/link'
import type { MobileNavItemsProps } from '../types'
import { isNavItemActive } from '../nav-config'
import { useHapticFeedback } from '../../../hooks/use-haptic-feedback'
import { cn } from '../../../app/lib/utils'

/**
 * Mobile Navigation Items Component
 * Desktop-like compact horizontal navigation for mobile/tablet
 * Shows icons + labels in a clean row without scrolling
 * More compact spacing and sizing than desktop but same layout
 * Responsive: icons only on very small screens, icons+labels on larger screens
 */
export const MobileNavItems = memo(function MobileNavItems({
  items,
  pathname,
  variant = 'compact',
  className,
}: MobileNavItemsProps) {
  const haptic = useHapticFeedback()

  return (
    <div
      className={cn(
        'flex lg:hidden items-center gap-0.5 sm:gap-1 md:gap-1.5 flex-1 min-w-0 justify-center overflow-hidden',
        className
      )}
    >
      {items.map((item) => {
        const Icon = item.icon
        const isActive = isNavItemActive(item, pathname)
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => haptic.selection()}
            className={cn(
              'flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 md:px-2.5 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all duration-200 touch-manipulation active:scale-95 flex-shrink-0 min-h-[44px]',
              isActive && 'text-primary-400 bg-primary-500/20'
            )}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
          >
            <Icon className="h-4 w-4 sm:h-[15px] sm:w-[15px] flex-shrink-0" aria-hidden="true" />
            <span className="text-[11px] sm:text-xs font-medium whitespace-nowrap hidden sm:inline">
              {item.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
})
