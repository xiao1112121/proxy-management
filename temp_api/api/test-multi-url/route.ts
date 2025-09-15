import { NextRequest, NextResponse } from 'next/server'

interface MultiUrlTestRequest {
  proxy: {
    host: string
    port: number
    username?: string
    password?: string
    type: 'http' | 'https' | 'socks4' | 'socks5'
  }
  urls: {
    id: number
    name: string
    url: string
    type: string
  }[]
}

interface UrlTestResult {
  id: number
  name: string
  url: string
  type: string
  success: boolean
  responseTime?: number
  statusCode?: number
  error?: string
  data?: any
}

export async function POST(request: NextRequest) {
  try {
    const { proxy, urls }: MultiUrlTestRequest = await request.json()

    if (!proxy.host || !proxy.port || !urls.length) {
      return NextResponse.json({ 
        success: false, 
        error: 'Proxy and URLs are required' 
      }, { status: 400 })
    }

    const results: UrlTestResult[] = []

    // Test each URL
    for (const urlConfig of urls) {
      const startTime = Date.now()
      let success = false
      let responseTime = 0
      let statusCode = 0
      let error = ''
      let data = null

      try {
        // Create proxy URL
        let proxyUrl = ''
        if (proxy.username && proxy.password) {
          proxyUrl = `${proxy.type}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
        } else {
          proxyUrl = `${proxy.type}://${proxy.host}:${proxy.port}`
        }

        // Test with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

        const response = await fetch(urlConfig.url, {
          method: 'GET',
          signal: controller.signal,
          // Note: In a real implementation, you'd configure the proxy here
          // This is a simplified version for demonstration
        })

        clearTimeout(timeoutId)
        responseTime = Date.now() - startTime
        statusCode = response.status

        if (response.ok) {
          success = true
          try {
            data = await response.json()
          } catch {
            data = await response.text()
          }
        } else {
          error = `HTTP ${response.status}: ${response.statusText}`
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            error = 'Request timeout'
          } else {
            error = err.message
          }
        } else {
          error = 'Unknown error occurred'
        }
        responseTime = Date.now() - startTime
      }

      results.push({
        id: urlConfig.id,
        name: urlConfig.name,
        url: urlConfig.url,
        type: urlConfig.type,
        success,
        responseTime: success ? responseTime : undefined,
        statusCode: success ? statusCode : undefined,
        error: success ? undefined : error,
        data: success ? data : undefined
      })
    }

    // Calculate overall statistics
    const successfulTests = results.filter(r => r.success)
    const totalResponseTime = successfulTests.reduce((sum, r) => sum + (r.responseTime || 0), 0)
    const averageResponseTime = successfulTests.length > 0 ? totalResponseTime / successfulTests.length : 0

    return NextResponse.json({
      success: true,
      results,
      statistics: {
        total: results.length,
        successful: successfulTests.length,
        failed: results.length - successfulTests.length,
        successRate: results.length > 0 ? (successfulTests.length / results.length) * 100 : 0,
        averageResponseTime: Math.round(averageResponseTime)
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Multi-URL test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
