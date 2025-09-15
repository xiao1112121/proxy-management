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
  Settings,
  ChevronDown
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import TestUrlSelector from './TestUrlSelector'

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
  const [testUrl, setTestUrl] = useState('https://www.instagram.com/')
  const [showUrlSelector, setShowUrlSelector] = useState(false)
  const [urlSelectorPosition, setUrlSelectorPosition] = useState<{ x: number; y: number } | null>(null)
  const [stats, setStats] = useState({
    totalTests: 0,
    successfulTests: 0,
    failedTests: 0,
    averagePing: 0,
    averageSpeed: 0
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const testCountRef = useRef(0)

  // URL selector handlers
  const handleUrlSelect = (url: string) => {
    setTestUrl(url)
    setShowUrlSelector(false)
  }

  const handleUrlSelectorClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setUrlSelectorPosition({
      x: rect.left,
      y: rect.bottom + 5
    })
    setShowUrlSelector(true)
  }

  const handleCloseUrlSelector = () => {
    setShowUrlSelector(false)
  }

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
    console.log('startTesting called, intervalRef.current:', intervalRef.current)
    if (intervalRef.current) return
    
    console.log('Starting tests with interval:', testSettings.interval)
    // Initial test
    runTests()
    
    // Set up interval
    intervalRef.current = setInterval(() => {
      console.log('Interval triggered, running tests...')
      runTests()
    }, testSettings.interval)
  }

  const stopTesting = () => {
    console.log('stopTesting called, intervalRef.current:', intervalRef.current)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      console.log('Interval cleared')
    }
    setCurrentTest(null)
  }

  const runTests = async () => {
    // Test all proxies, not just alive ones
    const allProxies = proxies.filter(p => p.host && p.port)
    const shuffledProxies = [...allProxies].sort(() => Math.random() - 0.5)
    
    // Limit concurrent tests
    const proxiesToTest = shuffledProxies.slice(0, testSettings.maxConcurrent)
    
    console.log('Running tests for proxies:', proxiesToTest.map(p => `${p.host}:${p.port}`))
    
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
          type: proxy.type,
          testUrl: testUrl
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
          {isRunning && (
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Đang chạy...</span>
              {currentTest && (
                <span className="text-sm text-blue-600">
                  (Testing proxy ID: {currentTest})
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* URL Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">URL Test:</label>
            <button
              onClick={handleUrlSelectorClick}
              className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Globe className="h-4 w-4" />
              <span className="max-w-xs truncate">
                {testUrl === 'https://www.instagram.com/' ? 'Instagram' : 
                 testUrl === 'https://web.telegram.org/' ? 'Telegram' :
                 testUrl === 'https://www.facebook.com/' ? 'Facebook' :
                 testUrl === 'https://twitter.com/' ? 'Twitter' :
                 testUrl === 'https://www.youtube.com/' ? 'YouTube' :
                 testUrl}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => {
                console.log('Button clicked! Current isRunning:', isRunning)
                setIsRunning(!isRunning)
              }}
              className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg ${
                isRunning 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Dừng</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Bắt đầu</span>
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
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              <Square className="h-4 w-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Zap className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng Tests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Thành công</p>
              <p className="text-2xl font-bold text-green-600">{stats.successfulTests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Thất bại</p>
              <p className="text-2xl font-bold text-red-600">{stats.failedTests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Ping TB</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averagePing}ms</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-purple-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Tốc độ TB</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageSpeed}ms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Proxy List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Danh sách Proxy ({proxies.length})</h3>
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {proxies.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có proxy nào để test</p>
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
                  <div className="text-right">
                    {result && (
                      <>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {result.ping && (
                            <span>Ping: {result.ping}ms</span>
                          )}
                          {result.speed && (
                            <span>Speed: {result.speed}ms</span>
                          )}
                          {result.responseTime && (
                            <span>Response: {result.responseTime}ms</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          <span>
                            {new Date(result.timestamp).toLocaleTimeString()}
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

      {/* URL Selector Modal */}
      {showUrlSelector && (
        <TestUrlSelector
          onUrlSelect={handleUrlSelect}
          onClose={handleCloseUrlSelector}
          position={urlSelectorPosition || undefined}
        />
      )}
    </div>
  )
}