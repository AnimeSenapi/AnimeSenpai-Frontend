'use client'

import { useState, useEffect, Fragment } from 'react'
import { HelpCircle, X, Lightbulb, Keyboard, Sparkles } from 'lucide-react'
import { SimpleTooltip } from './ui/tooltip'

interface HelpTip {
  id: string
  title: string
  description: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

interface ContextualHelpProps {
  tips: HelpTip[]
  storageKey?: string
  dismissible?: boolean
}

/**
 * Contextual Help Component
 * Shows helpful tips relevant to the current page/context
 */
export function ContextualHelp({
  tips,
  storageKey = 'contextual-help',
  dismissible = true,
}: ContextualHelpProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [isExpanded, setIsExpanded] = useState(false)

  // Load dismissed tips from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(`${storageKey}-dismissed`)
      if (stored) {
        setDismissed(new Set(JSON.parse(stored)))
      }
    } catch {
      // Ignore errors
    }
  }, [storageKey])

  const handleDismiss = (tipId: string) => {
    const next = new Set(dismissed)
    next.add(tipId)
    setDismissed(next)

    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${storageKey}-dismissed`, JSON.stringify(Array.from(next)))
      } catch {
        // Ignore errors
      }
    }
  }

  const activeTips = tips.filter((tip) => !dismissed.has(tip.id))

  if (activeTips.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md">
      {isExpanded ? (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-lg shadow-2xl p-4 space-y-3 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              <h3 className="font-semibold text-white">Helpful Tips</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tips */}
          <div className="space-y-3">
            {activeTips.map((tip) => (
              <div key={tip.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-start gap-3">
                  {tip.icon && (
                    <div className="flex-shrink-0 text-primary-400 mt-0.5">{tip.icon}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-sm mb-1">{tip.title}</h4>
                    <p className="text-xs text-gray-400">{tip.description}</p>

                    {tip.action && (
                      <button
                        onClick={tip.action.onClick}
                        className="mt-2 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        {tip.action.label} →
                      </button>
                    )}
                  </div>

                  {dismissible && (
                    <button
                      onClick={() => handleDismiss(tip.id)}
                      className="flex-shrink-0 text-gray-500 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {dismissible && (
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => activeTips.forEach((tip) => handleDismiss(tip.id))}
                className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
              >
                Dismiss all tips
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
        >
          <HelpCircle className="h-5 w-5 animate-pulse" />
          <span className="font-medium">{activeTips.length} Tips</span>
        </button>
      )}
    </div>
  )
}

/**
 * Inline Help Icon with Tooltip
 */
interface InlineHelpProps {
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function InlineHelp({ content, side = 'top' }: InlineHelpProps) {
  return (
    <SimpleTooltip content={content} side={side}>
      <button className="inline-flex items-center justify-center text-gray-400 hover:text-white transition-colors">
        <HelpCircle className="h-4 w-4" />
      </button>
    </SimpleTooltip>
  )
}

/**
 * Keyboard Shortcuts Help
 */
interface KeyboardShortcut {
  keys: string[]
  description: string
  category?: string
}

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[]
}

export function KeyboardShortcutsHelp({ shortcuts }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Listen for ? key to open help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        // Only if not in an input field
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault()
          setIsOpen(true)
        }
      }

      // ESC to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!isOpen) {
    return (
      <SimpleTooltip content="Press ? for keyboard shortcuts" side="left">
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-40 p-3 bg-gray-900 border border-white/10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-gray-400 hover:text-white"
        >
          <Keyboard className="h-5 w-5" />
        </button>
      </SimpleTooltip>
    )
  }

  // Group shortcuts by category
  const grouped = shortcuts.reduce(
    (acc, shortcut) => {
      const category = shortcut.category || 'General'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(shortcut)
      return acc
    },
    {} as Record<string, KeyboardShortcut[]>
  )

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Keyboard className="h-6 w-6 text-primary-400" />
              <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <span className="text-sm text-gray-300">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <Fragment key={i}>
                            {i > 0 && <span className="text-gray-500 text-xs mx-1">+</span>}
                            <kbd className="px-2 py-1 bg-gray-800 border border-white/20 rounded text-xs font-mono text-white">
                              {key}
                            </kbd>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <p className="text-xs text-gray-500 text-center">
            Press{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-800 border border-white/20 rounded font-mono">
              ?
            </kbd>{' '}
            to toggle this help,{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-800 border border-white/20 rounded font-mono">
              ESC
            </kbd>{' '}
            to close
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Feature Tour Component
 * Onboarding-style tooltips for new features
 */
interface TourStep {
  id: string
  title: string
  description: string
  element?: string // CSS selector
  position?: 'top' | 'right' | 'bottom' | 'left'
}

interface FeatureTourProps {
  tourId: string
  steps: TourStep[]
  onComplete?: () => void
}

export function FeatureTour({ tourId, steps, onComplete }: FeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    // Check if tour has been completed
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem(`tour-${tourId}-completed`)
      if (!completed) {
        setIsActive(true)
      }
    }
  }, [tourId])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsActive(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`tour-${tourId}-completed`, 'true')
    }
    onComplete?.()
  }

  const handleSkip = () => {
    handleComplete()
  }

  if (!isActive || steps.length === 0) {
    return null
  }

  const step = steps[currentStep]
  
  if (!step) {
    return null
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-300" />

      {/* Tooltip */}
      <div className="fixed bottom-6 right-6 z-50 max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border border-primary-400/30 rounded-lg shadow-2xl p-5 animate-in slide-in-from-bottom-4 duration-300">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary-400" />
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {currentStep + 1}/{steps.length}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
        <p className="text-sm text-gray-300 mb-4">{step.description}</p>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            Skip tour
          </button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 text-sm bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 rounded-lg transition-all text-white font-medium"
            >
              {currentStep < steps.length - 1 ? 'Next' : 'Got it!'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * Info Badge
 * Small badge to indicate new features or important information
 */
interface InfoBadgeProps {
  children: React.ReactNode
  tooltip?: string
  variant?: 'new' | 'beta' | 'tip' | 'info'
}

export function InfoBadge({ children, tooltip, variant = 'info' }: InfoBadgeProps) {
  const colors = {
    new: 'bg-green-500/20 text-green-400 border-green-500/30',
    beta: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    tip: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    info: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }

  const badge = (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${colors[variant]}`}
    >
      {variant === 'new' && <Sparkles className="h-3 w-3" />}
      {children}
    </span>
  )

  if (tooltip) {
    return <SimpleTooltip content={tooltip}>{badge}</SimpleTooltip>
  }

  return badge
}
