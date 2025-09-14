import { SimpleProxy as Proxy } from '@/types/proxy'

export interface ExportOptions {
  format: 'json' | 'csv' | 'txt' | 'xml'
  includeCredentials: boolean
  includeStats: boolean
  filter?: {
    status?: string[]
    type?: string[]
    group?: string[]
  }
}

export interface ImportResult {
  success: boolean
  imported: Proxy[]
  errors: string[]
  total: number
}

export class ProxyImportExport {
  static exportProxies(proxies: Proxy[], options: ExportOptions): string {
    const filteredProxies = this.filterProxies(proxies, options.filter)
    
    switch (options.format) {
      case 'json':
        return this.exportToJSON(filteredProxies, options)
      case 'csv':
        return this.exportToCSV(filteredProxies, options)
      case 'txt':
        return this.exportToTXT(filteredProxies, options)
      case 'xml':
        return this.exportToXML(filteredProxies, options)
      default:
        throw new Error('Unsupported export format')
    }
  }

  static async importProxies(file: File): Promise<ImportResult> {
    const content = await file.text()
    const extension = file.name.split('.').pop()?.toLowerCase()

    switch (extension) {
      case 'json':
        return this.importFromJSON(content)
      case 'csv':
        return this.importFromCSV(content)
      case 'txt':
        return this.importFromTXT(content)
      case 'xml':
        return this.importFromXML(content)
      default:
        return this.importFromTXT(content) // Default to TXT
    }
  }

  private static filterProxies(proxies: Proxy[], filter?: ExportOptions['filter']): Proxy[] {
    if (!filter) return proxies

    return proxies.filter(proxy => {
      if (filter.status && !filter.status.includes(proxy.status)) return false
      if (filter.type && !filter.type.includes(proxy.type)) return false
      if (filter.group && proxy.group && !filter.group.includes(proxy.group)) return false
      return true
    })
  }

  private static exportToJSON(proxies: Proxy[], options: ExportOptions): string {
    const exportData = proxies.map(proxy => {
      const data: any = {
        host: proxy.host,
        port: proxy.port,
        type: proxy.type,
        status: proxy.status,
        group: proxy.group,
        notes: proxy.notes,
        lastTested: proxy.lastTested
      }

      if (options.includeCredentials) {
        data.username = proxy.username
        data.password = proxy.password
      }

      if (options.includeStats) {
        data.ping = proxy.ping
        data.speed = proxy.speed
        data.country = proxy.country
        data.city = proxy.city
        data.anonymity = proxy.anonymity
        data.publicIP = proxy.publicIP
      }

      return data
    })

    return JSON.stringify(exportData, null, 2)
  }

  private static exportToCSV(proxies: Proxy[], options: ExportOptions): string {
    const headers = ['host', 'port', 'type', 'status']
    
    if (options.includeCredentials) {
      headers.push('username', 'password')
    }
    
    if (options.includeStats) {
      headers.push('ping', 'speed', 'country', 'city', 'anonymity', 'publicIP')
    }
    
    headers.push('group', 'notes', 'lastTested')

    const rows = proxies.map(proxy => {
      const row = [
        proxy.host,
        proxy.port,
        proxy.type,
        proxy.status
      ]

      if (options.includeCredentials) {
        row.push(proxy.username || '', proxy.password || '')
      }

      if (options.includeStats) {
        row.push(
          proxy.ping || '',
          proxy.speed || '',
          proxy.country || '',
          proxy.city || '',
          proxy.anonymity || '',
          proxy.publicIP || ''
        )
      }

      row.push(
        proxy.group || '',
        proxy.notes || '',
        proxy.lastTested || ''
      )

      return row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    })

    return [headers.join(','), ...rows].join('\n')
  }

