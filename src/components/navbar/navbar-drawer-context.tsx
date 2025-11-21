'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface NavbarDrawerContextType {
  isAuthDrawerOpen: boolean
  setIsAuthDrawerOpen: (open: boolean) => void
  isMobileSearchOpen: boolean
  setIsMobileSearchOpen: (open: boolean) => void
  isMobileNavOpen: boolean
  setIsMobileNavOpen: (open: boolean) => void
}

const NavbarDrawerContext = createContext<NavbarDrawerContextType | undefined>(undefined)

export function NavbarDrawerProvider({ children }: { children: ReactNode }) {
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  return (
    <NavbarDrawerContext.Provider
      value={{
        isAuthDrawerOpen,
        setIsAuthDrawerOpen,
        isMobileSearchOpen,
        setIsMobileSearchOpen,
        isMobileNavOpen,
        setIsMobileNavOpen,
      }}
    >
      {children}
    </NavbarDrawerContext.Provider>
  )
}

export function useNavbarDrawers() {
  const context = useContext(NavbarDrawerContext)
  if (context === undefined) {
    throw new Error('useNavbarDrawers must be used within NavbarDrawerProvider')
  }
  return context
}

