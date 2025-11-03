/**
 * tRPC API Route Handler
 * 
 * This route proxies tRPC requests to the backend API server.
 * The frontend doesn't run the tRPC server directly - it forwards requests to the backend.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/trpc', '') || 'http://localhost:3005'

async function handler(req: Request) {
  const url = new URL(req.url)
  const path = url.pathname.replace('/api/trpc', '')
  
  // Forward the request to the backend
  const backendUrl = `${BACKEND_URL}/api/trpc${path}${url.search}`
  
  try {
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        ...Object.fromEntries(req.headers.entries()),
        'host': new URL(BACKEND_URL).host,
      },
      body: req.method !== 'GET' ? await req.text() : undefined,
    })

    // Return the response with CORS headers
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
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

export { handler as GET, handler as POST }
