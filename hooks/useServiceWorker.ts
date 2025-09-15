'use client'

import { useState, useEffect, useCallback } from 'react'

interface ServiceWorkerState {
  isSupported: boolean
  isInstalled: boolean
  isActivated: boolean
  isOnline: boolean
  registration: ServiceWorkerRegistration | null
  error: Error | null
}

interface ServiceWorkerOptions {
  onUpdate?: (registration: ServiceWorkerRegistration) => void
  onSuccess?: (registration: ServiceWorkerRegistration) => void
  onError?: (error: Error) => void
  autoUpdate?: boolean
  checkInterval?: number
}

export function useServiceWorker(options: ServiceWorkerOptions = {}) {
  const {
    onUpdate,
    onSuccess,
    onError,
    autoUpdate = true,
    checkInterval = 60000 // 1 minute
  } = options

  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isInstalled: false,
    isActivated: false,
    isOnline: navigator.onLine,
    registration: null,
    error: null
  })

  // Check if service worker is supported
  useEffect(() => {
    const isSupported = 'serviceWorker' in navigator
    setState(prev => ({ ...prev, isSupported }))
  }, [])

  // Register service worker
  const register = useCallback(async () => {
    if (!state.isSupported) {
      const error = new Error('Service Worker not supported')
      setState(prev => ({ ...prev, error }))
      onError?.(error)
      return null
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      setState(prev => ({ ...prev, registration, error: null }))

      // Handle registration success
      if (registration.installing) {
        console.log('Service Worker installing...')
        registration.installing.addEventListener('statechange', (e) => {
          if ((e.target as ServiceWorker).state === 'installed') {
            setState(prev => ({ ...prev, isInstalled: true }))
            onSuccess?.(registration)
          }
        })
      } else if (registration.waiting) {
        console.log('Service Worker waiting...')
        setState(prev => ({ ...prev, isInstalled: true }))
        onSuccess?.(registration)
      } else if (registration.active) {
        console.log('Service Worker active')
        setState(prev => ({ ...prev, isInstalled: true, isActivated: true }))
        onSuccess?.(registration)
      }

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available
                setState(prev => ({ ...prev, isInstalled: true }))
                onUpdate?.(registration)
              } else {
                // Content is cached for the first time
                setState(prev => ({ ...prev, isInstalled: true, isActivated: true }))
                onSuccess?.(registration)
              }
            }
          })
        }
      })

      return registration
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to register service worker')
      setState(prev => ({ ...prev, error: errorObj }))
      onError?.(errorObj)
      return null
    }
  }, [state.isSupported, onUpdate, onSuccess, onError])

  // Unregister service worker
  const unregister = useCallback(async () => {
    if (!state.registration) return false

    try {
      const success = await state.registration.unregister()
      if (success) {
        setState(prev => ({
          ...prev,
          isInstalled: false,
          isActivated: false,
          registration: null
        }))
      }
      return success
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to unregister service worker')
      setState(prev => ({ ...prev, error: errorObj }))
      onError?.(errorObj)
      return false
    }
  }, [state.registration, onError])

  // Update service worker
  const update = useCallback(async () => {
    if (!state.registration) return false

    try {
      await state.registration.update()
      return true
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to update service worker')
      setState(prev => ({ ...prev, error: errorObj }))
      onError?.(errorObj)
      return false
    }
  }, [state.registration, onError])

  // Skip waiting and activate new service worker
  const skipWaiting = useCallback(async () => {
    if (!state.registration?.waiting) return false

    try {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      return true
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to skip waiting')
      setState(prev => ({ ...prev, error: errorObj }))
      onError?.(errorObj)
      return false
    }
  }, [state.registration, onError])

  // Clear cache
  const clearCache = useCallback(async (cacheName?: string) => {
    try {
      if (state.registration?.active) {
        state.registration.active.postMessage({
          type: 'CLEAR_CACHE',
          payload: { cacheName }
        })
      }
      return true
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to clear cache')
      setState(prev => ({ ...prev, error: errorObj }))
      onError?.(errorObj)
      return false
    }
  }, [state.registration, onError])

  // Cache URLs
  const cacheUrls = useCallback(async (urls: string[]) => {
    try {
      if (state.registration?.active) {
        state.registration.active.postMessage({
          type: 'CACHE_URLS',
          payload: { urls }
        })
      }
      return true
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to cache URLs')
      setState(prev => ({ ...prev, error: errorObj }))
      onError?.(errorObj)
      return false
    }
  }, [state.registration, onError])

  // Get cache size
  const getCacheSize = useCallback(async () => {
    return new Promise<Record<string, number>>((resolve, reject) => {
      if (!state.registration?.active) {
        reject(new Error('No active service worker'))
        return
      }

      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'CACHE_SIZE_RESPONSE') {
          navigator.serviceWorker.removeEventListener('message', handleMessage)
          resolve(event.data.payload)
        }
      }

      navigator.serviceWorker.addEventListener('message', handleMessage)
      state.registration.active.postMessage({ type: 'GET_CACHE_SIZE' })

      // Timeout after 5 seconds
      setTimeout(() => {
        navigator.serviceWorker.removeEventListener('message', handleMessage)
        reject(new Error('Timeout getting cache size'))
      }, 5000)
    })
  }, [state.registration])

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-register on mount
  useEffect(() => {
    if (state.isSupported && !state.registration) {
      register()
    }
  }, [state.isSupported, state.registration, register])

  // Auto-update check
  useEffect(() => {
    if (!autoUpdate || !state.registration) return

    const interval = setInterval(() => {
      update()
    }, checkInterval)

    return () => clearInterval(interval)
  }, [autoUpdate, state.registration, update, checkInterval])

  // Handle service worker controller change
  useEffect(() => {
    const handleControllerChange = () => {
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
    }
  }, [])

  return {
    ...state,
    register,
    unregister,
    update,
    skipWaiting,
    clearCache,
    cacheUrls,
    getCacheSize
  }
}

// Hook for offline detection
export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        setWasOffline(false)
        // Trigger sync when coming back online
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SYNC_OFFLINE_ACTIONS' })
        }
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  return { isOnline, wasOffline }
}

// Hook for cache management
export function useCacheManagement() {
  const [cacheSize, setCacheSize] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(false)

  const { getCacheSize, clearCache } = useServiceWorker()

  const refreshCacheSize = useCallback(async () => {
    setIsLoading(true)
    try {
      const size = await getCacheSize()
      setCacheSize(size)
    } catch (error) {
      console.error('Failed to get cache size:', error)
    } finally {
      setIsLoading(false)
    }
  }, [getCacheSize])

  const clearAllCache = useCallback(async () => {
    setIsLoading(true)
    try {
      await clearCache()
      await refreshCacheSize()
    } catch (error) {
      console.error('Failed to clear cache:', error)
    } finally {
      setIsLoading(false)
    }
  }, [clearCache, refreshCacheSize])

  const clearSpecificCache = useCallback(async (cacheName: string) => {
    setIsLoading(true)
    try {
      await clearCache(cacheName)
      await refreshCacheSize()
    } catch (error) {
      console.error('Failed to clear specific cache:', error)
    } finally {
      setIsLoading(false)
    }
  }, [clearCache, refreshCacheSize])

  useEffect(() => {
    refreshCacheSize()
  }, [refreshCacheSize])

  return {
    cacheSize,
    isLoading,
    refreshCacheSize,
    clearAllCache,
    clearSpecificCache
  }
}

export default useServiceWorker
