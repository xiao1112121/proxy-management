'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Play, Pause, Square, Settings, Zap, Target, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface TestConfig {
  batchSize: number
  timeout: number
  retryAttempts: number
  testUrls: string[]
  enableGeolocation: boolean
  enableAnonymityTest: boolean
  enableSpeedTest: boolean
  enableDnsLeakTest: boolean
  enableWebRtcLeakTest: boolean
}

interface TestResult {
  proxyId: number
  success: boolean
  ping: number
  speed: number
  country?: string
  city?: string
  anonymity?: string
  dnsLeak?: boolean
  webrtcLeak?: boolean
  error?: string
  timestamp: number
}

interface SmartTestingEngineProps {
  proxies: Proxy[]
  onTestComplete: (results: TestResult[]) => void
  onProxyUpdate: (id: number, updates: Partial<Proxy>) => void
}

const DEFAULT_CONFIG: TestConfig = {
  batchSize: 10,
  timeout: 10000,
  retryAttempts: 2,
  testUrls: [
    'https://web.telegram.org/',
    'https://api.telegram.org/bot/getMe',
    'https://web.whatsapp.com/',
    'https://www.facebook.com/',
    'https://www.instagram.com/',
    'https://twitter.com/',
    'https://www.youtube.com/',
    'https://www.tiktok.com/'
  ],
  enableGeolocation: true,
  enableAnonymityTest: true,
  enableSpeedTest: true,
  enableDnsLeakTest: true,
  enableWebRtcLeakTest: false
}