  private static exportToTXT(proxies: Proxy[], options: ExportOptions): string {
    const lines: string[] = []
    
    lines.push('# Proxy Export')
    lines.push(`# Generated: ${new Date().toISOString()}`)
    lines.push(`# Total: ${proxies.length} proxies`)
    lines.push('')

    proxies.forEach(proxy => {
      let line = `${proxy.host}:${proxy.port}`
      
      if (options.includeCredentials && proxy.username) {
        line += `:${proxy.username}`
        if (proxy.password) {
          line += `:${proxy.password}`
        }
      }
      
      line += `:${proxy.type}`
      
      if (proxy.group) {
        line += ` # ${proxy.group}`
      }
      
      lines.push(line)
    })

    return lines.join('\n')
  }

  private static exportToXML(proxies: Proxy[], options: ExportOptions): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<proxies>\n'
    
    proxies.forEach(proxy => {
      xml += '  <proxy>\n'
      xml += `    <host>${this.escapeXml(proxy.host)}</host>\n`
      xml += `    <port>${proxy.port}</port>\n`
      xml += `    <type>${proxy.type}</type>\n`
      xml += `    <status>${proxy.status}</status>\n`
      
      if (options.includeCredentials) {
        if (proxy.username) xml += `    <username>${this.escapeXml(proxy.username)}</username>\n`
        if (proxy.password) xml += `    <password>${this.escapeXml(proxy.password)}</password>\n`
      }
      
      if (options.includeStats) {
        if (proxy.ping) xml += `    <ping>${proxy.ping}</ping>\n`
        if (proxy.speed) xml += `    <speed>${proxy.speed}</speed>\n`
        if (proxy.country) xml += `    <country>${this.escapeXml(proxy.country)}</country>\n`
        if (proxy.city) xml += `    <city>${this.escapeXml(proxy.city)}</city>\n`
        if (proxy.anonymity) xml += `    <anonymity>${proxy.anonymity}</anonymity>\n`
        if (proxy.publicIP) xml += `    <publicIP>${this.escapeXml(proxy.publicIP)}</publicIP>\n`
      }
      
      if (proxy.group) xml += `    <group>${this.escapeXml(proxy.group)}</group>\n`
      if (proxy.notes) xml += `    <notes>${this.escapeXml(proxy.notes)}</notes>\n`
      if (proxy.lastTested) xml += `    <lastTested>${proxy.lastTested}</lastTested>\n`
      
      xml += '  </proxy>\n'
    })
    
