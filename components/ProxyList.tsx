'use client'

import { useState } from 'react'
import { Edit, Trash2, Play, Pause, Download, Upload, Filter, Search, Globe, CheckSquare, Square, Eye, EyeOff, RefreshCw, Plus, X } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { ProxyImportExport } from '@/utils/importExport'
import AdvancedFiltersModal from './AdvancedFiltersModal'
import BulkOperations from './BulkOperations'
import ExportWithFilters from './ExportWithFilters'
import AddProxyForm from './AddProxyForm'
import AdvancedSearch from './AdvancedSearch'

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

export default function ProxyList({ 
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
  const [filterAnonymity, setFilterAnonymity] = useState('all')
  const [filterCountry, setFilterCountry] = useState('all')
  const [filterGroup, setFilterGroup] = useState('all')
  const [filterPing, setFilterPing] = useState('all')
  const [filterSpeed, setFilterSpeed] = useState('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showAddProxyModal, setShowAddProxyModal] = useState(false)
  const [selectedProxies, setSelectedProxies] = useState<number[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [filteredProxies, setFilteredProxies] = useState<Proxy[]>(proxies)
  const [editForm, setEditForm] = useState<Partial<Proxy>>({})
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({})
  const [showAdvancedFiltersModal, setShowAdvancedFiltersModal] = useState(false)
  const [savedFilters, setSavedFilters] = useState<Record<string, any>>({})
  // const [showAddProxyModal, setShowAddProxyModal] = useState(false) // Removed - using tab-based design

  const filteredProxies = proxies.filter(proxy => {
    const matchesSearch = proxy.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proxy.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proxy.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proxy.group?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proxy.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || proxy.type === filterType
    const matchesStatus = filterStatus === 'all' || proxy.status === filterStatus
    const matchesAnonymity = filterAnonymity === 'all' || proxy.anonymity === filterAnonymity
    const matchesCountry = filterCountry === 'all' || proxy.country === filterCountry
    const matchesGroup = filterGroup === 'all' || proxy.group === filterGroup
    
    // Ping filter
    let matchesPing = true
    if (filterPing !== 'all' && proxy.ping) {
      const ping = proxy.ping
      switch (filterPing) {
        case 'very-fast': matchesPing = ping < 100; break
        case 'fast': matchesPing = ping >= 100 && ping < 300; break
        case 'medium': matchesPing = ping >= 300 && ping < 500; break
        case 'slow': matchesPing = ping >= 500 && ping < 1000; break
        case 'very-slow': matchesPing = ping >= 1000; break
      }
    }
    
    // Speed filter
    let matchesSpeed = true
    if (filterSpeed !== 'all' && proxy.speed) {
      const speed = proxy.speed
      switch (filterSpeed) {
        case 'very-fast': matchesSpeed = speed > 10; break
        case 'fast': matchesSpeed = speed >= 5 && speed <= 10; break
        case 'medium': matchesSpeed = speed >= 2 && speed < 5; break
        case 'slow': matchesSpeed = speed >= 1 && speed < 2; break
        case 'very-slow': matchesSpeed = speed < 1; break
      }
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesAnonymity && 
           matchesCountry && matchesGroup && matchesPing && matchesSpeed
  })

  // Get unique values for filter dropdowns
  const uniqueCountries = Array.from(new Set(proxies.map(p => p.country).filter(Boolean))).sort()
  const uniqueGroups = Array.from(new Set(proxies.map(p => p.group).filter(Boolean))).sort()
  
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
    if (selectedProxies.includes(id)) {
      setSelectedProxies(selectedProxies.filter(pid => pid !== id))
    } else {
      setSelectedProxies([...selectedProxies, id])
    }
  }

  const handleEdit = (proxy: Proxy) => {
    setEditingId(proxy.id)
    setEditForm(proxy)
  }

  const handleSave = () => {
    if (editingId) {
      onUpdate(editingId, editForm)
      setEditingId(null)
      setEditForm({})
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleTest = async (proxy: Proxy) => {
    onUpdate(proxy.id, { status: 'testing' })
    
    try {
      // Real proxy test via API
      const response = await fetch('/api/test-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: proxy.host,
          port: proxy.port,
          username: proxy.username,
          password: proxy.password,
          type: proxy.type
        })
      })

      const result = await response.json()
      
      onUpdate(proxy.id, {
        status: result.success ? 'alive' : 'dead',
        ping: result.ping,
        speed: result.speed,
        publicIP: result.publicIP,
        country: result.country,
        city: result.city,
        anonymity: result.anonymity,
        lastTested: new Date().toISOString()
      })
    } catch (error) {
      onUpdate(proxy.id, { 
        status: 'dead',
        lastTested: new Date().toISOString()
      })
    }
  }

  const togglePasswordVisibility = (id: number) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setFilterType('all')
    setFilterStatus('all')
    setFilterAnonymity('all')
    setFilterCountry('all')
    setFilterGroup('all')
    setFilterPing('all')
    setFilterSpeed('all')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'alive': return 'bg-green-100 text-green-800'
      case 'dead': return 'bg-red-100 text-red-800'
      case 'testing': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'alive': return '🟢 Alive'
      case 'dead': return '🔴 Dead'
      case 'testing': return '🔵 Testing'
      case 'pending': return '🟡 Pending'
      default: return status
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'http': return 'bg-blue-100 text-blue-800'
      case 'https': return 'bg-green-100 text-green-800'
      case 'socks4': return 'bg-purple-100 text-purple-800'
      case 'socks5': return 'bg-indigo-100 text-indigo-800'
      case 'residential': return 'bg-orange-100 text-orange-800'
      case 'datacenter': return 'bg-gray-100 text-gray-800'
      case 'mobile': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAnonymityColor = (anonymity?: string) => {
    switch (anonymity) {
      case 'elite': return 'bg-green-100 text-green-800'
      case 'anonymous': return 'bg-yellow-100 text-yellow-800'
      case 'transparent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAnonymityText = (anonymity?: string) => {
    switch (anonymity) {
      case 'elite': return 'Elite'
      case 'anonymous': return 'Anonymous'
      case 'transparent': return 'Transparent'
      default: return 'Unknown'
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(proxies, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = 'proxies.json'
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check supported file types
      const supportedTypes = ['.json', '.csv', '.txt', '.xml']
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      
      if (!supportedTypes.includes(fileExtension)) {
        alert(`Định dạng file không được hỗ trợ. Vui lòng chọn file: ${supportedTypes.join(', ')}`)
        event.target.value = ''
        return
      }
      
      try {
        // Use ProxyImportExport to handle different file formats
        const result = await ProxyImportExport.importProxies(file)
        
        if (result.success) {
          // Call the import handler if provided
          if (onBulkImport) {
            onBulkImport(file)
          } else {
            console.log('Import handler not provided')
          }
          
          // Show success message
          alert(`Import thành công! Đã nhập ${result.imported.length} proxy.`)
        } else {
          // Show error messages
          const errorMessage = result.errors.length > 0 
            ? `Lỗi import: ${result.errors.join(', ')}`
            : 'Không thể import file này.'
          alert(errorMessage)
        }
      } catch (error) {
        console.error('Error importing file:', error)
        alert(`Lỗi khi đọc file: ${error instanceof Error ? error.message : 'Định dạng file không hợp lệ'}`)
      }
    }
    // Reset input value to allow selecting the same file again
    event.target.value = ''
  }

  const handleBulkDelete = (ids: number[]) => {
    if (onBulkDelete) {
      onBulkDelete(ids)
    } else {
      ids.forEach(id => onDelete(id))
    }
  }

  const handleBulkUpdate = (ids: number[], updates: Partial<Proxy>) => {
    if (onBulkUpdate) {
      onBulkUpdate(ids, updates)
    } else {
      ids.forEach(id => onUpdate(id, updates))
    }
  }

  const handleBulkExport = (ids: number[], format: string) => {
    if (onBulkExport) {
      onBulkExport(ids, format)
    } else {
      // Default export implementation
      const selectedProxies = proxies.filter(p => ids.includes(p.id))
      const dataStr = JSON.stringify(selectedProxies, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      const exportFileDefaultName = `proxies.${format}`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
    }
  }

  const handleBulkImport = (file: File) => {
    if (onBulkImport) {
      onBulkImport(file)
    } else {
      // Default import implementation
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedProxies = JSON.parse(e.target?.result as string)
          console.log('Imported proxies:', importedProxies)
        } catch (error) {
          alert('Lỗi khi đọc file. Vui lòng kiểm tra định dạng file.')
        }
      }
      reader.readAsText(file)
    }
  }

  // handleAddProxy removed - using tab-based design

  return (
    <div className="space-y-6">
      {/* Bulk Operations */}
      {selectedProxies.length > 0 && (
        <BulkOperations
          selectedProxies={selectedProxies}
          proxies={proxies}
          onBulkDelete={handleBulkDelete}
          onBulkTest={onTestSelected}
          onBulkUpdate={handleBulkUpdate}
          onBulkExport={handleBulkExport}
          onBulkImport={handleBulkImport}
          onClearSelection={() => setSelectedProxies([])}
        />
      )}


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
            onClick={() => setShowExportModal(true)}
            className="btn btn-secondary btn-sm bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0"
          >
            <Download className="h-4 w-4 mr-2" />
            📤 Xuất với bộ lọc
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

      {/* Advanced Search */}
      <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
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

      {/* Legacy Filters - Keep for backward compatibility */}
      <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm" style={{ display: 'none' }}>
        <div className="flex flex-wrap items-center gap-4">

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
              <option value="testing">🔄 Testing</option>
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
              <option value="residential">Residential</option>
              <option value="datacenter">Datacenter</option>
              <option value="mobile">Mobile</option>
            </select>

            <select
              value={filterAnonymity}
              onChange={(e) => setFilterAnonymity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả mức ẩn danh</option>
              <option value="transparent">🔍 Transparent</option>
              <option value="anonymous">👤 Anonymous</option>
              <option value="elite">🔒 Elite</option>
            </select>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-2 border rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 transform hover:scale-105 ${
                showAdvancedFilters 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-blue-500' 
                  : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-md hover:shadow-lg border-gray-500'
              }`}
            >
              <Filter className="h-4 w-4" />
              🔍 Bộ lọc nâng cao
            </button>

            {/* Preset Filters */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setFilterStatus('alive')
                  setFilterType('all')
                  setFilterAnonymity('elite')
                }}
                className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white border-0 rounded-lg hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                🔒 Elite Alive
              </button>
              <button
                onClick={() => {
                  setFilterStatus('alive')
                  setFilterPing('very-fast')
                  setFilterSpeed('fast')
                }}
                className="px-3 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                ⚡ Nhanh nhất
              </button>
              <button
                onClick={() => {
                  setFilterStatus('dead')
                }}
                className="px-3 py-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                ❌ Proxy lỗi
              </button>
            </div>

            {/* Clear Filters */}
            {(searchTerm || filterStatus !== 'all' || filterType !== 'all' || filterAnonymity !== 'all' || 
              filterCountry !== 'all' || filterGroup !== 'all' || filterPing !== 'all' || filterSpeed !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterType('all')
                  setFilterStatus('all')
                  setFilterAnonymity('all')
                  setFilterCountry('all')
                  setFilterGroup('all')
                  setFilterPing('all')
                  setFilterSpeed('all')
                }}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quốc gia</label>
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả quốc gia</option>
                  {Array.from(new Set(proxies.map(p => p.country).filter(Boolean))).map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nhóm</label>
                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả nhóm</option>
                  {Array.from(new Set(proxies.map(p => p.group).filter(Boolean))).map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ping</label>
                <select
                  value={filterPing}
                  onChange={(e) => setFilterPing(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả ping</option>
                  <option value="very-fast">⚡ Rất nhanh (&lt;100ms)</option>
                  <option value="fast">🚀 Nhanh (100-300ms)</option>
                  <option value="medium">⏱️ Trung bình (300-500ms)</option>
                  <option value="slow">🐌 Chậm (500-1000ms)</option>
                  <option value="very-slow">🐢 Rất chậm (&gt;1000ms)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tốc độ</label>
                <select
                  value={filterSpeed}
                  onChange={(e) => setFilterSpeed(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả tốc độ</option>
                  <option value="very-fast">⚡ Rất nhanh (&gt;5000 KB/s)</option>
                  <option value="fast">🚀 Nhanh (2000-5000 KB/s)</option>
                  <option value="medium">⏱️ Trung bình (500-2000 KB/s)</option>
                  <option value="slow">🐌 Chậm (100-500 KB/s)</option>
                  <option value="very-slow">🐢 Rất chậm (&lt;100 KB/s)</option>
                </select>
              </div>
            </div>

            {/* Filter Stats */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div>
                Hiển thị {filteredProxies.length} / {proxies.length} proxy
              </div>
              <div className="flex items-center gap-4">
                <span>✅ Alive: {filteredProxies.filter(p => p.status === 'alive').length}</span>
                <span>❌ Dead: {filteredProxies.filter(p => p.status === 'dead').length}</span>
                <span>⏳ Pending: {filteredProxies.filter(p => p.status === 'pending').length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Proxy Table */}
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center"
                  >
                    {allSelected ? (
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : someSelected ? (
                      <Square className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proxy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ping
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quốc gia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ẩn danh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
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
              {filteredProxies.map((proxy) => (
                <tr key={proxy.id} className={`hover:bg-gray-50 ${selectedProxies.includes(proxy.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleSelectProxy(proxy.id)}
                      className="flex items-center"
                    >
                      {selectedProxies.includes(proxy.id) ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === proxy.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editForm.host || ''}
                          onChange={(e) => setEditForm({...editForm, host: e.target.value})}
                          className="input text-sm"
                          placeholder="Host"
                        />
                        <input
                          type="number"
                          value={editForm.port || ''}
                          onChange={(e) => setEditForm({...editForm, port: parseInt(e.target.value)})}
                          className="input text-sm"
                          placeholder="Port"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-gray-900">{proxy.host}</div>
                        <div className="text-sm text-gray-500">:{proxy.port}</div>
                        {proxy.username && (
                          <div className="flex items-center text-xs text-gray-400">
                            <span>{proxy.username}:</span>
                            <span className="ml-1">
                              {showPassword[proxy.id] ? proxy.password : '••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(proxy.id)}
                              className="ml-1 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword[proxy.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                          </div>
                        )}
                        {proxy.publicIP && (
                          <div className="text-xs text-blue-600">
                            IP: {proxy.publicIP}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === proxy.id ? (
                      <select
                        value={editForm.type || proxy.type}
                        onChange={(e) => setEditForm({...editForm, type: e.target.value as any})}
                        className="input text-sm"
                      >
                        <option value="http">HTTP</option>
                        <option value="https">HTTPS</option>
                        <option value="socks4">SOCKS4</option>
                        <option value="socks5">SOCKS5</option>
                        <option value="residential">Residential</option>
                        <option value="datacenter">Datacenter</option>
                        <option value="mobile">Mobile</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(proxy.type)}`}>
                        {proxy.type.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {proxy.ping ? (
                      <div className="text-sm text-gray-900">
                        {proxy.ping}ms
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {proxy.country || '-'}
                    </div>
                    {proxy.city && (
                      <div className="text-xs text-gray-500">
                        {proxy.city}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAnonymityColor(proxy.anonymity)}`}>
                      {getAnonymityText(proxy.anonymity)}
                    </span>
                    {(proxy.dnsLeak || proxy.webrtcLeak) && (
                      <div className="text-xs text-red-500 mt-1">
                        {proxy.dnsLeak && 'DNS Leak '}
                        {proxy.webrtcLeak && 'WebRTC Leak'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(proxy.status)}`}>
                      {getStatusText(proxy.status)}
                    </span>
                    {proxy.lastTested && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(proxy.lastTested).toLocaleString('vi-VN')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {proxy.notes || '-'}
                    </div>
                    {proxy.group && (
                      <div className="text-xs text-blue-600">
                        {proxy.group}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingId === proxy.id ? (
                      <div className="flex space-x-2">
                          <button
                          onClick={handleSave}
                          className="text-green-600 hover:text-green-900"
                          >
                            Lưu
                          </button>
                          <button
                          onClick={handleCancel}
                          className="text-gray-600 hover:text-gray-900"
                          >
                            Hủy
                          </button>
                      </div>
                      ) : (
                      <div className="flex space-x-2">
                          <button
                          onClick={() => handleTest(proxy)}
                          disabled={proxy.status === 'testing'}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          <Play className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(proxy)}
                          className="text-yellow-600 hover:text-yellow-900"
                          >
                          <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete(proxy.id)}
                          className="text-red-600 hover:text-red-900"
                          >
                          <Trash2 className="h-4 w-4" />
                          </button>
                      </div>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {filteredProxies.length === 0 && (
        <div className="text-center py-12">
          <Globe className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có proxy nào</h3>
          <p className="mt-1 text-sm text-gray-500">
            {proxies.length === 0 
              ? 'Hãy thêm proxy đầu tiên của bạn.'
              : 'Không tìm thấy proxy nào phù hợp với bộ lọc.'
            }
          </p>
        </div>
      )}

      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal
        isOpen={showAdvancedFiltersModal}
        onClose={() => setShowAdvancedFiltersModal(false)}
        proxies={proxies}
        onApplyFilters={(filters) => {
          // Apply advanced filters
          console.log('Advanced filters applied:', filters)
        }}
      />

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Xuất Proxy với Bộ lọc</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <ExportWithFilters
                proxies={proxies}
                onExport={(proxies, format) => {
                  onBulkExport?.(proxies.map(p => p.id), format)
                  setShowExportModal(false)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Proxy Form Modal */}
      <AddProxyForm
        isOpen={showAddProxyModal}
        onClose={() => setShowAddProxyModal(false)}
        onAddProxy={(proxy) => {
          if (onAddProxy) {
            onAddProxy(proxy)
          }
        }}
      />

      {/* Add Proxy functionality moved to separate tab */}
    </div>
  )
}
