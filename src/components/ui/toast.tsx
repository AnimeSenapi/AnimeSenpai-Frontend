'use client'

import * as React from 'react'
import { cn } from '@/app/lib/utils'
import { CheckCircle, XCircle, AlertTriangle, Info, X, RotateCcw } from 'lucide-react'

interface ToastAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'destructive'
}

interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
  action?: ToastAction
  icon?: React.ReactNode
}

interface ToastProviderProps {
  children: React.ReactNode
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  maxToasts?: number
}

interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

export type { ToastAction }

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ 
  children, 
  position = 'bottom-right', 
  maxToasts = 5 
}: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id, duration: toast.duration ?? 5000 }
    
    setToasts(prev => {
      // Prevent duplicate toasts with same title/description
      const isDuplicate = prev.some(
        t => t.title === newToast.title && t.description === newToast.description
      )
      if (isDuplicate) return prev
      
      const updated = [...prev, newToast]
      // Keep only the most recent toasts
      return updated.slice(-maxToasts)
    })

    // Auto remove after duration (only if duration is not 0)
    if (newToast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [maxToasts, removeToast])

  const clearToasts = React.useCallback(() => {
    setToasts([])
  }, [])

  const value = React.useMemo(() => ({
    toasts,
    addToast,
    removeToast,
    clearToasts
  }), [toasts, addToast, removeToast, clearToasts])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastContainerProps {
  toasts: ToastProps[]
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, position, onRemove }: ToastContainerProps) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }

  return (
    <div className={cn(
      'fixed z-50 flex flex-col gap-3 pointer-events-none',
      positionClasses[position as keyof typeof positionClasses]
    )}>
      {toasts.map((toast, index) => (
        <Toast 
          key={toast.id} 
          {...toast} 
          onClose={() => onRemove(toast.id)}
          index={index}
        />
      ))}
    </div>
  )
}

function Toast({ 
  title, 
  description, 
  variant = 'default', 
  onClose, 
  action,
  icon,
  duration = 5000,
  index = 0
}: ToastProps & { index?: number }) {
  const [progress, setProgress] = React.useState(100)
  const [isExiting, setIsExiting] = React.useState(false)
  const progressRef = React.useRef<number>(duration)

  React.useEffect(() => {
    if (duration === 0) return

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, duration - elapsed)
      setProgress((remaining / duration) * 100)

      if (remaining === 0) {
        setIsExiting(true)
        setTimeout(() => {
          onClose?.()
        }, 300)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [duration, onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose?.()
    }, 300)
  }

  const variantConfig = {
    default: {
      classes: 'bg-gray-900/95 border-gray-700/50 text-white',
      icon: <Info className="h-5 w-5 text-blue-400" />,
      progressColor: 'bg-blue-500'
    },
    destructive: {
      classes: 'bg-red-900/95 border-red-700/50 text-red-100',
      icon: <XCircle className="h-5 w-5 text-red-400" />,
      progressColor: 'bg-red-500'
    },
    success: {
      classes: 'bg-green-900/95 border-green-700/50 text-green-100',
      icon: <CheckCircle className="h-5 w-5 text-green-400" />,
      progressColor: 'bg-green-500'
    },
    warning: {
      classes: 'bg-yellow-900/95 border-yellow-700/50 text-yellow-100',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
      progressColor: 'bg-yellow-500'
    },
    info: {
      classes: 'bg-blue-900/95 border-blue-700/50 text-blue-100',
      icon: <Info className="h-5 w-5 text-blue-400" />,
      progressColor: 'bg-blue-500'
    }
  }

  const config = variantConfig[variant] || variantConfig.default
  const displayIcon = icon || config.icon

  return (
    <div 
      className={cn(
        'glass rounded-xl border p-4 shadow-2xl max-w-sm w-full pointer-events-auto',
        'backdrop-blur-xl transition-all duration-300',
        config.classes,
        isExiting 
          ? 'animate-out fade-out slide-out-to-right-full opacity-0 scale-95'
          : 'animate-in fade-in slide-in-from-bottom-2',
        index > 0 && 'scale-[0.98] opacity-90'
      )}
      style={{
        animationDelay: `${index * 50}ms`,
        transform: `translateY(${index * -8}px)`
      }}
    >
      {/* Progress Bar */}
      {duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 rounded-t-xl overflow-hidden">
          <div
            className={cn('h-full transition-all duration-75 ease-linear', config.progressColor)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {displayIcon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-semibold text-sm mb-1">{title}</div>
          )}
          {description && (
            <div className="text-sm opacity-90 leading-relaxed">{description}</div>
          )}
          
          {/* Action Button */}
          {action && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  action.onClick()
                  handleClose()
                }}
                className={cn(
                  'text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
                  action.variant === 'destructive'
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                )}
              >
                {action.label}
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-lg min-h-[32px] min-w-[32px] flex items-center justify-center"
          aria-label="Close toast"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
