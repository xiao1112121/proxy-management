import { NextRequest, NextResponse } from 'next/server'

interface HealthStatus {
  timestamp: string
  overall: 'healthy' | 'warning' | 'critical'
  services: {
    database: HealthServiceStatus
    api: HealthServiceStatus
    proxy: HealthServiceStatus
    storage: HealthServiceStatus
  }
  metrics: {
    uptime: number
    responseTime: number
    errorRate: number
    activeConnections: number
  }
  alerts: HealthAlert[]
}

interface HealthServiceStatus {
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  responseTime: number
  lastCheck: string
  error?: string
}

interface HealthAlert {
  id: string
  level: 'info' | 'warning' | 'critical'
  message: string
  timestamp: string
  service: string
  resolved: boolean
}

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    
    // Simulate health checks for different services
    const services = {
      database: await checkDatabaseHealth(),
      api: await checkApiHealth(),
      proxy: await checkProxyHealth(),
      storage: await checkStorageHealth()
    }

    // Calculate overall health status
    const overall = calculateOverallHealth(services)
    
    // Generate metrics
    const metrics = {
      uptime: Math.floor(Math.random() * 86400) + 3600, // 1-24 hours in seconds
      responseTime: Math.random() * 200 + 50, // 50-250ms
      errorRate: Math.random() * 5, // 0-5%
      activeConnections: Math.floor(Math.random() * 1000) + 100
    }

    // Generate alerts
    const alerts = generateAlerts(services)

    const healthStatus: HealthStatus = {
      timestamp: now.toISOString(),
      overall,
      services,
      metrics,
      alerts
    }

    return NextResponse.json({
      success: true,
      data: healthStatus
    })

  } catch (error) {
    console.error('Health monitoring error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch health status' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    switch (action) {
      case 'start_monitoring':
        return NextResponse.json({
          success: true,
          message: 'Health monitoring started',
          data: {
            interval: 30000, // 30 seconds
            services: ['database', 'api', 'proxy', 'storage']
          }
        })

      case 'stop_monitoring':
        return NextResponse.json({
          success: true,
          message: 'Health monitoring stopped'
        })

      case 'resolve_alert':
        const { alertId } = data
        return NextResponse.json({
          success: true,
          message: `Alert ${alertId} resolved`
        })

      case 'get_health_history':
        const { startDate, endDate } = data || {}
        const history = generateHealthHistory(startDate, endDate)
        return NextResponse.json({
          success: true,
          data: history
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Health monitoring error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

async function checkDatabaseHealth(): Promise<HealthServiceStatus> {
  const startTime = Date.now()
  
  try {
    // Simulate database health check
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50))
    
    const responseTime = Date.now() - startTime
    const isHealthy = Math.random() > 0.1 // 90% chance of being healthy
    
    return {
      status: isHealthy ? 'healthy' : 'warning',
      responseTime,
      lastCheck: new Date().toISOString(),
      error: isHealthy ? undefined : 'Connection timeout'
    }
  } catch (error) {
    return {
      status: 'critical',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      error: 'Database connection failed'
    }
  }
}

async function checkApiHealth(): Promise<HealthServiceStatus> {
  const startTime = Date.now()
  
  try {
    // Simulate API health check
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 20))
    
    const responseTime = Date.now() - startTime
    const isHealthy = Math.random() > 0.05 // 95% chance of being healthy
    
    return {
      status: isHealthy ? 'healthy' : 'warning',
      responseTime,
      lastCheck: new Date().toISOString(),
      error: isHealthy ? undefined : 'High response time'
    }
  } catch (error) {
    return {
      status: 'critical',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      error: 'API service unavailable'
    }
  }
}

async function checkProxyHealth(): Promise<HealthServiceStatus> {
  const startTime = Date.now()
  
  try {
    // Simulate proxy health check
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100))
    
    const responseTime = Date.now() - startTime
    const isHealthy = Math.random() > 0.15 // 85% chance of being healthy
    
    return {
      status: isHealthy ? 'healthy' : 'warning',
      responseTime,
      lastCheck: new Date().toISOString(),
      error: isHealthy ? undefined : 'Proxy connection issues'
    }
  } catch (error) {
    return {
      status: 'critical',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      error: 'Proxy service down'
    }
  }
}

async function checkStorageHealth(): Promise<HealthServiceStatus> {
  const startTime = Date.now()
  
  try {
    // Simulate storage health check
    await new Promise(resolve => setTimeout(resolve, Math.random() * 80 + 30))
    
    const responseTime = Date.now() - startTime
    const isHealthy = Math.random() > 0.08 // 92% chance of being healthy
    
    return {
      status: isHealthy ? 'healthy' : 'warning',
      responseTime,
      lastCheck: new Date().toISOString(),
      error: isHealthy ? undefined : 'Storage space low'
    }
  } catch (error) {
    return {
      status: 'critical',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      error: 'Storage service unavailable'
    }
  }
}

function calculateOverallHealth(services: any): 'healthy' | 'warning' | 'critical' {
  const statuses = Object.values(services).map((service: any) => service.status)
  
  if (statuses.includes('critical')) return 'critical'
  if (statuses.includes('warning')) return 'warning'
  if (statuses.includes('unknown')) return 'warning'
  return 'healthy'
}

function generateAlerts(services: any): HealthAlert[] {
  const alerts: HealthAlert[] = []
  
  Object.entries(services).forEach(([serviceName, service]: [string, any]) => {
    if (service.status === 'warning' || service.status === 'critical') {
      alerts.push({
        id: `alert-${serviceName}-${Date.now()}`,
        level: service.status === 'critical' ? 'critical' : 'warning',
        message: service.error || `${serviceName} service is ${service.status}`,
        timestamp: new Date().toISOString(),
        service: serviceName,
        resolved: false
      })
    }
  })
  
  return alerts
}

function generateHealthHistory(startDate?: string, endDate?: string) {
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000)
  const end = endDate ? new Date(endDate) : new Date()
  
  const history = []
  const interval = 5 * 60 * 1000 // 5 minutes
  
  for (let time = start.getTime(); time <= end.getTime(); time += interval) {
    history.push({
      timestamp: new Date(time).toISOString(),
      overall: Math.random() > 0.1 ? 'healthy' : 'warning',
      services: {
        database: { status: Math.random() > 0.05 ? 'healthy' : 'warning' },
        api: { status: Math.random() > 0.03 ? 'healthy' : 'warning' },
        proxy: { status: Math.random() > 0.08 ? 'healthy' : 'warning' },
        storage: { status: Math.random() > 0.06 ? 'healthy' : 'warning' }
      }
    })
  }
  
  return history
}
