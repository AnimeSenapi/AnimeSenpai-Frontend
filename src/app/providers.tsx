'use client'

import { ReactNode } from 'react'
import ThemeProvider from '../components/ThemeProvider'
import { ToastProvider } from '../lib/toast-context'
import { AuthProvider } from './lib/auth-context'
import { FavoritesProvider } from './lib/favorites-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
            {children}
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

