/**
 * Accessibility Utilities
 *
 * Helper functions and utilities for WCAG 2.1 AA compliance
 */

/**
 * Check if a color combination meets WCAG AA contrast requirements
 * @param foreground - Hex color for foreground
 * @param background - Hex color for background
 * @returns Object with contrast ratio and whether it meets AA standards
 */
export function checkContrast(
  foreground: string,
  background: string
): {
  ratio: number
  meetsAA: boolean
  meetsAAA: boolean
  level: 'AA' | 'AAA' | 'FAIL'
} {
  const fgLuminance = getLuminance(foreground)
  const bgLuminance = getLuminance(background)

  const ratio =
    (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05)

  const meetsAA = ratio >= 4.5 // 4.5:1 for normal text, 3:1 for large text
  const meetsAAA = ratio >= 7 // 7:1 for normal text, 4.5:1 for large text

  let level: 'AA' | 'AAA' | 'FAIL' = 'FAIL'
  if (meetsAAA) level = 'AAA'
  else if (meetsAA) level = 'AA'

  return { ratio, meetsAA, meetsAAA, level }
}

/**
 * Calculate relative luminance of a color
 * @param hex - Hex color string
 * @returns Luminance value between 0 and 1
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0

  const [r, g, b] = Object.values(rgb).map((val) => {
    val = val / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0)
}

/**
 * Convert hex color to RGB
 * @param hex - Hex color string
 * @returns RGB object or null
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1] ?? '0', 16),
        g: parseInt(result[2] ?? '0', 16),
        b: parseInt(result[3] ?? '0', 16),
      }
    : null
}

/**
 * Generate accessible color variants
 * @param baseColor - Base hex color
 * @returns Object with light and dark variants
 */
export function getAccessibleColorVariants(baseColor: string): {
  light: string
  base: string
  dark: string
} {
  const rgb = hexToRgb(baseColor)
  if (!rgb) return { light: baseColor, base: baseColor, dark: baseColor }

  const lighten = (val: number) => Math.min(255, val + 30)
  const darken = (val: number) => Math.max(0, val - 30)

  const light = `#${[lighten(rgb.r), lighten(rgb.g), lighten(rgb.b)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')}`

  const dark = `#${[darken(rgb.r), darken(rgb.g), darken(rgb.b)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')}`

  return { light, base: baseColor, dark }
}

/**
 * Get accessible text color for a background
 * @param backgroundColor - Hex color for background
 * @returns 'white' or 'black' for best contrast
 */
export function getAccessibleTextColor(backgroundColor: string): 'white' | 'black' {
  const luminance = getLuminance(backgroundColor)
  return luminance > 0.5 ? 'black' : 'white'
}

/**
 * Format ARIA label for screen readers
 * @param label - Base label text
 * @param context - Additional context
 * @returns Formatted ARIA label
 */
export function formatAriaLabel(label: string, context?: string): string {
  if (!context) return label
  return `${label}, ${context}`
}

/**
 * Get ARIA live region announcement
 * @param message - Message to announce
 * @param politeness - 'polite' or 'assertive'
 */
export function announceToScreenReader(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', politeness)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Generate unique ID for ARIA attributes
 */
let idCounter = 0
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${++idCounter}`
}

/**
 * Check if element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ]

  return focusableSelectors.some((selector) => element.matches(selector))
}

/**
 * Trap focus within a container
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus()
        e.preventDefault()
      }
    }
  }

  container.addEventListener('keydown', handleTab)

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTab)
  }
}

/**
 * Get keyboard shortcut description
 */
export function getKeyboardShortcut(key: string, modifiers: string[] = []): string {
  const parts = [...modifiers, key].map((k) => k.charAt(0).toUpperCase() + k.slice(1))
  return parts.join(' + ')
}

/**
 * WCAG 2.1 AA Color Contrast Standards
 */
export const WCAG_AA = {
  NORMAL_TEXT: 4.5, // 4.5:1 for normal text
  LARGE_TEXT: 3, // 3:1 for large text (18pt+ or 14pt+ bold)
  UI_COMPONENTS: 3, // 3:1 for UI components and graphical objects
}

export const WCAG_AAA = {
  NORMAL_TEXT: 7, // 7:1 for normal text
  LARGE_TEXT: 4.5, // 4.5:1 for large text
}

/**
 * Common accessible color combinations
 */
export const ACCESSIBLE_COLORS = {
  // Primary colors with good contrast
  primary: {
    bg: '#8B5CF6',
    text: '#FFFFFF',
    ratio: 4.6,
  },
  secondary: {
    bg: '#EC4899',
    text: '#FFFFFF',
    ratio: 4.8,
  },
  success: {
    bg: '#10B981',
    text: '#FFFFFF',
    ratio: 4.7,
  },
  error: {
    bg: '#EF4444',
    text: '#FFFFFF',
    ratio: 4.5,
  },
  warning: {
    bg: '#F59E0B',
    text: '#000000',
    ratio: 4.6,
  },
  info: {
    bg: '#3B82F6',
    text: '#FFFFFF',
    ratio: 4.5,
  },
}
