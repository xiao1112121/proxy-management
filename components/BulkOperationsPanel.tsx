'use client'

import { useState } from 'react'
import { 
  X, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  BarChart3
} from 'lucide-react'
import { BulkOperation } from '@/hooks/useBulkOperations'

interface BulkOperationsPanelProps {
  operations: BulkOperation[]
  isProcessing: boolean
  onCancel: (id: string) => void
  onRemove: (id: string) => void
  onUndo: (id: string) => void
  onClearCompleted: () => void
}

export default function BulkOperationsPanel({
  operations,
  isProcessing,
  onCancel,
  onRemove,
  onUndo,
  onClearCompleted
}: BulkOperationsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [filter, setFilter] = useState<'all' | 'running' | 'completed' | 'error'>('all')

  const filteredOperations = operations.filter(op => {
    if (filter === 'all') return true
    if (filter === 'running') return op.status === 'running' || op.status === 'pending'
    if (filter === 'completed') return op.status === 'completed'
    if (filter === 'error') return op.status === 'error' || op.status === 'cancelled'
    return true
  })

  const getOperationIcon = (operation: BulkOperation) => {
    switch (operation.status) {
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getOperationColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-50'
      case 'completed': return 'text-green-600 bg-green-50'
      case 'error':
      case 'cancelled': return 'text-red-600 bg-red-50'
      default: return 'text-yellow-600 bg-yellow-50'
    }
  }

  const formatDuration = (startTime: number, endTime?: number) => {
    const duration = (endTime || Date.now()) - startTime
    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  const formatOperationType = (type: string) => {
    switch (type) {
      case 'delete': return '🗑️ Xóa'
      case 'update': return '✏️ Cập nhật'
      case 'test': return '🧪 Test'
      case 'export': return '📤 Xuất'
      default: return type
    }
  }

  const getProgressColor = (progress: number, status: string) => {
    if (status === 'error' || status === 'cancelled') return 'bg-red-500'
    if (status === 'completed') return 'bg-green-500'
    return 'bg-blue-500'
  }

  const stats = {
    total: operations.length,
    running: operations.filter(op => op.status === 'running' || op.status === 'pending').length,
    completed: operations.filter(op => op.status === 'completed').length,
    error: operations.filter(op => op.status === 'error' || op.status === 'cancelled').length
  }

  if (operations.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">Bulk Operations</h3>
          {isProcessing && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            {stats.running > 0 && <span className="text-blue-600">{stats.running} running</span>}
            {stats.running > 0 && stats.completed > 0 && <span className="mx-1">•</span>}
            {stats.completed > 0 && <span className="text-green-600">{stats.completed} done</span>}
            {stats.error > 0 && <span className="text-red-600 ml-2">{stats.error} error</span>}
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { key: 'all', label: 'Tất cả', count: stats.total },
              { key: 'running', label: 'Đang chạy', count: stats.running },
              { key: 'completed', label: 'Hoàn thành', count: stats.completed },
              { key: 'error', label: 'Lỗi', count: stats.error }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Operations List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredOperations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Không có operation nào
              </div>
            ) : (
              filteredOperations.map((operation) => (
                <div key={operation.id} className="p-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getOperationIcon(operation)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {formatOperationType(operation.type)}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOperationColor(operation.status)}`}>
                            {operation.status}
                          </span>
                        </div>
                        
                        <div className="mt-1 text-xs text-gray-500">
                          {operation.processed}/{operation.total} items • {formatDuration(operation.startTime, operation.endTime)}
                        </div>

                        {/* Progress Bar */}
                        {operation.status === 'running' && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Tiến độ</span>
                              <span>{operation.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(operation.progress, operation.status)}`}
                                style={{ width: `${operation.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Error Message */}
                        {operation.error && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            {operation.error}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 ml-2">
                      {operation.status === 'running' && (
                        <button
                          onClick={() => onCancel(operation.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Hủy"
                        >
                          <Square className="h-4 w-4" />
                        </button>
                      )}
                      
                      {operation.canUndo && operation.status === 'completed' && (
                        <button
                          onClick={() => onUndo(operation.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Hoàn tác"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}

                      {(operation.status === 'completed' || operation.status === 'error' || operation.status === 'cancelled') && (
                        <button
                          onClick={() => onRemove(operation.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Xóa"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {operations.some(op => op.status === 'completed' || op.status === 'error' || op.status === 'cancelled') && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={onClearCompleted}
                className="w-full text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                <Trash2 className="h-4 w-4 inline mr-1" />
                Xóa tất cả đã hoàn thành
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
