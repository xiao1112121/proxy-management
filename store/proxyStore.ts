'use client'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface ProxyState {
  // Data
  proxies: Proxy[]
  selectedProxies: number[]
  isLoading: boolean
  error: string | null
  
  // Stats
  stats: {
    total: number
    alive: number
    dead: number
    pending: number
    averagePing: number
    averageSpeed: number
    successRate: number
  }
  
  // Actions
  addProxy: (proxy: Omit<Proxy, 'id'>) => void
  updateProxy: (id: number, updates: Partial<Proxy>) => void
  deleteProxy: (id: number) => void
  deleteProxies: (ids: number[]) => void
  clearAllProxies: () => void
  
  // Selection
  selectProxy: (id: number, selected: boolean) => void
  selectAllProxies: (selected: boolean) => void
  clearSelection: () => void
  
  // Testing
  testProxy: (id: number) => Promise<void>
  testProxies: (ids: number[]) => Promise<void>
  testAllProxies: () => Promise<void>
  
  // Bulk operations
  bulkUpdate: (ids: number[], updates: Partial<Proxy>) => void
  bulkDelete: (ids: number[]) => void
  
  // Utility
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateStats: () => void
}

export const useProxyStore = create<ProxyState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        proxies: [],
        selectedProxies: [],
        isLoading: false,
        error: null,
        stats: {
          total: 0,
          alive: 0,
          dead: 0,
          pending: 0,
          averagePing: 0,
          averageSpeed: 0,
          successRate: 0,
        },
        
        // Actions
        addProxy: (proxy) => {
          const newProxy: Proxy = {
            ...proxy,
            id: Date.now() + Math.random(),
          }
          
          set((state) => ({
            proxies: [...state.proxies, newProxy],
            error: null,
          }))
          
          get().updateStats()
        },
        
        updateProxy: (id, updates) => {
          set((state) => ({
            proxies: state.proxies.map(p => 
              p.id === id ? { ...p, ...updates } : p
            ),
            error: null,
          }))
          
          get().updateStats()
        },
        
        deleteProxy: (id) => {
          set((state) => ({
            proxies: state.proxies.filter(p => p.id !== id),
            selectedProxies: state.selectedProxies.filter(pid => pid !== id),
            error: null,
          }))
          
          get().updateStats()
        },
        
        deleteProxies: (ids) => {
          set((state) => ({
            proxies: state.proxies.filter(p => !ids.includes(p.id)),
            selectedProxies: state.selectedProxies.filter(pid => !ids.includes(pid)),
            error: null,
          }))
          
          get().updateStats()
        },
        
        clearAllProxies: () => {
          set({
            proxies: [],
            selectedProxies: [],
            error: null,
          })
          
          get().updateStats()
        },
        
        // Selection
        selectProxy: (id, selected) => {
          set((state) => ({
            selectedProxies: selected
              ? [...state.selectedProxies, id]
              : state.selectedProxies.filter(pid => pid !== id),
          }))
        },
        
        selectAllProxies: (selected) => {
          set((state) => ({
            selectedProxies: selected 
              ? state.proxies.map(p => p.id)
              : [],
          }))
        },
        
        clearSelection: () => {
          set({ selectedProxies: [] })
        },
        
        // Testing
        testProxy: async (id) => {
          const proxy = get().proxies.find(p => p.id === id)
          if (!proxy) return
          
          set({ isLoading: true, error: null })
          
          try {
            // Update proxy status to testing
            get().updateProxy(id, { status: 'testing' })
            
            const response = await fetch('/api/test-proxy', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ proxy }),
            })
            
            const result = await response.json()
            
            if (result.success) {
              get().updateProxy(id, {
                status: 'alive',
                ping: result.ping,
                speed: result.speed,
                lastTested: new Date().toISOString(),
                country: result.country,
                city: result.city,
                region: result.region,
                isp: result.isp,
                publicIP: result.publicIP,
                anonymity: result.anonymity,
              })
            } else {
              get().updateProxy(id, {
                status: 'dead',
                lastTested: new Date().toISOString(),
              })
            }
          } catch (error) {
            get().updateProxy(id, {
              status: 'dead',
              lastTested: new Date().toISOString(),
            })
            set({ error: error instanceof Error ? error.message : 'Test failed' })
          } finally {
            set({ isLoading: false })
          }
        },
        
        testProxies: async (ids) => {
          set({ isLoading: true, error: null })
          
          // Update all proxies to testing status
          ids.forEach(id => {
            get().updateProxy(id, { status: 'testing' })
          })
          
          // Test proxies in batches to avoid overwhelming the server
          const batchSize = 5
          for (let i = 0; i < ids.length; i += batchSize) {
            const batch = ids.slice(i, i + batchSize)
            await Promise.all(batch.map(id => get().testProxy(id)))
          }
          
          set({ isLoading: false })
        },
        
        testAllProxies: async () => {
          const allIds = get().proxies.map(p => p.id)
          await get().testProxies(allIds)
        },
        
        // Bulk operations
        bulkUpdate: (ids, updates) => {
          ids.forEach(id => {
            get().updateProxy(id, updates)
          })
        },
        
        bulkDelete: (ids) => {
          get().deleteProxies(ids)
        },
        
        // Utility
        setLoading: (loading) => {
          set({ isLoading: loading })
        },
        
        setError: (error) => {
          set({ error })
        },
        
        updateStats: () => {
          const { proxies } = get()
          
          const total = proxies.length
          const alive = proxies.filter(p => p.status === 'alive').length
          const dead = proxies.filter(p => p.status === 'dead').length
          const pending = proxies.filter(p => p.status === 'pending').length
          
          const aliveProxies = proxies.filter(p => p.status === 'alive')
          const averagePing = aliveProxies.length > 0 
            ? aliveProxies.reduce((sum, p) => sum + (p.ping || 0), 0) / aliveProxies.length
            : 0
          
          const averageSpeed = aliveProxies.length > 0
            ? aliveProxies.reduce((sum, p) => sum + (p.speed || 0), 0) / aliveProxies.length
            : 0
          
          const successRate = total > 0 ? (alive / total) * 100 : 0
          
          set({
            stats: {
              total,
              alive,
              dead,
              pending,
              averagePing: Math.round(averagePing),
              averageSpeed: Math.round(averageSpeed),
              successRate: Math.round(successRate * 100) / 100,
            },
          })
        },
      }),
      {
        name: 'proxy-store',
        partialize: (state) => ({ 
          proxies: state.proxies,
          stats: state.stats,
        }),
      }
    )
  )
)

