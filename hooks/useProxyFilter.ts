import { useState, useMemo } from 'react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface FilterOptions {
  status: string
  type: string
  group: string
  country: string
  search: string
}

export function useProxyFilter(proxies: Proxy[]) {
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    type: 'all',
    group: 'all',
    country: 'all',
    search: ''
  })

  const filteredProxies = useMemo(() => {
    return proxies.filter(proxy => {
      // Status filter
      if (filters.status !== 'all' && proxy.status !== filters.status) {
        return false
      }

      // Type filter
      if (filters.type !== 'all' && proxy.type !== filters.type) {
        return false
      }

      // Group filter
      if (filters.group !== 'all' && proxy.group !== filters.group) {
        return false
      }

      // Country filter
      if (filters.country !== 'all' && (proxy as any).country !== filters.country) {
        return false
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const searchableText = [
          proxy.host,
          proxy.port.toString(),
          proxy.username || '',
          proxy.password || '',
          proxy.type,
          proxy.group || '',
          (proxy as any).country || '',
          (proxy as any).city || ''
        ].join(' ').toLowerCase()

        if (!searchableText.includes(searchTerm)) {
          return false
        }
      }

      return true
    })
  }, [proxies, filters])

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      group: 'all',
      country: 'all',
      search: ''
    })
  }

  const getFilterOptions = () => {
    const statuses = Array.from(new Set(proxies.map(p => p.status)))
    const types = Array.from(new Set(proxies.map(p => p.type)))
    const groups = Array.from(new Set(proxies.map(p => p.group).filter(Boolean)))
    const countries = Array.from(new Set(proxies.map(p => (p as any).country).filter(Boolean)))

    return {
      statuses: ['all', ...statuses],
      types: ['all', ...types],
      groups: ['all', ...groups],
      countries: ['all', ...countries]
    }
  }

  const stats = useMemo(() => {
    const byType: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    const byAnonymity: Record<string, number> = {}
    const byCountry: Record<string, number> = {}

    proxies.forEach(proxy => {
      byType[proxy.type] = (byType[proxy.type] || 0) + 1
      byStatus[proxy.status] = (byStatus[proxy.status] || 0) + 1
      
      if ((proxy as any).anonymity) {
        byAnonymity[(proxy as any).anonymity] = (byAnonymity[(proxy as any).anonymity] || 0) + 1
      }
      
      if ((proxy as any).country) {
        byCountry[(proxy as any).country] = (byCountry[(proxy as any).country] || 0) + 1
      }
    })

    return {
      byType,
      byStatus,
      byAnonymity,
      byCountry
    }
  }, [proxies])

  return {
    filters,
    setFilters,
    filteredProxies,
    updateFilter,
    clearFilters,
    getFilterOptions,
    stats
  }
}