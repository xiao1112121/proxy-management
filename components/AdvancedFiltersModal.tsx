'use client'

import { useState } from 'react'
import { X, Filter, Search, Globe, Zap, Clock, Shield } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface AdvancedFiltersModalProps {
  isOpen: boolean
  onClose: () => void
  proxies: Proxy[]
  onApplyFilters: (filters: any) => void
}

export default function AdvancedFiltersModal({ 
  isOpen, 
  onClose, 
  proxies, 
  onApplyFilters 
}: AdvancedFiltersModalProps) {
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    anonymity: 'all',
    country: 'all',
    group: 'all',
    pingMin: '',
    pingMax: '',
    speedMin: '',
    speedMax: '',
    lastTested: 'all',
    hasCredentials: 'all'
  })

  if (!isOpen) return null

  // Get unique values for dropdowns
  const uniqueCountries = Array.from(new Set(proxies.map(p => p.country).filter(Boolean))).sort()
  const uniqueGroups = Array.from(new Set(proxies.map(p => p.group).filter(Boolean))).sort()
  const uniqueTypes = Array.from(new Set(proxies.map(p => p.type))).sort()

  const handleApply = () => {
    onApplyFilters(filters)
    onClose()
  }

  const handleReset = () => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
      anonymity: 'all',
      country: 'all',
      group: 'all',
      pingMin: '',
      pingMax: '',
      speedMin: '',
      speedMax: '',
      lastTested: 'all',
      hasCredentials: 'all'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Bộ lọc nâng cao
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="input pl-10"
                placeholder="Tìm kiếm theo host, quốc gia, nhóm..."
              />
            </div>
          </div>

          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại proxy
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="input"
              >
                <option value="all">Tất cả loại</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="input"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="alive">🟢 Alive</option>
                <option value="dead">🔴 Dead</option>
                <option value="pending">🟡 Pending</option>
                <option value="testing">🔵 Testing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức độ ẩn danh
              </label>
              <select
                value={filters.anonymity}
                onChange={(e) => setFilters({...filters, anonymity: e.target.value})}
                className="input"
              >
                <option value="all">Tất cả</option>
                <option value="elite">Elite</option>
                <option value="anonymous">Anonymous</option>
                <option value="transparent">Transparent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quốc gia
              </label>
              <select
                value={filters.country}
                onChange={(e) => setFilters({...filters, country: e.target.value})}
                className="input"
              >
                <option value="all">Tất cả quốc gia</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhóm
              </label>
              <select
                value={filters.group}
                onChange={(e) => setFilters({...filters, group: e.target.value})}
                className="input"
              >
                <option value="all">Tất cả nhóm</option>
                {uniqueGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Có thông tin đăng nhập
              </label>
              <select
                value={filters.hasCredentials}
                onChange={(e) => setFilters({...filters, hasCredentials: e.target.value})}
                className="input"
              >
                <option value="all">Tất cả</option>
                <option value="yes">Có</option>
                <option value="no">Không</option>
              </select>
            </div>
          </div>

          {/* Performance Filters */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Hiệu suất
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ping tối thiểu (ms)
                </label>
                <input
                  type="number"
                  value={filters.pingMin}
                  onChange={(e) => setFilters({...filters, pingMin: e.target.value})}
                  className="input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ping tối đa (ms)
                </label>
                <input
                  type="number"
                  value={filters.pingMax}
                  onChange={(e) => setFilters({...filters, pingMax: e.target.value})}
                  className="input"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tốc độ tối thiểu (ms)
                </label>
                <input
                  type="number"
                  value={filters.speedMin}
                  onChange={(e) => setFilters({...filters, speedMin: e.target.value})}
                  className="input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tốc độ tối đa (ms)
                </label>
                <input
                  type="number"
                  value={filters.speedMax}
                  onChange={(e) => setFilters({...filters, speedMax: e.target.value})}
                  className="input"
                  placeholder="5000"
                />
              </div>
            </div>
          </div>

          {/* Time Filters */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Thời gian test
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test lần cuối
              </label>
              <select
                value={filters.lastTested}
                onChange={(e) => setFilters({...filters, lastTested: e.target.value})}
                className="input"
              >
                <option value="all">Tất cả</option>
                <option value="today">Hôm nay</option>
                <option value="yesterday">Hôm qua</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="never">Chưa test</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleReset}
            className="btn btn-secondary"
          >
            Đặt lại
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Hủy
          </button>
          <button
            onClick={handleApply}
            className="btn btn-primary"
          >
            Áp dụng bộ lọc
          </button>
        </div>
      </div>
    </div>
  )
}