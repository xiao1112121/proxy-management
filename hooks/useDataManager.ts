'use client'

import { useState, useCallback, useRef } from 'react'
import { SimpleProxy as Proxy } from '@/types/proxy'

export interface DataBackup {
  id: string
  name: string
  description?: string
  timestamp: number
  version: string
  data: {
    proxies: Proxy[]
    settings: Record<string, any>
    metadata: {
      totalProxies: number
      categories: string[]
      countries: string[]
      createdBy: string
      exportFormat: string
    }
  }
  checksum: string
  size: number
}

export interface ValidationRule {
  id: string
  name: string
  description: string
  field: keyof Proxy
  type: 'required' | 'format' | 'range' | 'custom'
  rule: string | RegExp | ((value: any) => boolean)
  message: string
  severity: 'error' | 'warning' | 'info'
  enabled: boolean
}

export interface ValidationResult {
  proxyId: number
  field: keyof Proxy
  rule: ValidationRule
  message: string
  severity: 'error' | 'warning' | 'info'
  value: any
}

export interface DataTemplate {
  id: string
  name: string
  description: string
  category: 'basic' | 'advanced' | 'custom'
  fields: Partial<Proxy>
  validation: string[]
  tags: string[]
  isDefault: boolean
  createdAt: number
  usage: number
}

const DEFAULT_VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'host-required',
    name: 'Host Required',
    description: 'Host field must not be empty',
    field: 'host',
    type: 'required',
    rule: (value) => Boolean(value && value.trim()),
    message: 'Host is required',
    severity: 'error',
    enabled: true
  },
  {
    id: 'port-range',
    name: 'Port Range',
    description: 'Port must be between 1 and 65535',
    field: 'port',
    type: 'range',
    rule: (value) => value >= 1 && value <= 65535,
    message: 'Port must be between 1 and 65535',
    severity: 'error',
    enabled: true
  },
  {
    id: 'host-format',
    name: 'Host Format',
    description: 'Host must be valid IP or domain',
    field: 'host',
    type: 'format',
    rule: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,
    message: 'Invalid host format',
    severity: 'warning',
    enabled: true
  },
  {
    id: 'username-length',
    name: 'Username Length',
    description: 'Username should be reasonable length',
    field: 'username',
    type: 'custom',
    rule: (value) => !value || (value.length >= 3 && value.length <= 50),
    message: 'Username should be 3-50 characters',
    severity: 'info',
    enabled: true
  }
]

const DEFAULT_TEMPLATES: DataTemplate[] = [
  {
    id: 'http-basic',
    name: 'Basic HTTP Proxy',
    description: 'Standard HTTP proxy configuration',
    category: 'basic',
    fields: {
      type: 'http',
      anonymity: 'transparent',
      status: 'pending'
    },
    validation: ['host-required', 'port-range', 'host-format'],
    tags: ['http', 'basic'],
    isDefault: true,
    createdAt: Date.now(),
    usage: 0
  },
  {
    id: 'socks5-auth',
    name: 'SOCKS5 with Authentication',
    description: 'SOCKS5 proxy with username/password',
    category: 'advanced',
    fields: {
      type: 'socks5',
      anonymity: 'elite',
      status: 'pending'
    },
    validation: ['host-required', 'port-range', 'host-format', 'username-length'],
    tags: ['socks5', 'auth', 'secure'],
    isDefault: true,
    createdAt: Date.now(),
    usage: 0
  }
]

