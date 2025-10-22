/**
 * Accessible Button Component
 *
 * Enhanced button with accessibility features
 * WCAG 2.1 AA compliant
 */

import React from 'react'
import { cn } from '@/app/lib/utils'

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  ariaLabel?: string
}

export const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      ariaLabel,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary: 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-400',
      secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white focus:ring-secondary-400',
      ghost: 'bg-transparent hover:bg-white/10 text-white focus:ring-white/50',
      danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400',
    }

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-busy={loading}
        aria-disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'touch-manipulation',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}
        <span>{children}</span>
        {!loading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </button>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'
