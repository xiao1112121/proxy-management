'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Zap,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Download,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { BenchmarkResult, LoadTestConfig, useAdvancedTesting } from '@/hooks/useAdvancedTesting'
import { LoadingButton, ProgressBar, StatusIndicator } from './LoadingStates'
import Tooltip from './Tooltip'

interface PerformanceBenchmarkProps {
  proxies: Proxy[]
  selectedProxies: number[]
}

export default function PerformanceBenchmark({ proxies, selectedProxies }: PerformanceBenchmarkProps) {
  const [activeTab, setActiveTab] = useState<'benchmark' | 'load-test' | 'results'>('benchmark')
  const [selectedProxy, setSelectedProxy] = useState<number | null>(null)
  const [loadTestConfig, setLoadTestConfig] = useState<LoadTestConfig>({
    duration: 60, // seconds
    concurrency: 10,
    rampUpTime: 10,
    targetRPS: 5,
    scenarios: []
  })
  const [isLoadTesting, setIsLoadTesting] = useState(false)
  const [loadTestProgress, setLoadTestProgress] = useState<any>(null)

  const {
    scenarios,
    benchmarkResults,
    isRunning,
    progress,
    runBulkTest,
    runLoadTest,
    cancelTests
  } = useAdvancedTesting()

  // Get available proxies for testing
  const availableProxies = proxies.filter(p => 
    selectedProxies.length === 0 || selectedProxies.includes(p.id)
  )

  useEffect(() => {
    if (availableProxies.length > 0 && !selectedProxy) {
      setSelectedProxy(availableProxies[0].id)
    }
  }, [availableProxies, selectedProxy])

  const handleBenchmarkTest = async () => {
    const scenarioIds = scenarios.filter(s => s.category === 'performance').map(s => s.id)
    if (scenarioIds.length === 0) {
      alert('No performance scenarios available')
      return
    }

    await runBulkTest(availableProxies, scenarioIds)
  }

  const handleLoadTest = async () => {
    if (!selectedProxy) {
      alert('Please select a proxy for load testing')
      return
    }

    const proxy = proxies.find(p => p.id === selectedProxy)
    const scenario = scenarios.find(s => loadTestConfig.scenarios.includes(s.id))
    
    if (!proxy || !scenario) {
      alert('Invalid proxy or scenario selection')
      return
    }

    setIsLoadTesting(true)
    try {
      await runLoadTest(proxy, scenario, loadTestConfig, setLoadTestProgress)
    } finally {
      setIsLoadTesting(false)
      setLoadTestProgress(null)
    }
  }

  const getProxyBenchmarks = (proxyId: number) => {
    return benchmarkResults.filter(r => r.proxyId === proxyId)
  }

  const getOverallStats = () => {
    if (benchmarkResults.length === 0) {
      return {
        avgPerformanceScore: 0,
        avgResponseTime: 0,
        avgThroughput: 0,
        avgAvailability: 0,
        totalTests: 0
      }
    }

    const totalTests = benchmarkResults.reduce((sum, r) => sum + r.totalRequests, 0)
    const avgPerformanceScore = benchmarkResults.reduce((sum, r) => sum + r.performanceScore, 0) / benchmarkResults.length
    const avgResponseTime = benchmarkResults.reduce((sum, r) => sum + r.averageResponseTime, 0) / benchmarkResults.length
    const avgThroughput = benchmarkResults.reduce((sum, r) => sum + r.throughput, 0) / benchmarkResults.length
    const avgAvailability = benchmarkResults.reduce((sum, r) => sum + r.availability, 0) / benchmarkResults.length

    return {
      avgPerformanceScore,
      avgResponseTime,
      avgThroughput,
      avgAvailability,
      totalTests
    }
  }

  const stats = getOverallStats()

  const getPerformanceGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600 bg-green-100' }
    if (score >= 80) return { grade: 'A', color: 'text-green-600 bg-green-100' }
    if (score >= 70) return { grade: 'B', color: 'text-blue-600 bg-blue-100' }
    if (score >= 60) return { grade: 'C', color: 'text-yellow-600 bg-yellow-100' }
    if (score >= 50) return { grade: 'D', color: 'text-orange-600 bg-orange-100' }
    return { grade: 'F', color: 'text-red-600 bg-red-100' }
  }

  const exportResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      summary: stats,
      results: benchmarkResults.map(result => ({
        proxy: proxies.find(p => p.id === result.proxyId),
        benchmark: result
      }))
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `benchmark-results-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const tabs = [
    { id: 'benchmark' as const, name: 'Quick Benchmark', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'load-test' as const, name: 'Load Testing', icon: <Activity className="h-4 w-4" /> },
    { id: 'results' as const, name: 'Results & Analysis', icon: <TrendingUp className="h-4 w-4" /> }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <span>Performance Benchmark</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive performance testing and analysis
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {benchmarkResults.length > 0 && (
            <LoadingButton onClick={exportResults} variant="secondary">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </LoadingButton>
          )}

          {isRunning && (
            <LoadingButton onClick={cancelTests} variant="danger">
              <Pause className="h-4 w-4 mr-2" />
              Cancel Tests
            </LoadingButton>
          )}
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Overall Score</span>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <div className="text-2xl font-bold text-gray-900">
              {stats.avgPerformanceScore.toFixed(1)}
            </div>
            <span className={`px-2 py-1 rounded text-xs font-bold ${getPerformanceGrade(stats.avgPerformanceScore).color}`}>
              {getPerformanceGrade(stats.avgPerformanceScore).grade}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Avg Response</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {stats.avgResponseTime.toFixed(0)}ms
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Throughput</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {stats.avgThroughput.toFixed(1)} RPS
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">Availability</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {(stats.avgAvailability * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-gray-700">Total Tests</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.totalTests}</div>
        </div>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Running Performance Tests...</span>
            <span className="text-sm text-gray-500">{progress.toFixed(1)}%</span>
          </div>
          <ProgressBar progress={progress} color="blue" animated={true} />
        </div>
      )}

      {/* Load Test Progress */}
      {isLoadTesting && loadTestProgress && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{loadTestProgress.elapsed.toFixed(1)}s</div>
              <div className="text-xs text-gray-500">Elapsed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{loadTestProgress.totalRequests}</div>
              <div className="text-xs text-gray-500">Requests</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">{loadTestProgress.currentRPS.toFixed(1)}</div>
              <div className="text-xs text-gray-500">Current RPS</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{(loadTestProgress.successRate * 100).toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Success Rate</div>
            </div>
          </div>
          <ProgressBar 
            progress={(loadTestProgress.elapsed / loadTestConfig.duration) * 100} 
            color="green" 
            animated={true} 
          />
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Quick Benchmark Tab */}
          {activeTab === 'benchmark' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Quick Performance Benchmark</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Run standardized performance tests on selected proxies
                  </p>
                </div>
                <LoadingButton
                  onClick={handleBenchmarkTest}
                  disabled={availableProxies.length === 0}
                  isLoading={isRunning}
                  variant="primary"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Benchmark
                </LoadingButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Test Configuration</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Proxies to test:</span>
                      <span className="font-medium">{availableProxies.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Test scenarios:</span>
                      <span className="font-medium">Performance suite</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated time:</span>
                      <span className="font-medium">~{(availableProxies.length * 2).toFixed(0)} minutes</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">What We Test</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Connection speed & latency</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Throughput & bandwidth</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Reliability & stability</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Error rates & availability</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Load Test Tab */}
          {activeTab === 'load-test' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Advanced Load Testing</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Simulate sustained load to test proxy performance under stress
                  </p>
                </div>
                <LoadingButton
                  onClick={handleLoadTest}
                  disabled={!selectedProxy || loadTestConfig.scenarios.length === 0}
                  isLoading={isLoadTesting}
                  variant="primary"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Load Test
                </LoadingButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Configuration */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">Test Configuration</h5>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Proxy
                    </label>
                    <select
                      value={selectedProxy || ''}
                      onChange={(e) => setSelectedProxy(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">Select a proxy...</option>
                      {availableProxies.map(proxy => (
                        <option key={proxy.id} value={proxy.id}>
                          {proxy.host}:{proxy.port}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (seconds)
                      </label>
                      <input
                        type="number"
                        value={loadTestConfig.duration}
                        onChange={(e) => setLoadTestConfig(prev => ({
                          ...prev,
                          duration: Number(e.target.value)
                        }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        min="10"
                        max="3600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Concurrency
                      </label>
                      <input
                        type="number"
                        value={loadTestConfig.concurrency}
                        onChange={(e) => setLoadTestConfig(prev => ({
                          ...prev,
                          concurrency: Number(e.target.value)
                        }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target RPS
                      </label>
                      <input
                        type="number"
                        value={loadTestConfig.targetRPS}
                        onChange={(e) => setLoadTestConfig(prev => ({
                          ...prev,
                          targetRPS: Number(e.target.value)
                        }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        min="1"
                        max="100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ramp-up Time (s)
                      </label>
                      <input
                        type="number"
                        value={loadTestConfig.rampUpTime}
                        onChange={(e) => setLoadTestConfig(prev => ({
                          ...prev,
                          rampUpTime: Number(e.target.value)
                        }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        min="0"
                        max="300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Scenarios
                    </label>
                    <select
                      multiple
                      value={loadTestConfig.scenarios}
                      onChange={(e) => setLoadTestConfig(prev => ({
                        ...prev,
                        scenarios: Array.from(e.target.selectedOptions, option => option.value)
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      size={3}
                    >
                      {scenarios.map(scenario => (
                        <option key={scenario.id} value={scenario.id}>
                          {scenario.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Test Preview</h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total requests:</span>
                      <span className="font-medium">
                        ~{(loadTestConfig.duration * loadTestConfig.targetRPS).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peak concurrency:</span>
                      <span className="font-medium">{loadTestConfig.concurrency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Test duration:</span>
                      <span className="font-medium">{loadTestConfig.duration}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Scenarios:</span>
                      <span className="font-medium">{loadTestConfig.scenarios.length}</span>
                    </div>
                  </div>

                  {loadTestConfig.scenarios.length === 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-700">
                        Please select at least one test scenario
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Test Results & Analysis</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Detailed performance analysis and comparisons
                  </p>
                </div>
              </div>

              {benchmarkResults.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2 text-gray-900">No benchmark results yet</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Run performance tests to see detailed analysis here
                  </p>
                  <LoadingButton onClick={() => setActiveTab('benchmark')} variant="primary">
                    Run First Benchmark
                  </LoadingButton>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {availableProxies.map(proxy => {
                    const proxyBenchmarks = getProxyBenchmarks(proxy.id)
                    if (proxyBenchmarks.length === 0) return null

                    const latestBenchmark = proxyBenchmarks[proxyBenchmarks.length - 1]
                    const grade = getPerformanceGrade(latestBenchmark.performanceScore)

                    return (
                      <div key={proxy.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {proxy.host}:{proxy.port}
                            </h5>
                            <p className="text-sm text-gray-600">{proxy.country}</p>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold px-3 py-1 rounded ${grade.color}`}>
                              {grade.grade}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {latestBenchmark.performanceScore.toFixed(1)}/100
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Response Time:</span>
                            <div className="font-medium">{latestBenchmark.averageResponseTime.toFixed(0)}ms</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Throughput:</span>
                            <div className="font-medium">{latestBenchmark.throughput.toFixed(1)} RPS</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Availability:</span>
                            <div className="font-medium">{(latestBenchmark.availability * 100).toFixed(1)}%</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Error Rate:</span>
                            <div className="font-medium">{(latestBenchmark.errorRate * 100).toFixed(1)}%</div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Tests: {proxyBenchmarks.length}</span>
                            <span>
                              Last: {new Date(latestBenchmark.endTime).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
