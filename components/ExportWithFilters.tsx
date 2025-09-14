'use client'

import { useState } from 'react'
import { 
  Download, 
  Filter, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Globe,
  Zap,
  Shield,
  Clock
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { ProxyImportExport, ExportOptions } from '@/utils/importExport'

interface ExportFilters {
  status: string[]
  type: string[]
  country: string[]
  group: string[]
  pingRange: { min: number; max: number }
  speedRange: { min: number; max: number }
  dateRange: { from: string; to: string }
  searchTerm: string
}

interface ExportWithFiltersProps {
  proxies: Proxy[]
  onExport: (proxies: Proxy[], format: string) => void
}

export default function ExportWithFilters({ proxies, onExport }: ExportWithFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | 'txt' | 'xml'>('json')
  const [filters, setFilters] = useState<ExportFilters>({
    status: [],
    type: [],
    country: [],
    group: [],
    pingRange: { min: 0, max: 10000 },
    speedRange: { min: 0, max: 10000 },
    dateRange: { from: '', to: '' },
    searchTerm: ''
  })

  // Get unique values for filter options
  const getUniqueValues = (key: keyof Proxy) => {
    const values = proxies.map(p => p[key]).filter(Boolean) as string[]
    return Array.from(new Set(values)).sort()
  }

  const getFilteredProxies = (): Proxy[] => {
    return proxies.filter(proxy => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(proxy.status)) {
        return false
      }

      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(proxy.type)) {
        return false
      }

      // Country filter
      if (filters.country.length > 0 && proxy.country && !filters.country.includes(proxy.country)) {
        return false
      }

      // Group filter
      if (filters.group.length > 0 && proxy.group && !filters.group.includes(proxy.group)) {
        return false
      }

      // Ping range filter
      if (proxy.ping) {
        if (proxy.ping < filters.pingRange.min || proxy.ping > filters.pingRange.max) {
          return false
        }
      }

      // Speed range filter
      if (proxy.speed) {
        if (proxy.speed < filters.speedRange.min || proxy.speed > filters.speedRange.max) {
          return false
        }
      }

      // Date range filter
      if (filters.dateRange.from && proxy.lastTested) {
        const proxyDate = new Date(proxy.lastTested)
        const fromDate = new Date(filters.dateRange.from)
        const toDate = new Date(filters.dateRange.to || new Date().toISOString())
        
        if (proxyDate < fromDate || proxyDate > toDate) {
          return false
        }
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const searchableText = [
          proxy.host,
          proxy.port?.toString(),
          proxy.username,
          proxy.country,
          proxy.city,
          proxy.group,
          proxy.notes
        ].join(' ').toLowerCase()
        
        if (!searchableText.includes(searchLower)) {
          return false
        }
      }

      return true
    })
  }

  const handleExport = () => {
    const filteredProxies = getFilteredProxies()
    
    if (filteredProxies.length === 0) {
      alert('Không có proxy nào phù hợp với bộ lọc đã chọn!')
      return
    }

    const exportOptions: ExportOptions = {
      format: selectedFormat,
      includeCredentials: true,
      includeStats: true,
      filter: {
        status: filters.status.length > 0 ? filters.status : undefined,
        type: filters.type.length > 0 ? filters.type : undefined,
        group: filters.group.length > 0 ? filters.group : undefined
      }
    }

    const dataStr = ProxyImportExport.exportProxies(filteredProxies, exportOptions)
    const mimeType = selectedFormat === 'json' ? 'application/json' : 
                    selectedFormat === 'csv' ? 'text/csv' :
                    selectedFormat === 'xml' ? 'application/xml' : 'text/plain'
    
    const dataUri = `data:${mimeType};charset=utf-8,${encodeURIComponent(dataStr)}`
    const exportFileDefaultName = `proxies_filtered.${selectedFormat}`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()

    alert(`Đã xuất ${filteredProxies.length} proxy với định dạng ${selectedFormat.toUpperCase()}`)
  }

  const clearFilters = () => {
    setFilters({
      status: [],
      type: [],
      country: [],
      group: [],
      pingRange: { min: 0, max: 10000 },
      speedRange: { min: 0, max: 10000 },
      dateRange: { from: '', to: '' },
      searchTerm: ''
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.status.length > 0) count++
    if (filters.type.length > 0) count++
    if (filters.country.length > 0) count++
    if (filters.group.length > 0) count++
    if (filters.pingRange.min > 0 || filters.pingRange.max < 10000) count++
    if (filters.speedRange.min > 0 || filters.speedRange.max < 10000) count++
    if (filters.dateRange.from || filters.dateRange.to) count++
    if (filters.searchTerm) count++
    return count
  }

  const filteredProxies = getFilteredProxies()
  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-4">
      {/* Export Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Xuất Proxy với Bộ lọc</h3>
            <p className="text-sm text-gray-600">
              {filteredProxies.length} / {proxies.length} proxy phù hợp với bộ lọc
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
              {activeFiltersCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button
              onClick={clearFilters}
              className="btn btn-outline"
              disabled={activeFiltersCount === 0}
            >
              <X className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Format Selection */}
        <div className="flex items-center space-x-4 mb-4">
          <label className="text-sm font-medium text-gray-700">Định dạng xuất:</label>
          <div className="flex space-x-2">
            {(['json', 'csv', 'txt', 'xml'] as const).map((format) => (
              <button
                key={format}
                onClick={() => setSelectedFormat(format)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  selectedFormat === format
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={filteredProxies.length === 0}
          className="btn btn-primary w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Xuất {filteredProxies.length} Proxy
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc nâng cao</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <div className="space-y-2">
                {['alive', 'dead', 'pending', 'testing'].map((status) => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            status: [...prev.status, status]
                          }))
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            status: prev.status.filter(s => s !== status)
                          }))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại Proxy</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {getUniqueValues('type').map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.type.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            type: [...prev.type, type]
                          }))
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            type: prev.type.filter(t => t !== type)
                          }))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quốc gia</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {getUniqueValues('country').map((country) => (
                  <label key={country} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.country.includes(country)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            country: [...prev.country, country]
                          }))
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            country: prev.country.filter(c => c !== country)
                          }))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{country}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Group Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhóm</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {getUniqueValues('group').map((group) => (
                  <label key={group} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.group.includes(group)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            group: [...prev.group, group]
                          }))
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            group: prev.group.filter(g => g !== group)
                          }))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{group}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ping Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ping (ms)</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={filters.pingRange.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      pingRange: { ...prev.pingRange, min: parseInt(e.target.value) || 0 }
                    }))}
                    className="input w-20"
                    placeholder="Min"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={filters.pingRange.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      pingRange: { ...prev.pingRange, max: parseInt(e.target.value) || 10000 }
                    }))}
                    className="input w-20"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            {/* Speed Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tốc độ (KB/s)</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={filters.speedRange.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      speedRange: { ...prev.speedRange, min: parseInt(e.target.value) || 0 }
                    }))}
                    className="input w-20"
                    placeholder="Min"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={filters.speedRange.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      speedRange: { ...prev.speedRange, max: parseInt(e.target.value) || 10000 }
                    }))}
                    className="input w-20"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày test</label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, from: e.target.value }
                  }))}
                  className="input w-full"
                  placeholder="Từ ngày"
                />
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, to: e.target.value }
                  }))}
                  className="input w-full"
                  placeholder="Đến ngày"
                />
              </div>
            </div>

            {/* Search Term */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  searchTerm: e.target.value
                }))}
                className="input w-full"
                placeholder="Tìm theo host, port, username, country, group, notes..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter Summary */}
      {activeFiltersCount > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Đang áp dụng {activeFiltersCount} bộ lọc
              </p>
              <p className="text-xs text-blue-700">
                {filteredProxies.length} proxy phù hợp sẽ được xuất
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
