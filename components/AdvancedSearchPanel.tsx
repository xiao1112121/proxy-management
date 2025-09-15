'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Search, Filter, X, Save, Download, Zap } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface SearchFilter {
  id: string
  name: string
  query: string
  filters: {
    status: string[]
    type: string[]
    country: string[]
    anonymity: string[]
    pingRange: [number, number]
    speedRange: [number, number]
  }
  isActive: boolean
}

interface AdvancedSearchPanelProps {
  proxies: Proxy[]
  onSearch: (filteredProxies: Proxy[]) => void
  onSaveFilter: (filter: SearchFilter) => void
  onLoadFilter: (filterId: string) => void
}

export default function AdvancedSearchPanel({
  proxies,
  onSearch,
  onSaveFilter,
  onLoadFilter
}: AdvancedSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: [] as string[],
    type: [] as string[],
    country: [] as string[],
    anonymity: [] as string[],
    pingRange: [0, 10000] as [number, number],
    speedRange: [0, 10000] as [number, number]
  })
  const [savedFilters, setSavedFilters] = useState<SearchFilter[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const statuses = Array.from(new Set(proxies.map(p => p.status)))
    const types = Array.from(new Set(proxies.map(p => p.type)))
    const countries = Array.from(new Set(proxies.map(p => p.country).filter(Boolean)))
    const anonymity = Array.from(new Set(proxies.map(p => p.anonymity).filter(Boolean)))

    return { statuses, types, countries, anonymity }
  }, [proxies])

  // Apply filters and search
  const filteredProxies = useMemo(() => {
    return proxies.filter(proxy => {
      // Text search
      const matchesSearch = !searchQuery || 
        proxy.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proxy.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proxy.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proxy.city?.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus = filters.status.length === 0 || filters.status.includes(proxy.status)

      // Type filter
      const matchesType = filters.type.length === 0 || filters.type.includes(proxy.type)

      // Country filter
      const matchesCountry = filters.country.length === 0 || 
        (proxy.country && filters.country.includes(proxy.country))

      // Anonymity filter
      const matchesAnonymity = filters.anonymity.length === 0 || 
        (proxy.anonymity && filters.anonymity.includes(proxy.anonymity || ''))

      // Ping range filter
      const matchesPing = !proxy.ping || 
        (proxy.ping >= filters.pingRange[0] && proxy.ping <= filters.pingRange[1])

      // Speed range filter
      const matchesSpeed = !proxy.speed || 
        (proxy.speed >= filters.speedRange[0] && proxy.speed <= filters.speedRange[1])

      return matchesSearch && matchesStatus && matchesType && 
             matchesCountry && matchesAnonymity && matchesPing && matchesSpeed
    })
  }, [proxies, searchQuery, filters])

  // Update search results
  React.useEffect(() => {
    onSearch(filteredProxies)
  }, [filteredProxies, onSearch])

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setFilters({
      status: [],
      type: [],
      country: [],
      anonymity: [],
      pingRange: [0, 10000],
      speedRange: [0, 10000]
    })
  }, [])

  const saveCurrentFilter = useCallback(() => {
    const filterName = prompt('Enter filter name:')
    if (!filterName) return

    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      name: filterName,
      query: searchQuery,
      filters: { ...filters },
      isActive: true
    }

    setSavedFilters(prev => [...prev, newFilter])
    onSaveFilter(newFilter)
  }, [searchQuery, filters, onSaveFilter])

  const loadFilter = useCallback((filterId: string) => {
    const filter = savedFilters.find(f => f.id === filterId)
    if (!filter) return

    setSearchQuery(filter.query)
    setFilters(filter.filters)
    onLoadFilter(filterId)
  }, [savedFilters, onLoadFilter])

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Advanced Search</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showAdvanced ? 'Simple' : 'Advanced'}
          </button>
          <button
            onClick={saveCurrentFilter}
            className="flex items-center px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Filter
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search proxies by host, username, country, city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.statuses.map(status => (
                <label key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleFilterChange('status', [...filters.status, status])
                      } else {
                        handleFilterChange('status', filters.status.filter(s => s !== status))
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.types.map(type => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleFilterChange('type', [...filters.type, type])
                      } else {
                        handleFilterChange('type', filters.type.filter(t => t !== type))
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 uppercase">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.countries.slice(0, 10).map(country => (
                <label key={country} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.country.includes(country || '')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleFilterChange('country', [...filters.country, country])
                      } else {
                        handleFilterChange('country', filters.country.filter(c => c !== country))
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{country}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ping Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ping Range: {filters.pingRange[0]}ms - {filters.pingRange[1]}ms
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="5000"
                value={filters.pingRange[0]}
                onChange={(e) => handleFilterChange('pingRange', [parseInt(e.target.value), filters.pingRange[1]])}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="5000"
                value={filters.pingRange[1]}
                onChange={(e) => handleFilterChange('pingRange', [filters.pingRange[0], parseInt(e.target.value)])}
                className="flex-1"
              />
            </div>
          </div>

          {/* Speed Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speed Range: {filters.speedRange[0]}ms - {filters.speedRange[1]}ms
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="10000"
                value={filters.speedRange[0]}
                onChange={(e) => handleFilterChange('speedRange', [parseInt(e.target.value), filters.speedRange[1]])}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="10000"
                value={filters.speedRange[1]}
                onChange={(e) => handleFilterChange('speedRange', [filters.speedRange[0], parseInt(e.target.value)])}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {filteredProxies.length.toLocaleString()} of {proxies.length.toLocaleString()} proxies
        </div>
        <button
          onClick={clearFilters}
          className="text-sm text-red-600 hover:text-red-700 flex items-center"
        >
          <X className="w-4 h-4 mr-1" />
          Clear All
        </button>
      </div>

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Saved Filters</div>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map(filter => (
              <button
                key={filter.id}
                onClick={() => loadFilter(filter.id)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
