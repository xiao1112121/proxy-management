import { NextRequest, NextResponse } from 'next/server'

interface PerformanceMetrics {
  timestamp: string
  system: {
    cpu: number
    memory: number
    disk: number
  }
  network: {
    latency: number
    bandwidth: number
    packetLoss: number
  }
  application: {
    responseTime: number
    throughput: number
    errorRate: number
  }
  proxies: {
    total: number
    active: number
    tested: number
    successRate: number
  }
}

export async function GET(request: NextRequest) {
  try {
    // Simulate real performance metrics collection
    const now = new Date()
    
    // System metrics (simulated)
    const systemMetrics = {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100
    }

    // Network metrics (simulated)
    const networkMetrics = {
      latency: Math.random() * 100 + 10, // 10-110ms
      bandwidth: Math.random() * 1000 + 100, // 100-1100 Mbps
      packetLoss: Math.random() * 5 // 0-5%
    }

    // Application metrics (simulated)
    const applicationMetrics = {
      responseTime: Math.random() * 500 + 50, // 50-550ms
      throughput: Math.random() * 1000 + 100, // 100-1100 req/s
      errorRate: Math.random() * 10 // 0-10%
    }

    // Proxy metrics (simulated)
    const proxyMetrics = {
      total: Math.floor(Math.random() * 1000) + 100,
      active: Math.floor(Math.random() * 800) + 50,
      tested: Math.floor(Math.random() * 500) + 20,
      successRate: Math.random() * 40 + 60 // 60-100%
    }

    const metrics: PerformanceMetrics = {
      timestamp: now.toISOString(),
      system: systemMetrics,
      network: networkMetrics,
      application: applicationMetrics,
      proxies: proxyMetrics
    }

    return NextResponse.json({
      success: true,
      data: metrics
    })

  } catch (error) {
    console.error('Performance metrics error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch performance metrics' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    switch (action) {
      case 'start_monitoring':
        // Start real-time monitoring
        return NextResponse.json({
          success: true,
          message: 'Performance monitoring started',
          data: {
            interval: 5000, // 5 seconds
            metrics: ['system', 'network', 'application', 'proxies']
          }
        })

      case 'stop_monitoring':
        // Stop real-time monitoring
        return NextResponse.json({
          success: true,
          message: 'Performance monitoring stopped'
        })

      case 'get_historical':
        // Get historical performance data
        const { startDate, endDate, interval = '1h' } = data || {}
        
        // Simulate historical data
        const historicalData = generateHistoricalData(startDate, endDate, interval)
        
        return NextResponse.json({
          success: true,
          data: historicalData
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Performance monitoring error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

function generateHistoricalData(startDate?: string, endDate?: string, interval: string = '1h') {
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
  const end = endDate ? new Date(endDate) : new Date()
  
  const data = []
  const intervalMs = getIntervalMs(interval)
  
  for (let time = start.getTime(); time <= end.getTime(); time += intervalMs) {
    data.push({
      timestamp: new Date(time).toISOString(),
      system: {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100
      },
      network: {
        latency: Math.random() * 100 + 10,
        bandwidth: Math.random() * 1000 + 100,
        packetLoss: Math.random() * 5
      },
      application: {
        responseTime: Math.random() * 500 + 50,
        throughput: Math.random() * 1000 + 100,
        errorRate: Math.random() * 10
      },
      proxies: {
        total: Math.floor(Math.random() * 1000) + 100,
        active: Math.floor(Math.random() * 800) + 50,
        tested: Math.floor(Math.random() * 500) + 20,
        successRate: Math.random() * 40 + 60
      }
    })
  }
  
  return data
}

function getIntervalMs(interval: string): number {
  switch (interval) {
    case '1m': return 60 * 1000
    case '5m': return 5 * 60 * 1000
    case '15m': return 15 * 60 * 1000
    case '1h': return 60 * 60 * 1000
    case '6h': return 6 * 60 * 60 * 1000
    case '1d': return 24 * 60 * 60 * 1000
    default: return 60 * 60 * 1000 // 1 hour default
  }
}
