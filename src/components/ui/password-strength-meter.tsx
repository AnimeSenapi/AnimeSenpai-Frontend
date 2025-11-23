'use client'

import { Check, X } from 'lucide-react'
import { cn } from '../../app/lib/utils'

interface PasswordStrengthMeterProps {
  password: string
  className?: string
  showLabel?: boolean
}

interface PasswordCheck {
  label: string
  test: (password: string) => boolean
}

const passwordChecks: PasswordCheck[] = [
  { label: '8+ characters', test: (pwd) => pwd.length >= 8 },
  { label: 'Uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'Lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'Number', test: (pwd) => /\d/.test(pwd) },
  { label: 'Special character (@$!%*?&)', test: (pwd) => /[@$!%*?&]/.test(pwd) },
]

export function PasswordStrengthMeter({ password, className, showLabel = true }: PasswordStrengthMeterProps) {
  if (!password) return null

  const checks = passwordChecks.map((check) => ({
    ...check,
    passed: check.test(password),
  }))

  const strength = checks.filter((c) => c.passed).length
  const strengthPercentage = (strength / checks.length) * 100

  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-red-500'
    if (strength <= 3) return 'bg-orange-500'
    if (strength <= 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthLabel = () => {
    if (strength <= 2) return 'Weak'
    if (strength <= 3) return 'Fair'
    if (strength <= 4) return 'Good'
    return 'Strong'
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Password strength:</span>
          <span
            className={cn(
              'font-medium',
              strength <= 2 && 'text-red-400',
              strength === 3 && 'text-orange-400',
              strength === 4 && 'text-yellow-400',
              strength === 5 && 'text-green-400'
            )}
          >
            {getStrengthLabel()}
          </span>
        </div>
      )}

      {/* Strength Bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300 ease-out', getStrengthColor())}
          style={{ width: `${strengthPercentage}%` }}
        />
      </div>

      {/* Requirements List */}
      <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
        <p className="text-xs font-medium text-gray-400 mb-2">Password must contain:</p>
        <div className="grid grid-cols-2 gap-2">
          {checks.map((check, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors',
                check.passed ? 'text-green-400' : 'text-gray-400'
              )}
            >
              {check.passed ? (
                <Check className="h-3.5 w-3.5 flex-shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 flex-shrink-0" />
              )}
              <span>{check.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