    xml += '</proxies>'
    return xml
  }

  private static importFromJSON(content: string): ImportResult {
    try {
      const data = JSON.parse(content)
      const proxies: Proxy[] = []
      const errors: string[] = []

      const items = Array.isArray(data) ? data : [data]
      
      items.forEach((item, index) => {
        try {
        const proxy: Proxy = {
          id: Date.now() + index,
          host: item.host || item.ip || '',
          port: parseInt(item.port),
          username: item.username,
          password: item.password,
          type: item.type || 'http',
          status: (item.status as 'alive' | 'dead' | 'pending' | 'testing') || 'pending',
          group: item.group,
          notes: item.notes,
          ping: item.ping,
          speed: item.speed,
          country: item.country,
          city: item.city,
          anonymity: item.anonymity,
          publicIP: item.publicIP,
          lastTested: item.lastTested || new Date().toISOString()
        }

          if (proxy.host && proxy.port) {
            proxies.push(proxy)
          } else {
            errors.push(`Item ${index + 1}: Missing host or port`)
          }
        } catch (error) {
          errors.push(`Item ${index + 1}: ${error instanceof Error ? error.message : 'Invalid format'}`)
        }
      })

      return {
        success: proxies.length > 0,
        imported: proxies,
        errors,
        total: items.length
      }
    } catch (error) {
      return {
        success: false,
        imported: [],
        errors: ['Invalid JSON format'],
        total: 0
      }
    }
  }

  private static importFromCSV(content: string): ImportResult {
    const lines = content.split('\n').filter(line => line.trim())
    const proxies: Proxy[] = []
    const errors: string[] = []

    if (lines.length < 2) {
      return {
        success: false,
        imported: [],
        errors: ['CSV must have at least a header and one data row'],
        total: 0
      }
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
    const dataRows = lines.slice(1)

    dataRows.forEach((line, index) => {
      try {
        const values = this.parseCSVLine(line)
        const row: any = {}
        
        headers.forEach((header, i) => {
          row[header] = values[i] || ''
        })

        const proxy: Proxy = {
          id: Date.now() + index,
          host: row.host || row.ip || '',
          port: parseInt(row.port),
          username: row.username,
          password: row.password,
          type: row.type || 'http',
          status: (row.status as 'alive' | 'dead' | 'pending' | 'testing') || 'pending',
          group: row.group,
          notes: row.notes,
          ping: row.ping ? parseInt(row.ping) : undefined,
          speed: row.speed ? parseInt(row.speed) : undefined,
          country: row.country,
          city: row.city,
          anonymity: row.anonymity,
          publicIP: row.publicIP,
          lastTested: row.lastTested || new Date().toISOString()
        }

        if (proxy.host && proxy.port) {
          proxies.push(proxy)
        } else {
          errors.push(`Row ${index + 2}: Missing host or port`)
        }
      } catch (error) {
        errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Invalid format'}`)
      }
    })

    return {
      success: proxies.length > 0,
      imported: proxies,
      errors,
      total: dataRows.length
    }
  }

  private static importFromTXT(content: string): ImportResult {
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'))
    const proxies: Proxy[] = []
    const errors: string[] = []

    lines.forEach((line, index) => {
      try {
        const parts = line.trim().split(':')
        if (parts.length >= 2) {
          const proxy: Proxy = {
            id: Date.now() + index,
            host: parts[0] || '',
            port: parseInt(parts[1]) || 8080,
            username: parts[2] || undefined,
            password: parts[3] || undefined,
            type: (parts[4] as any) || 'http',
            status: 'pending',
            lastTested: new Date().toISOString()
          }

          if (proxy.host && proxy.port) {
            proxies.push(proxy)
          } else {
            errors.push(`Line ${index + 1}: Missing host or port`)
          }
        } else {
          errors.push(`Line ${index + 1}: Invalid format`)
        }
      } catch (error) {
        errors.push(`Line ${index + 1}: ${error instanceof Error ? error.message : 'Invalid format'}`)
      }
    })

    return {
      success: proxies.length > 0,
      imported: proxies,
      errors,
      total: lines.length
    }
  }

  private static importFromXML(content: string): ImportResult {
    // Simple XML parsing - in production, use a proper XML parser
    const proxies: Proxy[] = []
    const errors: string[] = []

    try {
      const proxyMatches = content.match(/<proxy>[\s\S]*?<\/proxy>/g)
      
      if (proxyMatches) {
        proxyMatches.forEach((match, index) => {
          try {
            const proxy: Proxy = {
              id: Date.now() + index,
              host: this.extractXmlValue(match, 'host') || this.extractXmlValue(match, 'ip') || '',
              port: parseInt(this.extractXmlValue(match, 'port') || '8080'),
              username: this.extractXmlValue(match, 'username'),
              password: this.extractXmlValue(match, 'password'),
              type: (this.extractXmlValue(match, 'type') as any) || 'http',
              status: (this.extractXmlValue(match, 'status') as 'alive' | 'dead' | 'pending' | 'testing') || 'pending',
              group: this.extractXmlValue(match, 'group'),
              notes: this.extractXmlValue(match, 'notes'),
              lastTested: this.extractXmlValue(match, 'lastTested') || new Date().toISOString()
            }

            if (proxy.host && proxy.port) {
              proxies.push(proxy)
            } else {
              errors.push(`Proxy ${index + 1}: Missing host or port`)
            }
          } catch (error) {
            errors.push(`Proxy ${index + 1}: ${error instanceof Error ? error.message : 'Invalid format'}`)
          }
        })
      }
    } catch (error) {
      errors.push('Invalid XML format')
    }

    return {
      success: proxies.length > 0,
      imported: proxies,
      errors,
      total: proxies.length
    }
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current)
    return result
  }

  private static extractXmlValue(xml: string, tag: string): string | undefined {
    const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's')
    const match = xml.match(regex)
    return match ? match[1].trim() : undefined
  }

  private static escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}
