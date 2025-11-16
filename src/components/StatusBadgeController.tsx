'use client'

import { useEffect, useState } from 'react'
import { StatusBadge } from '@/components/StatusBadge'
import type { AppStatusBadgeConfig } from '@/app/lib/api'
import { apiGetAppStatus } from '@/app/lib/api'

/**
 * StatusBadgeController
 * Fetches status badge config from the backend and renders the StatusBadge.
 * Fails silently if the backend doesn't provide a value.
 */
export function StatusBadgeController() {
  const [config, setConfig] = useState<AppStatusBadgeConfig | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const result = await apiGetAppStatus()
      if (!mounted) return
      setConfig(result)
      setLoaded(true)
    })()
    return () => {
      mounted = false
    }
  }, [])

  if (!loaded) return null
  if (!config || config.enabled === false) return null

  return (
    <StatusBadge
      status={config.status || 'beta'}
      fixedTopLeft
      variant={config.variant || 'glass'}
      pulse={config.pulse !== false}
      tooltip={config.tooltip}
      asLink={config.link}
    />
  )
}


