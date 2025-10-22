/**
 * ⚡ Performance Utilities
 *
 * Helper functions to optimize frontend performance
 */

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Lazy load images when they enter viewport
 */
export function observeElement(
  element: Element,
  callback: () => void,
  options?: IntersectionObserverInit
): () => void {
  if (typeof window === 'undefined') return () => {}

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback()
          observer.unobserve(entry.target)
        }
      })
    },
    options || { threshold: 0.1 }
  )

  observer.observe(element)

  return () => observer.disconnect()
}

/**
 * Prefetch link on hover
 */
export function prefetchLink(href: string) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  document.head.appendChild(link)
}

/**
 * Measure performance
 */
export function measurePerformance(name: string, fn: () => void) {
  if (typeof window === 'undefined' || !window.performance) {
    fn()
    return
  }

  const start = performance.now()
  fn()
  const end = performance.now()

  console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`)
}

/**
 * Request animation frame wrapper
 */
export function requestAnimationFramePolyfill(callback: () => void) {
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    return window.requestAnimationFrame(callback)
  }
  return setTimeout(callback, 16)
}

/**
 * Optimize scroll performance
 */
export function useOptimizedScroll(callback: () => void, delay: number = 100) {
  if (typeof window === 'undefined') return

  let ticking = false

  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFramePolyfill(() => {
        callback()
        ticking = false
      })
      ticking = true
    }
  }

  return throttle(handleScroll, delay)
}
