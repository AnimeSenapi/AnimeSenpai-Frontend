/**
 * Mobile Full Screen Modal Component
 * Full-screen modal optimized for mobile devices
 */

'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../app/lib/utils'
import { useIsMobile } from '../../hooks/use-touch-gestures'
import { useHapticFeedback } from '../../hooks/use-haptic-feedback'

interface MobileFullScreenModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  showHeader?: boolean
  enableSwipeToDismiss?: boolean
}

export function MobileFullScreenModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  showHeader = true,
  enableSwipeToDismiss = true,
}: MobileFullScreenModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const isMobile = useIsMobile()
  const haptic = useHapticFeedback()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      document.body.style.overflow = 'hidden'
    } else {
      const timeout = setTimeout(() => setIsVisible(false), 300)
      document.body.style.overflow = ''
      return () => clearTimeout(timeout)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleClose = () => {
    haptic.light()
    onClose()
  }

  if (!mounted || (!isVisible && !isOpen)) {
    return null
  }

  const content = (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/90 backdrop-blur-sm z-[9998] transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'fullscreen-modal-title' : undefined}
        aria-describedby={description ? 'fullscreen-modal-description' : undefined}
        className={cn(
          'fixed inset-0 z-[9999] transition-transform duration-300 ease-out',
          'bg-gray-900 overflow-hidden',
          isOpen ? 'translate-y-0' : 'translate-y-full',
          className
        )}
      >
        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-gray-900/50 backdrop-blur-sm safe-area-top">
            <div className="flex-1 min-w-0">
              {title && (
                <h2
                  id="fullscreen-modal-title"
                  className="text-xl font-bold text-white truncate"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="fullscreen-modal-description"
                  className="text-sm text-gray-400 mt-1"
                >
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="ml-4 flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all touch-manipulation active:scale-95 min-h-[44px] min-w-[44px]"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-64px)] safe-area-bottom">
          <div className="p-4">{children}</div>
        </div>
      </div>
    </>
  )

  return isMobile ? createPortal(content, document.body) : null
}

