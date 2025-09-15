'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { SimpleProxy as Proxy } from '@/types/proxy'

export interface TestScenario {
  id: string
  name: string
  description: string
  category: 'basic' | 'performance' | 'security' | 'reliability' | 'custom'
  tests: TestStep[]
  timeout: number
  retries: number
  parallel: boolean
  tags: string[]
  createdAt: number
  isDefault: boolean
}

export interface TestStep {
  id: string
  name: string
  type: 'http' | 'https' | 'socks' | 'ping' | 'dns' | 'custom'
  config: {
    url?: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    headers?: Record<string, string>
    body?: string
    expectedStatus?: number[]
    expectedContent?: string
    timeout?: number
    validateSSL?: boolean
    followRedirects?: boolean
    customScript?: string
  }
  weight: number
  critical: boolean
}

export interface TestResult {
  proxyId: number
  scenarioId: string
  stepId: string
  success: boolean
  responseTime: number
  statusCode?: number
  error?: string
  timestamp: number
  metrics: {
    connectTime: number
    dnsTime: number
    downloadTime: number
    uploadTime: number
    totalTime: number
    bytesReceived: number
    bytesSent: number
  }
}

export interface BenchmarkResult {
  id: string
  proxyId: number
  scenarioId: string
  startTime: number
  endTime: number
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  throughput: number
  errorRate: number
  availability: number
  reliability: number
  performanceScore: number
  results: TestResult[]
}

export interface LoadTestConfig {
  duration: number // seconds
  concurrency: number
  rampUpTime: number
  targetRPS: number
  scenarios: string[]
}

const DEFAULT_SCENARIOS: TestScenario[] = [
  {
    id: 'basic-connectivity',
    name: 'Basic Connectivity Test',
    description: 'Tests basic HTTP/HTTPS connectivity',
    category: 'basic',
    tests: [
      {
        id: 'http-get',
        name: 'HTTP GET Request',
        type: 'http',
        config: {
          url: 'http://httpbin.org/ip',
          method: 'GET',
          expectedStatus: [200],
          timeout: 10000
        },
        weight: 1,
        critical: true
      },
      {
        id: 'https-get',
        name: 'HTTPS GET Request',
        type: 'https',
        config: {
          url: 'https://httpbin.org/ip',
          method: 'GET',
          expectedStatus: [200],
          validateSSL: true,
          timeout: 10000
        },
        weight: 1,
        critical: true
      }
    ],
    timeout: 30000,
    retries: 2,
    parallel: false,
    tags: ['connectivity', 'basic'],
    createdAt: Date.now(),
    isDefault: true
  },
  {
    id: 'performance-benchmark',
    name: 'Performance Benchmark',
    description: 'Comprehensive performance testing',
    category: 'performance',
    tests: [
      {
        id: 'speed-test',
        name: 'Download Speed Test',
        type: 'http',
        config: {
          url: 'http://speedtest.ftp.otenet.gr/files/test1Mb.db',
          method: 'GET',
          timeout: 30000
        },
        weight: 2,
        critical: false
      },
      {
        id: 'latency-test',
        name: 'Latency Test',
        type: 'ping',
        config: {
          url: '8.8.8.8',
          timeout: 5000
        },
        weight: 1,
        critical: false
      }
    ],
    timeout: 60000,
    retries: 1,
    parallel: true,
    tags: ['performance', 'speed'],
    createdAt: Date.now(),
    isDefault: true
  },
  {
    id: 'security-check',
    name: 'Security Validation',
    description: 'Tests proxy security and anonymity',
    category: 'security',
    tests: [
      {
        id: 'ip-leak-test',
        name: 'IP Leak Detection',
        type: 'http',
        config: {
          url: 'https://api.ipify.org?format=json',
          method: 'GET',
          expectedStatus: [200],
          timeout: 10000
        },
        weight: 3,
        critical: true
      },
      {
        id: 'dns-leak-test',
        name: 'DNS Leak Test',
        type: 'dns',
        config: {
          url: 'google.com',
          timeout: 5000
        },
        weight: 2,
        critical: false
      }
    ],
    timeout: 30000,
    retries: 1,
    parallel: false,
    tags: ['security', 'anonymity'],
    createdAt: Date.now(),
    isDefault: true
  }
]

