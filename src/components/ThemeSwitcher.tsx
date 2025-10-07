'use client'

import { useTheme } from '@/lib/use-theme'
import { Palette } from 'lucide-react'
import { Button } from './ui/button'

export function ThemeSwitcher() {
  const { themeName, availableThemes, switchTheme } = useTheme()
  
  return (
    <div className="relative group">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">Theme</span>
      </Button>
      
      <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-popover)] border border-[var(--color-border)] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2 space-y-1">
          {Object.entries(availableThemes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => switchTheme(key)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                themeName === key
                  ? 'bg-primary-500 text-white'
                  : 'hover:bg-[var(--color-hover)] text-[var(--color-foreground)]'
              }`}
            >
              <div className="font-medium">{theme.displayName}</div>
              <div className="text-xs opacity-70">{theme.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

