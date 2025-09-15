import { NextRequest, NextResponse } from 'next/server'
import { RealProxyTester } from '@/utils/realProxyTest'

interface ProxyConfig {
  id: number
  host: string
  port: number
  username?: string
  password?: string
  type: 'http' | 'https' | 'socks4' | 'socks5'
}

interface MultipleProxyTestRequest {
  proxies: ProxyConfig[]
  testUrl?: string
  concurrency?: number
}

export async function POST(request: NextRequest) {
  try {
    const { proxies, testUrl, concurrency = 5 }: MultipleProxyTestRequest = await request.json()

    if (!proxies || !Array.isArray(proxies) || proxies.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Proxies array is required and must not be empty' 
      }, { status: 400 })
    }

    // Validate all proxies
    const validationErrors = proxies.map((proxy, index) => {
      const validation = RealProxyTester.validateProxy(proxy)
      return validation.valid ? null : { index, error: validation.error }
    }).filter(Boolean)

    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid proxy configurations', 
        details: validationErrors 
      }, { status: 400 })
    }

    // Test proxies in batches
    const results = []
    const testUrlToUse = testUrl || 'http://httpbin.org/ip'
    
    for (let i = 0; i < proxies.length; i += concurrency) {
      const batch = proxies.slice(i, i + concurrency)
      const batchResults = await Promise.all(
        batch.map(async (proxy) => {
          const result = await RealProxyTester.testProxy(proxy, testUrlToUse)
          return {
            id: proxy.id,
            host: proxy.host,
            port: proxy.port,
            type: proxy.type,
            ...result
          }
        })
      )
      results.push(...batchResults)
    }

    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: totalCount,
        successful: successCount,
        failed: totalCount - successCount,
        successRate: totalCount > 0 ? (successCount / totalCount * 100).toFixed(2) : 0
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Multiple proxy test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
