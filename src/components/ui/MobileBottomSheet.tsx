/**
 * Mobile Bottom Sheet Component
 * Enhanced bottom sheet with swipe-to-dismiss and snap points
 */

'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../app/lib/utils'
import { useIsMobile } from '../../hooks/use-touch-gestures'
import { useHapticFeedback } from '../../hooks/use-haptic-feedback'

interface MobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  snapPoints?: string[]
  className?: string
  showHeader?: boolean
  enableSwipeToDismiss?: boolean
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  snapPoints = ['50vh', '90vh'],
  className,
  showHeader = true,
  enableSwipeToDismiss = true,
}: MobileBottomSheetProps) {
  const [mounted, setMounted] = useState(false)
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragY, setDragY] = useState(0)
  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)
  const haptic = useHapticFeedback()

  useEffect(() => {
    setMounted(true)
  }, [])


  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipeToDismiss) return
    startY.current = e.touches[0].clientY
    currentY.current = startY.current
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !enableSwipeToDismiss) return

    currentY.current = e.touches[0].clientY
    const deltaY = currentY.current - startY.current

    // Only allow downward drag
    if (deltaY > 0) {
      setDragY(deltaY)
      haptic.light()
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging || !enableSwipeToDismiss) return

    const deltaY = currentY.current - startY.current
    const threshold = 100 // 100px to dismiss

    if (deltaY > threshold) {
      haptic.medium()
      onClose()
    }

    setIsDragging(false)
    setDragY(0)
    startY.current = 0
    currentY.current = 0
  }

  if (!mounted) {
    return null
  }

  // Safety check: ensure document.body exists before portal rendering
  if (typeof document === 'undefined' || !document.body) {
    return null
  }

  const currentHeight = snapPoints[currentSnapIndex] || snapPoints[0]
  const dragOffset = isDragging ? dragY : 0

  const content = (
    <div
      className={cn(
        'fixed inset-0 z-[100] transition-opacity duration-300',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Bottom Sheet - Positioned at the very bottom of the viewport */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
        aria-describedby={description ? 'bottom-sheet-description' : undefined}
        className={cn(
          'fixed left-0 right-0 bottom-0 top-auto transition-transform duration-300 ease-out',
          'bg-gray-950/95 backdrop-blur-xl border-t border-white/10 rounded-t-2xl shadow-2xl',
          'max-h-[90vh]',
          className
        )}
        style={{
          position: 'fixed',
          top: 'auto',
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: currentHeight,
          maxHeight: '90vh',
          transform: isOpen
            ? `translateY(${Math.max(0, dragOffset)}px)`
            : 'translateY(calc(100% + 10px))',
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          zIndex: 101,
          willChange: 'transform',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center py-4 cursor-grab active:cursor-grabbing touch-manipulation">
          <div className="w-14 h-1.5 bg-white/30 rounded-full transition-all hover:bg-white/40" />
        </div>

        {/* Header */}
        {showHeader && (
          <div className="px-4 pb-4 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent safe-area-top">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {title && (
                  <h3
                    id="bottom-sheet-title"
                    className="text-xl font-bold text-white text-center truncate"
                  >
                    {title}
                  </h3>
                )}
                {description && (
                  <p
                    id="bottom-sheet-description"
                    className="text-sm text-gray-400 mt-1.5 text-center"
                  >
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-4 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all touch-manipulation active:scale-95 min-h-[44px] min-w-[44px]"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div
          className="overflow-y-auto h-[calc(100%-80px)] safe-area-bottom custom-scrollbar"
          style={{ touchAction: 'pan-y' }}
        >
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  )

  // Portal to document.body to ensure proper positioning outside any parent containers
  try {
    return createPortal(content, document.body)
  } catch (error) {
    // Fallback: log error and return null if portal fails
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error('Failed to create portal for MobileBottomSheet:', error)
    }
    return null
  }
}

