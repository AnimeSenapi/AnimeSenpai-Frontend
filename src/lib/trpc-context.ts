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

/**
 * Decode JWT token payload without verification
 * Note: Verification happens on the backend - this is just for extracting user info
 */
function decodeJWT(token: string): { userId?: string; email?: string; sessionId?: string } | null {
  try {
    // JWT tokens have three parts: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Decode the payload (second part)
    const payload = parts[1]
    if (!payload) return null
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    const decoded = Buffer.from(paddedPayload, 'base64url').toString('utf-8')
    const parsed = JSON.parse(decoded)

    return {
      userId: parsed.userId,
      email: parsed.email,
      sessionId: parsed.sessionId,
    }
  } catch (error) {
    // Invalid token format
    return null
  }
}

export function createContext({ req }: { req: NextRequest }): Context {
  // Extract user information from the request if available
  // This would typically come from JWT tokens or session cookies
  const authHeader = req.headers.get('authorization')
  let user: Context['user'] | undefined

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7)
      const payload = decodeJWT(token)
      
      if (payload?.userId && payload?.email) {
        user = {
          id: payload.userId,
          email: payload.email,
          role: 'user', // Default role - actual role is determined by backend
        }
      }
    } catch (error) {
      // Invalid token, user remains undefined
      console.debug('Failed to decode JWT token in context:', error)
    }
  }

  return {
    req,
    user
  }
}
