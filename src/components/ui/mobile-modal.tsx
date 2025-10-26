'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface MobileModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  fullScreen?: boolean
  showHeader?: boolean
  className?: string
}

export function MobileModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  fullScreen = false,
  showHeader = true,
  className,
}: MobileModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Prevent body scroll when modal is open
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

  if (!isVisible && !isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        className={cn(
          'fixed z-50 transition-all duration-300 ease-out',
          fullScreen
            ? 'inset-0'
            : 'inset-x-0 bottom-0 sm:inset-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg',
          isOpen
            ? fullScreen
              ? 'translate-y-0'
              : 'translate-y-0 sm:translate-y-0'
            : fullScreen
              ? 'translate-y-full'
              : 'translate-y-full sm:translate-y-8 sm:opacity-0'
        )}
      >
        <div
          className={cn(
            'bg-gray-900 border border-white/10 overflow-hidden',
            fullScreen
              ? 'h-full rounded-none'
              : 'max-h-[90vh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-2xl',
            className
          )}
        >
          {/* Header */}
          {showHeader && (
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-gray-900/50 backdrop-blur-sm safe-area-top">
              <div className="flex-1 min-w-0">
                {title && (
                  <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-white truncate">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="text-sm text-gray-400 mt-1">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-4 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all touch-manipulation active:scale-95"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Handle for swipe-to-dismiss on mobile */}
          {!fullScreen && (
            <div className="flex justify-center py-2 sm:hidden">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>
          )}

          {/* Content */}
          <div
            className={cn(
              'overflow-y-auto',
              fullScreen
                ? 'h-[calc(100%-64px)] safe-area-bottom'
                : 'max-h-[calc(90vh-120px)] sm:max-h-[calc(85vh-120px)]'
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

// Mobile-optimized drawer variant - opens from bottom
export function MobileDrawer({ isOpen, onClose, title, children, className }: MobileModalProps) {
  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className={className}
      snapPoints={['60vh', '90vh']}
    >
      {children}
    </MobileBottomSheet>
  )
}

// Mobile-optimized bottom sheet variant
export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints: _snapPoints = ['50vh', '90vh'],
  className,
}: MobileModalProps & { snapPoints?: string[] }) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out',
          'bg-gray-900 border-t border-white/10 rounded-t-2xl shadow-2xl',
          'h-[50vh] overflow-hidden',
          className
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-4 pb-3 border-b border-white/10">
            <h3 id="bottom-sheet-title" className="text-lg font-bold text-white text-center">
              {title}
            </h3>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto h-[calc(50vh-80px)] safe-area-bottom">
          <div className="p-4">{children}</div>
        </div>
      </div>
    </>
  )
}
