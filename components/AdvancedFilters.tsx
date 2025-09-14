'use client'

import { useState } from 'react'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface AdvancedFiltersProps {
  proxies: Proxy[]
  onFiltersChange: (filters: FilterState) => void
}

interface FilterState {
  search: string
  status: string
  type: string
  group: string
  country: string
  anonymity: string
  pingRange: { min: number; max: number }
  speedRange: { min: number; max: number }
  dateRange: { from: string; to: string }
  hasCredentials: boolean | null
  hasLeaks: boolean | null
}

export default function AdvancedFilters({ proxies, onFiltersChange }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    type: 'all',
    group: 'all',
    country: 'all',
    anonymity: 'all',
    pingRange: { min: 0, max: 5000 },
    speedRange: { min: 0, max: 10000 },
    dateRange: { from: '', to: '' },
    hasCredentials: null,
    hasLeaks: null
  })

  const [tempFilters, setTempFilters] = useState<FilterState>(filters)

  // Get unique values for dropdowns
  const uniqueValues = {
    statuses: Array.from(new Set(proxies.map(p => p.status))),
    types: Array.from(new Set(proxies.map(p => p.type))),
    groups: Array.from(new Set(proxies.map(p => p.group).filter(Boolean))),
    countries: Array.from(new Set(proxies.map(p => (p as any).country).filter(Boolean))),
    anonymity: Array.from(new Set(proxies.map(p => (p as any).anonymity).filter(Boolean)))
  }

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setTempFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    setFilters(tempFilters)
    onFiltersChange(tempFilters)
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      status: 'all',
      type: 'all',
      group: 'all',
      country: 'all',
      anonymity: 'all',
      pingRange: { min: 0, max: 5000 },
      speedRange: { min: 0, max: 10000 },
      dateRange: { from: '', to: '' },
      hasCredentials: null,
      hasLeaks: null
    }
    setTempFilters(clearedFilters)
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.status !== 'all') count++
    if (filters.type !== 'all') count++
    if (filters.group !== 'all') count++
    if (filters.country !== 'all') count++
    if (filters.anonymity !== 'all') count++
    if (filters.pingRange.min > 0 || filters.pingRange.max < 5000) count++
    if (filters.speedRange.min > 0 || filters.speedRange.max < 10000) count++
    if (filters.dateRange.from || filters.dateRange.to) count++
    if (filters.hasCredentials !== null) count++
    if (filters.hasLeaks !== null) count++
    return count
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Bộ lọc nâng cao</h3>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {getActiveFiltersCount()} bộ lọc
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Thu gọn
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Mở rộng
                </>
              )}
            </button>
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center text-sm text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4 mr-1" />
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        {/* Basic Filters - Always Visible */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={tempFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input"
              placeholder="Host, port, ghi chú..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={tempFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input"
            >
              <option value="all">Tất cả</option>
              {uniqueValues.statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'alive' ? '🟢 Alive' : 
                   status === 'dead' ? '🔴 Dead' : 
                   status === 'pending' ? '🟡 Pending' : 
                   status === 'testing' ? '🔵 Testing' : status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại
            </label>
            <select
              value={tempFilters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input"
            >
              <option value="all">Tất cả</option>
              {uniqueValues.types.map(type => (
                <option key={type} value={type}>{type.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhóm
            </label>
            <select
              value={tempFilters.group}
              onChange={(e) => handleFilterChange('group', e.target.value)}
              className="input"
            >
              <option value="all">Tất cả</option>
              {uniqueValues.groups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {isExpanded && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quốc gia
                </label>
                <select
                  value={tempFilters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="input"
                >
                  <option value="all">Tất cả</option>
                  {uniqueValues.countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ẩn danh
                </label>
                <select
                  value={tempFilters.anonymity}
                  onChange={(e) => handleFilterChange('anonymity', e.target.value)}
                  className="input"
                >
                  <option value="all">Tất cả</option>
                  {uniqueValues.anonymity.map(anonymity => (
                    <option key={anonymity} value={anonymity}>
                      {anonymity === 'elite' ? '🛡️ Elite' :
                       anonymity === 'anonymous' ? '🎭 Anonymous' :
                       anonymity === 'transparent' ? '👁️ Transparent' : anonymity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Có thông tin đăng nhập
                </label>
                <select
                  value={tempFilters.hasCredentials === null ? 'all' : tempFilters.hasCredentials ? 'yes' : 'no'}
                  onChange={(e) => {
                    const value = e.target.value === 'all' ? null : e.target.value === 'yes'
                    handleFilterChange('hasCredentials', value)
                  }}
                  className="input"
                >
                  <option value="all">Tất cả</option>
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Có rò rỉ thông tin
                </label>
                <select
                  value={tempFilters.hasLeaks === null ? 'all' : tempFilters.hasLeaks ? 'yes' : 'no'}
                  onChange={(e) => {
                    const value = e.target.value === 'all' ? null : e.target.value === 'yes'
                    handleFilterChange('hasLeaks', value)
                  }}
                  className="input"
                >
                  <option value="all">Tất cả</option>
                  <option value="yes">Có</option>
                  <option value="no">Không</option>
                </select>
              </div>
            </div>

            {/* Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ping (ms): {tempFilters.pingRange.min} - {tempFilters.pingRange.max}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={tempFilters.pingRange.min}
                    onChange={(e) => handleFilterChange('pingRange', {
                      ...tempFilters.pingRange,
                      min: parseInt(e.target.value) || 0
                    })}
                    className="input"
                    placeholder="Min"
                    min="0"
                  />
                  <input
                    type="number"
                    value={tempFilters.pingRange.max}
                    onChange={(e) => handleFilterChange('pingRange', {
                      ...tempFilters.pingRange,
                      max: parseInt(e.target.value) || 5000
                    })}
                    className="input"
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tốc độ (ms): {tempFilters.speedRange.min} - {tempFilters.speedRange.max}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={tempFilters.speedRange.min}
                    onChange={(e) => handleFilterChange('speedRange', {
                      ...tempFilters.speedRange,
                      min: parseInt(e.target.value) || 0
                    })}
                    className="input"
                    placeholder="Min"
                    min="0"
                  />
                  <input
                    type="number"
                    value={tempFilters.speedRange.max}
                    onChange={(e) => handleFilterChange('speedRange', {
                      ...tempFilters.speedRange,
                      max: parseInt(e.target.value) || 10000
                    })}
                    className="input"
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khoảng thời gian test
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Từ ngày</label>
                  <input
                    type="date"
                    value={tempFilters.dateRange.from}
                    onChange={(e) => handleFilterChange('dateRange', {
                      ...tempFilters.dateRange,
                      from: e.target.value
                    })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Đến ngày</label>
                  <input
                    type="date"
                    value={tempFilters.dateRange.to}
                    onChange={(e) => handleFilterChange('dateRange', {
                      ...tempFilters.dateRange,
                      to: e.target.value
                    })}
                    className="input"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setTempFilters(filters)}
            className="btn btn-secondary"
          >
            Hủy
          </button>
          <button
            onClick={applyFilters}
            className="btn btn-primary"
          >
            Áp dụng bộ lọc
          </button>
        </div>
      </div>
    </div>
  )
}
