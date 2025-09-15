'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { BrowserPerformanceOptimizer, BrowserProxyTester } from '@/utils/browserPerformanceOptimizer'
import { PerformanceOptimizer } from '@/utils/performanceOptimizer'

interface UseOptimizedProxyListOptions {
  initialProxies?: Proxy[]
  enableVirtualization?: boolean
  enableCaching?: boolean
  enableBatchOperations?: boolean
  maxConcurrentTests?: number
  testTimeout?: number
}

interface OptimizedProxyListState {
  proxies: Proxy[]
  filteredProxies: Proxy[]
  selectedProxies: Set<number>
  isLoading: boolean
  isTesting: boolean
  testResults: Map<number, any>
  searchTerm: string
  sortBy: keyof Proxy
  sortDirection: 'asc' | 'desc'
  filterBy: {
    type?: string
    status?: string
    country?: string
  }
  performanceMetrics: {
    renderTime: number
    memoryUsage: number
    cacheHitRate: number
  }
}

export function useOptimizedProxyList(options: UseOptimizedProxyListOptions = {}) {
  const {
    initialProxies = [],
    enableVirtualization = true,
    enableCaching = true,
    enableBatchOperations = true,
    maxConcurrentTests = 10,
    testTimeout = 30000
  } = options

  // State
  const [state, setState] = useState<OptimizedProxyListState>({
    proxies: initialProxies,
    filteredProxies: initialProxies,
    selectedProxies: new Set(),
    isLoading: false,
    isTesting: false,
    testResults: new Map(),
    searchTerm: '',
    sortBy: 'id',
    sortDirection: 'asc',
    filterBy: {},
    performanceMetrics: {
      renderTime: 0,
      memoryUsage: 0,
      cacheHitRate: 0
    }
  })

  // Refs for performance optimization
  const renderStartTime = useRef<number>(0)
  const cacheHitCount = useRef<number>(0)
  const cacheMissCount = useRef<number>(0)
  const lastFilterHash = useRef<string>('')

  // Memoized filtered and sorted proxies
  const optimizedProxies = useMemo(() => {
    const startTime = performance.now()
    
    let filtered = state.proxies

    // Apply search filter
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase()
      filtered = filtered.filter(proxy => 
        proxy.host.toLowerCase().includes(searchLower) ||
        proxy.port.toString().includes(searchLower) ||
        proxy.country?.toLowerCase().includes(searchLower) ||
        proxy.city?.toLowerCase().includes(searchLower) ||
        proxy.notes?.toLowerCase().includes(searchLower)
      )
    }

    // Apply type filter
    if (state.filterBy.type) {
      filtered = filtered.filter(proxy => proxy.type === state.filterBy.type)
    }

    // Apply status filter
    if (state.filterBy.status) {
      filtered = filtered.filter(proxy => proxy.status === state.filterBy.status)
    }

    // Apply country filter
    if (state.filterBy.country) {
      filtered = filtered.filter(proxy => proxy.country === state.filterBy.country)
    }

    // Apply sorting
    filtered = BrowserPerformanceOptimizer.smartSort(filtered, state.sortBy, state.sortDirection)

    const endTime = performance.now()
    const renderTime = endTime - startTime

    setState(prev => ({
      ...prev,
      performanceMetrics: {
        ...prev.performanceMetrics,
        renderTime
      }
    }))

    return filtered
  }, [state.proxies, state.searchTerm, state.filterBy, state.sortBy, state.sortDirection])

  // Update filtered proxies when optimized proxies change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      filteredProxies: optimizedProxies
    }))
  }, [optimizedProxies])

  // Debounced search
  const debouncedSearch = useCallback(
    BrowserPerformanceOptimizer.debounce((searchTerm: string) => {
      setState(prev => ({ ...prev, searchTerm }))
    }, 300, 'search'),
    []
  )

  // Optimized proxy operations
  const addProxy = useCallback((proxy: Omit<Proxy, 'id'>) => {
    const newProxy: Proxy = {
      ...proxy,
      id: Date.now() + Math.random()
    }
    
    setState(prev => ({
      ...prev,
      proxies: [...prev.proxies, newProxy]
    }))
  }, [])

  const updateProxy = useCallback((id: number, updates: Partial<Proxy>) => {
    setState(prev => ({
      ...prev,
      proxies: prev.proxies.map(proxy => 
        proxy.id === id ? { ...proxy, ...updates } : proxy
      )
    }))
  }, [])

  // Sửa lỗi: dùng Array.from thay vì spread để đảm bảo tương thích với các phiên bản TypeScript/ES
  const deleteProxy = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      proxies: prev.proxies.filter(proxy => proxy.id !== id),
      selectedProxies: new Set(Array.from(prev.selectedProxies).filter(selectedId => selectedId !== id))
    }))
  }, [])

  const deleteSelectedProxies = useCallback(() => {
    setState(prev => ({
      ...prev,
      proxies: prev.proxies.filter(proxy => !prev.selectedProxies.has(proxy.id)),
      selectedProxies: new Set()
    }))
  }, [])

  // Batch operations
  const batchUpdateProxies = useCallback(
    BrowserPerformanceOptimizer.batchOperation((updates: Array<{ id: number; updates: Partial<Proxy> }>) => {
      setState(prev => ({
        ...prev,
        proxies: prev.proxies.map(proxy => {
          const update = updates.find(u => u.id === proxy.id)
          return update ? { ...proxy, ...update.updates } : proxy
        })
      }))
    }, 100, 'batchUpdate'),
    []
  )

  // Optimized testing
  const testProxies = useCallback(async (proxyIds?: number[]) => {
    const proxiesToTest = proxyIds 
      ? state.proxies.filter(proxy => proxyIds.includes(proxy.id))
      : state.proxies

    setState(prev => ({ ...prev, isTesting: true }))

    try {
      const results = await BrowserProxyTester.testProxiesBatch(
        proxiesToTest,
        (completed: number, total: number) => {
          // Progress callback can be used for UI updates
          console.log(`Testing progress: ${completed}/${total}`)
        }
      )

      const testResultsMap = new Map()
      results.forEach((result: any) => {
        testResultsMap.set(result.id, result)
      })

      setState(prev => ({
        ...prev,
        testResults: testResultsMap,
        isTesting: false
      }))
    } catch (error) {
      console.error('Error testing proxies:', error)
      setState(prev => ({ ...prev, isTesting: false }))
    }
  }, [state.proxies])

  // Selection management
  const selectProxy = useCallback((id: number, selected: boolean) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedProxies)
      if (selected) {
        newSelected.add(id)
      } else {
        newSelected.delete(id)
      }
      return { ...prev, selectedProxies: newSelected }
    })
  }, [])

  const selectAllProxies = useCallback((selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedProxies: selected ? new Set(prev.filteredProxies.map(p => p.id)) : new Set()
    }))
  }, [state.filteredProxies])

  // Sorting and filtering
  const setSortBy = useCallback((sortBy: keyof Proxy, direction: 'asc' | 'desc' = 'asc') => {
    setState(prev => ({ ...prev, sortBy, sortDirection: direction }))
  }, [])

  const setFilterBy = useCallback((filterBy: Partial<OptimizedProxyListState['filterBy']>) => {
    setState(prev => ({ ...prev, filterBy: { ...prev.filterBy, ...filterBy } }))
  }, [])

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchTerm: '',
      filterBy: {},
      sortBy: 'id',
      sortDirection: 'asc'
    }))
  }, [])

  // Performance monitoring
  const getPerformanceMetrics = useCallback(() => {
    const totalCacheRequests = cacheHitCount.current + cacheMissCount.current
    const cacheHitRate = totalCacheRequests > 0 
      ? (cacheHitCount.current / totalCacheRequests) * 100 
      : 0

    return {
      ...state.performanceMetrics,
      cacheHitRate,
      totalProxies: state.proxies.length,
      filteredProxies: state.filteredProxies.length,
      selectedProxies: state.selectedProxies.size
    }
  }, [state.performanceMetrics, state.proxies.length, state.filteredProxies.length, state.selectedProxies.size])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      PerformanceOptimizer.cleanup()
    }
  }, [])

  return {
    // State
    proxies: state.proxies,
    filteredProxies: state.filteredProxies,
    selectedProxies: state.selectedProxies,
    isLoading: state.isLoading,
    isTesting: state.isTesting,
    testResults: state.testResults,
    searchTerm: state.searchTerm,
    sortBy: state.sortBy,
    sortDirection: state.sortDirection,
    filterBy: state.filterBy,
    performanceMetrics: state.performanceMetrics,

    // Actions
    addProxy,
    updateProxy,
    deleteProxy,
    deleteSelectedProxies,
    batchUpdateProxies,
    testProxies,
    selectProxy,
    selectAllProxies,
    setSortBy,
    setFilterBy,
    clearFilters,
    debouncedSearch,

    // Performance
    getPerformanceMetrics
  }
}
