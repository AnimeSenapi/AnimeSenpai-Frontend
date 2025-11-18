'use client'

import Link from 'next/link'
import { Button } from '../ui/button'
import { useHapticFeedback } from '../../hooks/use-haptic-feedback'
import { LogIn, UserPlus } from 'lucide-react'

interface GuestAuthProps {
  onClose?: () => void
}

export function GuestAuth({ onClose }: GuestAuthProps) {
  const haptic = useHapticFeedback()

  const handleClick = () => {
    haptic.selection()
    onClose?.()
  }

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
          <LogIn className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
          Sign In
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
          <UserPlus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
          Sign Up
        </Button>
      </Link>
    </div>
  )
}
