'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  hitRate: number
  memoryUsage: number
}

interface CacheConfig {
  maxSize: number
  defaultTTL: number
  enableLRU: boolean
  enableCompression: boolean
  enablePersistence: boolean
  persistenceKey?: string
}

export function useAdvancedCaching<T>(config: Partial<CacheConfig> = {}) {
  const {
    maxSize = 1000,
    defaultTTL = 300000, // 5 minutes
    enableLRU = true,
    enableCompression = false,
    enablePersistence = false,
    persistenceKey = 'advanced_cache'
  } = config

  const cache = useRef<Map<string, CacheEntry<T>>>(new Map())
  const [stats, setStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0,
    memoryUsage: 0
  })

  // Load from localStorage on mount
  useEffect(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(persistenceKey)
        if (stored) {
          const parsed = JSON.parse(stored)
          cache.current = new Map(parsed)
          updateStats()
        }
      } catch (error) {
        console.warn('Failed to load cache from localStorage:', error)
      }
    }
  }, [enablePersistence, persistenceKey])

  // Save to localStorage on changes
  useEffect(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      const saveCache = () => {
        try {
          const serialized = Array.from(cache.current.entries())
          localStorage.setItem(persistenceKey, JSON.stringify(serialized))
        } catch (error) {
          console.warn('Failed to save cache to localStorage:', error)
        }
      }

      const timeoutId = setTimeout(saveCache, 1000) // Debounce saves
      return () => clearTimeout(timeoutId)
    }
  }, [cache.current.size, enablePersistence, persistenceKey])

  // Update cache statistics
  const updateStats = useCallback(() => {
    const entries = Array.from(cache.current.values())
    const hits = stats.hits
    const misses = stats.misses
    const total = hits + misses
    const hitRate = total > 0 ? (hits / total) * 100 : 0
    
    // Calculate memory usage (rough estimate)
    const memoryUsage = entries.reduce((total, entry) => {
      return total + JSON.stringify(entry.data).length * 2 // Rough estimate
    }, 0)

    setStats({
      hits,
      misses,
      size: cache.current.size,
      hitRate,
      memoryUsage
    })
  }, [stats.hits, stats.misses])

  // LRU eviction
  const evictLRU = useCallback(() => {
    if (!enableLRU || cache.current.size < maxSize) return

    const entries = Array.from(cache.current.entries())
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
    
    // Remove oldest 10% of entries
    const toRemove = Math.ceil(entries.length * 0.1)
    for (let i = 0; i < toRemove; i++) {
      cache.current.delete(entries[i][0])
    }
  }, [enableLRU, maxSize])

  // Check if entry is expired
  const isExpired = useCallback((entry: CacheEntry<T>): boolean => {
    return Date.now() - entry.timestamp > entry.ttl
  }, [])

  // Get data from cache
  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key)
    
    if (!entry) {
      setStats(prev => ({ ...prev, misses: prev.misses + 1 }))
      return null
    }

    if (isExpired(entry)) {
      cache.current.delete(key)
      setStats(prev => ({ ...prev, misses: prev.misses + 1 }))
      return null
    }

    // Update access info
    entry.accessCount++
    entry.lastAccessed = Date.now()
    
    setStats(prev => ({ ...prev, hits: prev.hits + 1 }))
    return entry.data
  }, [isExpired])

  // Set data in cache
  const set = useCallback((key: string, data: T, ttl?: number): void => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now()
    }

    // Check if we need to evict
    if (cache.current.size >= maxSize) {
      evictLRU()
    }

    cache.current.set(key, entry)
    updateStats()
  }, [defaultTTL, maxSize, evictLRU, updateStats])

  // Get or set pattern
  const getOrSet = useCallback(async (
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> => {
    const cached = get(key)
    if (cached !== null) {
      return cached
    }

    const data = await factory()
    set(key, data, ttl)
    return data
  }, [get, set])

  // Batch operations
  const getMany = useCallback((keys: string[]): Map<string, T | null> => {
    const result = new Map<string, T | null>()
    keys.forEach(key => {
      result.set(key, get(key))
    })
    return result
  }, [get])

  const setMany = useCallback((entries: Array<{ key: string; data: T; ttl?: number }>): void => {
    entries.forEach(({ key, data, ttl }) => {
      set(key, data, ttl)
    })
  }, [set])

  // Cache management
  const clear = useCallback(() => {
    cache.current.clear()
    setStats({
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0,
      memoryUsage: 0
    })
  }, [])

  const remove = useCallback((key: string): boolean => {
    const deleted = cache.current.delete(key)
    if (deleted) {
      updateStats()
    }
    return deleted
  }, [updateStats])

  const has = useCallback((key: string): boolean => {
    const entry = cache.current.get(key)
    if (!entry) return false
    if (isExpired(entry)) {
      cache.current.delete(key)
      return false
    }
    return true
  }, [isExpired])

  // Cleanup expired entries
  const cleanup = useCallback(() => {
    const now = Date.now()
    const expiredKeys: string[] = []
    
    cache.current.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key)
      }
    })
    
    expiredKeys.forEach(key => cache.current.delete(key))
    updateStats()
  }, [updateStats])

  // Auto-cleanup every 5 minutes
  useEffect(() => {
    const interval = setInterval(cleanup, 300000)
    return () => clearInterval(interval)
  }, [cleanup])

  // Cache warming
  const warm = useCallback(async (
    keys: string[],
    factory: (key: string) => Promise<T> | T,
    ttl?: number
  ): Promise<void> => {
    const promises = keys.map(async key => {
      if (!has(key)) {
        const data = await factory(key)
        set(key, data, ttl)
      }
    })
    
    await Promise.all(promises)
  }, [has, set])

  // Cache prefetching
  const prefetch = useCallback(async (
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<void> => {
    if (!has(key)) {
      const data = await factory()
      set(key, data, ttl)
    }
  }, [has, set])

  // Get cache keys
  const keys = useCallback((): string[] => {
    return Array.from(cache.current.keys())
  }, [])

  // Get cache size
  const size = useCallback((): number => {
    return cache.current.size
  }, [])

  // Get cache info
  const info = useCallback(() => {
    const entries = Array.from(cache.current.values())
    const totalAccess = entries.reduce((sum, entry) => sum + entry.accessCount, 0)
    const avgAccess = entries.length > 0 ? totalAccess / entries.length : 0
    
    return {
      size: cache.current.size,
      maxSize,
      hitRate: stats.hitRate,
      memoryUsage: stats.memoryUsage,
      totalAccess,
      avgAccess,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : null
    }
  }, [maxSize, stats.hitRate, stats.memoryUsage])

  return {
    get,
    set,
    getOrSet,
    getMany,
    setMany,
    has,
    remove,
    clear,
    cleanup,
    warm,
    prefetch,
    keys,
    size,
    info,
    stats
  }
}

