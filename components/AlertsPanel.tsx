'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, 
  BellOff, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX
} from 'lucide-react'
import { HealthAlert } from '@/hooks/useProxyHealthMonitoring'

interface AlertsPanelProps {
  alerts: HealthAlert[]
  onAcknowledge: (alertId: string) => void
  onClearAll: () => void
  enableSound?: boolean
}

export default function AlertsPanel({ 
  alerts, 
  onAcknowledge, 
  onClearAll,
  enableSound = true 
}: AlertsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(enableSound)
  const [lastAlertCount, setLastAlertCount] = useState(0)

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged)
  const recentAlerts = alerts.slice(0, 5)

  // Play sound for new alerts
  useEffect(() => {
    if (soundEnabled && unacknowledgedAlerts.length > lastAlertCount) {
      // Only play sound for new alerts, not on initial load
      if (lastAlertCount > 0) {
        playAlertSound()
      }
    }
    setLastAlertCount(unacknowledgedAlerts.length)
  }, [unacknowledgedAlerts.length, lastAlertCount, soundEnabled])

  const playAlertSound = () => {
    try {
      // Create audio context for alert sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log('Could not play alert sound:', error)
    }
  }

  const getAlertIcon = (type: HealthAlert['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'recovery':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failover':
        return <RefreshCw className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: HealthAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300'
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300'
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      case 'low': return 'text-blue-700 bg-blue-100 border-blue-300'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const criticalAlerts = unacknowledgedAlerts.filter(a => a.severity === 'critical')
  const highAlerts = unacknowledgedAlerts.filter(a => a.severity === 'high')

  if (alerts.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          {unacknowledgedAlerts.length > 0 ? (
            <Bell className="h-5 w-5 text-red-500 animate-pulse" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
          <h3 className="font-semibold text-gray-900">Alerts</h3>
          {unacknowledgedAlerts.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white bg-red-500">
              {unacknowledgedAlerts.length}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSoundEnabled(!soundEnabled)
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {/* Quick Stats */}
      {!isExpanded && unacknowledgedAlerts.length > 0 && (
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Unacknowledged:</span>
            <div className="flex space-x-3">
              {criticalAlerts.length > 0 && (
                <span className="text-red-600 font-medium">
                  {criticalAlerts.length} critical
                </span>
              )}
              {highAlerts.length > 0 && (
                <span className="text-orange-600 font-medium">
                  {highAlerts.length} high
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {isExpanded && (
        <>
          {/* Alert List */}
          <div className="max-h-96 overflow-y-auto">
            {recentAlerts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>No alerts</p>
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-b border-gray-100 last:border-b-0 ${
                    alert.acknowledged ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            alert.acknowledged ? 'text-gray-600' : 'text-gray-900'
                          }`}>
                            {alert.message}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(alert.timestamp)}
                            </span>
                          </div>
                        </div>
                        
                        {!alert.acknowledged && (
                          <button
                            onClick={() => onAcknowledge(alert.id)}
                            className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Acknowledge"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Alert Details */}
                      {alert.details && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
                          {typeof alert.details === 'object' ? (
                            Object.entries(alert.details).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">{key}:</span>
                                <span className="font-medium">{String(value)}</span>
                              </div>
                            ))
                          ) : (
                            <span>{String(alert.details)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {alerts.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-between">
              <span className="text-sm text-gray-600">
                {alerts.length} total alerts
              </span>
              <div className="flex space-x-2">
                {unacknowledgedAlerts.length > 0 && (
                  <button
                    onClick={() => {
                      unacknowledgedAlerts.forEach(alert => onAcknowledge(alert.id))
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Ack All
                  </button>
                )}
                <button
                  onClick={onClearAll}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Floating Alert Notifications */}
      {unacknowledgedAlerts.slice(0, 3).map((alert, index) => (
        <div
          key={`notification-${alert.id}`}
          className={`fixed top-${20 + index * 16} right-96 w-72 bg-white border-l-4 ${
            alert.severity === 'critical' ? 'border-red-500' : 
            alert.severity === 'high' ? 'border-orange-500' : 
            'border-yellow-500'
          } rounded-r-lg shadow-lg z-40 animate-slide-in-right`}
          style={{ 
            top: `${5 + index * 4}rem`,
            right: '22rem',
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {alert.message.length > 50 
                      ? `${alert.message.substring(0, 50)}...` 
                      : alert.message
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(alert.timestamp)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
