'use client'

import { useState, useEffect } from 'react'
import { Download, Settings, BarChart3, Globe, Zap, Shield } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { ProxyImportExport, ExportOptions } from '@/utils/importExport'
import ProxyList from '@/components/ProxyList'
import ProxyStats from '@/components/ProxyStats'
import TestUrlManager from '@/components/TestUrlManager'
import RealTimeProxyTest from '@/components/RealTimeProxyTest'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  
  const [proxies, setProxies] = useState<Proxy[]>([])
  const [selectedProxies, setSelectedProxies] = useState<number[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  
  const [stats, setStats] = useState({
    total: 0,
    alive: 0,
    dead: 0,
    pending: 0,
    averagePing: 0,
    averageSpeed: 0,
    successRate: 0,
    countries: {} as Record<string, number>,
    types: {} as Record<string, number>,
    anonymity: {} as Record<string, number>
  })

  // Load proxies from localStorage on mount
  useEffect(() => {
    const savedProxies = localStorage.getItem('proxies')
    console.log('Loading proxies from localStorage:', savedProxies ? 'found' : 'not found')
    if (savedProxies) {
      try {
        const parsedProxies = JSON.parse(savedProxies)
        console.log('Parsed proxies count:', parsedProxies.length)
        setProxies(parsedProxies)
        updateStats(parsedProxies)
      } catch (error) {
        console.error('Error loading proxies:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save proxies to localStorage whenever proxies change (after initial load)
  useEffect(() => {
    if (isLoaded) {
      console.log('Saving proxies to localStorage:', proxies.length)
      localStorage.setItem('proxies', JSON.stringify(proxies))
    }
    updateStats(proxies)
  }, [proxies, isLoaded])

  const updateStats = (proxyList: Proxy[]) => {
    const total = proxyList.length
    const alive = proxyList.filter(p => p.status === 'alive').length
    const dead = proxyList.filter(p => p.status === 'dead').length
    const pending = proxyList.filter(p => p.status === 'pending' || p.status === 'testing').length
    
    const aliveProxies = proxyList.filter(p => p.status === 'alive')
    const averagePing = aliveProxies.length > 0 
      ? aliveProxies.reduce((sum, p) => sum + (p.ping || 0), 0) / aliveProxies.length 
      : 0
    const averageSpeed = aliveProxies.length > 0 
      ? aliveProxies.reduce((sum, p) => sum + (p.speed || 0), 0) / aliveProxies.length 
      : 0
    const successRate = total > 0 ? (alive / total) * 100 : 0

    // Count by countries
    const countries: Record<string, number> = {}
    proxyList.forEach(proxy => {
      if (proxy.country) {
        countries[proxy.country] = (countries[proxy.country] || 0) + 1
      }
    })

    // Count by types
    const types: Record<string, number> = {}
    proxyList.forEach(proxy => {
      types[proxy.type] = (types[proxy.type] || 0) + 1
    })

    // Count by anonymity
    const anonymity: Record<string, number> = {}
    proxyList.forEach(proxy => {
      if (proxy.anonymity) {
        anonymity[proxy.anonymity] = (anonymity[proxy.anonymity] || 0) + 1
      }
    })

    setStats({
      total,
      alive,
      dead,
      pending,
      averagePing: Math.round(averagePing),
      averageSpeed: Math.round(averageSpeed),
      successRate: Math.round(successRate * 100) / 100,
      countries,
      types,
      anonymity
    })
  }

  const handleAddProxy = (proxy: Omit<Proxy, 'id'>) => {
    console.log('handleAddProxy called with proxy:', proxy.host)
    const newProxy: Proxy = {
      ...proxy,
      id: Date.now(),
      status: 'pending'
    }
    console.log('Adding single proxy, current count:', proxies.length)
    setProxies(prev => {
      const updated = [newProxy, ...prev]
      console.log('Updated proxies count after add:', updated.length)
      return updated
    })
  }

  const handleDeleteProxy = (id: number) => {
    setProxies(prev => prev.filter(p => p.id !== id))
    setSelectedProxies(prev => prev.filter(pid => pid !== id))
  }

  const handleUpdateProxy = (id: number, updates: Partial<Proxy>) => {
    setProxies(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ))
  }

  const handleTestSelected = (ids: number[]) => {
    const proxiesToTest = proxies.filter(p => ids.includes(p.id))
    proxiesToTest.forEach(proxy => {
      handleUpdateProxy(proxy.id, { status: 'testing' })
    })
    
    // Simulate testing
    setTimeout(() => {
      proxiesToTest.forEach(proxy => {
        const isWorking = Math.random() > 0.3
        handleUpdateProxy(proxy.id, {
          status: isWorking ? 'alive' : 'dead',
          ping: isWorking ? Math.floor(Math.random() * 2000) + 100 : undefined,
          speed: isWorking ? Math.floor(Math.random() * 5000) + 1000 : undefined,
          lastTested: new Date().toISOString()
        })
      })
    }, 2000)
  }

  const handleTestAll = () => {
    handleTestSelected(proxies.map(p => p.id))
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedProxies(proxies.map(p => p.id))
    } else {
      setSelectedProxies([])
    }
  }

  const handleImportProxy = async (file: File) => {
    console.log('handleImportProxy called with file:', file.name)
    try {
      const result = await ProxyImportExport.importProxies(file)
      console.log('Import result:', result)
      
      if (result.success) {
        // Add IDs to imported proxies
        const newProxies: Proxy[] = result.imported.map((proxy, index) => ({
          ...proxy,
          id: Date.now() + index,
          status: 'pending'
        }))
        console.log('Adding new proxies:', newProxies.length)
        console.log('Current proxies before import:', proxies.length)
        setProxies(prev => {
          const updated = [...newProxies, ...prev]
          console.log('Updated proxies count:', updated.length)
          return updated
        })
        alert(`Import thành công! Đã thêm ${newProxies.length} proxy.`)
      } else {
        // Show specific error messages
        const errorMessage = result.errors.length > 0 
          ? `Lỗi import: ${result.errors.join(', ')}`
          : 'Không thể import file này.'
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Error importing proxies:', error)
      alert(`Lỗi khi đọc file: ${error instanceof Error ? error.message : 'Định dạng file không hợp lệ'}`)
    }
  }

  const handleExportProxy = (ids: number[], format: string) => {
    const proxiesToExport = ids.length > 0 
      ? proxies.filter(p => ids.includes(p.id))
      : proxies
    
    // Use real export utility
    const exportOptions: ExportOptions = {
      format: format as 'json' | 'csv' | 'txt' | 'xml',
      includeCredentials: true,
      includeStats: true
    }
    
    const dataStr = ProxyImportExport.exportProxies(proxiesToExport, exportOptions)
    const mimeType = format === 'json' ? 'application/json' : 
                    format === 'csv' ? 'text/csv' :
                    format === 'xml' ? 'application/xml' : 'text/plain'
    
    const dataUri = `data:${mimeType};charset=utf-8,${encodeURIComponent(dataStr)}`
    const exportFileDefaultName = `proxies.${format}`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleApplyFilters = (filters: any) => {
    console.log('Applying filters:', filters)
    // Implement filter logic here
  }

  const addTestProxy = () => {
    const testProxy: Omit<Proxy, 'id'> = {
      host: 'customer-hq12321_rPOep-cc-cn',
      port: 8000,
      username: 'customer-hq12321_rPOep-cc-cn',
      password: '4SbbN_d2EW4',
      type: 'http',
      status: 'pending',
      group: 'Test',
      lastTested: new Date().toISOString()
    }
    handleAddProxy(testProxy)
  }

  // Debug function to check localStorage
  const checkLocalStorage = () => {
    const saved = localStorage.getItem('proxies')
    console.log('Current localStorage proxies:', saved ? JSON.parse(saved).length : 0)
    console.log('Current state proxies:', proxies.length)
    alert(`LocalStorage: ${saved ? JSON.parse(saved).length : 0} proxies\nState: ${proxies.length} proxies`)
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'from-blue-500 to-blue-600', description: 'Tổng quan & phân tích chi tiết' },
    { id: 'list', label: 'Danh sách Proxy', icon: Globe, color: 'from-green-500 to-green-600', description: 'Quản lý proxy' },
    { id: 'realtime-test', label: 'Test Real-time', icon: Zap, color: 'from-yellow-500 to-orange-500', description: 'Test trực tiếp' },
    { id: 'multitest', label: 'Test & Quản lý URL', icon: Globe, color: 'from-indigo-500 to-indigo-600', description: 'Quản lý URL test' },
    { id: 'stats', label: 'Thống kê & Phân tích', icon: BarChart3, color: 'from-teal-500 to-teal-600', description: 'Báo cáo & số liệu chi tiết' },
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Proxy Manager</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Tổng: {stats.total} | 🟢 Alive: {stats.alive} | 🔴 Dead: {stats.dead} | 🟡 Pending: {stats.pending}
                </div>
                <button
                  onClick={checkLocalStorage}
                  className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                >
                  Debug Storage
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8 p-3 backdrop-blur-sm bg-white/95">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Điều hướng
              </h2>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {tabs.find(t => t.id === activeTab)?.description}
              </div>
            </div>
            <nav className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    title={tab.description}
                    className={`
                      relative px-4 py-3 rounded-lg font-medium text-sm flex items-center space-x-2 
                      transition-all duration-300 ease-in-out transform hover:scale-105 group
                      ${isActive 
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-blue-500/25 border-2 border-blue-300` 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border-2 border-transparent hover:border-gray-200 hover:shadow-md'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 transition-all duration-200 ${isActive ? 'text-white animate-pulse' : 'text-gray-500 group-hover:text-gray-700'}`} />
                    <span className="font-semibold">{tab.label}</span>
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white animate-pulse shadow-sm"></div>
                    )}
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {tab.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'dashboard' && (
              <ErrorBoundary>
                <div className="space-y-6">
                  <ProxyStats stats={stats} proxies={proxies} />
                </div>
              </ErrorBoundary>
            )}
            
            {activeTab === 'list' && (
              <ErrorBoundary>
                <ProxyList
                  proxies={proxies}
                  onDelete={handleDeleteProxy}
                  onUpdate={handleUpdateProxy}
                  onTestSelected={handleTestSelected}
                  onTestAll={handleTestAll}
                  onSelectAll={handleSelectAll}
                  onBulkDelete={(ids) => {
                    setProxies(prev => prev.filter(p => !ids.includes(p.id)))
                    setSelectedProxies(prev => prev.filter(id => !ids.includes(id)))
                  }}
                  onBulkUpdate={(ids, updates) => {
                    setProxies(prev => prev.map(p => 
                      ids.includes(p.id) ? { ...p, ...updates } : p
                    ))
                  }}
                  onBulkExport={handleExportProxy}
                  onBulkImport={handleImportProxy}
                  onAddProxy={handleAddProxy}
                />
              </ErrorBoundary>
            )}
            
            
            {activeTab === 'realtime-test' && (
              <ErrorBoundary>
                <RealTimeProxyTest
                  proxies={proxies}
                  onUpdateProxy={handleUpdateProxy}
                />
              </ErrorBoundary>
            )}
            
            {activeTab === 'multitest' && (
              <ErrorBoundary>
                <div className="space-y-6">
                  {/* URL Management Section */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Quản lý URL Test
                    </h2>
                    <TestUrlManager />
                  </div>

                  {/* Multi-URL Testing Section */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Test Proxy với Nhiều URL
                      </h2>
                      <button
                        onClick={addTestProxy}
                        className="btn btn-primary"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Thêm Proxy Test
                      </button>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Test proxy với các URL đã cung cấp. Proxy test đã được chuẩn bị sẵn.
                    </p>
                    
                    {proxies.length === 0 ? (
                      <div className="text-center py-8">
                        <Globe className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có proxy nào</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Hãy thêm proxy trước khi test.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {proxies.map((proxy) => (
                          <div key={proxy.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">{proxy.host}:{proxy.port}</h3>
                                <p className="text-sm text-gray-500">{proxy.type} - {proxy.status}</p>
                              </div>
                              <div className="text-sm text-gray-500">
                                {proxy.ping ? `${proxy.ping}ms` : 'Chưa test'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ErrorBoundary>
            )}
            
            {activeTab === 'stats' && (
              <ErrorBoundary>
                <ProxyStats stats={stats} proxies={proxies} />
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}