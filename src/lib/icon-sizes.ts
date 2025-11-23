/**
 * Icon Size Standards
 * 
 * Standardized icon sizes for consistent UI across the application.
 * All icons should use these size constants for consistency.
 * 
 * Size Guide:
 * - xs: 12px (h-3 w-3) - Very small icons, inline text
 * - sm: 16px (h-4 w-4) - Small icons, buttons, badges
 * - md: 20px (h-5 w-5) - Medium icons, primary actions
 * - lg: 24px (h-6 w-6) - Large icons, featured actions
 * - xl: 32px (h-8 w-8) - Extra large icons, hero sections
 * - 2xl: 40px (h-10 w-10) - 2X large icons, prominent features
 */

export const ICON_SIZES = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
  '2xl': 'h-10 w-10',
} as const

export type IconSize = keyof typeof ICON_SIZES

/**
 * Standard stroke width for icons
 * - Default: 2 (most icons)
 * - Thin: 1.5 (small icons, decorative)
 * - Thick: 2.5 (large icons, emphasis)
 */
export const ICON_STROKE_WIDTHS = {
  thin: 1.5,
  default: 2,
  thick: 2.5,
} as const

export type IconStrokeWidth = keyof typeof ICON_STROKE_WIDTHS

/**
 * Get icon size classes
 */
export function getIconSize(size: IconSize = 'md'): string {
  return ICON_SIZES[size]
}

/**
 * Get icon stroke width
 */
export function getIconStrokeWidth(width: IconStrokeWidth = 'default'): number {
  return ICON_STROKE_WIDTHS[width]
}

/**
 * Icon size context recommendations:
 * 
 * - Buttons: sm (16px) for default buttons, md (20px) for large buttons
 * - Cards: md (20px) for primary actions, sm (16px) for secondary
 * - Navigation: sm (16px) for menu items
 * - Headers: md (20px) for section headers
 * - Hero sections: lg (24px) or xl (32px)
 * - Inline text: xs (12px) or sm (16px)
 * - Badges: xs (12px)
 * - Empty states: lg (24px) or xl (32px)
 */

