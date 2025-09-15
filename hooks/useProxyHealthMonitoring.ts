'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { SimpleProxy as Proxy } from '@/types/proxy'

export interface HealthMetrics {
  proxyId: number
  responseTime: number
  successRate: number
  uptime: number
  lastCheck: number
  consecutiveFailures: number
  totalRequests: number
  successfulRequests: number
  averageResponseTime: number
  healthScore: number
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  lastError?: string
  geolocation?: {
    country: string
    city: string
    region: string
  }
  bandwidth?: {
    download: number
    upload: number
  }
}

export interface HealthAlert {
  id: string
  type: 'warning' | 'critical' | 'recovery' | 'failover'
  proxyId: number
  message: string
  timestamp: number
  acknowledged: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  details?: any
}

export interface MonitoringConfig {
  checkInterval: number // milliseconds
  healthThreshold: number // 0-100
  warningThreshold: number // 0-100
  criticalThreshold: number // 0-100
  maxConsecutiveFailures: number
  enableAutoFailover: boolean
  enableAlerts: boolean
  alertCooldown: number // milliseconds
  monitoringEnabled: boolean
  testTimeout: number
  batchSize: number
}

const DEFAULT_CONFIG: MonitoringConfig = {
  checkInterval: 300000, // 5 minutes
  healthThreshold: 80,
  warningThreshold: 60,
  criticalThreshold: 30,
  maxConsecutiveFailures: 3,
  enableAutoFailover: true,
  enableAlerts: true,
  alertCooldown: 600000, // 10 minutes
  monitoringEnabled: true,
  testTimeout: 10000,
  batchSize: 5
}

