'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Activity, Zap, Clock, Database, TrendingUp, AlertTriangle } from 'lucide-react'

interface PerformanceMetrics {
  renderTime: number
  memoryUsage: number
  proxyCount: number
  searchLatency: number
  filterLatency: number
  scrollFPS: number
  cacheHitRate: number
}

interface PerformanceDashboardProps {
  metrics: PerformanceMetrics
  isVisible: boolean
  onToggle: () => void
}

export default function PerformanceDashboard({ metrics, isVisible, onToggle }: PerformanceDashboardProps) {
  const [history, setHistory] = useState<PerformanceMetrics[]>([])
  const [alerts, setAlerts] = useState<string[]>([])

  // Track performance history
  useEffect(() => {
    setHistory(prev => [...prev.slice(-19), metrics])
  }, [metrics])

  // Performance alerts
  useEffect(() => {
    const newAlerts: string[] = []
    
    if (metrics.renderTime > 100) {
      newAlerts.push('Render time cao (>100ms)')
    }
    if (metrics.memoryUsage > 100) {
      newAlerts.push('Memory usage cao (>100MB)')
    }
    if (metrics.scrollFPS < 30) {
      newAlerts.push('Scroll FPS thấp (<30fps)')
    }
    if (metrics.cacheHitRate < 0.7) {
      newAlerts.push('Cache hit rate thấp (<70%)')
    }
    
    setAlerts(newAlerts)
  }, [metrics])

  const getPerformanceGrade = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'good'
    if (value <= thresholds.warning) return 'warning'
    return 'critical'
  }

  const renderTimeGrade = getPerformanceGrade(metrics.renderTime, { good: 50, warning: 100 })
  const memoryGrade = getPerformanceGrade(metrics.memoryUsage, { good: 50, warning: 100 })
  const fpsGrade = getPerformanceGrade(metrics.scrollFPS, { good: 60, warning: 30 })

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Show Performance Dashboard"
      >
        <Activity className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Performance Monitor
          </h3>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              renderTimeGrade === 'good' ? 'text-green-600' :
              renderTimeGrade === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {metrics.renderTime}ms
            </div>
            <div className="text-sm text-gray-600">Render Time</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              memoryGrade === 'good' ? 'text-green-600' :
              memoryGrade === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {metrics.memoryUsage}MB
            </div>
            <div className="text-sm text-gray-600">Memory Usage</div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Scroll FPS</span>
            <span className={`text-sm font-medium ${
              fpsGrade === 'good' ? 'text-green-600' :
              fpsGrade === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {metrics.scrollFPS} fps
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Cache Hit Rate</span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(metrics.cacheHitRate * 100)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Proxy Count</span>
            <span className="text-sm font-medium text-gray-900">
              {metrics.proxyCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Performance Chart */}
        {history.length > 1 && (
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">Render Time Trend</div>
            <div className="h-16 bg-gray-50 rounded flex items-end space-x-1 p-2">
              {history.slice(-20).map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-blue-500 rounded-t"
                  style={{
                    height: `${Math.min((h.renderTime / 200) * 100, 100)}%`
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-red-600 font-medium mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Performance Alerts
            </div>
            <div className="space-y-1">
              {alerts.map((alert, i) => (
                <div key={i} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {alert}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-1">Recommendations</div>
          <div className="text-xs text-blue-700">
            {metrics.proxyCount > 50000 && "Consider using virtual scrolling for better performance"}
            {metrics.memoryUsage > 100 && "Close unused browser tabs to free memory"}
            {metrics.scrollFPS < 30 && "Reduce animation complexity or proxy count"}
            {metrics.cacheHitRate < 0.7 && "Enable more aggressive caching"}
          </div>
        </div>
      </div>
    </div>
  )
}