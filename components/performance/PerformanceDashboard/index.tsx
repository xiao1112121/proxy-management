'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n'
import { useProxySelectors } from '@/store/proxyStore'
import { 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  PieChart,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function PerformanceDashboard() {
  const { t } = useLanguage()
  const { proxies, stats, isLoading } = useProxySelectors()
  const [performanceData, setPerformanceData] = useState({
    averagePing: 0,
    averageSpeed: 0,
    successRate: 0,
    totalTests: 0,
    lastTestTime: null as string | null,
    topPerformers: [] as any[],
    performanceHistory: [] as any[]
  })

  useEffect(() => {
    calculatePerformanceData()
  }, [proxies, stats])

  const calculatePerformanceData = () => {
    const aliveProxies = proxies.filter(p => p.status === 'alive')
    const testedProxies = proxies.filter(p => p.lastTested)
    
    const averagePing = aliveProxies.length > 0 
      ? aliveProxies.reduce((sum, p) => sum + (p.ping || 0), 0) / aliveProxies.length
      : 0

    const averageSpeed = aliveProxies.length > 0
      ? aliveProxies.reduce((sum, p) => sum + (p.speed || 0), 0) / aliveProxies.length
      : 0

    const successRate = proxies.length > 0 ? (stats.alive / stats.total) * 100 : 0

    const topPerformers = aliveProxies
      .sort((a, b) => (a.ping || 0) - (b.ping || 0))
      .slice(0, 5)

    const lastTestTime = testedProxies.length > 0
      ? testedProxies.sort((a, b) => 
          new Date(b.lastTested || 0).getTime() - new Date(a.lastTested || 0).getTime()
        )[0].lastTested || null
      : null

    setPerformanceData({
      averagePing: Math.round(averagePing),
      averageSpeed: Math.round(averageSpeed),
      successRate: Math.round(successRate * 100) / 100,
      totalTests: testedProxies.length,
      lastTestTime,
      topPerformers,
      performanceHistory: [] // TODO: Implement performance history
    })
  }

  const getPerformanceColor = (value: number, type: 'ping' | 'speed' | 'rate') => {
    if (type === 'ping') {
      if (value < 100) return 'text-green-600'
      if (value < 300) return 'text-yellow-600'
      return 'text-red-600'
    }
    if (type === 'speed') {
      if (value > 1000) return 'text-green-600'
      if (value > 500) return 'text-yellow-600'
      return 'text-red-600'
    }
    if (type === 'rate') {
      if (value > 80) return 'text-green-600'
      if (value > 60) return 'text-yellow-600'
      return 'text-red-600'
    }
    return 'text-gray-600'
  }

  const getPerformanceIcon = (value: number, type: 'ping' | 'speed' | 'rate') => {
    if (type === 'ping') {
      if (value < 100) return <CheckCircle className="h-5 w-5 text-green-500" />
      if (value < 300) return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    if (type === 'speed') {
      if (value > 1000) return <CheckCircle className="h-5 w-5 text-green-500" />
      if (value > 500) return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    if (type === 'rate') {
      if (value > 80) return <CheckCircle className="h-5 w-5 text-green-500" />
      if (value > 60) return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    return <Activity className="h-5 w-5 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('performance.title')}
              </h2>
              <p className="text-gray-600">
                {t('performance.description')}
              </p>
            </div>
          </div>
          <button
            onClick={calculatePerformanceData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Average Ping */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {t('performance.averagePing')}
              </p>
              <div className="flex items-center">
                <p className={`text-2xl font-semibold ${getPerformanceColor(performanceData.averagePing, 'ping')}`}>
                  {performanceData.averagePing}ms
                </p>
                {getPerformanceIcon(performanceData.averagePing, 'ping')}
              </div>
            </div>
          </div>
        </div>

        {/* Average Speed */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {t('performance.averageSpeed')}
              </p>
              <div className="flex items-center">
                <p className={`text-2xl font-semibold ${getPerformanceColor(performanceData.averageSpeed, 'speed')}`}>
                  {performanceData.averageSpeed} KB/s
                </p>
                {getPerformanceIcon(performanceData.averageSpeed, 'speed')}
              </div>
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {t('performance.successRate')}
              </p>
              <div className="flex items-center">
                <p className={`text-2xl font-semibold ${getPerformanceColor(performanceData.successRate, 'rate')}`}>
                  {performanceData.successRate}%
                </p>
                {getPerformanceIcon(performanceData.successRate, 'rate')}
              </div>
            </div>
          </div>
        </div>

        {/* Total Tests */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {t('performance.totalTests')}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {performanceData.totalTests}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PieChart className="h-5 w-5 mr-2 text-blue-600" />
          {t('performance.topPerformers')}
        </h3>
        
        {performanceData.topPerformers.length > 0 ? (
          <div className="space-y-3">
            {performanceData.topPerformers.map((proxy, index) => (
              <div key={proxy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {proxy.host}:{proxy.port}
                    </p>
                    <p className="text-xs text-gray-500">
                      {proxy.type.toUpperCase()} • {proxy.group || 'No Group'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {proxy.ping}ms
                    </p>
                    <p className="text-xs text-gray-500">Ping</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {proxy.speed} KB/s
                    </p>
                    <p className="text-xs text-gray-500">Speed</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t('performance.noData')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('performance.runTestsFirst')}
            </p>
          </div>
        )}
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('performance.summary')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {t('performance.overallHealth')}
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">{t('common.total')}:</span>
                <span className="text-sm font-medium">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">{t('common.alive')}:</span>
                <span className="text-sm font-medium text-green-600">{stats.alive}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">{t('common.dead')}:</span>
                <span className="text-sm font-medium text-red-600">{stats.dead}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">{t('common.pending')}:</span>
                <span className="text-sm font-medium text-yellow-600">{stats.pending}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {t('performance.lastActivity')}
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">{t('performance.lastTest')}:</span>
                <span className="text-sm font-medium">
                  {performanceData.lastTestTime 
                    ? new Date(performanceData.lastTestTime).toLocaleString('vi-VN')
                    : t('performance.never')
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">{t('performance.testsRun')}:</span>
                <span className="text-sm font-medium">{performanceData.totalTests}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}