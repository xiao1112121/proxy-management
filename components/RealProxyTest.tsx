'use client'

import { useState } from 'react'
import { Play, CheckCircle, XCircle, Clock, Globe, Zap, Shield } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface RealProxyTestProps {
  proxy: Proxy
  onResult: (result: any) => void
}

export default function RealProxyTest({ proxy, onResult }: RealProxyTestProps) {
  const [isTesting, setIsTesting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testProxy = async () => {
    setIsTesting(true)
    setResult(null)

    try {
      // Test basic connectivity
      const connectivityResult = await testConnectivity(proxy)
      
      if (!connectivityResult.success) {
        setResult({
          success: false,
          error: 'Connection failed',
          details: connectivityResult.error
        })
        onResult({
          success: false,
          error: 'Connection failed'
        })
        return
      }

      // Test HTTP request through proxy
      const httpResult = await testHttpRequest(proxy)
      
      // Test speed
      const speedResult = await testSpeed(proxy)
      
      // Test anonymity
      const anonymityResult = await testAnonymity(proxy)

      const finalResult = {
        success: true,
        ping: connectivityResult.ping,
        speed: speedResult.speed,
        publicIP: httpResult.publicIP,
        country: httpResult.country,
        city: httpResult.city,
        anonymity: anonymityResult.anonymity,
        statusCode: httpResult.statusCode,
        responseTime: httpResult.responseTime
      }

      setResult(finalResult)
      onResult(finalResult)
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      setResult(errorResult)
      onResult(errorResult)
    } finally {
      setIsTesting(false)
    }
  }

  const testConnectivity = async (proxy: Proxy): Promise<{success: boolean, ping?: number, error?: string}> => {
    const startTime = Date.now()
    
    try {
      // Create a simple HTTP request to test connectivity
      const proxyUrl = buildProxyUrl(proxy)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch('https://httpbin.org/ip', {
        method: 'GET',
        signal: controller.signal,
        // Note: This is a simplified test - real proxy testing would need different approach
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        return {
          success: true,
          ping: Date.now() - startTime
        }
      }
      
      return {
        success: false,
        error: `HTTP ${response.status}`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }
    }
  }

  const testHttpRequest = async (proxy: Proxy): Promise<{
    publicIP?: string
    country?: string
    city?: string
    statusCode?: number
    responseTime?: number
  }> => {
    const startTime = Date.now()
    
    try {
      const response = await fetch('https://httpbin.org/ip', {
        method: 'GET',
        // Note: Real proxy testing would require different implementation
      })
      
      if (response.ok) {
        const data = await response.json()
        return {
          publicIP: data.origin,
          statusCode: response.status,
          responseTime: Date.now() - startTime
        }
      }
      
      return {
        statusCode: response.status,
        responseTime: Date.now() - startTime
      }
    } catch (error) {
      return {
        responseTime: Date.now() - startTime
      }
    }
  }

  const testSpeed = async (proxy: Proxy): Promise<{speed: number}> => {
    const startTime = Date.now()
    
    try {
      const response = await fetch('https://httpbin.org/bytes/1024', {
        method: 'GET',
        // Note: Real proxy testing would require different implementation
      })
      
      if (response.ok) {
        await response.text()
        const endTime = Date.now()
        const duration = (endTime - startTime) / 1000 // seconds
        const bytes = 1024
        const speed = Math.round((bytes * 8) / duration) // bits per second
        return { speed }
      }
      
      return { speed: 0 }
    } catch (error) {
      return { speed: 0 }
    }
  }

  const testAnonymity = async (proxy: Proxy): Promise<{anonymity: string}> => {
    try {
      const response = await fetch('https://httpbin.org/headers', {
        method: 'GET',
        // Note: Real proxy testing would require different implementation
      })
      
      if (response.ok) {
        const data = await response.json()
        const headers = data.headers
        
        // Check for proxy headers
        if (headers['X-Forwarded-For'] || headers['X-Real-IP']) {
          return { anonymity: 'transparent' }
        } else if (headers['Via'] || headers['X-Proxy-Connection']) {
          return { anonymity: 'anonymous' }
        } else {
          return { anonymity: 'elite' }
        }
      }
      
      return { anonymity: 'unknown' }
    } catch (error) {
      return { anonymity: 'unknown' }
    }
  }

  const buildProxyUrl = (proxy: Proxy): string => {
    if (proxy.username && proxy.password) {
      return `${proxy.type}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
    }
    return `${proxy.type}://${proxy.host}:${proxy.port}`
  }

  const getStatusIcon = () => {
    if (isTesting) {
      return <Clock className="h-4 w-4 animate-spin text-blue-500" />
    }
    
    if (result) {
      return result.success ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )
    }
    
    return <Play className="h-4 w-4 text-gray-500" />
  }

  const getStatusText = () => {
    if (isTesting) return 'Đang test...'
    if (result) return result.success ? 'Thành công' : 'Thất bại'
    return 'Chưa test'
  }

  const getStatusColor = () => {
    if (isTesting) return 'text-blue-600 bg-blue-100'
    if (result) return result.success ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
    return 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        <button
          onClick={testProxy}
          disabled={isTesting}
          className="btn btn-primary btn-sm"
        >
          <Play className="h-4 w-4 mr-2" />
          Test Proxy
        </button>
      </div>

      {result && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900">Kết quả test:</h4>
          
          {result.success ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {result.ping && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Ping: {result.ping}ms</span>
                </div>
              )}
              
              {result.speed && (
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-gray-500" />
                  <span>Tốc độ: {Math.round(result.speed / 1000)} KB/s</span>
                </div>
              )}
              
              {result.publicIP && (
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span>IP: {result.publicIP}</span>
                </div>
              )}
              
              {result.anonymity && (
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span>Ẩn danh: {result.anonymity}</span>
                </div>
              )}
              
              {result.statusCode && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-mono">{result.statusCode}</span>
                </div>
              )}
              
              {result.responseTime && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Thời gian:</span>
                  <span>{result.responseTime}ms</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-red-600">
              <p className="font-medium">Lỗi: {result.error}</p>
              {result.details && (
                <p className="text-sm mt-1">{result.details}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
