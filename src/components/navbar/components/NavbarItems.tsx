'use client'

import { memo } from 'react'
import Link from 'next/link'
import type { NavItemConfig } from '../types'
import { isNavItemActive } from '../nav-config'
import { cn } from '../../../app/lib/utils'

interface NavbarItemsProps {
  items: NavItemConfig[]
  pathname: string | null
  variant?: 'desktop' | 'mobile'
  className?: string
}

/**
 * Desktop Navigation Items Component
 * Renders navigation items for desktop view
 */
export const NavbarItems = memo(function NavbarItems({
  items,
  pathname,
  variant = 'desktop',
  className,
}: NavbarItemsProps) {
  if (variant === 'desktop') {
    return (
      <div className={cn('hidden lg:flex items-center gap-2', className)}>
        {items.map((item) => {
          const Icon = item.icon
          const isActive = isNavItemActive(item, pathname)
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-2 px-4 xl:px-5 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition-all duration-200"
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.name}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    )
  }

  return null
})

