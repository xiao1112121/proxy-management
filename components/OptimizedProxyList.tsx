'use client'

import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react'
import { Edit, Trash2, Play, Eye, EyeOff, CheckSquare, Square, Globe, Search, Filter, Zap, Clock, Database } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { useOptimizedProxyList } from '@/hooks/useOptimizedProxyList'
import { PerformanceOptimizer } from '@/utils/performanceOptimizer'
import TestUrlSelector from './TestUrlSelector'

interface OptimizedProxyListProps {
  initialProxies?: Proxy[]
  onProxyUpdate?: (proxy: Proxy) => void
  onProxyDelete?: (id: number) => void
  onProxyTest?: (id: number) => void
  onBulkTest?: (ids: number[]) => void
  enableVirtualization?: boolean
  enableCaching?: boolean
  enableBatchOperations?: boolean
}

// Memoized proxy row component for maximum performance
const ProxyRow = memo(function ProxyRow({
  proxy,
  isSelected,
  showPassword,
  onSelect,
  onDelete,
  onUpdate,
  onTest,
  onTogglePassword,
  testResult
}: {
  proxy: Proxy
  isSelected: boolean
  showPassword: boolean
  onSelect: (id: number, selected: boolean) => void
  onDelete: (id: number) => void
  onUpdate: (id: number, updates: Partial<Proxy>) => void
  onTest: (id: number) => void
  onTogglePassword: (id: number) => void
  testResult?: any
}) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editData, setEditData] = React.useState({
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

  const handleInputChange = useCallback((field: string, value: string | number) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }, [])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'alive': return 'text-green-600 bg-green-100'
      case 'dead': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-gray-600 bg-gray-100'
      case 'testing': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }, [])

  const getTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'http': return 'text-blue-600 bg-blue-100'
      case 'https': return 'text-green-600 bg-green-100'
      case 'socks4': return 'text-purple-600 bg-purple-100'
      case 'socks5': return 'text-indigo-600 bg-indigo-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }, [])

  return (
    <tr className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(proxy.id, e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
      </td>
      
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            type="text"
            value={editData.host}
            onChange={(e) => handleInputChange('host', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        ) : (
          <span className="font-mono text-sm">{proxy.host}</span>
        )}
      </td>
      
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            type="number"
            value={editData.port}
            onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        ) : (
          <span className="font-mono text-sm">{proxy.port}</span>
        )}
      </td>
      
      <td className="px-4 py-3">
        {isEditing ? (
          <select
            value={editData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="http">HTTP</option>
            <option value="https">HTTPS</option>
            <option value="socks4">SOCKS4</option>
            <option value="socks5">SOCKS5</option>
          </select>
        ) : (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(proxy.type)}`}>
            {proxy.type.toUpperCase()}
          </span>
        )}
      </td>
      
      <td className="px-4 py-3">
        {isEditing ? (
          <div className="flex space-x-2">
            <input
              type="text"
              value={editData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Username"
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <div className="relative flex-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={editData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Password"
                className="w-full px-2 py-1 pr-8 border border-gray-300 rounded text-sm"
              />
              <button
                type="button"
                onClick={() => onTogglePassword(proxy.id)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {proxy.username && (
              <span className="text-sm text-gray-600">{proxy.username}</span>
            )}
            {proxy.password && (
              <span className="text-sm text-gray-400">••••••</span>
            )}
            {!proxy.username && !proxy.password && (
              <span className="text-sm text-gray-400">No auth</span>
            )}
          </div>
        )}
      </td>
      
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proxy.status || 'unknown')}`}>
          {proxy.status || 'Unknown'}
        </span>
      </td>
      
      <td className="px-4 py-3">
        {testResult ? (
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {testResult.success ? `${testResult.ping.toFixed(0)}ms` : 'Failed'}
            </span>
            {testResult.success && (
              <Zap className="h-4 w-4 text-green-500" />
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-400">Not tested</span>
        )}
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          {proxy.country && (
            <span className="text-sm text-gray-600">{proxy.country}</span>
          )}
          {proxy.city && (
            <span className="text-sm text-gray-400">({proxy.city})</span>
          )}
          {!proxy.country && !proxy.city && (
            <span className="text-sm text-gray-400">Unknown</span>
          )}
        </div>
      </td>
      
      <td className="px-4 py-3">
        {isEditing ? (
          <textarea
            value={editData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Notes"
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            rows={2}
          />
        ) : (
          <span className="text-sm text-gray-600">{proxy.notes || '-'}</span>
        )}
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-1 text-green-600 hover:text-green-700 transition-colors"
                title="Save"
              >
                <CheckSquare className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-red-600 hover:text-red-700 transition-colors"
                title="Cancel"
              >
                <Square className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onTest(proxy.id)}
                className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                title="Test"
              >
                <Play className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-yellow-600 hover:text-yellow-700 transition-colors"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(proxy.id)}
                className="p-1 text-red-600 hover:text-red-700 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
})

// Main component
export default function OptimizedProxyList({
  initialProxies = [],
  onProxyUpdate,
  onProxyDelete,
  onProxyTest,
  onBulkTest,
  enableVirtualization = true,
  enableCaching = true,
  enableBatchOperations = true
}: OptimizedProxyListProps) {
  const {
    proxies,
    filteredProxies,
    selectedProxies,
    isLoading,
    isTesting,
    testResults,
    searchTerm,
    sortBy,
    sortDirection,
    filterBy,
    performanceMetrics,
    addProxy,
    updateProxy,
    deleteProxy,
    deleteSelectedProxies,
    testProxies,
    selectProxy,
    selectAllProxies,
    setSortBy,
    setFilterBy,
    clearFilters,
    debouncedSearch,
    getPerformanceMetrics
  } = useOptimizedProxyList({
    initialProxies,
    enableVirtualization,
    enableCaching,
    enableBatchOperations
  })

  const [showPassword, setShowPassword] = React.useState<Set<number>>(new Set())
  const [showPerformanceMetrics, setShowPerformanceMetrics] = React.useState(false)
  const [pageSize, setPageSize] = React.useState(100)
  const [currentPage, setCurrentPage] = React.useState(0)
  const [showTestUrlSelector, setShowTestUrlSelector] = React.useState(false)
  const [testUrlSelectorPosition, setTestUrlSelectorPosition] = React.useState<{ x: number; y: number } | null>(null)
  const [currentTestProxyId, setCurrentTestProxyId] = React.useState<number | null>(null)
  const [testUrl, setTestUrl] = React.useState('http://httpbin.org/ip')

  // Performance monitoring
  const performanceRef = useRef<HTMLDivElement>(null)
  const metrics = getPerformanceMetrics()

  // Memoized handlers
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value)
  }, [debouncedSearch])

  const handleSort = useCallback((column: keyof Proxy) => {
    const newDirection = sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortBy(column, newDirection)
  }, [sortBy, sortDirection, setSortBy])

  const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    selectAllProxies(e.target.checked)
  }, [selectAllProxies])

  const handleTestSelected = useCallback(() => {
    const selectedIds = Array.from(selectedProxies)
    if (selectedIds.length > 0) {
      testProxies(selectedIds)
      onBulkTest?.(selectedIds as number[])
    }
  }, [selectedProxies, testProxies, onBulkTest])

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
      onBulkTest?.([currentTestProxyId])
    }
    setShowTestUrlSelector(false)
    setCurrentTestProxyId(null)
  }, [currentTestProxyId, onBulkTest])

  const handleCloseTestUrlSelector = useCallback(() => {
    setShowTestUrlSelector(false)
    setCurrentTestProxyId(null)
  }, [])

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

  // Memoized statistics
  const statistics = useMemo(() => ({
    total: proxies.length,
    filtered: filteredProxies.length,
    selected: selectedProxies.size,
    active: proxies.filter(p => p.status === 'alive').length,
    tested: testResults.size,
    successful: Array.from(testResults.values()).filter((r: any) => r.success).length
  }), [proxies, filteredProxies, selectedProxies, testResults])

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Optimized Proxy List</h2>
          <button
            onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Database className="h-4 w-4" />
            <span>Performance</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">

      {/* Performance Metrics */}
      {showPerformanceMetrics && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.renderTime.toFixed(2)}ms</div>
              <div className="text-sm text-gray-600">Render Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.cacheHitRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Cache Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.totalProxies}</div>
              <div className="text-sm text-gray-600">Total Proxies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.filteredProxies}</div>
              <div className="text-sm text-gray-600">Filtered</div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{statistics.total}</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Filtered</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{statistics.filtered}</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">Selected</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{statistics.selected}</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{statistics.active}</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Tested</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{statistics.tested}</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Success</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{statistics.successful}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search proxies..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterBy.type || ''}
              onChange={(e) => setFilterBy({ type: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks4">SOCKS4</option>
              <option value="socks5">SOCKS5</option>
            </select>
            
            <select
              value={filterBy.status || ''}
              onChange={(e) => setFilterBy({ status: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="alive">Alive</option>
              <option value="dead">Dead</option>
              <option value="pending">Pending</option>
              <option value="testing">Testing</option>
            </select>
            
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedProxies.size === filteredProxies.length && filteredProxies.length > 0}
            onChange={handleSelectAll}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">
            {selectedProxies.size} of {filteredProxies.length} selected
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedProxies.size > 0 && (
            <>
              <button
                onClick={handleTestSelected}
                disabled={isTesting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Play className="h-4 w-4" />
                <span>Test đã chọn</span>
              </button>
              <button
                onClick={deleteSelectedProxies}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Selected</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Proxy Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedProxies.size === filteredProxies.length && filteredProxies.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('host')}
                >
                  Host {sortBy === 'host' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('port')}
                >
                  Port {sortBy === 'port' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('type')}
                >
                  Type {sortBy === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auth
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  Status {sortBy === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Result
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('country')}
                >
                  Location {sortBy === 'country' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProxies.map((proxy) => (
                <ProxyRow
                  key={proxy.id}
                  proxy={proxy}
                  isSelected={selectedProxies.has(proxy.id)}
                  showPassword={showPassword.has(proxy.id)}
                  onSelect={selectProxy}
                  onDelete={deleteProxy}
                  onUpdate={updateProxy}
                  onTest={onProxyTest || (() => {})}
                  onTogglePassword={handleTogglePassword}
                  testResult={testResults.get(proxy.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Empty State */}
      {filteredProxies.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Globe className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No proxies found</h3>
          <p className="text-gray-600">
            {searchTerm || Object.values(filterBy).some(f => f) 
              ? 'Try adjusting your search or filters'
              : 'Add some proxies to get started'
            }
          </p>
        </div>
      )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span>Hiển thị {filteredProxies.length} của {proxies.length} proxy</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-1 py-0.5 border border-gray-300 rounded text-xs"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
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
              {currentPage + 1}/{Math.ceil(filteredProxies.length / pageSize)}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(Math.ceil(filteredProxies.length / pageSize) - 1, currentPage + 1))}
              disabled={currentPage >= Math.ceil(filteredProxies.length / pageSize) - 1}
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
