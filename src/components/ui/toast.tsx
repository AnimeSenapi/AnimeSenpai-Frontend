'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/app/lib/utils'

export type ToastType = 'success' | 'error' | 'info' | 'warning'
export type ToastPosition =
  | 'top-right'
  | 'top-center'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-center'
  | 'bottom-left'

export interface Toast {
  id: string
  title?: string
  message: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toast: (options: Omit<Toast, 'id'>) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
  position?: ToastPosition
  maxToasts?: number
}

export function ToastProvider({
  children,
  position = 'top-right',
  maxToasts = 3,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    (options: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: Toast = {
        id,
        duration: 1000, // 1 second default
        ...options,
      }

      setToasts((prev) => {
        // Limit number of toasts
        const updated = [...prev, newToast]
        return updated.slice(-maxToasts)
      })

      // Auto dismiss after 1 second unless hovered
      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, newToast.duration)
      }
    },
    [maxToasts]
  )

  const success = useCallback(
    (message: string, title?: string) => {
      toast({ type: 'success', message, title })
    },
    [toast]
  )

  const error = useCallback(
    (message: string, title?: string) => {
      toast({ type: 'error', message, title, duration: 2000 }) // 2 seconds for errors
    },
    [toast]
  )

  const info = useCallback(
    (message: string, title?: string) => {
      toast({ type: 'info', message, title })
    },
    [toast]
  )

  const warning = useCallback(
    (message: string, title?: string) => {
      toast({ type: 'warning', message, title, duration: 1500 }) // 1.5 seconds for warnings
    },
    [toast]
  )

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  // Position classes
  const positionClasses = {
    'top-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6', // Changed to bottom-right to match
    'top-center': 'bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6',
    'top-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6',
    'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6',
    'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6',
  }

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning, dismiss, dismissAll }}>
      {children}

      {/* Toast Container */}
      <div
        className={cn(
          'fixed z-[100] flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0',
          positionClasses[position],
          position.includes('bottom') ? 'safe-area-bottom' : 'safe-area-top'
        )}
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => dismiss(toast.id)}
            index={index}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({
  toast,
  onDismiss,
  index,
}: {
  toast: Toast
  onDismiss: () => void
  index: number
}) {
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return

    const startTime = Date.now()
    let pausedTime = 0
    let pauseStartTime = 0

    const updateProgress = () => {
      if (isHovered) {
        if (pauseStartTime === 0) {
          pauseStartTime = Date.now()
        }
        return
      }

      if (pauseStartTime > 0) {
        pausedTime += Date.now() - pauseStartTime
        pauseStartTime = 0
      }

      const elapsed = Date.now() - startTime - pausedTime
      const remaining = Math.max(0, 100 - (elapsed / toast.duration!) * 100)
      setProgress(remaining)

      if (remaining <= 0) {
        handleDismiss()
      }
    }

    const interval = setInterval(updateProgress, 50)

    return () => clearInterval(interval)
  }, [toast.duration, isHovered])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(onDismiss, 300)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // Type-based styling
  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgClass: 'bg-green-500/10 border-green-500/30',
      iconClass: 'text-green-500',
      progressClass: 'bg-green-500',
    },
    error: {
      icon: AlertCircle,
      bgClass: 'bg-red-500/10 border-red-500/30',
      iconClass: 'text-red-500',
      progressClass: 'bg-red-500',
    },
    info: {
      icon: Info,
      bgClass: 'bg-blue-500/10 border-blue-500/30',
      iconClass: 'text-blue-500',
      progressClass: 'bg-blue-500',
    },
    warning: {
      icon: AlertTriangle,
      bgClass: 'bg-yellow-500/10 border-yellow-500/30',
      iconClass: 'text-yellow-500',
      progressClass: 'bg-yellow-500',
    },
  }

  const config = typeConfig[toast.type]
  const Icon = config.icon

  return (
    <div
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'glass border rounded-xl p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 touch-manipulation',
        config.bgClass,
        isExiting ? 'opacity-0 scale-95 translate-x-8' : 'opacity-100 scale-100 translate-x-0',
        'animate-in slide-in-from-right-5 fade-in'
      )}
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'backwards',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('flex-shrink-0 mt-0.5', config.iconClass)}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {toast.title && <p className="font-semibold text-white text-sm mb-1">{toast.title}</p>}
          <p className="text-sm text-gray-300">{toast.message}</p>

          {/* Action Button */}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-xs font-medium text-white hover:underline underline-offset-2"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg touch-manipulation"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-100 ease-linear', config.progressClass)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

// Toast Container Component (for backwards compatibility)
export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[]
  onRemove: (id: string) => void
}) {
  return (
    <div
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0 safe-area-bottom"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => onRemove(toast.id)}
          index={index}
        />
      ))}
    </div>
  )
}
