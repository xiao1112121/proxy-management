'use client'

import { useState, useEffect } from 'react'
import { Database, Trash2, AlertTriangle, CheckCircle, HardDrive, BarChart3, Zap } from 'lucide-react'
import { AdvancedStorageManager } from '@/utils/advancedStorageManager'

interface StorageInfoProps {
  onClearData: () => void
}

export default function StorageInfo({ onClearData }: StorageInfoProps) {
  const [storageStats, setStorageStats] = useState({
    totalSize: 0,
    chunkCount: 0,
    averageChunkSize: 0,
    compressionRatio: 0,
    isEssential: false
  })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const updateStorageStats = () => {
      const stats = AdvancedStorageManager.getStorageStats()
      setStorageStats(stats)
    }

    updateStorageStats()
    const interval = setInterval(updateStorageStats, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStorageStatus = () => {
    const { totalSize, isEssential, chunkCount } = storageStats
    
    if (totalSize > 4 * 1024 * 1024) { // 4MB
      return { status: 'warning', message: 'Storage gần đầy - Dữ liệu đã nén' }
    } else if (isEssential) {
      return { status: 'warning', message: 'Dữ liệu đã được nén tối đa' }
    } else if (chunkCount > 30) {
      return { status: 'warning', message: 'Quá nhiều proxy - Chỉ lưu 30,000 đầu tiên' }
    } else if (totalSize > 0) {
      return { status: 'good', message: 'Storage bình thường' }
    } else {
      return { status: 'empty', message: 'Chưa có dữ liệu' }
    }
  }

  const status = getStorageStatus()

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Storage Info</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {showDetails ? 'Ẩn' : 'Chi tiết'}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {status.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
          {status.status === 'good' && <CheckCircle className="w-4 h-4 text-green-500" />}
          {status.status === 'empty' && <HardDrive className="w-4 h-4 text-gray-400" />}
          <span className="text-sm text-gray-700">{status.message}</span>
        </div>

        {showDetails && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tổng dung lượng:</span>
              <span className="font-mono">{formatBytes(storageStats.totalSize)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Số chunks:</span>
              <span className="font-mono">{storageStats.chunkCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Kích thước trung bình/chunk:</span>
              <span className="font-mono">{formatBytes(storageStats.averageChunkSize)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tỷ lệ nén:</span>
              <span className="font-mono">{storageStats.compressionRatio}x</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Chế độ:</span>
              <span className={`font-mono ${storageStats.isEssential ? 'text-orange-600' : 'text-green-600'}`}>
                {storageStats.isEssential ? 'Essential' : 'Full'}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {AdvancedStorageManager.getRecommendedAction()}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => {
              AdvancedStorageManager.clearProxies()
              onClearData()
            }}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Xóa tất cả dữ liệu
          </button>
        </div>
      </div>
    </div>
  )
}
