/**
 * tRPC Client Setup
 * 
 * This file sets up the tRPC client for the frontend to communicate with the backend API.
 * It handles authentication, error handling, and request/response processing.
 */

import { createTRPCClient, httpBatchLink } from '@trpc/client'

// Backend API URL
const TRPC_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3005/api/trpc'

// Create the tRPC client with any type to avoid router constraint issues
export const trpc = createTRPCClient<any>({
  links: [
    httpBatchLink({
      url: TRPC_URL,
      headers: () => {
        // Get auth token from localStorage or sessionStorage
        if (typeof window !== 'undefined') {
          const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
          if (accessToken) {
            return {
              Authorization: `Bearer ${accessToken}`,
            }
          }
        }
        return {}
      },
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          credentials: 'include',
        })
      },
    }),
  ],
})

// Export a generic type for API calls
export type TRPCClient = typeof trpc