// Selectors for better performance
export const useProxySelectors = () => {
  const proxies = useProxyStore(state => state.proxies)
  const selectedProxies = useProxyStore(state => state.selectedProxies)
  const stats = useProxyStore(state => state.stats)
  const isLoading = useProxyStore(state => state.isLoading)
  const error = useProxyStore(state => state.error)
  
  return {
    proxies,
    selectedProxies,
    stats,
    isLoading,
    error,
  }
}

export const useProxyActions = () => {
  const addProxy = useProxyStore(state => state.addProxy)
  const updateProxy = useProxyStore(state => state.updateProxy)
  const deleteProxy = useProxyStore(state => state.deleteProxy)
  const deleteProxies = useProxyStore(state => state.deleteProxies)
  const clearAllProxies = useProxyStore(state => state.clearAllProxies)
  const selectProxy = useProxyStore(state => state.selectProxy)
  const selectAllProxies = useProxyStore(state => state.selectAllProxies)
  const clearSelection = useProxyStore(state => state.clearSelection)
  const testProxy = useProxyStore(state => state.testProxy)
  const testProxies = useProxyStore(state => state.testProxies)
  const testAllProxies = useProxyStore(state => state.testAllProxies)
  const bulkUpdate = useProxyStore(state => state.bulkUpdate)
  const bulkDelete = useProxyStore(state => state.bulkDelete)
  const setLoading = useProxyStore(state => state.setLoading)
  const setError = useProxyStore(state => state.setError)
  
  return {
    addProxy,
    updateProxy,
    deleteProxy,
    deleteProxies,
    clearAllProxies,
    selectProxy,
    selectAllProxies,
    clearSelection,
    testProxy,
    testProxies,
    testAllProxies,
    bulkUpdate,
    bulkDelete,
    setLoading,
    setError,
  }
}
