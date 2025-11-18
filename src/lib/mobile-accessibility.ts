/**
 * Mobile Accessibility Utilities
 * Enhance accessibility for mobile devices
 */

'use client'

import { useEffect, useState, useRef } from 'react'

/**
 * Verify touch target size meets WCAG 2.1 AA requirements (44x44px minimum)
 */
export function verifyTouchTargetSize(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  const minSize = 44 // WCAG 2.1 AA minimum
  
  return rect.width >= minSize && rect.height >= minSize
}

/**
 * Ensure all interactive elements meet minimum touch target size
 */
export function ensureTouchTargetSizes(): void {
  if (typeof window === 'undefined') return

  const interactiveElements = document.querySelectorAll<HTMLElement>(
    'button, a, input[type="button"], input[type="submit"], [role="button"], [tabindex="0"]'
  )

  interactiveElements.forEach((element) => {
    const rect = element.getBoundingClientRect()
    const minSize = 44

    if (rect.width < minSize || rect.height < minSize) {
      const currentStyle = window.getComputedStyle(element)
      const paddingX = parseFloat(currentStyle.paddingLeft) + parseFloat(currentStyle.paddingRight)
      const paddingY = parseFloat(currentStyle.paddingTop) + parseFloat(currentStyle.paddingBottom)

      // Add padding to meet minimum size
      const neededX = Math.max(0, minSize - rect.width + paddingX)
      const neededY = Math.max(0, minSize - rect.height + paddingY)

      if (neededX > 0 || neededY > 0) {
        element.style.padding = `${Math.max(parseFloat(currentStyle.paddingTop), neededY / 2)}px ${Math.max(parseFloat(currentStyle.paddingRight), neededX / 2)}px ${Math.max(parseFloat(currentStyle.paddingBottom), neededY / 2)}px ${Math.max(parseFloat(currentStyle.paddingLeft), neededX / 2)}px`
      }
    }
  })
}

/**
 * Hook for managing focus on mobile
 */
export function useMobileFocusManagement() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const activeElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        setIsKeyboardVisible(true)
        activeElementRef.current = target
        
        // Scroll input into view on mobile
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
      }
    }

    const handleBlur = () => {
      setIsKeyboardVisible(false)
      activeElementRef.current = null
    }

    document.addEventListener('focusin', handleFocus)
    document.addEventListener('focusout', handleBlur)

    return () => {
      document.removeEventListener('focusin', handleFocus)
      document.removeEventListener('focusout', handleBlur)
    }
  }, [])

  return {
    isKeyboardVisible,
    activeElement: activeElementRef.current,
  }
}

/**
 * Hook for screen reader announcements on mobile
 */
export function useScreenReaderAnnouncement() {
  const [announcement, setAnnouncement] = useState<string>('')

  useEffect(() => {
    if (!announcement) return

    const announcementElement = document.createElement('div')
    announcementElement.setAttribute('role', 'status')
    announcementElement.setAttribute('aria-live', 'polite')
    announcementElement.setAttribute('aria-atomic', 'true')
    announcementElement.className = 'sr-only'
    announcementElement.textContent = announcement

    document.body.appendChild(announcementElement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcementElement)
      setAnnouncement('')
    }, 1000)

    return () => {
      if (document.body.contains(announcementElement)) {
        document.body.removeChild(announcementElement)
      }
    }
  }, [announcement])

  return {
    announce: setAnnouncement,
  }
}

/**
 * Ensure proper ARIA labels for touch interactions
 */
export function enhanceTouchAccessibility(element: HTMLElement): void {
  // Add aria-label if missing and element has text content
  if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
    const textContent = element.textContent?.trim()
    if (textContent) {
      element.setAttribute('aria-label', textContent)
    }
  }

  // Ensure touch targets have proper roles
  if (element.tagName === 'DIV' && element.onclick) {
    element.setAttribute('role', 'button')
    element.setAttribute('tabindex', '0')
  }
}

/**
 * Hook for keyboard navigation on mobile
 */
export function useMobileKeyboardNavigation() {
  const [isKeyboardMode, setIsKeyboardMode] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect keyboard usage
      if (e.key === 'Tab' || e.key.startsWith('Arrow')) {
        setIsKeyboardMode(true)
      }
    }

    const handleTouchStart = () => {
      setIsKeyboardMode(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('touchstart', handleTouchStart)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('touchstart', handleTouchStart)
    }
  }, [])

  return isKeyboardMode
}

/**
 * Verify color contrast meets WCAG AA standards
 */
export function verifyColorContrast(
  foreground: string,
  background: string
): { passes: boolean; ratio: number } {
  // Simplified contrast calculation
  // In production, use a proper contrast calculation library
  const getLuminance = (color: string): number => {
    // Simplified - would need proper RGB parsing
    return 0.5 // Placeholder
  }

  const fgLum = getLuminance(foreground)
  const bgLum = getLuminance(background)

  const ratio =
    (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05)

  return {
    passes: ratio >= 4.5, // WCAG AA standard for normal text
    ratio,
  }
}

/**
 * Ensure all images have alt text
 */
export function ensureImageAltText(): void {
  if (typeof window === 'undefined') return

  const images = document.querySelectorAll<HTMLImageElement>('img')

  images.forEach((img) => {
    if (!img.getAttribute('alt') && !img.getAttribute('aria-hidden')) {
      // If decorative, mark as such
      if (img.getAttribute('role') === 'presentation') {
        img.setAttribute('alt', '')
      } else {
        // Try to infer from context or mark as needing alt text
        console.warn('Image missing alt text:', img.src)
      }
    }
  })
}

/**
 * Hook for mobile accessibility checks
 */
export function useMobileAccessibility() {
  const [touchTargetsValid, setTouchTargetsValid] = useState(true)
  const [imagesHaveAlt, setImagesHaveAlt] = useState(true)

  useEffect(() => {
    // Run accessibility checks
    ensureTouchTargetSizes()
    ensureImageAltText()

    // Verify touch targets
    const interactiveElements = document.querySelectorAll<HTMLElement>(
      'button, a, [role="button"]'
    )
    const allValid = Array.from(interactiveElements).every(verifyTouchTargetSize)
    setTouchTargetsValid(allValid)

    // Verify images
    const images = document.querySelectorAll<HTMLImageElement>('img')
    const allHaveAlt = Array.from(images).every(
      (img) => img.getAttribute('alt') !== null || img.getAttribute('aria-hidden') === 'true'
    )
    setImagesHaveAlt(allHaveAlt)
  }, [])

  return {
    touchTargetsValid,
    imagesHaveAlt,
  }
}

