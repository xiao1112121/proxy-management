import { useState, useCallback } from 'react'
import { Proxy } from '@/types/proxy'

interface TestResult {
  success: boolean
  ping?: number
  speed?: number
  error?: string
}

const successRates: Record<string, number> = {
  'http': 0.8,
  'https': 0.85,
  'socks4': 0.7,
  'socks5': 0.75,
  'residential': 0.9,
  'datacenter': 0.8,
  'mobile': 0.6
}

export function useProxyTest() {
  const [testing, setTesting] = useState<Set<number>>(new Set())
  const [results, setResults] = useState<Record<number, TestResult>>({})

  const testProxy = useCallback(async (proxy: Proxy): Promise<TestResult> => {
    const proxyId = proxy.id
    setTesting(prev => new Set(prev).add(proxyId))

    try {
      // Real proxy test via API
      const response = await fetch('/api/test-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: proxy.host,
          port: proxy.port,
          username: proxy.username,
          password: proxy.password,
          type: proxy.type
        })
      })

      const data = await response.json()
      
      const result: TestResult = {
        success: data.success,
        ping: data.ping,
        speed: data.speed,
        error: data.error
      }

      setResults(prev => ({ ...prev, [proxyId]: result }))
      return result
    } catch (error) {
      const result: TestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
      setResults(prev => ({ ...prev, [proxyId]: result }))
      return result
    } finally {
      setTesting(prev => {
        const newSet = new Set(prev)
        newSet.delete(proxyId)
        return newSet
      })
    }
  }, [])

  const testMultipleProxies = useCallback(async (proxies: Proxy[]): Promise<TestResult[]> => {
    const results = await Promise.all(
      proxies.map(proxy => testProxy(proxy))
    )
    return results
  }, [testProxy])

  const isTesting = useCallback((proxyId: number) => {
    return testing.has(proxyId)
  }, [testing])

  const getResult = useCallback((proxyId: number) => {
    return results[proxyId]
  }, [results])

  const clearResults = useCallback(() => {
    setResults({})
  }, [])

  return {
    testProxy,
    testMultipleProxies,
    isTesting,
    getResult,
    clearResults,
    testing: Array.from(testing)
  }
}