import { SimpleProxy as Proxy } from '@/types/proxy'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'proxies.json')

export class ServerProxyStorage {
  private static instance: ServerProxyStorage
  private proxies: Map<number, Proxy> = new Map()
  private nextId: number = 1

  private constructor() {
    this.loadFromFile()
  }

  static getInstance(): ServerProxyStorage {
    if (!ServerProxyStorage.instance) {
      ServerProxyStorage.instance = new ServerProxyStorage()
    }
    return ServerProxyStorage.instance
  }

  // Load data from file
  private async loadFromFile(): Promise<void> {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(DATA_FILE)
      await fs.mkdir(dataDir, { recursive: true })

      // Try to read existing data
      const data = await fs.readFile(DATA_FILE, 'utf-8')
      const parsed = JSON.parse(data)
      
      this.proxies = new Map(parsed.proxies || [])
      this.nextId = parsed.nextId || 1
    } catch (error) {
      // File doesn't exist or is invalid, start fresh
      console.log('No existing proxy data found, starting fresh')
      this.proxies = new Map()
      this.nextId = 1
    }
  }

  // Save data to file
  private async saveToFile(): Promise<void> {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(DATA_FILE)
      await fs.mkdir(dataDir, { recursive: true })

      const data = {
        proxies: Array.from(this.proxies.entries()),
        nextId: this.nextId,
        lastUpdated: new Date().toISOString()
      }
      
      await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
    } catch (error) {
      console.error('Error saving to file:', error)
    }
  }

  // Add proxy
  async addProxy(proxy: Omit<Proxy, 'id'>): Promise<Proxy> {
    const newProxy: Proxy = {
      ...proxy,
      id: this.nextId++
    }
    this.proxies.set(newProxy.id, newProxy)
    await this.saveToFile()
    return newProxy
  }

  // Add multiple proxies
  async addProxies(proxies: Omit<Proxy, 'id'>[]): Promise<Proxy[]> {
    const newProxies: Proxy[] = proxies.map(proxy => ({
      ...proxy,
      id: this.nextId++
    }))
    
    newProxies.forEach(proxy => {
      this.proxies.set(proxy.id, proxy)
    })
    
    await this.saveToFile()
    return newProxies
  }

  // Get proxy by ID
  getProxy(id: number): Proxy | undefined {
    return this.proxies.get(id)
  }

  // Get all proxies
  getAllProxies(): Proxy[] {
    return Array.from(this.proxies.values())
  }

  // Update proxy
  async updateProxy(id: number, updates: Partial<Proxy>): Promise<Proxy | null> {
    const proxy = this.proxies.get(id)
    if (!proxy) return null

    const updatedProxy = { ...proxy, ...updates }
    this.proxies.set(id, updatedProxy)
    await this.saveToFile()
    return updatedProxy
  }

  // Delete proxy
  async deleteProxy(id: number): Promise<boolean> {
    const deleted = this.proxies.delete(id)
    if (deleted) {
      await this.saveToFile()
    }
    return deleted
  }

  // Get proxies by filter
  getProxiesByFilter(filter: {
    type?: string
    status?: string
    country?: string
    group?: string
  }): Proxy[] {
    let proxies = this.getAllProxies()

    if (filter.type) {
      proxies = proxies.filter(p => p.type === filter.type)
    }

    if (filter.status) {
      proxies = proxies.filter(p => p.status === filter.status)
    }

    if (filter.country) {
      proxies = proxies.filter(p => p.country === filter.country)
    }

    if (filter.group) {
      proxies = proxies.filter(p => p.group === filter.group)
    }

    return proxies
  }

  // Get statistics
  getStats() {
    const proxies = this.getAllProxies()
    const alive = proxies.filter(p => p.status === 'alive')
    const dead = proxies.filter(p => p.status === 'dead')
    const testing = proxies.filter(p => p.status === 'testing')

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

    const totalPing = alive.reduce((sum, p) => sum + (p.ping || 0), 0)
    const totalSpeed = alive.reduce((sum, p) => sum + (p.speed || 0), 0)

    return {
      total: proxies.length,
      alive: alive.length,
      dead: dead.length,
      testing: testing.length,
      averagePing: alive.length > 0 ? Math.round(totalPing / alive.length) : 0,
      averageSpeed: alive.length > 0 ? Math.round(totalSpeed / alive.length) : 0,
      successRate: proxies.length > 0 ? (alive.length / proxies.length) * 100 : 0,
      byType,
      byCountry,
      byAnonymity
    }
  }

  // Export data
  exportData(format: 'json' | 'csv' | 'txt'): string {
    const proxies = this.getAllProxies()
    
    switch (format) {
      case 'json':
        return JSON.stringify(proxies, null, 2)
      case 'csv':
        const headers = ['id', 'host', 'port', 'username', 'password', 'type', 'status', 'ping', 'speed', 'country', 'city', 'anonymity', 'group']
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

  // Import data
  async importData(data: string, format: 'json' | 'csv' | 'txt'): Promise<Proxy[]> {
    const proxies: Proxy[] = []
    
    try {
      switch (format) {
        case 'json':
          const jsonData = JSON.parse(data)
          if (Array.isArray(jsonData)) {
            jsonData.forEach((item) => {
              if (item.host && item.port) {
                proxies.push({
                  id: this.nextId++,
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
              const proxy: any = { id: this.nextId++ }
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
          txtLines.forEach((line) => {
            const trimmed = line.trim()
            if (trimmed && !trimmed.startsWith('#')) {
              const parts = trimmed.split(':')
              if (parts.length >= 2) {
                const proxy: Proxy = {
                  id: this.nextId++,
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
    
    // Add imported proxies
    proxies.forEach(proxy => {
      this.proxies.set(proxy.id, proxy)
    })
    
    if (proxies.length > 0) {
      await this.saveToFile()
    }
    
    return proxies
  }

  // Clear all data
  async clearAll(): Promise<void> {
    this.proxies.clear()
    this.nextId = 1
    await this.saveToFile()
  }
}
