'use client'

import Link from 'next/link'
import { cn } from '@/app/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type StatusKind =
  | 'alpha'
  | 'beta'
  | 'preview'
  | 'experimental'
  | 'maintenance'
  | 'deprecated'
  | 'stable'
  | (string & {})

interface StatusBadgeProps {
  status: StatusKind
  className?: string
  variant?: 'solid' | 'outline' | 'glass'
  pulse?: boolean
  tooltip?: string
  asLink?: string
  fixedTopLeft?: boolean
}

/**
 * StatusBadge
 * Lightweight, reusable badge for showing environment/product status (alpha, beta, etc.)
 * - UI-only; no data fetching. Wire it to your API later.
 * - Optional fixedTopLeft to pin it in the top-left corner for layout usage.
 */
export function StatusBadge({
  status,
  className,
  variant = 'glass',
  pulse = true,
  tooltip,
  asLink,
  fixedTopLeft,
}: StatusBadgeProps) {
  const normalized = (status || '').toString().trim().toLowerCase()

  // Color system mapped by status. Falls back to neutral if unknown.
  const colorByStatus: Record<string, { bg: string; text: string; border: string; ring: string }> = {
    alpha: {
      bg: 'from-fuchsia-500/20 to-violet-500/20',
      text: 'text-fuchsia-300',
      border: 'border-fuchsia-400/30',
      ring: 'ring-fuchsia-400/40',
    },
    beta: {
      bg: 'from-amber-500/20 to-yellow-500/20',
      text: 'text-amber-300',
      border: 'border-amber-400/30',
      ring: 'ring-amber-400/40',
    },
    preview: {
      bg: 'from-cyan-500/20 to-sky-500/20',
      text: 'text-cyan-300',
      border: 'border-cyan-400/30',
      ring: 'ring-cyan-400/40',
    },
    experimental: {
      bg: 'from-rose-500/20 to-orange-500/20',
      text: 'text-rose-300',
      border: 'border-rose-400/30',
      ring: 'ring-rose-400/40',
    },
    maintenance: {
      bg: 'from-yellow-600/20 to-orange-600/20',
      text: 'text-yellow-300',
      border: 'border-yellow-500/30',
      ring: 'ring-yellow-500/40',
    },
    deprecated: {
      bg: 'from-red-600/20 to-rose-600/20',
      text: 'text-red-300',
      border: 'border-red-500/30',
      ring: 'ring-red-500/40',
    },
    stable: {
      bg: 'from-emerald-600/20 to-teal-600/20',
      text: 'text-emerald-300',
      border: 'border-emerald-500/30',
      ring: 'ring-emerald-500/40',
    },
  }

  const fallback = {
    bg: 'from-slate-500/20 to-slate-600/20',
    text: 'text-slate-300',
    border: 'border-slate-400/30',
    ring: 'ring-slate-400/40',
  }

  const palette = colorByStatus[normalized] ?? fallback

  const content = (
    <span
      className={cn(
        // base
        'inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-semibold',
        'backdrop-blur-md select-none',
        // variant
        variant === 'glass' &&
          cn('bg-gradient-to-br', palette.bg, 'border', palette.border, palette.text),
        variant === 'solid' &&
          cn(
            'border border-white/10',
            palette.text,
            normalized === 'beta' && 'bg-amber-500/25',
            normalized === 'alpha' && 'bg-fuchsia-500/25',
            normalized === 'preview' && 'bg-cyan-500/25',
            normalized === 'experimental' && 'bg-rose-500/25',
            normalized === 'maintenance' && 'bg-yellow-600/25',
            normalized === 'deprecated' && 'bg-red-600/25',
            normalized === 'stable' && 'bg-emerald-600/25',
            !colorByStatus[normalized] && 'bg-slate-600/25',
          ),
        variant === 'outline' && cn('bg-transparent border', palette.border, palette.text),
        // pulse
        pulse && 'shadow-sm',
        className,
      )}
      aria-label={`Status: ${status}`}
    >
      <span
        className={cn(
          'relative inline-block h-2 w-2 rounded-full',
          variant === 'outline' ? palette.text : 'bg-current',
        )}
      >
        {pulse && (
          <span
            className={cn(
              'absolute inset-0 rounded-full animate-ping',
              'opacity-40',
              variant === 'outline' ? palette.text : 'bg-current',
            )}
          />
        )}
      </span>
      <span className="uppercase tracking-wide">{String(status)}</span>
    </span>
  )

  const wrapped = asLink ? (
    <Link href={asLink} className={cn('focus:outline-none focus:ring-2 rounded-md', palette.ring)}>
      {content}
    </Link>
  ) : (
    content
  )

  const withTooltip = tooltip ? (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{wrapped}</TooltipTrigger>
        <TooltipContent className="text-xs">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    wrapped
  )

  if (!fixedTopLeft) return withTooltip

  return (
    <div
      className={cn(
        'fixed z-[60]',
        // Respect iOS safe areas
        'top-[max(0.5rem,var(--safe-area-inset-top))] left-[max(0.5rem,var(--safe-area-inset-left))]',
      )}
    >
      {withTooltip}
    </div>
  )
}

/**
 * Example usage (UI only):
 *
 * <StatusBadge status="beta" fixedTopLeft tooltip="This product is in public beta" />
 * <StatusBadge status="alpha" variant="solid" />
 * <StatusBadge status="stable" variant="outline" asLink="/changelog" />
 *
 * Later, you can wire this component to an API by lifting the `status` prop into layout state.
 */


