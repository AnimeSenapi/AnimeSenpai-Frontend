'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { ToastContainer } from '../components/ui/toast'
import type { Toast, ToastType } from '../components/ui/toast'

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void
  success: (message: string, title?: string, duration?: number) => void
  error: (message: string, title?: string, duration?: number) => void
  info: (message: string, title?: string, duration?: number) => void
  warning: (message: string, title?: string, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    title?: string,
    duration?: number
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: Toast = {
      id,
      type,
      title,
      message,
      duration
    }

    setToasts((prev) => [...prev, newToast])
  }, [])

  const success = useCallback((message: string, title?: string, duration?: number) => {
    showToast(message, 'success', title, duration)
  }, [showToast])

  const error = useCallback((message: string, title?: string, duration?: number) => {
    showToast(message, 'error', title, duration)
  }, [showToast])

  const info = useCallback((message: string, title?: string, duration?: number) => {
    showToast(message, 'info', title, duration)
  }, [showToast])

  const warning = useCallback((message: string, title?: string, duration?: number) => {
    showToast(message, 'warning', title, duration)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}


