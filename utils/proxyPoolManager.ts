import { SimpleProxy as Proxy } from '@/types/proxy'
import { AdvancedProxyTester, AdvancedTestResult } from './advancedProxyTest'

export interface ProxyPoolConfig {
  maxRetries: number
  healthCheckInterval: number
  rotationInterval: number
  maxConcurrentTests: number
  timeout: number
}

export interface ProxyPoolStats {
  total: number
  alive: number
  dead: number
  testing: number
  averagePing: number
  averageSpeed: number
  successRate: number
  byType: Record<string, number>
  byCountry: Record<string, number>
  byAnonymity: Record<string, number>
}

export class ProxyPoolManager {
  private proxies: Map<number, Proxy> = new Map()
  private testResults: Map<number, AdvancedTestResult> = new Map()
  private healthCheckTimer?: NodeJS.Timeout
  private rotationTimer?: NodeJS.Timeout
  private config: ProxyPoolConfig
  private tester: AdvancedProxyTester
  private currentIndex: number = 0

  constructor(config: Partial<ProxyPoolConfig> = {}) {
    this.config = {
      maxRetries: 3,
      healthCheckInterval: 300000, // 5 minutes
      rotationInterval: 60000, // 1 minute
      maxConcurrentTests: 10,
      timeout: 15000,
      ...config
    }
    this.tester = new AdvancedProxyTester()
  }

  // Add proxy to pool
  addProxy(proxy: Proxy): void {
    this.proxies.set(proxy.id, proxy)
    this.startHealthCheck()
  }

  // Add multiple proxies
  addProxies(proxies: Proxy[]): void {
    proxies.forEach(proxy => this.addProxy(proxy))
  }

  // Remove proxy from pool
  removeProxy(id: number): void {
    this.proxies.delete(id)
    this.testResults.delete(id)
  }

  // Get proxy by ID
  getProxy(id: number): Proxy | undefined {
    return this.proxies.get(id)
  }

  // Get all proxies
  getAllProxies(): Proxy[] {
    return Array.from(this.proxies.values())
  }

  // Get alive proxies
  getAliveProxies(): Proxy[] {
    return this.getAllProxies().filter(proxy => proxy.status === 'alive')
  }

  // Get proxies by type
  getProxiesByType(type: string): Proxy[] {
    return this.getAllProxies().filter(proxy => proxy.type === type)
  }

  // Get proxies by country
  getProxiesByCountry(country: string): Proxy[] {
    return this.getAllProxies().filter(proxy => proxy.country === country)
  }

  // Get next proxy for rotation
  getNextProxy(): Proxy | null {
    const aliveProxies = this.getAliveProxies()
    if (aliveProxies.length === 0) return null

    const proxy = aliveProxies[this.currentIndex % aliveProxies.length]
    this.currentIndex++
    return proxy
  }

  // Get random proxy
  getRandomProxy(): Proxy | null {
    const aliveProxies = this.getAliveProxies()
    if (aliveProxies.length === 0) return null

    const randomIndex = Math.floor(Math.random() * aliveProxies.length)
    return aliveProxies[randomIndex]
  }

  // Get best proxy by criteria
  getBestProxy(criteria: {
    type?: string
    country?: string
    minSpeed?: number
    maxPing?: number
    anonymity?: string
  }): Proxy | null {
    let candidates = this.getAliveProxies()

    if (criteria.type) {
      candidates = candidates.filter(p => p.type === criteria.type)
    }

    if (criteria.country) {
      candidates = candidates.filter(p => p.country === criteria.country)
    }

    if (criteria.minSpeed) {
      candidates = candidates.filter(p => (p.speed || 0) >= criteria.minSpeed!)
    }

    if (criteria.maxPing) {
      candidates = candidates.filter(p => (p.ping || 0) <= criteria.maxPing!)
    }

    if (criteria.anonymity) {
      candidates = candidates.filter(p => p.anonymity === criteria.anonymity)
    }

    if (candidates.length === 0) return null

    // Sort by speed (descending) and ping (ascending)
    candidates.sort((a, b) => {
      const speedA = a.speed || 0
      const speedB = b.speed || 0
      const pingA = a.ping || 0
      const pingB = b.ping || 0

      if (speedA !== speedB) return speedB - speedA
      return pingA - pingB
    })

    return candidates[0]
  }

