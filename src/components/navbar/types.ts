import { LucideIcon } from 'lucide-react'

/**
 * Navigation item configuration interface
 */
export interface NavItemConfig {
  id: string
  name: string
  label: string
  href: string
  icon: LucideIcon
  activePatterns: string[]
  authOnly?: boolean
  adminOnly?: boolean
  badge?: number | (() => Promise<number>)
  showInDesktop?: boolean
  showInMobile?: boolean
  showInBottomNav?: boolean
  section?: string
}

/**
 * Navigation item props for rendering
 */
export interface NavItemProps {
  item: NavItemConfig
  isActive: boolean
  onClick?: () => void
  variant?: 'desktop' | 'mobile-icon' | 'mobile-full'
  className?: string
}

/**
 * Navbar component props
 */
export interface NavbarProps {
  className?: string
}

/**
 * Mobile nav items container props
 */
export interface MobileNavItemsProps {
  items: NavItemConfig[]
  pathname: string | null
  variant?: 'compact'
  className?: string
}

/**
 * Navbar logo props
 */
export interface NavbarLogoProps {
  className?: string
}

/**
 * Navbar search props
 */
export interface NavbarSearchProps {
  onSearchClick: () => void
  className?: string
}

/**
 * Navbar auth props
 */
export interface NavbarAuthProps {
  className?: string
}

