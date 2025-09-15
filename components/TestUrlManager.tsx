'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit, Play, Globe, Settings, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface TestUrl {
  id: number
  name: string
  url: string
  type: 'ip' | 'speed' | 'anonymity' | 'geolocation' | 'dns' | 'webrtc'
  description: string
  isDefault: boolean
  isActive: boolean
  lastTested?: string
  responseTime?: number
  success?: boolean
}

const defaultUrls: Omit<TestUrl, 'id'>[] = [
  // Social Media & Communication Tests
  {
    name: 'Telegram Web',
    url: 'https://web.telegram.org/',
    type: 'ip',
    description: 'Test proxy với Telegram Web',
    isDefault: true,
    isActive: true
  },
  {
    name: 'Telegram API',
    url: 'https://api.telegram.org/bot/getMe',
    type: 'ip',
    description: 'Test proxy với Telegram API',
    isDefault: true,
    isActive: true
  },
  {
    name: 'WhatsApp Web',
    url: 'https://web.whatsapp.com/',
    type: 'ip',
    description: 'Test proxy với WhatsApp Web',
    isDefault: true,
    isActive: true
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/',
    type: 'ip',
    description: 'Test proxy với Facebook',
    isDefault: true,
    isActive: true
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/',
    type: 'ip',
    description: 'Test proxy với Instagram',
    isDefault: true,
    isActive: true
  },
  {
    name: 'Twitter/X',
    url: 'https://twitter.com/',
    type: 'ip',
    description: 'Test proxy với Twitter/X',
    isDefault: true,
    isActive: true
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/',
    type: 'speed',
    description: 'Test tốc độ với YouTube',
    isDefault: true,
    isActive: true
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/',
    type: 'speed',
    description: 'Test tốc độ với TikTok',
    isDefault: true,
    isActive: true
  },
  // IP Detection Tests
  {
    name: 'IP Check - httpbin.org',
    url: 'https://httpbin.org/ip',
    type: 'ip',
    description: 'Kiểm tra IP public',
    isDefault: false,
    isActive: true
  },
  {
    name: 'IP Check - ipify.org',
    url: 'https://api.ipify.org?format=json',
    type: 'ip',
    description: 'Kiểm tra IP public (backup)',
    isDefault: false,
    isActive: true
  },
  {
    name: 'Geolocation - ipapi.co',
    url: 'https://ipapi.co/json/',
    type: 'geolocation',
    description: 'Kiểm tra vị trí địa lý',
    isDefault: false,
    isActive: true
  },
  {
    name: 'DNS Leak Test',
    url: 'https://dnsleaktest.com/api/dnsleak',
    type: 'dns',
    description: 'Kiểm tra DNS leak',
    isDefault: false,
    isActive: false
  }
]

