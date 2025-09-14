'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Play, 
  Pause, 
  Square, 
  Zap, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Globe,
  Activity,
  Settings
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface TestResult {
  id: number
  success: boolean
  ping?: number
  speed?: number
  error?: string
  timestamp: string
  responseTime: number
}

interface RealTimeProxyTestProps {
  proxies: Proxy[]
  onUpdateProxy: (id: number, updates: Partial<Proxy>) => void
}

export default function RealTimeProxyTest({ proxies, onUpdateProxy }: RealTimeProxyTestProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<Record<number, TestResult>>({})
  const [testQueue, setTestQueue] = useState<number[]>([])
  const [currentTest, setCurrentTest] = useState<number | null>(null)
  const [testSettings, setTestSettings] = useState({
    interval: 30000, // 30 seconds
    timeout: 10000,  // 10 seconds
    maxConcurrent: 3,
    retryFailed: true,
    retryCount: 2
  })
  const [stats, setStats] = useState({
    totalTests: 0,
    successfulTests: 0,
    failedTests: 0,
    averagePing: 0,
    averageSpeed: 0
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const testCountRef = useRef(0)

  useEffect(() => {
    if (isRunning) {
      startTesting()
    } else {
      stopTesting()
    }
    return () => stopTesting()
  }, [isRunning])

  useEffect(() => {
    calculateStats()
  }, [testResults])

  const startTesting = () => {
    if (intervalRef.current) return
    
    // Initial test
    runTests()
    
    // Set up interval
    intervalRef.current = setInterval(() => {
      runTests()
    }, testSettings.interval)
  }

  const stopTesting = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setCurrentTest(null)
  }

  const runTests = async () => {
    const aliveProxies = proxies.filter(p => p.status === 'alive' || p.status === 'pending')
    const shuffledProxies = [...aliveProxies].sort(() => Math.random() - 0.5)
    
    // Limit concurrent tests
    const proxiesToTest = shuffledProxies.slice(0, testSettings.maxConcurrent)
    
    for (const proxy of proxiesToTest) {
      if (testQueue.includes(proxy.id)) continue
      
      setTestQueue(prev => [...prev, proxy.id])
      setCurrentTest(proxy.id)
      
      try {
        const result = await testSingleProxy(proxy)
        setTestResults(prev => ({ ...prev, [proxy.id]: result }))
        
        // Update proxy status
        onUpdateProxy(proxy.id, {
          status: result.success ? 'alive' : 'dead',
          ping: result.ping,
          speed: result.speed,
          lastTested: result.timestamp
        })
        
        testCountRef.current++
      } catch (error) {
        console.error('Test error:', error)
        const errorResult: TestResult = {
          id: proxy.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          responseTime: 0
        }
        setTestResults(prev => ({ ...prev, [proxy.id]: errorResult }))
      } finally {
        setTestQueue(prev => prev.filter(id => id !== proxy.id))
        setCurrentTest(null)
      }
    }
  }

  const testSingleProxy = async (proxy: Proxy): Promise<TestResult> => {
    const startTime = Date.now()
    
    try {
      const response = await fetch('/api/test-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: proxy.host,
          port: proxy.port,
          username: proxy.username,
          password: proxy.password,
          type: proxy.type
        })
      })

      const data = await response.json()
      const responseTime = Date.now() - startTime

      return {
        id: proxy.id,
        success: data.success,
        ping: data.ping,
        speed: data.speed,
        error: data.error,
        timestamp: new Date().toISOString(),
        responseTime
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        id: proxy.id,
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        timestamp: new Date().toISOString(),
        responseTime
      }
    }
  }

  const calculateStats = () => {
    const results = Object.values(testResults)
    const totalTests = results.length
    const successfulTests = results.filter(r => r.success).length
    const failedTests = totalTests - successfulTests
    const successfulResults = results.filter(r => r.success && r.ping)
    const averagePing = successfulResults.length > 0 
      ? successfulResults.reduce((sum, r) => sum + (r.ping || 0), 0) / successfulResults.length 
      : 0
    const averageSpeed = successfulResults.length > 0 
      ? successfulResults.reduce((sum, r) => sum + (r.speed || 0), 0) / successfulResults.length 
      : 0

    setStats({
      totalTests,
      successfulTests,
      failedTests,
      averagePing: Math.round(averagePing),
      averageSpeed: Math.round(averageSpeed)
    })
  }

  const getStatusIcon = (proxyId: number) => {
    if (currentTest === proxyId) {
      return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
    }
    if (testQueue.includes(proxyId)) {
      return <Clock className="h-4 w-4 text-yellow-500" />
    }
    const result = testResults[proxyId]
    if (!result) return <Square className="h-4 w-4 text-gray-400" />
    return result.success 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusText = (proxyId: number) => {
    if (currentTest === proxyId) return 'Đang test...'
    if (testQueue.includes(proxyId)) return 'Chờ test...'
    const result = testResults[proxyId]
    if (!result) return 'Chưa test'
    return result.success ? 'Thành công' : 'Thất bại'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Test Real-time</h2>
          <p className="text-gray-600">Test proxy tự động theo chu kỳ</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`btn ${isRunning ? 'btn-secondary' : 'btn-primary'}`}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Dừng
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Bắt đầu
              </>
            )}
          </button>
          <button
            onClick={() => {
              setTestResults({})
              setTestQueue([])
              setCurrentTest(null)
              testCountRef.current = 0
            }}
            className="btn btn-outline"
          >
            <Square className="h-4 w-4 mr-2" />
            Reset
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Zap className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Tổng test</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalTests}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Thành công</p>
              <p className="text-xl font-bold text-gray-900">{stats.successfulTests}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Thất bại</p>
              <p className="text-xl font-bold text-gray-900">{stats.failedTests}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Ping TB</p>
              <p className="text-xl font-bold text-gray-900">{stats.averagePing}ms</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-purple-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Tốc độ TB</p>
              <p className="text-xl font-bold text-gray-900">{stats.averageSpeed} KB/s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt Test</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chu kỳ test (giây)
            </label>
            <input
              type="number"
              value={testSettings.interval / 1000}
              onChange={(e) => setTestSettings(prev => ({
                ...prev,
                interval: parseInt(e.target.value) * 1000
              }))}
              className="input"
              min="10"
              max="300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timeout (giây)
            </label>
            <input
              type="number"
              value={testSettings.timeout / 1000}
              onChange={(e) => setTestSettings(prev => ({
                ...prev,
                timeout: parseInt(e.target.value) * 1000
              }))}
              className="input"
              min="5"
              max="60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test đồng thời
            </label>
            <input
              type="number"
              value={testSettings.maxConcurrent}
              onChange={(e) => setTestSettings(prev => ({
                ...prev,
                maxConcurrent: parseInt(e.target.value)
              }))}
              className="input"
              min="1"
              max="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lần retry
            </label>
            <input
              type="number"
              value={testSettings.retryCount}
              onChange={(e) => setTestSettings(prev => ({
                ...prev,
                retryCount: parseInt(e.target.value)
              }))}
              className="input"
              min="0"
              max="5"
            />
          </div>
        </div>
      </div>

      {/* Proxy List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Danh sách Proxy</h3>
            <span className="text-sm text-gray-500">
              Tổng: {proxies.length} proxy
            </span>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <div className="divide-y divide-gray-200">
            {proxies.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <div className="text-gray-400 mb-2">
                  <Globe className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-500">Chưa có proxy nào</p>
                <p className="text-sm text-gray-400">Thêm proxy để bắt đầu test real-time</p>
              </div>
            ) : (
              proxies.map((proxy) => {
                const result = testResults[proxy.id]
                return (
                  <div key={proxy.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(proxy.id)}
                      <div>
                        <p className="font-medium text-gray-900">{proxy.host}:{proxy.port}</p>
                        <p className="text-sm text-gray-600">{proxy.type} - {getStatusText(proxy.id)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {result && (
                        <>
                          {result.ping && (
                            <div className="text-center">
                              <span className="text-sm font-medium text-gray-900">{result.ping}ms</span>
                              <p className="text-xs text-gray-500">Ping</p>
                            </div>
                          )}
                          {result.speed && (
                            <div className="text-center">
                              <span className="text-sm font-medium text-gray-900">{result.speed} KB/s</span>
                              <p className="text-xs text-gray-500">Speed</p>
                            </div>
                          )}
                          <div className="text-center">
                            <span className="text-xs text-gray-500">
                              {new Date(result.timestamp).toLocaleTimeString('vi-VN')}
                            </span>
                            <p className="text-xs text-gray-400">Lần cuối</p>
                          </div>
                        </>
                      )}
                      {currentTest === proxy.id && (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          <span className="text-xs text-blue-600 font-medium">Testing...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
