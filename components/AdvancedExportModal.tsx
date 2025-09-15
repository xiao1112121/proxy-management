'use client'

import { useState } from 'react'
import { 
  Download, 
  X, 
  FileText, 
  FileSpreadsheet, 
  Code, 
  Globe, 
  Settings,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface ExportFormat {
  id: string
  name: string
  description: string
  icon: any
  extension: string
  mimeType: string
  category: 'basic' | 'advanced' | 'tools'
}

interface AdvancedExportModalProps {
  isOpen: boolean
  onClose: () => void
  proxies: Proxy[]
  selectedProxies?: number[]
}

const exportFormats: ExportFormat[] = [
  // Basic formats
  {
    id: 'json',
    name: 'JSON',
    description: 'Định dạng JSON đầy đủ với metadata',
    icon: Code,
    extension: 'json',
    mimeType: 'application/json',
    category: 'basic'
  },
  {
    id: 'csv',
    name: 'CSV',
    description: 'Bảng tính Excel/Google Sheets',
    icon: FileSpreadsheet,
    extension: 'csv',
    mimeType: 'text/csv',
    category: 'basic'
  },
  {
    id: 'txt',
    name: 'TXT',
    description: 'Text thuần túy, mỗi dòng một proxy',
    icon: FileText,
    extension: 'txt',
    mimeType: 'text/plain',
    category: 'basic'
  },
  {
    id: 'xml',
    name: 'XML',
    description: 'Định dạng XML có cấu trúc',
    icon: Code,
    extension: 'xml',
    mimeType: 'application/xml',
    category: 'basic'
  },
  
  // Advanced formats
  {
    id: 'proxifier',
    name: 'Proxifier',
    description: 'File config cho Proxifier',
    icon: Settings,
    extension: 'ppx',
    mimeType: 'application/xml',
    category: 'advanced'
  },
  {
    id: 'foxyproxy',
    name: 'FoxyProxy',
    description: 'File config cho FoxyProxy extension',
    icon: Globe,
    extension: 'json',
    mimeType: 'application/json',
    category: 'advanced'
  },
  {
    id: 'switchyomega',
    name: 'SwitchyOmega',
    description: 'File config cho SwitchyOmega',
    icon: Settings,
    extension: 'json',
    mimeType: 'application/json',
    category: 'advanced'
  },
  {
    id: 'shadowsocks',
    name: 'Shadowsocks',
    description: 'File config cho Shadowsocks',
    icon: Settings,
    extension: 'json',
    mimeType: 'application/json',
    category: 'advanced'
  },
  
  // Tools formats
  {
    id: 'squid',
    name: 'Squid',
    description: 'File config cho Squid proxy',
    icon: Settings,
    extension: 'conf',
    mimeType: 'text/plain',
    category: 'tools'
  },
  {
    id: 'nginx',
    name: 'Nginx',
    description: 'File config cho Nginx proxy',
    icon: Settings,
    extension: 'conf',
    mimeType: 'text/plain',
    category: 'tools'
  },
  {
    id: 'haproxy',
    name: 'HAProxy',
    description: 'File config cho HAProxy',
    icon: Settings,
    extension: 'cfg',
    mimeType: 'text/plain',
    category: 'tools'
  },
  {
    id: 'curl',
    name: 'cURL Scripts',
    description: 'Scripts cURL để test proxy',
    icon: Code,
    extension: 'sh',
    mimeType: 'text/plain',
    category: 'tools'
  }
]

export default function AdvancedExportModal({ 
  isOpen, 
  onClose, 
  proxies, 
  selectedProxies = [] 
}: AdvancedExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('')
  const [exportOptions, setExportOptions] = useState({
    includeCredentials: true,
    includeStats: true,
    includeHeaders: false,
    includeTimestamps: true,
    filterAlive: false,
    filterByType: '',
    filterByCountry: '',
    sortBy: 'host',
    sortOrder: 'asc' as 'asc' | 'desc'
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  if (!isOpen) return null

  const proxiesToExport = selectedProxies.length > 0 
    ? proxies.filter(p => selectedProxies.includes(p.id))
    : proxies

  const filteredProxies = proxiesToExport.filter(proxy => {
    if (exportOptions.filterAlive && proxy.status !== 'alive') return false
    if (exportOptions.filterByType && proxy.type !== exportOptions.filterByType) return false
    if (exportOptions.filterByCountry && proxy.country !== exportOptions.filterByCountry) return false
    return true
  })

  const sortedProxies = [...filteredProxies].sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (exportOptions.sortBy) {
      case 'host':
        aValue = a.host
        bValue = b.host
        break
      case 'port':
        aValue = a.port
        bValue = b.port
        break
      case 'type':
        aValue = a.type
        bValue = b.type
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      case 'ping':
        aValue = a.ping || 0
        bValue = b.ping || 0
        break
      case 'speed':
        aValue = a.speed || 0
        bValue = b.speed || 0
        break
      default:
        return 0
    }

    if (exportOptions.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const generateExportContent = (format: string): string => {
    switch (format) {
      case 'json':
        return JSON.stringify({
          proxies: sortedProxies,
          metadata: {
            exportTime: new Date().toISOString(),
            totalCount: sortedProxies.length,
            options: exportOptions
          }
        }, null, 2)

      case 'csv':
        const headers = ['host', 'port', 'type', 'username', 'password', 'status', 'ping', 'speed', 'country', 'anonymity']
        const rows = sortedProxies.map(proxy => 
          headers.map(header => proxy[header as keyof Proxy] || '').join(',')
        )
        return [headers.join(','), ...rows].join('\n')

      case 'txt':
        return sortedProxies.map(proxy => {
          const auth = proxy.username && proxy.password ? `:${proxy.username}:${proxy.password}` : ''
          return `${proxy.host}:${proxy.port}${auth}`
        }).join('\n')

      case 'xml':
        return `<?xml version="1.0" encoding="UTF-8"?>
<proxies>
  <metadata>
    <exportTime>${new Date().toISOString()}</exportTime>
    <totalCount>${sortedProxies.length}</totalCount>
  </metadata>
  ${sortedProxies.map(proxy => `
  <proxy>
    <host>${proxy.host}</host>
    <port>${proxy.port}</port>
    <type>${proxy.type}</type>
    <username>${proxy.username || ''}</username>
    <password>${proxy.password || ''}</password>
    <status>${proxy.status}</status>
    <ping>${proxy.ping || 0}</ping>
    <speed>${proxy.speed || 0}</speed>
    <country>${proxy.country || ''}</country>
    <anonymity>${proxy.anonymity || ''}</anonymity>
  </proxy>`).join('')}
</proxies>`

      case 'proxifier':
        return `<?xml version="1.0" encoding="UTF-8"?>
<ProxifierProfile version="101" platform="Windows" product="Proxifier">
  <Options>
    <Resolve>
      <AutoMode>1</AutoMode>
    </Resolve>
  </Options>
  <ProxyList>
    ${sortedProxies.map((proxy, index) => `
    <Proxy id="${index + 1}">
      <Address>${proxy.host}</Address>
      <Port>${proxy.port}</Port>
      <Type>${proxy.type === 'socks5' ? 'SOCKS5' : proxy.type === 'socks4' ? 'SOCKS4' : 'HTTP'}</Type>
      ${proxy.username ? `<Username>${proxy.username}</Username>` : ''}
      ${proxy.password ? `<Password>${proxy.password}</Password>` : ''}
    </Proxy>`).join('')}
  </ProxyList>
</ProxifierProfile>`

      case 'foxyproxy':
        return JSON.stringify({
          version: 2,
          proxies: sortedProxies.map((proxy, index) => ({
            id: index + 1,
            title: `${proxy.host}:${proxy.port}`,
            type: proxy.type,
            host: proxy.host,
            port: proxy.port,
            username: proxy.username || '',
            password: proxy.password || '',
            enabled: true
          }))
        }, null, 2)

      case 'switchyomega':
        return JSON.stringify({
          version: "1.0",
          profiles: [{
            name: "Proxy List",
            type: "FixedProfile",
            color: "#3daee9",
            proxySettings: {
              type: "manual",
              http: sortedProxies.filter(p => p.type === 'http').map(p => `${p.host}:${p.port}`),
              https: sortedProxies.filter(p => p.type === 'https').map(p => `${p.host}:${p.port}`),
              socks: sortedProxies.filter(p => p.type.startsWith('socks')).map(p => `${p.host}:${p.port}`)
            }
          }]
        }, null, 2)

      case 'shadowsocks':
        return JSON.stringify({
          configs: sortedProxies.map(proxy => ({
            server: proxy.host,
            server_port: proxy.port,
            password: proxy.password || '',
            method: "aes-256-gcm",
            remarks: `${proxy.host}:${proxy.port}`
          }))
        }, null, 2)

      case 'squid':
        return `# Squid proxy configuration
# Generated on ${new Date().toISOString()}

# Cache settings
cache_dir ufs /var/spool/squid 100 16 256
cache_mem 256 MB

# Access control
acl localnet src 10.0.0.0/8
acl localnet src 172.16.0.0/12
acl localnet src 192.168.0.0/16

# Proxy definitions
${sortedProxies.map(proxy => `
# ${proxy.host}:${proxy.port} (${proxy.type})
cache_peer ${proxy.host} parent ${proxy.port} 0 no-query default
cache_peer_access ${proxy.host} allow all`).join('')}

# Default rules
http_access allow localnet
http_access deny all

# Port
http_port 3128` 

      case 'nginx':
        return `# Nginx proxy configuration
# Generated on ${new Date().toISOString()}

upstream proxy_backend {
    ${sortedProxies.map(proxy => `server ${proxy.host}:${proxy.port};`).join('\n    ')}
}

server {
    listen 8080;
    
    location / {
        proxy_pass http://proxy_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}`

      case 'haproxy':
        return `# HAProxy configuration
# Generated on ${new Date().toISOString()}

global
    daemon
    maxconn 4096

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

frontend proxy_frontend
    bind *:8080
    default_backend proxy_backend

backend proxy_backend
    balance roundrobin
    ${sortedProxies.map(proxy => `server proxy${proxy.id} ${proxy.host}:${proxy.port} check`).join('\n    ')}`

      case 'curl':
        return `#!/bin/bash
# cURL test scripts for proxy list
# Generated on ${new Date().toISOString()}

TEST_URL="http://httpbin.org/ip"

echo "Testing ${sortedProxies.length} proxies..."

${sortedProxies.map((proxy, index) => `
# Test ${index + 1}: ${proxy.host}:${proxy.port}
echo "Testing ${proxy.host}:${proxy.port}..."
curl --proxy ${proxy.type}://${proxy.host}:${proxy.port} \\
     ${proxy.username ? `--proxy-user ${proxy.username}:${proxy.password || ''}` : ''} \\
     --connect-timeout 10 \\
     --max-time 30 \\
     --silent \\
     --show-error \\
     "$TEST_URL" && echo "✅ ${proxy.host}:${proxy.port} - OK" || echo "❌ ${proxy.host}:${proxy.port} - FAILED"
`).join('')}

echo "Testing completed!"`

      default:
        return ''
    }
  }

  const handleExport = async () => {
    if (!selectedFormat) return

    setIsExporting(true)
    setExportStatus(null)

    try {
      const content = generateExportContent(selectedFormat)
      const format = exportFormats.find(f => f.id === selectedFormat)
      
      if (!format) throw new Error('Invalid format selected')

      const blob = new Blob([content], { type: format.mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `proxies.${format.extension}`
      a.click()
      URL.revokeObjectURL(url)

      setExportStatus({
        type: 'success',
        message: `Đã xuất ${sortedProxies.length} proxy thành file ${format.extension.toUpperCase()}`
      })
    } catch (error) {
      setExportStatus({
        type: 'error',
        message: `Lỗi khi xuất file: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsExporting(false)
    }
  }

  const formatCategories = {
    basic: exportFormats.filter(f => f.category === 'basic'),
    advanced: exportFormats.filter(f => f.category === 'advanced'),
    tools: exportFormats.filter(f => f.category === 'tools')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Advanced Export</h2>
              <p className="text-sm text-gray-600">
                Xuất {proxiesToExport.length} proxy với nhiều định dạng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Format Selection */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn định dạng</h3>
            
            {/* Basic Formats */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Định dạng cơ bản</h4>
              <div className="space-y-2">
                {formatCategories.basic.map(format => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      selectedFormat === format.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <format.icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">{format.name}</div>
                        <div className="text-sm text-gray-600">{format.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Formats */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Định dạng nâng cao</h4>
              <div className="space-y-2">
                {formatCategories.advanced.map(format => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      selectedFormat === format.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <format.icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">{format.name}</div>
                        <div className="text-sm text-gray-600">{format.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tools Formats */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Định dạng công cụ</h4>
              <div className="space-y-2">
                {formatCategories.tools.map(format => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      selectedFormat === format.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <format.icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">{format.name}</div>
                        <div className="text-sm text-gray-600">{format.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Options */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tùy chọn xuất</h3>
            
            {/* Filter Options */}
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700">Lọc dữ liệu</h4>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.filterAlive}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, filterAlive: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Chỉ xuất proxy hoạt động</span>
                </label>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Loại proxy</label>
                  <select
                    value={exportOptions.filterByType}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, filterByType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Tất cả</option>
                    <option value="http">HTTP</option>
                    <option value="https">HTTPS</option>
                    <option value="socks4">SOCKS4</option>
                    <option value="socks5">SOCKS5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Quốc gia</label>
                  <select
                    value={exportOptions.filterByCountry}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, filterByCountry: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Tất cả</option>
                    {Array.from(new Set(proxiesToExport.map(p => p.country).filter(Boolean))).map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700">Sắp xếp</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Sắp xếp theo</label>
                  <select
                    value={exportOptions.sortBy}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="host">Host</option>
                    <option value="port">Port</option>
                    <option value="type">Loại</option>
                    <option value="status">Trạng thái</option>
                    <option value="ping">Ping</option>
                    <option value="speed">Tốc độ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Thứ tự</label>
                  <select
                    value={exportOptions.sortOrder}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="asc">Tăng dần</option>
                    <option value="desc">Giảm dần</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700">Tùy chọn khác</h4>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeCredentials}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeCredentials: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bao gồm thông tin đăng nhập</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeStats}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeStats: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bao gồm thống kê</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeTimestamps}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeTimestamps: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bao gồm thời gian</span>
                </label>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700">Xem trước</h4>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="text-gray-600">
                  Sẽ xuất <span className="font-semibold text-gray-900">{sortedProxies.length}</span> proxy
                  {exportOptions.filterAlive && <span className="text-blue-600"> (chỉ proxy hoạt động)</span>}
                  {exportOptions.filterByType && <span className="text-blue-600"> (loại {exportOptions.filterByType})</span>}
                  {exportOptions.filterByCountry && <span className="text-blue-600"> (quốc gia {exportOptions.filterByCountry})</span>}
                </div>
              </div>
            </div>

            {/* Status */}
            {exportStatus && (
              <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
                exportStatus.type === 'success' ? 'bg-green-50 text-green-700' :
                exportStatus.type === 'error' ? 'bg-red-50 text-red-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                {exportStatus.type === 'success' && <CheckCircle className="h-4 w-4" />}
                {exportStatus.type === 'error' && <AlertCircle className="h-4 w-4" />}
                {exportStatus.type === 'info' && <Info className="h-4 w-4" />}
                <span className="text-sm">{exportStatus.message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={handleExport}
                disabled={!selectedFormat || isExporting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang xuất...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Xuất file</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
