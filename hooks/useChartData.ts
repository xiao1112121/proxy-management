'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { HealthMetrics } from '@/hooks/useProxyHealthMonitoring'

export interface ChartDataPoint {
  timestamp: number
  value: number
  label?: string
  category?: string
}

export interface TimeSeriesData {
  id: string
  name: string
  data: ChartDataPoint[]
  color: string
  visible: boolean
}

export interface ChartConfig {
  updateInterval: number // milliseconds
  maxDataPoints: number
  enableRealTime: boolean
  showAnimations: boolean
  theme: 'light' | 'dark'
}

const DEFAULT_CONFIG: ChartConfig = {
  updateInterval: 5000, // 5 seconds
  maxDataPoints: 50,
  enableRealTime: true,
  showAnimations: true,
  theme: 'light'
}

export function useChartData(proxies: Proxy[], healthMetrics?: Map<number, HealthMetrics>) {
  const [config, setConfig] = useState<ChartConfig>(DEFAULT_CONFIG)
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [isCollecting, setIsCollecting] = useState(false)
  
  const dataCollectionInterval = useRef<NodeJS.Timeout | null>(null)
  const dataHistory = useRef<Map<string, ChartDataPoint[]>>(new Map())

  // Initialize time series
  useEffect(() => {
    const initialSeries: TimeSeriesData[] = [
      {
        id: 'healthy_count',
        name: 'Healthy Proxies',
        data: [],
        color: '#10B981', // green-500
        visible: true
      },
      {
        id: 'warning_count',
        name: 'Warning Proxies',
        data: [],
        color: '#F59E0B', // yellow-500
        visible: true
      },
      {
        id: 'critical_count',
        name: 'Critical Proxies',
        data: [],
        color: '#EF4444', // red-500
        visible: true
      },
      {
        id: 'offline_count',
        name: 'Offline Proxies',
        data: [],
        color: '#6B7280', // gray-500
        visible: true
      },
      {
        id: 'avg_health_score',
        name: 'Avg Health Score',
        data: [],
        color: '#3B82F6', // blue-500
        visible: true
      },
      {
        id: 'avg_response_time',
        name: 'Avg Response Time (ms)',
        data: [],
        color: '#8B5CF6', // purple-500
        visible: true
      }
    ]

    setTimeSeriesData(initialSeries)
    
    // Initialize data history
    initialSeries.forEach(series => {
      dataHistory.current.set(series.id, [])
    })
  }, [])

  // Collect data point
  const collectDataPoint = useCallback(() => {
    if (!healthMetrics || healthMetrics.size === 0) return

    const now = Date.now()
    const metricsArray = Array.from(healthMetrics.values())
    
    // Calculate current stats
    const healthyCount = metricsArray.filter(m => m.status === 'healthy').length
    const warningCount = metricsArray.filter(m => m.status === 'warning').length
    const criticalCount = metricsArray.filter(m => m.status === 'critical').length
    const offlineCount = metricsArray.filter(m => m.status === 'offline').length
    
    const avgHealthScore = metricsArray.length > 0
      ? Math.round(metricsArray.reduce((sum, m) => sum + m.healthScore, 0) / metricsArray.length)
      : 0
      
    const avgResponseTime = metricsArray.length > 0
      ? Math.round(metricsArray.reduce((sum, m) => sum + m.responseTime, 0) / metricsArray.length)
      : 0

    // Create data points
    const newDataPoints = [
      { id: 'healthy_count', value: healthyCount },
      { id: 'warning_count', value: warningCount },
      { id: 'critical_count', value: criticalCount },
      { id: 'offline_count', value: offlineCount },
      { id: 'avg_health_score', value: avgHealthScore },
      { id: 'avg_response_time', value: avgResponseTime }
    ]

    // Update data history
    newDataPoints.forEach(({ id, value }) => {
      const history = dataHistory.current.get(id) || []
      const newPoint: ChartDataPoint = {
        timestamp: now,
        value,
        label: new Date(now).toLocaleTimeString('vi-VN')
      }
      
      history.push(newPoint)
      
      // Keep only latest points
      if (history.length > config.maxDataPoints) {
        history.splice(0, history.length - config.maxDataPoints)
      }
      
      dataHistory.current.set(id, history)
    })

    // Update time series data
    setTimeSeriesData(prev => prev.map(series => ({
      ...series,
      data: [...(dataHistory.current.get(series.id) || [])]
    })))

  }, [healthMetrics, config.maxDataPoints])

  // Start data collection
  const startCollection = useCallback(() => {
    if (isCollecting) return

    setIsCollecting(true)
    
    // Collect immediately
    collectDataPoint()
    
    // Set up interval
    dataCollectionInterval.current = setInterval(
      collectDataPoint,
      config.updateInterval
    )
  }, [isCollecting, collectDataPoint, config.updateInterval])

  // Stop data collection
  const stopCollection = useCallback(() => {
    setIsCollecting(false)
    if (dataCollectionInterval.current) {
      clearInterval(dataCollectionInterval.current)
      dataCollectionInterval.current = null
    }
  }, [])

  // Auto start/stop based on config
  useEffect(() => {
    if (config.enableRealTime && healthMetrics && healthMetrics.size > 0) {
      startCollection()
    } else {
      stopCollection()
    }
    
    return stopCollection
  }, [config.enableRealTime, healthMetrics, startCollection, stopCollection])

  // Toggle series visibility
  const toggleSeriesVisibility = useCallback((seriesId: string) => {
    setTimeSeriesData(prev => prev.map(series => 
      series.id === seriesId 
        ? { ...series, visible: !series.visible }
        : series
    ))
  }, [])

  // Clear all data
  const clearData = useCallback(() => {
    dataHistory.current.clear()
    setTimeSeriesData(prev => prev.map(series => ({
      ...series,
      data: []
    })))
  }, [])

  // Get proxy distribution data
  const getProxyDistribution = useCallback(() => {
    const distribution = {
      byStatus: new Map<string, number>(),
      byCountry: new Map<string, number>(),
      byType: new Map<string, number>(),
      byAnonymity: new Map<string, number>()
    }

    proxies.forEach(proxy => {
      // By status
      const status = proxy.status || 'unknown'
      distribution.byStatus.set(status, (distribution.byStatus.get(status) || 0) + 1)
      
      // By country
      const country = proxy.country || 'Unknown'
      distribution.byCountry.set(country, (distribution.byCountry.get(country) || 0) + 1)
      
      // By type
      const type = proxy.type || 'unknown'
      distribution.byType.set(type, (distribution.byType.get(type) || 0) + 1)
      
      // By anonymity
      const anonymity = proxy.anonymity || 'unknown'
      distribution.byAnonymity.set(anonymity, (distribution.byAnonymity.get(anonymity) || 0) + 1)
    })

    return distribution
  }, [proxies])

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    if (!healthMetrics || healthMetrics.size === 0) {
      return {
        healthScoreDistribution: new Map(),
        responseTimeDistribution: new Map(),
        uptimeDistribution: new Map()
      }
    }

    const metrics = Array.from(healthMetrics.values())
    
    const healthScoreDistribution = new Map<string, number>()
    const responseTimeDistribution = new Map<string, number>()
    const uptimeDistribution = new Map<string, number>()

    metrics.forEach(metric => {
      // Health score ranges
      const healthRange = 
        metric.healthScore >= 90 ? '90-100%' :
        metric.healthScore >= 80 ? '80-89%' :
        metric.healthScore >= 70 ? '70-79%' :
        metric.healthScore >= 60 ? '60-69%' :
        metric.healthScore >= 50 ? '50-59%' : 'Below 50%'
      
      healthScoreDistribution.set(
        healthRange, 
        (healthScoreDistribution.get(healthRange) || 0) + 1
      )

      // Response time ranges
      const responseRange =
        metric.responseTime < 500 ? '<500ms' :
        metric.responseTime < 1000 ? '500-999ms' :
        metric.responseTime < 2000 ? '1-2s' :
        metric.responseTime < 5000 ? '2-5s' : '>5s'
      
      responseTimeDistribution.set(
        responseRange,
        (responseTimeDistribution.get(responseRange) || 0) + 1
      )

      // Uptime ranges
      const uptimeRange =
        metric.uptime >= 99 ? '99-100%' :
        metric.uptime >= 95 ? '95-98%' :
        metric.uptime >= 90 ? '90-94%' :
        metric.uptime >= 80 ? '80-89%' : 'Below 80%'
      
      uptimeDistribution.set(
        uptimeRange,
        (uptimeDistribution.get(uptimeRange) || 0) + 1
      )
    })

    return {
      healthScoreDistribution,
      responseTimeDistribution,
      uptimeDistribution
    }
  }, [healthMetrics])

  // Get top performers
  const getTopPerformers = useCallback(() => {
    if (!healthMetrics || healthMetrics.size === 0) return []

    const metrics = Array.from(healthMetrics.values())
      .filter(m => m.totalRequests > 0)
      .sort((a, b) => b.healthScore - a.healthScore)
      .slice(0, 10)

    return metrics.map(metric => {
      const proxy = proxies.find(p => p.id === metric.proxyId)
      return {
        id: metric.proxyId,
        name: proxy ? `${proxy.host}:${proxy.port}` : `Proxy ${metric.proxyId}`,
        healthScore: metric.healthScore,
        successRate: metric.successRate,
        responseTime: metric.responseTime,
        uptime: metric.uptime,
        country: proxy?.country || 'Unknown'
      }
    })
  }, [healthMetrics, proxies])

  // Get worst performers
  const getWorstPerformers = useCallback(() => {
    if (!healthMetrics || healthMetrics.size === 0) return []

    const metrics = Array.from(healthMetrics.values())
      .filter(m => m.totalRequests > 0)
      .sort((a, b) => a.healthScore - b.healthScore)
      .slice(0, 10)

    return metrics.map(metric => {
      const proxy = proxies.find(p => p.id === metric.proxyId)
      return {
        id: metric.proxyId,
        name: proxy ? `${proxy.host}:${proxy.port}` : `Proxy ${metric.proxyId}`,
        healthScore: metric.healthScore,
        successRate: metric.successRate,
        responseTime: metric.responseTime,
        consecutiveFailures: metric.consecutiveFailures,
        lastError: metric.lastError,
        country: proxy?.country || 'Unknown'
      }
    })
  }, [healthMetrics, proxies])

  // Export data
  const exportData = useCallback((format: 'json' | 'csv') => {
    const data = {
      timestamp: Date.now(),
      config,
      timeSeriesData,
      distribution: getProxyDistribution(),
      performance: getPerformanceMetrics(),
      topPerformers: getTopPerformers(),
      worstPerformers: getWorstPerformers()
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `proxy-analytics-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      // CSV export for time series data
      const csvRows = ['timestamp,series,value']
      timeSeriesData.forEach(series => {
        series.data.forEach(point => {
          csvRows.push(`${point.timestamp},${series.name},${point.value}`)
        })
      })
      
      const blob = new Blob([csvRows.join('\n')], {
        type: 'text/csv'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `proxy-analytics-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [config, timeSeriesData, getProxyDistribution, getPerformanceMetrics, getTopPerformers, getWorstPerformers])

  return {
    config,
    setConfig,
    timeSeriesData,
    isCollecting,
    startCollection,
    stopCollection,
    toggleSeriesVisibility,
    clearData,
    getProxyDistribution,
    getPerformanceMetrics,
    getTopPerformers,
    getWorstPerformers,
    exportData
  }
}
