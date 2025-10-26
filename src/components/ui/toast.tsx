'use client'

import * as React from 'react'
import { cn } from '@/app/lib/utils'

interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  duration?: number
  onClose?: () => void
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

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ 
  children, 
  position = 'bottom-right', 
  maxToasts = 5 
}: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => {
      const updated = [...prev, newToast]
      return updated.slice(-maxToasts)
    })

    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }
  }, [maxToasts])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

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
  position: string
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
      'fixed z-50 flex flex-col gap-2',
      positionClasses[position as keyof typeof positionClasses]
    )}>
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ title, description, variant = 'default', onClose }: ToastProps) {
  const variantClasses = {
    default: 'bg-gray-900 border-gray-700 text-white',
    destructive: 'bg-red-900 border-red-700 text-red-100',
    success: 'bg-green-900 border-green-700 text-green-100',
    warning: 'bg-yellow-900 border-yellow-700 text-yellow-100'
  }

  return (
    <div className={cn(
      'glass rounded-lg border p-4 shadow-lg max-w-sm w-full',
      'animate-in slide-in-from-right-full duration-300',
      variantClasses[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && (
            <div className="font-semibold text-sm">{title}</div>
          )}
          {description && (
            <div className="text-sm opacity-90 mt-1">{description}</div>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close toast"
        >
          ×
        </button>
      </div>
    </div>
  )
}
