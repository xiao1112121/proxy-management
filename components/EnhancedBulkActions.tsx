'use client'

import { useState } from 'react'
import { 
  Trash2, 
  Edit, 
  Play, 
  Download, 
  Settings, 
  ChevronDown,
  Users,
  Zap,
  FileDown,
  RotateCcw,
  AlertTriangle
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { useBulkOperations } from '@/hooks/useBulkOperations'
import BulkOperationsPanel from './BulkOperationsPanel'

interface EnhancedBulkActionsProps {
  selectedProxies: number[]
  selectedProxiesData: Proxy[]
  onBulkDelete: (ids: number[]) => void
  onBulkUpdate: (ids: number[], updates: Partial<Proxy>) => void
  onBulkTest: (ids: number[]) => void
  onBulkExport: (ids: number[], format: string) => void
  onRestoreProxies?: (proxies: Proxy[]) => void
}

export default function EnhancedBulkActions({
  selectedProxies,
  selectedProxiesData,
  onBulkDelete,
  onBulkUpdate,
  onBulkTest,
  onBulkExport,
  onRestoreProxies
}: EnhancedBulkActionsProps) {
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [updateForm, setUpdateForm] = useState<Partial<Proxy>>({})
  const [batchSize, setBatchSize] = useState(10)

  const {
    operations,
    isProcessing,
    bulkDelete,
    bulkUpdate,
    bulkTest,
    undoOperation,
    cancelOperation,
    removeOperation,
    clearCompletedOperations
  } = useBulkOperations()

  const handleBulkDelete = async () => {
    if (selectedProxies.length === 0) return
    
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa ${selectedProxies.length} proxy đã chọn?`
    )
    if (!confirmed) return

    await bulkDelete(selectedProxies, (id) => onBulkDelete([id]), batchSize)
  }

  const handleBulkUpdate = async () => {
    if (selectedProxies.length === 0 || Object.keys(updateForm).length === 0) return

    await bulkUpdate(selectedProxies, updateForm, (id, updates) => onBulkUpdate([id], updates), batchSize)
    setShowUpdateModal(false)
    setUpdateForm({})
  }

  const handleBulkTest = async () => {
    if (selectedProxies.length === 0) return
    await bulkTest(selectedProxies, onBulkTest, Math.min(batchSize, 5)) // Limit concurrent tests
  }

  const handleBulkExport = (format: string) => {
    if (selectedProxies.length === 0) return
    onBulkExport(selectedProxies, format)
    setShowExportModal(false)
  }

  const handleUndo = (operationId: string) => {
    undoOperation(operationId, (undoData) => {
      if (undoData.deletedProxies && onRestoreProxies) {
        // Would need to restore from backup data
        console.log('Restoring proxies:', undoData.deletedProxies)
      }
      if (undoData.updatedProxies) {
        // Restore old values
        undoData.updatedProxies.forEach(({ id, oldData }: any) => {
          onBulkUpdate([id], oldData)
        })
      }
    })
  }

  const quickUpdateOptions = [
    { label: '🔄 Đặt thành Pending', updates: { status: 'pending' as const } },
    { label: '✅ Đánh dấu Alive', updates: { status: 'alive' as const } },
    { label: '❌ Đánh dấu Dead', updates: { status: 'dead' as const } },
    { label: '🔒 Đặt Elite', updates: { anonymity: 'elite' as const } },
    { label: '👤 Đặt Anonymous', updates: { anonymity: 'anonymous' as const } },
  ]

  if (selectedProxies.length === 0) {
    return null
  }

  return (
    <>
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">
              Bulk Actions ({selectedProxies.length} đã chọn)
            </h3>
          </div>
          
          {/* Batch Size Control */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">Batch size:</span>
            <select
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Delete */}
          <button
            onClick={handleBulkDelete}
            disabled={isProcessing}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Trash2 className="h-4 w-4" />
            <span>🗑️ Xóa</span>
          </button>

          {/* Test */}
          <button
            onClick={handleBulkTest}
            disabled={isProcessing}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Play className="h-4 w-4" />
            <span>🧪 Test</span>
          </button>

          {/* Update */}
          <button
            onClick={() => setShowUpdateModal(true)}
            disabled={isProcessing}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Edit className="h-4 w-4" />
            <span>✏️ Cập nhật</span>
          </button>

          {/* Export */}
          <button
            onClick={() => setShowExportModal(true)}
            disabled={isProcessing}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Download className="h-4 w-4" />
            <span>📤 Xuất</span>
          </button>
        </div>

        {/* Quick Update Options */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">Quick Updates:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickUpdateOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => bulkUpdate(selectedProxies, option.updates, (id, updates) => onBulkUpdate([id], updates), batchSize)}
                disabled={isProcessing}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-blue-700 font-medium">
                Đang xử lý bulk operations...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cập nhật {selectedProxies.length} proxy
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={updateForm.status || ''}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Không thay đổi</option>
                    <option value="alive">✅ Alive</option>
                    <option value="dead">❌ Dead</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="testing">🔄 Testing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mức ẩn danh
                  </label>
                  <select
                    value={updateForm.anonymity || ''}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, anonymity: e.target.value as 'transparent' | 'anonymous' | 'elite' }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Không thay đổi</option>
                    <option value="transparent">🔍 Transparent</option>
                    <option value="anonymous">👤 Anonymous</option>
                    <option value="elite">🔒 Elite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhóm
                  </label>
                  <input
                    type="text"
                    value={updateForm.group || ''}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, group: e.target.value }))}
                    placeholder="Nhập tên nhóm mới..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={updateForm.notes || ''}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Thêm ghi chú..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Hủy
                </button>
                <button
                  onClick={handleBulkUpdate}
                  disabled={Object.keys(updateForm).length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Xuất {selectedProxies.length} proxy
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { format: 'json', label: '📄 JSON', desc: 'Định dạng JSON đầy đủ' },
                  { format: 'csv', label: '📊 CSV', desc: 'Bảng tính Excel/CSV' },
                  { format: 'txt', label: '📝 TXT', desc: 'Text thuần túy' },
                  { format: 'xml', label: '🏷️ XML', desc: 'Định dạng XML' }
                ].map(option => (
                  <button
                    key={option.format}
                    onClick={() => handleBulkExport(option.format)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.desc}</div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Operations Panel */}
      <BulkOperationsPanel
        operations={operations}
        isProcessing={isProcessing}
        onCancel={cancelOperation}
        onRemove={removeOperation}
        onUndo={handleUndo}
        onClearCompleted={clearCompletedOperations}
      />
    </>
  )
}
