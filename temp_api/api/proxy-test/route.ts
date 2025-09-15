import { NextRequest, NextResponse } from 'next/server'
import { AdvancedProxyTester } from '@/utils/advancedProxyTest'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { host, port, username, password, type, testType = 'full' } = body

    if (!host || !port) {
      return NextResponse.json(
        { error: 'Host and port are required' },
        { status: 400 }
      )
    }

    const tester = new AdvancedProxyTester()
    
    let result
    if (testType === 'quick') {
      // Quick test - only basic connectivity
      result = await quickTest(host, port, username, password, type)
    } else {
      // Full test - comprehensive testing
      result = await tester.testProxy({
        id: 0,
        host,
        port: parseInt(port),
        username,
        password,
        type: type || 'http',
        status: 'pending'
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Proxy test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

async function quickTest(
  host: string, 
  port: number, 
  username?: string, 
  password?: string, 
  type?: string
) {
  const startTime = Date.now()
  
  try {
    // Test basic connectivity
    const net = require('net')
    const socket = new net.Socket()
    
    return new Promise((resolve) => {
      socket.setTimeout(10000)
      
      socket.on('connect', () => {
        socket.destroy()
        resolve({
          success: true,
          ping: Date.now() - startTime,
          responseTime: Date.now() - startTime
        })
      })
      
      socket.on('error', (error: any) => {
        resolve({
          success: false,
          error: error.message,
          responseTime: Date.now() - startTime
        })
      })
      
      socket.on('timeout', () => {
        socket.destroy()
        resolve({
          success: false,
          error: 'Connection timeout',
          responseTime: Date.now() - startTime
        })
      })
      
      socket.connect(port, host)
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
      responseTime: Date.now() - startTime
    }
  }
}
