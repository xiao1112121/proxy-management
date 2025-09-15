'use client'

import React, { useState } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface AddProxyFormProps {
  isOpen: boolean
  onClose: () => void
  onAddProxy: (proxy: Omit<Proxy, 'id'>) => void
}

export default function AddProxyForm({ isOpen, onClose, onAddProxy }: AddProxyFormProps) {
  const [formData, setFormData] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    type: 'http' as const,
    group: '',
    notes: '',
    country: '',
    city: '',
    anonymity: undefined
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.host.trim()) {
      newErrors.host = 'Host là bắt buộc'
    }

    if (!formData.port.trim()) {
      newErrors.port = 'Port là bắt buộc'
    } else {
      const portNum = parseInt(formData.port)
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        newErrors.port = 'Port phải là số từ 1-65535'
      }
    }

    if (!formData.type) {
      newErrors.type = 'Loại proxy là bắt buộc'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const newProxy: Omit<Proxy, 'id'> = {
      host: formData.host.trim(),
      port: parseInt(formData.port),
      username: formData.username.trim() || undefined,
      password: formData.password.trim() || undefined,
      type: formData.type,
      status: 'pending',
      group: formData.group.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      country: formData.country.trim() || undefined,
      city: formData.city.trim() || undefined,
      anonymity: formData.anonymity,
      lastTested: new Date().toISOString()
    }

    onAddProxy(newProxy)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      host: '',
      port: '',
      username: '',
      password: '',
      type: 'http',
      group: '',
      notes: '',
      country: '',
      city: '',
      anonymity: undefined
    })
    setErrors({})
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Thêm Proxy Mới</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Host/IP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  className={`input ${errors.host ? 'border-red-500' : ''}`}
                  placeholder="192.168.1.1 hoặc example.com"
                />
                {errors.host && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.host}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Port <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={(e) => handleInputChange('port', e.target.value)}
                  className={`input ${errors.port ? 'border-red-500' : ''}`}
                  placeholder="8080"
                  min="1"
                  max="65535"
                />
                {errors.port && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.port}
                  </p>
                )}
              </div>
            </div>

            {/* Authentication */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="input"
                  placeholder="Tùy chọn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="input"
                  placeholder="Tùy chọn"
                />
              </div>
            </div>

            {/* Proxy Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại Proxy <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className={`input ${errors.type ? 'border-red-500' : ''}`}
              >
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
                <option value="socks4">SOCKS4</option>
                <option value="socks5">SOCKS5</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.type}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quốc gia
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="input"
                  placeholder="US, VN, UK..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thành phố
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="input"
                  placeholder="New York, Hà Nội..."
                />
              </div>
            </div>

            {/* Group and Anonymity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhóm
                </label>
                <input
                  type="text"
                  value={formData.group}
                  onChange={(e) => handleInputChange('group', e.target.value)}
                  className="input"
                  placeholder="Cao cấp, Miễn phí, Kiểm tra..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mức ẩn danh
                </label>
                <select
                  value={formData.anonymity}
                  onChange={(e) => handleInputChange('anonymity', e.target.value)}
                  className="input"
                >
                  <option value="unknown">Không xác định</option>
                  <option value="transparent">Transparent</option>
                  <option value="anonymous">Anonymous</option>
                  <option value="elite">Elite</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="input"
                rows={3}
                placeholder="Ghi chú về proxy này..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-outline"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                Thêm Proxy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
