/**
 * Focus Trap Component
 *
 * Traps focus within a container (e.g., modal, dialog)
 * WCAG 2.1 AA: 2.1.2 No Keyboard Trap (Level A)
 */

'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { trapFocus } from '@/lib/accessibility'

interface FocusTrapProps {
  children: ReactNode
  active?: boolean
  initialFocus?: React.RefObject<HTMLElement>
}

export function FocusTrap({ children, active = true, initialFocus }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const cleanup = trapFocus(containerRef.current)

    // Focus first element on mount
    if (initialFocus?.current) {
      initialFocus.current.focus()
    } else {
      const firstFocusable = containerRef.current.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
    }

    return cleanup
  }, [active, initialFocus])

  return (
    <div ref={containerRef} tabIndex={-1}>
      {children}
    </div>
  )
}
