'use client'

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

export function ToastItem({ toast, onRemove }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const duration = toast.duration || 5000
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onRemove(toast.id), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle
  }

  const styles = {
    success: {
      bg: 'bg-success-500/10 border-success-500/30',
      icon: 'text-success-400',
      text: 'text-success-400'
    },
    error: {
      bg: 'bg-error-500/10 border-error-500/30',
      icon: 'text-error-400',
      text: 'text-error-400'
    },
    info: {
      bg: 'bg-primary-500/10 border-primary-500/30',
      icon: 'text-primary-400',
      text: 'text-primary-400'
    },
    warning: {
      bg: 'bg-warning-500/10 border-warning-500/30',
      icon: 'text-warning-400',
      text: 'text-warning-400'
    }
  }

  const Icon = icons[toast.type]
  const style = styles[toast.type]

  return (
    <div
      className={`
        glass border ${style.bg} rounded-xl p-4 shadow-2xl backdrop-blur-xl
        transition-all duration-300 transform
        ${isExiting 
          ? 'translate-x-full opacity-0' 
          : 'translate-x-0 opacity-100'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${style.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className={`font-semibold ${style.text} mb-1`}>
              {toast.title}
            </h4>
          )}
          <p className="text-white text-sm leading-relaxed">
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => {
            setIsExiting(true)
            setTimeout(() => onRemove(toast.id), 300)
          }}
          className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <div className="space-y-3 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>
  )
}


