'use client'

import { useState } from 'react'
import { X, Plus, Globe, Shield, Settings } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface AddProxyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (proxy: Omit<Proxy, 'id'>) => void
}

export default function AddProxyModal({ isOpen, onClose, onSubmit }: AddProxyModalProps) {
  const [formData, setFormData] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    type: 'http' as 'http' | 'https' | 'socks4' | 'socks5' | 'residential' | 'datacenter' | 'mobile',
    group: '',
    notes: '',
    status: 'pending' as 'alive' | 'dead' | 'pending' | 'testing'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.host.trim()) {
      newErrors.host = 'Host là bắt buộc'
    } else if (!/^[a-zA-Z0-9.-]+$/.test(formData.host)) {
      newErrors.host = 'Host không hợp lệ'
    }

    if (!formData.port.trim()) {
      newErrors.port = 'Port là bắt buộc'
    } else {
      const port = parseInt(formData.port)
      if (isNaN(port) || port < 1 || port > 65535) {
        newErrors.port = 'Port phải từ 1-65535'
      }
    }

    if (formData.username && !formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc khi có username'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const proxy: Omit<Proxy, 'id'> = {
        host: formData.host.trim(),
        port: parseInt(formData.port),
        username: formData.username.trim() || undefined,
        password: formData.password.trim() || undefined,
        type: formData.type,
        status: formData.status,
        group: formData.group.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        lastTested: new Date().toISOString()
      }

      onSubmit(proxy)
      
      // Reset form
      setFormData({
        host: '',
        port: '',
        username: '',
        password: '',
        type: 'http',
        group: '',
        notes: '',
        status: 'pending'
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error adding proxy:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleBulkAdd = () => {
    const bulkText = prompt('Nhập danh sách proxy (mỗi dòng một proxy):\nFormat: host:port:username:password:type')
    if (!bulkText) return

    const lines = bulkText.split('\n').filter(line => line.trim())
    const proxies: Omit<Proxy, 'id'>[] = []

    lines.forEach((line, index) => {
      const parts = line.trim().split(':')
      if (parts.length >= 2) {
        const proxy: Omit<Proxy, 'id'> = {
          host: parts[0],
          port: parseInt(parts[1]) || 8080,
          username: parts[2] || undefined,
          password: parts[3] || undefined,
          type: (parts[4] as any) || 'http',
          status: 'pending',
          lastTested: new Date().toISOString()
        }
        proxies.push(proxy)
      }
    })

    if (proxies.length > 0) {
      proxies.forEach(proxy => onSubmit(proxy))
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Thêm Proxy Mới
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Thông tin cơ bản
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Host <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  className={`input ${errors.host ? 'border-red-500' : ''}`}
                  placeholder="example.com hoặc IP"
                />
                {errors.host && (
                  <p className="mt-1 text-sm text-red-600">{errors.host}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <p className="mt-1 text-sm text-red-600">{errors.port}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`input ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Tùy chọn"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Cài đặt nâng cao
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại proxy
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="input"
                >
                  <option value="http">HTTP</option>
                  <option value="https">HTTPS</option>
                  <option value="socks4">SOCKS4</option>
                  <option value="socks5">SOCKS5</option>
                  <option value="residential">Residential</option>
                  <option value="datacenter">Datacenter</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="input"
                >
                  <option value="pending">🟡 Pending</option>
                  <option value="alive">🟢 Alive</option>
                  <option value="dead">🔴 Dead</option>
                  <option value="testing">🔵 Testing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhóm
                </label>
                <input
                  type="text"
                  value={formData.group}
                  onChange={(e) => handleInputChange('group', e.target.value)}
                  className="input"
                  placeholder="Ví dụ: Premium, Free, Test"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="input"
                  placeholder="Ghi chú về proxy này"
                />
              </div>
            </div>
          </div>

          {/* Bulk Add Option */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Thêm hàng loạt
                </h4>
                <p className="text-sm text-gray-500">
                  Thêm nhiều proxy cùng lúc với format: host:port:username:password:type
                </p>
              </div>
              <button
                type="button"
                onClick={handleBulkAdd}
                className="btn btn-secondary btn-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm hàng loạt
              </button>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang thêm...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Thêm Proxy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}