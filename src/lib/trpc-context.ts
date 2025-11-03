/**
 * tRPC Context
 * 
 * This file creates the context for tRPC requests on the frontend.
 * It handles authentication and request context.
 */

import { NextRequest } from 'next/server'

export interface Context {
  req: NextRequest
  user?: {
    id: string
    email: string
    role: string
  }
}

export function createContext({ req }: { req: NextRequest }): Context {
  // Extract user information from the request if available
  // This would typically come from JWT tokens or session cookies
  const authHeader = req.headers.get('authorization')
  let user: Context['user'] | undefined

  if (authHeader?.startsWith('Bearer ')) {
    try {
      // In a real implementation, you would decode the JWT token here
      // For now, we'll just return a basic context
      const token = authHeader.substring(7)
      // TODO: Decode JWT token and extract user info
      user = {
        id: 'user-id',
        email: 'user@example.com',
        role: 'user'
      }
    } catch (error) {
      // Invalid token, user remains undefined
    }
  }

  return {
    req,
    user
  }
}
