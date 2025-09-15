'use client'

import { useState, useCallback, useRef } from 'react'
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Download,
  Upload,
  Trash2,
  Filter,
  BarChart3,
  Zap,
  Globe,
  Shield,
  Gauge
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface ValidationResult {
  proxy: Proxy
  isValid: boolean
  ping: number
  speed: number
  country?: string
  anonymity?: string
  error?: string
  qualityScore: number
  testTime: number
}

interface ValidationStats {
  total: number
  valid: number
  invalid: number
  averagePing: number
  averageSpeed: number
  averageQuality: number
  countries: Record<string, number>
  types: Record<string, number>
}

export default function MassProxyValidator() {
  const [proxies, setProxies] = useState<Proxy[]>([])
  const [results, setResults] = useState<ValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentProxy, setCurrentProxy] = useState<string>('')
  const [stats, setStats] = useState<ValidationStats | null>(null)
  const [filter, setFilter] = useState<'all' | 'valid' | 'invalid'>('all')
  const [sortBy, setSortBy] = useState<'quality' | 'ping' | 'speed' | 'testTime'>('quality')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  const abortController = useRef<AbortController | null>(null)
  const validationQueue = useRef<Proxy[]>([])

  // Parse proxy input text
  const parseProxyInput = (input: string): Proxy[] => {
    const lines = input.split('\n').filter(line => line.trim())
    const parsedProxies: Proxy[] = []
    const seen = new Set<string>()

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (!trimmed) return

      // Parse different proxy formats
      const formats = [
        // ip:port
        /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d+)$/,
        // ip:port:username:password
        /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d+):([^:]+):(.+)$/,
        // protocol://ip:port
        /^(https?|socks4|socks5):\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d+)$/,
        // protocol://username:password@ip:port
        /^(https?|socks4|socks5):\/\/([^:]+):([^@]+)@(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d+)$/
      ]

      let match: RegExpMatchArray | null = null
      let proxy: Partial<Proxy> = {}

      for (const format of formats) {
        match = trimmed.match(format)
        if (match) break
      }

      if (match) {
        if (match[1] && match[2] && !match[3]) {
          // ip:port
          proxy = {
            id: Date.now() + index,
            host: match[1],
            port: parseInt(match[2]),
            type: 'http',
            status: 'pending'
          }
        } else if (match[1] && match[2] && match[3] && match[4]) {
          // ip:port:username:password
          proxy = {
            id: Date.now() + index,
            host: match[1],
            port: parseInt(match[2]),
            username: match[3],
            password: match[4],
            type: 'http',
            status: 'pending'
          }
        } else if (match[1] && match[2] && match[3] && !match[4]) {
          // protocol://ip:port
          proxy = {
            id: Date.now() + index,
            host: match[2],
            port: parseInt(match[3]),
            type: match[1] as any,
            status: 'pending'
          }
        } else if (match[1] && match[2] && match[3] && match[4] && match[5]) {
          // protocol://username:password@ip:port
          proxy = {
            id: Date.now() + index,
            host: match[4],
            port: parseInt(match[5]),
            username: match[2],
            password: match[3],
            type: match[1] as any,
            status: 'pending'
          }
        }

        if (proxy.host && proxy.port) {
          const key = `${proxy.host}:${proxy.port}`
          if (!seen.has(key)) {
            seen.add(key)
            parsedProxies.push(proxy as Proxy)
          }
        }
      }
    })

    return parsedProxies
  }

  // Validate single proxy
  const validateProxy = async (proxy: Proxy): Promise<ValidationResult> => {
    const startTime = Date.now()
    
    try {
      const response = await fetch('/api/test-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proxy),
        signal: abortController.current?.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const testTime = Date.now() - startTime

      // Calculate quality score (0-100)
      const qualityScore = calculateQualityScore(data, testTime)

      return {
        proxy,
        isValid: data.success,
        ping: data.ping || testTime,
        speed: data.speed || 0,
        country: data.country,
        anonymity: data.anonymity,
        error: data.error,
        qualityScore,
        testTime
      }
    } catch (error) {
      const testTime = Date.now() - startTime
      return {
        proxy,
        isValid: false,
        ping: testTime,
        speed: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        qualityScore: 0,
        testTime
      }
    }
  }

  // Calculate quality score based on multiple factors
  const calculateQualityScore = (data: any, testTime: number): number => {
    let score = 0

    // Success factor (40 points)
    if (data.success) score += 40

    // Speed factor (25 points)
    if (data.speed) {
      const speedScore = Math.min(25, (data.speed / 10000) * 25)
      score += speedScore
    }

    // Ping factor (20 points)
    if (data.ping) {
      const pingScore = Math.max(0, 20 - (data.ping / 100) * 20)
      score += pingScore
    }

    // Anonymity factor (10 points)
    if (data.anonymity === 'elite') score += 10
    else if (data.anonymity === 'anonymous') score += 7
    else if (data.anonymity === 'transparent') score += 3

    // Test time factor (5 points)
    const timeScore = Math.max(0, 5 - (testTime / 1000) * 5)
    score += timeScore

    return Math.round(Math.min(100, Math.max(0, score)))
  }

  // Start validation process
  const startValidation = async () => {
    if (proxies.length === 0) return

    setIsValidating(true)
    setProgress(0)
    setResults([])
    setCurrentProxy('')
    
    abortController.current = new AbortController()
    validationQueue.current = [...proxies]

    const validationResults: ValidationResult[] = []
    const batchSize = 5 // Process 5 proxies at a time

    for (let i = 0; i < proxies.length; i += batchSize) {
      if (abortController.current?.signal.aborted) break

      const batch = proxies.slice(i, i + batchSize)
      const batchPromises = batch.map(async (proxy) => {
        setCurrentProxy(`${proxy.host}:${proxy.port}`)
        const result = await validateProxy(proxy)
        validationResults.push(result)
        setProgress(Math.round(((i + batch.length) / proxies.length) * 100))
        return result
      })

      await Promise.all(batchPromises)
    }

    setResults(validationResults)
    calculateStats(validationResults)
    setIsValidating(false)
    setCurrentProxy('')
  }

  // Stop validation
  const stopValidation = () => {
    abortController.current?.abort()
    setIsValidating(false)
    setCurrentProxy('')
  }

  // Calculate statistics
  const calculateStats = (results: ValidationResult[]) => {
    const validResults = results.filter(r => r.isValid)
    const total = results.length
    const valid = validResults.length
    const invalid = total - valid

    const averagePing = validResults.length > 0 
      ? validResults.reduce((sum, r) => sum + r.ping, 0) / validResults.length 
      : 0

    const averageSpeed = validResults.length > 0 
      ? validResults.reduce((sum, r) => sum + r.speed, 0) / validResults.length 
      : 0

    const averageQuality = validResults.length > 0 
      ? validResults.reduce((sum, r) => sum + r.qualityScore, 0) / validResults.length 
      : 0

    const countries: Record<string, number> = {}
    const types: Record<string, number> = {}

    validResults.forEach(result => {
      if (result.country) {
        countries[result.country] = (countries[result.country] || 0) + 1
      }
      types[result.proxy.type] = (types[result.proxy.type] || 0) + 1
    })

    setStats({
      total,
      valid,
      invalid,
      averagePing: Math.round(averagePing),
      averageSpeed: Math.round(averageSpeed),
      averageQuality: Math.round(averageQuality),
      countries,
      types
    })
  }

  // Filter and sort results
  const filteredResults = results
    .filter(result => {
      if (filter === 'valid') return result.isValid
      if (filter === 'invalid') return !result.isValid
      return true
    })
    .sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (sortBy) {
        case 'quality':
          aValue = a.qualityScore
          bValue = b.qualityScore
          break
        case 'ping':
          aValue = a.ping
          bValue = b.ping
          break
        case 'speed':
          aValue = a.speed
          bValue = b.speed
          break
        case 'testTime':
          aValue = a.testTime
          bValue = b.testTime
          break
        default:
          return 0
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

  // Export results
  const exportResults = (format: 'json' | 'csv' | 'txt') => {
    const data = filteredResults.map(result => ({
      host: result.proxy.host,
      port: result.proxy.port,
      type: result.proxy.type,
      username: result.proxy.username || '',
      password: result.proxy.password || '',
      valid: result.isValid,
      ping: result.ping,
      speed: result.speed,
      country: result.country || '',
      anonymity: result.anonymity || '',
      qualityScore: result.qualityScore,
      error: result.error || ''
    }))

    let content = ''
    let filename = ''

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2)
        filename = 'proxy-validation-results.json'
        break
      case 'csv':
        const headers = Object.keys(data[0] || {}).join(',')
        const rows = data.map(row => Object.values(row).join(','))
        content = [headers, ...rows].join('\n')
        filename = 'proxy-validation-results.csv'
        break
      case 'txt':
        content = data.map(row => 
          `${row.host}:${row.port}${row.username ? `:${row.username}:${row.password}` : ''} | ${row.valid ? 'VALID' : 'INVALID'} | Ping: ${row.ping}ms | Speed: ${row.speed} | Quality: ${row.qualityScore}/100`
        ).join('\n')
        filename = 'proxy-validation-results.txt'
        break
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Mass Proxy Validator</h2>
              <p className="text-sm text-gray-600">Kiểm tra hàng loạt proxy với đánh giá chất lượng</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isValidating ? (
              <button
                onClick={startValidation}
                disabled={proxies.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                <span>Bắt đầu kiểm tra</span>
              </button>
            ) : (
              <button
                onClick={stopValidation}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                <Square className="h-4 w-4" />
                <span>Dừng</span>
              </button>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhập danh sách proxy (mỗi dòng một proxy):
            </label>
            <textarea
              value={proxies.map(p => `${p.host}:${p.port}${p.username ? `:${p.username}:${p.password}` : ''}`).join('\n')}
              onChange={(e) => setProxies(parseProxyInput(e.target.value))}
              placeholder="192.168.1.1:8080&#10;192.168.1.2:3128:username:password&#10;http://192.168.1.3:8080&#10;socks5://user:pass@192.168.1.4:1080"
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>

          {/* Progress */}
          {isValidating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Đang kiểm tra: {currentProxy}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Tổng số</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Hợp lệ</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.valid}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-gray-700">Không hợp lệ</span>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.invalid}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center space-x-2">
              <Gauge className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Chất lượng TB</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats.averageQuality}/100</p>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Kết quả kiểm tra</h3>
              
              <div className="flex items-center space-x-4">
                {/* Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                >
                  <option value="all">Tất cả</option>
                  <option value="valid">Hợp lệ</option>
                  <option value="invalid">Không hợp lệ</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                >
                  <option value="quality">Chất lượng</option>
                  <option value="ping">Ping</option>
                  <option value="speed">Tốc độ</option>
                  <option value="testTime">Thời gian test</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>

                {/* Export */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => exportResults('json')}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => exportResults('csv')}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => exportResults('txt')}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    TXT
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proxy</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ping</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tốc độ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quốc gia</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ẩn danh</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chất lượng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">
                      {result.proxy.host}:{result.proxy.port}
                      {result.proxy.username && `:${result.proxy.username}:${result.proxy.password}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {result.isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm ${result.isValid ? 'text-green-600' : 'text-red-600'}`}>
                          {result.isValid ? 'Hợp lệ' : 'Không hợp lệ'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.ping}ms</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.speed.toLocaleString()} bps</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.country || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.anonymity || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              result.qualityScore >= 80 ? 'bg-green-500' :
                              result.qualityScore >= 60 ? 'bg-yellow-500' :
                              result.qualityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${result.qualityScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{result.qualityScore}/100</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
