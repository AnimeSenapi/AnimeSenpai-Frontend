'use client'

import Link from 'next/link'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { useHapticFeedback } from '../../hooks/use-haptic-feedback'

interface GuestAuthProps {
  onClose?: () => void
  variant?: 'desktop' | 'mobile'
}

export function GuestAuth({ onClose, variant = 'desktop' }: GuestAuthProps) {
  const haptic = useHapticFeedback()

  const handleClick = () => {
    haptic.selection()
    onClose?.()
  }

  // Mobile variant - vertical stacked buttons with icons
  if (variant === 'mobile') {
    return (
      <div className="space-y-3">
        <Link
          href="/auth/signin"
          onClick={handleClick}
          className="block w-full"
        >
          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10 hover:border-white/30 text-white font-semibold transition-all touch-manipulation active:scale-95 group"
          >
            <span className="mr-2">Sign In</span>
          </Button>
        </Link>
        <Link
          href="/auth/signup"
          onClick={handleClick}
          className="block w-full"
        >
          <Button
            size="lg"
            className="w-full h-12 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold shadow-lg shadow-primary-500/30 transition-all touch-manipulation active:scale-95 group"
          >
            <span className="mr-2">Sign Up</span>
          </Button>
        </Link>
      </div>
    )
  }

  // Desktop variant - original side-by-side buttons
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-300 hover:text-white hover:bg-white/10 h-9 px-4"
        asChild
      >
        <Link href="/auth/signin" onClick={handleClick}>Sign In</Link>
      </Button>
      <Separator orientation="vertical" className="h-6 bg-white/20" />
      <Button variant="outline" size="sm" className="btn-dark h-9 px-4" asChild>
        <Link href="/auth/signup" onClick={handleClick}>Sign Up</Link>
      </Button>
    </div>
  )
}
