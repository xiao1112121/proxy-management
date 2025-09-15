'use client'

import React, { useState } from 'react'
import { Play, Pause, RotateCcw, Settings, Globe, Zap, Clock, Shield } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface ProxyTestProps {
  proxies: Proxy[]
  onUpdate: (id: number, updates: Partial<Proxy>) => void
}

export default function ProxyTest({ proxies, onUpdate }: ProxyTestProps) {
  const [testing, setTesting] = useState<Set<number>>(new Set())
  const [results, setResults] = useState<Record<number, any>>({})

  const testProxy = async (proxy: Proxy) => {
    setTesting(prev => new Set(prev).add(proxy.id))
    onUpdate(proxy.id, { status: 'testing' })

    try {
      // Real proxy test
      const response = await fetch('/api/test-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proxy })
      })
      
      const result = await response.json()
      
      setResults(prev => ({ ...prev, [proxy.id]: result }))
      
      onUpdate(proxy.id, {
        status: result.success ? 'alive' : 'dead',
        ping: result.ping,
        speed: result.speed,
        lastTested: new Date().toISOString()
      })
    } catch (error) {
      const result = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      setResults(prev => ({ ...prev, [proxy.id]: result }))
      onUpdate(proxy.id, { status: 'dead' })
    } finally {
      setTesting(prev => {
        const newSet = new Set(prev)
        newSet.delete(proxy.id)
        return newSet
      })
    }
  }

  const testAllProxies = async () => {
    for (const proxy of proxies) {
      await testProxy(proxy)
    }
  }

  const isTesting = (proxyId: number) => testing.has(proxyId)
  const getResult = (proxyId: number) => results[proxyId]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Test Proxy</h2>
          <div className="flex space-x-2">
            <button
              onClick={testAllProxies}
              disabled={testing.size > 0}
              className="btn btn-primary"
            >
              <Play className="h-4 w-4 mr-2" />
              Test tất cả
            </button>
            <button
              onClick={() => setResults({})}
              className="btn btn-secondary"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Làm mới
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {proxies.map((proxy) => (
            <div key={proxy.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {proxy.host}:{proxy.port}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {proxy.type.toUpperCase()} • {proxy.status}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {proxy.ping && (
                        <span className="text-sm text-gray-600">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {proxy.ping}ms
                        </span>
                      )}
                      {proxy.speed && (
                        <span className="text-sm text-gray-600">
                          <Zap className="h-4 w-4 inline mr-1" />
                          {proxy.speed}ms
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {getResult(proxy.id) && (
                    <div className="mt-2">
                      {getResult(proxy.id).success ? (
                        <div className="flex items-center text-green-600">
                          <Shield className="h-4 w-4 mr-1" />
                          <span className="text-sm">Kết nối thành công</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <Globe className="h-4 w-4 mr-1" />
                          <span className="text-sm">{getResult(proxy.id).error}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => testProxy(proxy)}
                  disabled={isTesting(proxy.id)}
                  className="btn btn-primary btn-sm"
                >
                  {isTesting(proxy.id) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang test...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Test
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {proxies.length === 0 && (
          <div className="text-center py-8">
            <Globe className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có proxy nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              Hãy thêm proxy trước khi test.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}