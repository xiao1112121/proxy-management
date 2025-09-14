'use client'

import { useState } from 'react'
import { 
  Trash2, 
  Play, 
  Pause, 
  Download, 
  Upload, 
  Edit, 
  Tag, 
  Settings,
  X,
  CheckSquare
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import ExportWithFilters from './ExportWithFilters'

interface BulkOperationsProps {
  selectedProxies: number[]
  proxies: Proxy[]
  onBulkDelete: (ids: number[]) => void
  onBulkTest: (ids: number[]) => void
  onBulkUpdate: (ids: number[], updates: Partial<Proxy>) => void
  onBulkExport: (ids: number[], format: string) => void
  onBulkImport: (file: File) => void
  onClearSelection: () => void
}

export default function BulkOperations({
  selectedProxies,
  proxies,
  onBulkDelete,
  onBulkTest,
  onBulkUpdate,
  onBulkExport,
  onBulkImport,
  onClearSelection
}: BulkOperationsProps) {
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [updateData, setUpdateData] = useState({
    group: '',
    notes: '',
    status: 'alive' as 'alive' | 'dead' | 'pending' | 'testing'
  })

  const selectedProxiesData = proxies.filter(p => selectedProxies.includes(p.id))

  const handleBulkDelete = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedProxies.length} proxy đã chọn?`)) {
      onBulkDelete(selectedProxies)
    }
  }

  const handleBulkTest = () => {
    onBulkTest(selectedProxies)
  }

  const handleBulkUpdate = () => {
    const updates: Partial<Proxy> = {}
    if (updateData.group) updates.group = updateData.group
    if (updateData.notes) updates.notes = updateData.notes
    if (updateData.status) updates.status = updateData.status

    if (Object.keys(updates).length > 0) {
      onBulkUpdate(selectedProxies, updates)
      setShowUpdateModal(false)
      setUpdateData({ group: '', notes: '', status: 'alive' })
    }
  }

  const handleBulkExport = (format: string) => {
    onBulkExport(selectedProxies, format)
  }

  const handleBulkImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onBulkImport(file)
    }
  }

  const getStatusStats = () => {
    const stats = selectedProxiesData.reduce((acc, proxy) => {
      acc[proxy.status] = (acc[proxy.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return stats
  }

  const getTypeStats = () => {
    const stats = selectedProxiesData.reduce((acc, proxy) => {
      acc[proxy.type] = (acc[proxy.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return stats
  }

  const statusStats = getStatusStats()
  const typeStats = getTypeStats()

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <CheckSquare className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">
                {selectedProxies.length} proxy đã chọn
              </span>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center space-x-4 text-sm text-blue-700">
              {Object.entries(statusStats).map(([status, count]) => (
                <span key={status} className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-400 mr-1"></span>
                  {status}: {count}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={onClearSelection}
            className="text-blue-600 hover:text-blue-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={handleBulkTest}
            className="btn btn-primary btn-sm"
          >
            <Play className="h-4 w-4 mr-2" />
            Test ({selectedProxies.length})
          </button>

          <button
            onClick={() => setShowUpdateModal(true)}
            className="btn btn-secondary btn-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Cập nhật
          </button>

          <button
            onClick={handleBulkDelete}
            className="btn btn-danger btn-sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="btn btn-secondary btn-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Xuất với bộ lọc
          </button>

          <label className="btn btn-secondary btn-sm cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Import
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleBulkImport}
              className="hidden"
            />
          </label>
        </div>

        {/* Detailed Stats */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Phân loại theo trạng thái:</h4>
            <div className="space-y-1">
              {Object.entries(statusStats).map(([status, count]) => (
                <div key={status} className="flex justify-between">
                  <span className="capitalize">{status}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Phân loại theo loại:</h4>
            <div className="space-y-1">
              {Object.entries(typeStats).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="uppercase">{type}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Cập nhật hàng loạt
              </h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhóm
                </label>
                <input
                  type="text"
                  value={updateData.group}
                  onChange={(e) => setUpdateData({...updateData, group: e.target.value})}
                  className="input"
                  placeholder="Nhập tên nhóm mới"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={updateData.notes}
                  onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
                  className="input"
                  rows={3}
                  placeholder="Nhập ghi chú mới"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({...updateData, status: e.target.value as any})}
                  className="input"
                >
                  <option value="alive">🟢 Alive</option>
                  <option value="dead">🔴 Dead</option>
                  <option value="pending">🟡 Pending</option>
                  <option value="testing">🔵 Testing</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="btn btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={handleBulkUpdate}
                className="btn btn-primary"
              >
                Cập nhật {selectedProxies.length} proxy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Xuất Proxy đã chọn với Bộ lọc</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <ExportWithFilters
                proxies={selectedProxiesData}
                onExport={(proxies, format) => {
                  onBulkExport(proxies.map(p => p.id), format)
                  setShowExportModal(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}