import {
  Home,
  Bookmark,
  Search,
  User,
  Compass,
  Calendar,
  Bell,
  Activity,
  MessageSquare,
  HelpCircle,
  Trophy,
  Award,
  List,
  Users,
  Settings,
  Shield,
  LogOut,
  Info,
  FileText,
  Lock,
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'

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
 * Primary navigation items - shown in top navbar (desktop) and bottom nav (mobile)
 */
export const PRIMARY_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'home',
    name: 'Home',
    label: 'Home',
    href: '/dashboard',
    icon: Home,
    activePatterns: ['/dashboard', '/'],
    showInDesktop: true,
    showInMobile: true,
    showInBottomNav: true,
  },
  {
    id: 'discover',
    name: 'Discover',
    label: 'Discover',
    href: '/discover',
    icon: Compass,
    activePatterns: ['/discover'],
    showInDesktop: false, // Not in desktop top nav, but in bottom nav
    showInMobile: true,
    showInBottomNav: true,
  },
  {
    id: 'search',
    name: 'Search',
    label: 'Search',
    href: '/search',
    icon: Search,
    activePatterns: ['/search'],
    showInDesktop: true,
    showInMobile: true,
    showInBottomNav: true,
  },
  {
    id: 'mylist',
    name: 'My List',
    label: 'My List',
    href: '/mylist',
    icon: Bookmark,
    activePatterns: ['/mylist'],
    authOnly: true,
    showInDesktop: true,
    showInMobile: true,
    showInBottomNav: true,
  },
  {
    id: 'profile',
    name: 'Profile',
    label: 'Profile',
    href: '/user/profile',
    icon: User,
    activePatterns: ['/user/profile', '/user/settings'],
    authOnly: true,
    showInDesktop: false, // Profile is in dropdown, not top nav
    showInMobile: false, // Profile is in AuthDrawer, not nav
    showInBottomNav: false, // Profile is in AuthDrawer, not bottom nav
  },
]

/**
 * Quick actions - shown in mobile more menu
 */
export const QUICK_ACTIONS: NavItemConfig[] = [
  {
    id: 'calendar',
    name: 'Calendar',
    label: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    activePatterns: ['/calendar'],
    authOnly: true,
    section: 'quick-actions',
  },
  {
    id: 'notifications',
    name: 'Notifications',
    label: 'Notifications',
    href: '/notifications',
    icon: Bell,
    activePatterns: ['/notifications'],
    authOnly: true,
    section: 'quick-actions',
  },
  {
    id: 'activity',
    name: 'Activity Feed',
    label: 'Activity Feed',
    href: '/activity',
    icon: Activity,
    activePatterns: ['/activity'],
    authOnly: true,
    section: 'quick-actions',
  },
  {
    id: 'messages',
    name: 'Messages',
    label: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    activePatterns: ['/messages'],
    authOnly: true,
    section: 'quick-actions',
  },
]

/**
 * Secondary navigation items - shown in mobile more menu
 */
export const SECONDARY_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'help',
    name: 'Help & Support',
    label: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
    activePatterns: ['/help'],
    section: 'explore',
  },
  {
    id: 'leaderboards',
    name: 'Leaderboards',
    label: 'Leaderboards',
    href: '/leaderboards',
    icon: Trophy,
    activePatterns: ['/leaderboards'],
    section: 'explore',
  },
  {
    id: 'achievements',
    name: 'Achievements',
    label: 'Achievements',
    href: '/achievements',
    icon: Award,
    activePatterns: ['/achievements'],
    authOnly: true,
    section: 'explore',
  },
  {
    id: 'lists',
    name: 'Public Lists',
    label: 'Public Lists',
    href: '/lists',
    icon: List,
    activePatterns: ['/lists'],
    section: 'explore',
  },
  {
    id: 'compare',
    name: 'Compare Users',
    label: 'Compare Users',
    href: '/compare',
    icon: Users,
    activePatterns: ['/compare'],
    authOnly: true,
    section: 'explore',
  },
]

/**
 * Account items - shown in mobile more menu and desktop dropdown
 */
export const ACCOUNT_ITEMS: NavItemConfig[] = [
  {
    id: 'profile-menu',
    name: 'Profile',
    label: 'Profile',
    href: '/user/profile',
    icon: User,
    activePatterns: ['/user/profile'],
    authOnly: true,
    section: 'account',
  },
  {
    id: 'settings',
    name: 'Settings',
    label: 'Settings',
    href: '/user/settings',
    icon: Settings,
    activePatterns: ['/user/settings'],
    authOnly: true,
    section: 'account',
  },
  {
    id: 'admin',
    name: 'Admin Panel',
    label: 'Admin Panel',
    href: '/admin',
    icon: Shield,
    activePatterns: ['/admin'],
    authOnly: true,
    adminOnly: true,
    section: 'account',
  },
]

/**
 * App info items - shown in mobile more menu footer
 */
export const APP_INFO_ITEMS: NavItemConfig[] = [
  {
    id: 'privacy',
    name: 'Privacy Policy',
    label: 'Privacy Policy',
    href: '/privacy',
    icon: Lock,
    activePatterns: ['/privacy'],
    section: 'about',
  },
  {
    id: 'terms',
    name: 'Terms of Service',
    label: 'Terms of Service',
    href: '/terms',
    icon: FileText,
    activePatterns: ['/terms'],
    section: 'about',
  },
  {
    id: 'about',
    name: 'About',
    label: 'About',
    href: '/help',
    icon: Info,
    activePatterns: ['/help'],
    section: 'about',
  },
]

/**
 * Guest actions - shown when user is not authenticated
 */
export const GUEST_ACTIONS: NavItemConfig[] = [
  {
    id: 'signin',
    name: 'Sign In',
    label: 'Sign In',
    href: '/auth/signin',
    icon: User,
    activePatterns: ['/auth/signin'],
    section: 'get-started',
  },
  {
    id: 'signup',
    name: 'Sign Up',
    label: 'Sign Up',
    href: '/auth/signup',
    icon: User,
    activePatterns: ['/auth/signup'],
    section: 'get-started',
  },
]

/**
 * Helper function to filter navigation items based on authentication and admin status
 */
export function filterNavItems(
  items: NavItemConfig[],
  isAuthenticated: boolean,
  isAdmin: boolean = false
): NavItemConfig[] {
  return items.filter((item) => {
    if (item.authOnly && !isAuthenticated) return false
    if (item.adminOnly && (!isAuthenticated || !isAdmin)) return false
    return true
  })
}

/**
 * Get navigation items for desktop top navbar
 */
export function getDesktopNavItems(isAuthenticated: boolean): NavItemConfig[] {
  return filterNavItems(
    PRIMARY_NAV_ITEMS.filter((item) => item.showInDesktop),
    isAuthenticated
  )
}

/**
 * Get navigation items for mobile bottom navigation
 */
export function getBottomNavItems(isAuthenticated: boolean): NavItemConfig[] {
  return filterNavItems(
    PRIMARY_NAV_ITEMS.filter((item) => item.showInBottomNav),
    isAuthenticated
  )
}

/**
 * Get navigation items for mobile horizontal navbar
 */
export function getMobileNavItems(isAuthenticated: boolean): NavItemConfig[] {
  return filterNavItems(
    PRIMARY_NAV_ITEMS.filter((item) => item.showInMobile && item.id !== 'profile'),
    isAuthenticated
  )
}

/**
 * Check if a pathname matches any active pattern for a nav item
 */
export function isNavItemActive(item: NavItemConfig, pathname: string | null): boolean {
  if (!pathname) return false
  return item.activePatterns.some((pattern) => pathname.startsWith(pattern))
}

