'use client'

import { useEffect } from 'react'

/**
 * ThemeProvider - Applies the active theme to the entire app
 * 
 * The theme CSS variables are already defined in globals.css
 * This component ensures they're applied and can enable dynamic theme switching
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Theme variables are already in globals.css
    // This just ensures the data-theme attribute is set for any CSS selectors that need it
    if (typeof window !== 'undefined') {
      // Set default theme attribute
      document.documentElement.setAttribute('data-theme', 'darkwave')
      
      // Save to localStorage for persistence
      try {
        const savedTheme = localStorage.getItem('animesenpai-theme')
        if (savedTheme) {
          document.documentElement.setAttribute('data-theme', savedTheme)
        }
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [])

  return <>{children}</>
}

