'use client'

import { Check } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface ProgressStepsProps {
  steps: Array<{
    id: number
    title: string
    description?: string
  }>
  currentStep: number
  className?: string
}

export function ProgressSteps({ steps, currentStep, className }: ProgressStepsProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Mobile: Compact Progress Bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-xs text-gray-400">
            {Math.round((currentStep / steps.length) * 100)}% complete
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{steps[currentStep - 1]?.title}</p>
      </div>

      {/* Desktop: Full Step Indicators */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep
            const isUpcoming = stepNumber > currentStep

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center relative">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 relative z-10',
                      isCompleted &&
                        'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/30',
                      isCurrent &&
                        'bg-white/10 text-white border-2 border-primary-400 shadow-lg shadow-primary-500/20 animate-pulse',
                      isUpcoming && 'bg-white/5 text-gray-500 border border-white/10'
                    )}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                  </div>

                  {/* Step Title */}
                  <div className="mt-3 text-center min-w-[100px]">
                    <p
                      className={cn(
                        'text-xs font-medium transition-colors',
                        isCurrent ? 'text-white' : 'text-gray-400'
                      )}
                    >
                      {step.title}
                    </p>
                    {step.description && isCurrent && (
                      <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                    )}
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 relative">
                    <div className="absolute inset-0 bg-white/10" />
                    <div
                      className={cn(
                        'absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500',
                        isCompleted ? 'w-full' : 'w-0'
                      )}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Circular progress indicator
export function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 8,
}: {
  progress: number
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-white/10"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      {/* Progress text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}
