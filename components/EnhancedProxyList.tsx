'use client'

import React, { useState } from 'react'
import { Edit, Trash2, Play, Pause, Download, Upload, Filter, Search, Globe, CheckSquare, Square, Eye, EyeOff, RefreshCw, Plus, X } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { ProxyImportExport } from '@/utils/importExport'
import AdvancedSearch from './AdvancedSearch'
import AddProxyForm from './AddProxyForm'
import EnhancedBulkActions from './EnhancedBulkActions'
import ProxyHealthIndicator from './ProxyHealthIndicator'
import { useProxyHealthMonitoring } from '@/hooks/useProxyHealthMonitoring'
import TestUrlSelector from './TestUrlSelector'

interface EnhancedProxyListProps {
  proxies: Proxy[]
  onDelete: (id: number) => void
  onUpdate: (id: number, updates: Partial<Proxy>) => void
  onTestAll: () => void
  onTestSelected: (ids: number[]) => void
  onBulkDelete: (ids: number[]) => void
  onBulkUpdate: (ids: number[], updates: Partial<Proxy>) => void
  onBulkExport: (ids: number[], format: string) => void
  onBulkImport: (file: File) => Promise<void>
  onRefresh?: () => void
  onSelectAll: (selected: boolean) => void
  onAddProxy?: (proxy: Omit<Proxy, 'id'>) => void
}

