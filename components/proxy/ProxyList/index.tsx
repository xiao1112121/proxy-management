'use client'

import React, { useState, useMemo } from 'react'
import { useLanguage } from '@/lib/i18n'
import { useProxySelectors, useProxyActions } from '@/store/proxyStore'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { 
  Globe, 
  Zap, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'

interface ProxyListProps {
  onEdit?: (proxy: Proxy) => void
  onTest?: (id: number) => void
  onTestSelected?: (ids: number[]) => void
  onBulkDelete?: (ids: number[]) => void
  onImport?: () => void
  onExport?: (ids: number[]) => void
  onRefresh?: () => void
}

export default function ProxyList({
  onEdit,
  onTest,
  onTestSelected,
  onBulkDelete,
  onImport,
  onExport,
  onRefresh
}: ProxyListProps) {
  const { t } = useLanguage()
  const { proxies, selectedProxies, stats, isLoading, error } = useProxySelectors()
  const { 
    selectProxy, 
    selectAllProxies, 
    clearSelection, 
    testProxy, 
    testProxies, 
    testAllProxies,
    deleteProxies 
  } = useProxyActions()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'alive' | 'dead' | 'pending' | 'testing'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'http' | 'https' | 'socks4' | 'socks5'>('all')

  // Filter proxies based on search and filters
  const filteredProxies = useMemo(() => {
    return proxies.filter(proxy => {
      const matchesSearch = searchTerm === '' || 
        proxy.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proxy.group?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proxy.notes?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || proxy.status === statusFilter
      const matchesType = typeFilter === 'all' || proxy.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [proxies, searchTerm, statusFilter, typeFilter])

  const handleSelectProxy = (id: number, selected: boolean) => {
    selectProxy(id, selected)
  }

  const handleSelectAll = (selected: boolean) => {
    selectAllProxies(selected)
  }

  const handleTestProxy = async (id: number) => {
    if (onTest) {
      onTest(id)
    } else {
      await testProxy(id)
    }
  }

  const handleTestSelected = async () => {
    if (selectedProxies.length === 0) return

    if (onTestSelected) {
      onTestSelected(selectedProxies)
    } else {
      await testProxies(selectedProxies)
    }
  }

  const handleTestAll = async () => {
    await testAllProxies()
  }

  const handleDeleteSelected = () => {
    if (selectedProxies.length === 0) return

    if (onBulkDelete) {
      onBulkDelete(selectedProxies)
    } else {
      deleteProxies(selectedProxies)
    }
    clearSelection()
  }

  const handleExportSelected = () => {
    if (onExport) {
      onExport(selectedProxies)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'alive':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'dead':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'testing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'alive':
        return 'bg-green-100 text-green-800'
      case 'dead':
        return 'bg-red-100 text-red-800'
      case 'testing':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              {t('proxyList.title')}
            </h2>
            <div className="text-sm text-gray-500">
              {t('common.total')}: {stats.total} | {t('common.alive')}: {stats.alive} | {t('common.dead')}: {stats.dead}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onImport}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Upload className="h-4 w-4 mr-1" />
              {t('proxyList.importProxy')}
            </button>
            <button
              onClick={onRefresh}
              className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              {t('common.refresh')}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('common.all')} {t('common.status')}</option>
            <option value="alive">{t('common.alive')}</option>
            <option value="dead">{t('common.dead')}</option>
            <option value="pending">{t('common.pending')}</option>
            <option value="testing">{t('common.testing')}</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('common.all')} {t('common.type')}</option>
            <option value="http">HTTP</option>
            <option value="https">HTTPS</option>
            <option value="socks4">SOCKS4</option>
            <option value="socks5">SOCKS5</option>
          </select>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={handleTestAll}
              disabled={isLoading || proxies.length === 0}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              <Zap className="h-4 w-4 mr-1" />
              {t('proxyList.testAll')}
            </button>
            {selectedProxies.length > 0 && (
              <>
                <button
                  onClick={handleTestSelected}
                  disabled={isLoading}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  {t('proxyList.testSelected')} ({selectedProxies.length})
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t('common.delete')}
                </button>
                <button
                  onClick={handleExportSelected}
                  className="px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  {t('common.export')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedProxies.length === filteredProxies.length && filteredProxies.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('common.host')}:{t('common.port')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('common.type')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('common.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('common.ping')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('common.speed')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('common.group')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProxies.map((proxy) => (
              <tr key={proxy.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedProxies.includes(proxy.id)}
                    onChange={(e) => handleSelectProxy(proxy.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {proxy.host}:{proxy.port}
                  </div>
                  {proxy.username && (
                    <div className="text-sm text-gray-500">
                      {proxy.username}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {proxy.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(proxy.status)}
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(proxy.status)}`}>
                      {t(`common.${proxy.status}`)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {proxy.ping ? `${proxy.ping}ms` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {proxy.speed ? `${proxy.speed} KB/s` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {proxy.group || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTestProxy(proxy.id)}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      title={t('proxyList.testProxy')}
                    >
                      <Zap className="h-4 w-4" />
                    </button>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(proxy)}
                        className="text-gray-600 hover:text-gray-900"
                        title={t('common.edit')}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredProxies.length === 0 && (
        <div className="text-center py-12">
          <Globe className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
              ? t('proxyList.noResults')
              : t('proxyList.noProxies')
            }
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? t('proxyList.tryDifferentFilters')
              : t('proxyList.addFirstProxy')
            }
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-600">{t('common.loading')}</span>
        </div>
      )}
    </div>
  )
}
