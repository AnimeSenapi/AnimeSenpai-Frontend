'use client'

import { ReactNode } from 'react'
import ThemeProvider from '../components/ThemeProvider'
import { ToastProvider } from '../components/ui/toast'
import { AuthProvider } from './lib/auth-context'
import { FavoritesProvider } from './lib/favorites-context'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ChunkErrorHandler } from '../components/ChunkErrorHandler'
import { StatusBadgeController } from '@/components/StatusBadgeController'
import { RouteAnnouncer } from '@/hooks/useRouteA11y'
import { NavbarDrawerProvider } from '../components/navbar/navbar-drawer-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ChunkErrorHandler />
      {/* Global status badge (dynamic from backend, silent if unavailable) */}
      <StatusBadgeController />
      {/* Route change announcements for screen readers */}
      <RouteAnnouncer />
      <ThemeProvider>
        <ToastProvider position="bottom-right" maxToasts={3}>
          <AuthProvider>
            <FavoritesProvider>
              <NavbarDrawerProvider>
                {children}
              </NavbarDrawerProvider>
            </FavoritesProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
