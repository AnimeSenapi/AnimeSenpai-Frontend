'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

function moveFocusToMainOrHeading() {
  // Prefer the first visible H1
  const h1 = document.querySelector('main h1, h1') as HTMLElement | null
  if (h1) {
    const prevTabIndex = h1.getAttribute('tabindex')
    if (prevTabIndex === null) h1.setAttribute('tabindex', '-1')
    h1.focus({ preventScroll: false })
    // Cleanup temporary tabindex after focus
    if (prevTabIndex === null) {
      const onBlur = () => {
        h1.removeAttribute('tabindex')
        h1.removeEventListener('blur', onBlur)
      }
      h1.addEventListener('blur', onBlur)
    }
    return true
  }
  // Fallback to #main-content landmark
  const main = document.getElementById('main-content') as HTMLElement | null
  if (main) {
    const prevTabIndex = main.getAttribute('tabindex')
    if (prevTabIndex === null) main.setAttribute('tabindex', '-1')
    main.focus({ preventScroll: false })
    if (prevTabIndex === null) {
      const onBlur = () => {
        main.removeAttribute('tabindex')
        main.removeEventListener('blur', onBlur)
      }
      main.addEventListener('blur', onBlur)
    }
    return true
  }
  return false
}

export function useRouteA11y() {
  const pathname = usePathname()
  const [announcement, setAnnouncement] = useState<string>('')
  const titleRef = useRef<string>('')

  useEffect(() => {
    // Defer until next paint to allow DOM updates after navigation
    const id = window.requestAnimationFrame(() => {
      moveFocusToMainOrHeading()
      const h1 = document.querySelector('main h1, h1')
      const pageTitle = (h1?.textContent || document.title || '').trim()
      if (pageTitle && pageTitle !== titleRef.current) {
        titleRef.current = pageTitle
        setAnnouncement(pageTitle)
      }
    })
    return () => window.cancelAnimationFrame(id)
  }, [pathname])

  return { announcement }
}

/**
 * RouteAnnouncer renders a polite live region that announces page title on route changes.
 */
export function RouteAnnouncer() {
  const { announcement } = useRouteA11y()
  return (
    <div
      aria-live="polite"
      role="status"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  )
}


