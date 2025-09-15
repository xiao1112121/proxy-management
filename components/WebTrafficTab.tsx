'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Globe, 
  Activity, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  MapPin, 
  Zap,
  Play,
  Pause,
  Square,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import TestUrlSelector from './TestUrlSelector'

interface TrafficData {
  id: string
  proxyId: number
  url: string
  timestamp: number
  responseTime: number
  statusCode: number
  success: boolean
  country?: string
  city?: string
  isp?: string
  userAgent?: string
  referer?: string
  method: string
  bytesReceived: number
  bytesSent: number
  pageTitle?: string
  finalUrl?: string
  redirectCount?: number
}

interface WebTrafficTabProps {
  proxies: Proxy[]
  onUpdateProxy: (id: number, updates: Partial<Proxy>) => void
}

export default function WebTrafficTab({ proxies, onUpdateProxy }: WebTrafficTabProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [trafficData, setTrafficData] = useState<TrafficData[]>([])
  const [testUrl, setTestUrl] = useState('https://www.instagram.com/')
  const [showUrlSelector, setShowUrlSelector] = useState(false)
  const [urlSelectorPosition, setUrlSelectorPosition] = useState<{ x: number; y: number } | null>(null)
  const [currentTest, setCurrentTest] = useState<number | null>(null)
  const [stats, setStats] = useState({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    totalBytes: 0,
    uniqueCountries: 0,
    activeProxies: 0
  })
  const [filters, setFilters] = useState({
    timeRange: '1h',
    statusFilter: 'all',
    countryFilter: 'all',
    proxyFilter: 'all'
  })
  const [trafficSettings, setTrafficSettings] = useState({
    interval: 5000, // 5 seconds between requests
    maxConcurrent: 3, // Max concurrent requests
    enableRandomDelay: true,
    minDelay: 1000, // 1 second
    maxDelay: 5000, // 5 seconds
    enableUserAgentRotation: true,
    enableRefererRotation: true,
    enableRandomPaths: true
  })
  const [targetUrls, setTargetUrls] = useState([
    'https://www.instagram.com/',
    'https://web.telegram.org/',
    'https://www.facebook.com/',
    'https://twitter.com/',
    'https://www.youtube.com/',
    'https://www.tiktok.com/',
    'https://www.google.com/',
    'https://www.bing.com/',
    'https://www.yahoo.com/',
    'https://www.reddit.com/'
  ])
  const [selectedUrl, setSelectedUrl] = useState<string>('')
  const [showAddUrlModal, setShowAddUrlModal] = useState(false)
  const [newUrl, setNewUrl] = useState('')

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const trafficIdRef = useRef(0)

  // URL management functions
  const addTargetUrl = () => {
    if (newUrl.trim() && !targetUrls.includes(newUrl.trim())) {
      setTargetUrls([...targetUrls, newUrl.trim()])
      setNewUrl('')
      setShowAddUrlModal(false)
    }
  }

  const removeTargetUrl = (url: string) => {
    setTargetUrls(targetUrls.filter(u => u !== url))
    if (selectedUrl === url) {
      setSelectedUrl('')
    }
  }

  const openAddUrlModal = () => {
    setShowAddUrlModal(true)
    setNewUrl('')
  }

  const closeAddUrlModal = () => {
    setShowAddUrlModal(false)
    setNewUrl('')
  }

  // User Agents for realistic traffic
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0'
  ]

  // Referers for realistic traffic
  const referers = [
    'https://www.google.com/',
    'https://www.bing.com/',
    'https://www.yahoo.com/',
    'https://www.duckduckgo.com/',
    'https://www.facebook.com/',
    'https://www.twitter.com/',
    'https://www.reddit.com/',
    'https://www.linkedin.com/',
    'https://www.instagram.com/',
    'https://www.youtube.com/',
    'https://www.tiktok.com/',
    'https://www.snapchat.com/',
    'https://www.pinterest.com/',
    'https://www.quora.com/',
    'https://www.stackoverflow.com/'
  ]

  // Random paths for more realistic traffic
  const randomPaths = [
    '/', '/home', '/about', '/contact', '/products', '/services', '/blog', '/news',
    '/search', '/login', '/register', '/profile', '/settings', '/help', '/faq',
    '/privacy', '/terms', '/support', '/download', '/api', '/status'
  ]

  // URL selector handlers
  const handleUrlSelect = (url: string) => {
    setTestUrl(url)
    setShowUrlSelector(false)
  }

  const handleUrlSelectorClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setUrlSelectorPosition({
      x: rect.left,
      y: rect.bottom + 5
    })
    setShowUrlSelector(true)
  }

  const handleCloseUrlSelector = () => {
    setShowUrlSelector(false)
  }

  // Start/Stop traffic monitoring
  const startTrafficMonitoring = () => {
    if (intervalRef.current) return
    
    setIsRunning(true)
    setCurrentTest(null)
    
    // Initial traffic generation
    generateTraffic()
    
    // Set up interval for continuous traffic
    intervalRef.current = setInterval(() => {
      generateTraffic()
    }, 5000) // Generate traffic every 5 seconds
  }

  const stopTrafficMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
    setCurrentTest(null)
  }

  const generateTraffic = async () => {
    // Check if there is a selected URL
    if (!selectedUrl) {
      console.log('No URL selected, skipping traffic generation')
      return
    }

    // Auto-select fastest proxies
    const availableProxies = proxies.filter(p => p.host && p.port)
    if (availableProxies.length === 0) {
      console.log('No available proxies, skipping traffic generation')
      return
    }

    // Sort proxies by speed (fastest first) and take top performers
    const sortedProxies = availableProxies
      .filter(p => p.ping && p.ping > 0) // Only proxies with ping data
      .sort((a, b) => (a.ping || 999999) - (b.ping || 999999))
      .slice(0, Math.min(trafficSettings.maxConcurrent, availableProxies.length))

    // If no proxies with ping data, use all available proxies
    const activeProxies = sortedProxies.length > 0 ? sortedProxies : availableProxies.slice(0, trafficSettings.maxConcurrent)

    // Generate multiple concurrent requests
    const concurrentRequests = Math.min(trafficSettings.maxConcurrent, activeProxies.length)
    const requests = []

    for (let i = 0; i < concurrentRequests; i++) {
      const proxy = activeProxies[i % activeProxies.length] // Round-robin for load balancing
      const randomPath = trafficSettings.enableRandomPaths 
        ? randomPaths[Math.floor(Math.random() * randomPaths.length)]
        : ''
      
      const fullUrl = selectedUrl + randomPath
      requests.push(sendTrafficRequest(proxy, fullUrl))
    }

    // Execute all requests concurrently
    await Promise.allSettled(requests)
  }

  const sendTrafficRequest = async (proxy: Proxy, url: string) => {
    setCurrentTest(proxy.id)

    try {
      const startTime = Date.now()
      
      // Random delay for more realistic traffic
      if (trafficSettings.enableRandomDelay) {
        const delay = Math.random() * (trafficSettings.maxDelay - trafficSettings.minDelay) + trafficSettings.minDelay
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      // Random User Agent
      const userAgent = trafficSettings.enableUserAgentRotation 
        ? userAgents[Math.floor(Math.random() * userAgents.length)]
        : userAgents[0]

      // Random Referer
      const referer = trafficSettings.enableRefererRotation 
        ? referers[Math.floor(Math.random() * referers.length)]
        : referers[0]

      // Send actual HTTP request through proxy
      const response = await fetch('/api/traffic-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proxy: {
            host: proxy.host,
            port: proxy.port,
            username: proxy.username,
            password: proxy.password,
            type: proxy.type
          },
          url: url,
          userAgent: userAgent,
          referer: referer,
          method: 'GET'
        })
      })

      const data = await response.json()
      const responseTime = Date.now() - startTime

      // Generate traffic data
      const trafficEntry: TrafficData = {
        id: `traffic_${trafficIdRef.current++}`,
        proxyId: proxy.id,
        url: url,
        timestamp: Date.now(),
        responseTime,
        statusCode: data.statusCode || (data.success ? 200 : 500),
        success: data.success,
        country: data.country,
        city: data.city,
        isp: data.isp,
        userAgent: userAgent,
        referer: referer,
        method: 'GET',
        bytesReceived: data.bytesReceived || Math.floor(Math.random() * 50000) + 10000,
        bytesSent: data.bytesSent || Math.floor(Math.random() * 1000) + 500,
        pageTitle: data.pageTitle,
        finalUrl: data.finalUrl || url,
        redirectCount: data.redirectCount || 0
      }

      setTrafficData(prev => [trafficEntry, ...prev.slice(0, 999)]) // Keep last 1000 entries

      // Update proxy status
      onUpdateProxy(proxy.id, {
        status: data.success ? 'alive' : 'dead',
        ping: data.ping,
        speed: data.speed,
        lastTested: new Date().toISOString()
      })

    } catch (error) {
      console.error('Traffic request error:', error)
      
      // Log failed request
      const trafficEntry: TrafficData = {
        id: `traffic_${trafficIdRef.current++}`,
        proxyId: proxy.id,
        url: url,
        timestamp: Date.now(),
        responseTime: 0,
        statusCode: 0,
        success: false,
        userAgent: userAgents[0],
        referer: referers[0],
        method: 'GET',
        bytesReceived: 0,
        bytesSent: 0
      }
      
      setTrafficData(prev => [trafficEntry, ...prev.slice(0, 999)])
    } finally {
      setCurrentTest(null)
    }
  }

  // Calculate stats
  useEffect(() => {
    const now = Date.now()
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    }[filters.timeRange] || 60 * 60 * 1000

    const filteredData = trafficData.filter(entry => 
      now - entry.timestamp <= timeRangeMs
    )

    const successful = filteredData.filter(entry => entry.success)
    const failed = filteredData.filter(entry => !entry.success)
    const averageResponseTime = successful.length > 0 
      ? successful.reduce((sum, entry) => sum + entry.responseTime, 0) / successful.length 
      : 0
    const totalBytes = filteredData.reduce((sum, entry) => sum + entry.bytesReceived + entry.bytesSent, 0)
    const uniqueCountries = new Set(filteredData.map(entry => entry.country).filter(Boolean)).size
    const activeProxies = new Set(filteredData.map(entry => entry.proxyId)).size

    setStats({
      totalRequests: filteredData.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      averageResponseTime: Math.round(averageResponseTime),
      totalBytes: Math.round(totalBytes / 1024), // KB
      uniqueCountries,
      activeProxies
    })
  }, [trafficData, filters.timeRange])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getCountryFlag = (country?: string) => {
    if (!country) return '🌍'
    const flags: Record<string, string> = {
      'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷', 'JP': '🇯🇵',
      'CN': '🇨🇳', 'KR': '🇰🇷', 'IN': '🇮🇳', 'BR': '🇧🇷', 'CA': '🇨🇦',
      'AU': '🇦🇺', 'RU': '🇷🇺', 'IT': '🇮🇹', 'ES': '🇪🇸', 'NL': '🇳🇱'
    }
    return flags[country] || '🌍'
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Web Traffic Monitor</h2>
          <p className="text-gray-600">Giám sát lưu lượng web qua proxy</p>
          {isRunning && (
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Đang giám sát...</span>
              {currentTest && (
                <span className="text-sm text-blue-600">
                  (Proxy ID: {currentTest})
                </span>
              )}
              <span className="text-sm text-gray-600">
                • Tự động chọn proxy nhanh nhất
              </span>
            </div>
          )}
          {!selectedUrl && (
            <div className="flex items-center space-x-2 mt-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-yellow-600">
                Vui lòng chọn 1 URL mục tiêu để bắt đầu
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* URL Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">URL Test:</label>
            <button
              onClick={handleUrlSelectorClick}
              className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Globe className="h-4 w-4" />
              <span className="max-w-xs truncate">
                {testUrl === 'https://www.instagram.com/' ? 'Instagram' : 
                 testUrl === 'https://web.telegram.org/' ? 'Telegram' :
                 testUrl === 'https://www.facebook.com/' ? 'Facebook' :
                 testUrl === 'https://twitter.com/' ? 'Twitter' :
                 testUrl === 'https://www.youtube.com/' ? 'YouTube' :
                 testUrl}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={isRunning ? stopTrafficMonitoring : startTrafficMonitoring}
              disabled={!selectedUrl}
              className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg ${
                isRunning 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : !selectedUrl
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Dừng</span>
                </>
              ) : !selectedUrl ? (
                <>
                  <Play className="h-4 w-4" />
                  <span>Chọn URL trước</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Bắt đầu</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => setTrafficData([])}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              <Square className="h-4 w-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Thành công</p>
              <p className="text-2xl font-bold text-green-600">{stats.successfulRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Thất bại</p>
              <p className="text-2xl font-bold text-red-600">{stats.failedRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Response TB</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageResponseTime}ms</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Download className="h-5 w-5 text-purple-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Dữ liệu</p>
              <p className="text-2xl font-bold text-gray-900">{formatBytes(stats.totalBytes * 1024)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-indigo-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Quốc gia</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueCountries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-teal-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Proxy hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeProxies}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Settings */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt Traffic</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proxy đang sử dụng</label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Tự động chọn proxy nhanh nhất</span>
              </div>
              <p className="text-xs text-blue-700">
                Hệ thống sẽ tự động chọn {Math.min(trafficSettings.maxConcurrent, proxies.length)} proxy có ping thấp nhất để sử dụng
              </p>
              {proxies.length > 0 && (
                <div className="mt-2 text-xs text-blue-600">
                  Tổng có {proxies.length} proxy khả dụng
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tần suất (giây)</label>
            <input
              type="number"
              value={trafficSettings.interval / 1000}
              onChange={(e) => setTrafficSettings(prev => ({ 
                ...prev, 
                interval: parseInt(e.target.value) * 1000 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
              max="60"
            />
            <p className="text-xs text-gray-500 mt-1">Khoảng cách giữa các request</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số request đồng thời</label>
            <input
              type="number"
              value={trafficSettings.maxConcurrent}
              onChange={(e) => setTrafficSettings(prev => ({ 
                ...prev, 
                maxConcurrent: parseInt(e.target.value) 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
              max="10"
            />
            <p className="text-xs text-gray-500 mt-1">Số request chạy cùng lúc</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={trafficSettings.enableRandomDelay}
                onChange={(e) => setTrafficSettings(prev => ({ 
                  ...prev, 
                  enableRandomDelay: e.target.checked 
                }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Delay ngẫu nhiên</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={trafficSettings.enableUserAgentRotation}
                onChange={(e) => setTrafficSettings(prev => ({ 
                  ...prev, 
                  enableUserAgentRotation: e.target.checked 
                }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Xoay User Agent</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={trafficSettings.enableRefererRotation}
                onChange={(e) => setTrafficSettings(prev => ({ 
                  ...prev, 
                  enableRefererRotation: e.target.checked 
                }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Xoay Referer</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={trafficSettings.enableRandomPaths}
                onChange={(e) => setTrafficSettings(prev => ({ 
                  ...prev, 
                  enableRandomPaths: e.target.checked 
                }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Đường dẫn ngẫu nhiên</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL mục tiêu</label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <select
                  value={selectedUrl}
                  onChange={(e) => setSelectedUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn URL mục tiêu...</option>
                  {targetUrls.map((url, index) => (
                    <option key={index} value={url}>
                      {url}
                    </option>
                  ))}
                </select>
                <button
                  onClick={openAddUrlModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center space-x-1"
                >
                  <span>+</span>
                  <span>Thêm URL</span>
                </button>
              </div>
              {selectedUrl && (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <span className="text-sm text-blue-800 truncate flex-1">{selectedUrl}</span>
                  <button
                    onClick={() => setSelectedUrl('')}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500">
                {targetUrls.length} URLs có sẵn • {selectedUrl ? '1 URL được chọn' : 'Chưa chọn URL'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng thời gian</label>
            <select
              value={filters.timeRange}
              onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">1 giờ</option>
              <option value="6h">6 giờ</option>
              <option value="24h">24 giờ</option>
              <option value="7d">7 ngày</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={filters.statusFilter}
              onChange={(e) => setFilters(prev => ({ ...prev, statusFilter: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="success">Thành công</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quốc gia</label>
            <select
              value={filters.countryFilter}
              onChange={(e) => setFilters(prev => ({ ...prev, countryFilter: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              {/* Add countries dynamically */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proxy</label>
            <select
              value={filters.proxyFilter}
              onChange={(e) => setFilters(prev => ({ ...prev, proxyFilter: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              {proxies.map(proxy => (
                <option key={proxy.id} value={proxy.id}>
                  {proxy.host}:{proxy.port}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Traffic Log */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Traffic Log</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {trafficData.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có dữ liệu traffic</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {trafficData.map((entry) => (
                <div key={entry.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(entry.success)}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {entry.method} {entry.url}
                        </p>
                        <p className="text-sm text-gray-600">
                          Proxy ID: {entry.proxyId} • {formatTime(entry.timestamp)}
                        </p>
                        {entry.pageTitle && (
                          <p className="text-xs text-blue-600">
                            📄 {entry.pageTitle}
                          </p>
                        )}
                        {entry.finalUrl !== entry.url && (
                          <p className="text-xs text-orange-600">
                            🔄 Redirected to: {entry.finalUrl}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>🌐 {entry.userAgent?.split(' ')[0]}...</span>
                          <span>🔗 From: {entry.referer}</span>
                          {entry.redirectCount && entry.redirectCount > 0 && (
                            <span>🔄 {entry.redirectCount} redirects</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{entry.responseTime}ms</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          entry.statusCode >= 200 && entry.statusCode < 300 
                            ? 'bg-green-100 text-green-800'
                            : entry.statusCode >= 300 && entry.statusCode < 400
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {entry.statusCode}
                        </span>
                        <span>{formatBytes(entry.bytesReceived)}</span>
                        {entry.country && (
                          <span className="flex items-center space-x-1">
                            {getCountryFlag(entry.country)}
                            <span>{entry.country}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* URL Selector Modal */}
      {showUrlSelector && (
        <TestUrlSelector
          onUrlSelect={handleUrlSelect}
          onClose={handleCloseUrlSelector}
          position={urlSelectorPosition || undefined}
        />
      )}
    </div>
  )
}
