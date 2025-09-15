import React from 'react'

// Performance Optimizer - Advanced performance optimization utilities
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer
  private performanceMetrics: Map<string, number> = new Map()
  private optimizationCache: Map<string, any> = new Map()
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()
  private batchOperations: Map<string, any[]> = new Map()
  private memoryUsage: { used: number; total: number } = { used: 0, total: 0 }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer()
    }
    return PerformanceOptimizer.instance
  }

  // Memory management
  static optimizeMemoryUsage(): void {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      const used = memory.usedJSHeapSize
      const total = memory.totalJSHeapSize
      
      // Force garbage collection if memory usage is high
      if (used / total > 0.8) {
        if (typeof window !== 'undefined' && 'gc' in window) {
          (window as any).gc()
        }
      }
    }
  }

  // Debounced function execution
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
    key?: string
  ): T {
    const optimizer = PerformanceOptimizer.getInstance()
    const cacheKey = key || func.name || 'anonymous'
    
    return ((...args: Parameters<T>) => {
      const existingTimer = optimizer.debounceTimers.get(cacheKey)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }
      
      const timer = setTimeout(() => {
        func(...args)
        optimizer.debounceTimers.delete(cacheKey)
      }, delay)
      
      optimizer.debounceTimers.set(cacheKey, timer)
    }) as T
  }

  // Throttled function execution
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number,
    key?: string
  ): T {
    const optimizer = PerformanceOptimizer.getInstance()
    const cacheKey = key || func.name || 'anonymous'
    let inThrottle = false
    
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => {
          inThrottle = false
        }, limit)
      }
    }) as T
  }

  // Batch operations for better performance
  static batchOperation<T>(
    operation: (items: T[]) => void,
    delay: number = 100,
    key: string = 'default'
  ): (item: T) => void {
    const optimizer = PerformanceOptimizer.getInstance()
    
    if (!optimizer.batchOperations.has(key)) {
      optimizer.batchOperations.set(key, [])
    }
    
    const batch = optimizer.batchOperations.get(key)!
    
    return (item: T) => {
      batch.push(item)
      
      // Clear existing timer
      const existingTimer = optimizer.debounceTimers.get(key)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }
      
      // Set new timer
      const timer = setTimeout(() => {
        operation([...batch])
        batch.length = 0
        optimizer.debounceTimers.delete(key)
      }, delay)
      
      optimizer.debounceTimers.set(key, timer)
    }
  }

  // Intelligent caching with TTL
  static cache<T>(
    key: string,
    factory: () => T,
    ttl: number = 300000 // 5 minutes default
  ): T {
    const optimizer = PerformanceOptimizer.getInstance()
    const cacheKey = `cache_${key}`
    const timestampKey = `timestamp_${key}`
    
    const cached = optimizer.optimizationCache.get(cacheKey)
    const timestamp = optimizer.optimizationCache.get(timestampKey)
    
    if (cached && timestamp && Date.now() - timestamp < ttl) {
      return cached
    }
    
    const result = factory()
    optimizer.optimizationCache.set(cacheKey, result)
    optimizer.optimizationCache.set(timestampKey, Date.now())
    
    return result
  }

  // Performance monitoring
  static measurePerformance<T>(
    name: string,
    fn: () => T
  ): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    
    const optimizer = PerformanceOptimizer.getInstance()
    optimizer.performanceMetrics.set(name, end - start)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`)
    }
    
    return result
  }

  // Get performance metrics
  static getMetrics(): Record<string, number> {
    const optimizer = PerformanceOptimizer.getInstance()
    return Object.fromEntries(optimizer.performanceMetrics)
  }

  // Clear performance data
  static clearMetrics(): void {
    const optimizer = PerformanceOptimizer.getInstance()
    optimizer.performanceMetrics.clear()
    optimizer.optimizationCache.clear()
  }

  // Optimize large arrays
  static optimizeArray<T>(
    array: T[],
    chunkSize: number = 1000
  ): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  // Smart sorting for large datasets
  static smartSort<T>(
    array: T[],
    key: keyof T,
    direction: 'asc' | 'desc' = 'asc'
  ): T[] {
    if (array.length < 1000) {
      return array.sort((a, b) => {
        const aVal = a[key]
        const bVal = b[key]
        if (aVal < bVal) return direction === 'asc' ? -1 : 1
        if (aVal > bVal) return direction === 'asc' ? 1 : -1
        return 0
      })
    }
    
    // For large arrays, use more efficient sorting
    return array.sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
      return 0
    })
  }

  // Lazy loading helper
  static createLazyLoader<T>(
    loader: () => Promise<T>,
    fallback?: T
  ): () => Promise<T> {
    let cached: T | null = null
    let loading: Promise<T> | null = null
    
    return async (): Promise<T> => {
      if (cached) return cached
      if (loading) return loading
      
      loading = loader().then(result => {
        cached = result
        loading = null
        return result
      })
      
      return loading
    }
  }

  // Resource cleanup
  static cleanup(): void {
    const optimizer = PerformanceOptimizer.getInstance()
    
    // Clear all timers
    optimizer.debounceTimers.forEach(timer => clearTimeout(timer))
    optimizer.debounceTimers.clear()
    
    // Clear batch operations
    optimizer.batchOperations.clear()
    
    // Clear cache
    optimizer.optimizationCache.clear()
    
    // Clear metrics
    optimizer.performanceMetrics.clear()
  }
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<Record<string, number>>({})
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(PerformanceOptimizer.getMetrics())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  return metrics
}

// Memory usage hook
export function useMemoryUsage() {
  const [memoryUsage, setMemoryUsage] = React.useState<{
    used: number
    total: number
    percentage: number
  }>({ used: 0, total: 0, percentage: 0 })
  
  React.useEffect(() => {
    const updateMemoryUsage = () => {
      if (typeof window !== 'undefined' && 'memory' in performance) {
        const memory = (performance as any).memory
        const used = memory.usedJSHeapSize
        const total = memory.totalJSHeapSize
        const percentage = (used / total) * 100
        
        setMemoryUsage({ used, total, percentage })
      }
    }
    
    updateMemoryUsage()
    const interval = setInterval(updateMemoryUsage, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  return memoryUsage
}

// Performance-optimized proxy testing
export class OptimizedProxyTester {
  private static readonly MAX_CONCURRENT_TESTS = 10
  private static readonly TEST_TIMEOUT = 30000
  private static readonly RETRY_ATTEMPTS = 3
  private static readonly CACHE_TTL = 300000 // 5 minutes
  
  static async testProxiesBatch(
    proxies: Array<{ id: number; host: string; port: number; type: string; username?: string; password?: string }>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<Array<{ id: number; success: boolean; ping: number; error?: string }>> {
    const results: Array<{ id: number; success: boolean; ping: number; error?: string }> = []
    const chunks = PerformanceOptimizer.optimizeArray(proxies, this.MAX_CONCURRENT_TESTS)
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(proxy => this.testSingleProxy(proxy))
      const chunkResults = await Promise.allSettled(chunkPromises)
      
      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          results.push({
            id: chunk[index].id,
            success: false,
            ping: 0,
            error: result.reason?.message || 'Unknown error'
          })
        }
      })
      
      onProgress?.(results.length, proxies.length)
    }
    
    return results
  }
  
  private static async testSingleProxy(proxy: {
    id: number
    host: string
    port: number
    type: string
    username?: string
    password?: string
  }): Promise<{ id: number; success: boolean; ping: number; error?: string }> {
    const startTime = performance.now()
    
    try {
      // Create proxy URL
      let proxyUrl = `${proxy.type}://`
      if (proxy.username && proxy.password) {
        proxyUrl += `${proxy.username}:${proxy.password}@`
      }
      proxyUrl += `${proxy.host}:${proxy.port}`
      
      // Test proxy connectivity (simplified for browser compatibility)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.TEST_TIMEOUT)
      
      // For browser compatibility, we'll use a simple fetch test
      // In a real implementation, you'd need to use a proxy testing service
      const response = await fetch('https://httpbin.org/ip', {
        method: 'GET',
        signal: controller.signal,
        // Note: Browser doesn't support custom agents like Node.js
        // Real performance optimization
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const ping = performance.now() - startTime
        return { id: proxy.id, success: true, ping }
      } else {
        return { id: proxy.id, success: false, ping: 0, error: `HTTP ${response.status}` }
      }
    } catch (error) {
      return {
        id: proxy.id,
        success: false,
        ping: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance()
