'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Activity, Database, Cpu, HardDrive, AlertTriangle, CheckCircle, TrendingUp, RefreshCw, Play, Pause } from 'lucide-react'

interface HealthStatus {
  timestamp: string
  overall: 'healthy' | 'warning' | 'critical'
  services: {
    database: HealthServiceStatus
    api: HealthServiceStatus
    proxy: HealthServiceStatus
    storage: HealthServiceStatus
  }
  metrics: {
    uptime: number
    responseTime: number
    errorRate: number
    activeConnections: number
  }
  alerts: HealthAlert[]
}

interface HealthServiceStatus {
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  responseTime: number
  lastCheck: string
  error?: string
}

interface HealthAlert {
  id: string
  level: 'info' | 'warning' | 'critical'
  message: string
  timestamp: string
  service: string
  resolved: boolean
}

export default function RealHealthMonitoringTab() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHealthStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/health-monitoring')
      const result = await response.json()
      
      if (result.success) {
        setHealthStatus(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch health status')
      }
    } catch (err) {
      console.error('Health monitoring error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const startMonitoring = useCallback(async () => {
    try {
      const response = await fetch('/api/health-monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_monitoring' })
      })
      
      const result = await response.json()
      if (result.success) {
        setIsMonitoring(true)
        fetchHealthStatus()
      }
    } catch (err) {
      console.error('Failed to start monitoring:', err)
    }
  }, [fetchHealthStatus])

  const stopMonitoring = useCallback(async () => {
    try {
      const response = await fetch('/api/health-monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop_monitoring' })
      })
      
      const result = await response.json()
      if (result.success) {
        setIsMonitoring(false)
      }
    } catch (err) {
      console.error('Failed to stop monitoring:', err)
    }
  }, [])

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      const response = await fetch('/api/health-monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'resolve_alert',
          data: { alertId }
        })
      })
      
      const result = await response.json()
      if (result.success) {
        fetchHealthStatus()
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err)
    }
  }, [fetchHealthStatus])

  useEffect(() => {
    fetchHealthStatus()
    
    if (isMonitoring) {
      const interval = setInterval(fetchHealthStatus, 30000) // 30 seconds
      return () => clearInterval(interval)
    }
  }, [fetchHealthStatus, isMonitoring])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  if (loading && !healthStatus) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-gray-600">Đang tải thông tin sức khỏe hệ thống...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <span>Lỗi: {error}</span>
        </div>
        <button
          onClick={fetchHealthStatus}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (!healthStatus) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          Không có dữ liệu sức khỏe hệ thống
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
          <h3 className="text-lg font-semibold text-gray-900">Giám sát Sức khỏe</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOverallStatusColor(healthStatus.overall)}`}>
            {healthStatus.overall.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
              isMonitoring 
                ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white hover:from-red-600 hover:via-red-700 hover:to-red-800 shadow-red-500/25' 
                : 'bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white hover:from-green-600 hover:via-green-700 hover:to-green-800 shadow-green-500/25'
            }`}
          >
            {isMonitoring ? (
              <>
                <Pause className="h-4 w-4 animate-pulse" />
                <span>Dừng theo dõi</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Bắt đầu theo dõi</span>
              </>
            )}
          </button>
          <button
            onClick={fetchHealthStatus}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-xl text-sm font-bold hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {healthStatus.alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-800">Cảnh báo hệ thống</h4>
              <div className="mt-2 space-y-2">
                {healthStatus.alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between bg-white rounded p-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.level === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.level.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-700">{alert.message}</span>
                      <span className="text-xs text-gray-500">({alert.service})</span>
                    </div>
                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                      >
                        Giải quyết
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(healthStatus.services).map(([serviceName, service]) => (
          <div key={serviceName} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {serviceName === 'database' && <Database className="h-5 w-5 text-blue-500" />}
                {serviceName === 'api' && <Activity className="h-5 w-5 text-green-500" />}
                {serviceName === 'proxy' && <TrendingUp className="h-5 w-5 text-purple-500" />}
                {serviceName === 'storage' && <HardDrive className="h-5 w-5 text-orange-500" />}
                <span className="font-medium text-gray-900 capitalize">{serviceName}</span>
              </div>
              {getStatusIcon(service.status)}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Trạng thái</span>
                <span className={getStatusColor(service.status)}>
                  {service.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Thời gian phản hồi</span>
                <span className="text-gray-900">{service.responseTime}ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kiểm tra cuối</span>
                <span className="text-gray-900">
                  {new Date(service.lastCheck).toLocaleTimeString()}
                </span>
              </div>
              {service.error && (
                <div className="text-xs text-red-600 mt-1">
                  {service.error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-medium text-gray-900 mb-4">System Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatUptime(healthStatus.metrics.uptime)}
            </div>
            <div className="text-sm text-gray-600">Thời gian hoạt động</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {healthStatus.metrics.responseTime}ms
            </div>
            <div className="text-sm text-gray-600">Thời gian phản hồi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {healthStatus.metrics.errorRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Tỷ lệ lỗi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {healthStatus.metrics.activeConnections}
            </div>
            <div className="text-sm text-gray-600">Kết nối đang hoạt động</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        Cập nhật lần cuối: {new Date(healthStatus.timestamp).toLocaleString()}
        {isMonitoring && (
          <span className="ml-2 text-green-600">• Đang theo dõi tự động</span>
        )}
      </div>
    </div>
  )
}
