'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Activity, Database, Cpu, HardDrive, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import { AdvancedStorageManager } from '@/utils/advancedStorageManager'

interface PerformanceStats {
  memoryUsage: {
    used: string
    available: string
    percentage: number
  }
  storageStats: {
    totalSize: number
    chunkCount: number
    averageChunkSize: number
    compressionRatio: number
    isEssential: boolean
    memoryUsage: string
    recommendation: string
  }
  performanceMetrics: {
    renderTime: number
    lastUpdate: string
    proxyCount: number
    visibleCount: number
  }
}

export default function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [alerts, setAlerts] = useState<string[]>([])

  const updateStats = useCallback(async () => {
    try {
      // Fetch real performance metrics from API
      const response = await fetch('/api/performance-metrics')
      const result = await response.json()
      
      if (result.success) {
        const data = result.data
        
        const memoryUsage = {
          used: `${data.system.memory.toFixed(1)}%`,
          available: `${(100 - data.system.memory).toFixed(1)}%`,
          percentage: data.system.memory
        }
        
        const storageStats = {
          ...AdvancedStorageManager.getStorageStats(),
          memoryUsage: `${data.system.memory.toFixed(1)}%`,
          recommendation: data.system.memory > 80 ? 'Bộ nhớ sử dụng cao, cần tối ưu' : 'Hệ thống hoạt động bình thường'
        }
        
        const performanceMetrics = {
          renderTime: data.application.responseTime,
          lastUpdate: data.timestamp,
          proxyCount: data.proxies.total,
          visibleCount: data.proxies.active
        }
        
        setStats({
          memoryUsage,
          storageStats,
          performanceMetrics
        })
        
        // Check for alerts based on real data
        const newAlerts: string[] = []
        
        if (data.system.cpu > 80) {
          newAlerts.push(`CPU sử dụng cao (${data.system.cpu.toFixed(1)}%). Cần tối ưu hệ thống.`)
        }
        
        if (data.system.memory > 80) {
          newAlerts.push(`Bộ nhớ sử dụng cao (${data.system.memory.toFixed(1)}%). Cân nhắc xóa dữ liệu không cần thiết.`)
        }
        
        if (data.application.errorRate > 5) {
          newAlerts.push(`Tỷ lệ lỗi cao (${data.application.errorRate.toFixed(1)}%). Kiểm tra hệ thống.`)
        }
        
        if (data.network.latency > 100) {
          newAlerts.push(`Độ trễ mạng cao (${data.network.latency.toFixed(0)}ms). Kiểm tra kết nối.`)
        }
        
        if (data.proxies.successRate < 70) {
          newAlerts.push(`Tỷ lệ thành công proxy thấp (${data.proxies.successRate.toFixed(1)}%). Kiểm tra proxy.`)
        }
        
        // Storage alerts
        if (storageStats.totalSize > 6 * 1024 * 1024) {
          newAlerts.push('Storage gần đầy (>6MB). Hệ thống sẽ tự động nén dữ liệu.')
        }
        
        if (storageStats.chunkCount > 150) {
          newAlerts.push('Quá nhiều chunks (>150). Hiệu suất có thể bị ảnh hưởng.')
        }
        
        if (storageStats.isEssential) {
          newAlerts.push('Dữ liệu đã được nén tối đa. Một số thông tin có thể bị mất.')
        }
        
        setAlerts(newAlerts)
      } else {
        throw new Error(result.error || 'Failed to fetch performance metrics')
      }
    } catch (error) {
      console.error('Failed to update performance stats:', error)
      
      // Fallback to local stats
      const memoryUsage = {
        used: '0 MB',
        available: '0 MB',
        percentage: 0
      }
      const storageStats = {
        ...AdvancedStorageManager.getStorageStats(),
        memoryUsage: '0 MB',
        recommendation: 'Hệ thống hoạt động bình thường'
      }
      
      const performanceMetrics = {
        renderTime: performance.now(),
        lastUpdate: new Date().toISOString(),
        proxyCount: 0,
        visibleCount: 0
      }
      
      setStats({
        memoryUsage,
        storageStats,
        performanceMetrics
      })
      
      setAlerts(['Không thể kết nối đến API hiệu suất. Sử dụng dữ liệu local.'])
    }
  }, [])

  useEffect(() => {
    updateStats()
    
    if (isMonitoring) {
      const interval = setInterval(updateStats, 5000) // Update every 5 seconds
      return () => clearInterval(interval)
    }
  }, [updateStats, isMonitoring])

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring)
  }

  const clearStorage = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu proxy?')) {
      AdvancedStorageManager.clearProxies()
      updateStats()
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-500'
    if (percentage < 80) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage < 50) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (percentage < 80) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <AlertTriangle className="h-4 w-4 text-red-500" />
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-gray-400" />
          <span className="text-gray-500">Đang tải thông tin hiệu suất...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Monitor</h3>
        </div>
        <button
          onClick={toggleMonitoring}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isMonitoring 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {isMonitoring ? 'Đang theo dõi' : 'Bắt đầu theo dõi'}
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Cảnh báo hiệu suất</h4>
              <ul className="mt-1 space-y-1">
                {alerts.map((alert, index) => (
                  <li key={index} className="text-yellow-700 text-sm">
                    • {alert}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Memory Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium text-gray-900">Memory Usage</h4>
            </div>
            {getStatusIcon(stats.memoryUsage.percentage)}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Đã sử dụng</span>
              <span className={getStatusColor(stats.memoryUsage.percentage)}>
                {stats.memoryUsage.used}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Còn trống</span>
              <span className="text-gray-900">{stats.memoryUsage.available}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  stats.memoryUsage.percentage < 50 ? 'bg-green-500' :
                  stats.memoryUsage.percentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${stats.memoryUsage.percentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 text-center">
              {stats.memoryUsage.percentage}% sử dụng
            </div>
          </div>
        </div>

        {/* Storage Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-500" />
              <h4 className="font-medium text-gray-900">Storage</h4>
            </div>
            {stats.storageStats.isEssential && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Essential
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tổng kích thước</span>
              <span className="text-gray-900">{stats.storageStats.memoryUsage}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Số chunks</span>
              <span className="text-gray-900">{stats.storageStats.chunkCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tỷ lệ nén</span>
              <span className="text-gray-900">{stats.storageStats.compressionRatio}x</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {stats.storageStats.recommendation}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-purple-500" />
              <h4 className="font-medium text-gray-900">Performance</h4>
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Response time</span>
              <span className="text-gray-900">
                {stats.performanceMetrics.renderTime.toFixed(0)}ms
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cập nhật cuối</span>
              <span className="text-gray-900">
                {new Date(stats.performanceMetrics.lastUpdate).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Proxy count</span>
              <span className="text-gray-900">
                {stats.performanceMetrics.proxyCount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active proxies</span>
              <span className="text-gray-900">
                {stats.performanceMetrics.visibleCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Cập nhật lần cuối: {new Date().toLocaleTimeString()}
        </div>
        <div className="space-x-2">
          <button
            onClick={updateStats}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            Làm mới
          </button>
          <button
            onClick={clearStorage}
            className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            Xóa dữ liệu
          </button>
        </div>
      </div>
    </div>
  )
}