  // Test single proxy
  async testProxy(id: number): Promise<AdvancedTestResult> {
    const proxy = this.proxies.get(id)
    if (!proxy) {
      throw new Error('Proxy not found')
    }

    // Update status to testing
    proxy.status = 'testing'
    this.proxies.set(id, proxy)

    try {
      const result = await this.tester.testProxy(proxy)
      this.testResults.set(id, result)

      // Update proxy with results
      proxy.status = result.success ? 'alive' : 'dead'
      proxy.ping = result.ping
      proxy.speed = result.speed
      proxy.publicIP = result.publicIP
      proxy.country = result.country
      proxy.city = result.city
      proxy.anonymity = result.anonymity as 'transparent' | 'anonymous' | 'elite' | undefined
      proxy.dnsLeak = result.dnsLeak
      proxy.webrtcLeak = result.webrtcLeak
      proxy.lastTested = new Date().toISOString()

      this.proxies.set(id, proxy)
      return result
    } catch (error) {
      proxy.status = 'dead'
      proxy.lastTested = new Date().toISOString()
      this.proxies.set(id, proxy)

      const errorResult: AdvancedTestResult = {
        id: proxy.id,
        success: false,
        ping: 0,
        speed: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        testVersion: '2.0.0',
        userAgent: 'ProxyPoolManager/1.0.0'
      }
      this.testResults.set(id, errorResult)
      return errorResult
    }
  }

  // Test multiple proxies
  async testProxies(ids: number[]): Promise<Map<number, AdvancedTestResult>> {
    const results = new Map<number, AdvancedTestResult>()
    const chunks = this.chunkArray(ids, this.config.maxConcurrentTests)

    for (const chunk of chunks) {
      const promises = chunk.map(async (id) => {
        try {
          const result = await this.testProxy(id)
          results.set(id, result)
        } catch (error) {
          const proxy = this.proxies.get(id)
          results.set(id, {
            id: id,
            success: false,
            ping: 0,
            speed: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            testVersion: '2.0.0',
            userAgent: 'ProxyPoolManager/1.0.0'
          })
        }
      })

      await Promise.all(promises)
    }

    return results
  }

  // Test all proxies
  async testAllProxies(): Promise<Map<number, AdvancedTestResult>> {
    const allIds = Array.from(this.proxies.keys())
    return this.testProxies(allIds)
  }

  // Get pool statistics
  getStats(): ProxyPoolStats {
    const proxies = this.getAllProxies()
    const aliveProxies = proxies.filter(p => p.status === 'alive')
    const deadProxies = proxies.filter(p => p.status === 'dead')
    const testingProxies = proxies.filter(p => p.status === 'testing')

    const byType: Record<string, number> = {}
    const byCountry: Record<string, number> = {}
    const byAnonymity: Record<string, number> = {}

    proxies.forEach(proxy => {
      byType[proxy.type] = (byType[proxy.type] || 0) + 1
      if (proxy.country) {
        byCountry[proxy.country] = (byCountry[proxy.country] || 0) + 1
      }
      if (proxy.anonymity) {
        byAnonymity[proxy.anonymity] = (byAnonymity[proxy.anonymity] || 0) + 1
      }
    })

    const totalPing = aliveProxies.reduce((sum, p) => sum + (p.ping || 0), 0)
    const totalSpeed = aliveProxies.reduce((sum, p) => sum + (p.speed || 0), 0)
    const successCount = aliveProxies.length

    return {
      total: proxies.length,
      alive: aliveProxies.length,
      dead: deadProxies.length,
      testing: testingProxies.length,
      averagePing: successCount > 0 ? Math.round(totalPing / successCount) : 0,
      averageSpeed: successCount > 0 ? Math.round(totalSpeed / successCount) : 0,
      successRate: proxies.length > 0 ? (successCount / proxies.length) * 100 : 0,
      byType,
      byCountry,
      byAnonymity
    }
  }

