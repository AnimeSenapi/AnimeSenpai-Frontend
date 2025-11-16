'use client'

import { ReactNode } from 'react'
import ThemeProvider from '../components/ThemeProvider'
import { ToastProvider } from '../components/ui/toast'
import { AuthProvider } from './lib/auth-context'
import { FavoritesProvider } from './lib/favorites-context'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ChunkErrorHandler } from '../components/ChunkErrorHandler'
import { StatusBadgeController } from '@/components/StatusBadgeController'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ChunkErrorHandler />
      {/* Global status badge (dynamic from backend, silent if unavailable) */}
      <StatusBadgeController />
      <ThemeProvider>
        <ToastProvider position="bottom-right" maxToasts={3}>
          <AuthProvider>
            <FavoritesProvider>{children}</FavoritesProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
