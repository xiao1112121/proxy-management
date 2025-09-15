'use client'

import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react'
import { 
  Play, Pause, Square, Zap, Clock, CheckCircle, XCircle, AlertTriangle,
  Globe, Activity, Settings, ChevronDown, Copy, Edit, Trash2, Eye, EyeOff,
  MapPin, Shield, Search, Filter, Download, Upload, RefreshCw, Plus
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { useVirtualizer } from '@tanstack/react-virtual'
import TestUrlSelector from './TestUrlSelector'

interface AdvancedProxyTableProps {
  proxies: Proxy[]
  onDelete: (id: number) => void
  onUpdate: (id: number, updates: Partial<Proxy>) => void
  onTest: (id: number) => void
  onTestSelected: (ids: number[]) => void
  onSelectAll: (selected: boolean) => void
  selectedProxies: number[]
  onProxySelect: (id: number, selected: boolean) => void
  onAddProxy: () => void
  onImportProxy: () => void
  onExportProxy: (ids: number[], format: string) => void
  onRefresh: () => void
  onBulkDelete?: (ids: number[]) => void
  testUrl: string
  onTestUrlChange: (url: string) => void
}

// Memoized status badge component
const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'alive':
        return { 
          color: 'bg-green-100 text-green-800', 
          icon: CheckCircle,
          text: 'Hoạt động'
        }
      case 'dead':
        return { 
          color: 'bg-red-100 text-red-800', 
          icon: XCircle,
          text: 'Không hoạt động'
        }
      case 'testing':
        return { 
          color: 'bg-yellow-100 text-yellow-800', 
          icon: Clock,
          text: 'Đang test'
        }
      case 'pending':
        return { 
          color: 'bg-gray-100 text-gray-800', 
          icon: Square,
          text: 'Chờ xử lý'
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config?.icon || Square

  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
      <Icon className="w-3 h-3" />
      <span>{config?.text || 'Unknown'}</span>
    </div>
  )
})

// Memoized type badge component
const TypeBadge = memo(function TypeBadge({ type }: { type: string }) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'http':
      case 'https':
        return 'bg-blue-100 text-blue-800'
      case 'socks4':
      case 'socks5':
        return 'bg-purple-100 text-purple-800'
      case 'ssh':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
      {type.toUpperCase()}
    </span>
  )
})

// Memoized performance indicator component
const PerformanceIndicator = memo(function PerformanceIndicator({ 
  ping, 
  speed 
}: { 
  ping?: number
  speed?: number 
}) {
  const getColor = (value: number, thresholds: { good: number; bad: number }) => {
    if (value <= thresholds.good) return 'text-green-600'
    if (value <= thresholds.bad) return 'text-yellow-600'
    return 'text-red-600'
  }

  const pingColor = ping ? getColor(ping, { good: 100, bad: 500 }) : 'text-gray-400'
  const speedColor = speed ? getColor(speed, { good: 10, bad: 5 }) : 'text-gray-400'

  return (
    <div className="flex items-center space-x-2 text-sm">
      {ping && (
        <div className="flex items-center">
          <Activity className="w-3 h-3 mr-1" />
          <span className={pingColor}>{ping}ms</span>
        </div>
      )}
      {speed && (
        <div className="flex items-center">
          <Zap className="w-3 h-3 mr-1" />
          <span className={speedColor}>{speed}MB/s</span>
        </div>
      )}
    </div>
  )
})

