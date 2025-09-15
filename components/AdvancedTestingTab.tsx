'use client'

import { useState } from 'react'
import { 
  TestTube, 
  BarChart3, 
  Activity, 
  Target,
  Play,
  Pause,
  RotateCcw,
  Settings,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { useAdvancedTesting } from '@/hooks/useAdvancedTesting'
import TestScenarioManager from './TestScenarioManager'
import PerformanceBenchmark from './PerformanceBenchmark'
import { StatusIndicator, LoadingButton } from './LoadingStates'
import Tooltip from './Tooltip'

interface AdvancedTestingTabProps {
  proxies: Proxy[]
  selectedProxies: number[]
  onProxyUpdate: (id: number, updates: Partial<Proxy>) => void
}

export default function AdvancedTestingTab({ 
  proxies, 
  selectedProxies,
  onProxyUpdate 
}: AdvancedTestingTabProps) {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'benchmark' | 'monitoring'>('scenarios')

  const {
    scenarios,
    testResults,
    benchmarkResults,
    isRunning,
    currentTest,
    progress,
    runBulkTest,
    cancelTests,
    getTestStatistics
  } = useAdvancedTesting()

  const stats = getTestStatistics()

  const handleRunScenarios = async (scenarioIds: string[]) => {
    const proxiesToTest = selectedProxies.length > 0 
      ? proxies.filter(p => selectedProxies.includes(p.id))
      : proxies

    if (proxiesToTest.length === 0) {
      alert('No proxies selected for testing')
      return
    }

    await runBulkTest(proxiesToTest, scenarioIds, (current, total) => {
      // Progress callback - could be used for more detailed progress tracking
    })
  }

  const getTestingStatus = () => {
    if (isRunning) return 'running'
    if (testResults.length === 0) return 'idle'
    if (stats.successRate > 0.9) return 'excellent'
    if (stats.successRate > 0.7) return 'good'
    if (stats.successRate > 0.5) return 'warning'
    return 'poor'
  }

  const getStatusMessage = () => {
    const status = getTestingStatus()
    switch (status) {
      case 'running': return 'Tests in progress...'
      case 'idle': return 'Ready to test'
      case 'excellent': return 'Excellent performance'
      case 'good': return 'Good performance'
      case 'warning': return 'Some issues detected'
      case 'poor': return 'Performance issues'
      default: return 'Unknown status'
    }
  }

  const tabs = [
    {
      id: 'scenarios' as const,
      name: 'Test Scenarios',
      icon: <TestTube className="h-4 w-4" />,
      count: scenarios.length,
      description: 'Manage and execute custom test scenarios'
    },
    {
      id: 'benchmark' as const,
      name: 'Performance Benchmark',
      icon: <BarChart3 className="h-4 w-4" />,
      count: benchmarkResults.length,
      description: 'Comprehensive performance testing and load testing'
    },
    {
      id: 'monitoring' as const,
      name: 'Test Monitoring',
      icon: <Activity className="h-4 w-4" />,
      count: testResults.length,
      description: 'Real-time test monitoring and historical analysis'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <TestTube className="h-6 w-6" />
              <span>Advanced Testing Suite</span>
            </h2>
            <p className="text-green-100 mt-1">
              Comprehensive proxy testing, benchmarking, và performance analysis
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{scenarios.length}</div>
              <div className="text-xs text-green-200">Scenarios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalTests}</div>
              <div className="text-xs text-green-200">Tests Run</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{(stats.successRate * 100).toFixed(0)}%</div>
              <div className="text-xs text-green-200">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Testing Status */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <StatusIndicator
              status={isRunning ? 'loading' : stats.successRate > 0.8 ? 'success' : 'warning'}
              message={getStatusMessage()}
            />
            {currentTest && (
              <div className="text-sm text-green-200">
                Current: {currentTest}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {isRunning && (
              <LoadingButton onClick={cancelTests} variant="danger" size="sm">
                <Pause className="h-3 w-3 mr-1" />
                Cancel
              </LoadingButton>
            )}
            
            <Tooltip content="Quick test selected proxies">
              <LoadingButton
                onClick={() => handleRunScenarios(['basic-connectivity'])}
                disabled={isRunning || (selectedProxies.length === 0 && proxies.length === 0)}
                variant="secondary"
                size="sm"
              >
                <Play className="h-3 w-3 mr-1" />
                Quick Test
              </LoadingButton>
            </Tooltip>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span className="text-sm">Avg Performance</span>
            </div>
            <div className="text-lg font-bold mt-1">
              {benchmarkResults.length > 0 
                ? (benchmarkResults.reduce((sum, r) => sum + r.performanceScore, 0) / benchmarkResults.length).toFixed(1)
                : '0'
              }
            </div>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Avg Response</span>
            </div>
            <div className="text-lg font-bold mt-1">
              {stats.averageResponseTime.toFixed(0)}ms
            </div>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Active Tests</span>
            </div>
            <div className="text-lg font-bold mt-1">
              {isRunning ? '🔄' : '✅'}
            </div>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Reliability</span>
            </div>
            <div className="text-lg font-bold mt-1">
              {benchmarkResults.length > 0 
                ? (benchmarkResults.reduce((sum, r) => sum + r.reliability, 0) / benchmarkResults.length * 100).toFixed(0) + '%'
                : '0%'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
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
                {tab.count > 0 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Description */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              {tabs.find(t => t.id === activeTab)?.description}
            </p>
          </div>

          {/* Tab Content */}
          {activeTab === 'scenarios' && (
            <TestScenarioManager onRunScenario={handleRunScenarios} />
          )}

          {activeTab === 'benchmark' && (
            <PerformanceBenchmark
              proxies={proxies}
              selectedProxies={selectedProxies}
            />
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2 text-gray-900">Test Monitoring Dashboard</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Real-time monitoring dashboard would be implemented here with:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 max-w-md mx-auto text-left">
                  <li>• Real-time test execution monitoring</li>
                  <li>• Historical test results analysis</li>
                  <li>• Performance trend charts</li>
                  <li>• Alert configuration for test failures</li>
                  <li>• Detailed test logs and debugging info</li>
                  <li>• Proxy health correlation with test results</li>
                  <li>• Automated test scheduling</li>
                  <li>• Custom reporting and exports</li>
                </ul>
              </div>

              {/* Quick Stats for Monitoring */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Activity className="h-8 w-8 text-blue-500" />
                    <div>
                      <h4 className="font-medium text-gray-900">Recent Tests</h4>
                      <p className="text-sm text-gray-600">Last 24 hours</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalTests}</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Target className="h-8 w-8 text-green-500" />
                    <div>
                      <h4 className="font-medium text-gray-900">Success Rate</h4>
                      <p className="text-sm text-gray-600">Overall performance</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {(stats.successRate * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Clock className="h-8 w-8 text-purple-500" />
                    <div>
                      <h4 className="font-medium text-gray-900">Avg Response</h4>
                      <p className="text-sm text-gray-600">Response time</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.averageResponseTime.toFixed(0)}ms
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-500" />
          <span>Quick Testing Actions</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quick Connectivity Test */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Play className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium text-gray-900">Quick Test</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Run basic connectivity tests on selected proxies.
            </p>
            <LoadingButton
              onClick={() => handleRunScenarios(['basic-connectivity'])}
              disabled={isRunning || proxies.length === 0}
              variant="primary"
              size="sm"
              className="w-full"
            >
              Test Connectivity
            </LoadingButton>
          </div>

          {/* Performance Benchmark */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <h4 className="font-medium text-gray-900">Benchmark</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Run comprehensive performance benchmarks.
            </p>
            <LoadingButton
              onClick={() => handleRunScenarios(['performance-benchmark'])}
              disabled={isRunning || proxies.length === 0}
              variant="primary"
              size="sm"
              className="w-full"
            >
              Run Benchmark
            </LoadingButton>
          </div>

          {/* Security Check */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Target className="h-5 w-5 text-red-500" />
              <h4 className="font-medium text-gray-900">Security Check</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Verify proxy security and anonymity levels.
            </p>
            <LoadingButton
              onClick={() => handleRunScenarios(['security-check'])}
              disabled={isRunning || proxies.length === 0}
              variant="primary"
              size="sm"
              className="w-full"
            >
              Check Security
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  )
}
