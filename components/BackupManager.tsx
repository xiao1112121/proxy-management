'use client'

import { useState } from 'react'
import { 
  Save, 
  Upload, 
  Download, 
  Trash2, 
  RefreshCw, 
  FileText, 
  Database,
  Calendar,
  HardDrive,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { DataBackup, useDataManager } from '@/hooks/useDataManager'
import { LoadingButton, StatusIndicator } from './LoadingStates'
import Tooltip from './Tooltip'

interface BackupManagerProps {
  proxies: Proxy[]
  onRestore: (proxies: Proxy[]) => void
  settings?: Record<string, any>
}

export default function BackupManager({ 
  proxies, 
  onRestore, 
  settings = {} 
}: BackupManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [backupName, setBackupName] = useState('')
  const [backupDescription, setBackupDescription] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv'>('json')
  const [selectedBackup, setSelectedBackup] = useState<DataBackup | null>(null)

  const {
    backups,
    isProcessing,
    createBackup,
    exportBackup,
    importBackup,
    deleteBackup,
    restoreFromBackup,
    fileInputRef
  } = useDataManager()

  const handleCreateBackup = async () => {
    if (!backupName.trim()) return

    try {
      await createBackup(proxies, settings, backupName.trim(), backupDescription.trim())
      setShowCreateModal(false)
      setBackupName('')
      setBackupDescription('')
    } catch (error) {
      console.error('Failed to create backup:', error)
    }
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await importBackup(file)
    } catch (error) {
      console.error('Failed to import backup:', error)
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRestore = async (backup: DataBackup) => {
    if (!confirm(`Restore backup "${backup.name}"? This will replace current proxy data.`)) {
      return
    }

    try {
      const restoredProxies = await restoreFromBackup(backup)
      onRestore(restoredProxies)
      alert(`Successfully restored ${restoredProxies.length} proxies from backup`)
    } catch (error) {
      console.error('Failed to restore backup:', error)
      alert(`Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDelete = (backup: DataBackup) => {
    if (confirm(`Delete backup "${backup.name}"? This action cannot be undone.`)) {
      deleteBackup(backup.id)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString()
  }

  const getBackupStatus = (backup: DataBackup) => {
    const age = Date.now() - backup.timestamp
    const dayInMs = 24 * 60 * 60 * 1000

    if (age < dayInMs) {
      return { status: 'success' as const, message: 'Recent' }
    } else if (age < 7 * dayInMs) {
      return { status: 'warning' as const, message: 'Week old' }
    } else {
      return { status: 'error' as const, message: 'Old' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-500" />
            <span>Backup Manager</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Create, manage, and restore proxy data backups
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Tooltip content="Import backup from file">
            <label className="cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleImportFile}
                className="hidden"
              />
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </div>
            </label>
          </Tooltip>

          <LoadingButton
            onClick={() => setShowCreateModal(true)}
            disabled={proxies.length === 0}
            variant="primary"
            isLoading={isProcessing}
          >
            <Save className="h-4 w-4 mr-2" />
            Create Backup
          </LoadingButton>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Total Backups</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{backups.length}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">Total Size</span>
          </div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            {formatFileSize(backups.reduce((sum, b) => sum + b.size, 0))}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">Current Data</span>
          </div>
          <div className="text-2xl font-bold text-purple-900 mt-1">{proxies.length}</div>
          <div className="text-xs text-purple-600">proxies</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-700">Latest Backup</span>
          </div>
          <div className="text-sm font-bold text-orange-900 mt-1">
            {backups.length > 0 
              ? new Date(Math.max(...backups.map(b => b.timestamp))).toLocaleDateString()
              : 'Never'
            }
          </div>
        </div>
      </div>

      {/* Backup List */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Backup History</h4>
          <p className="text-sm text-gray-600 mt-1">
            {backups.length} backups available
          </p>
        </div>

        {backups.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Database className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No backups found</h3>
            <p className="text-sm mb-4">Create your first backup to get started</p>
            <LoadingButton
              onClick={() => setShowCreateModal(true)}
              disabled={proxies.length === 0}
              variant="primary"
            >
              Create First Backup
            </LoadingButton>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {backups.map((backup) => {
              const status = getBackupStatus(backup)
              return (
                <div key={backup.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h5 className="font-medium text-gray-900">{backup.name}</h5>
                        <StatusIndicator
                          status={status.status}
                          message={status.message}
                        />
                        {backup.checksum && (
                          <Tooltip content="Data integrity verified">
                            <Shield className="h-4 w-4 text-green-500" />
                          </Tooltip>
                        )}
                      </div>
                      
                      {backup.description && (
                        <p className="text-sm text-gray-600 mb-2">{backup.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(backup.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Database className="h-3 w-3" />
                          <span>{backup.data.proxies.length} proxies</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <HardDrive className="h-3 w-3" />
                          <span>{formatFileSize(backup.size)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-3 w-3" />
                          <span>v{backup.version}</span>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {backup.data.metadata.countries.slice(0, 3).map(country => (
                          <span key={country} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {country}
                          </span>
                        ))}
                        {backup.data.metadata.countries.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{backup.data.metadata.countries.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Tooltip content="View details">
                        <button
                          onClick={() => setSelectedBackup(backup)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </Tooltip>

                      <Tooltip content="Export as JSON">
                        <button
                          onClick={() => exportBackup(backup, 'json')}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </Tooltip>

                      <Tooltip content="Restore backup">
                        <button
                          onClick={() => handleRestore(backup)}
                          className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </Tooltip>

                      <Tooltip content="Delete backup">
                        <button
                          onClick={() => handleDelete(backup)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Save className="h-5 w-5 text-blue-500" />
                <span>Create New Backup</span>
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Name *
                </label>
                <input
                  type="text"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  placeholder="Enter backup name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 mb-2">Backup will include:</div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>{proxies.length} proxy entries</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Application settings</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Data integrity checksum</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleCreateBackup}
                disabled={!backupName.trim()}
                isLoading={isProcessing}
                variant="primary"
              >
                Create Backup
              </LoadingButton>
            </div>
          </div>
        </div>
      )}

      {/* Backup Details Modal */}
      {selectedBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  <span>{selectedBackup.name}</span>
                </h3>
                <button
                  onClick={() => setSelectedBackup(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <div className="font-medium">{formatDate(selectedBackup.timestamp)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <div className="font-medium">{formatFileSize(selectedBackup.size)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Version:</span>
                      <div className="font-medium">v{selectedBackup.version}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Checksum:</span>
                      <div className="font-mono text-xs">{selectedBackup.checksum}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedBackup.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{selectedBackup.description}</p>
                  </div>
                )}

                {/* Metadata */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Data Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600">Proxies</div>
                      <div className="text-lg font-bold text-gray-900">
                        {selectedBackup.data.metadata.totalProxies}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600">Countries</div>
                      <div className="text-lg font-bold text-gray-900">
                        {selectedBackup.data.metadata.countries.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Countries */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Countries</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBackup.data.metadata.countries.map(country => (
                      <span key={country} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Proxy Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBackup.data.metadata.categories.map(category => (
                      <span key={category} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => exportBackup(selectedBackup, 'json')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => {
                  handleRestore(selectedBackup)
                  setSelectedBackup(null)
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Restore</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