export function useDataManager() {
  const [backups, setBackups] = useState<DataBackup[]>([])
  const [validationRules, setValidationRules] = useState<ValidationRule[]>(DEFAULT_VALIDATION_RULES)
  const [templates, setTemplates] = useState<DataTemplate[]>(DEFAULT_TEMPLATES)
  const [isProcessing, setIsProcessing] = useState(false)
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate checksum for data integrity
  const generateChecksum = useCallback((data: any): string => {
    const str = JSON.stringify(data)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }, [])

  // Create backup
  const createBackup = useCallback(async (
    proxies: Proxy[],
    settings: Record<string, any> = {},
    name: string,
    description?: string
  ): Promise<DataBackup> => {
    setIsProcessing(true)

    try {
      const countries = [...new Set(proxies.filter(p => p.country).map(p => p.country!))]
      const categories = [...new Set(proxies.filter(p => p.type).map(p => p.type!))]

      const backup: DataBackup = {
        id: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        timestamp: Date.now(),
        version: '1.0.0',
        data: {
          proxies,
          settings,
          metadata: {
            totalProxies: proxies.length,
            categories,
            countries,
            createdBy: 'ProxyManager',
            exportFormat: 'json'
          }
        },
        checksum: '',
        size: 0
      }

      // Calculate checksum and size
      backup.checksum = generateChecksum(backup.data)
      backup.size = JSON.stringify(backup).length

      setBackups(prev => [backup, ...prev])
      
      return backup
    } finally {
      setIsProcessing(false)
    }
  }, [generateChecksum])

  // Export backup to file
  const exportBackup = useCallback((backup: DataBackup, format: 'json' | 'csv' = 'json') => {
    let content: string
    let filename: string
    let mimeType: string

    if (format === 'json') {
      content = JSON.stringify(backup, null, 2)
      filename = `${backup.name}_${new Date(backup.timestamp).toISOString().split('T')[0]}.json`
      mimeType = 'application/json'
    } else {
      // CSV format
      const headers = ['Host', 'Port', 'Username', 'Password', 'Type', 'Country', 'Status']
      const rows = backup.data.proxies.map(proxy => [
        proxy.host,
        proxy.port,
        proxy.username || '',
        proxy.password || '',
        proxy.type || '',
        proxy.country || '',
        proxy.status || ''
      ])

      content = [headers, ...rows].map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n')
      
      filename = `${backup.name}_${new Date(backup.timestamp).toISOString().split('T')[0]}.csv`
      mimeType = 'text/csv'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  // Import backup from file
  const importBackup = useCallback((file: File): Promise<DataBackup> => {
    return new Promise((resolve, reject) => {
      setIsProcessing(true)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          let backup: DataBackup

          if (file.name.endsWith('.json')) {
            backup = JSON.parse(content)
          } else if (file.name.endsWith('.csv')) {
            // Parse CSV and convert to backup format
            const lines = content.split('\n')
            const headers = lines[0].split(',').map(h => h.replace(/"/g, ''))
            const proxies: Proxy[] = []

            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].split(',').map(v => v.replace(/"/g, ''))
              if (values.length >= 2) {
                proxies.push({
                  id: Date.now() + i,
                  host: values[0],
                  port: parseInt(values[1]),
                  username: values[2] || undefined,
                  password: values[3] || undefined,
                  type: values[4] as any || 'http',
                  country: values[5] || undefined,
                  status: values[6] as any || 'pending'
                })
              }
            }

            backup = {
              id: `imported_${Date.now()}`,
              name: file.name.replace(/\.[^/.]+$/, ''),
              description: 'Imported from CSV file',
              timestamp: Date.now(),
              version: '1.0.0',
              data: {
                proxies,
                settings: {},
                metadata: {
                  totalProxies: proxies.length,
                  categories: [...new Set(proxies.map(p => p.type!))],
                  countries: [...new Set(proxies.filter(p => p.country).map(p => p.country!))],
                  createdBy: 'Import',
                  exportFormat: 'csv'
                }
              },
              checksum: generateChecksum({ proxies, settings: {} }),
              size: content.length
            }
          } else {
            throw new Error('Unsupported file format')
          }

          // Verify checksum if present
          if (backup.checksum) {
            const calculatedChecksum = generateChecksum(backup.data)
            if (calculatedChecksum !== backup.checksum) {
              console.warn('Checksum mismatch - data may be corrupted')
            }
          }

          setBackups(prev => [backup, ...prev])
          resolve(backup)
        } catch (error) {
          reject(new Error(`Failed to import backup: ${error instanceof Error ? error.message : 'Unknown error'}`))
        } finally {
          setIsProcessing(false)
        }
      }

      reader.onerror = () => {
        setIsProcessing(false)
        reject(new Error('Failed to read file'))
      }

      reader.readAsText(file)
    })
  }, [generateChecksum])

  // Validate proxies against rules
  const validateProxies = useCallback((proxies: Proxy[]): ValidationResult[] => {
    const results: ValidationResult[] = []
    const enabledRules = validationRules.filter(rule => rule.enabled)

    proxies.forEach(proxy => {
      enabledRules.forEach(rule => {
        const value = proxy[rule.field]
        let isValid = true

        switch (rule.type) {
          case 'required':
            isValid = typeof rule.rule === 'function' 
              ? rule.rule(value) 
              : Boolean(value)
            break
          case 'format':
            if (value && rule.rule instanceof RegExp) {
              isValid = rule.rule.test(String(value))
            }
            break
          case 'range':
          case 'custom':
            if (typeof rule.rule === 'function') {
              isValid = rule.rule(value)
            }
            break
        }

        if (!isValid) {
          results.push({
            proxyId: proxy.id,
            field: rule.field,
            rule,
            message: rule.message,
            severity: rule.severity,
            value
          })
        }
      })
    })

    setValidationResults(results)
    return results
  }, [validationRules])

  // Create proxy from template
  const createFromTemplate = useCallback((template: DataTemplate, overrides: Partial<Proxy> = {}): Partial<Proxy> => {
    // Increment usage
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usage: t.usage + 1 }
        : t
    ))

    return {
      ...template.fields,
      ...overrides,
      id: Date.now() + Math.random()
    }
  }, [])

  // Add custom validation rule
  const addValidationRule = useCallback((rule: Omit<ValidationRule, 'id'>) => {
    const newRule: ValidationRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    setValidationRules(prev => [...prev, newRule])
    return newRule
  }, [])

  // Add custom template
  const addTemplate = useCallback((template: Omit<DataTemplate, 'id' | 'createdAt' | 'usage'>) => {
    const newTemplate: DataTemplate = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      usage: 0
    }
    setTemplates(prev => [...prev, newTemplate])
    return newTemplate
  }, [])

  // Delete backup
  const deleteBackup = useCallback((backupId: string) => {
    setBackups(prev => prev.filter(b => b.id !== backupId))
  }, [])

  // Restore from backup
  const restoreFromBackup = useCallback((backup: DataBackup): Promise<Proxy[]> => {
    return new Promise((resolve, reject) => {
      try {
        // Verify checksum
        const calculatedChecksum = generateChecksum(backup.data)
        if (backup.checksum && calculatedChecksum !== backup.checksum) {
          console.warn('Checksum mismatch during restore')
        }

        resolve(backup.data.proxies)
      } catch (error) {
        reject(new Error(`Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    })
  }, [generateChecksum])

  // Get validation statistics
  const getValidationStats = useCallback(() => {
    const stats = {
      total: validationResults.length,
      errors: validationResults.filter(r => r.severity === 'error').length,
      warnings: validationResults.filter(r => r.severity === 'warning').length,
      info: validationResults.filter(r => r.severity === 'info').length,
      byRule: {} as Record<string, number>
    }

    validationResults.forEach(result => {
      stats.byRule[result.rule.id] = (stats.byRule[result.rule.id] || 0) + 1
    })

    return stats
  }, [validationResults])

  return {
    // State
    backups,
    validationRules,
    templates,
    isProcessing,
    validationResults,
    
    // Actions
    createBackup,
    exportBackup,
    importBackup,
    deleteBackup,
    restoreFromBackup,
    validateProxies,
    createFromTemplate,
    addValidationRule,
    addTemplate,
    getValidationStats,
    
    // Utils
    fileInputRef
  }
}
