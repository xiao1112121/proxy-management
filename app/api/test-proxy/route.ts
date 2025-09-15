import { NextRequest, NextResponse } from 'next/server'
import { RealProxyTester } from '@/utils/realProxyTest'

import { ProxyType } from '@/types/proxy'

interface ProxyTestRequest {
  host: string
  port: number
  username?: string
  password?: string
  type: ProxyType
  testUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    const { host, port, username, password, type, testUrl }: ProxyTestRequest = await request.json()

    if (!host || !port) {
      return NextResponse.json({ 
        success: false, 
        error: 'Host and port are required' 
      }, { status: 400 })
    }

    // Validate proxy configuration
    const validation = RealProxyTester.validateProxy({ host, port, username, password, type })
    if (!validation.valid) {
      return NextResponse.json({ 
        success: false, 
        error: validation.error 
      }, { status: 400 })
    }

    // Test proxy using the real tester
    const result = await RealProxyTester.testProxy(
      { host, port, username, password, type },
      testUrl || 'https://web.telegram.org/'
    )

    return NextResponse.json({
      success: result.success,
      ping: result.ping,
      speed: result.speed,
      responseTime: result.responseTime,
      statusCode: result.statusCode,
      error: result.error,
      data: result.data,
      country: result.country,
      city: result.city,
      region: result.region,
      isp: result.isp,
      publicIP: result.publicIP,
      anonymity: result.anonymity,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Proxy test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
