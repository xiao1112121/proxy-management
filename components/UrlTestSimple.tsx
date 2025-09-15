'use client'

import { useState } from 'react'
import { Globe, CheckCircle, XCircle } from 'lucide-react'

export default function UrlTestSimple() {
  const [selectedUrl, setSelectedUrl] = useState('https://www.instagram.com/')
  const [testResult, setTestResult] = useState<any>(null)
  const [isTesting, setIsTesting] = useState(false)

  const testUrls = [
    { name: 'Instagram', url: 'https://www.instagram.com/' },
    { name: 'Telegram', url: 'https://web.telegram.org/' },
    { name: 'Facebook', url: 'https://www.facebook.com/' },
    { name: 'Twitter', url: 'https://twitter.com/' },
    { name: 'YouTube', url: 'https://www.youtube.com/' },
    { name: 'TikTok', url: 'https://www.tiktok.com/' },
    { name: 'HTTPBin IP', url: 'http://httpbin.org/ip' },
    { name: 'IPify', url: 'https://api.ipify.org?format=json' }
  ]

  const handleTest = async () => {
    setIsTesting(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/api/test-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: '8.8.8.8',
          port: 8080,
          type: 'http',
          testUrl: selectedUrl
        })
      })

      const data = await response.json()
      setTestResult({
        success: data.success,
        responseTime: data.responseTime,
        ping: data.ping,
        speed: data.speed,
        country: data.country,
        error: data.error,
        statusCode: data.statusCode
      })
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🧪 Test Chọn URL</h2>
        
        {/* URL Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Chọn URL để test:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {testUrls.map((item) => (
              <button
                key={item.url}
                onClick={() => setSelectedUrl(item.url)}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  selectedUrl === item.url
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span className="font-medium">{item.name}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1 truncate">{item.url}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Test Button */}
        <div className="mt-6">
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
          >
            {isTesting ? 'Đang test...' : 'Test URL đã chọn'}
          </button>
        </div>

        {/* Current Selection */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">URL hiện tại:</p>
          <code className="text-sm text-gray-900 break-all">{selectedUrl}</code>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Kết quả test:</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {testResult.success ? 'Thành công' : 'Thất bại'}
                </span>
              </div>
              
              {testResult.responseTime && (
                <p className="text-sm text-gray-600">
                  Thời gian phản hồi: {testResult.responseTime}ms
                </p>
              )}
              
              {testResult.ping && (
                <p className="text-sm text-gray-600">
                  Ping: {testResult.ping}ms
                </p>
              )}
              
              {testResult.speed && (
                <p className="text-sm text-gray-600">
                  Tốc độ: {testResult.speed}ms
                </p>
              )}
              
              {testResult.country && (
                <p className="text-sm text-gray-600">
                  Quốc gia: {testResult.country}
                </p>
              )}
              
              {testResult.statusCode && (
                <p className="text-sm text-gray-600">
                  Status Code: {testResult.statusCode}
                </p>
              )}
              
              {testResult.error && (
                <p className="text-sm text-red-600">
                  Lỗi: {testResult.error}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📋 Hướng dẫn:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Chọn URL từ danh sách bên trên</li>
            <li>• Click "Test URL đã chọn" để test</li>
            <li>• Xem kết quả test với thông tin chi tiết</li>
            <li>• Thử với các URL khác nhau để so sánh</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
