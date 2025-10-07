'use client'

import { useEffect, useState } from 'react'
import { themes, defaultTheme, generateThemeVariables } from '../styles/theme.config'
import type { Theme } from '../styles/theme.config'

const THEME_STORAGE_KEY = 'animesenpai-theme'

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme)
  const [themeName, setThemeName] = useState<string>(defaultTheme.name)

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme && themes[savedTheme]) {
      applyTheme(savedTheme)
    }
  }, [])

  const applyTheme = (themeKey: string) => {
    const theme = themes[themeKey]
    if (!theme) return

    // Apply CSS variables
    const root = document.documentElement
    const variables = generateThemeVariables(theme)
    
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })

    // Update data-theme attribute
    root.setAttribute('data-theme', themeKey)
    
    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, themeKey)
    
    // Update state
    setCurrentTheme(theme)
    setThemeName(themeKey)
  }

  const switchTheme = (themeKey: string) => {
    applyTheme(themeKey)
  }

  const toggleTheme = () => {
    const themeKeys = Object.keys(themes)
    const currentIndex = themeKeys.indexOf(themeName)
    const nextIndex = (currentIndex + 1) % themeKeys.length
    applyTheme(themeKeys[nextIndex])
  }

  return {
    theme: currentTheme,
    themeName,
    availableThemes: themes,
    switchTheme,
    toggleTheme,
  }
}

