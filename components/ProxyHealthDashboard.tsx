'use client'

import { useState } from 'react'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap,
  Settings,
  Bell,
  BellOff,
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  Heart,
  Shield,
  Timer,
  BarChart3,
  Eye,
  X
} from 'lucide-react'
import { HealthMetrics, HealthAlert, MonitoringConfig } from '@/hooks/useProxyHealthMonitoring'

interface ProxyHealthDashboardProps {
  healthMetrics: Map<number, HealthMetrics>
  alerts: HealthAlert[]
  config: MonitoringConfig
  isMonitoring: boolean
  lastMonitoringRun: number
  onStartMonitoring: () => void
  onStopMonitoring: () => void
  onConfigUpdate: (config: MonitoringConfig) => void
  onAcknowledgeAlert: (alertId: string) => void
  onClearAlerts: () => void
  stats: {
    totalProxies: number
    healthyProxies: number
    warningProxies: number
    criticalProxies: number
    offlineProxies: number
    averageHealthScore: number
    averageResponseTime: number
    totalAlerts: number
    unacknowledgedAlerts: number
  }
}

export default function ProxyHealthDashboard({
  healthMetrics,
  alerts,
  config,
  isMonitoring,
  lastMonitoringRun,
  onStartMonitoring,
  onStopMonitoring,
  onConfigUpdate,
  onAcknowledgeAlert,
  onClearAlerts,
  stats
}: ProxyHealthDashboardProps) {
  const [showConfig, setShowConfig] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)
  const [configForm, setConfigForm] = useState(config)

  const getStatusIcon = (status: HealthMetrics['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'offline':
        return <WifiOff className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: HealthMetrics['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'offline': return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 30) return 'text-orange-600'
    return 'text-red-600'
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN')
  }

  const getAlertIcon = (type: HealthAlert['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />
      case 'recovery': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failover': return <RefreshCw className="h-4 w-4 text-blue-500" />
    }
  }

  const handleConfigSave = () => {
    onConfigUpdate(configForm)
    setShowConfig(false)
  }

  const healthMetricsArray = Array.from(healthMetrics.values())
  const recentAlerts = alerts.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Heart className="h-6 w-6" />
              <span>Proxy Health Monitoring</span>
            </h2>
            <p className="text-blue-100 mt-1">
              Real-time health tracking và intelligent alerts
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm text-blue-100">Lần check cuối</div>
              <div className="font-medium">
                {lastMonitoringRun ? formatTimestamp(lastMonitoringRun) : 'Chưa chạy'}
              </div>
            </div>
            <div className="flex space-x-2">
              {isMonitoring ? (
                <button
                  onClick={onStopMonitoring}
                  className="flex items-center space-x-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  <Pause className="h-4 w-4" />
                  <span>Dừng</span>
                </button>
              ) : (
                <button
                  onClick={onStartMonitoring}
                  className="flex items-center space-x-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                >
                  <Play className="h-4 w-4" />
                  <span>Bắt đầu</span>
                </button>
              )}
              <button
                onClick={() => setShowConfig(true)}
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng Proxy</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProxies}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Healthy</p>
              <p className="text-2xl font-bold text-green-600">{stats.healthyProxies}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Warning/Critical</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.warningProxies + stats.criticalProxies}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Offline</p>
              <p className="text-2xl font-bold text-red-600">{stats.offlineProxies}</p>
            </div>
            <WifiOff className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <span>Performance Overview</span>
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Health Score</span>
              <span className={`font-bold text-lg ${getHealthScoreColor(stats.averageHealthScore)}`}>
                {stats.averageHealthScore}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Response Time</span>
              <span className="font-bold text-lg text-gray-900">
                {stats.averageResponseTime}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monitoring Status</span>
              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
                isMonitoring 
                  ? 'text-green-700 bg-green-100' 
                  : 'text-gray-700 bg-gray-100'
              }`}>
                {isMonitoring ? <Activity className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                <span>{isMonitoring ? 'Active' : 'Stopped'}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Bell className="h-5 w-5 text-red-500" />
              <span>Recent Alerts</span>
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAlerts(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                <Eye className="h-4 w-4 inline mr-1" />
                Xem tất cả
              </button>
              {alerts.length > 0 && (
                <button
                  onClick={onClearAlerts}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>
          
          {recentAlerts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p>Không có alerts nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded border-l-4 ${
                    alert.acknowledged ? 'bg-gray-50 border-gray-300' : 'bg-white border-red-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(alert.timestamp)}
                        </p>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        ACK
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Proxy Health List */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <span>Proxy Health Status</span>
          </h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {healthMetricsArray.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Chưa có dữ liệu monitoring
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {healthMetricsArray
                .sort((a, b) => b.healthScore - a.healthScore)
                .map(metrics => (
                  <div key={metrics.proxyId} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(metrics.status)}
                        <div>
                          <p className="font-medium text-gray-900">
                            Proxy {metrics.proxyId}
                          </p>
                          <p className="text-sm text-gray-500">
                            Last check: {formatTimestamp(metrics.lastCheck)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`font-bold ${getHealthScoreColor(metrics.healthScore)}`}>
                            {metrics.healthScore}%
                          </div>
                          <div className="text-xs text-gray-500">Health Score</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {metrics.responseTime}ms
                          </div>
                          <div className="text-xs text-gray-500">Response</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {metrics.successRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">Success</div>
                        </div>
                        
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(metrics.status)}`}>
                          {metrics.status}
                        </span>
                      </div>
                    </div>
                    
                    {metrics.lastError && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                        {metrics.lastError}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Monitoring Configuration
                </h3>
                <button
                  onClick={() => setShowConfig(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check Interval (minutes)
                    </label>
                    <input
                      type="number"
                      value={Math.round(configForm.checkInterval / 60000)}
                      onChange={(e) => setConfigForm(prev => ({
                        ...prev,
                        checkInterval: Number(e.target.value) * 60000
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      min="1"
                      max="60"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      value={Math.round(configForm.testTimeout / 1000)}
                      onChange={(e) => setConfigForm(prev => ({
                        ...prev,
                        testTimeout: Number(e.target.value) * 1000
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      min="5"
                      max="60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Health Threshold (%)
                    </label>
                    <input
                      type="number"
                      value={configForm.healthThreshold}
                      onChange={(e) => setConfigForm(prev => ({
                        ...prev,
                        healthThreshold: Number(e.target.value)
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warning Threshold (%)
                    </label>
                    <input
                      type="number"
                      value={configForm.warningThreshold}
                      onChange={(e) => setConfigForm(prev => ({
                        ...prev,
                        warningThreshold: Number(e.target.value)
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Critical Threshold (%)
                    </label>
                    <input
                      type="number"
                      value={configForm.criticalThreshold}
                      onChange={(e) => setConfigForm(prev => ({
                        ...prev,
                        criticalThreshold: Number(e.target.value)
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="enableMonitoring"
                      checked={configForm.monitoringEnabled}
                      onChange={(e) => setConfigForm(prev => ({
                        ...prev,
                        monitoringEnabled: e.target.checked
                      }))}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="enableMonitoring" className="text-sm font-medium text-gray-700">
                      Enable Monitoring
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="enableAlerts"
                      checked={configForm.enableAlerts}
                      onChange={(e) => setConfigForm(prev => ({
                        ...prev,
                        enableAlerts: e.target.checked
                      }))}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="enableAlerts" className="text-sm font-medium text-gray-700">
                      Enable Alerts
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="enableAutoFailover"
                      checked={configForm.enableAutoFailover}
                      onChange={(e) => setConfigForm(prev => ({
                        ...prev,
                        enableAutoFailover: e.target.checked
                      }))}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="enableAutoFailover" className="text-sm font-medium text-gray-700">
                      Enable Auto Failover
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfigSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Lưu cấu hình
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Modal */}
      {showAlerts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  All Alerts ({alerts.length})
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={onClearAlerts}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowAlerts(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.acknowledged 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-white border-red-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium text-gray-900">
                              {alert.message}
                            </p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              alert.severity === 'critical' ? 'text-red-700 bg-red-100' :
                              alert.severity === 'high' ? 'text-orange-700 bg-orange-100' :
                              alert.severity === 'medium' ? 'text-yellow-700 bg-yellow-100' :
                              'text-blue-700 bg-blue-100'
                            }`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatTimestamp(alert.timestamp)} • Proxy {alert.proxyId}
                          </p>
                          {alert.details && (
                            <div className="mt-2 text-xs text-gray-600">
                              {JSON.stringify(alert.details, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <button
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
