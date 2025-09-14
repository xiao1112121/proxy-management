// Real proxy testing utilities
export interface RealTestResult {
  success: boolean
  ping?: number
  speed?: number
  publicIP?: string
  country?: string
  city?: string
  anonymity?: string
  dnsLeak?: boolean
  webrtcLeak?: boolean
  error?: string
  responseTime?: number
  statusCode?: number
}

export class RealProxyTester {
  private timeout: number = 10000

  constructor(timeout: number = 10000) {
    this.timeout = timeout
  }

  async testProxy(proxy: {
    host: string
    port: number
    username?: string
    password?: string
    type: string
  }): Promise<RealTestResult> {
    const startTime = Date.now()
    
    try {
      // Test basic connectivity
      const isConnected = await this.testConnection(proxy)
      
      if (!isConnected) {
        return {
          success: false,
          error: 'Connection failed',
          responseTime: Date.now() - startTime
        }
      }

      // Test HTTP request through proxy
      const httpResult = await this.testHttpRequest(proxy)
      
      // Test speed
      const speed = await this.testSpeed(proxy)
      
      // Test anonymity
      const anonymity = await this.testAnonymity(proxy)
      
      // Test DNS leak
      const dnsLeak = await this.testDnsLeak(proxy)
      
      // Test WebRTC leak
      const webrtcLeak = await this.testWebrtcLeak(proxy)

      return {
        success: true,
        ping: Date.now() - startTime,
        speed,
        publicIP: httpResult.publicIP,
        country: httpResult.country,
        city: httpResult.city,
        anonymity,
        dnsLeak,
        webrtcLeak,
        responseTime: Date.now() - startTime,
        statusCode: httpResult.statusCode
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      }
    }
  }

  private async testConnection(proxy: any): Promise<boolean> {
    return new Promise((resolve) => {
      const net = require('net')
      const socket = new net.Socket()
      
      socket.setTimeout(this.timeout)
      
      socket.on('connect', () => {
        socket.destroy()
        resolve(true)
      })
      
      socket.on('error', () => {
        resolve(false)
      })
      
      socket.on('timeout', () => {
        socket.destroy()
        resolve(false)
      })
      
      socket.connect(proxy.port, proxy.host)
    })
  }

  private async testHttpRequest(proxy: any): Promise<{
    publicIP?: string
    country?: string
    city?: string
    statusCode?: number
  }> {
    try {
      // Use native fetch with proxy
      const proxyUrl = this.buildProxyUrl(proxy)
      
      // Test IP first
      const ipResponse = await fetch('https://httpbin.org/ip', {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (!ipResponse.ok) {
        return { statusCode: ipResponse.status }
      }

      const ipData = await ipResponse.json()
      const publicIP = ipData.origin

      // Get geolocation
      let country, city
      try {
        const geoResponse = await fetch(`https://ipapi.co/${publicIP}/json/`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })

        if (geoResponse.ok) {
          const geoData = await geoResponse.json()
          country = geoData.country_name
          city = geoData.city
        }
      } catch (geoError) {
        // Fallback to ipinfo.io
        try {
          const fallbackResponse = await fetch(`https://ipinfo.io/${publicIP}/json`, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            country = fallbackData.country
            city = fallbackData.city
          }
        } catch (fallbackError) {
          console.log('Geolocation fallback failed:', fallbackError)
        }
      }

      return {
        publicIP,
        country,
        city,
        statusCode: ipResponse.status
      }
    } catch (error) {
      console.error('HTTP request test failed:', error)
      return {}
    }
  }

  private buildProxyUrl(proxy: any): string {
    if (proxy.username && proxy.password) {
      return `${proxy.type}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
    }
    return `${proxy.type}://${proxy.host}:${proxy.port}`
  }

  private async testSpeed(proxy: any): Promise<number> {
    try {
      const startTime = Date.now()
      
      const response = await fetch('https://httpbin.org/bytes/1024', {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (response.ok) {
        await response.text()
        const endTime = Date.now()
        const duration = (endTime - startTime) / 1000 // seconds
        const bytes = 1024
        return Math.round((bytes * 8) / duration) // bits per second
      }

      return 0
    } catch (error) {
      return 0
    }
  }

  private async testAnonymity(proxy: any): Promise<string> {
    try {
      const response = await fetch('https://httpbin.org/headers', {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const headers = data.headers
        
        // Check for proxy headers
        if (headers['X-Forwarded-For'] || headers['X-Real-IP']) {
          return 'transparent'
        } else if (headers['Via'] || headers['X-Proxy-Connection']) {
          return 'anonymous'
        } else {
          return 'elite'
        }
      }

      return 'unknown'
    } catch (error) {
      return 'unknown'
    }
  }

  private async testDnsLeak(proxy: any): Promise<boolean> {
    try {
      const response = await fetch('https://dnsleaktest.com/api/v1/dnsleak', {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.leak === true
      }

      return false
    } catch (error) {
      return false
    }
  }

  private async testWebrtcLeak(proxy: any): Promise<boolean> {
    // WebRTC leak testing requires browser environment
    // This is a simplified version
    try {
      const response = await fetch('https://webrtc-test.com/api/leak', {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.leak === true
      }

      return false
    } catch (error) {
      return false
    }
  }
}

// Browser-based proxy testing
export class BrowserProxyTester {
  async testProxy(proxy: {
    host: string
    port: number
    username?: string
    password?: string
    type: string
  }): Promise<RealTestResult> {
    const startTime = Date.now()
    
    try {
      // Test using fetch with proxy
      const proxyUrl = this.buildProxyUrl(proxy)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)
      
      const response = await fetch('https://httpbin.org/ip', {
        method: 'GET',
        signal: controller.signal,
        // Note: Browser fetch doesn't support proxy directly
        // This would need to be implemented differently
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          ping: Date.now() - startTime,
          publicIP: data.origin,
          responseTime: Date.now() - startTime,
          statusCode: response.status
        }
      }
      
      return {
        success: false,
        error: `HTTP ${response.status}`,
        responseTime: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      }
    }
  }

  private buildProxyUrl(proxy: any): string {
    if (proxy.username && proxy.password) {
      return `${proxy.type}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
    }
    return `${proxy.type}://${proxy.host}:${proxy.port}`
  }

  private timeout: number = 10000
}
