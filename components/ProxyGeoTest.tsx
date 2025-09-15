'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/lib/i18n'
import { RealProxyTester } from '@/utils/realProxyTest'
import { ProxyType } from '@/types/proxy'
import { Globe, MapPin, Building, Shield, Wifi, TestTube } from 'lucide-react'

interface TestResult {
  success: boolean
  ping?: number
  speed?: number
  error?: string
  responseTime?: number
  statusCode?: number
  data?: any
  country?: string
  city?: string
  region?: string
  isp?: string
  publicIP?: string
  anonymity?: 'transparent' | 'anonymous' | 'elite'
}

export default function ProxyGeoTest() {
  const { t } = useLanguage()
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [proxyConfig, setProxyConfig] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    type: 'http' as ProxyType,
    testUrl: 'http://httpbin.org/ip'
  })

  const handleTest = async () => {
    if (!proxyConfig.host || !proxyConfig.port) {
      alert('Vui lòng nhập host và port')
      return
    }

    setTesting(true)
    setResult(null)

    try {
      const testResult = await RealProxyTester.testProxy({
        host: proxyConfig.host,
        port: parseInt(proxyConfig.port),
        username: proxyConfig.username || undefined,
        password: proxyConfig.password || undefined,
        type: proxyConfig.type
      }, proxyConfig.testUrl)

      setResult(testResult)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Test Proxy & Lấy Thông Tin Địa Lý
        </h2>
        <p className="text-gray-600">
          Test proxy và xem thông tin quốc gia, thành phố, ISP được lấy từ response
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Host
            </label>
            <input
              type="text"
              value={proxyConfig.host}
              onChange={(e) => setProxyConfig({ ...proxyConfig, host: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Port
            </label>
            <input
              type="number"
              value={proxyConfig.port}
              onChange={(e) => setProxyConfig({ ...proxyConfig, port: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="8080"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username (tùy chọn)
            </label>
            <input
              type="text"
              value={proxyConfig.username}
              onChange={(e) => setProxyConfig({ ...proxyConfig, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password (tùy chọn)
            </label>
            <input
              type="password"
              value={proxyConfig.password}
              onChange={(e) => setProxyConfig({ ...proxyConfig, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại Proxy
            </label>
            <select
              value={proxyConfig.type}
              onChange={(e) => setProxyConfig({ ...proxyConfig, type: e.target.value as ProxyType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks4">SOCKS4</option>
              <option value="socks5">SOCKS5</option>
              <option value="residential">Residential</option>
              <option value="datacenter">Datacenter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test URL
            </label>
            <input
              type="text"
              value={proxyConfig.testUrl}
              onChange={(e) => setProxyConfig({ ...proxyConfig, testUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="http://httpbin.org/ip"
            />
          </div>
        </div>

        <button
          onClick={handleTest}
          disabled={testing}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {testing ? (
            <>
              <TestTube className="h-4 w-4 animate-spin" />
              <span>Đang test...</span>
            </>
          ) : (
            <>
              <TestTube className="h-4 w-4" />
              <span>Test Proxy</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TestTube className="h-5 w-5 mr-2" />
            Kết Quả Test
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thông tin cơ bản */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">
                  {result.success ? 'Thành công' : 'Thất bại'}
                </span>
              </div>

              {result.success && (
                <>
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Ping: {result.ping?.toFixed(0)}ms
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Tốc độ: {result.speed?.toFixed(0)} KB/s
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Thời gian phản hồi: {result.responseTime?.toFixed(0)}ms
                    </span>
                  </div>
                </>
              )}

              {result.error && (
                <div className="text-red-600 text-sm">
                  Lỗi: {result.error}
                </div>
              )}
            </div>

            {/* Thông tin địa lý */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Thông Tin Địa Lý
              </h4>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    <strong>Quốc gia:</strong> {result.country || 'Không xác định'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    <strong>Thành phố:</strong> {result.city || 'Không xác định'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    <strong>Vùng/Tỉnh:</strong> {result.region || 'Không xác định'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    <strong>ISP:</strong> {result.isp || 'Không xác định'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    <strong>IP công khai:</strong> {result.publicIP || 'Không xác định'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    <strong>Mức độ ẩn danh:</strong> {
                      result.anonymity === 'transparent' ? 'Trong suốt' :
                      result.anonymity === 'anonymous' ? 'Ẩn danh' :
                      result.anonymity === 'elite' ? 'Elite' : 'Không xác định'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Raw data */}
          {result.data && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Raw Response Data:</h4>
              <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto max-h-40">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
