'use client'

import { useState } from 'react'
import { Plus, Upload, Download, FileText, Database, Globe, Settings } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
// import ImportExportModal from './ImportExportModal'

interface ProxyFormProps {
  onSubmit: (proxy: Omit<Proxy, 'id'>) => void
}

export default function ProxyForm({ onSubmit }: ProxyFormProps) {
  const [formData, setFormData] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    type: 'http' as const,
    group: '',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  // const [showImportExport, setShowImportExport] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.host.trim()) {
      newErrors.host = 'Host là bắt buộc'
    }

    if (!formData.port.trim()) {
      newErrors.port = 'Port là bắt buộc'
    } else if (isNaN(Number(formData.port)) || Number(formData.port) < 1 || Number(formData.port) > 65535) {
      newErrors.port = 'Port phải là số từ 1-65535'
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

    onSubmit(proxy)
    
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
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedProxies = JSON.parse(e.target?.result as string)
        console.log('Imported proxies:', importedProxies)
        // Handle import logic here
      } catch (error) {
        alert('Lỗi khi đọc file. Vui lòng kiểm tra định dạng file.')
      }
    }
    reader.readAsText(file)
  }

  const handleExport = (format: string) => {
    // Handle export logic here
    console.log('Export format:', format)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Thêm Proxy Mới</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Host <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => handleInputChange('host', e.target.value)}
                className={`input ${errors.host ? 'border-red-500' : ''}`}
                placeholder="example.com hoặc 192.168.1.1"
              />
              {errors.host && <p className="mt-1 text-sm text-red-600">{errors.host}</p>}
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
              {errors.port && <p className="mt-1 text-sm text-red-600">{errors.port}</p>}
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
                placeholder="username (tùy chọn)"
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
                className="input"
                placeholder="password (tùy chọn)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại Proxy
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
                Nhóm
              </label>
              <input
                type="text"
                value={formData.group}
                onChange={(e) => handleInputChange('group', e.target.value)}
                className="input"
                placeholder="Work, Personal, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
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
              }}
            >
              Làm mới
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm Proxy
            </button>
          </div>
        </form>
      </div>

      {/* Import/Export Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Nhập/Xuất Proxy</h3>
          <button
            onClick={() => {/* Import/Export moved to separate tab */}}
            className="btn btn-secondary btn-sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Chuyển sang tab Import
          </button>
        </div>
        
        <div className="text-center py-8">
          <div className="flex justify-center space-x-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Nhập từ file</h4>
              <p className="text-sm text-gray-500">TXT, CSV, JSON</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Download className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Xuất proxy</h4>
              <p className="text-sm text-gray-500">Nhiều định dạng</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Nhấn nút "Mở cửa sổ Import/Export" để sử dụng các tính năng nâng cao
          </p>
        </div>
      </div>

      {/* Real Testing Info */}
      <div className="card p-6 bg-green-50">
        <h3 className="text-lg font-medium text-green-900 mb-3">✅ Test Proxy Thật</h3>
        <div className="space-y-2 text-sm text-green-800">
          <p><strong>Kết nối thật:</strong> Test kết nối thực tế đến proxy server</p>
          <p><strong>HTTP Request:</strong> Gửi request thật qua proxy để kiểm tra</p>
          <p><strong>Đo tốc độ:</strong> Test tốc độ thực tế của proxy</p>
          <p><strong>Kiểm tra ẩn danh:</strong> Phân tích headers để xác định mức độ ẩn danh</p>
          <p><strong>IP công khai:</strong> Hiển thị IP thật mà proxy sử dụng</p>
        </div>
      </div>

      {/* Import/Export functionality moved to separate tab */}
    </div>
  )
}