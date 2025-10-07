/**
 * DEPRECATED: Use theme.config.ts instead!
 * This file is kept for backward compatibility.
 * 
 * For easy theme creation, use: /src/styles/theme.config.ts
 */

// Re-export everything from theme.config for backward compatibility
export * from './theme.config'

// Legacy types (kept for compatibility)

export interface ThemeColors {
  // Brand colors
  primary: {
    400: string
    500: string
    600: string
  }
  secondary: {
    400: string
    500: string
    600: string
  }
  
  // Status colors
  success: {
    400: string
    500: string
    600: string
  }
  error: {
    400: string
    500: string
    600: string
  }
  warning: {
    400: string
    500: string
    600: string
  }
  info: {
    400: string
    500: string
    600: string
  }
  planning: {
    400: string
    500: string
    600: string
  }
  
  // UI Foundation
  background: string
  surface: string
  foreground: string
  mutedText: string
  
  // Component colors
  border: string
  inputBg: string
  hoverOverlay: string
  popoverBg: string
  
  // Optional
  accent?: {
    400: string
    500: string
    600: string
  }
  gray?: {
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
    950: string
  }
}

export interface Theme {
  name: string
  displayName: string
  description: string
  colors: ThemeColors
}

// DarkWave UI Theme (Default)
export const darkWaveTheme: Theme = {
  name: 'darkwave',
  displayName: 'DarkWave UI',
  description: 'Tailwind-inspired dark mode with vibrant accents. Optimized for OLED screens.',
  colors: {
    // Brand colors
    primary: {
      400: '#4fd1ff',
      500: '#00aaff',
      600: '#009cc7',
    },
    secondary: {
      400: '#d081bd',
      500: '#bd4894',
      600: '#9e3a7a',
    },
    
    // Status colors
    success: {
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
    },
    error: {
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
    },
    warning: {
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
    },
    info: {
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
    },
    planning: {
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
    },
    
    // UI Foundation
    background: '#121212',
    surface: '#1c1c1c',
    foreground: '#f4f4f4',
    mutedText: '#b4b4b4',
    
    // Component colors
    border: '#2d2d2d',
    inputBg: '#333333',
    hoverOverlay: '#000000aa',
    popoverBg: '#1e1e1e',
    
    // Optional
    accent: {
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
    },
    gray: {
      300: '#3d3d3d',
      400: '#4a4a4a',
      500: '#5a5a5a',
      600: '#6c6c6c',
      700: '#8a8a8a',
      800: '#a6a6a6',
      900: '#c2c2c2',
      950: '#e5e5e5',
    },
  },
}

// Neon Cyberpunk Theme (Original - kept for reference)
export const cyberpunkTheme: Theme = {
  name: 'cyberpunk',
  displayName: 'Neon Cyberpunk',
  description: 'Original cyberpunk theme with cyan and pink neon accents.',
  colors: {
    // Brand colors
    primary: {
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
    },
    secondary: {
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
    },
    
    // Status colors
    success: {
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
    },
    error: {
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
    },
    warning: {
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
    },
    info: {
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
    },
    planning: {
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
    },
    
    // UI Foundation
    background: '#000000',
    surface: '#111111',
    foreground: '#ffffff',
    mutedText: '#9ca3af',
    
    // Component colors
    border: '#1f2937',
    inputBg: '#1f2937',
    hoverOverlay: '#ffffff1a',
    popoverBg: '#1f2937',
    
    // Optional
    accent: {
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
    },
  },
}

// Available themes
export const themes: Record<string, Theme> = {
  darkwave: darkWaveTheme,
  cyberpunk: cyberpunkTheme,
}

// Default theme
export const defaultTheme = darkWaveTheme

// Helper to convert hex to RGB values for CSS variables
export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '0 0 0'
  
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  
  return `${r} ${g} ${b}`
}

// Generate CSS variables from theme
export function generateThemeVariables(theme: Theme): Record<string, string> {
  const { colors } = theme
  
  return {
    // Brand colors
    '--color-primary-400': colors.primary[400],
    '--color-primary-500': colors.primary[500],
    '--color-primary-600': colors.primary[600],
    '--color-secondary-400': colors.secondary[400],
    '--color-secondary-500': colors.secondary[500],
    '--color-secondary-600': colors.secondary[600],
    
    // Status colors
    '--color-success-400': colors.success[400],
    '--color-success-500': colors.success[500],
    '--color-success-600': colors.success[600],
    '--color-error-400': colors.error[400],
    '--color-error-500': colors.error[500],
    '--color-error-600': colors.error[600],
    '--color-warning-400': colors.warning[400],
    '--color-warning-500': colors.warning[500],
    '--color-warning-600': colors.warning[600],
    '--color-info-400': colors.info[400],
    '--color-info-500': colors.info[500],
    '--color-info-600': colors.info[600],
    '--color-planning-400': colors.planning[400],
    '--color-planning-500': colors.planning[500],
    '--color-planning-600': colors.planning[600],
    
    // UI Foundation
    '--color-background': colors.background,
    '--color-surface': colors.surface,
    '--color-foreground': colors.foreground,
    '--color-muted': colors.mutedText,
    
    // Component colors
    '--color-border': colors.border,
    '--color-input': colors.inputBg,
    '--color-hover': colors.hoverOverlay,
    '--color-popover': colors.popoverBg,
    
    // Optional
    ...(colors.accent && {
      '--color-accent-400': colors.accent[400],
      '--color-accent-500': colors.accent[500],
      '--color-accent-600': colors.accent[600],
    }),
    
    // Gray scale
    ...(colors.gray && {
      '--color-gray-300': colors.gray[300],
      '--color-gray-400': colors.gray[400],
      '--color-gray-500': colors.gray[500],
      '--color-gray-600': colors.gray[600],
      '--color-gray-700': colors.gray[700],
      '--color-gray-800': colors.gray[800],
      '--color-gray-900': colors.gray[900],
      '--color-gray-950': colors.gray[950],
    }),
  }
}

