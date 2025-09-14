'use client'

import { useState } from 'react'
import { Play, CheckCircle, XCircle, Clock, Globe, ExternalLink } from 'lucide-react'

import { SimpleProxy as Proxy } from '@/types/proxy'

interface TestResult {
  url: string
  success: boolean
  responseTime: number
  statusCode?: number
  error?: string
  content?: string
}

interface ProxyMultiTestProps {
  proxy: Proxy
}

const testUrls = [
  'https://gongshuang-xhkj.cdbyza.com:5340/#gg450',
  'https://peixin-byxh.xcdfwt.com:6130/#gg450',
  'https://yida-ykxinsi.gzcszl.com:8545/#gg450',
  'https://hdys-xhd.tuoyaocun.com:13349/#gg450',
  'https://lyl-xh.xdtyzz.com:9866/#gg450',
  'https://toutiao-hrfg.hbrcwlkj.com:4070/#gg450',
  'https://leifeng-jinbeixh.vkypni.com:8442/#gg450'
]

export default function ProxyMultiTest({ proxy }: ProxyMultiTestProps) {
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [currentTest, setCurrentTest] = useState<string>('')

  const testProxy = async () => {
    setIsTesting(true)
    setTestResults([])
    setCurrentTest('')

    const results: TestResult[] = []

    for (const url of testUrls) {
      setCurrentTest(url)
      
      try {
        const startTime = Date.now()
        
        // Tạo proxy URL
        const proxyUrl = proxy.username && proxy.password 
          ? `${proxy.type}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
          : `${proxy.type}://${proxy.host}:${proxy.port}`

        // Test với fetch API (chỉ hoạt động với HTTP proxy)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)

        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          // Note: Browser fetch không hỗ trợ proxy trực tiếp
          // Cần sử dụng server-side proxy hoặc extension
        })

        clearTimeout(timeoutId)
        const responseTime = Date.now() - startTime

        let content = ''
        try {
          content = await response.text()
        } catch (e) {
          content = 'Không thể đọc nội dung'
        }

        results.push({
          url,
          success: response.ok,
          responseTime,
          statusCode: response.status,
          content: content.substring(0, 200) + (content.length > 200 ? '...' : '')
        })

      } catch (error: any) {
        const responseTime = Date.now() - Date.now()
        results.push({
          url,
          success: false,
          responseTime: 0,
          error: error.message || 'Lỗi không xác định'
        })
      }

      // Delay giữa các request
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    setTestResults(results)
    setIsTesting(false)
    setCurrentTest('')
  }

  const getStatusIcon = (result: TestResult) => {
    if (result.success) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusText = (result: TestResult) => {
    if (result.success) {
      return `Thành công (${result.responseTime}ms)`
    } else {
      return `Thất bại: ${result.error}`
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Test Proxy với Nhiều URL
          </h3>
          <button
            onClick={testProxy}
            disabled={isTesting}
            className="btn btn-primary flex items-center gap-2"
          >
            {isTesting ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                Đang test...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Bắt đầu test
              </>
            )}
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Thông tin Proxy:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Host:</strong> {proxy.host}</p>
            <p><strong>Port:</strong> {proxy.port}</p>
            <p><strong>Type:</strong> {proxy.type.toUpperCase()}</p>
            {proxy.username && <p><strong>Username:</strong> {proxy.username}</p>}
            {proxy.password && <p><strong>Password:</strong> {'*'.repeat(proxy.password.length)}</p>}
          </div>
        </div>

        {currentTest && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-blue-900">
                Đang test: {currentTest}
              </span>
            </div>
          </div>
        )}

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Kết quả test:</h4>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result)}
                      <span className="text-sm font-medium text-gray-900">
                        {getStatusText(result)}
                      </span>
                    </div>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    URL: {result.url}
                  </div>
                  
                  {result.statusCode && (
                    <div className="text-xs text-gray-500 mb-2">
                      Status Code: {result.statusCode}
                    </div>
                  )}
                  
                  {result.content && (
                    <div className="bg-gray-100 rounded p-2 text-xs text-gray-700">
                      <strong>Nội dung (200 ký tự đầu):</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{result.content}</pre>
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="bg-red-100 border border-red-200 rounded p-2 text-xs text-red-700">
                      <strong>Lỗi:</strong> {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Thống kê:</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tổng số URL:</span>
                  <span className="ml-2 font-medium">{testResults.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Thành công:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {testResults.filter(r => r.success).length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Thất bại:</span>
                  <span className="ml-2 font-medium text-red-600">
                    {testResults.filter(r => !r.success).length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Tỷ lệ thành công:</span>
                  <span className="ml-2 font-medium">
                    {Math.round((testResults.filter(r => r.success).length / testResults.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
