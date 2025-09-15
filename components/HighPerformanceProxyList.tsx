'use client'

import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react'
import { Edit, Trash2, Play, Eye, EyeOff, CheckSquare, Square, Globe, Search, Filter, Plus, Download, Upload, RefreshCw } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { useVirtualizer } from '@tanstack/react-virtual'
import TestUrlSelector from './TestUrlSelector'

interface HighPerformanceProxyListProps {
  proxies: Proxy[]
  onDelete: (id: number) => void
  onUpdate: (id: number, updates: Partial<Proxy>) => void
  onTest: (id: number) => void
  onTestSelected: (ids: number[]) => void
  onSelectAll: (selected: boolean) => void
  selectedProxies: number[]
  onProxySelect: (id: number, selected: boolean) => void
  onAddProxy?: () => void
  onImportProxy?: () => void
  onExportProxy?: () => void
  onRefresh?: () => void
}

// Memoized proxy row component
const ProxyRow = memo(function ProxyRow({
  proxy,
  isSelected,
  showPassword,
  onSelect,
  onDelete,
  onUpdate,
  onTest,
  onTogglePassword
}: {
  proxy: Proxy
  isSelected: boolean
  showPassword: boolean
  onSelect: (id: number, selected: boolean) => void
  onDelete: (id: number) => void
  onUpdate: (id: number, updates: Partial<Proxy>) => void
  onTest: (id: number) => void
  onTogglePassword: (id: number) => void
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'alive': return 'text-green-600 bg-green-100'
      case 'dead': return 'text-red-600 bg-red-100'
      case 'testing': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'http': return 'text-blue-600 bg-blue-100'
      case 'https': return 'text-green-600 bg-green-100'
      case 'socks4': return 'text-purple-600 bg-purple-100'
      case 'socks5': return 'text-indigo-600 bg-indigo-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="flex items-center space-x-4 p-3 border-b border-gray-100 hover:bg-gray-50">
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onSelect(proxy.id, e.target.checked)}
        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
      />

      {/* Proxy Info */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={editData.host}
                onChange={(e) => setEditData(prev => ({ ...prev, host: e.target.value }))}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Host"
              />
              <input
                type="number"
                value={editData.port}
                onChange={(e) => setEditData(prev => ({ ...prev, port: parseInt(e.target.value) || 0 }))}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Port"
              />
              <select
                value={editData.type}
                onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value as any }))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
                <option value="socks4">SOCKS4</option>
                <option value="socks5">SOCKS5</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={editData.username}
                onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Username"
              />
              <div className="flex-1 relative">
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
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-medium">
                {proxy.host}:{proxy.port}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(proxy.type)}`}>
                {proxy.type.toUpperCase()}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proxy.status)}`}>
                {proxy.status}
              </span>
            </div>
            {(proxy.username || proxy.password) && (
              <div className="text-xs text-gray-500">
                {proxy.username && <span>{proxy.username}</span>}
                {proxy.password && <span>:***</span>}
              </div>
            )}
            {proxy.ping && (
              <div className="text-xs text-gray-500">
                Ping: {proxy.ping}ms | Speed: {proxy.speed || 'N/A'}ms
              </div>
            )}
            {proxy.country && (
              <div className="text-xs text-gray-500">
                <Globe className="w-3 h-3 inline mr-1" />
                {proxy.country} {proxy.city && `- ${proxy.city}`}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {!isEditing && (
        <div className="flex items-center space-x-2">
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
        </div>
      )}
    </div>
  )
})

