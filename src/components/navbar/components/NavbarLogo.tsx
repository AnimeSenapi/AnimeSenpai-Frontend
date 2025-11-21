'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NavbarLogoProps } from '../types'

/**
 * Navbar Logo Component
 * Responsive logo that navigates to home
 */
export const NavbarLogo = memo(function NavbarLogo({ className }: NavbarLogoProps) {
  return (
    <Link
      href="/dashboard"
      className={`flex items-center flex-shrink-0 min-w-0 ${className || ''}`}
      aria-label="AnimeSenpai home"
    >
      <Image
        src="/assets/logos/AS-logo-800x200-300-W.png"
        alt="AnimeSenpai"
        width={800}
        height={200}
        className="h-5 sm:h-7 md:h-8 lg:h-10 xl:h-12 w-auto max-w-[80px] sm:max-w-[100px] md:max-w-[120px] lg:max-w-[140px] drop-shadow-lg flex-shrink-0"
        priority
      />
    </Link>
  )
})

