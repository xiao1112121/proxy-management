'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { AdvancedStorageManager } from '@/utils/advancedStorageManager'

interface UseLazyProxyDataOptions {
  batchSize?: number
  maxItems?: number
  enableVirtualization?: boolean
}

export function useLazyProxyData(options: UseLazyProxyDataOptions = {}) {
  const { data: session } = useSession()
  const {
    batchSize = 500, // Giảm batch size để xử lý tốt hơn
    maxItems = 200000, // Tăng max items để hỗ trợ 200,000+ proxy
    enableVirtualization = true
  } = options

  const [allProxies, setAllProxies] = useState<Proxy[]>([])
  const [visibleProxies, setVisibleProxies] = useState<Proxy[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentBatch, setCurrentBatch] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  // Load initial data with better error handling
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        console.log('🔄 Loading proxy data...')
        const proxies = AdvancedStorageManager.loadProxies() || []
        console.log(`📊 Loaded ${proxies.length} proxies`)
        
        setAllProxies(proxies)
        setTotalCount(proxies.length)
        
        if (enableVirtualization) {
          // Load first batch for virtual scrolling
          const firstBatch = proxies.slice(0, batchSize)
          setVisibleProxies(firstBatch)
          setCurrentBatch(1)
          setHasMore(proxies.length > batchSize)
          console.log(`📋 Virtual scrolling enabled: showing ${firstBatch.length} of ${proxies.length} proxies`)
        } else {
          // Load all data for regular rendering
          setVisibleProxies(proxies)
          setHasMore(false)
          console.log(`📋 Regular rendering: showing all ${proxies.length} proxies`)
        }
      } catch (error) {
        console.error('❌ Failed to load proxy data:', error)
        // Set empty state on error
        setAllProxies([])
        setVisibleProxies([])
        setTotalCount(0)
        setHasMore(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [batchSize, enableVirtualization])

  // Load more data for virtual scrolling with better performance
  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return

    setIsLoading(true)
    try {
      const startIndex = currentBatch * batchSize
      const endIndex = Math.min(startIndex + batchSize, allProxies.length)
      const newBatch = allProxies.slice(startIndex, endIndex)
      
      console.log(`📋 Loading batch ${currentBatch + 1}: ${newBatch.length} proxies (${startIndex}-${endIndex})`)
      
      setVisibleProxies(prev => [...prev, ...newBatch])
      setCurrentBatch(prev => prev + 1)
      setHasMore(endIndex < allProxies.length)
      
      console.log(`✅ Loaded ${newBatch.length} more proxies. Total visible: ${visibleProxies.length + newBatch.length}`)
    } catch (error) {
      console.error('❌ Failed to load more data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [allProxies, currentBatch, batchSize, hasMore, isLoading, visibleProxies.length])

  // Add new proxy
  const addProxy = useCallback((proxy: Omit<Proxy, 'id'>) => {
    const newProxy: Proxy = {
      ...proxy,
      id: Date.now() + Math.random()
    }
    
    setAllProxies(prev => {
      const updated = [newProxy, ...prev]
      AdvancedStorageManager.saveProxies(updated)
      return updated
    })
    
    if (!enableVirtualization) {
      setVisibleProxies(prev => [newProxy, ...prev])
    }
  }, [enableVirtualization])

  // Update proxy
  const updateProxy = useCallback((id: number, updates: Partial<Proxy>) => {
    setAllProxies(prev => {
      const updated = prev.map(proxy => 
        proxy.id === id ? { ...proxy, ...updates } : proxy
      )
      AdvancedStorageManager.saveProxies(updated)
      return updated
    })
    
    if (!enableVirtualization) {
      setVisibleProxies(prev => 
        prev.map(proxy => 
          proxy.id === id ? { ...proxy, ...updates } : proxy
        )
      )
    }
  }, [enableVirtualization])

  // Delete proxy
  const deleteProxy = useCallback((id: number) => {
    setAllProxies(prev => {
      const updated = prev.filter(proxy => proxy.id !== id)
      AdvancedStorageManager.saveProxies(updated)
      return updated
    })
    
    if (!enableVirtualization) {
      setVisibleProxies(prev => prev.filter(proxy => proxy.id !== id))
    }
  }, [enableVirtualization])

  // Delete multiple proxies
  const deleteProxies = useCallback((ids: number[]) => {
    setAllProxies(prev => {
      const updated = prev.filter(proxy => !ids.includes(proxy.id))
      AdvancedStorageManager.saveProxies(updated)
      return updated
    })
    
    if (!enableVirtualization) {
      setVisibleProxies(prev => prev.filter(proxy => !ids.includes(proxy.id)))
    }
  }, [enableVirtualization])

  // Clear all proxies
  const clearAllProxies = useCallback(() => {
    setAllProxies([])
    setVisibleProxies([])
    setCurrentBatch(0)
    setHasMore(false)
    AdvancedStorageManager.clearProxies()
  }, [])

  // Get statistics
  const stats = useMemo(() => {
    const total = allProxies.length
    const alive = allProxies.filter(p => p.status === 'alive').length
    const dead = allProxies.filter(p => p.status === 'dead').length
    const testing = allProxies.filter(p => p.status === 'testing').length
    const pending = allProxies.filter(p => p.status === 'pending').length

    // Calculate additional stats
    const aliveProxies = allProxies.filter(p => p.status === 'alive')
    const averagePing = aliveProxies.length > 0 
      ? Math.round(aliveProxies.reduce((sum, p) => sum + (p.ping || 0), 0) / aliveProxies.length)
      : 0
    
    const averageSpeed = aliveProxies.length > 0
      ? Math.round(aliveProxies.reduce((sum, p) => sum + (p.speed || 0), 0) / aliveProxies.length)
      : 0

    const successRate = total > 0 ? Math.round((alive / total) * 100) : 0

    // Count by country
    const countries: Record<string, number> = {}
    allProxies.forEach(p => {
      if (p.country) {
        countries[p.country] = (countries[p.country] || 0) + 1
      }
    })

    // Count by type
    const types: Record<string, number> = {}
    allProxies.forEach(p => {
      types[p.type] = (types[p.type] || 0) + 1
    })

    // Count by anonymity
    const anonymity: Record<string, number> = {}
    allProxies.forEach(p => {
      if (p.anonymity) {
        anonymity[p.anonymity] = (anonymity[p.anonymity] || 0) + 1
      }
    })

    return {
      total,
      alive,
      dead,
      testing,
      pending,
      averagePing,
      averageSpeed,
      successRate,
      countries,
      types,
      anonymity,
      alivePercentage: total > 0 ? Math.round((alive / total) * 100) : 0,
      deadPercentage: total > 0 ? Math.round((dead / total) * 100) : 0
    }
  }, [allProxies])

  // Get performance info
  const performanceInfo = useMemo(() => {
    // Only get storage stats on client side
    if (typeof window === 'undefined') {
      return {
        isEssential: false,
        chunkCount: 0,
        totalSize: 0,
        compressionRatio: 0,
        isNearLimit: false,
        recommendation: 'Loading...'
      }
    }
    
    const storageStats = AdvancedStorageManager.getStorageStats()
    return {
      isEssential: storageStats.isEssential,
      chunkCount: storageStats.chunkCount,
      totalSize: storageStats.totalSize,
      compressionRatio: storageStats.compressionRatio,
      isNearLimit: AdvancedStorageManager.isStorageNearLimit(),
      recommendation: AdvancedStorageManager.getRecommendedAction()
    }
  }, [])

  return {
    // Data
    allProxies,
    visibleProxies,
    totalCount,
    
    // Loading state
    isLoading,
    hasMore,
    
    // Actions
    addProxy,
    updateProxy,
    deleteProxy,
    deleteProxies,
    clearAllProxies,
    loadMore,
    
    // Statistics
    stats,
    performanceInfo,
    
    // Configuration
    batchSize,
    enableVirtualization
  }
}
