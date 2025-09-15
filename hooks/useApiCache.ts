'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface ApiCacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
  staleWhileRevalidate?: boolean // Return stale data while revalidating
}

interface ApiCacheState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  lastUpdated: number | null
}

export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: ApiCacheOptions = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    maxSize = 100,
    staleWhileRevalidate = true
  } = options

  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map())
  const [state, setState] = useState<ApiCacheState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  })

  const isExpired = useCallback((entry: CacheEntry<T>) => {
    return Date.now() - entry.timestamp > entry.ttl
  }, [])

  const getCachedData = useCallback((cacheKey: string): T | null => {
    const entry = cacheRef.current.get(cacheKey)
    if (!entry) return null

    if (isExpired(entry)) {
      cacheRef.current.delete(cacheKey)
      return null
    }

    return entry.data
  }, [isExpired])

  const setCachedData = useCallback((cacheKey: string, data: T) => {
    // Remove oldest entries if cache is full
    if (cacheRef.current.size >= maxSize) {
      const oldestKey = cacheRef.current.keys().next().value
      if (oldestKey) {
        cacheRef.current.delete(oldestKey)
      }
    }

    cacheRef.current.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }, [maxSize, ttl])

  const fetchData = useCallback(async (forceRefresh = false) => {
    const cacheKey = key
    const cachedData = getCachedData(cacheKey)

    // Return cached data if available and not forcing refresh
    if (cachedData && !forceRefresh) {
      setState(prev => ({
        ...prev,
        data: cachedData,
        loading: false,
        error: null
      }))
      return cachedData
    }

    // If we have stale data and staleWhileRevalidate is enabled, return it
    if (cachedData && staleWhileRevalidate && !forceRefresh) {
      setState(prev => ({
        ...prev,
        data: cachedData,
        loading: true,
        error: null
      }))
    } else {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null
      }))
    }

    try {
      const data = await fetcher()
      setCachedData(cacheKey, data)
      
      setState(prev => ({
        ...prev,
        data,
        loading: false,
        error: null,
        lastUpdated: Date.now()
      }))

      return data
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error')
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorObj
      }))

      throw errorObj
    }
  }, [key, fetcher, getCachedData, setCachedData, staleWhileRevalidate])

  const invalidate = useCallback(() => {
    cacheRef.current.delete(key)
    setState(prev => ({
      ...prev,
      data: null,
      lastUpdated: null
    }))
  }, [key])

  const clearCache = useCallback(() => {
    cacheRef.current.clear()
    setState(prev => ({
      ...prev,
      data: null,
      lastUpdated: null
    }))
  }, [])

  const refresh = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  // Auto-fetch on mount if no cached data
  useEffect(() => {
    const cachedData = getCachedData(key)
    if (!cachedData) {
      fetchData()
    } else {
      setState(prev => ({
        ...prev,
        data: cachedData,
        loading: false,
        error: null
      }))
    }
  }, [key, getCachedData, fetchData])

  return {
    ...state,
    fetchData,
    refresh,
    invalidate,
    clearCache,
    isCached: cacheRef.current.has(key) && !isExpired(cacheRef.current.get(key)!)
  }
}

// Hook for caching multiple API calls
export function useMultiApiCache<T>(
  keys: string[],
  fetcher: (key: string) => Promise<T>,
  options: ApiCacheOptions = {}
) {
  const [state, setState] = useState<Record<string, ApiCacheState<T>>>({})
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map())

  const {
    ttl = 5 * 60 * 1000,
    maxSize = 100,
    staleWhileRevalidate = true
  } = options

  const isExpired = useCallback((entry: CacheEntry<T>) => {
    return Date.now() - entry.timestamp > entry.ttl
  }, [])

  const getCachedData = useCallback((cacheKey: string): T | null => {
    const entry = cacheRef.current.get(cacheKey)
    if (!entry) return null

    if (isExpired(entry)) {
      cacheRef.current.delete(cacheKey)
      return null
    }

    return entry.data
  }, [isExpired])

  const setCachedData = useCallback((cacheKey: string, data: T) => {
    if (cacheRef.current.size >= maxSize) {
      const oldestKey = cacheRef.current.keys().next().value
      if (oldestKey) {
        cacheRef.current.delete(oldestKey)
      }
    }

    cacheRef.current.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }, [maxSize, ttl])

  const fetchData = useCallback(async (key: string, forceRefresh = false) => {
    const cachedData = getCachedData(key)

    if (cachedData && !forceRefresh) {
      setState(prev => ({
        ...prev,
        [key]: {
          data: cachedData,
          loading: false,
          error: null,
          lastUpdated: Date.now()
        }
      }))
      return cachedData
    }

    if (cachedData && staleWhileRevalidate && !forceRefresh) {
      setState(prev => ({
        ...prev,
        [key]: {
          data: cachedData,
          loading: true,
          error: null,
          lastUpdated: Date.now()
        }
      }))
    } else {
      setState(prev => ({
        ...prev,
        [key]: {
          data: null,
          loading: true,
          error: null,
          lastUpdated: null
        }
      }))
    }

    try {
      const data = await fetcher(key)
      setCachedData(key, data)
      
      setState(prev => ({
        ...prev,
        [key]: {
          data,
          loading: false,
          error: null,
          lastUpdated: Date.now()
        }
      }))

      return data
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error')
      
      setState(prev => ({
        ...prev,
        [key]: {
          data: null,
          loading: false,
          error: errorObj,
          lastUpdated: null
        }
      }))

      throw errorObj
    }
  }, [fetcher, getCachedData, setCachedData, staleWhileRevalidate])

  const fetchAll = useCallback(async (forceRefresh = false) => {
    const promises = keys.map(key => fetchData(key, forceRefresh))
    return Promise.allSettled(promises)
  }, [keys, fetchData])

  const invalidate = useCallback((key: string) => {
    cacheRef.current.delete(key)
    setState(prev => ({
      ...prev,
      [key]: {
        data: null,
        loading: false,
        error: null,
        lastUpdated: null
      }
    }))
  }, [])

  const clearCache = useCallback(() => {
    cacheRef.current.clear()
    setState({})
  }, [])

  return {
    state,
    fetchData,
    fetchAll,
    invalidate,
    clearCache
  }
}

export default useApiCache
