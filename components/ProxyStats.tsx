'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Globe, Zap, Clock, Shield, RefreshCw, Activity, AlertTriangle } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface ProxyStats {
  total: number
  alive: number
  dead: number
  testing: number
  pending: number
  alivePercentage: number
  deadPercentage: number
  averagePing: number
  averageSpeed: number
  successRate: number
  countries: Record<string, number>
  types: Record<string, number>
  anonymity: Record<string, number>
}

interface ProxyStatsProps {
  stats: ProxyStats
  proxies: Proxy[]
}

export default function ProxyStats({ stats, proxies }: ProxyStatsProps) {
  const [currentTime, setCurrentTime] = useState<string>('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('vi-VN'))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }
  // Prepare data for charts
  const typeData = proxies.reduce((acc, proxy) => {
    acc[proxy.type] = (acc[proxy.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statusData = proxies.reduce((acc, proxy) => {
    acc[proxy.status] = (acc[proxy.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statusChartData = [
    { name: 'Alive', value: statusData.alive || 0, color: '#10b981' },
    { name: 'Dead', value: statusData.dead || 0, color: '#ef4444' },
    { name: 'Pending', value: statusData.pending || 0, color: '#f59e0b' },
    { name: 'Testing', value: statusData.testing || 0, color: '#3b82f6' },
  ]

  const groupData = proxies.reduce((acc, proxy) => {
    const group = proxy.group || 'default'
    acc[group] = (acc[group] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const speedData = proxies
    .filter(p => p.speed && p.status === 'alive')
    .map(p => ({
      name: `${p.host}:${p.port}`,
      speed: p.speed || 0
    }))
    .sort((a, b) => a.speed - b.speed)
    .slice(0, 10) // Top 10 fastest

  const locationData = proxies
    .filter(p => p.country)
    .reduce((acc, proxy) => {
      const location = proxy.country || 'Unknown'
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const chartData = [
    { name: 'HTTP', value: typeData.http || 0, color: '#3b82f6' },
    { name: 'HTTPS', value: typeData.https || 0, color: '#10b981' },
    { name: 'SOCKS4', value: typeData.socks4 || 0, color: '#f59e0b' },
    { name: 'SOCKS5', value: typeData.socks5 || 0, color: '#ef4444' },
  ]


  const groupChartData = Object.entries(groupData).map(([name, value]) => ({
    name,
    value,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  }))

  const locationChartData = Object.entries(locationData).map(([name, value]) => ({
    name,
    value,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  }))

  const averageSpeedByType = Object.keys(typeData).map(type => {
    const typeProxies = proxies.filter(p => p.type === type && p.speed)
    const avgSpeed = typeProxies.length > 0 
      ? typeProxies.reduce((sum, p) => sum + (p.speed || 0), 0) / typeProxies.length 
      : 0
    return {
      type: type.toUpperCase(),
      averageSpeed: Math.round(avgSpeed)
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Thống kê & Phân tích</h2>
          <p className="text-gray-600">Báo cáo chi tiết và xu hướng hiệu suất proxy</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Cập nhật: {currentTime || 'Đang tải...'}</span>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-secondary btn-sm bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Globe className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng proxy</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">🟢 Alive</p>
              <p className="text-2xl font-bold text-green-600">{stats.alive}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">🔴 Dead</p>
              <p className="text-2xl font-bold text-red-600">{stats.dead}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">🟡 Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Tỷ lệ thành công</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.total > 0 ? Math.round((stats.alive / stats.total) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proxy Types Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Phân bố theo loại</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Phân bố theo trạng thái</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Speed by Type Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tốc độ trung bình theo loại</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={averageSpeedByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}ms`, 'Tốc độ']} />
              <Bar dataKey="averageSpeed" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 Fastest Proxies */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top 10 proxy nhanh nhất</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={speedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}ms`, 'Tốc độ']} />
              <Bar dataKey="speed" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Groups Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Phân bố theo nhóm</h3>
          <div className="space-y-3">
            {groupChartData.map((group, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: group.color }}
                  ></div>
                  <span className="text-sm font-medium">{group.name}</span>
                </div>
                <span className="text-sm text-gray-500">{group.value} proxy</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Phân bố theo vị trí</h3>
          <div className="space-y-3">
            {locationChartData.slice(0, 10).map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: location.color }}
                  ></div>
                  <span className="text-sm font-medium">{location.name}</span>
                </div>
                <span className="text-sm text-gray-500">{location.value} proxy</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tóm tắt hiệu suất</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-success-600 mb-2">
              {stats.total > 0 ? Math.round((stats.alive / stats.total) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-500">Tỷ lệ hoạt động</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {Math.round(stats.averageSpeed)}ms
            </div>
            <div className="text-sm text-gray-500">Tốc độ trung bình</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-600 mb-2">
              {proxies.filter(p => p.lastTested).length}
            </div>
            <div className="text-sm text-gray-500">Đã test gần đây</div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
            Xu hướng hiệu suất
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Proxy hoạt động tốt</span>
              <span className="text-sm font-bold text-green-600">
                {proxies.filter(p => p.status === 'alive' && p.ping && p.ping < 1000).length} proxy
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Proxy chậm (&gt;2s ping)</span>
              <span className="text-sm font-bold text-yellow-600">
                {proxies.filter(p => p.ping && p.ping > 2000).length} proxy
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Cần kiểm tra lại</span>
              <span className="text-sm font-bold text-red-600">
                {proxies.filter(p => p.status === 'dead' || !p.lastTested).length} proxy
              </span>
            </div>
          </div>
        </div>

        {/* Top Performing Countries */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="h-5 w-5 text-green-500 mr-2" />
            Top quốc gia hiệu suất cao
          </h3>
          <div className="space-y-3">
            {Object.entries(
              proxies
                .filter(p => p.status === 'alive' && p.country)
                .reduce((acc, proxy) => {
                  const country = proxy.country || 'Unknown'
                  acc[country] = (acc[country] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
            )
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([country, count], index) => (
                <div key={country} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">{country}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{count} proxy</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Detailed Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
          Phân tích chi tiết hiệu suất
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {Math.round((stats.alive / Math.max(stats.total, 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Tỷ lệ thành công</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.alive}/{stats.total} proxy
            </div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {Math.round(stats.averagePing)}ms
            </div>
            <div className="text-sm text-gray-600">Ping trung bình</div>
            <div className="text-xs text-gray-500 mt-1">
              Của {proxies.filter(p => p.ping).length} proxy đã test
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {Math.round(stats.averageSpeed)}
            </div>
            <div className="text-sm text-gray-600">Tốc độ TB (KB/s)</div>
            <div className="text-xs text-gray-500 mt-1">
              Của {proxies.filter(p => p.speed).length} proxy đã test
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