export function useAdvancedTesting() {
  const [scenarios, setScenarios] = useState<TestScenario[]>(DEFAULT_SCENARIOS)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const abortControllerRef = useRef<AbortController | null>(null)
  const workerRef = useRef<Worker | null>(null)

  // Simulate proxy test (in real implementation, this would make actual HTTP requests)
  const simulateProxyTest = useCallback(async (
    proxy: Proxy, 
    step: TestStep, 
    signal?: AbortSignal
  ): Promise<TestResult> => {
    const startTime = Date.now()
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500))
    
    if (signal?.aborted) {
      throw new Error('Test aborted')
    }

    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    // Simulate success/failure based on proxy status
    const success = Math.random() > (proxy.status === 'dead' ? 0.8 : 0.1)
    
    return {
      proxyId: proxy.id,
      scenarioId: '',
      stepId: step.id,
      success,
      responseTime,
      statusCode: success ? 200 : 500,
      error: success ? undefined : 'Connection failed',
      timestamp: Date.now(),
      metrics: {
        connectTime: Math.random() * 200,
        dnsTime: Math.random() * 100,
        downloadTime: responseTime * 0.7,
        uploadTime: Math.random() * 50,
        totalTime: responseTime,
        bytesReceived: Math.random() * 10000,
        bytesSent: Math.random() * 1000
      }
    }
  }, [])

  // Run single test scenario
  const runTestScenario = useCallback(async (
    proxy: Proxy,
    scenario: TestScenario,
    signal?: AbortSignal
  ): Promise<BenchmarkResult> => {
    const startTime = Date.now()
    const results: TestResult[] = []

    setCurrentTest(`${scenario.name} - ${proxy.host}:${proxy.port}`)

    try {
      if (scenario.parallel) {
        // Run tests in parallel
        const promises = scenario.tests.map(step => 
          simulateProxyTest(proxy, step, signal)
        )
        const parallelResults = await Promise.allSettled(promises)
        
        parallelResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push({ ...result.value, scenarioId: scenario.id })
          } else {
            results.push({
              proxyId: proxy.id,
              scenarioId: scenario.id,
              stepId: scenario.tests[index].id,
              success: false,
              responseTime: 0,
              error: result.reason?.message || 'Test failed',
              timestamp: Date.now(),
              metrics: {
                connectTime: 0,
                dnsTime: 0,
                downloadTime: 0,
                uploadTime: 0,
                totalTime: 0,
                bytesReceived: 0,
                bytesSent: 0
              }
            })
          }
        })
      } else {
        // Run tests sequentially
        for (const step of scenario.tests) {
          if (signal?.aborted) break
          
          try {
            const result = await simulateProxyTest(proxy, step, signal)
            results.push({ ...result, scenarioId: scenario.id })
          } catch (error) {
            results.push({
              proxyId: proxy.id,
              scenarioId: scenario.id,
              stepId: step.id,
              success: false,
              responseTime: 0,
              error: error instanceof Error ? error.message : 'Test failed',
              timestamp: Date.now(),
              metrics: {
                connectTime: 0,
                dnsTime: 0,
                downloadTime: 0,
                uploadTime: 0,
                totalTime: 0,
                bytesReceived: 0,
                bytesSent: 0
              }
            })
          }
        }
      }

      const endTime = Date.now()
      const successfulRequests = results.filter(r => r.success).length
      const failedRequests = results.length - successfulRequests
      const responseTimes = results.filter(r => r.success).map(r => r.responseTime)
      
      const benchmarkResult: BenchmarkResult = {
        id: `bench_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        proxyId: proxy.id,
        scenarioId: scenario.id,
        startTime,
        endTime,
        totalRequests: results.length,
        successfulRequests,
        failedRequests,
        averageResponseTime: responseTimes.length > 0 
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
          : 0,
        minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
        maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
        throughput: successfulRequests / ((endTime - startTime) / 1000),
        errorRate: failedRequests / results.length,
        availability: successfulRequests / results.length,
        reliability: results.filter(r => r.success && r.responseTime < 5000).length / results.length,
        performanceScore: 0, // Will be calculated
        results
      }

      // Calculate performance score (0-100)
      const availabilityScore = benchmarkResult.availability * 40
      const speedScore = Math.max(0, (5000 - benchmarkResult.averageResponseTime) / 5000) * 30
      const reliabilityScore = benchmarkResult.reliability * 30
      benchmarkResult.performanceScore = availabilityScore + speedScore + reliabilityScore

      return benchmarkResult

    } catch (error) {
      throw new Error(`Test scenario failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [simulateProxyTest])

  // Run tests on multiple proxies
  const runBulkTest = useCallback(async (
    proxies: Proxy[],
    scenarioIds: string[],
    onProgress?: (current: number, total: number) => void
  ): Promise<BenchmarkResult[]> => {
    setIsRunning(true)
    setProgress(0)
    
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const selectedScenarios = scenarios.filter(s => scenarioIds.includes(s.id))
      const totalTests = proxies.length * selectedScenarios.length
      let completedTests = 0
      const allResults: BenchmarkResult[] = []

      for (const proxy of proxies) {
        if (abortController.signal.aborted) break

        for (const scenario of selectedScenarios) {
          if (abortController.signal.aborted) break

          try {
            const result = await runTestScenario(proxy, scenario, abortController.signal)
            allResults.push(result)
            
            // Store individual test results
            setTestResults(prev => [...prev, ...result.results])
          } catch (error) {
            console.error(`Test failed for proxy ${proxy.host}:${proxy.port}:`, error)
          }

          completedTests++
          const progressPercent = (completedTests / totalTests) * 100
          setProgress(progressPercent)
          onProgress?.(completedTests, totalTests)
        }
      }

      setBenchmarkResults(prev => [...prev, ...allResults])
      return allResults

    } finally {
      setIsRunning(false)
      setCurrentTest(null)
      setProgress(0)
      abortControllerRef.current = null
    }
  }, [scenarios, runTestScenario])

  // Load test with sustained traffic
  const runLoadTest = useCallback(async (
    proxy: Proxy,
    scenario: TestScenario,
    config: LoadTestConfig,
    onProgress?: (metrics: any) => void
  ): Promise<BenchmarkResult> => {
    setIsRunning(true)
    
    const startTime = Date.now()
    const endTime = startTime + (config.duration * 1000)
    const results: TestResult[] = []
    let activeRequests = 0
    const maxConcurrency = config.concurrency

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const runSingleRequest = async (): Promise<void> => {
        if (abortController.signal.aborted || Date.now() >= endTime) return
        
        activeRequests++
        try {
          const step = scenario.tests[Math.floor(Math.random() * scenario.tests.length)]
          const result = await simulateProxyTest(proxy, step, abortController.signal)
          results.push({ ...result, scenarioId: scenario.id })
        } catch (error) {
          // Handle individual request errors
        } finally {
          activeRequests--
        }
      }

      // Start initial requests
      const initialPromises: Promise<void>[] = []
      for (let i = 0; i < Math.min(maxConcurrency, config.targetRPS); i++) {
        initialPromises.push(runSingleRequest())
      }

      // Continue generating requests until duration ends
      const interval = setInterval(() => {
        if (abortController.signal.aborted || Date.now() >= endTime) {
          clearInterval(interval)
          return
        }

        // Maintain target RPS while respecting concurrency limits
        const requestsNeeded = Math.min(
          config.targetRPS - activeRequests,
          maxConcurrency - activeRequests
        )

        for (let i = 0; i < requestsNeeded; i++) {
          runSingleRequest()
        }

        // Report progress
        const elapsed = (Date.now() - startTime) / 1000
        const currentRPS = results.length / elapsed
        onProgress?.({
          elapsed,
          totalRequests: results.length,
          currentRPS,
          activeRequests,
          successRate: results.filter(r => r.success).length / results.length
        })
      }, 1000 / config.targetRPS)

      // Wait for test duration
      await new Promise(resolve => setTimeout(resolve, config.duration * 1000))
      clearInterval(interval)

      // Wait for remaining requests to complete
      while (activeRequests > 0 && !abortController.signal.aborted) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Calculate final metrics
      const actualEndTime = Date.now()
      const successfulRequests = results.filter(r => r.success).length
      const responseTimes = results.filter(r => r.success).map(r => r.responseTime)

      const benchmarkResult: BenchmarkResult = {
        id: `load_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        proxyId: proxy.id,
        scenarioId: scenario.id,
        startTime,
        endTime: actualEndTime,
        totalRequests: results.length,
        successfulRequests,
        failedRequests: results.length - successfulRequests,
        averageResponseTime: responseTimes.length > 0 
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
          : 0,
        minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
        maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
        throughput: results.length / ((actualEndTime - startTime) / 1000),
        errorRate: (results.length - successfulRequests) / results.length,
        availability: successfulRequests / results.length,
        reliability: results.filter(r => r.success && r.responseTime < 5000).length / results.length,
        performanceScore: 0,
        results
      }

      // Calculate performance score
      const availabilityScore = benchmarkResult.availability * 40
      const speedScore = Math.max(0, (5000 - benchmarkResult.averageResponseTime) / 5000) * 30
      const reliabilityScore = benchmarkResult.reliability * 30
      benchmarkResult.performanceScore = availabilityScore + speedScore + reliabilityScore

      setBenchmarkResults(prev => [...prev, benchmarkResult])
      setTestResults(prev => [...prev, ...results])

      return benchmarkResult

    } finally {
      setIsRunning(false)
      setCurrentTest(null)
      abortControllerRef.current = null
    }
  }, [simulateProxyTest])

  // Cancel running tests
  const cancelTests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // Add custom test scenario
  const addTestScenario = useCallback((scenario: Omit<TestScenario, 'id' | 'createdAt'>) => {
    const newScenario: TestScenario = {
      ...scenario,
      id: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now()
    }
    setScenarios(prev => [...prev, newScenario])
    return newScenario
  }, [])

  // Get test statistics
  const getTestStatistics = useCallback(() => {
    const recentResults = testResults.filter(r => 
      Date.now() - r.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    )

    const successfulTests = recentResults.filter(r => r.success).length
    const totalTests = recentResults.length
    const averageResponseTime = recentResults.length > 0
      ? recentResults.reduce((sum, r) => sum + r.responseTime, 0) / recentResults.length
      : 0

    const proxyStats = new Map<number, {
      tests: number
      successes: number
      avgResponseTime: number
      lastTested: number
    }>()

    recentResults.forEach(result => {
      const current = proxyStats.get(result.proxyId) || {
        tests: 0,
        successes: 0,
        avgResponseTime: 0,
        lastTested: 0
      }
      
      current.tests++
      if (result.success) current.successes++
      current.avgResponseTime = (current.avgResponseTime * (current.tests - 1) + result.responseTime) / current.tests
      current.lastTested = Math.max(current.lastTested, result.timestamp)
      
      proxyStats.set(result.proxyId, current)
    })

    return {
      totalTests,
      successfulTests,
      successRate: totalTests > 0 ? successfulTests / totalTests : 0,
      averageResponseTime,
      proxyStats,
      scenarioStats: scenarios.map(scenario => ({
        id: scenario.id,
        name: scenario.name,
        tests: recentResults.filter(r => r.scenarioId === scenario.id).length,
        successes: recentResults.filter(r => r.scenarioId === scenario.id && r.success).length
      }))
    }
  }, [testResults, scenarios])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])

  return {
    // State
    scenarios,
    testResults,
    benchmarkResults,
    isRunning,
    currentTest,
    progress,
    
    // Actions
    runTestScenario,
    runBulkTest,
    runLoadTest,
    cancelTests,
    addTestScenario,
    getTestStatistics,
    
    // Utilities
    setScenarios,
    setTestResults: (results: TestResult[]) => setTestResults(results),
    setBenchmarkResults: (results: BenchmarkResult[]) => setBenchmarkResults(results)
  }
}