export default function SmartTestingEngine({
  proxies,
  onTestComplete,
  onProxyUpdate
}: SmartTestingEngineProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [config, setConfig] = useState<TestConfig>(DEFAULT_CONFIG)
  const [testQueue, setTestQueue] = useState<number[]>([])
  const [currentBatch, setCurrentBatch] = useState<number[]>([])
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [progress, setProgress] = useState({ completed: 0, total: 0 })
  const [stats, setStats] = useState({
    successRate: 0,
    averagePing: 0,
    averageSpeed: 0,
    countries: 0,
    anonymity: { transparent: 0, anonymous: 0, elite: 0 }
  })

  // Initialize test queue
  useEffect(() => {
    if (proxies.length > 0) {
      setTestQueue(proxies.map(p => p.id))
      setProgress({ completed: 0, total: proxies.length })
    }
  }, [proxies])

  // Process test queue
  const processQueue = useCallback(async () => {
    if (isPaused || testQueue.length === 0) return

    const batch = testQueue.slice(0, config.batchSize)
    setCurrentBatch(batch)
    setTestQueue(prev => prev.slice(config.batchSize))

    const batchResults: TestResult[] = []

    // Test each proxy in the batch
    for (const proxyId of batch) {
      const proxy = proxies.find(p => p.id === proxyId)
      if (!proxy) continue

      try {
        const result = await testSingleProxy(proxy)
        batchResults.push(result)
        
        // Update proxy status
        onProxyUpdate(proxyId, {
          status: result.success ? 'alive' : 'dead',
          ping: result.ping,
          speed: result.speed,
          country: result.country,
          city: result.city,
          anonymity: result.anonymity as 'transparent' | 'anonymous' | 'elite' | undefined,
          dnsLeak: result.dnsLeak,
          webrtcLeak: result.webrtcLeak,
          lastTested: new Date().toISOString()
        })

        setProgress(prev => ({
          ...prev,
          completed: prev.completed + 1
        }))

      } catch (error) {
        const errorResult: TestResult = {
          proxyId,
          success: false,
          ping: 0,
          speed: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        }
        batchResults.push(errorResult)
      }
    }

    setTestResults(prev => [...prev, ...batchResults])
    setCurrentBatch([])

    // Continue with next batch
    if (testQueue.length > config.batchSize) {
      setTimeout(processQueue, 1000) // 1 second delay between batches
    } else {
      setIsRunning(false)
      onTestComplete(batchResults)
    }
  }, [isPaused, testQueue, config, proxies, onProxyUpdate, onTestComplete])

  // Test single proxy
  const testSingleProxy = async (proxy: Proxy): Promise<TestResult> => {
    const startTime = Date.now()
    
    try {
      // Test basic connectivity
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
      const ping = Date.now() - startTime

      if (data.success) {
        // Additional tests if enabled
        let country, city, anonymity, dnsLeak, webrtcLeak

        if (config.enableGeolocation) {
          const geoData = await getGeolocation(data.publicIP)
          country = geoData.country
          city = geoData.city
        }

        if (config.enableAnonymityTest) {
          anonymity = await testAnonymity(proxy)
        }

        if (config.enableDnsLeakTest) {
          dnsLeak = await testDnsLeak(proxy)
        }

        if (config.enableWebRtcLeakTest) {
          webrtcLeak = await testWebRtcLeak(proxy)
        }

        return {
          proxyId: proxy.id,
          success: true,
          ping,
          speed: data.speed || 0,
          country,
          city,
          anonymity,
          dnsLeak,
          webrtcLeak,
          timestamp: Date.now()
        }
      } else {
        return {
          proxyId: proxy.id,
          success: false,
          ping,
          speed: 0,
          error: data.error,
          timestamp: Date.now()
        }
      }
    } catch (error) {
      return {
        proxyId: proxy.id,
        success: false,
        ping: Date.now() - startTime,
        speed: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
    }
  }

  // Additional test functions
  const getGeolocation = async (ip: string) => {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`)
      const data = await response.json()
      return { country: data.country_name, city: data.city }
    } catch {
      return { country: undefined, city: undefined }
    }
  }

  const testAnonymity = async (proxy: Proxy) => {
    // Simplified anonymity test
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
          testUrl: 'https://httpbin.org/headers'
        })
      })
      const data = await response.json()
      
      if (data.headers) {
        const suspiciousHeaders = ['X-Forwarded-For', 'X-Real-IP', 'Via']
        const hasSuspiciousHeaders = suspiciousHeaders.some(header => data.headers[header])
        return hasSuspiciousHeaders ? 'transparent' : 'elite'
      }
      return 'unknown'
    } catch {
      return 'unknown'
    }
  }

  const testDnsLeak = async (proxy: Proxy) => {
    // Simplified DNS leak test
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
          testUrl: 'https://dnsleaktest.com/api/v1/dnsleak'
        })
      })
      const data = await response.json()
      return data.dnsLeak || false
    } catch {
      return false
    }
  }

  const testWebRtcLeak = async (proxy: Proxy) => {
    // WebRTC leak test would require browser APIs
    return false
  }

  // Start testing
  const startTesting = useCallback(() => {
    setIsRunning(true)
    setIsPaused(false)
    processQueue()
  }, [processQueue])

  // Pause testing
  const pauseTesting = useCallback(() => {
    setIsPaused(true)
  }, [])

  // Resume testing
  const resumeTesting = useCallback(() => {
    setIsPaused(false)
    processQueue()
  }, [processQueue])

  // Stop testing
  const stopTesting = useCallback(() => {
    setIsRunning(false)
    setIsPaused(false)
    setCurrentBatch([])
  }, [])

  // Update stats
  useEffect(() => {
    if (testResults.length > 0) {
      const successful = testResults.filter(r => r.success)
      const successRate = (successful.length / testResults.length) * 100
      const averagePing = successful.reduce((sum, r) => sum + r.ping, 0) / successful.length || 0
      const averageSpeed = successful.reduce((sum, r) => sum + r.speed, 0) / successful.length || 0
      const countries = new Set(successful.map(r => r.country).filter(Boolean)).size
      
      const anonymity = successful.reduce((acc, r) => {
        if (r.anonymity) {
          acc[r.anonymity] = (acc[r.anonymity] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

      setStats({
        successRate: Math.round(successRate * 100) / 100,
        averagePing: Math.round(averagePing),
        averageSpeed: Math.round(averageSpeed),
        countries,
        anonymity: {
          transparent: anonymity.transparent || 0,
          anonymous: anonymity.anonymous || 0,
          elite: anonymity.elite || 0
        }
      })
    }
  }, [testResults])

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Smart Testing Engine
        </h3>
        <div className="flex items-center space-x-2">
          {!isRunning ? (
            <button
              onClick={startTesting}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Testing
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resumeTesting}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </button>
              ) : (
                <button
                  onClick={pauseTesting}
                  className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </button>
              )}
              <button
                onClick={stopTesting}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">
            {progress.completed} / {progress.total} ({Math.round((progress.completed / progress.total) * 100)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(progress.completed / progress.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Batch */}
      {currentBatch.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Currently Testing</h4>
          <div className="flex flex-wrap gap-2">
            {currentBatch.map(proxyId => {
              const proxy = proxies.find(p => p.id === proxyId)
              return (
                <div key={proxyId} className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  <Clock className="w-3 h-3 mr-1" />
                  {proxy?.host}:{proxy?.port}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.averagePing}ms</div>
          <div className="text-sm text-gray-600">Avg Ping</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.averageSpeed}ms</div>
          <div className="text-sm text-gray-600">Avg Speed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.countries}</div>
          <div className="text-sm text-gray-600">Countries</div>
        </div>
      </div>

      {/* Anonymity Stats */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Anonymity Distribution</h4>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Transparent: {stats.anonymity.transparent}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Anonymous: {stats.anonymity.anonymous}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Elite: {stats.anonymity.elite}</span>
          </div>
        </div>
      </div>

      {/* Recent Results */}
      {testResults.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Results</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {testResults.slice(-10).reverse().map((result, index) => {
              const proxy = proxies.find(p => p.id === result.proxyId)
              return (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm font-mono">
                      {proxy?.host}:{proxy?.port}
                    </span>
                    <span className="text-xs text-gray-500">
                      {result.ping}ms
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
