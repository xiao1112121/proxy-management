'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  RotateCcw, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Clock,
  Globe,
  Shield,
  Activity,
  BarChart3,
  AlertTriangle
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface RotationConfig {
  strategy: 'round-robin' | 'least-used' | 'best-performance' | 'random' | 'geographic'
  interval: number // milliseconds
  maxFailures: number
  healthCheckInterval: number
  enableAutoFailover: boolean
  enableLoadBalancing: boolean
  maxConcurrent: number
}

interface ProxyWithStats extends Proxy {
  usageCount: number
  lastUsed: number
  failureCount: number
  successRate: number
  averageResponseTime: number
  isHealthy: boolean
  lastHealthCheck: number
}

interface RotationStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  currentProxy: ProxyWithStats | null
  rotationCount: number
  uptime: number
}

export default function SmartProxyRotation() {
  const [proxies, setProxies] = useState<ProxyWithStats[]>([])
  const [config, setConfig] = useState<RotationConfig>({
    strategy: 'best-performance',
    interval: 5000,
    maxFailures: 3,
    healthCheckInterval: 30000,
    enableAutoFailover: true,
    enableLoadBalancing: true,
    maxConcurrent: 5
  })
  const [isRunning, setIsRunning] = useState(false)
  const [currentProxy, setCurrentProxy] = useState<ProxyWithStats | null>(null)
  const [stats, setStats] = useState<RotationStats>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    currentProxy: null,
    rotationCount: 0,
    uptime: 0
  })
  const [rotationHistory, setRotationHistory] = useState<Array<{
    timestamp: number
    from: ProxyWithStats | null
    to: ProxyWithStats | null
    reason: string
  }>>([])
  const [testResults, setTestResults] = useState<Array<{
    proxy: ProxyWithStats
    success: boolean
    responseTime: number
    timestamp: number
    error?: string
  }>>([])

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const healthCheckRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // Load proxies from localStorage
  useEffect(() => {
    const savedProxies = localStorage.getItem('proxies')
    if (savedProxies) {
      try {
        const parsedProxies = JSON.parse(savedProxies)
        const proxiesWithStats: ProxyWithStats[] = parsedProxies.map((proxy: Proxy) => ({
          ...proxy,
          usageCount: 0,
          lastUsed: 0,
          failureCount: 0,
          successRate: 100,
          averageResponseTime: 0,
          isHealthy: true,
          lastHealthCheck: 0
        }))
        setProxies(proxiesWithStats)
      } catch (error) {
        console.error('Error loading proxies:', error)
      }
    }
  }, [])

  // Update uptime
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now()
      const uptimeInterval = setInterval(() => {
        setStats(prev => ({
          ...prev,
          uptime: Date.now() - startTimeRef.current
        }))
      }, 1000)
      return () => clearInterval(uptimeInterval)
    }
  }, [isRunning])

  // Health check function
  const healthCheck = useCallback(async (proxy: ProxyWithStats): Promise<boolean> => {
    try {
      const startTime = Date.now()
      const response = await fetch('/api/test-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proxy),
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const responseTime = Date.now() - startTime

      // Update proxy stats
      setProxies(prev => prev.map(p => 
        p.id === proxy.id 
          ? {
              ...p,
              isHealthy: data.success,
              lastHealthCheck: Date.now(),
              averageResponseTime: p.averageResponseTime === 0 
                ? responseTime 
                : (p.averageResponseTime + responseTime) / 2,
              successRate: data.success 
                ? Math.min(100, p.successRate + 1)
                : Math.max(0, p.successRate - 5)
            }
          : p
      ))

      return data.success
    } catch (error) {
      setProxies(prev => prev.map(p => 
        p.id === proxy.id 
          ? {
              ...p,
              isHealthy: false,
              lastHealthCheck: Date.now(),
              failureCount: p.failureCount + 1,
              successRate: Math.max(0, p.successRate - 10)
            }
          : p
      ))
      return false
    }
  }, [])

  // Select next proxy based on strategy
  const selectNextProxy = useCallback((): ProxyWithStats | null => {
    const healthyProxies = proxies.filter(p => p.isHealthy)
    if (healthyProxies.length === 0) return null

    switch (config.strategy) {
      case 'round-robin':
        // Simple round-robin based on usage count
        return healthyProxies.reduce((prev, current) => 
          prev.usageCount < current.usageCount ? prev : current
        )

      case 'least-used':
        // Select proxy with least usage
        return healthyProxies.reduce((prev, current) => 
          prev.usageCount < current.usageCount ? prev : current
        )

      case 'best-performance':
        // Select proxy with best performance (highest success rate, lowest response time)
        return healthyProxies.reduce((prev, current) => {
          const prevScore = prev.successRate - (prev.averageResponseTime / 100)
          const currentScore = current.successRate - (current.averageResponseTime / 100)
          return currentScore > prevScore ? current : prev
        })

      case 'random':
        // Random selection
        return healthyProxies[Math.floor(Math.random() * healthyProxies.length)]

      case 'geographic':
        // For now, just use best performance (can be enhanced with geo data)
        return healthyProxies.reduce((prev, current) => {
          const prevScore = prev.successRate - (prev.averageResponseTime / 100)
          const currentScore = current.successRate - (current.averageResponseTime / 100)
          return currentScore > prevScore ? current : prev
        })

      default:
        return healthyProxies[0]
    }
  }, [proxies, config.strategy])

  // Rotate to next proxy
  const rotateProxy = useCallback(() => {
    const nextProxy = selectNextProxy()
    if (!nextProxy) return

    const previousProxy = currentProxy
    setCurrentProxy(nextProxy)

    // Update usage stats
    setProxies(prev => prev.map(p => 
      p.id === nextProxy.id 
        ? { ...p, usageCount: p.usageCount + 1, lastUsed: Date.now() }
        : p
    ))

    // Add to rotation history
    setRotationHistory(prev => [{
      timestamp: Date.now(),
      from: previousProxy,
      to: nextProxy,
      reason: previousProxy ? 'Scheduled rotation' : 'Initial selection'
    }, ...prev.slice(0, 99)]) // Keep last 100 rotations

    setStats(prev => ({
      ...prev,
      currentProxy: nextProxy,
      rotationCount: prev.rotationCount + 1
    }))
  }, [selectNextProxy, currentProxy])

  // Test current proxy
  const testCurrentProxy = useCallback(async () => {
    if (!currentProxy) return

    const startTime = Date.now()
    try {
      const response = await fetch('/api/test-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProxy),
        signal: AbortSignal.timeout(10000)
      })

      const responseTime = Date.now() - startTime
      const success = response.ok

      // Update stats
      setStats(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        successfulRequests: prev.successfulRequests + (success ? 1 : 0),
        failedRequests: prev.failedRequests + (success ? 0 : 1),
        averageResponseTime: prev.averageResponseTime === 0 
          ? responseTime 
          : (prev.averageResponseTime + responseTime) / 2
      }))

      // Add test result
      setTestResults(prev => [{
        proxy: currentProxy,
        success,
        responseTime,
        timestamp: Date.now(),
        error: success ? undefined : `HTTP ${response.status}`
      }, ...prev.slice(0, 99)]) // Keep last 100 results

      // Auto-failover if enabled and proxy failed
      if (!success && config.enableAutoFailover) {
        const failureCount = currentProxy.failureCount + 1
        if (failureCount >= config.maxFailures) {
          setProxies(prev => prev.map(p => 
            p.id === currentProxy.id 
              ? { ...p, isHealthy: false, failureCount }
              : p
          ))
          rotateProxy()
        }
      }

    } catch (error) {
      setStats(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        failedRequests: prev.failedRequests + 1
      }))

      setTestResults(prev => [{
        proxy: currentProxy,
        success: false,
        responseTime: Date.now() - startTime,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }, ...prev.slice(0, 99)])
    }
  }, [currentProxy, config.enableAutoFailover, config.maxFailures, rotateProxy])

  // Start rotation
  const startRotation = () => {
    setIsRunning(true)
    rotateProxy() // Initial selection
    
    // Set up rotation interval
    intervalRef.current = setInterval(() => {
      rotateProxy()
    }, config.interval)

    // Set up health check interval
    healthCheckRef.current = setInterval(() => {
      proxies.forEach(proxy => {
        if (proxy.isHealthy || Date.now() - proxy.lastHealthCheck > config.healthCheckInterval) {
          healthCheck(proxy)
        }
      })
    }, config.healthCheckInterval)
  }

  // Stop rotation
  const stopRotation = () => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (healthCheckRef.current) {
      clearInterval(healthCheckRef.current)
      healthCheckRef.current = null
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (healthCheckRef.current) clearInterval(healthCheckRef.current)
    }
  }, [])

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <RotateCcw className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Smart Proxy Rotation</h2>
              <p className="text-sm text-gray-600">Tự động chuyển đổi proxy thông minh</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isRunning ? (
              <button
                onClick={startRotation}
                disabled={proxies.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                <span>Bắt đầu</span>
              </button>
            ) : (
              <button
                onClick={stopRotation}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                <Square className="h-4 w-4" />
                <span>Dừng</span>
              </button>
            )}
          </div>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chiến lược</label>
            <select
              value={config.strategy}
              onChange={(e) => setConfig(prev => ({ ...prev, strategy: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              disabled={isRunning}
            >
              <option value="round-robin">Round Robin</option>
              <option value="least-used">Ít sử dụng nhất</option>
              <option value="best-performance">Hiệu suất tốt nhất</option>
              <option value="random">Ngẫu nhiên</option>
              <option value="geographic">Theo địa lý</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng cách (ms)</label>
            <input
              type="number"
              value={config.interval}
              onChange={(e) => setConfig(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              disabled={isRunning}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số lỗi tối đa</label>
            <input
              type="number"
              value={config.maxFailures}
              onChange={(e) => setConfig(prev => ({ ...prev, maxFailures: parseInt(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              disabled={isRunning}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Tổng yêu cầu</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalRequests}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Thành công</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.successfulRequests}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-gray-700">Thất bại</span>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.failedRequests}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Thời gian hoạt động</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-1">{formatUptime(stats.uptime)}</p>
        </div>
      </div>

      {/* Current Proxy */}
      {currentProxy && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Proxy hiện tại</h3>
            <button
              onClick={testCurrentProxy}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg"
            >
              <Zap className="h-4 w-4" />
              <span>Test</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-gray-500">Proxy</span>
              <p className="font-mono text-sm">{currentProxy.host}:{currentProxy.port}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Loại</span>
              <p className="text-sm">{currentProxy.type}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Sử dụng</span>
              <p className="text-sm">{currentProxy.usageCount} lần</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Tỷ lệ thành công</span>
              <p className="text-sm">{currentProxy.successRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Proxy List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Danh sách Proxy</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proxy</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sử dụng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thành công</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ping TB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {proxies.map((proxy) => (
                <tr key={proxy.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">
                    {proxy.host}:{proxy.port}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {proxy.isHealthy ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm ${proxy.isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                        {proxy.isHealthy ? 'Khỏe mạnh' : 'Lỗi'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{proxy.usageCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{proxy.successRate}%</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{proxy.averageResponseTime}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Kết quả test gần đây</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proxy</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kết quả</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian phản hồi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {testResults.slice(0, 10).map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">
                      {result.proxy.host}:{result.proxy.port}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                          {result.success ? 'Thành công' : 'Thất bại'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.responseTime}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
