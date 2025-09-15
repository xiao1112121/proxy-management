'use client'

import React, { useState, useMemo, useCallback, memo } from 'react'
import { Edit, Trash2, Play, Eye, EyeOff, CheckSquare, Square, Globe } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { HealthMetrics } from '@/hooks/useProxyHealthMonitoring'
import { useVirtualization } from '@/hooks/useVirtualization'
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'
import ProxyHealthIndicator from './ProxyHealthIndicator'

interface VirtualizedProxyListProps {
  proxies: Proxy[]
  healthMetrics?: Map<number, HealthMetrics>
  selectedProxies: number[]
  onProxySelect: (id: number, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onDelete: (id: number) => void
  onUpdate: (id: number, updates: Partial<Proxy>) => void
  onTest: (id: number) => void
  containerHeight?: number
}

// Memoized proxy row component for better performance
const ProxyRow = memo(function ProxyRow({
  proxy,
  isSelected,
  healthMetric,
  showPassword,
  onSelect,
  onDelete,
  onUpdate,
  onTest,
  onTogglePassword,
  style
}: {
  proxy: Proxy
  isSelected: boolean
  healthMetric?: HealthMetrics
  showPassword: boolean
  onSelect: (selected: boolean) => void
  onDelete: () => void
  onUpdate: (updates: Partial<Proxy>) => void
  onTest: () => void
  onTogglePassword: () => void
  style: React.CSSProperties
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Proxy>>({})

  const handleEdit = useCallback(() => {
    setEditForm(proxy)
    setIsEditing(true)
  }, [proxy])

  const handleSaveEdit = useCallback(() => {
    onUpdate(editForm)
    setIsEditing(false)
    setEditForm({})
  }, [editForm, onUpdate])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setEditForm({})
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'alive': return 'text-green-700 bg-green-100'
      case 'dead': return 'text-red-700 bg-red-100'
      case 'pending': return 'text-yellow-700 bg-yellow-100'
      case 'testing': return 'text-blue-700 bg-blue-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'alive': return '✅'
      case 'dead': return '❌'
      case 'pending': return '⏳'
      case 'testing': return '🔄'
      default: return '❓'
    }
  }

  return (
    <div style={style} className="flex items-center px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Selection Checkbox */}
      <div className="flex items-center w-10">
        <button
          onClick={() => onSelect(!isSelected)}
          className="text-gray-400 hover:text-blue-600 transition-colors"
        >
          {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
        </button>
      </div>

      {/* Proxy Info */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <input
              type="text"
              value={editForm.host || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, host: e.target.value }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Host"
            />
            <input
              type="number"
              value={editForm.port || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, port: Number(e.target.value) }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Port"
            />
            <input
              type="text"
              value={editForm.username || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Username"
            />
            <input
              type="password"
              value={editForm.password || ''}
              onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Password"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
            {/* Proxy Address */}
            <div className="md:col-span-2">
              <div className="font-medium text-gray-900">
                {proxy.host}:{proxy.port}
              </div>
              {(proxy.username || proxy.password) && (
                <div className="text-sm text-gray-500 flex items-center">
                  <span>{proxy.username}</span>
                  <button
                    onClick={onTogglePassword}
                    className="ml-1 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                  {showPassword && proxy.password && (
                    <span className="ml-1">:{proxy.password}</span>
                  )}
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proxy.status || 'unknown')}`}>
                <span className="mr-1">{getStatusIcon(proxy.status || 'unknown')}</span>
                {proxy.status || 'unknown'}
              </span>
            </div>

            {/* Health Indicator */}
            <div>
              <ProxyHealthIndicator 
                metrics={healthMetric} 
                compact={true}
              />
            </div>

            {/* Location */}
            <div>
              {proxy.country && (
                <div className="text-sm text-gray-900">{proxy.country}</div>
              )}
              {proxy.city && (
                <div className="text-xs text-gray-500">{proxy.city}</div>
              )}
            </div>

            {/* Performance */}
            <div>
              {proxy.ping && (
                <div className="text-sm text-gray-900">{proxy.ping}ms</div>
              )}
              {proxy.speed && (
                <div className="text-xs text-gray-500">{proxy.speed} KB/s</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 ml-4">
        {isEditing ? (
          <>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onTest}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              title="Test proxy"
            >
              <Play className="h-4 w-4" />
            </button>
            <button
              onClick={handleEdit}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
              title="Edit proxy"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
              title="Delete proxy"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
})

export default function VirtualizedProxyList({
  proxies,
  healthMetrics = new Map(),
  selectedProxies,
  onProxySelect,
  onSelectAll,
  onDelete,
  onUpdate,
  onTest,
  containerHeight = 600
}: VirtualizedProxyListProps) {
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({})
  
  const {
    metrics,
    startRender,
    endRender,
    trackInteraction
  } = usePerformanceMonitor('VirtualizedProxyList')

  // Virtualization configuration
  const virtualizationConfig = useMemo(() => ({
    itemHeight: 80, // Height of each proxy row
    containerHeight,
    overscan: 5, // Render 5 extra items outside viewport
    threshold: 50 // Enable virtualization when > 50 items
  }), [containerHeight])

  const {
    visibleItems,
    shouldVirtualize,
    getContainerProps,
    getContentProps,
    scrollToIndex
  } = useVirtualization(proxies, virtualizationConfig)

  // Performance tracking
  React.useEffect(() => {
    startRender()
    return () => endRender()
  })

  // Memoized handlers
  const handleProxySelect = useCallback((proxyId: number, selected: boolean) => {
    const endInteraction = trackInteraction('proxy-select')
    onProxySelect(proxyId, selected)
    endInteraction()
  }, [onProxySelect, trackInteraction])

  const handleDelete = useCallback((proxyId: number) => {
    const endInteraction = trackInteraction('proxy-delete')
    onDelete(proxyId)
    endInteraction()
  }, [onDelete, trackInteraction])

  const handleUpdate = useCallback((proxyId: number, updates: Partial<Proxy>) => {
    const endInteraction = trackInteraction('proxy-update')
    onUpdate(proxyId, updates)
    endInteraction()
  }, [onUpdate, trackInteraction])

  const handleTest = useCallback((proxyId: number) => {
    const endInteraction = trackInteraction('proxy-test')
    onTest(proxyId)
    endInteraction()
  }, [onTest, trackInteraction])

  const handleTogglePassword = useCallback((proxyId: number) => {
    setShowPassword(prev => ({
      ...prev,
      [proxyId]: !prev[proxyId]
    }))
  }, [])

  const handleSelectAll = useCallback(() => {
    const endInteraction = trackInteraction('select-all')
    const allSelected = selectedProxies.length === proxies.length
    onSelectAll(!allSelected)
    endInteraction()
  }, [selectedProxies.length, proxies.length, onSelectAll, trackInteraction])

  // Calculate selection state
  const allSelected = proxies.length > 0 && selectedProxies.length === proxies.length
  const someSelected = selectedProxies.length > 0 && selectedProxies.length < proxies.length

  if (proxies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Globe className="h-16 w-16 mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No proxies found</h3>
        <p className="text-sm text-center max-w-md">
          Add some proxies to get started, or adjust your filters to see existing proxies.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            <span className="text-sm">
              {someSelected && !allSelected && (
                <span className="text-blue-600">
                  {selectedProxies.length} selected
                </span>
              )}
              {allSelected && <span className="text-blue-600">All selected</span>}
              {!someSelected && !allSelected && 'Select all'}
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>{proxies.length} proxies</span>
          {shouldVirtualize && (
            <span className="text-blue-600">Virtualized</span>
          )}
          <span>
            Performance: {Math.round((1 - metrics.renderTime / 1000) * 100)}%
          </span>
        </div>
      </div>

      {/* Virtual List Container */}
      <div {...getContainerProps()}>
        <div {...getContentProps()}>
          {visibleItems.map(({ item: proxy, index, style }) => (
            <ProxyRow
              key={`proxy-${proxy.id}-${index}`}
              proxy={proxy}
              isSelected={selectedProxies.includes(proxy.id)}
              healthMetric={healthMetrics.get(proxy.id)}
              showPassword={showPassword[proxy.id] || false}
              onSelect={(selected) => handleProxySelect(proxy.id, selected)}
              onDelete={() => handleDelete(proxy.id)}
              onUpdate={(updates) => handleUpdate(proxy.id, updates)}
              onTest={() => handleTest(proxy.id)}
              onTogglePassword={() => handleTogglePassword(proxy.id)}
              style={style}
            />
          ))}
        </div>
      </div>

      {/* Footer with performance info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>
              Rendered: {shouldVirtualize ? visibleItems.length : proxies.length}/{proxies.length} items
            </span>
            <span>
              Render time: {metrics.lastRenderTime?.toFixed(2) || 0}ms | 
              Re-renders: {metrics.reRenderCount || 0} |
              FPS: {metrics.fps || 60}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
