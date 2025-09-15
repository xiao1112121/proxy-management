'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Edit, Trash2, Play, Pause, Download, Upload, Filter, Search, Globe, CheckSquare, Square, Eye, EyeOff, RefreshCw, Plus, X } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface ProxyListProps {
  proxies: Proxy[]
  onDelete: (id: number) => void
  onUpdate: (id: number, updates: Partial<Proxy>) => void
  onTestSelected: (ids: number[]) => void
  onTestAll: () => void
  onSelectAll: (selected: boolean) => void
  onRefresh?: () => void
  onBulkDelete?: (ids: number[]) => void
  onBulkUpdate?: (ids: number[], updates: Partial<Proxy>) => void
  onBulkExport?: (ids: number[], format: string) => void
  onBulkImport?: (file: File) => void
  onAddProxy?: (proxy: Omit<Proxy, 'id'>) => void
}

const ProxyList = React.memo(function ProxyList({ 
  proxies, 
  onDelete, 
  onUpdate, 
  onTestSelected, 
  onTestAll, 
  onSelectAll, 
  onRefresh,
  onBulkDelete,
  onBulkUpdate,
  onBulkExport,
  onBulkImport,
  onAddProxy
}: ProxyListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedProxies, setSelectedProxies] = useState<number[]>([])
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({})

  // Filter proxies based on search and filters
  const filteredProxies = useMemo(() => {
    return proxies.filter((proxy: Proxy) => {
      const matchesSearch = searchTerm === '' || 
        proxy.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proxy.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proxy.password?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === 'all' || proxy.status === filterStatus
      const matchesType = filterType === 'all' || proxy.type === filterType

      return matchesSearch && matchesStatus && matchesType
    })
  }, [proxies, searchTerm, filterStatus, filterType])

  const allSelected = selectedProxies.length === filteredProxies.length && filteredProxies.length > 0

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedProxies([])
      onSelectAll(false)
    } else {
      setSelectedProxies(filteredProxies.map((p: Proxy) => p.id))
      onSelectAll(true)
    }
  }, [allSelected, filteredProxies, onSelectAll])

  const handleSelectProxy = useCallback((id: number) => {
    setSelectedProxies(prev => 
      prev.includes(id) 
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    )
  }, [])

  const handleBulkDelete = useCallback((ids: number[]) => {
    if (ids.length === 0) return
    
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa ${ids.length} proxy đã chọn? Hành động này không thể hoàn tác.`
    )
    
    if (!confirmed) return
    
    if (onBulkDelete) {
      onBulkDelete(ids)
    } else {
      ids.forEach(id => onDelete(id))
    }
    // Clear selection after deletion
    setSelectedProxies([])
  }, [onBulkDelete, onDelete])

  const togglePasswordVisibility = useCallback((id: number) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <button
            onClick={() => handleBulkDelete(selectedProxies)}
            disabled={selectedProxies.length === 0}
            className="btn btn-danger btn-sm bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            🗑️ Xóa đã chọn ({selectedProxies.length})
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

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm proxy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="alive">✅ Alive</option>
              <option value="dead">❌ Dead</option>
              <option value="pending">⏳ Pending</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả loại</option>
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks4">SOCKS4</option>
              <option value="socks5">SOCKS5</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
                setFilterType('all')
              }}
              className="btn btn-ghost btn-sm flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Proxy List */}
      {filteredProxies.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy proxy</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Bắt đầu bằng cách thêm proxy mới'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  {allSelected ? (
                    <CheckSquare className="h-5 w-5 text-blue-600 mr-2" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400 mr-2" />
                  )}
                  {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {selectedProxies.length} / {filteredProxies.length} đã chọn
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chọn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Host:Port
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông tin đăng nhập
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hiệu suất
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quốc gia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ẩn danh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ghi chú
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProxies.map((proxy: Proxy) => (
                  <tr key={proxy.id} className={`hover:bg-gray-50 ${selectedProxies.includes(proxy.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleSelectProxy(proxy.id)}
                        className="flex items-center"
                      >
                        {selectedProxies.includes(proxy.id) ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        proxy.status === 'alive' 
                          ? 'bg-green-100 text-green-800' 
                          : proxy.status === 'dead'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          proxy.status === 'alive' 
                            ? 'bg-green-400' 
                            : proxy.status === 'dead'
                            ? 'bg-red-400'
                            : 'bg-yellow-400'
                        }`} />
                        {proxy.status === 'alive' ? '✅ Alive' : proxy.status === 'dead' ? '❌ Dead' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proxy.type?.toUpperCase() || 'HTTP'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-mono text-gray-900">
                          {proxy.host}:{proxy.port}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(`${proxy.host}:${proxy.port}`)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {proxy.username && proxy.password ? (
                        <div className="text-sm">
                          <div className="flex items-center">
                            <span className="text-gray-900">User: {proxy.username}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-gray-900">
                              Pass: {showPassword[proxy.id] ? proxy.password : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(proxy.id)}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword[proxy.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Không có</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proxy.ping ? `${proxy.ping}ms` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{proxy.country || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{proxy.anonymity || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proxy.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onTestSelected([proxy.id])}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Test proxy"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(proxy.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div>
                Hiển thị {filteredProxies.length} / {proxies.length} proxy
              </div>
              <div className="flex items-center gap-4">
                <span>✅ Alive: {filteredProxies.filter((p: Proxy) => p.status === 'alive').length}</span>
                <span>❌ Dead: {filteredProxies.filter((p: Proxy) => p.status === 'dead').length}</span>
                <span>⏳ Pending: {filteredProxies.filter((p: Proxy) => p.status === 'pending').length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default ProxyList
