// Service Worker for Proxy Manager
const CACHE_NAME = 'proxy-manager-v1'
const STATIC_CACHE = 'proxy-manager-static-v1'
const DYNAMIC_CACHE = 'proxy-manager-dynamic-v1'

// Files to cache on install
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/test-proxy/,
  /\/api\/proxy-stats/,
  /\/api\/proxy-list/
]

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files...')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('Static files cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Failed to cache static files:', error)
      })
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Handle different types of requests
  if (isStaticFile(request)) {
    event.respondWith(handleStaticFile(request))
  } else if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request))
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request))
  } else {
    event.respondWith(handleOtherRequest(request))
  }
})

// Check if request is for static files
function isStaticFile(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith('/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.jpeg') ||
         url.pathname.endsWith('.gif') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.ico')
}

// Check if request is for API
function isApiRequest(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith('/api/')
}

// Check if request is for page
function isPageRequest(request) {
  const url = new URL(request.url)
  return url.origin === location.origin && !url.pathname.startsWith('/api/')
}

// Handle static files
async function handleStaticFile(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Fetch from network
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error('Error handling static file:', error)
    return new Response('Static file not available', { status: 404 })
  }
}

// Handle API requests
async function handleApiRequest(request) {
  try {
    // Try cache first for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        // Return cached response but update in background
        updateCacheInBackground(request)
        return cachedResponse
      }
    }

    // Fetch from network
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error('Error handling API request:', error)
    
    // Try to return cached response on network error
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    return new Response('API not available', { status: 503 })
  }
}

// Handle page requests
async function handlePageRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Fetch from network
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error('Error handling page request:', error)
    return new Response('Page not available', { status: 404 })
  }
}

// Handle other requests
async function handleOtherRequest(request) {
  try {
    return await fetch(request)
  } catch (error) {
    console.error('Error handling other request:', error)
    return new Response('Request failed', { status: 500 })
  }
}

// Update cache in background
async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
  } catch (error) {
    console.error('Background cache update failed:', error)
  }
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  const { type, payload } = event.data

  switch (type) {
    case 'CLEAR_CACHE':
      clearCache(payload?.cacheName)
      break
    case 'CACHE_URLS':
      cacheUrls(payload?.urls)
      break
    case 'GET_CACHE_SIZE':
      getCacheSize()
      break
    default:
      console.log('Unknown message type:', type)
  }
})

// Clear cache
async function clearCache(cacheName) {
  try {
    if (cacheName) {
      await caches.delete(cacheName)
      console.log(`Cache ${cacheName} cleared`)
    } else {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      console.log('All caches cleared')
    }
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}

// Cache specific URLs
async function cacheUrls(urls) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    await Promise.all(urls.map(url => cache.add(url)))
    console.log('URLs cached successfully')
  } catch (error) {
    console.error('Error caching URLs:', error)
  }
}

// Get cache size
async function getCacheSize() {
  try {
    const cacheNames = await caches.keys()
    const cacheSizes = {}
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      cacheSizes[cacheName] = keys.length
    }
    
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CACHE_SIZE_RESPONSE',
          payload: cacheSizes
        })
      })
    })
  } catch (error) {
    console.error('Error getting cache size:', error)
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  switch (event.tag) {
    case 'proxy-test-sync':
      event.waitUntil(syncProxyTests())
      break
    case 'proxy-import-sync':
      event.waitUntil(syncProxyImports())
      break
    default:
      console.log('Unknown sync tag:', event.tag)
  }
})

// Sync proxy tests
async function syncProxyTests() {
  try {
    // Get pending proxy tests from IndexedDB
    const pendingTests = await getPendingProxyTests()
    
    for (const test of pendingTests) {
      try {
        const response = await fetch('/api/test-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(test)
        })
        
        if (response.ok) {
          await removePendingProxyTest(test.id)
        }
      } catch (error) {
        console.error('Failed to sync proxy test:', error)
      }
    }
  } catch (error) {
    console.error('Error syncing proxy tests:', error)
  }
}

// Sync proxy imports
async function syncProxyImports() {
  try {
    // Get pending proxy imports from IndexedDB
    const pendingImports = await getPendingProxyImports()
    
    for (const importData of pendingImports) {
      try {
        const response = await fetch('/api/import-proxies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(importData)
        })
        
        if (response.ok) {
          await removePendingProxyImport(importData.id)
        }
      } catch (error) {
        console.error('Failed to sync proxy import:', error)
      }
    }
  } catch (error) {
    console.error('Error syncing proxy imports:', error)
  }
}

// IndexedDB helpers (simplified)
async function getPendingProxyTests() {
  // Implementation would go here
  return []
}

async function removePendingProxyTest(id) {
  // Implementation would go here
}

async function getPendingProxyImports() {
  // Implementation would go here
  return []
}

async function removePendingProxyImport(id) {
  // Implementation would go here
}
