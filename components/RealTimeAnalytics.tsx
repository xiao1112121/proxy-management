'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, Globe, Zap, Shield, Activity } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface AnalyticsData {
  timestamp: number
  totalProxies: number
  aliveProxies: number
  deadProxies: number
  testingProxies: number
  averagePing: number
  averageSpeed: number
  countries: Record<string, number>
  types: Record<string, number>
  anonymity: Record<string, number>
}

interface RealTimeAnalyticsProps {
  proxies: Proxy[]
  refreshInterval?: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function RealTimeAnalytics({ proxies, refreshInterval = 5000 }: RealTimeAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h')

  // Calculate current analytics
  const currentAnalytics = useMemo(() => {
    const total = proxies.length
    const alive = proxies.filter(p => p.status === 'alive').length
    const dead = proxies.filter(p => p.status === 'dead').length
    const testing = proxies.filter(p => p.status === 'testing').length

    const aliveProxies = proxies.filter(p => p.status === 'alive' && p.ping)
    const averagePing = aliveProxies.length > 0 
      ? aliveProxies.reduce((sum, p) => sum + (p.ping || 0), 0) / aliveProxies.length
      : 0

    const averageSpeed = aliveProxies.length > 0
      ? aliveProxies.reduce((sum, p) => sum + (p.speed || 0), 0) / aliveProxies.length
      : 0

    // Count by countries
    const countries: Record<string, number> = {}
    proxies.forEach(proxy => {
      if (proxy.country) {
        countries[proxy.country] = (countries[proxy.country] || 0) + 1
      }
    })

    // Count by types
    const types: Record<string, number> = {}
    proxies.forEach(proxy => {
      types[proxy.type] = (types[proxy.type] || 0) + 1
    })

    // Count by anonymity
    const anonymity: Record<string, number> = {}
    proxies.forEach(proxy => {
      if (proxy.anonymity) {
        anonymity[proxy.anonymity] = (anonymity[proxy.anonymity] || 0) + 1
      }
    })

    return {
      timestamp: Date.now(),
      totalProxies: total,
      aliveProxies: alive,
      deadProxies: dead,
      testingProxies: testing,
      averagePing: Math.round(averagePing),
      averageSpeed: Math.round(averageSpeed),
      countries,
      types,
      anonymity
    }
  }, [proxies])

  // Update analytics data
  useEffect(() => {
    if (isAutoRefresh) {
      setAnalyticsData(prev => {
        const newData = [...prev, currentAnalytics]
        const maxDataPoints = getMaxDataPoints()
        return newData.slice(-maxDataPoints)
      })
    }
  }, [currentAnalytics, isAutoRefresh])

  const getMaxDataPoints = () => {
    switch (selectedTimeRange) {
      case '1h': return 12 // 5-minute intervals
      case '6h': return 36 // 10-minute intervals
      case '24h': return 48 // 30-minute intervals
      case '7d': return 168 // 1-hour intervals
      default: return 12
    }
  }

  // Prepare chart data
  const chartData = useMemo(() => {
    return analyticsData.map(data => ({
      time: new Date(data.timestamp).toLocaleTimeString(),
      alive: data.aliveProxies,
      dead: data.deadProxies,
      testing: data.testingProxies,
      ping: data.averagePing,
      speed: data.averageSpeed
    }))
  }, [analyticsData])

  const countryData = useMemo(() => {
    return Object.entries(currentAnalytics.countries)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }))
  }, [currentAnalytics.countries])

  const typeData = useMemo(() => {
    return Object.entries(currentAnalytics.types)
      .map(([type, count]) => ({ type: type.toUpperCase(), count }))
  }, [currentAnalytics.types])

  const anonymityData = useMemo(() => {
    return Object.entries(currentAnalytics.anonymity)
      .map(([anonymity, count]) => ({ anonymity, count }))
  }, [currentAnalytics.anonymity])

  const statusData = [
    { name: 'Alive', value: currentAnalytics.aliveProxies, color: '#10B981' },
    { name: 'Dead', value: currentAnalytics.deadProxies, color: '#EF4444' },
    { name: 'Testing', value: currentAnalytics.testingProxies, color: '#F59E0B' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Activity className="w-6 h-6 mr-2" />
          Real-time Analytics
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isAutoRefresh 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isAutoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Proxies</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentAnalytics.totalProxies.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Ping</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentAnalytics.averagePing}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentAnalytics.totalProxies > 0 
                  ? Math.round((currentAnalytics.aliveProxies / currentAnalytics.totalProxies) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Globe className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Countries</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(currentAnalytics.countries).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Proxy Types */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Proxy Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Over Time */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="alive" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="dead" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Countries */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={countryData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="country" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-time Updates */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Updates</h3>
        <div className="space-y-2">
          {analyticsData.slice(-5).reverse().map((data, index) => (
            <div key={data.timestamp} className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {new Date(data.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-sm text-green-600">
                  {data.aliveProxies} alive
                </span>
                <span className="text-sm text-red-600">
                  {data.deadProxies} dead
                </span>
                <span className="text-sm text-yellow-600">
                  {data.testingProxies} testing
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Avg: {data.averagePing}ms ping, {data.averageSpeed}ms speed
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
