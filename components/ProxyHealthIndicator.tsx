'use client'

import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  WifiOff, 
  Activity,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { HealthMetrics } from '@/hooks/useProxyHealthMonitoring'

interface ProxyHealthIndicatorProps {
  metrics?: HealthMetrics
  showDetails?: boolean
  compact?: boolean
}

export default function ProxyHealthIndicator({ 
  metrics, 
  showDetails = false, 
  compact = false 
}: ProxyHealthIndicatorProps) {
  if (!metrics) {
    return (
      <div className="flex items-center space-x-1">
        <Clock className="h-4 w-4 text-gray-400" />
        {!compact && <span className="text-xs text-gray-500">Pending</span>}
      </div>
    )
  }

  const getStatusIcon = () => {
    switch (metrics.status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'offline':
        return <WifiOff className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (metrics.status) {
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

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime < 1000) return 'text-green-600'
    if (responseTime < 3000) return 'text-yellow-600'
    if (responseTime < 5000) return 'text-orange-600'
    return 'text-red-600'
  }

  const getTrendIcon = () => {
    // Simple trend calculation based on consecutive failures
    if (metrics.consecutiveFailures === 0) {
      return <TrendingUp className="h-3 w-3 text-green-500" />
    } else if (metrics.consecutiveFailures >= 2) {
      return <TrendingDown className="h-3 w-3 text-red-500" />
    }
    return null
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-1" title={`Health: ${metrics.healthScore}% | Response: ${metrics.responseTime}ms | Success: ${metrics.successRate.toFixed(1)}%`}>
        {getStatusIcon()}
        <span className={`text-xs font-medium ${getHealthScoreColor(metrics.healthScore)}`}>
          {metrics.healthScore}%
        </span>
        {getTrendIcon()}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
          {metrics.status}
        </span>
        {getTrendIcon()}
      </div>

      {/* Health Score */}
      <div className="flex items-center space-x-2">
        <Activity className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-500">Health:</span>
        <span className={`text-sm font-bold ${getHealthScoreColor(metrics.healthScore)}`}>
          {metrics.healthScore}%
        </span>
      </div>

      {showDetails && (
        <div className="space-y-1 text-xs text-gray-600">
          {/* Response Time */}
          <div className="flex justify-between">
            <span>Response:</span>
            <span className={getResponseTimeColor(metrics.responseTime)}>
              {metrics.responseTime}ms
            </span>
          </div>

          {/* Success Rate */}
          <div className="flex justify-between">
            <span>Success:</span>
            <span className={getHealthScoreColor(metrics.successRate)}>
              {metrics.successRate.toFixed(1)}%
            </span>
          </div>

          {/* Uptime */}
          <div className="flex justify-between">
            <span>Uptime:</span>
            <span className={getHealthScoreColor(metrics.uptime)}>
              {metrics.uptime.toFixed(1)}%
            </span>
          </div>

          {/* Last Check */}
          <div className="flex justify-between">
            <span>Last check:</span>
            <span>{formatTimestamp(metrics.lastCheck)}</span>
          </div>

          {/* Failures */}
          {metrics.consecutiveFailures > 0 && (
            <div className="flex justify-between">
              <span>Failures:</span>
              <span className="text-red-600 font-medium">
                {metrics.consecutiveFailures} consecutive
              </span>
            </div>
          )}

          {/* Last Error */}
          {metrics.lastError && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              <div className="font-medium">Last Error:</div>
              <div className="mt-1">{metrics.lastError}</div>
            </div>
          )}

          {/* Performance Bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Performance</span>
              <span>{metrics.healthScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  metrics.healthScore >= 80 ? 'bg-green-500' :
                  metrics.healthScore >= 60 ? 'bg-yellow-500' :
                  metrics.healthScore >= 30 ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.max(5, metrics.healthScore)}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 rounded p-1">
              <div className="text-gray-500">Requests</div>
              <div className="font-medium">{metrics.totalRequests}</div>
            </div>
            <div className="bg-gray-50 rounded p-1">
              <div className="text-gray-500">Avg Time</div>
              <div className={`font-medium ${getResponseTimeColor(metrics.averageResponseTime)}`}>
                {Math.round(metrics.averageResponseTime)}ms
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
