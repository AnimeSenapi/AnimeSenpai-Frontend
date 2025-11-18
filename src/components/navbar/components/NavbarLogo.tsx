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
        src="/assets/logo/AnimeSenpai_Inline.svg"
        alt="AnimeSenpai"
        width={450}
        height={112}
        className="h-7 sm:h-12 md:h-14 lg:h-20 xl:h-24 w-auto max-w-[100px] sm:max-w-[140px] md:max-w-none invert drop-shadow-lg flex-shrink-0"
        priority
      />
    </Link>
  )
})