// Memoized proxy row component
const ProxyTableRow = memo(function ProxyTableRow({
  proxy,
  isSelected,
  showPassword,
  onSelect,
  onDelete,
  onUpdate,
  onTest,
  onTogglePassword,
  onCopy
}: {
  proxy: Proxy
  isSelected: boolean
  showPassword: boolean
  onSelect: (id: number, selected: boolean) => void
  onDelete: (id: number) => void
  onUpdate: (id: number, updates: Partial<Proxy>) => void
  onTest: (id: number) => void
  onTogglePassword: (id: number) => void
  onCopy: (proxy: Proxy) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    host: proxy.host,
    port: proxy.port,
    username: proxy.username || '',
    password: proxy.password || '',
    type: proxy.type,
    notes: proxy.notes || ''
  })

  const handleSave = useCallback(() => {
    onUpdate(proxy.id, editData)
    setIsEditing(false)
  }, [proxy.id, editData, onUpdate])

  const handleCancel = useCallback(() => {
    setEditData({
      host: proxy.host,
      port: proxy.port,
      username: proxy.username || '',
      password: proxy.password || '',
      type: proxy.type,
      notes: proxy.notes || ''
    })
    setIsEditing(false)
  }, [proxy])

  const handleCopy = useCallback(() => {
    onCopy(proxy)
  }, [proxy, onCopy])

  return (
    <tr className={`border-b border-gray-200 hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
      {/* Checkbox */}
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(proxy.id, e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={proxy.status || 'pending'} />
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <TypeBadge type={proxy.type} />
      </td>

      {/* Host:Port */}
      <td className="px-4 py-3">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={editData.host}
              onChange={(e) => setEditData(prev => ({ ...prev, host: e.target.value }))}
              className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Host"
            />
            <span>:</span>
            <input
              type="number"
              value={editData.port}
              onChange={(e) => setEditData(prev => ({ ...prev, port: parseInt(e.target.value) }))}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Port"
            />
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm">{proxy.host}:{proxy.port}</span>
            <button
              onClick={handleCopy}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Copy proxy"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        )}
      </td>

      {/* Credentials */}
      <td className="px-4 py-3">
        {isEditing ? (
          <div className="space-y-1">
            <input
              type="text"
              value={editData.username}
              onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Username"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={editData.password}
                onChange={(e) => setEditData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-2 py-1 pr-8 border border-gray-300 rounded text-sm"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => onTogglePassword(proxy.id)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm">
            {proxy.username && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-600">User:</span>
                <span className="font-mono">{proxy.username}</span>
              </div>
            )}
            {proxy.password && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-600">Pass:</span>
                <span className="font-mono">
                  {showPassword ? proxy.password : '••••••••'}
                </span>
                <button
                  onClick={() => onTogglePassword(proxy.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            )}
          </div>
        )}
      </td>

      {/* Performance */}
      <td className="px-4 py-3">
        <PerformanceIndicator 
          ping={proxy.ping} 
          speed={proxy.speed} 
        />
      </td>

      {/* Country */}
      <td className="px-4 py-3">
        <div className="flex items-center space-x-1">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-sm">{proxy.country || 'Unknown'}</span>
        </div>
      </td>

      {/* Anonymity */}
      <td className="px-4 py-3">
        <div className="flex items-center space-x-1">
          <Shield className="w-3 h-3 text-gray-400" />
          <span className="text-sm capitalize">{proxy.anonymity || 'Unknown'}</span>
        </div>
      </td>

      {/* Notes */}
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            type="text"
            value={editData.notes}
            onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            placeholder="Notes"
          />
        ) : (
          <span className="text-sm text-gray-600 truncate max-w-32">
            {proxy.notes || '-'}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center space-x-1">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                title="Save"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                title="Cancel"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onTest(proxy.id)}
                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                title="Kiểm tra proxy"
              >
                <Play className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                title="Chỉnh sửa proxy"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(proxy.id)}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                title="Xóa proxy"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.proxy.id === nextProps.proxy.id &&
    prevProps.proxy.host === nextProps.proxy.host &&
    prevProps.proxy.port === nextProps.proxy.port &&
    prevProps.proxy.status === nextProps.proxy.status &&
    prevProps.proxy.ping === nextProps.proxy.ping &&
    prevProps.proxy.speed === nextProps.proxy.speed &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.showPassword === nextProps.showPassword
  )
})

export default function AdvancedProxyTable({
  proxies,
  onDelete,
  onUpdate,
  onTest,
  onTestSelected,
  onSelectAll,
  selectedProxies,
  onProxySelect,
  onAddProxy,
  onImportProxy,
  onExportProxy,
  onRefresh,
  onBulkDelete,
  testUrl,
  onTestUrlChange
}: AdvancedProxyTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [countryFilter, setCountryFilter] = useState('all')
  const [showPassword, setShowPassword] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [showTestUrlSelector, setShowTestUrlSelector] = useState(false)
  const [testUrlSelectorPosition, setTestUrlSelectorPosition] = useState<{ x: number; y: number } | null>(null)
  const [currentTestProxyId, setCurrentTestProxyId] = useState<number | null>(null)

  // Filter proxies based on search and filters
  const filteredProxies = useMemo(() => {
    return proxies.filter(proxy => {
      const matchesSearch = !searchTerm || 
        proxy.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proxy.port.toString().includes(searchTerm) ||
        (proxy.username && proxy.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (proxy.country && proxy.country.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === 'all' || proxy.status === statusFilter
      const matchesType = typeFilter === 'all' || proxy.type === typeFilter
      const matchesCountry = countryFilter === 'all' || proxy.country === countryFilter

      return matchesSearch && matchesStatus && matchesType && matchesCountry
    })
  }, [proxies, searchTerm, statusFilter, typeFilter, countryFilter])

  // Pagination
  const paginatedProxies = useMemo(() => {
    const start = currentPage * pageSize
    return filteredProxies.slice(start, start + pageSize)
  }, [filteredProxies, currentPage, pageSize])

  // Get unique countries and types for filters
  const countries = useMemo(() => {
    const unique = [...new Set(proxies.map(p => p.country).filter(Boolean))]
    return unique.sort()
  }, [proxies])

  const types = useMemo(() => {
    const unique = [...new Set(proxies.map(p => p.type))]
    return unique.sort()
  }, [proxies])

  // Handle password toggle
  const handleTogglePassword = useCallback((id: number) => {
    setShowPassword(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  // Handle copy proxy
  const handleCopyProxy = useCallback((proxy: Proxy) => {
    const proxyString = `${proxy.host}:${proxy.port}${proxy.username ? `:${proxy.username}:${proxy.password}` : ''}`
    navigator.clipboard.writeText(proxyString)
  }, [])

  // Test selected proxies
  const handleTestSelected = useCallback(() => {
    onTestSelected(selectedProxies)
  }, [selectedProxies, onTestSelected])

  // Handle test click with URL selector
  const handleTestClick = useCallback((proxyId: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTestUrlSelectorPosition({
      x: rect.left,
      y: rect.bottom + 5
    })
    setCurrentTestProxyId(proxyId)
    setShowTestUrlSelector(true)
  }, [])

  const handleUrlSelect = useCallback((url: string) => {
    onTestUrlChange(url)
    if (currentTestProxyId) {
      onTest(currentTestProxyId)
    }
    setShowTestUrlSelector(false)
    setCurrentTestProxyId(null)
  }, [currentTestProxyId, onTest, onTestUrlChange])

  // Global URL selector for all tests
  const handleGlobalUrlSelect = useCallback((url: string) => {
    onTestUrlChange(url)
    setShowTestUrlSelector(false)
  }, [onTestUrlChange])

  const handleCloseTestUrlSelector = useCallback(() => {
    setShowTestUrlSelector(false)
    setCurrentTestProxyId(null)
  }, [])

  // Handle bulk delete
  const handleBulkDelete = useCallback(() => {
    if (selectedProxies.length === 0) return
    
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa ${selectedProxies.length} proxy đã chọn? Hành động này không thể hoàn tác.`
    )
    
    if (!confirmed) return
    
    if (onBulkDelete) {
      onBulkDelete(selectedProxies)
    } else {
      selectedProxies.forEach(id => onDelete(id))
    }
  }, [selectedProxies, onBulkDelete, onDelete])

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setStatusFilter('all')
    setTypeFilter('all')
    setCountryFilter('all')
  }, [])

  const allSelected = selectedProxies.length === filteredProxies.length && filteredProxies.length > 0
  const someSelected = selectedProxies.length > 0 && selectedProxies.length < filteredProxies.length

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Danh sách Proxy ({filteredProxies.length.toLocaleString()})
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={onAddProxy}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Proxy</span>
              </button>
              <button
                onClick={onImportProxy}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                <Upload className="w-4 h-4" />
                <span>Nhập</span>
              </button>
              <button
                onClick={() => onExportProxy(selectedProxies, 'json')}
                className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                disabled={selectedProxies.length === 0}
              >
                <Download className="w-4 h-4" />
                <span>Xuất ({selectedProxies.length})</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleTestSelected}
                className="flex items-center space-x-1 px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                disabled={selectedProxies.length === 0}
              >
                <Play className="w-4 h-4" />
                <span>Test ({selectedProxies.length})</span>
              </button>
              <button
                onClick={onRefresh}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Làm mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm proxy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="alive">Hoạt động</option>
            <option value="dead">Không hoạt động</option>
            <option value="testing">Đang test</option>
            <option value="pending">Chờ xử lý</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả loại</option>
            {types.map(type => (
              <option key={type} value={type}>{type.toUpperCase()}</option>
            ))}
          </select>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả quốc gia</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          <button
            onClick={clearFilters}
            className="flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            <span>Xóa bộ lọc</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Host:Port
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thông tin đăng nhập
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hiệu suất
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quốc gia
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ẩn danh
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ghi chú
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedProxies.map((proxy) => (
              <ProxyTableRow
                key={proxy.id}
                proxy={proxy}
                isSelected={selectedProxies.includes(proxy.id)}
                showPassword={showPassword.has(proxy.id)}
                onSelect={onProxySelect}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onTest={onTest}
                onTogglePassword={handleTogglePassword}
                onCopy={handleCopyProxy}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-3">
            <span>
              Hiển thị {filteredProxies.length} của {proxies.length.toLocaleString()} proxy
            </span>
            <div className="flex items-center space-x-1">
              <label className="text-xs">Trang:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(0)
                }}
                className="px-1 py-0.5 border border-gray-300 rounded text-xs"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-xs"
            >
              Trước
            </button>
            <span className="px-1 text-xs">
              {currentPage + 1}/{Math.ceil(proxies.length / pageSize)}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(Math.ceil(proxies.length / pageSize) - 1, currentPage + 1))}
              disabled={currentPage >= Math.ceil(proxies.length / pageSize) - 1}
              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-xs"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Test URL Selector */}
      {showTestUrlSelector && testUrlSelectorPosition && (
        <TestUrlSelector
          onUrlSelect={currentTestProxyId ? handleUrlSelect : handleGlobalUrlSelect}
          onClose={handleCloseTestUrlSelector}
          position={testUrlSelectorPosition}
        />
      )}
    </div>
  )
}