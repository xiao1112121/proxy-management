'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Header from '../components/Header'

import { Download, Settings, BarChart3, Globe, Zap, Shield, RotateCcw, Activity, Database, Upload, X } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { ProxyImportExport, ExportOptions } from '@/utils/importExport'
import { AdvancedStorageManager } from '@/utils/advancedStorageManager'
import EnhancedProxyList from '@/components/EnhancedProxyList'
import HighPerformanceProxyList from '@/components/HighPerformanceProxyList'
import AdvancedProxyTable from '@/components/AdvancedProxyTable'
import OptimizedProxyList from '@/components/OptimizedProxyList'
import PerformanceDashboard from '@/components/PerformanceDashboard'
import PerformanceTab from '@/components/PerformanceTab'
import { useLazyProxyData } from '@/hooks/useLazyProxyData'
import { useOptimizedProxyList } from '@/hooks/useOptimizedProxyList'
import { useAdvancedCaching } from '@/hooks/useAdvancedCaching'
import { BrowserPerformanceOptimizer } from '@/utils/browserPerformanceOptimizer'
import ProxyStats from '@/components/ProxyStats'
import TestUrlManager from '@/components/TestUrlManager'
import RealTimeProxyTest from '@/components/RealTimeProxyTest'
import MassProxyValidator from '@/components/MassProxyValidator'
import SmartProxyRotation from '@/components/SmartProxyRotation'
import StorageInfo from '@/components/StorageInfo'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import HighPerformanceImportModal from '@/components/HighPerformanceImportModal'
import AddProxyForm from '@/components/AddProxyForm'
import PerformanceMonitor from '@/components/PerformanceMonitor'
import RealHealthMonitoringTab from '@/components/RealHealthMonitoringTab'
import WebTrafficTab from '@/components/WebTrafficTab'
import LanguageSwitcher from '@/components/LanguageSwitcher'
export default function Home() {
  const { user, isAuthenticated, login } = useAuth()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isClient, setIsClient] = useState(false)

  // Set client-side flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Use lazy loading for large datasets
  const {
    allProxies: proxies,
    visibleProxies,
    totalCount,
    isLoading,
    hasMore,
    addProxy,
    updateProxy,
    deleteProxy,
    deleteProxies,
    clearAllProxies,
    loadMore,
    stats,
    performanceInfo
  } = useLazyProxyData({
    batchSize: 1000,
    maxItems: 100000,
    enableVirtualization: true
  })
  
  const [selectedProxies, setSelectedProxies] = useState<number[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [useOptimizedList, setUseOptimizedList] = useState(true)
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false)
  const [showAddProxyFormModal, setShowAddProxyFormModal] = useState(false)
  const [testUrl, setTestUrl] = useState('https://www.instagram.com/')

  // Handle Google OAuth callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const userParam = urlParams.get('user')
      
      if (token && userParam) {
        try {
          const user = JSON.parse(userParam)
          login(user, token)
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (error) {
          console.error('Error parsing user data from Google OAuth:', error)
        }
      }
    }
  }, [login])

  // Advanced caching for better performance
  const proxyCache = useAdvancedCaching<Proxy[]>({
    maxSize: 1000,
    defaultTTL: 300000, // 5 minutes
    enableLRU: true,
    enablePersistence: true,
    persistenceKey: 'proxy_list_cache'
  })

  // Optimized proxy list hook
  const optimizedProxyList = useOptimizedProxyList({
    initialProxies: proxies,
    enableVirtualization: true,
    enableCaching: true,
    enableBatchOperations: true
  })

  // Set loaded state when data is ready
  useEffect(() => {
    if (proxies.length > 0 || !isLoading) {
      setIsLoaded(true)
    }
  }, [proxies.length, isLoading])


  // Stats are now provided by useLazyProxyData hook

  const handleAddProxy = (proxy: Omit<Proxy, 'id'>) => {
    console.log('handleAddProxy called with proxy:', proxy.host)
    addProxy(proxy)
  }

  const handleDeleteProxy = (id: number) => {
    deleteProxy(id)
    setSelectedProxies(prev => prev.filter(pid => pid !== id))
  }

  const handleUpdateProxy = (id: number, updates: Partial<Proxy>) => {
    updateProxy(id, updates)
  }

  const handleBulkDelete = (ids: number[]) => {
    ids.forEach(id => deleteProxy(id))
    setSelectedProxies(prev => prev.filter(pid => !ids.includes(pid)))
  }

  const handleBulkUpdate = (ids: number[], updates: Partial<Proxy>) => {
    ids.forEach(id => updateProxy(id, updates))
  }

  const handleTestSelected = async (ids: number[]) => {
    const proxiesToTest = proxies.filter(p => ids.includes(p.id))
    proxiesToTest.forEach(proxy => {
      handleUpdateProxy(proxy.id, { status: 'testing' })
    })
    
    // Real proxy testing
    for (const proxy of proxiesToTest) {
      try {
        const response = await fetch('/api/test-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            proxy,
            testUrl: testUrl
          })
        })
        
        const result = await response.json()
        
        handleUpdateProxy(proxy.id, {
          status: result.success ? 'alive' : 'dead',
          ping: result.ping,
          speed: result.speed,
          lastTested: new Date().toISOString()
        })
      } catch (error) {
        handleUpdateProxy(proxy.id, {
          status: 'dead',
          lastTested: new Date().toISOString()
        })
      }
    }
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
        // Add new proxies using the addProxy function from useLazyProxyData
        newProxies.forEach(proxy => {
          addProxy(proxy)
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
    { id: 'dashboard', label: 'Dashboard & Thống kê', icon: BarChart3, color: 'from-blue-500 to-teal-600', description: 'Tổng quan, thống kê & phân tích chi tiết', badge: '📊' },
    { id: 'list', label: 'Danh sách Proxy', icon: Globe, color: 'from-green-500 to-green-600', description: 'Quản lý proxy', badge: '🌐' },
    { id: 'optimized-list', label: 'Proxy Tối ưu', icon: Database, color: 'from-emerald-500 to-emerald-600', description: 'Danh sách proxy tối ưu hiệu suất', badge: '⚡' },
    { id: 'performance', label: 'Hiệu suất', icon: Activity, color: 'from-violet-500 to-violet-600', description: 'Theo dõi hiệu suất hệ thống', badge: '📊' },
    { id: 'health-monitoring', label: 'Giám sát Sức khỏe', icon: Activity, color: 'from-red-500 to-red-600', description: 'Theo dõi sức khỏe hệ thống', badge: '🏥' },
    { id: 'web-traffic', label: 'Web Traffic', icon: Activity, color: 'from-purple-500 to-purple-600', description: 'Giám sát lưu lượng web', badge: '🌐' },
    { id: 'smart-rotation', label: 'Xoay vòng Thông minh', icon: RotateCcw, color: 'from-orange-500 to-orange-600', description: 'Tự động chuyển đổi proxy', badge: '🔄' },
    { id: 'realtime-test', label: 'Kiểm tra Thời gian thực', icon: Zap, color: 'from-yellow-500 to-orange-500', description: 'Kiểm tra trực tiếp', badge: '⚡' },
    { id: 'multitest', label: 'Kiểm tra & Quản lý URL', icon: Globe, color: 'from-indigo-500 to-indigo-600', description: 'Quản lý URL kiểm tra', badge: '🔗' },
  ]


  function setForceUpdate(arg0: (prev: number) => number) {
    throw new Error('Function not implemented.')
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full opacity-75 blur-lg animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-6 rounded-full">
              <Shield className="h-16 w-16 text-white drop-shadow-2xl" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-2 border-white animate-bounce">
              <Zap className="h-4 w-4 text-white m-1" />
            </div>
          </div>
          
          <h1 className="text-4xl font-black text-white mb-4 bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent">
            Proxy Manager
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Vui lòng đăng nhập để sử dụng ứng dụng quản lý proxy
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Đăng nhập ngay</span>
              </div>
            </button>
            
            <div className="text-white/60 text-sm">
              <p>🔒 Dữ liệu proxy được bảo mật riêng cho từng tài khoản</p>
              <p>⚡ Quản lý hàng trăm nghìn proxy hiệu quả</p>
              <p>🎯 Công cụ test và phân tích chuyên nghiệp</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
        </div>
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-xl border-b-4 border-blue-400">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  {/* Simple logo container */}
                  <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Simple status indicator */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-white">
                    {t('dashboard.title')}
                  </h1>
                  <p className="text-blue-100 text-sm">
                    {t('dashboard.description')}
                  </p>
                </div>
              </div>
               <div className="flex items-center space-x-4">
                 <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                   <div className="text-sm text-white font-semibold flex items-center space-x-3">
                     <span className="flex items-center">
                       <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                       {t('common.total')}: {stats.total}
                     </span>
                     <span className="flex items-center">
                       <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                       {t('common.alive')}: {stats.alive}
                     </span>
                     <span className="flex items-center">
                       <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                       {t('common.dead')}: {stats.dead}
                     </span>
                     <span className="flex items-center">
                       <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                       {t('common.pending')}: {stats.pending}
                     </span>
                   </div>
                 </div>
                 <button
                   onClick={() => setShowImportModal(true)}
                   className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-blue-400"
                 >
                   <div className="absolute inset-0 bg-white rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                   <Upload className="h-4 w-4 inline mr-2" />
                   {t('proxyList.importProxy')}
                 </button>
                 <button
                   onClick={() => setShowPerformanceMonitor(true)}
                   className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-green-400"
                 >
                   <div className="absolute inset-0 bg-white rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                   <Activity className="h-4 w-4 inline mr-2" />
                   {t('performance.title')}
                 </button>
                 <button
                   onClick={checkLocalStorage}
                   className="group relative bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-yellow-400"
                 >
                   <div className="absolute inset-0 bg-white rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                   {t('common.debug')}
                 </button>
                 <LanguageSwitcher />
               </div>
            </div>
          </div>
        </header>

        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6 p-4">
            <nav className="relative z-10 flex gap-2 justify-center flex-wrap">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    title={tab.description}
                    className={`
                      relative px-4 py-3 rounded-lg font-bold text-sm flex items-center space-x-2 whitespace-nowrap
                      transition-all duration-300 ease-in-out transform hover:scale-105 group
                      ${isActive 
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-2xl border-2 border-white/50 drop-shadow-lg` 
                        : 'text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300 border-2 border-gray-300 bg-white shadow-md hover:shadow-xl'
                      }
                    `}
                  >
                    <div className={`relative ${isActive ? 'animate-bounce' : 'group-hover:animate-pulse'}`}>
                      <Icon className={`h-5 w-5 transition-all duration-300 ${isActive ? 'text-white drop-shadow-lg' : 'text-gray-600 group-hover:text-gray-800'}`} />
                      {isActive && (
                        <div className="absolute -inset-1 bg-white rounded-full opacity-30 animate-ping"></div>
                      )}
                    </div>
                    <span className="font-bold text-sm">{tab.label}</span>
                    {isActive && (
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-2 border-white animate-pulse shadow-lg"></div>
                    )}
                    
                    {/* Enhanced Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-2 bg-gradient-to-r from-gray-900 to-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-gray-700">
                      <div className="font-semibold">{tab.description}</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StorageInfo onClearData={() => {
                      clearAllProxies()
                      setSelectedProxies([])
                    }} />
                  </div>
                </div>
              </ErrorBoundary>
            )}
            
            {activeTab === 'list' && (
              <ErrorBoundary>
                <AdvancedProxyTable
                  proxies={proxies}
                  onDelete={handleDeleteProxy}
                  onUpdate={handleUpdateProxy}
                  onTest={(id) => handleTestSelected([id])}
                  onTestSelected={handleTestSelected}
                  onSelectAll={handleSelectAll}
                  selectedProxies={selectedProxies}
                  onProxySelect={(id, selected) => {
                    if (selected) {
                      setSelectedProxies(prev => [...prev, id])
                    } else {
                      setSelectedProxies(prev => prev.filter(pid => pid !== id))
                    }
                    setForceUpdate((prev: number) => prev + 1) // Force re-render
                  }}
                  onAddProxy={() => setShowAddProxyFormModal(true)}
                  onImportProxy={() => setShowImportModal(true)}
                  onExportProxy={() => handleExportProxy(selectedProxies, 'json')}
                  onRefresh={() => window.location.reload()}
                  onBulkDelete={handleBulkDelete}
                  testUrl={testUrl}
                  onTestUrlChange={setTestUrl}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'optimized-list' && (
              <ErrorBoundary>
                <OptimizedProxyList
                  initialProxies={proxies}
                  onProxyUpdate={(proxy) => handleUpdateProxy(proxy.id, proxy)}
                  onProxyDelete={handleDeleteProxy}
                  onProxyTest={(id) => handleTestSelected([id])}
                  onBulkTest={handleTestSelected}
                  enableVirtualization={true}
                  enableCaching={true}
                  enableBatchOperations={true}
                />
              </ErrorBoundary>
            )}


            {activeTab === 'performance' && (
              <ErrorBoundary>
                <div className="space-y-6">
                  <PerformanceTab proxies={proxies} />
                  <PerformanceMonitor />
                </div>
              </ErrorBoundary>
            )}

            {activeTab === 'health-monitoring' && (
              <ErrorBoundary>
                <RealHealthMonitoringTab />
              </ErrorBoundary>
            )}
            
            {activeTab === 'web-traffic' && (
              <ErrorBoundary>
                <WebTrafficTab 
                  proxies={proxies}
                  onUpdateProxy={handleUpdateProxy}
                />
              </ErrorBoundary>
            )}
            
            {activeTab === 'smart-rotation' && (
              <ErrorBoundary>
                <SmartProxyRotation />
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
            
          </div>
        </div>

        {/* Import Modal */}
        <HighPerformanceImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={(importedProxies) => {
            // Add imported proxies to the list
            importedProxies.forEach(proxy => {
              addProxy(proxy)
            })
            setShowImportModal(false)
          }}
          maxProxies={200000}
        />

        {/* Add Proxy Form Modal */}
        {showAddProxyFormModal && (
          <AddProxyForm
            isOpen={showAddProxyFormModal}
            onClose={() => setShowAddProxyFormModal(false)}
            onAddProxy={handleAddProxy}
          />
        )}

        {/* Performance Monitor Modal */}
        {showPerformanceMonitor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Performance Monitor</h2>
                <button
                  onClick={() => setShowPerformanceMonitor(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <PerformanceMonitor />
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}