export default function HighPerformanceProxyList({
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
  onRefresh
}: HighPerformanceProxyListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showPassword, setShowPassword] = useState<Set<number>>(new Set())
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [pageSize, setPageSize] = useState(1000) // Giới hạn 1000 proxy mỗi lần
  const [currentPage, setCurrentPage] = useState(0)
  const [showTestUrlSelector, setShowTestUrlSelector] = useState(false)
  const [testUrlSelectorPosition, setTestUrlSelectorPosition] = useState<{ x: number; y: number } | null>(null)
  const [currentTestProxyId, setCurrentTestProxyId] = useState<number | null>(null)
  const [testUrl, setTestUrl] = useState('http://httpbin.org/ip')

  const parentRef = useRef<HTMLDivElement>(null)

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Filtered proxies with memoization
  const filteredProxies = useMemo(() => {
    const filtered = proxies.filter(proxy => {
      const matchesSearch = debouncedSearchTerm === '' || 
        proxy.host.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        proxy.username?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || proxy.status === statusFilter
      const matchesType = typeFilter === 'all' || proxy.type === typeFilter
      
      return matchesSearch && matchesStatus && matchesType
    })
    
    // Apply pagination
    const startIndex = currentPage * pageSize
    const endIndex = startIndex + pageSize
    return filtered.slice(startIndex, endIndex)
  }, [proxies, debouncedSearchTerm, statusFilter, typeFilter, currentPage, pageSize])

  // Virtual scrolling
  const virtualizer = useVirtualizer({
    count: filteredProxies.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated height of each row
    overscan: 10 // Render 10 extra items outside viewport
  })

  // Handle select all
  const handleSelectAll = useCallback((selected: boolean) => {
    setIsSelectAll(selected)
    onSelectAll(selected)
  }, [onSelectAll])

  // Handle individual proxy select
  const handleProxySelect = useCallback((id: number, selected: boolean) => {
    onProxySelect(id, selected)
  }, [onProxySelect])

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
    setTestUrl(url)
    if (currentTestProxyId) {
      onTest(currentTestProxyId)
    }
    setShowTestUrlSelector(false)
    setCurrentTestProxyId(null)
  }, [currentTestProxyId, onTest])

  const handleCloseTestUrlSelector = useCallback(() => {
    setShowTestUrlSelector(false)
    setCurrentTestProxyId(null)
  }, [])

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setStatusFilter('all')
    setTypeFilter('all')
  }, [])

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Proxy List ({filteredProxies.length.toLocaleString()})
          </h3>
          <div className="flex items-center space-x-2">
            {onAddProxy && (
              <button
                onClick={onAddProxy}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Proxy</span>
              </button>
            )}
            {onImportProxy && (
              <button
                onClick={onImportProxy}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1"
              >
                <Upload className="w-4 h-4" />
                <span>Nhập</span>
              </button>
            )}
            {onExportProxy && (
              <button
                onClick={onExportProxy}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Xuất</span>
              </button>
            )}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-1"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Làm mới</span>
              </button>
            )}
            <button
              onClick={handleTestSelected}
              disabled={selectedProxies.length === 0}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Test đã chọn ({selectedProxies.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search proxies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="alive">Alive</option>
            <option value="dead">Dead</option>
            <option value="testing">Testing</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="http">HTTP</option>
            <option value="https">HTTPS</option>
            <option value="socks4">SOCKS4</option>
            <option value="socks5">SOCKS5</option>
          </select>

          <button
            onClick={clearFilters}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear
          </button>
        </div>

        {/* Select All */}
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            checked={isSelectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label className="ml-2 text-sm text-gray-700">
            Select All ({selectedProxies.length} selected)
          </label>
        </div>
      </div>

      {/* Virtual List */}
      <div
        ref={parentRef}
        className="h-96 overflow-auto"
        style={{ contain: 'strict' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative'
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const proxy = filteredProxies[virtualItem.index]
            return (
              <div
                key={proxy.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`
                }}
              >
                <ProxyRow
                  proxy={proxy}
                  isSelected={selectedProxies.includes(proxy.id)}
                  showPassword={showPassword.has(proxy.id)}
                  onSelect={handleProxySelect}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  onTest={onTest}
                  onTogglePassword={handleTogglePassword}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span>Hiển thị {virtualizer.getVirtualItems().length} của {filteredProxies.length} proxy</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(0)
              }}
              className="px-1 py-0.5 border border-gray-300 rounded text-xs"
            >
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
              <option value={5000}>5000</option>
            </select>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-2 py-1 text-xs disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-2 py-1 text-xs">
              {currentPage + 1}/{Math.ceil(proxies.length / pageSize)}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(Math.ceil(proxies.length / pageSize) - 1, currentPage + 1))}
              disabled={currentPage >= Math.ceil(proxies.length / pageSize) - 1}
              className="px-2 py-1 text-xs disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Test URL Selector */}
      {showTestUrlSelector && testUrlSelectorPosition && (
        <TestUrlSelector
          onUrlSelect={handleUrlSelect}
          onClose={handleCloseTestUrlSelector}
          position={testUrlSelectorPosition}
        />
      )}
    </div>
  )
}
