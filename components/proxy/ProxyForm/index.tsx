'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/lib/i18n'
import { Plus, Upload, Download, FileText, Database, Globe, Settings } from 'lucide-react'
import { SimpleProxy as Proxy, ProxyType } from '@/types/proxy'
import ProxyTypeInfo from '../../ProxyTypeInfo'
import { useProxyActions } from '@/store/proxyStore'

interface ProxyFormProps {
  onSubmit?: (proxy: Omit<Proxy, 'id'>) => void
  onClose?: () => void
  isOpen?: boolean
}

export default function ProxyForm({ onSubmit, onClose, isOpen = true }: ProxyFormProps) {
  const { t } = useLanguage()
  const { addProxy } = useProxyActions()
  
  const [formData, setFormData] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    type: 'http' as ProxyType,
    group: '',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.host.trim()) {
      newErrors.host = t('forms.hostRequired')
    }

    if (!formData.port.trim()) {
      newErrors.port = t('forms.portRequired')
    } else if (isNaN(Number(formData.port)) || Number(formData.port) < 1 || Number(formData.port) > 65535) {
      newErrors.port = t('forms.invalidPortRange')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const proxy: Omit<Proxy, 'id'> = {
      host: formData.host.trim(),
      port: Number(formData.port),
      username: formData.username.trim() || undefined,
      password: formData.password.trim() || undefined,
      type: formData.type,
      status: 'pending',
      group: formData.group.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      lastTested: new Date().toISOString()
    }

    // Use store action if no custom onSubmit provided
    if (onSubmit) {
      onSubmit(proxy)
    } else {
      addProxy(proxy)
    }

    // Reset form
    setFormData({
      host: '',
      port: '',
      username: '',
      password: '',
      type: 'http',
      group: '',
      notes: ''
    })
    setErrors({})

    // Close modal if provided
    if (onClose) {
      onClose()
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Plus className="h-6 w-6 mr-2 text-blue-600" />
          {t('proxyForm.title')}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.host')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.host}
              onChange={(e) => handleInputChange('host', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.host ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('proxyForm.hostPlaceholder')}
            />
            {errors.host && (
              <p className="mt-1 text-sm text-red-600">{errors.host}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.port')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.port}
              onChange={(e) => handleInputChange('port', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.port ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('proxyForm.portPlaceholder')}
              min="1"
              max="65535"
            />
            {errors.port && (
              <p className="mt-1 text-sm text-red-600">{errors.port}</p>
            )}
          </div>
        </div>

        {/* Authentication */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.username')}
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('proxyForm.usernamePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.password')}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('proxyForm.passwordPlaceholder')}
            />
          </div>
        </div>

        {/* Proxy Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('common.type')} <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value as ProxyType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="http">HTTP</option>
            <option value="https">HTTPS</option>
            <option value="socks4">SOCKS4</option>
            <option value="socks5">SOCKS5</option>
          </select>
        </div>

        {/* Group and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('proxyForm.group')}
            </label>
            <input
              type="text"
              value={formData.group}
              onChange={(e) => handleInputChange('group', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('proxyForm.groupPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('proxyForm.notesPlaceholder')}
              rows={3}
            />
          </div>
        </div>

        {/* Proxy Type Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <ProxyTypeInfo selectedType={formData.type} />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              {t('common.cancel')}
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('proxyForm.addProxy')}
          </button>
        </div>
      </form>
    </div>
  )
}
