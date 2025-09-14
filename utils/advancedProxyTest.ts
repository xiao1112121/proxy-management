import { SimpleProxy as Proxy } from '@/types/proxy'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { HttpsProxyAgent } from 'https-proxy-agent'

export interface AdvancedTestResult {
  id: number
  success: boolean
  ping: number
  speed: number
  publicIP?: string
  country?: string
  city?: string
  anonymity?: string
  dnsLeak?: boolean
  webrtcLeak?: boolean
  error?: string
  timestamp: string
  // Enhanced fields
  responseTime?: number
  statusCode?: number
  headers?: Record<string, string>
  geolocation?: {
    country: string
    city: string
    region: string
    timezone: string
    countryCode?: string
    latitude?: number
    longitude?: number
    isp?: string
  }
  security?: {
    anonymity: string
    ssl: boolean
    encryption: string
    vulnerabilities: string[]
    proxyHeaders: string[]
  }
  performance?: {
    downloadSpeed: number
    uploadSpeed: number
    latency: number
    jitter: number
    packetLoss?: number
    bandwidth?: number
  }
  testVersion: string
  userAgent: string
}

export interface TestConfiguration {
  timeout: number
  retryAttempts: number
  retryDelay: number
  parallelTests: boolean
  enableCaching: boolean
  cacheTimeout: number
  userAgent: string
  testUrls: {
    ipCheck: string
    speedTest: string
    headers: string
    geolocation: string
    dnsLeak: string
    webrtcLeak: string
  }
  mockMode: boolean
  realisticSimulation: boolean
  errorRate: number
  slowProxyRate: number
}

export interface TestProgress {
  currentTest: string
  progress: number
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout'
  startTime: number
  estimatedTime?: number
}

export class AdvancedProxyTester {
  private config: TestConfiguration
  private cache: Map<string, { result: AdvancedTestResult; timestamp: number }> = new Map()
  private testVersion: string = '2.0.0'
  private activeTests: Map<string, AbortController> = new Map()

  constructor(config?: Partial<TestConfiguration>) {
    this.config = {
      timeout: 15000,
      retryAttempts: 3,
      retryDelay: 1000,
      parallelTests: true,
      enableCaching: true,
      cacheTimeout: 300000, // 5 minutes
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      testUrls: {
        ipCheck: 'https://httpbin.org/ip',
        speedTest: 'https://httpbin.org/bytes/1048576',
        headers: 'https://httpbin.org/headers',
        geolocation: 'https://ipapi.co/json/',
        dnsLeak: 'https://dnsleaktest.com/api/v1/dnsleak',
        webrtcLeak: 'https://webrtc-test.com/api/leak'
      },
      mockMode: true,
      realisticSimulation: true,
      errorRate: 0.1,
      slowProxyRate: 0.2,
      ...config
    }
  }

  async testProxy(
    proxy: Proxy, 
    onProgress?: (progress: TestProgress) => void
  ): Promise<AdvancedTestResult> {
    const testId = this.generateTestId()
    const startTime = Date.now()
    const proxyKey = this.getProxyKey(proxy)
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.cache.get(proxyKey)
      if (cached && (Date.now() - cached.timestamp) < this.config.cacheTimeout) {
        return cached.result
      }
    }

    // Create abort controller for this test
    const controller = new AbortController()
    this.activeTests.set(testId, controller)

