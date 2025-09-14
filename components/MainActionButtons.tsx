'use client'

import { useState } from 'react'
import { Plus, Upload, Download, Filter, Settings, BarChart3, Play, Users } from 'lucide-react'
import AddProxyModal from './AddProxyModal'
import ImportProxyModal from './ImportProxyModal'
import ImportExportModal from './ImportExportModal'
import AdvancedFiltersModal from './AdvancedFiltersModal'

interface MainActionButtonsProps {
  onAddProxy: (proxy: any) => void
  onImportProxy: (file: File) => void
  onExportProxy: (ids: number[], format: string) => void
  onApplyFilters: (filters: any) => void
  proxies: any[]
  selectedCount?: number
  onTestAll?: () => void
  onTestSelected?: () => void
}

export default function MainActionButtons({
  onAddProxy,
  onImportProxy,
  onExportProxy,
  onApplyFilters,
  proxies,
  selectedCount = 0,
  onTestAll,
  onTestSelected
}: MainActionButtonsProps) {
  const [showAddProxy, setShowAddProxy] = useState(false)
  const [showImportProxy, setShowImportProxy] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const handleAddProxy = (proxy: any) => {
    onAddProxy(proxy)
    setShowAddProxy(false)
  }

  const handleImportProxy = (file: File) => {
    onImportProxy(file)
    setShowImportProxy(false)
  }

  const handleExportProxy = (format: string) => {
    onExportProxy([], format) // Export all proxies
    setShowImportExport(false)
  }

  const handleApplyFilters = (filters: any) => {
    onApplyFilters(filters)
    setShowAdvancedFilters(false)
  }

  return (
    <>
      {/* Main Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Proxy Manager</h2>
            <p className="text-gray-600 mt-1">
              Quản lý và test proxy một cách hiệu quả
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{proxies.length}</div>
            <div className="text-sm text-gray-500">Tổng số proxy</div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setShowAddProxy(true)}
            className="flex flex-col items-center p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Thêm Proxy Mới</h3>
            <p className="text-sm text-gray-500 text-center">Thêm proxy đơn lẻ</p>
          </button>

          <button
            onClick={() => setShowImportProxy(true)}
            className="flex flex-col items-center p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Import từ File</h3>
            <p className="text-sm text-gray-500 text-center">TXT, CSV, JSON</p>
          </button>

          <button
            onClick={() => setShowImportExport(true)}
            className="flex flex-col items-center p-6 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-200">
              <Download className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Nhập/Xuất Proxy</h3>
            <p className="text-sm text-gray-500 text-center">Quản lý dữ liệu</p>
          </button>

          <button
            onClick={() => setShowAdvancedFilters(true)}
            className="flex flex-col items-center p-6 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors group"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-200">
              <Filter className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Bộ lọc nâng cao</h3>
            <p className="text-sm text-gray-500 text-center">Tìm kiếm & lọc</p>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          {onTestAll && (
            <button
              onClick={onTestAll}
              className="btn btn-primary btn-sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Test tất cả proxy
            </button>
          )}
          
          {onTestSelected && selectedCount > 0 && (
            <button
              onClick={onTestSelected}
              className="btn btn-secondary btn-sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Test đã chọn ({selectedCount})
            </button>
          )}

          <button
            onClick={() => setShowImportExport(true)}
            className="btn btn-outline btn-sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Cài đặt nâng cao
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddProxyModal
        isOpen={showAddProxy}
        onClose={() => setShowAddProxy(false)}
        onSubmit={handleAddProxy}
      />

      <ImportProxyModal
        isOpen={showImportProxy}
        onClose={() => setShowImportProxy(false)}
        onImport={handleImportProxy}
      />

      <ImportExportModal
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        onImport={handleImportProxy}
        onExport={handleExportProxy}
      />

      <AdvancedFiltersModal
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        proxies={proxies}
        onApplyFilters={handleApplyFilters}
      />
    </>
  )
}
