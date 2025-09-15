'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Settings, 
  RefreshCw,
  Calendar,
  Filter,
  Maximize2,
  Grid3x3
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { HealthMetrics } from '@/hooks/useProxyHealthMonitoring'
import { useChartData } from '@/hooks/useChartData'
import InteractiveChart from './InteractiveChart'
import DistributionCharts from './DistributionCharts'
import PerformanceLeaderboard from './PerformanceLeaderboard'

interface AnalyticsDashboardProps {
  proxies: Proxy[]
  healthMetrics: Map<number, HealthMetrics>
}

export default function AnalyticsDashboard({
  proxies,
  healthMetrics
}: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h')
  const [refreshInterval, setRefreshInterval] = useState<number>(5000)
  const [layout, setLayout] = useState<'grid' | 'stack'>('grid')

  const {
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
  } = useChartData(proxies, healthMetrics)

  // Get distribution data
  const distribution = getProxyDistribution()
  const performanceMetrics = getPerformanceMetrics()
  const topPerformers = getTopPerformers()
  const worstPerformers = getWorstPerformers()

  // Handle config updates
  const handleConfigUpdate = (updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  // Export all analytics data
  const handleExportAll = () => {
    exportData('json')
  }

  // Get time range in milliseconds
  const getTimeRangeMs = () => {
    switch (timeRange) {
      case '1h': return 60 * 60 * 1000
      case '6h': return 6 * 60 * 60 * 1000
      case '24h': return 24 * 60 * 60 * 1000
      case '7d': return 7 * 24 * 60 * 60 * 1000
      default: return 60 * 60 * 1000
    }
  }

  // Filter time series data by time range
  const getFilteredTimeSeriesData = () => {
    const cutoffTime = Date.now() - getTimeRangeMs()
    
    return timeSeriesData.map(series => ({
      ...series,
      data: series.data.filter(point => point.timestamp >= cutoffTime)
    }))
  }

  const filteredTimeSeriesData = getFilteredTimeSeriesData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <BarChart3 className="h-6 w-6" />
              <span>Analytics Dashboard</span>
            </h2>
            <p className="text-purple-100 mt-1">
              Real-time proxy performance analytics và insights
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-white bg-opacity-20 text-white border border-white border-opacity-30 rounded-lg px-3 py-2 text-sm"
            >
              <option value="1h" className="text-gray-900">Last 1 Hour</option>
              <option value="6h" className="text-gray-900">Last 6 Hours</option>
              <option value="24h" className="text-gray-900">Last 24 Hours</option>
              <option value="7d" className="text-gray-900">Last 7 Days</option>
            </select>

            {/* Layout Toggle */}
            <button
              onClick={() => setLayout(layout === 'grid' ? 'stack' : 'grid')}
              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
              title={layout === 'grid' ? 'Stack Layout' : 'Grid Layout'}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>

            {/* Export Button */}
            <button
              onClick={handleExportAll}
              className="flex items-center space-x-1 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>

            {/* Refresh Control */}
            <button
              onClick={isCollecting ? stopCollection : startCollection}
              className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${
                isCollecting 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${isCollecting ? 'animate-spin' : ''}`} />
              <span>{isCollecting ? 'Stop' : 'Start'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-sm text-purple-100">Total Proxies</div>
            <div className="text-2xl font-bold">{proxies.length}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-sm text-purple-100">Healthy</div>
            <div className="text-2xl font-bold text-green-300">
              {Array.from(healthMetrics.values()).filter(m => m.status === 'healthy').length}
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-sm text-purple-100">Avg Health</div>
            <div className="text-2xl font-bold">
              {healthMetrics.size > 0 
                ? Math.round(Array.from(healthMetrics.values()).reduce((sum, m) => sum + m.healthScore, 0) / healthMetrics.size)
                : 0}%
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-sm text-purple-100">Data Points</div>
            <div className="text-2xl font-bold">
              {filteredTimeSeriesData.reduce((sum, series) => sum + series.data.length, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className={layout === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-6'}>
        {/* Health Score Trend */}
        <InteractiveChart
          data={filteredTimeSeriesData.filter(s => s.id === 'avg_health_score')}
          title="Average Health Score Trend"
          type="area"
          height={300}
          showLegend={true}
          enableZoom={true}
          enableAnimation={config.showAnimations}
          realTime={config.enableRealTime}
          onSeriesToggle={toggleSeriesVisibility}
          onExport={() => exportData('csv')}
        />

        {/* Proxy Status Distribution */}
        <InteractiveChart
          data={filteredTimeSeriesData.filter(s => ['healthy_count', 'warning_count', 'critical_count', 'offline_count'].includes(s.id))}
          title="Proxy Status Distribution"
          type="bar"
          height={300}
          showLegend={true}
          enableZoom={true}
          enableAnimation={config.showAnimations}
          realTime={config.enableRealTime}
          onSeriesToggle={toggleSeriesVisibility}
          onExport={() => exportData('csv')}
        />

        {/* Response Time Trend */}
        <InteractiveChart
          data={filteredTimeSeriesData.filter(s => s.id === 'avg_response_time')}
          title="Average Response Time Trend"
          type="line"
          height={300}
          showLegend={true}
          enableZoom={true}
          enableAnimation={config.showAnimations}
          realTime={config.enableRealTime}
          onSeriesToggle={toggleSeriesVisibility}
          onExport={() => exportData('csv')}
        />

        {/* All Metrics Combined */}
        <InteractiveChart
          data={filteredTimeSeriesData}
          title="All Metrics Overview"
          type="line"
          height={300}
          showLegend={true}
          enableZoom={true}
          enableAnimation={config.showAnimations}
          realTime={config.enableRealTime}
          onSeriesToggle={toggleSeriesVisibility}
          onExport={() => exportData('csv')}
        />
      </div>

      {/* Distribution Analysis */}
      <DistributionCharts
        statusDistribution={distribution.byStatus}
        countryDistribution={distribution.byCountry}
        typeDistribution={distribution.byType}
        anonymityDistribution={distribution.byAnonymity}
        healthScoreDistribution={performanceMetrics.healthScoreDistribution}
        responseTimeDistribution={performanceMetrics.responseTimeDistribution}
      />

      {/* Performance Leaderboards */}
      <div className={layout === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-6'}>
        <PerformanceLeaderboard
          topPerformers={topPerformers}
          worstPerformers={worstPerformers}
        />

        {/* Additional Performance Insights */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span>Performance Insights</span>
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm text-green-700 font-medium">Best Performers</div>
                <div className="text-2xl font-bold text-green-800">
                  {topPerformers.length > 0 ? topPerformers.filter(p => p.healthScore >= 90).length : 0}
                </div>
                <div className="text-xs text-green-600">Health Score ≥ 90%</div>
              </div>
              
              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
                <div className="text-sm text-red-700 font-medium">Need Attention</div>
                <div className="text-2xl font-bold text-red-800">
                  {worstPerformers.length > 0 ? worstPerformers.filter(p => p.healthScore < 50).length : 0}
                </div>
                <div className="text-xs text-red-600">Health Score &lt; 50%</div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Recommendations</h4>
              <div className="space-y-2">
                {worstPerformers.length > 5 && (
                  <div className="flex items-center space-x-2 text-sm text-orange-700 bg-orange-50 rounded p-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Consider removing {worstPerformers.length} underperforming proxies</span>
                  </div>
                )}
                
                {Array.from(distribution.byCountry.entries()).length > 10 && (
                  <div className="flex items-center space-x-2 text-sm text-blue-700 bg-blue-50 rounded p-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Good geographic diversity with {Array.from(distribution.byCountry.entries()).length} countries</span>
                  </div>
                )}
                
                {healthMetrics.size > 0 && Array.from(healthMetrics.values()).filter(m => m.consecutiveFailures > 3).length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-red-700 bg-red-50 rounded p-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>
                      {Array.from(healthMetrics.values()).filter(m => m.consecutiveFailures > 3).length} proxies 
                      have multiple consecutive failures
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-500" />
            <span>Analytics Configuration</span>
          </h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Update Interval
              </label>
              <select
                value={config.updateInterval / 1000}
                onChange={(e) => handleConfigUpdate({ updateInterval: Number(e.target.value) * 1000 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="5">5 seconds</option>
                <option value="10">10 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Data Points
              </label>
              <select
                value={config.maxDataPoints}
                onChange={(e) => handleConfigUpdate({ maxDataPoints: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="25">25 points</option>
                <option value="50">50 points</option>
                <option value="100">100 points</option>
                <option value="200">200 points</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableRealTime"
                checked={config.enableRealTime}
                onChange={(e) => handleConfigUpdate({ enableRealTime: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="enableRealTime" className="text-sm font-medium text-gray-700">
                Real-time Updates
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="showAnimations"
                checked={config.showAnimations}
                onChange={(e) => handleConfigUpdate({ showAnimations: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="showAnimations" className="text-sm font-medium text-gray-700">
                Enable Animations
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={clearData}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Clear Data
            </button>
            <button
              onClick={() => exportData('json')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              Export Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
