'use client'

import React, { forwardRef, useId } from 'react'
import { Check, X, AlertCircle } from 'lucide-react'
import { cn } from '../../app/lib/utils'

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  validationState?: 'idle' | 'validating' | 'valid' | 'invalid'
  showValidationIcon?: boolean
  fullWidth?: boolean
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      leftIcon,
      rightIcon,
      validationState = 'idle',
      showValidationIcon = false,
      fullWidth = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const fieldId = id ?? `field-${generatedId}`
    const errorId = error ? `${fieldId}-error` : undefined
    const helperId = helperText ? `${fieldId}-helper` : undefined
    const ariaDescribedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined

    const isInvalid = !!error || validationState === 'invalid'
    const isValid = validationState === 'valid' && !error

    const getValidationIcon = () => {
      if (validationState === 'validating') {
        return (
          <div className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        )
      }
      if (isValid && showValidationIcon) {
        return <Check className="h-5 w-5 text-green-400" />
      }
      if (isInvalid && showValidationIcon) {
        return <X className="h-5 w-5 text-red-400" />
      }
      return null
    }

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={fieldId} className="block text-sm font-medium text-gray-300">
            {label}
            {required && (
              <span className="text-red-400 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={fieldId}
            aria-invalid={isInvalid}
            aria-describedby={ariaDescribedBy}
            aria-required={required}
            required={required}
            className={cn(
              'w-full pl-12 pr-12 py-3.5 sm:py-3 bg-white/5 border rounded-md text-white',
              'placeholder-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent',
              'transition-all duration-200',
              'text-base sm:text-sm',
              'min-h-[44px] sm:min-h-0',
              isInvalid && 'border-red-500/50 focus:ring-red-500/50',
              isValid && 'border-green-500/50',
              !isInvalid && !isValid && 'border-white/10',
              leftIcon && 'pl-12',
              rightIcon || showValidationIcon ? 'pr-12' : 'pr-4',
              className
            )}
            style={{
              fontSize: '16px',
              ...(typeof window !== 'undefined' && window.innerWidth >= 640 && {
                fontSize: '14px',
              }),
            }}
            {...props}
          />

          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {rightIcon && <div className="text-gray-400">{rightIcon}</div>}
            {getValidationIcon()}
          </div>
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-1 text-sm text-red-400 flex items-center gap-1.5"
            aria-live="polite"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

