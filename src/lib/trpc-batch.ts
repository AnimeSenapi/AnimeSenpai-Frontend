/**
 * tRPC Request Batching Utility
 *
 * Automatically batches multiple concurrent tRPC requests into a single HTTP request
 * to reduce network overhead and improve performance.
 */

import { TRPC_URL } from '@/app/lib/api'

interface BatchRequest {
  procedure: string
  input?: any
  resolve: (data: any) => void
  reject: (error: Error) => void
}

class TRPCBatcher {
  private queue: BatchRequest[] = []
  private timeout: NodeJS.Timeout | null = null
  private readonly maxBatchSize = 10 // Max requests per batch
  private readonly maxWaitMs = 10 // Wait 10ms for more requests before sending

  /**
   * Add a request to the batch queue
   */
  async enqueue<T>(procedure: string, input?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ procedure, input, resolve, reject })

      // Schedule batch processing
      if (this.queue.length >= this.maxBatchSize) {
        // Send immediately if we hit max batch size
        this.flush()
      } else if (!this.timeout) {
        // Otherwise wait a bit for more requests
        this.timeout = setTimeout(() => this.flush(), this.maxWaitMs)
      }
    })
  }

  /**
   * Process and send all queued requests
   */
  private async flush() {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }

    if (this.queue.length === 0) return

    const batch = this.queue.splice(0, this.maxBatchSize)

    try {
      // Get auth headers
      const authHeaders: Record<string, string> = {}
      if (typeof window !== 'undefined') {
        const accessToken =
          localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
        if (accessToken) {
          authHeaders['Authorization'] = 'Bearer ' + accessToken
        }
      }

      // Send batched request
      const response = await fetch(`${TRPC_URL}/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        credentials: 'include',
        body: JSON.stringify(
          batch.map((req, index) => ({
            id: index,
            procedure: req.procedure,
            input: req.input,
          }))
        ),
      })

      if (!response.ok) {
        throw new Error(`Batch request failed: ${response.statusText}`)
      }

      const results = await response.json()

      // Resolve individual requests
      batch.forEach((req, index) => {
        const result = results[index]
        if (result && 'error' in result) {
          req.reject(new Error(result.error.message || 'Request failed'))
        } else if (result && 'result' in result) {
          req.resolve(result.result.data)
        } else {
          req.reject(new Error('Invalid response format'))
        }
      })
    } catch (error) {
      // Reject all requests in the batch on failure
      batch.forEach((req) => {
        req.reject(error instanceof Error ? error : new Error('Batch request failed'))
      })
    }
  }
}

// Singleton instance
export const trpcBatcher = new TRPCBatcher()

/**
 * Execute a batched tRPC query
 * Automatically batches concurrent requests
 */
export async function batchedQuery<T>(procedure: string, input?: any): Promise<T> {
  return trpcBatcher.enqueue<T>(procedure, input)
}

/**
 * Utility to batch multiple queries at once
 * Useful when you know you need multiple queries upfront
 */
export async function batchQueries<T extends Record<string, any>>(
  queries: Record<keyof T, { procedure: string; input?: any }>
): Promise<T> {
  const promises = Object.entries(queries).map(async ([key, { procedure, input }]) => {
    const result = await batchedQuery(procedure, input)
    return [key, result]
  })

  const results = await Promise.all(promises)
  return Object.fromEntries(results) as T
}
