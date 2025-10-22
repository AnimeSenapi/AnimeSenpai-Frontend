// AnimeSenpai Service Worker
// Provides offline support and asset caching for better performance

const CACHE_NAME = 'animesenpai-v1'
const API_CACHE_NAME = 'animesenpai-api-v1'
const IMAGE_CACHE_NAME = 'animesenpai-images-v1'

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/assets/logo/AnimeSenpai_Inline.svg',
]

// API endpoints to cache (with TTL)
const API_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  
  // Skip waiting to activate immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![CACHE_NAME, API_CACHE_NAME, IMAGE_CACHE_NAME].includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  
  // Take control of all pages immediately
  return self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') return
  
  // Skip chrome extensions and other origins
  if (!url.origin.includes(self.location.origin) && !url.origin.includes('localhost')) {
    return
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/trpc')) {
    // API requests: Network first, cache fallback
    event.respondWith(networkFirstStrategy(request, API_CACHE_NAME, API_CACHE_TTL))
  } else if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    // Images: Cache first, network fallback
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE_NAME))
  } else {
    // Static assets: Cache first, network fallback
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME))
  }
})

// Cache-first strategy (for static assets and images)
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    // console.log('[SW] Serving from cache:', request.url)
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Fetch failed, no cache available:', request.url)
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return new Response(
        '<h1>Offline</h1><p>You are currently offline. Please check your internet connection.</p>',
        { headers: { 'Content-Type': 'text/html' } }
      )
    }
    
    throw error
  }
}

// Network-first strategy (for API requests)
async function networkFirstStrategy(request, cacheName, ttl) {
  const cache = await caches.open(cacheName)
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Clone and cache response with timestamp
      const responseToCache = networkResponse.clone()
      const headers = new Headers(responseToCache.headers)
      headers.append('sw-cached-at', Date.now().toString())
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      })
      
      cache.put(request, modifiedResponse)
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url)
    
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      // Check if cache is still fresh
      const cachedAt = cachedResponse.headers.get('sw-cached-at')
      if (cachedAt && Date.now() - parseInt(cachedAt) < ttl) {
        console.log('[SW] Serving fresh cached API response')
        return cachedResponse
      }
    }
    
    throw error
  }
}

// Message event - for cache management from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      )
    }).then(() => {
      event.ports[0].postMessage({ success: true })
    })
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    estimateCacheSize().then((size) => {
      event.ports[0].postMessage({ size })
    })
  }
})

// Helper: Estimate cache size
async function estimateCacheSize() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      usageInMB: (estimate.usage / (1024 * 1024)).toFixed(2),
      quotaInMB: (estimate.quota / (1024 * 1024)).toFixed(2),
    }
  }
  return null
}
