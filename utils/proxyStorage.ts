import { SimpleProxy as Proxy } from '@/types/proxy'

const STORAGE_KEY = 'proxy-manager-data'

export class ProxyStorage {
  private static instance: ProxyStorage
  private proxies: Map<number, Proxy> = new Map()
  private nextId: number = 1

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): ProxyStorage {
    if (!ProxyStorage.instance) {
      ProxyStorage.instance = new ProxyStorage()
    }
    return ProxyStorage.instance
  }

  // Load data from localStorage
  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data = JSON.parse(stored)
          this.proxies = new Map(data.proxies || [])
          this.nextId = data.nextId || 1
        }
      }
    } catch (error) {
      console.error('Error loading from storage:', error)
    }
  }

  // Save data to localStorage
  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        const data = {
          proxies: Array.from(this.proxies.entries()),
          nextId: this.nextId
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      }
    } catch (error) {
      console.error('Error saving to storage:', error)
    }
  }

  // Add proxy
  addProxy(proxy: Omit<Proxy, 'id'>): Proxy {
    const newProxy: Proxy = {
      ...proxy,
      id: this.nextId++
    }
    this.proxies.set(newProxy.id, newProxy)
    this.saveToStorage()
    return newProxy
  }

  // Add multiple proxies
  addProxies(proxies: Omit<Proxy, 'id'>[]): Proxy[] {
    const newProxies: Proxy[] = proxies.map(proxy => ({
      ...proxy,
      id: this.nextId++
    }))
    
    newProxies.forEach(proxy => {
      this.proxies.set(proxy.id, proxy)
    })
    
    this.saveToStorage()
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
  updateProxy(id: number, updates: Partial<Proxy>): Proxy | null {
    const proxy = this.proxies.get(id)
    if (!proxy) return null

    const updatedProxy = { ...proxy, ...updates }
    this.proxies.set(id, updatedProxy)
    this.saveToStorage()
    return updatedProxy
  }

  // Delete proxy
  deleteProxy(id: number): boolean {
    const deleted = this.proxies.delete(id)
    if (deleted) {
      this.saveToStorage()
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
  importData(data: string, format: 'json' | 'csv' | 'txt'): Proxy[] {
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
      this.saveToStorage()
    }
    
    return proxies
  }

  // Clear all data
  clearAll(): void {
    this.proxies.clear()
    this.nextId = 1
    this.saveToStorage()
  }
}
