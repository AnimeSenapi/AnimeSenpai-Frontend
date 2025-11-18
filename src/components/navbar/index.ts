/**
 * Navbar Public Exports
 * Barrel file for clean imports
 */

export { Navbar, NavbarDrawersWrapper } from './navbar'
export { UnifiedNavigation } from './UnifiedNavigation'
export { NavbarDrawerProvider, useNavbarDrawers } from './navbar-drawer-context'

// Config exports
export {
  PRIMARY_NAV_ITEMS,
  QUICK_ACTIONS,
  SECONDARY_NAV_ITEMS,
  ACCOUNT_ITEMS,
  APP_INFO_ITEMS,
  GUEST_ACTIONS,
  getDesktopNavItems,
  getMobileNavItems,
  getBottomNavItems,
  filterNavItems,
  isNavItemActive,
} from './nav-config'

// Type exports
export type { NavItemConfig, NavbarProps, MobileNavItemsProps } from './types'

