'use client'

import { useState, useCallback } from 'react'
import { Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle, Globe } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { ProxyImportExport, ExportOptions } from '@/utils/importExport'

interface ProxyImportTestProps {
  onImportSuccess?: () => void
}

interface ImportResult {
  success: boolean
  message: string
  importedCount: number
  errors: string[]
  proxies: Proxy[]
}

export default function ProxyImportTest({ onImportSuccess }: ProxyImportTestProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewData, setPreviewData] = useState<Proxy[]>([])

  const parseProxyLine = (line: string, lineNumber: number): { proxy: Partial<Proxy> | null, error: string | null } => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      return { proxy: null, error: null }
    }

    // Support multiple formats
    const formats = [
      // host:port:username:password:type
      /^([^:]+):(\d+):([^:]+):([^:]+):([^:]+)$/,
      // host:port:username:password
      /^([^:]+):(\d+):([^:]+):([^:]+)$/,
      // host:port:type
      /^([^:]+):(\d+):([^:]+)$/,
      // host:port
      /^([^:]+):(\d+)$/,
      // JSON format
      /^\{.*\}$/
    ]

    for (const format of formats) {
      const match = trimmed.match(format)
      if (match) {
        if (format.source.includes('JSON')) {
          try {
            const jsonData = JSON.parse(trimmed)
            return {
              proxy: {
                host: jsonData.host || jsonData.ip,
                port: jsonData.port,
                username: jsonData.username,
                password: jsonData.password,
                type: jsonData.type || 'http',
                status: 'pending',
                group: jsonData.group,
                notes: jsonData.notes,
                lastTested: new Date().toISOString()
              },
              error: null
            }
          } catch {
            return { proxy: null, error: `Dòng ${lineNumber}: JSON không hợp lệ` }
          }
        } else {
          const [, host, port, username, password, type] = match
          return {
            proxy: {
              host,
              port: parseInt(port),
              username: username || undefined,
              password: password || undefined,
              type: (type as any) || 'http',
              status: 'pending',
              lastTested: new Date().toISOString()
            },
            error: null
          }
        }
      }
    }

    return { proxy: null, error: `Dòng ${lineNumber}: Định dạng không được hỗ trợ` }
  }

  const parseFileContent = (content: string): ImportResult => {
    const lines = content.split('\n')
    const proxies: Proxy[] = []
    const errors: string[] = []

    lines.forEach((line, index) => {
      const { proxy, error } = parseProxyLine(line, index + 1)
      
      if (error) {
        errors.push(error)
      } else if (proxy && proxy.host && proxy.port) {
        const newProxy: Proxy = {
          id: Date.now() + index,
          host: proxy.host,
          port: proxy.port,
          username: proxy.username,
          password: proxy.password,
          type: proxy.type || 'http',
          status: 'pending',
          group: proxy.group,
          notes: proxy.notes,
          lastTested: new Date().toISOString()
        }
        proxies.push(newProxy)
      }
    })

    return {
      success: proxies.length > 0,
      message: proxies.length > 0 
        ? `Đã import thành công ${proxies.length} proxy`
        : 'Không tìm thấy proxy hợp lệ nào',
      importedCount: proxies.length,
      errors,
      proxies
    }
  }

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return

    setIsProcessing(true)
    setImportResult(null)
    setPreviewData([])

    try {
      // Use real import utility
      const result = await ProxyImportExport.importProxies(file)
      
      const importResult: ImportResult = {
        success: result.success,
        message: result.success 
          ? `Đã import thành công ${result.imported.length} proxy`
          : 'Không tìm thấy proxy hợp lệ nào',
        importedCount: result.imported.length,
        errors: result.errors,
        proxies: result.imported
      }
      
      setImportResult(importResult)
      setPreviewData(result.imported)

      if (result.success) {
        // Save to localStorage
        const existingProxies = JSON.parse(localStorage.getItem('proxies') || '[]')
        const newProxies = [...result.imported, ...existingProxies]
        localStorage.setItem('proxies', JSON.stringify(newProxies))
        
        onImportSuccess?.()
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Lỗi khi đọc file',
        importedCount: 0,
        errors: [error instanceof Error ? error.message : 'Lỗi không xác định'],
        proxies: []
      })
    } finally {
      setIsProcessing(false)
    }
  }, [onImportSuccess])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [handleFileUpload])

  const downloadTemplate = () => {
    const template = `# Proxy Import Template
# Format: host:port:username:password:type
# Supported types: http, https, socks4, socks5, residential, datacenter, mobile

# Example 1: Basic format
example1.com:8080

# Example 2: With credentials
example2.com:3128:username:password

# Example 3: With type
example3.com:1080:username:password:socks5

# Example 4: JSON format
{"host":"example4.com","port":8080,"username":"user","password":"pass","type":"http","group":"Premium"}

# Example 5: Multiple proxies
proxy1.com:8080
proxy2.com:3128:user:pass
proxy3.com:1080:user:pass:socks5`

    const blob = new Blob([template], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'proxy_template.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Import Proxy từ File
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Kéo thả file vào đây hoặc click để chọn file
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <label className="btn btn-primary cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Chọn File
            <input
              type="file"
              accept=".txt,.json,.csv"
              onChange={handleFileInput}
              className="hidden"
              disabled={isProcessing}
            />
          </label>
          
          <button
            onClick={downloadTemplate}
            className="btn btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Tải Template
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>Hỗ trợ định dạng: .txt, .json, .csv</p>
          <p>Format: host:port:username:password:type</p>
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-800">Đang xử lý file...</span>
          </div>
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div className={`border rounded-lg p-4 ${
          importResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start">
            {importResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-medium ${
                importResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {importResult.message}
              </h4>
              
              {importResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-red-700 mb-1">Lỗi chi tiết:</p>
                  <ul className="text-sm text-red-600 space-y-1">
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li>• ... và {importResult.errors.length - 5} lỗi khác</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Data */}
      {previewData.length > 0 && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h4 className="font-medium text-gray-900">
              Xem trước ({previewData.length} proxy)
            </h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Host:Port
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Loại
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Auth
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nhóm
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {previewData.slice(0, 10).map((proxy, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {proxy.host}:{proxy.port}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {proxy.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {proxy.username ? 'Có' : 'Không'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {proxy.group || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {previewData.length > 10 && (
            <div className="px-4 py-3 bg-gray-50 text-sm text-gray-500 text-center">
              ... và {previewData.length - 10} proxy khác
            </div>
          )}
        </div>
      )}

      {/* Supported Formats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Định dạng được hỗ trợ
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Định dạng cơ bản:</h5>
            <ul className="space-y-1 text-gray-600">
              <li>• host:port</li>
              <li>• host:port:username:password</li>
              <li>• host:port:username:password:type</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Định dạng JSON:</h5>
            <ul className="space-y-1 text-gray-600">
              <li>• {"{host, port, username, password, type}"}</li>
              <li>• Hỗ trợ thêm group, notes</li>
              <li>• Mỗi dòng một JSON object</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}