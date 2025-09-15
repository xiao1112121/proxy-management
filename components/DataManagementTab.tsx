'use client'

import { useState } from 'react'
import { 
  Database, 
  Shield, 
  FileText,
  BarChart3,
  Settings,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { useDataManager } from '@/hooks/useDataManager'
import BackupManager from './BackupManager'
import DataValidator from './DataValidator'
import ProxyTemplates from './ProxyTemplates'
import { StatusIndicator } from './LoadingStates'
import Tooltip from './Tooltip'

interface DataManagementTabProps {
  proxies: Proxy[]
  onProxiesChange: (proxies: Proxy[]) => void
  onAddProxy: (proxy: Partial<Proxy>) => void
  onUpdateProxy: (id: number, updates: Partial<Proxy>) => void
  settings?: Record<string, any>
}

export default function DataManagementTab({ 
  proxies, 
  onProxiesChange, 
  onAddProxy, 
  onUpdateProxy,
  settings = {}
}: DataManagementTabProps) {
  const [activeTab, setActiveTab] = useState<'backup' | 'validation' | 'templates'>('backup')

  const {
    backups,
    validationResults,
    templates,
    isProcessing,
    validateProxies,
    getValidationStats,
    createFromTemplate
  } = useDataManager()

  const handleRestoreBackup = (restoredProxies: Proxy[]) => {
    onProxiesChange(restoredProxies)
  }

  const handleFixProxy = (proxyId: number, fixes: Partial<Proxy>) => {
    onUpdateProxy(proxyId, fixes)
  }

  const handleCreateFromTemplate = (template: any, overrides: Partial<Proxy> = {}) => {
    const newProxy = createFromTemplate(template, overrides)
    onAddProxy(newProxy)
  }

  const stats = getValidationStats()

  const tabs = [
    {
      id: 'backup' as const,
      name: 'Backup & Restore',
      icon: <Database className="h-4 w-4" />,
      count: backups.length,
      description: 'Manage data backups and restore points'
    },
    {
      id: 'validation' as const,
      name: 'Data Validation',
      icon: <Shield className="h-4 w-4" />,
      count: stats.total,
      description: 'Validate data integrity and quality',
      status: stats.errors > 0 ? 'error' : stats.warnings > 0 ? 'warning' : 'success'
    },
    {
      id: 'templates' as const,
      name: 'Proxy Templates',
      icon: <FileText className="h-4 w-4" />,
      count: templates.length,
      description: 'Quick-start templates and configurations'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Database className="h-6 w-6" />
              <span>Data Management</span>
            </h2>
            <p className="text-blue-100 mt-1">
              Comprehensive data backup, validation, and template management
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{proxies.length}</div>
              <div className="text-xs text-blue-200">Total Proxies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{backups.length}</div>
              <div className="text-xs text-blue-200">Backups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{templates.length}</div>
              <div className="text-xs text-blue-200">Templates</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span className="text-sm">Data Health</span>
            </div>
            <div className="text-lg font-bold mt-1">
              {stats.errors === 0 ? 'Excellent' : stats.errors < 5 ? 'Good' : 'Needs Attention'}
            </div>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Validation Issues</span>
            </div>
            <div className="text-lg font-bold mt-1">{stats.total}</div>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">Last Backup</span>
            </div>
            <div className="text-sm font-bold mt-1">
              {backups.length > 0 
                ? new Date(Math.max(...backups.map(b => b.timestamp))).toLocaleDateString()
                : 'Never'
              }
            </div>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Most Used Template</span>
            </div>
            <div className="text-sm font-bold mt-1">
              {templates.length > 0 
                ? templates.reduce((prev, current) => prev.usage > current.usage ? prev : current).name.slice(0, 12) + '...'
                : 'None'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
                {tab.count > 0 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
                {'status' in tab && tab.status && (
                  <StatusIndicator
                    status={tab.status as any}
                    message=""
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Description */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              {tabs.find(t => t.id === activeTab)?.description}
            </p>
          </div>

          {/* Tab Content */}
          {activeTab === 'backup' && (
            <BackupManager
              proxies={proxies}
              onRestore={handleRestoreBackup}
              settings={settings}
            />
          )}

          {activeTab === 'validation' && (
            <DataValidator
              proxies={proxies}
              onFixProxy={handleFixProxy}
            />
          )}

          {activeTab === 'templates' && (
            <ProxyTemplates
              onCreateFromTemplate={handleCreateFromTemplate}
            />
          )}
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-500" />
          <span>Quick Actions</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Export Data */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Download className="h-5 w-5 text-green-500" />
              <h4 className="font-medium text-gray-900">Export Data</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Export your proxy data in various formats for backup or sharing.
            </p>
            <div className="flex space-x-2">
              <Tooltip content="Export as JSON">
                <button className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm transition-colors">
                  JSON
                </button>
              </Tooltip>
              <Tooltip content="Export as CSV">
                <button className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm transition-colors">
                  CSV
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Import Data */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Upload className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium text-gray-900">Import Data</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Import proxy data from files or external sources.
            </p>
            <button className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm transition-colors">
              Choose File
            </button>
          </div>

          {/* Validate All */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="h-5 w-5 text-purple-500" />
              <h4 className="font-medium text-gray-900">Validate All</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Run comprehensive validation on all proxy data.
            </p>
            <button 
              onClick={() => validateProxies(proxies)}
              disabled={isProcessing}
              className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-sm transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Validating...' : 'Validate Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Insights */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-gray-500" />
          <span>Data Insights</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {((proxies.filter(p => p.status === 'alive').length / Math.max(proxies.length, 1)) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Healthy Proxies</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {new Set(proxies.filter(p => p.country).map(p => p.country)).size}
            </div>
            <div className="text-sm text-gray-600">Countries</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {new Set(proxies.filter(p => p.type).map(p => p.type)).size}
            </div>
            <div className="text-sm text-gray-600">Proxy Types</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {backups.reduce((total, backup) => total + backup.size, 0) > 0 
                ? `${(backups.reduce((total, backup) => total + backup.size, 0) / 1024 / 1024).toFixed(1)}MB`
                : '0MB'
              }
            </div>
            <div className="text-sm text-gray-600">Backup Size</div>
          </div>
        </div>
      </div>
    </div>
  )
}
