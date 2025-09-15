'use client'

import React, { useState } from 'react'
import { 
  BarChart3, 
  Globe, 
  Activity, 
  Zap, 
  RotateCcw, 
  Database, 
  Upload, 
  X 
} from 'lucide-react'
import { useLanguage } from '@/lib/i18n'
import { useProxySelectors, useProxyActions } from '@/store/proxyStore'
import { ErrorBoundary } from '@/components/core/ErrorBoundary'
import ProxyList from '@/components/proxy/ProxyList'
import PerformanceDashboard from '@/components/performance/PerformanceDashboard'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import HighPerformanceImportModal from '@/components/HighPerformanceImportModal'
import AddProxyForm from '@/components/AddProxyForm'
import PerformanceMonitor from '@/components/PerformanceMonitor'
import RealHealthMonitoringTab from '@/components/RealHealthMonitoringTab'
import MassProxyValidator from '@/components/MassProxyValidator'
import SmartProxyRotation from '@/components/SmartProxyRotation'
import RealTimeProxyTest from '@/components/RealTimeProxyTest'
import TestUrlManager from '@/components/TestUrlManager'
import ProxyStats from '@/components/ProxyStats'
import StorageInfo from '@/components/StorageInfo'

export default function Home() {
  const { t } = useLanguage()
  const { proxies, selectedProxies, stats, isLoading, error } = useProxySelectors()
  const { 
    addProxy, 
    updateProxy, 
    deleteProxy, 
    deleteProxies, 
    clearAllProxies,
    testProxies,
    bulkDelete 
  } = useProxyActions()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [showImportModal, setShowImportModal] = useState(false)
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false)
  const [showAddProxyFormModal, setShowAddProxyFormModal] = useState(false)

  const handleAddProxy = (proxy: any) => {
    addProxy(proxy)
  }

  const handleDeleteProxy = (id: number) => {
    deleteProxy(id)
  }

  const handleUpdateProxy = (id: number, updates: any) => {
    updateProxy(id, updates)
  }

  const handleTestProxy = async (id: number) => {
    await testProxies([id])
  }

  const handleTestSelected = async (ids: number[]) => {
    await testProxies(ids)
  }

  const handleBulkDelete = (ids: number[]) => {
    bulkDelete(ids)
  }

  const handleImportProxy = async (file: File) => {
    try {
      // Import logic here - you can use the existing import utility
      console.log('Importing file:', file.name)
      // Add your import logic here
    } catch (error) {
      console.error('Error importing proxies:', error)
    }
  }

  const handleExportProxy = (ids: number[], format: string) => {
    // Export logic here
    console.log('Exporting proxies:', ids, format)
  }

  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard & Thống kê', 
      icon: BarChart3, 
      color: 'from-blue-500 to-teal-600', 
      description: 'Tổng quan, thống kê & phân tích chi tiết', 
      badge: '📊' 
    },
    { 
      id: 'list', 
      label: 'Danh sách Proxy', 
      icon: Globe, 
      color: 'from-green-500 to-green-600', 
      description: 'Quản lý proxy', 
      badge: '🌐' 
    },
    { 
      id: 'performance', 
      label: 'Hiệu suất', 
      icon: Activity, 
      color: 'from-violet-500 to-violet-600', 
      description: 'Theo dõi hiệu suất hệ thống', 
      badge: '📊' 
    },
    { 
      id: 'health-monitoring', 
      label: 'Giám sát Sức khỏe', 
      icon: Activity, 
      color: 'from-red-500 to-red-600', 
      description: 'Theo dõi sức khỏe hệ thống', 
      badge: '🏥' 
    },
    { 
      id: 'mass-validator', 
      label: 'Kiểm tra hàng loạt', 
      icon: Zap, 
      color: 'from-purple-500 to-purple-600', 
      description: 'Kiểm tra proxy hàng loạt', 
      badge: '🔍' 
    },
    { 
      id: 'smart-rotation', 
      label: 'Xoay vòng Thông minh', 
      icon: RotateCcw, 
      color: 'from-orange-500 to-orange-600', 
      description: 'Tự động chuyển đổi proxy', 
      badge: '🔄' 
    },
    { 
      id: 'realtime-test', 
      label: 'Kiểm tra Thời gian thực', 
      icon: Zap, 
      color: 'from-yellow-500 to-orange-500', 
      description: 'Kiểm tra trực tiếp', 
      badge: '⚡' 
    },
    { 
      id: 'multitest', 
      label: 'Kiểm tra & Quản lý URL', 
      icon: Globe, 
      color: 'from-indigo-500 to-indigo-600', 
      description: 'Quản lý URL kiểm tra', 
      badge: '🔗' 
    },
  ]

  return (
    <ErrorBoundary>
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
                  <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
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
                  <ProxyStats 
                    stats={{
                      ...stats,
                      testing: 0,
                      alivePercentage: stats.total > 0 ? (stats.alive / stats.total) * 100 : 0,
                      deadPercentage: stats.total > 0 ? (stats.dead / stats.total) * 100 : 0,
                      countries: {},
                      types: {},
                      anonymity: {}
                    }} 
                    proxies={proxies} 
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StorageInfo onClearData={() => {
                      clearAllProxies()
                    }} />
                  </div>
                </div>
              </ErrorBoundary>
            )}
            
            {activeTab === 'list' && (
              <ErrorBoundary>
                <ProxyList
                  onEdit={(proxy) => {
                    // Handle edit - you can implement a modal here
                    console.log('Edit proxy:', proxy)
                  }}
                  onTest={handleTestProxy}
                  onTestSelected={handleTestSelected}
                  onBulkDelete={handleBulkDelete}
                  onImport={() => setShowImportModal(true)}
                  onExport={(ids) => handleExportProxy(ids, 'json')}
                  onRefresh={() => window.location.reload()}
                />
              </ErrorBoundary>
            )}

            {activeTab === 'performance' && (
              <ErrorBoundary>
                <div className="space-y-6">
                  <PerformanceDashboard />
                  <div>
                    <PerformanceMonitor />
                  </div>
                </div>
              </ErrorBoundary>
            )}

            {activeTab === 'health-monitoring' && (
              <ErrorBoundary>
                <RealHealthMonitoringTab />
              </ErrorBoundary>
            )}
            
            {activeTab === 'mass-validator' && (
              <ErrorBoundary>
                <MassProxyValidator />
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
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Quản lý URL Test
                    </h2>
                    <TestUrlManager />
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
