import { env } from '../../../../lib/env'

/**
 * tRPC API Route Handler
 * 
 * This route proxies tRPC requests to the backend API server.
 * The frontend doesn't run the tRPC server directly - it forwards requests to the backend.
 */

const BACKEND_URL = env.NEXT_PUBLIC_API_URL.replace(/\/api\/trpc\/?$/, '')

async function handler(req: Request) {
  const url = new URL(req.url)
  const path = url.pathname.replace('/api/trpc', '')
  
  // Forward the request to the backend
  const backendUrl = `${BACKEND_URL}/api/trpc${path}${url.search}`
  
  // Get the original origin from the request (browser's origin)
  const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'http://localhost:3000'
  
  // Filter and prepare headers for forwarding
  const headersToForward: Record<string, string> = {}
  const headersToSkip = new Set(['host', 'connection', 'upgrade', 'keep-alive', 'transfer-encoding'])
  
  // Forward relevant headers, skipping problematic ones
  for (const [key, value] of req.headers.entries()) {
    if (!headersToSkip.has(key.toLowerCase())) {
      headersToForward[key] = value
    }
  }
  
  // Explicitly ensure Authorization header is forwarded (case-insensitive check)
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
  if (authHeader) {
    headersToForward['authorization'] = authHeader
    // Debug logging for auth.me requests
    if (path === 'auth.me') {
      console.log('[Proxy] Forwarding Authorization header to backend:', authHeader.substring(0, 30) + '...')
    }
  } else if (path === 'auth.me') {
    console.warn('[Proxy] No Authorization header found in request for auth.me')
  }
  
  // Set origin to match what backend expects (for CORS)
  headersToForward['origin'] = origin
  
  // Add X-Forwarded-For to help backend identify client IP
  // Always set to 127.0.0.1 for proxy requests so backend recognizes it as localhost
  headersToForward['x-forwarded-for'] = '127.0.0.1'
  headersToForward['x-real-ip'] = '127.0.0.1'
  
  try {
    // Forward cookies from the original request
    const cookie = req.headers.get('cookie') || ''
    if (cookie) {
      headersToForward['cookie'] = cookie
    }
    
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: headersToForward,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
      // Include credentials (cookies) when forwarding to backend
      credentials: 'include',
    })

    // Read response body once (can only be read once)
    const responseBody = await response.text()
    
    // For debugging signin errors
    if (path === 'auth.signin' && !response.ok) {
      console.error('[Proxy] Backend signin error:', {
        status: response.status,
        statusText: response.statusText,
        responseText: responseBody.substring(0, 500),
        backendUrl,
        headers: Object.fromEntries(response.headers.entries())
      })
    }
    
    // Return the response with CORS headers
    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    })
  } catch (error) {
    console.error('tRPC proxy error:', error)
    return new Response(
      JSON.stringify({ error: 'Backend server unavailable' }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
}

export { handler as GET, handler as POST, handler as OPTIONS }