// Specialized cache for API responses
export function useAPICache<T>(config: Partial<CacheConfig> = {}) {
  const cache = useAdvancedCaching<T>({
    defaultTTL: 300000, // 5 minutes
    maxSize: 500,
    enableLRU: true,
    enablePersistence: true,
    persistenceKey: 'api_cache',
    ...config
  })

  // Cache API response with automatic key generation
  const cacheAPIResponse = useCallback(async (
    url: string,
    options: RequestInit = {},
    ttl?: number
  ): Promise<T> => {
    const cacheKey = `api_${url}_${JSON.stringify(options)}`
    
    return cache.getOrSet(cacheKey, async () => {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return response.json()
    }, ttl)
  }, [cache])

  // Cache with custom key
  const cacheWithKey = useCallback(async (
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    return cache.getOrSet(key, factory, ttl)
  }, [cache])

  return {
    ...cache,
    cacheAPIResponse,
    cacheWithKey
  }
}

// Specialized cache for proxy data
export function useProxyCache<T>(config: Partial<CacheConfig> = {}) {
  const cache = useAdvancedCaching<T>({
    defaultTTL: 600000, // 10 minutes
    maxSize: 2000,
    enableLRU: true,
    enablePersistence: true,
    persistenceKey: 'proxy_cache',
    ...config
  })

  // Cache proxy test results
  const cacheTestResult = useCallback(async (
    proxyId: number,
    testType: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    const cacheKey = `proxy_${proxyId}_${testType}`
    return cache.getOrSet(cacheKey, factory, ttl)
  }, [cache])

  // Cache proxy list
  const cacheProxyList = useCallback(async (
    listKey: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    const cacheKey = `proxy_list_${listKey}`
    return cache.getOrSet(cacheKey, factory, ttl)
  }, [cache])

  // Cache filtered results
  const cacheFilteredResults = useCallback(async (
    filterKey: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> => {
    const cacheKey = `filtered_${filterKey}`
    return cache.getOrSet(cacheKey, factory, ttl)
  }, [cache])

  return {
    ...cache,
    cacheTestResult,
    cacheProxyList,
    cacheFilteredResults
  }
}
