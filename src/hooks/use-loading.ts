/**
 * useLoading Hook
 * Manages loading state for async operations
 */

import { useState, useCallback } from 'react'

interface UseLoadingReturn {
  isLoading: boolean
  loadingMessage: string
  startLoading: (message?: string) => void
  stopLoading: () => void
  withLoading: <T>(asyncFn: () => Promise<T>, message?: string) => Promise<T>
}

export function useLoading(initialMessage: string = 'Loading...'): UseLoadingReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(initialMessage)

  const startLoading = useCallback((message?: string) => {
    setIsLoading(true)
    if (message) {
      setLoadingMessage(message)
    }
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  const withLoading = useCallback(async <T,>(
    asyncFn: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    try {
      setIsLoading(true)
      if (message) {
        setLoadingMessage(message)
      }
      return await asyncFn()
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    withLoading,
  }
}

/**
 * useAsync Hook
 * Manages async operations with loading, error, and data states
 */
interface UseAsyncOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseAsyncReturn<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  execute: (...args: any[]) => Promise<T | undefined>
  reset: () => void
}

export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await asyncFunction(...args)
        setData(result)
        if (options.onSuccess) {
          options.onSuccess(result)
        }
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        if (options.onError) {
          options.onError(error)
        }
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [asyncFunction, options]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
  }
}

/**
 * useDebounce Hook
 * Debounces value changes
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  })

  return debouncedValue
}

/**
 * useThrottle Hook
 * Throttles function calls
 */
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 500
): T {
  const [lastRun, setLastRun] = useState(Date.now())

  return ((...args: any[]) => {
    const now = Date.now()
    if (now - lastRun >= delay) {
      setLastRun(now)
      return func(...args)
    }
  }) as T
}