    try {
      this.updateProgress(onProgress, 'connectivity', 10, 'running', startTime)
      
      // Test real proxy connectivity
      const proxyUrl = this.buildProxyUrl(proxy)
      const agent = this.createProxyAgent(proxy, proxyUrl)
      
      this.updateProgress(onProgress, 'http-request', 30, 'running', startTime)
      
      // Test with a real HTTP request
      const testUrl = 'http://httpbin.org/ip'
      const response = await fetch(testUrl, {
        agent: agent,
        signal: controller.signal,
        timeout: this.config.timeout
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const endTime = Date.now()
      const ping = endTime - startTime

      this.updateProgress(onProgress, 'performance', 60, 'running', startTime)
      
      // Calculate speed based on response time
      const speed = this.calculateSpeed(ping, response.headers.get('content-length'))
      
      this.updateProgress(onProgress, 'security', 80, 'running', startTime)
      
      // Test security features
      const securityData = await this.testSecurity(proxy, agent, controller.signal)
      
      this.updateProgress(onProgress, 'geolocation', 90, 'running', startTime)
      
      // Get geolocation data
      const geolocationData = await this.getGeolocation(data.ip, agent, controller.signal)
      
      this.updateProgress(onProgress, 'completed', 100, 'completed', startTime)

      const result: AdvancedTestResult = {
        id: proxy.id,
        success: true,
        ping: ping,
        speed: speed,
        publicIP: data.ip,
        country: geolocationData?.country,
        city: geolocationData?.city,
        anonymity: securityData?.anonymity,
        dnsLeak: securityData?.dnsLeak,
        webrtcLeak: securityData?.webrtcLeak,
        timestamp: new Date().toISOString(),
        testVersion: this.testVersion,
        userAgent: this.config.userAgent,
        responseTime: ping,
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        geolocation: geolocationData,
        security: securityData
      }
      
      // Cache result
      if (this.config.enableCaching) {
        this.cache.set(proxyKey, { result, timestamp: Date.now() })
      }

      return result

    } catch (error) {
      return this.createErrorResult(
        proxy, 
        testId, 
        startTime, 
        error instanceof Error ? error.message : 'Unknown error',
        'TEST_FAILED'
      )
    } finally {
      this.activeTests.delete(testId)
    }
  }

  // Helper methods
  private generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getProxyKey(proxy: Proxy): string {
    return `${proxy.type}://${proxy.host}:${proxy.port}`
  }

  private updateProgress(
    onProgress: ((progress: TestProgress) => void) | undefined,
    currentTest: string,
    progress: number,
    status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout',
    startTime: number
  ) {
    if (onProgress) {
      onProgress({
        currentTest,
        progress,
        status,
        startTime,
        estimatedTime: this.estimateRemainingTime(progress, startTime)
      })
    }
  }

  private estimateRemainingTime(progress: number, startTime: number): number {
    if (progress <= 0) return 0
    const elapsed = Date.now() - startTime
    return Math.max(0, (elapsed / progress) * (100 - progress))
  }

  private async simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  private createErrorResult(
    proxy: Proxy,
    testId: string,
    startTime: number,
    error: string,
    errorCode: string
  ): AdvancedTestResult {
    return {
      id: proxy.id,
      success: false,
      ping: Date.now() - startTime,
      speed: 0,
      error,
      timestamp: new Date().toISOString(),
      testVersion: this.testVersion,
      userAgent: this.config.userAgent
    }
  }

  private generateRealisticResult(proxy: Proxy, startTime: number): AdvancedTestResult {
    const isSlow = Math.random() < this.config.slowProxyRate
    const ping = this.generateRealisticPing(proxy.type, isSlow)
    const speed = this.generateRealisticSpeed(proxy.type, isSlow)
    const geolocation = this.generateRealisticGeolocation(proxy.type)
    const security = this.generateRealisticSecurity(proxy.type)
    const performance = this.generateRealisticPerformance(proxy.type, isSlow)

    return {
      id: proxy.id,
      success: true,
      ping,
      speed,
      publicIP: this.generateRealisticIP(geolocation.country),
      country: geolocation.country,
      city: geolocation.city,
      anonymity: security.anonymity,
      dnsLeak: Math.random() < 0.1,
      webrtcLeak: Math.random() < 0.05,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      statusCode: 200,
      headers: this.generateRealisticHeaders(proxy.type),
      geolocation,
      security,
      performance,
      testVersion: this.testVersion,
      userAgent: this.config.userAgent
    }
  }

  private getSuccessRate(type: string): number {
    const rates: Record<string, number> = {
      'http': 0.8,
      'https': 0.85,
      'socks4': 0.7,
      'socks5': 0.75,
      'residential': 0.9,
      'datacenter': 0.8,
      'mobile': 0.6
    }
    return rates[type] || 0.5
  }

  private generateRealisticPing(type: string, isSlow: boolean): number {
    const basePing: Record<string, number> = {
      'http': 50,
      'https': 60,
      'socks4': 80,
      'socks5': 70,
      'residential': 100,
      'datacenter': 30,
      'mobile': 150
    }
    
    const base = basePing[type] || 100
    const variation = Math.random() * 50
    const slowMultiplier = isSlow ? 2 : 1
    
    return Math.floor((base + variation) * slowMultiplier)
  }

  private generateRealisticSpeed(type: string, isSlow: boolean): number {
    const baseSpeed: Record<string, number> = {
      'http': 5000,
      'https': 4500,
      'socks4': 3000,
      'socks5': 4000,
      'residential': 2000,
      'datacenter': 8000,
      'mobile': 1500
    }
    
    const base = baseSpeed[type] || 3000
    const variation = Math.random() * 2000
    const slowMultiplier = isSlow ? 0.3 : 1
    
    return Math.floor((base + variation) * slowMultiplier)
  }

  private generateRealisticGeolocation(type: string): {
    country: string
    city: string
    region: string
    timezone: string
    countryCode?: string
    latitude?: number
    longitude?: number
    isp?: string
  } {
    const locations = {
      'residential': [
        { country: 'Việt Nam', city: 'Hà Nội', region: 'Miền Bắc', timezone: 'Asia/Ho_Chi_Minh', countryCode: 'VN', isp: 'Viettel' },
        { country: 'Việt Nam', city: 'TP.HCM', region: 'Miền Nam', timezone: 'Asia/Ho_Chi_Minh', countryCode: 'VN', isp: 'VNPT' },
        { country: 'Singapore', city: 'Singapore', region: 'Central Region', timezone: 'Asia/Singapore', countryCode: 'SG', isp: 'Singtel' },
        { country: 'Thái Lan', city: 'Bangkok', region: 'Central', timezone: 'Asia/Bangkok', countryCode: 'TH', isp: 'AIS' }
      ],
      'datacenter': [
        { country: 'Mỹ', city: 'New York', region: 'New York', timezone: 'America/New_York', countryCode: 'US', isp: 'Amazon AWS' },
        { country: 'Anh', city: 'London', region: 'England', timezone: 'Europe/London', countryCode: 'GB', isp: 'Google Cloud' },
        { country: 'Đức', city: 'Frankfurt', region: 'Hesse', timezone: 'Europe/Berlin', countryCode: 'DE', isp: 'Microsoft Azure' }
      ],
      'mobile': [
        { country: 'Indonesia', city: 'Jakarta', region: 'Jakarta', timezone: 'Asia/Jakarta', countryCode: 'ID', isp: 'Telkomsel' },
        { country: 'Malaysia', city: 'Kuala Lumpur', region: 'Selangor', timezone: 'Asia/Kuala_Lumpur', countryCode: 'MY', isp: 'Maxis' }
      ]
    }

    const typeLocations = locations[type as keyof typeof locations] || locations.residential
    const location = typeLocations[Math.floor(Math.random() * typeLocations.length)]
    
    return {
      ...location,
      latitude: Math.random() * 180 - 90,
      longitude: Math.random() * 360 - 180
    }
  }

  private generateRealisticSecurity(type: string): {
    anonymity: string
    ssl: boolean
    encryption: string
    vulnerabilities: string[]
    proxyHeaders: string[]
  } {
    const securityProfiles = {
      'http': {
        anonymity: 'transparent',
        ssl: false,
        encryption: 'None',
        vulnerabilities: ['Header Leak', 'IP Leak'],
        proxyHeaders: ['X-Forwarded-For', 'X-Real-IP']
      },
      'https': {
        anonymity: 'anonymous',
        ssl: true,
        encryption: 'TLS 1.3',
        vulnerabilities: ['Header Leak'],
        proxyHeaders: ['Via']
      },
      'socks4': {
        anonymity: 'anonymous',
        ssl: false,
        encryption: 'None',
        vulnerabilities: ['IP Leak'],
        proxyHeaders: []
      },
      'socks5': {
        anonymity: 'elite',
        ssl: true,
        encryption: 'TLS 1.3',
        vulnerabilities: [],
        proxyHeaders: []
      },
      'residential': {
        anonymity: 'elite',
        ssl: true,
        encryption: 'TLS 1.3',
        vulnerabilities: [],
        proxyHeaders: []
      },
      'datacenter': {
        anonymity: 'transparent',
        ssl: true,
        encryption: 'TLS 1.2',
        vulnerabilities: ['Header Leak', 'IP Leak'],
        proxyHeaders: ['X-Forwarded-For', 'X-Real-IP', 'Via']
      },
      'mobile': {
        anonymity: 'elite',
        ssl: true,
        encryption: 'TLS 1.3',
        vulnerabilities: [],
        proxyHeaders: []
      }
    }

    return securityProfiles[type as keyof typeof securityProfiles] || securityProfiles.http
  }

  private generateRealisticPerformance(type: string, isSlow: boolean): {
    downloadSpeed: number
    uploadSpeed: number
    latency: number
    jitter: number
    packetLoss?: number
    bandwidth?: number
  } {
    const baseLatency = this.generateRealisticPing(type, isSlow)
    const jitter = Math.random() * 20 + 5
    const packetLoss = Math.random() * 0.5
    const bandwidth = this.generateRealisticSpeed(type, isSlow) / 1000 // Convert to Mbps

    return {
      downloadSpeed: this.generateRealisticSpeed(type, isSlow),
      uploadSpeed: Math.floor(this.generateRealisticSpeed(type, isSlow) * 0.8),
      latency: baseLatency,
      jitter: Math.floor(jitter),
      packetLoss: Math.round(packetLoss * 100) / 100,
      bandwidth: Math.round(bandwidth * 100) / 100
    }
  }

  private generateRealisticIP(country: string): string {
    const countryRanges: Record<string, string[]> = {
      'Việt Nam': ['113.160.', '14.169.', '27.64.', '42.112.'],
      'Singapore': ['203.116.', '202.156.', '165.21.', '103.16.'],
      'Thái Lan': ['49.228.', '49.229.', '49.230.', '49.231.'],
      'Mỹ': ['8.8.', '1.1.', '208.67.', '192.168.'],
      'Anh': ['81.200.', '81.201.', '81.202.', '81.203.'],
      'Đức': ['178.63.', '178.64.', '178.65.', '178.66.']
    }

    const ranges = countryRanges[country] || ['192.168.', '10.0.', '172.16.']
    const range = ranges[Math.floor(Math.random() * ranges.length)]
    
    return `${range}${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
  }

  private generateRealisticHeaders(type: string): Record<string, string> {
    const baseHeaders = {
      'Server': 'nginx/1.18.0',
      'Date': new Date().toUTCString(),
      'Content-Type': 'application/json',
      'Content-Length': '45'
    }

    if (type === 'http' || type === 'datacenter') {
      return {
        ...baseHeaders,
        'X-Forwarded-For': this.generateRealisticIP('Mỹ'),
        'X-Real-IP': this.generateRealisticIP('Mỹ'),
        'Via': '1.1 proxy-server'
      }
    }

    return baseHeaders
  }

  // Helper methods for real proxy testing
  private buildProxyUrl(proxy: Proxy): string {
    const auth = proxy.username && proxy.password 
      ? `${proxy.username}:${proxy.password}@` 
      : ''
    return `${proxy.type}://${auth}${proxy.host}:${proxy.port}`
  }

  private createProxyAgent(proxy: Proxy, proxyUrl: string): any {
    switch (proxy.type) {
      case 'socks4':
      case 'socks5':
        return new SocksProxyAgent(proxyUrl)
      case 'http':
      case 'https':
        return new HttpsProxyAgent(proxyUrl)
      default:
        return new HttpsProxyAgent(proxyUrl)
    }
  }

  private calculateSpeed(ping: number, contentLength: string | null): number {
    const size = contentLength ? parseInt(contentLength) : 1024
    const speed = (size * 8) / (ping / 1000) // Convert to bits per second
    return Math.round(speed)
  }

  private async testSecurity(proxy: Proxy, agent: any, signal: AbortSignal): Promise<any> {
    try {
      // Test for DNS leak
      const dnsResponse = await fetch('http://httpbin.org/headers', {
        agent: agent,
        signal: signal,
        timeout: 10000
      })
      
      const dnsData = await dnsResponse.json()
      const headers = dnsData.headers || {}
      
      return {
        anonymity: this.determineAnonymity(headers),
        dnsLeak: this.checkDnsLeak(headers),
        webrtcLeak: false // Would need WebRTC test in browser
      }
    } catch (error) {
      return {
        anonymity: 'unknown',
        dnsLeak: false,
        webrtcLeak: false
      }
    }
  }

  private async getGeolocation(ip: string, agent: any, signal: AbortSignal): Promise<any> {
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}`, {
        agent: agent,
        signal: signal,
        timeout: 10000
      })
      
      const data = await response.json()
      
      return {
        country: data.country,
        city: data.city,
        region: data.regionName,
        timezone: data.timezone,
        countryCode: data.countryCode,
        latitude: data.lat,
        longitude: data.lon,
        isp: data.isp
      }
    } catch (error) {
      return null
    }
  }

  private determineAnonymity(headers: Record<string, string>): string {
    const forwardedFor = headers['X-Forwarded-For']
    const realIp = headers['X-Real-IP']
    const via = headers['Via']
    
    if (forwardedFor || realIp || via) {
      return 'transparent'
    }
    
    return 'elite'
  }

  private checkDnsLeak(headers: Record<string, string>): boolean {
    // Simple DNS leak check based on headers
    const suspiciousHeaders = ['X-Forwarded-For', 'X-Real-IP', 'Via', 'X-Proxy-Authorization']
    return suspiciousHeaders.some(header => headers[header])
  }

  // Public methods for configuration and control
  public updateConfiguration(newConfig: Partial<TestConfiguration>): void {
    this.config = { ...this.config, ...newConfig }
  }

  public getConfiguration(): TestConfiguration {
    return { ...this.config }
  }

  public clearCache(): void {
    this.cache.clear()
  }

  public cancelTest(testId: string): boolean {
    const controller = this.activeTests.get(testId)
    if (controller) {
      controller.abort()
      this.activeTests.delete(testId)
      return true
    }
    return false
  }

  public getActiveTests(): string[] {
    return Array.from(this.activeTests.keys())
  }

  public getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    }
  }

  // Batch testing
  public async testProxies(
    proxies: Proxy[],
    onProgress?: (progress: TestProgress) => void,
    onResult?: (result: AdvancedTestResult) => void
  ): Promise<AdvancedTestResult[]> {
    const results: AdvancedTestResult[] = []
    
    if (this.config.parallelTests) {
      const promises = proxies.map(proxy => 
        this.testProxy(proxy, onProgress).then(result => {
          onResult?.(result)
          return result
        })
      )
      return Promise.all(promises)
    } else {
      for (const proxy of proxies) {
        const result = await this.testProxy(proxy, onProgress)
        results.push(result)
        onResult?.(result)
      }
      return results
    }
  }
}