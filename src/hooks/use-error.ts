'use client'

import { useState, useCallback } from 'react'
import { errorHandler, AppError, ErrorType } from '../lib/error-handler'

interface UseErrorOptions {
  onError?: (error: AppError) => void
  showToast?: boolean
  logToConsole?: boolean
}

interface UseErrorReturn {
  error: AppError | null
  hasError: boolean
  setError: (error: unknown, context?: Record<string, any>) => void
  clearError: () => void
  retry: <T>(fn: () => Promise<T>) => Promise<T | null>
}

/**
 * Hook for managing errors in components
 * 
 * @example
 * ```tsx
 * const { error, setError, clearError, retry } = useError()
 * 
 * const loadData = async () => {
 *   try {
 *     const data = await fetchData()
 *     setData(data)
 *   } catch (err) {
 *     setError(err, { component: 'MyComponent', action: 'loadData' })
 *   }
 * }
 * 
 * // Or use retry
 * const loadDataWithRetry = () => retry(fetchData)
 * ```
 */
export function useError(options: UseErrorOptions = {}): UseErrorReturn {
  const [error, setErrorState] = useState<AppError | null>(null)

  const setError = useCallback((rawError: unknown, context?: Record<string, any>) => {
    const appError = errorHandler.handleError(rawError, context)
    setErrorState(appError)

    // Call custom error handler if provided
    if (options.onError) {
      options.onError(appError)
    }

    // Log to console if requested (development only)
    if (options.logToConsole && process.env.NODE_ENV === 'development') {
      console.error('[useError]', appError)
    }
  }, [options])

  const clearError = useCallback(() => {
    setErrorState(null)
  }, [])

  const retry = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    try {
      clearError()
      const result = await fn()
      return result
    } catch (err) {
      setError(err, { action: 'retry' })
      return null
    }
  }, [setError, clearError])

  return {
    error,
    hasError: error !== null,
    setError,
    clearError,
    retry,
  }
}

/**
 * Hook for async operations with built-in error handling
 * 
 * @example
 * ```tsx
 * const { execute, loading, error, data } = useAsyncError(fetchData)
 * 
 * // In component
 * <button onClick={() => execute(params)}>Load</button>
 * {loading && <Spinner />}
 * {error && <ErrorState error={error} onRetry={execute} />}
 * {data && <DataDisplay data={data} />}
 * ```
 */
export function useAsyncError<T, Args extends any[] = any[]>(
  asyncFn: (...args: Args) => Promise<T>,
  options: UseErrorOptions = {}
) {
  const { error, setError, clearError } = useError(options)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (...args: Args): Promise<T | null> => {
    try {
      setLoading(true)
      clearError()
      const result = await asyncFn(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err, { 
        function: asyncFn.name,
        args: args.length > 0 ? 'provided' : 'none'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [asyncFn, setError, clearError])

  const reset = useCallback(() => {
    setData(null)
    clearError()
    setLoading(false)
  }, [clearError])

  return {
    execute,
    loading,
    error,
    data,
    reset,
    hasError: error !== null,
  }
}

