'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  Activity, 
  Zap, 
  Clock, 
  Database, 
  Wifi, 
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface PerformanceMetricsProps {
  className?: string
  showDetails?: boolean
  refreshInterval?: number
}

interface Metrics {
  memory: {
    used: number
    total: number
    percentage: number
  }
  performance: {
    fps: number
    renderTime: number
    layoutTime: number
    paintTime: number
  }
  network: {
    online: boolean
    connectionType: string
    downlink: number
    rtt: number
  }
  cache: {
    size: number
    hitRate: number
    missRate: number
  }
  errors: {
    count: number
    lastError: string | null
  }
}

export default function PerformanceMetrics({ 
  className = '',
  showDetails = false,
  refreshInterval = 1000
}: PerformanceMetricsProps) {
  const [metrics, setMetrics] = useState<Metrics>({
    memory: { used: 0, total: 0, percentage: 0 },
    performance: { fps: 0, renderTime: 0, layoutTime: 0, paintTime: 0 },
    network: { online: true, connectionType: 'unknown', downlink: 0, rtt: 0 },
    cache: { size: 0, hitRate: 0, missRate: 0 },
    errors: { count: 0, lastError: null }
  })

  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Get memory usage
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      }
    }
    return { used: 0, total: 0, percentage: 0 }
  }, [])

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    const entries = performance.getEntriesByType('measure')
    const renderTime = entries.find(e => e.name === 'render')?.duration || 0
    const layoutTime = entries.find(e => e.name === 'layout')?.duration || 0
    const paintTime = entries.find(e => e.name === 'paint')?.duration || 0

    // Calculate FPS (simplified)
    const fps = 60 // This would need a more sophisticated calculation

    return { fps, renderTime, layoutTime, paintTime }
  }, [])

  // Get network information
  const getNetworkInfo = useCallback(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    
    return {
      online: navigator.onLine,
      connectionType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0
    }
  }, [])

  // Get cache metrics
  const getCacheMetrics = useCallback(() => {
    // This would integrate with the service worker cache
    return {
      size: 0,
      hitRate: 0,
      missRate: 0
    }
  }, [])

  // Get error metrics
  const getErrorMetrics = useCallback(() => {
    // This would track errors from error boundaries
    return {
      count: 0,
      lastError: null
    }
  }, [])

  // Update metrics
  const updateMetrics = useCallback(() => {
    const newMetrics: Metrics = {
      memory: getMemoryUsage(),
      performance: getPerformanceMetrics(),
      network: getNetworkInfo(),
      cache: getCacheMetrics(),
      errors: getErrorMetrics()
    }

    setMetrics(newMetrics)
    setLastUpdate(new Date())
  }, [getMemoryUsage, getPerformanceMetrics, getNetworkInfo, getCacheMetrics, getErrorMetrics])

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
    updateMetrics()
  }, [updateMetrics])

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
  }, [])

  // Auto-update metrics
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(updateMetrics, refreshInterval)
    return () => clearInterval(interval)
  }, [isMonitoring, updateMetrics, refreshInterval])

  // Performance observer for more accurate metrics
  useEffect(() => {
    if (!isMonitoring) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      // Process performance entries
      updateMetrics()
    })

    try {
      observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] })
    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }

    return () => observer.disconnect()
  }, [isMonitoring, updateMetrics])

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format time
  const formatTime = (ms: number) => {
    return `${ms.toFixed(2)}ms`
  }

  // Get status color
  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600'
    if (value <= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Get status icon
  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (value <= thresholds.warning) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`px-3 py-1 rounded text-sm ${
              isMonitoring 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isMonitoring ? 'Stop' : 'Start'}
          </button>
          <button
            onClick={updateMetrics}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Memory Usage */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Memory</span>
            </div>
            {getStatusIcon(metrics.memory.percentage, { good: 70, warning: 85 })}
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">
              {formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  metrics.memory.percentage <= 70 ? 'bg-green-500' :
                  metrics.memory.percentage <= 85 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(metrics.memory.percentage, 100)}%` }}
              />
            </div>
            <div className={`text-xs ${getStatusColor(metrics.memory.percentage, { good: 70, warning: 85 })}`}>
              {metrics.memory.percentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Performance</span>
            </div>
            {getStatusIcon(metrics.performance.renderTime, { good: 16, warning: 33 })}
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">
              FPS: {metrics.performance.fps}
            </div>
            <div className="text-xs text-gray-600">
              Render: {formatTime(metrics.performance.renderTime)}
            </div>
            <div className="text-xs text-gray-600">
              Layout: {formatTime(metrics.performance.layoutTime)}
            </div>
            <div className="text-xs text-gray-600">
              Paint: {formatTime(metrics.performance.paintTime)}
            </div>
          </div>
        </div>

        {/* Network */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {metrics.network.online ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium text-gray-700">Network</span>
            </div>
            {metrics.network.online ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">
              {metrics.network.online ? 'Online' : 'Offline'}
            </div>
            <div className="text-xs text-gray-600">
              Type: {metrics.network.connectionType}
            </div>
            <div className="text-xs text-gray-600">
              Speed: {metrics.network.downlink} Mbps
            </div>
            <div className="text-xs text-gray-600">
              RTT: {metrics.network.rtt}ms
            </div>
          </div>
        </div>

        {/* Cache */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Cache</span>
            </div>
            {getStatusIcon(metrics.cache.hitRate, { good: 80, warning: 60 })}
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">
              Size: {formatBytes(metrics.cache.size)}
            </div>
            <div className="text-xs text-gray-600">
              Hit Rate: {metrics.cache.hitRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">
              Miss Rate: {metrics.cache.missRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Error Tracking</h4>
              <div className="text-xs text-gray-600">
                Errors: {metrics.errors.count}
              </div>
              {metrics.errors.lastError && (
                <div className="text-xs text-red-600 mt-1">
                  Last: {metrics.errors.lastError}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Last Update</h4>
              <div className="text-xs text-gray-600">
                {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
