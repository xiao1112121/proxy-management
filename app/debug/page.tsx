'use client'

import { useState } from 'react'

export default function DebugPage() {
  const [error, setError] = useState<string | null>(null)

  const testComponents = async () => {
    try {
      // Test import các component
      const { ErrorBoundary } = await import('@/components/ErrorBoundary')
      const ProxyList = (await import('@/components/ProxyList')).default
      const ProxyForm = (await import('@/components/ProxyForm')).default
      const ProxyTest = (await import('@/components/ProxyTest')).default
      const ProxyStats = (await import('@/components/ProxyStats')).default
      const ProxyImportTest = (await import('@/components/ProxyImportTest')).default
      const TestUrlManager = (await import('@/components/TestUrlManager')).default
      
      setError('Tất cả component import thành công!')
    } catch (err) {
      setError(`Lỗi import: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Debug Components
      </h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-4">
        <button
          onClick={testComponents}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Test Import Components
        </button>
      </div>

      {error && (
        <div className={`p-4 rounded-lg ${
          error.includes('thành công') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {error}
        </div>
      )}
    </div>
  )
}
