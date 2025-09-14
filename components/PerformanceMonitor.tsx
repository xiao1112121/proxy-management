'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface PerformanceMetrics {
  cpu: number
  memory: number
  network: number
  disk: number
  responseTime: number
  throughput: number
  errorRate: number
  uptime: number
}

interface PerformanceMonitorProps {
  isActive: boolean
}

export default function PerformanceMonitor({ isActive }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpu: 0,
    memory: 0,
    network: 0,
    disk: 0,
    responseTime: 0,
    throughput: 0,
    errorRate: 0,
    uptime: 0
  })
  const [alerts, setAlerts] = useState<Array<{
    id: string
    type: 'warning' | 'error' | 'info'
    message: string
    timestamp: string
  }>>([])

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      updateMetrics()
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive])

  const updateMetrics = () => {
    // Simulate real performance metrics
    const newMetrics: PerformanceMetrics = {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      network: Math.random() * 100,
      disk: Math.random() * 100,
      responseTime: Math.random() * 500 + 50,
      throughput: Math.random() * 1000 + 100,
      errorRate: Math.random() * 5,
      uptime: 99.9 - Math.random() * 0.1
    }

    setMetrics(newMetrics)

    // Check for alerts
    checkAlerts(newMetrics)
  }

  const checkAlerts = (newMetrics: PerformanceMetrics) => {
    const newAlerts: typeof alerts = []

    if (newMetrics.cpu > 80) {
      newAlerts.push({
        id: `cpu-${Date.now()}`,
        type: 'warning',
        message: `CPU usage cao: ${newMetrics.cpu.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      })
    }

    if (newMetrics.memory > 85) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'warning',
        message: `Memory usage cao: ${newMetrics.memory.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      })
    }

    if (newMetrics.errorRate > 3) {
      newAlerts.push({
        id: `error-${Date.now()}`,
        type: 'error',
        message: `Error rate cao: ${newMetrics.errorRate.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      })
    }

    if (newMetrics.responseTime > 1000) {
      newAlerts.push({
        id: `response-${Date.now()}`,
        type: 'warning',
        message: `Response time chậm: ${newMetrics.responseTime.toFixed(0)}ms`,
        timestamp: new Date().toISOString()
      })
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 10)) // Keep only last 10 alerts
    }
  }

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-500'
    if (value >= thresholds.warning) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (!isActive) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Performance Monitor</h3>
          <p className="mt-1 text-sm text-gray-500">
            Bật monitoring để xem metrics real-time
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Monitor</h2>
          <p className="text-gray-600">Giám sát hiệu suất hệ thống real-time</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Đang hoạt động</span>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Cpu className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.cpu, { warning: 70, critical: 90 })}`}>
                {metrics.cpu.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.cpu}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <HardDrive className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Memory</p>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.memory, { warning: 80, critical: 95 })}`}>
                {metrics.memory.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.memory}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wifi className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Network</p>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.network, { warning: 80, critical: 95 })}`}>
                {metrics.network.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.network}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Activity className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Disk I/O</p>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.disk, { warning: 80, critical: 95 })}`}>
                {metrics.disk.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.disk}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{metrics.responseTime.toFixed(0)}ms</p>
              <p className="text-sm text-gray-600">Trung bình</p>
            </div>
            <div className={`p-3 rounded-full ${getStatusColor(metrics.responseTime, { warning: 500, critical: 1000 })}`}>
              <Clock className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Throughput</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{metrics.throughput.toFixed(0)}</p>
              <p className="text-sm text-gray-600">Requests/min</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Rate</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">{metrics.errorRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Tỷ lệ lỗi</p>
            </div>
            <div className={`p-3 rounded-full ${getStatusColor(metrics.errorRate, { warning: 2, critical: 5 })}`}>
              <XCircle className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Cảnh báo gần đây</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="px-6 py-4 flex items-center">
                {getStatusIcon(alert.type)}
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(alert.timestamp).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uptime */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Uptime</h3>
            <p className="text-sm text-gray-600">Thời gian hoạt động liên tục</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-600">{metrics.uptime.toFixed(2)}%</p>
            <p className="text-sm text-gray-600">99.9% target</p>
          </div>
        </div>
      </div>
    </div>
  )
}
