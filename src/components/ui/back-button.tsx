'use client'

import { Button } from './button'
import { ChevronLeft } from 'lucide-react'

export function BackButton() {
  return (
    <Button
      variant="ghost"
      className="text-gray-300 hover:text-white hover:bg-white/10"
      onClick={() => window.history.back()}
    >
      <ChevronLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
  )
}