export default function TestUrlManager() {
  const [urls, setUrls] = useState<TestUrl[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<TestUrl>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [testingUrls, setTestingUrls] = useState<Set<number>>(new Set())

  useEffect(() => {
    // Load URLs from localStorage
    const savedUrls = localStorage.getItem('testUrls')
    if (savedUrls) {
      try {
        setUrls(JSON.parse(savedUrls))
      } catch {
        // If parsing fails, use defaults
        const defaultUrlsWithIds = defaultUrls.map((url, index) => ({
          ...url,
          id: index + 1
        }))
        setUrls(defaultUrlsWithIds)
        localStorage.setItem('testUrls', JSON.stringify(defaultUrlsWithIds))
      }
    } else {
      // First time, use defaults
      const defaultUrlsWithIds = defaultUrls.map((url, index) => ({
        ...url,
        id: index + 1
      }))
      setUrls(defaultUrlsWithIds)
      localStorage.setItem('testUrls', JSON.stringify(defaultUrlsWithIds))
    }
  }, [])

  const saveUrls = (newUrls: TestUrl[]) => {
    setUrls(newUrls)
    localStorage.setItem('testUrls', JSON.stringify(newUrls))
  }

  const handleAdd = () => {
    if (!editForm.name || !editForm.url) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    // Validate URL format
    try {
      new URL(editForm.url)
    } catch {
      alert('URL không hợp lệ. Vui lòng kiểm tra lại.')
      return
    }

    const newUrl: TestUrl = {
      id: Date.now(),
      name: editForm.name,
      url: editForm.url,
      type: editForm.type || 'ip',
      description: editForm.description || '',
      isDefault: false,
      isActive: true
    }

    saveUrls([...urls, newUrl])
    setEditForm({})
    setShowAddForm(false)
    alert('Thêm URL thành công!')
  }

  const handleEdit = (url: TestUrl) => {
    setEditingId(url.id)
    setEditForm(url)
  }

  const handleSaveEdit = () => {
    if (editingId) {
      const updatedUrls = urls.map(url =>
        url.id === editingId ? { ...url, ...editForm } : url
      )
      saveUrls(updatedUrls)
      setEditingId(null)
      setEditForm({})
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa URL này?')) {
      const updatedUrls = urls.filter(url => url.id !== id)
      saveUrls(updatedUrls)
    }
  }

  const handleToggleActive = (id: number) => {
    const updatedUrls = urls.map(url =>
      url.id === id ? { ...url, isActive: !url.isActive } : url
    )
    saveUrls(updatedUrls)
  }

  const testUrl = async (url: TestUrl) => {
    setTestingUrls(prev => new Set(prev).add(url.id))
    
    try {
      const startTime = Date.now()
      const response = await fetch(url.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'ProxyManager/1.0'
        }
      })
      const endTime = Date.now()
      
      const success = response.ok
      const responseTime = endTime - startTime
      
      const updatedUrls = urls.map(u =>
        u.id === url.id
          ? {
              ...u,
              lastTested: new Date().toISOString(),
              responseTime,
              success
            }
          : u
      )
      saveUrls(updatedUrls)
    } catch (error) {
      const updatedUrls = urls.map(u =>
        u.id === url.id
          ? {
              ...u,
              lastTested: new Date().toISOString(),
              responseTime: undefined,
              success: false
            }
          : u
      )
      saveUrls(updatedUrls)
    } finally {
      setTestingUrls(prev => {
        const newSet = new Set(prev)
        newSet.delete(url.id)
        return newSet
      })
    }
  }

  const testAllUrls = async () => {
    const activeUrls = urls.filter(url => url.isActive)
    for (const url of activeUrls) {
      await testUrl(url)
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ip': return 'bg-blue-100 text-blue-800'
      case 'speed': return 'bg-green-100 text-green-800'
      case 'anonymity': return 'bg-purple-100 text-purple-800'
      case 'geolocation': return 'bg-orange-100 text-orange-800'
      case 'dns': return 'bg-red-100 text-red-800'
      case 'webrtc': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ip': return '🌐'
      case 'speed': return '⚡'
      case 'anonymity': return '🕵️'
      case 'geolocation': return '📍'
      case 'dns': return '🔍'
      case 'webrtc': return '📡'
      default: return '❓'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Quản lý URL Test
          </h3>
          <p className="text-sm text-gray-600">
            Quản lý các URL để test proxy
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={testAllUrls}
            className="btn btn-primary btn-sm"
          >
            <Play className="h-4 w-4 mr-2" />
            Test tất cả
          </button>
          <button
            onClick={() => {
              if (showAddForm) {
                // If form is already open, close it
                setShowAddForm(false)
                setEditingId(null)
                setEditForm({})
              } else {
                // Open form
                setShowAddForm(true)
                setEditingId(null)
                setEditForm({})
              }
            }}
            className={`btn btn-sm hover:scale-105 transform transition-all duration-200 shadow-md hover:shadow-lg ${
              showAddForm 
                ? 'btn-secondary bg-gray-100 text-gray-700 border-gray-300' 
                : 'btn-primary'
            }`}
          >
            <Plus className={`h-4 w-4 mr-2 transition-transform duration-200 ${showAddForm ? 'rotate-45' : ''}`} />
            {showAddForm ? 'Hủy' : 'Thêm URL'}
          </button>
        </div>
      </div>

      {/* Add/Edit Form - Hiển thị ngay dưới header */}
      {(showAddForm || editingId) && (
        <div className="bg-white border-2 border-blue-200 rounded-lg p-6 shadow-xl mb-6 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                {editingId ? 'Chỉnh sửa URL' : 'Thêm URL mới'}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {editingId ? 'Cập nhật thông tin URL test' : 'Thêm URL mới để test proxy'}
              </p>
            </div>
            <button
              onClick={() => {
                setShowAddForm(false)
                setEditingId(null)
                setEditForm({})
              }}
              className="text-gray-400 hover:text-red-500 transition-all duration-200 p-2 hover:bg-red-50 rounded-full hover:scale-110"
              title="Đóng form"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên URL
                </label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="input"
                  placeholder="Ví dụ: IP Check - httpbin.org"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại
                </label>
                <select
                  value={editForm.type || 'ip'}
                  onChange={(e) => setEditForm({...editForm, type: e.target.value as any})}
                  className="input"
                >
                  <option value="ip">IP Check</option>
                  <option value="speed">Speed Test</option>
                  <option value="anonymity">Anonymity Test</option>
                  <option value="geolocation">Geolocation</option>
                  <option value="dns">DNS Leak Test</option>
                  <option value="webrtc">WebRTC Test</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                type="url"
                value={editForm.url || ''}
                onChange={(e) => setEditForm({...editForm, url: e.target.value})}
                className="input"
                placeholder="https://httpbin.org/ip"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <input
                type="text"
                value={editForm.description || ''}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="input"
                placeholder="Mô tả ngắn về URL này"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowAddForm(false)
                setEditingId(null)
                setEditForm({})
              }}
              className="btn btn-secondary"
            >
              Hủy
            </button>
            <button
              onClick={editingId ? handleSaveEdit : handleAdd}
              className="btn btn-primary"
            >
              {editingId ? 'Lưu' : 'Thêm'}
            </button>
          </div>
        </div>
      )}

      {/* URL List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kết quả test
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {urls.map((url) => (
                <tr key={url.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{url.name}</div>
                      <div className="text-sm text-gray-500">{url.url}</div>
                      <div className="text-xs text-gray-400">{url.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(url.type)}`}>
                      {getTypeIcon(url.type)} {url.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleToggleActive(url.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          url.isActive ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            url.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="ml-2 text-sm text-gray-600">
                        {url.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {url.lastTested ? (
                      <div className="text-sm">
                        <div className="flex items-center">
                          {url.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 mr-1" />
                          )}
                          <span className={url.success ? 'text-green-600' : 'text-red-600'}>
                            {url.success ? 'Thành công' : 'Thất bại'}
                          </span>
                        </div>
                        {url.responseTime && (
                          <div className="text-xs text-gray-500">
                            {url.responseTime}ms
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          {new Date(url.lastTested).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Chưa test</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => testUrl(url)}
                        disabled={testingUrls.has(url.id)}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        {testingUrls.has(url.id) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(url)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {!url.isDefault && (
                        <button
                          onClick={() => handleDelete(url.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}