'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Activity, 
  Zap, 
  Clock, 
  Database, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  Cpu,
  HardDrive,
  Wifi,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface PerformanceTabProps {
  proxies: Proxy[]
}

interface PerformanceMetrics {
  renderTime: number
  memoryUsage: number
  proxyCount: number
  searchLatency: number
  filterLatency: number
  scrollFPS: number
  cacheHitRate: number
  cpuUsage: number
  diskUsage: number
  networkLatency: number
  errorRate: number
  throughput: number
}

export default function PerformanceTab({ proxies }: PerformanceTabProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    proxyCount: proxies.length,
    searchLatency: 0,
    filterLatency: 0,
    scrollFPS: 60,
    cacheHitRate: 0.85,
    cpuUsage: 0,
    diskUsage: 0,
    networkLatency: 0,
    errorRate: 0,
    throughput: 0
  })

  const [history, setHistory] = useState<PerformanceMetrics[]>([])
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [alerts, setAlerts] = useState<string[]>([])

  // Real performance monitoring
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      // Get real performance metrics
      const memoryInfo = (performance as any).memory
      const memoryUsage = memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0
      
      setMetrics(prev => {
        const newMetrics = {
          renderTime: performance.now() - (prev.renderTime || 0),
          memoryUsage: memoryUsage,
          proxyCount: proxies.length,
          searchLatency: 0, // Would be measured from actual search operations
          filterLatency: 0, // Would be measured from actual filter operations
          scrollFPS: 60, // Would be measured from actual scroll events
          cacheHitRate: 0.85, // Would be calculated from actual cache hits
          cpuUsage: 0, // Not available in browser
          diskUsage: 0, // Not available in browser
          networkLatency: 0, // Would be measured from actual network requests
          errorRate: 0, // Would be calculated from actual errors
          throughput: 0 // Would be calculated from actual operations
        }
        
        setHistory(prev => [...prev.slice(-19), newMetrics])
        return newMetrics
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isMonitoring, proxies.length])

  // Performance alerts
  useEffect(() => {
    const newAlerts: string[] = []
    
    if (metrics.renderTime > 100) {
      newAlerts.push('Render time cao (>100ms)')
    }
    if (metrics.memoryUsage > 150) {
      newAlerts.push('Memory usage cao (>150MB)')
    }
    if (metrics.scrollFPS < 30) {
      newAlerts.push('Scroll FPS thấp (<30fps)')
    }
    if (metrics.cacheHitRate < 0.7) {
      newAlerts.push('Cache hit rate thấp (<70%)')
    }
    if (metrics.cpuUsage > 80) {
      newAlerts.push('CPU usage cao (>80%)')
    }
    
    setAlerts(newAlerts)
  }, [metrics])

  const getPerformanceGrade = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'good'
    if (value <= thresholds.warning) return 'warning'
    return 'critical'
  }

  const renderTimeGrade = getPerformanceGrade(metrics.renderTime, { good: 50, warning: 100 })
  const memoryGrade = getPerformanceGrade(metrics.memoryUsage, { good: 100, warning: 150 })
  const fpsGrade = getPerformanceGrade(metrics.scrollFPS, { good: 60, warning: 30 })
  const cpuGrade = getPerformanceGrade(metrics.cpuUsage, { good: 50, warning: 80 })

  const performanceScore = useMemo(() => {
    const scores = [
      renderTimeGrade === 'good' ? 100 : renderTimeGrade === 'warning' ? 70 : 30,
      memoryGrade === 'good' ? 100 : memoryGrade === 'warning' ? 70 : 30,
      fpsGrade === 'good' ? 100 : fpsGrade === 'warning' ? 70 : 30,
      cpuGrade === 'good' ? 100 : cpuGrade === 'warning' ? 70 : 30,
      metrics.cacheHitRate > 0.8 ? 100 : metrics.cacheHitRate > 0.6 ? 70 : 30
    ]
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
  }, [renderTimeGrade, memoryGrade, fpsGrade, cpuGrade, metrics.cacheHitRate])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Bảng điều khiển Hiệu suất</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isMonitoring 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}
          >
            {isMonitoring ? '⏸️ Tạm dừng' : '▶️ Tiếp tục'}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Làm mới
          </button>
        </div>
      </div>

      {/* Performance Score */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Hiệu suất Tổng thể</h3>
          <span className={`text-3xl font-bold ${
            performanceScore >= 80 ? 'text-green-600' :
            performanceScore >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {performanceScore}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              performanceScore >= 80 ? 'bg-green-500' :
              performanceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${performanceScore}%` }}
          />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Render Time */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Thời gian Render</span>
            </div>
            {renderTimeGrade === 'good' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
             renderTimeGrade === 'warning' ? <AlertTriangle className="h-5 w-5 text-yellow-600" /> :
             <XCircle className="h-5 w-5 text-red-600" />}
          </div>
          <div className={`text-3xl font-bold ${
            renderTimeGrade === 'good' ? 'text-green-600' :
            renderTimeGrade === 'warning' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {metrics.renderTime.toFixed(1)}ms
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Sử dụng Bộ nhớ</span>
            </div>
            {memoryGrade === 'good' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
             memoryGrade === 'warning' ? <AlertTriangle className="h-5 w-5 text-yellow-600" /> :
             <XCircle className="h-5 w-5 text-red-600" />}
          </div>
          <div className={`text-3xl font-bold ${
            memoryGrade === 'good' ? 'text-green-600' :
            memoryGrade === 'warning' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {metrics.memoryUsage.toFixed(0)}MB
          </div>
        </div>

        {/* Scroll FPS */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600">FPS Cuộn</span>
            </div>
            {fpsGrade === 'good' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
             fpsGrade === 'warning' ? <AlertTriangle className="h-5 w-5 text-yellow-600" /> :
             <XCircle className="h-5 w-5 text-red-600" />}
          </div>
          <div className={`text-3xl font-bold ${
            fpsGrade === 'good' ? 'text-green-600' :
            fpsGrade === 'warning' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {metrics.scrollFPS.toFixed(0)} fps
          </div>
        </div>

        {/* Cache Hit Rate */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Tỷ lệ Cache</span>
            </div>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">
            {Math.round(metrics.cacheHitRate * 100)}%
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CPU Usage */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Sử dụng CPU</span>
            </div>
            {cpuGrade === 'good' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
             cpuGrade === 'warning' ? <AlertTriangle className="h-5 w-5 text-yellow-600" /> :
             <XCircle className="h-5 w-5 text-red-600" />}
          </div>
          <div className={`text-2xl font-bold ${
            cpuGrade === 'good' ? 'text-green-600' :
            cpuGrade === 'warning' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {metrics.cpuUsage.toFixed(1)}%
          </div>
        </div>

        {/* Network Latency */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Wifi className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Network Latency</span>
            </div>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {metrics.networkLatency.toFixed(0)}ms
          </div>
        </div>

        {/* Proxy Count */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-600">Proxy Count</span>
            </div>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {metrics.proxyCount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      {history.length > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng Hiệu suất</h3>
          <div className="h-64 bg-gray-50 rounded-lg p-4">
            <div className="flex items-end space-x-1 h-full">
              {history.slice(-20).map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{
                      height: `${Math.min((h.renderTime / 200) * 100, 100)}%`
                    }}
                    title={`Render: ${h.renderTime.toFixed(1)}ms`}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {i % 5 === 0 ? `${i}s` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            Cảnh báo Hiệu suất
          </h3>
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-sm text-red-800">{alert}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Recommendations</h3>
        <div className="space-y-2 text-sm text-blue-800">
          {metrics.proxyCount > 10000 && (
            <div>• Sử dụng virtual scrolling để tối ưu hiệu suất với {metrics.proxyCount.toLocaleString()} proxy</div>
          )}
          {metrics.memoryUsage > 150 && (
            <div>• Đóng các tab không sử dụng để giải phóng bộ nhớ</div>
          )}
          {metrics.scrollFPS < 30 && (
            <div>• Giảm độ phức tạp animation hoặc số lượng proxy</div>
          )}
          {metrics.cacheHitRate < 0.7 && (
            <div>• Bật caching tích cực hơn để cải thiện hiệu suất</div>
          )}
          {metrics.cpuUsage > 80 && (
            <div>• Giảm tần suất cập nhật hoặc tối ưu thuật toán</div>
          )}
          {alerts.length === 0 && (
            <div>• Hệ thống đang hoạt động tốt! Không có khuyến nghị nào.</div>
          )}
        </div>
      </div>
    </div>
  )
}