  // Start health check
  startHealthCheck(): void {
    if (this.healthCheckTimer) return

    this.healthCheckTimer = setInterval(async () => {
      const deadProxies = this.getAllProxies().filter(p => p.status === 'dead')
      if (deadProxies.length > 0) {
        console.log(`Health check: Testing ${deadProxies.length} dead proxies`)
        await this.testProxies(deadProxies.map(p => p.id))
      }
    }, this.config.healthCheckInterval)
  }

  // Stop health check
  stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
      this.healthCheckTimer = undefined
    }
  }

  // Start rotation
  startRotation(): void {
    if (this.rotationTimer) return

    this.rotationTimer = setInterval(() => {
      // Rotate current index
      this.currentIndex = 0
    }, this.config.rotationInterval)
  }

  // Stop rotation
  stopRotation(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer)
      this.rotationTimer = undefined
    }
  }

  // Cleanup
  destroy(): void {
    this.stopHealthCheck()
    this.stopRotation()
    this.proxies.clear()
    this.testResults.clear()
  }

  // Helper methods
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  // Export proxies
  exportProxies(format: 'json' | 'csv' | 'txt'): string {
    const proxies = this.getAllProxies()
    
    switch (format) {
      case 'json':
        return JSON.stringify(proxies, null, 2)
      case 'csv':
        const headers = ['id', 'host', 'port', 'username', 'password', 'type', 'status', 'ping', 'speed', 'country', 'city', 'anonymity']
        const csvRows = [headers.join(',')]
        proxies.forEach(proxy => {
          const row = headers.map(header => {
            const value = (proxy as any)[header] || ''
            return `"${value}"`
          })
          csvRows.push(row.join(','))
        })
        return csvRows.join('\n')
      case 'txt':
        return proxies.map(proxy => {
          const auth = proxy.username && proxy.password ? `${proxy.username}:${proxy.password}@` : ''
          return `${proxy.host}:${proxy.port}${auth ? `:${proxy.username}:${proxy.password}` : ''}`
        }).join('\n')
      default:
        return ''
    }
  }

  // Import proxies
  importProxies(data: string, format: 'json' | 'csv' | 'txt'): Proxy[] {
    const proxies: Proxy[] = []
    
    try {
      switch (format) {
        case 'json':
          const jsonData = JSON.parse(data)
          if (Array.isArray(jsonData)) {
            jsonData.forEach((item, index) => {
              if (item.host && item.port) {
                proxies.push({
                  id: Date.now() + index,
                  host: item.host,
                  port: item.port,
                  username: item.username,
                  password: item.password,
                  type: item.type || 'http',
                  status: 'pending',
                  group: item.group || 'imported'
                })
              }
            })
          }
          break
        case 'csv':
          const lines = data.split('\n')
          const headers = lines[0].split(',').map(h => h.replace(/"/g, ''))
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.replace(/"/g, ''))
            if (values.length >= 2) {
              const proxy: any = { id: Date.now() + i, status: 'pending' }
              headers.forEach((header, index) => {
                if (values[index]) {
                  proxy[header] = values[index]
                }
              })
              if (proxy.host && proxy.port) {
                proxies.push(proxy)
              }
            }
          }
          break
        case 'txt':
          const txtLines = data.split('\n')
          txtLines.forEach((line, index) => {
            const trimmed = line.trim()
            if (trimmed && !trimmed.startsWith('#')) {
              const parts = trimmed.split(':')
              if (parts.length >= 2) {
                const proxy: Proxy = {
                  id: Date.now() + index,
                  host: parts[0],
                  port: parseInt(parts[1]),
                  username: parts[2],
                  password: parts[3],
                  type: 'http',
                  status: 'pending',
                  group: 'imported'
                }
                proxies.push(proxy)
              }
            }
          })
          break
      }
    } catch (error) {
      console.error('Import error:', error)
    }
    
    return proxies
  }
}