export function useProxyHealthMonitoring(proxies: Proxy[]) {
  const [healthMetrics, setHealthMetrics] = useState<Map<number, HealthMetrics>>(new Map())
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [config, setConfig] = useState<MonitoringConfig>(DEFAULT_CONFIG)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastMonitoringRun, setLastMonitoringRun] = useState<number>(0)

  const monitoringInterval = useRef<NodeJS.Timeout | null>(null)
  const alertCooldowns = useRef<Map<number, number>>(new Map())
  const testQueue = useRef<number[]>([])
  const isProcessingQueue = useRef(false)
  const recursionCount = useRef(0)
  const maxRecursionDepth = 10 // Prevent infinite recursion

  // Initialize health metrics for new proxies
  useEffect(() => {
    setHealthMetrics(prev => {
      const newMetrics = new Map(prev)
      
      proxies.forEach(proxy => {
        if (!newMetrics.has(proxy.id)) {
          newMetrics.set(proxy.id, {
            proxyId: proxy.id,
            responseTime: 0,
            successRate: 100,
            uptime: 100,
            lastCheck: Date.now(),
            consecutiveFailures: 0,
            totalRequests: 0,
            successfulRequests: 0,
            averageResponseTime: 0,
            healthScore: 100,
            status: 'healthy'
          })
        }
      })

      // Remove metrics for deleted proxies
      const currentProxyIds = new Set(proxies.map(p => p.id))
      newMetrics.forEach((_, id) => {
        if (!currentProxyIds.has(id)) {
          newMetrics.delete(id)
        }
      })

      return newMetrics
    })
  }, [proxies])

  // Test a single proxy
  const testProxy = useCallback(async (proxy: Proxy): Promise<{
    success: boolean
    responseTime: number
    error?: string
  }> => {
    const startTime = Date.now()
    
    try {
      // Simulate proxy test
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout'))
        }, config.testTimeout)

        // Simulate network request
        setTimeout(() => {
          clearTimeout(timeout)
          const random = Math.random()
          if (random > 0.8) { // 20% failure rate
            reject(new Error('Connection failed'))
          } else {
            resolve(true)
          }
        }, Math.random() * 2000 + 500) // 500-2500ms response time
      })

      const responseTime = Date.now() - startTime
      return { success: true, responseTime }

    } catch (error) {
      const responseTime = Date.now() - startTime
      return { 
        success: false, 
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }, [config.testTimeout])

  // Calculate health score based on multiple factors
  const calculateHealthScore = useCallback((metrics: HealthMetrics): number => {
    const successRateWeight = 0.4
    const responseTimeWeight = 0.3
    const uptimeWeight = 0.2
    const consecutiveFailuresWeight = 0.1

    // Success rate score (0-100)
    const successScore = metrics.successRate

    // Response time score (lower is better, normalized to 0-100)
    const maxAcceptableResponseTime = 5000 // 5 seconds
    const responseScore = Math.max(0, 100 - (metrics.averageResponseTime / maxAcceptableResponseTime) * 100)

    // Uptime score
    const uptimeScore = metrics.uptime

    // Consecutive failures penalty
    const failuresPenalty = Math.min(100, metrics.consecutiveFailures * 20)
    const failuresScore = Math.max(0, 100 - failuresPenalty)

    const totalScore = (
      successScore * successRateWeight +
      responseScore * responseTimeWeight +
      uptimeScore * uptimeWeight +
      failuresScore * consecutiveFailuresWeight
    )

    return Math.round(Math.max(0, Math.min(100, totalScore)))
  }, [])

  // Determine status based on health score
  const getHealthStatus = useCallback((healthScore: number): HealthMetrics['status'] => {
    if (healthScore >= config.healthThreshold) return 'healthy'
    if (healthScore >= config.warningThreshold) return 'warning'
    if (healthScore >= config.criticalThreshold) return 'critical'
    return 'offline'
  }, [config])

  // Create alert
  const createAlert = useCallback((
    type: HealthAlert['type'],
    proxyId: number,
    message: string,
    severity: HealthAlert['severity'] = 'medium',
    details?: any
  ) => {
    if (!config.enableAlerts) return

    const now = Date.now()
    const lastAlert = alertCooldowns.current.get(proxyId) || 0
    
    // Check cooldown
    if (now - lastAlert < config.alertCooldown) return

    const alert: HealthAlert = {
      id: `${type}_${proxyId}_${now}`,
      type,
      proxyId,
      message,
      timestamp: now,
      acknowledged: false,
      severity,
      details
    }

    setAlerts(prev => [alert, ...prev.slice(0, 99)]) // Keep last 100 alerts
    alertCooldowns.current.set(proxyId, now)
  }, [config.enableAlerts, config.alertCooldown])

  // Update health metrics for a proxy
  const updateHealthMetrics = useCallback((
    proxyId: number,
    testResult: { success: boolean; responseTime: number; error?: string }
  ) => {
    setHealthMetrics(prev => {
      const newMetrics = new Map(prev)
      const current = newMetrics.get(proxyId)
      
      if (!current) return prev

      const now = Date.now()
      const timeSinceLastCheck = now - current.lastCheck
      const uptimeHours = timeSinceLastCheck / (1000 * 60 * 60)

      // Update basic metrics
      const totalRequests = current.totalRequests + 1
      const successfulRequests = current.successfulRequests + (testResult.success ? 1 : 0)
      const successRate = (successfulRequests / totalRequests) * 100
      
      // Update response time (moving average)
      const averageResponseTime = current.totalRequests === 0 
        ? testResult.responseTime
        : (current.averageResponseTime * current.totalRequests + testResult.responseTime) / totalRequests

      // Update consecutive failures
      const consecutiveFailures = testResult.success 
        ? 0 
        : current.consecutiveFailures + 1

      // Calculate uptime (simplified)
      const uptime = testResult.success 
        ? Math.min(100, current.uptime + 0.1)
        : Math.max(0, current.uptime - 1)

      const updated: HealthMetrics = {
        ...current,
        responseTime: testResult.responseTime,
        successRate,
        uptime,
        lastCheck: now,
        consecutiveFailures,
        totalRequests,
        successfulRequests,
        averageResponseTime,
        healthScore: 0, // Will be calculated below
        lastError: testResult.error
      }

      // Calculate health score and status
      updated.healthScore = calculateHealthScore(updated)
      const newStatus = getHealthStatus(updated.healthScore)
      const oldStatus = current.status

      updated.status = newStatus

      // Create alerts for status changes
      if (oldStatus !== newStatus) {
        const proxy = proxies.find(p => p.id === proxyId)
        const proxyName = proxy ? `${proxy.host}:${proxy.port}` : `Proxy ${proxyId}`

        switch (newStatus) {
          case 'warning':
            createAlert('warning', proxyId, 
              `${proxyName} đang gặp vấn đề (Health: ${updated.healthScore}%)`,
              'medium',
              { healthScore: updated.healthScore, successRate, consecutiveFailures }
            )
            break
          case 'critical':
            createAlert('critical', proxyId,
              `${proxyName} trong tình trạng nghiêm trọng (Health: ${updated.healthScore}%)`,
              'high',
              { healthScore: updated.healthScore, successRate, consecutiveFailures }
            )
            break
          case 'offline':
            createAlert('critical', proxyId,
              `${proxyName} đã offline (${consecutiveFailures} lần thất bại liên tiếp)`,
              'critical',
              { consecutiveFailures, lastError: testResult.error }
            )
            break
          case 'healthy':
            if (oldStatus !== 'healthy') {
              createAlert('recovery', proxyId,
                `${proxyName} đã phục hồi (Health: ${updated.healthScore}%)`,
                'low',
                { healthScore: updated.healthScore }
              )
            }
            break
        }
      }

      newMetrics.set(proxyId, updated)
      return newMetrics
    })
  }, [calculateHealthScore, getHealthStatus, createAlert, proxies])

  // Process test queue
  const processTestQueue = useCallback(async () => {
    if (isProcessingQueue.current || testQueue.current.length === 0) return
    
    // Prevent infinite recursion
    if (recursionCount.current >= maxRecursionDepth) {
      console.warn('Maximum recursion depth reached, stopping queue processing')
      recursionCount.current = 0
      return
    }

    isProcessingQueue.current = true
    recursionCount.current += 1

    try {
      const batch = testQueue.current.splice(0, config.batchSize)
      const testPromises = batch.map(async (proxyId) => {
        const proxy = proxies.find(p => p.id === proxyId)
        if (!proxy) return

        const result = await testProxy(proxy)
        updateHealthMetrics(proxyId, result)
      })

      await Promise.all(testPromises)
    } finally {
      isProcessingQueue.current = false
    }

    // Continue processing if there are more items
    if (testQueue.current.length > 0) {
      setTimeout(() => {
        if (testQueue.current.length > 0) {
          processTestQueue()
        }
      }, 1000) // 1 second delay between batches
    } else {
      // Reset recursion counter when queue is empty
      recursionCount.current = 0
    }
  }, [config.batchSize, proxies, testProxy, updateHealthMetrics, maxRecursionDepth])

  // Add proxies to test queue
  const queueProxyTests = useCallback((proxyIds: number[]) => {
    testQueue.current.push(...proxyIds)
    processTestQueue()
  }, [processTestQueue])

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (!config.monitoringEnabled || isMonitoring) return

    setIsMonitoring(true)
    recursionCount.current = 0 // Reset recursion counter

    const runMonitoring = () => {
      const now = Date.now()
      setLastMonitoringRun(now)

      // Queue all proxies for testing
      const proxyIds = proxies.map(p => p.id)
      queueProxyTests(proxyIds)
    }

    // Run immediately
    runMonitoring()

    // Set up interval
    monitoringInterval.current = setInterval(runMonitoring, config.checkInterval)
  }, [config.monitoringEnabled, config.checkInterval, isMonitoring, proxies, queueProxyTests])

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current)
      monitoringInterval.current = null
    }
  }, [])

  // Restart monitoring with new config
  const restartMonitoring = useCallback(() => {
    stopMonitoring()
    setTimeout(startMonitoring, 1000)
  }, [stopMonitoring, startMonitoring])

  // Auto-start monitoring
  useEffect(() => {
    if (config.monitoringEnabled && proxies.length > 0) {
      startMonitoring()
    }
    return stopMonitoring
  }, [config.monitoringEnabled, proxies.length, startMonitoring, stopMonitoring])

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }, [])

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  // Get monitoring statistics
  const getMonitoringStats = useCallback(() => {
    const metrics = Array.from(healthMetrics.values())
    
    return {
      totalProxies: metrics.length,
      healthyProxies: metrics.filter(m => m.status === 'healthy').length,
      warningProxies: metrics.filter(m => m.status === 'warning').length,
      criticalProxies: metrics.filter(m => m.status === 'critical').length,
      offlineProxies: metrics.filter(m => m.status === 'offline').length,
      averageHealthScore: metrics.length > 0 
        ? Math.round(metrics.reduce((sum, m) => sum + m.healthScore, 0) / metrics.length)
        : 0,
      averageResponseTime: metrics.length > 0
        ? Math.round(metrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / metrics.length)
        : 0,
      totalAlerts: alerts.length,
      unacknowledgedAlerts: alerts.filter(a => !a.acknowledged).length
    }
  }, [healthMetrics, alerts])

  return {
    healthMetrics,
    alerts,
    config,
    isMonitoring,
    lastMonitoringRun,
    startMonitoring,
    stopMonitoring,
    restartMonitoring,
    setConfig,
    acknowledgeAlert,
    clearAlerts,
    queueProxyTests,
    getMonitoringStats
  }
}
