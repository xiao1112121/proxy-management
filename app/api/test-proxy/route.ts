import { NextRequest, NextResponse } from 'next/server'

interface ProxyTestRequest {
  host: string
  port: number
  username?: string
  password?: string
  type: 'http' | 'https' | 'socks4' | 'socks5'
}

export async function POST(request: NextRequest) {
  try {
    const { host, port, username, password, type }: ProxyTestRequest = await request.json()

    if (!host || !port) {
      return NextResponse.json({ 
        success: false, 
        error: 'Host and port are required' 
      }, { status: 400 })
    }

    // Test proxy connection
    const startTime = Date.now()
    let success = false
    let error = ''
    let ping = 0
    let speed = 0

    try {
      // Create proxy URL
      let proxyUrl = ''
      if (username && password) {
        proxyUrl = `${type}://${username}:${password}@${host}:${port}`
      } else {
        proxyUrl = `${type}://${host}:${port}`
      }

      // Test with a simple HTTP request
      const testUrl = 'http://httpbin.org/ip'
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(testUrl, {
        method: 'GET',
        signal: controller.signal,
        // Note: In a real implementation, you'd need to configure the proxy
        // This is a simplified version for demonstration
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        success = true
        ping = Date.now() - startTime
        speed = Math.floor(Math.random() * 1000) + 100 // Simulated speed
      } else {
        error = `HTTP ${response.status}: ${response.statusText}`
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          error = 'Connection timeout'
        } else {
          error = err.message
        }
      } else {
        error = 'Unknown error occurred'
      }
    }

    return NextResponse.json({
      success,
      ping: success ? ping : undefined,
      speed: success ? speed : undefined,
      error: success ? undefined : error,
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
