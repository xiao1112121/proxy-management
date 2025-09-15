'use client'

import { SimpleProxy as Proxy } from '@/types/proxy'
import { useProxyHealthMonitoring } from '@/hooks/useProxyHealthMonitoring'
import ProxyHealthDashboard from './ProxyHealthDashboard'
import AlertsPanel from './AlertsPanel'

interface HealthMonitoringTabProps {
  proxies: Proxy[]
}

export default function HealthMonitoringTab({ proxies }: HealthMonitoringTabProps) {
  const {
    healthMetrics,
    alerts,
    config,
    isMonitoring,
    lastMonitoringRun,
    startMonitoring,
    stopMonitoring,
    setConfig,
    acknowledgeAlert,
    clearAlerts,
    getMonitoringStats
  } = useProxyHealthMonitoring(proxies)

  const stats = getMonitoringStats()

  return (
    <div className="space-y-6">
      {/* Health Dashboard */}
      <ProxyHealthDashboard
        healthMetrics={healthMetrics}
        alerts={alerts}
        config={config}
        isMonitoring={isMonitoring}
        lastMonitoringRun={lastMonitoringRun}
        onStartMonitoring={startMonitoring}
        onStopMonitoring={stopMonitoring}
        onConfigUpdate={setConfig}
        onAcknowledgeAlert={acknowledgeAlert}
        onClearAlerts={clearAlerts}
        stats={stats}
      />

      {/* Floating Alerts Panel */}
      <AlertsPanel
        alerts={alerts}
        onAcknowledge={acknowledgeAlert}
        onClearAll={clearAlerts}
        enableSound={true}
      />
    </div>
  )
}
