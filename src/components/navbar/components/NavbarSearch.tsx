'use client'

import { memo } from 'react'
import { Search } from 'lucide-react'
import { SearchBar } from '../../search/SearchBar'
import { NavbarSearchProps } from '../types'
import { useHapticFeedback } from '../../../hooks/use-haptic-feedback'
import { cn } from '../../../app/lib/utils'

/**
 * Navbar Search Component
 * Desktop search bar and mobile search button
 */
export const NavbarSearch = memo(function NavbarSearch({
  onSearchClick,
  className,
}: NavbarSearchProps) {
  const haptic = useHapticFeedback()

  return (
    <>
      {/* Desktop Search Bar */}
      <div
        className={cn(
          'hidden lg:block w-48 xl:w-56 2xl:w-64 transition-all duration-300',
          className
        )}
        role="search"
        aria-label="Search anime"
        id="search"
      >
        <SearchBar placeholder="Search..." showDropdown={true} size="sm" variant="navbar" renderDropdownOutside={true} />
      </div>

      {/* Mobile/Tablet Search Button */}
      <button
        onClick={() => {
          haptic.selection()
          onSearchClick()
        }}
        className={cn(
          'lg:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 touch-manipulation active:scale-95 text-gray-300 hover:text-primary-400 hover:bg-primary-500/20 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-950 flex-shrink-0 relative group',
          className
        )}
        aria-label="Open search"
      >
        <Search className="h-5 w-5 transition-transform group-active:scale-110" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </>
  )
})