export default function EnhancedProxyList({
  proxies,
  onDelete,
  onUpdate,
  onTestAll,
  onTestSelected,
  onBulkDelete,
  onBulkUpdate,
  onBulkExport,
  onBulkImport,
  onRefresh,
  onSelectAll,
  onAddProxy
}: EnhancedProxyListProps) {
  // Health monitoring
  const { healthMetrics } = useProxyHealthMonitoring(proxies)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedProxies, setSelectedProxies] = useState<number[]>([])
  const [filteredProxies, setFilteredProxies] = useState<Proxy[]>(proxies)
  const [showAddProxyModal, setShowAddProxyModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Proxy>>({})
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({})
  const [showTestUrlSelector, setShowTestUrlSelector] = useState(false)
  const [testUrlSelectorPosition, setTestUrlSelectorPosition] = useState<{ x: number; y: number } | null>(null)
  const [currentTestProxyId, setCurrentTestProxyId] = useState<number | null>(null)
  const [testUrl, setTestUrl] = useState('https://web.telegram.org/')

  // Handle test click with URL selector
  const handleTestClick = (proxyId: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTestUrlSelectorPosition({
      x: rect.left,
      y: rect.bottom + 5
    })
    setCurrentTestProxyId(proxyId)
    setShowTestUrlSelector(true)
  }

  const handleUrlSelect = (url: string) => {
    setTestUrl(url)
    if (currentTestProxyId) {
      onTestSelected([currentTestProxyId])
    }
    setShowTestUrlSelector(false)
    setCurrentTestProxyId(null)
  }

  const handleCloseTestUrlSelector = () => {
    setShowTestUrlSelector(false)
    setCurrentTestProxyId(null)
  }

  // Update filteredProxies when proxies change
  React.useEffect(() => {
    setFilteredProxies(proxies)
  }, [proxies])

  const allSelected = selectedProxies.length === filteredProxies.length && filteredProxies.length > 0
  const someSelected = selectedProxies.length > 0 && selectedProxies.length < filteredProxies.length

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedProxies([])
      onSelectAll(false)
    } else {
      setSelectedProxies(filteredProxies.map(p => p.id))
      onSelectAll(true)
    }
  }

  const handleSelectProxy = (id: number) => {
    setSelectedProxies(prev => 
      prev.includes(id) 
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    )
  }

  const handleEdit = (proxy: Proxy) => {
    setEditingId(proxy.id)
    setEditForm({
      host: proxy.host,
      port: proxy.port,
      username: proxy.username,
      password: proxy.password,
      type: proxy.type,
      country: proxy.country,
      city: proxy.city,
      group: proxy.group,
      notes: proxy.notes,
      anonymity: proxy.anonymity
    })
  }

  const handleSaveEdit = () => {
    if (editingId && editForm) {
      onUpdate(editingId, editForm)
      setEditingId(null)
      setEditForm({})
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onBulkImport) {
      await onBulkImport(file)
    }
    // Reset input
    event.target.value = ''
  }

  const togglePasswordVisibility = (proxyId: number) => {
    setShowPassword(prev => ({
      ...prev,
      [proxyId]: !prev[proxyId]
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'alive': return 'text-green-600 bg-green-50'
      case 'dead': return 'text-red-600 bg-red-50'
      case 'testing': return 'text-blue-600 bg-blue-50'
      default: return 'text-yellow-600 bg-yellow-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'alive': return '✅'
      case 'dead': return '❌'
      case 'testing': return '🔄'
      default: return '⏳'
    }
  }

  const formatLastTested = (lastTested?: string) => {
    if (!lastTested) return 'Chưa test'
    const date = new Date(lastTested)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Danh sách Proxy</h2>
          <div className="flex space-x-2">
            <button
            onClick={() => onTestSelected(selectedProxies)}
            disabled={selectedProxies.length === 0}
            className="btn btn-primary btn-sm bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Play className="h-4 w-4 mr-2" />
            🎯 Test đã chọn ({selectedProxies.length})
          </button>
          <button
            onClick={onTestAll}
            className="btn btn-secondary btn-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0"
          >
            <Play className="h-4 w-4 mr-2" />
            ⚡ Test tất cả
          </button>
          <label className="btn btn-secondary btn-sm cursor-pointer bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0">
            <Upload className="h-4 w-4 mr-2" />
            📥 Nhập
            <input
              type="file"
              accept=".json,.csv,.txt,.xml"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowAddProxyModal(true)}
            className="btn btn-primary btn-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            ➕ Thêm Proxy
          </button>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="btn btn-secondary btn-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </button>
          )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
      {/* Advanced Search */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <AdvancedSearch
          proxies={proxies}
          onFilter={setFilteredProxies}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterType={filterType}
          setFilterType={setFilterType}
        />
      </div>

      {/* Results Summary */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Hiển thị <strong>{filteredProxies.length}</strong> trong tổng số <strong>{proxies.length}</strong> proxy
          </span>
          {selectedProxies.length > 0 && (
            <span>Đã chọn <strong>{selectedProxies.length}</strong> proxy</span>
          )}
        </div>
      </div>

      {/* Enhanced Bulk Actions */}
      {selectedProxies.length > 0 && (
        <EnhancedBulkActions
          selectedProxies={selectedProxies}
          selectedProxiesData={filteredProxies.filter(p => selectedProxies.includes(p.id))}
          onBulkDelete={onBulkDelete}
          onBulkUpdate={onBulkUpdate}
          onBulkTest={onTestSelected}
          onBulkExport={onBulkExport}
        />
      )}

      {/* Proxy Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={input => {
                      if (input) input.indeterminate = someSelected
                    }}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proxy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hiệu suất
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Health
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa điểm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test cuối
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProxies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-gray-400 mb-2">
                      <Globe className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-500">Không tìm thấy proxy nào</p>
                    <p className="text-sm text-gray-400">Thử thay đổi bộ lọc hoặc thêm proxy mới</p>
                  </td>
                </tr>
              ) : (
                filteredProxies.map((proxy) => (
                  <tr key={proxy.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProxies.includes(proxy.id)}
                        onChange={() => handleSelectProxy(proxy.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">
                          {proxy.host}:{proxy.port}
                        </div>
                        <div className="text-sm text-gray-500">
                          {proxy.type.toUpperCase()} • {proxy.anonymity || 'Unknown'}
                        </div>
                        {proxy.username && (
                          <div className="text-xs text-gray-400 flex items-center">
                            <span className="mr-2">{proxy.username}</span>
                            <button
                              onClick={() => togglePasswordVisibility(proxy.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {showPassword[proxy.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                            {showPassword[proxy.id] && proxy.password && (
                              <span className="ml-2">:{proxy.password}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(proxy.status)}`}>
                        <span className="mr-1">{getStatusIcon(proxy.status)}</span>
                        {proxy.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {proxy.ping && (
                          <div className="text-sm text-gray-900">{proxy.ping}ms</div>
                        )}
                        {proxy.speed && (
                          <div className="text-xs text-gray-500">{proxy.speed} KB/s</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ProxyHealthIndicator 
                        metrics={healthMetrics.get(proxy.id)} 
                        compact={true}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {proxy.country && (
                          <div className="text-sm text-gray-900">{proxy.country}</div>
                        )}
                        {proxy.city && (
                          <div className="text-xs text-gray-500">{proxy.city}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {formatLastTested(proxy.lastTested)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => handleTestClick(proxy.id, e)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Kiểm tra proxy"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(proxy)}
                          className="text-gray-600 hover:text-gray-900 p-1"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(proxy.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Proxy Modal */}
      {showAddProxyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Thêm Proxy Mới</h3>
                <button
                  onClick={() => setShowAddProxyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <AddProxyForm
                isOpen={showAddProxyModal}
                onClose={() => setShowAddProxyModal(false)}
                onAddProxy={(proxy) => {
                  if (onAddProxy) {
                    onAddProxy(proxy)
                  }
                  setShowAddProxyModal(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span>Hiển thị {filteredProxies.length} của {proxies.length} proxy</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-400">Enhanced Proxy List</span>
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
