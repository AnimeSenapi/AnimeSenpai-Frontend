'use client'

import { ReactNode } from 'react'
import ThemeProvider from '../components/ThemeProvider'
import { ToastProvider } from '../lib/toast-context'
import { AuthProvider } from './lib/auth-context'
import { FavoritesProvider } from './lib/favorites-context'
import { ErrorBoundary } from '../components/ErrorBoundary'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <FavoritesProvider>
              {children}
            </FavoritesProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

