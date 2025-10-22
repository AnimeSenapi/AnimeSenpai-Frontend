'use client'

import Link from 'next/link'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

export function GuestAuth() {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-300 hover:text-white hover:bg-white/10 h-9 px-4"
        asChild
      >
        <Link href="/auth/signin">Sign In</Link>
      </Button>
      <Separator orientation="vertical" className="h-6 bg-white/20" />
      <Button variant="outline" size="sm" className="btn-dark h-9 px-4" asChild>
        <Link href="/auth/signup">Sign Up</Link>
      </Button>
    </div>
  )
}
