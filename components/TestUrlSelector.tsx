'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Globe, Plus, X, Check } from 'lucide-react'

interface TestUrl {
  id: string
  name: string
  url: string
  isDefault?: boolean
}

interface TestUrlSelectorProps {
  onUrlSelect: (url: string) => void
  onClose: () => void
  position?: { x: number; y: number }
}

const defaultTestUrls: TestUrl[] = [
  // Telegram & Social Media Tests
  { id: 'telegram-web', name: 'Telegram Web', url: 'https://web.telegram.org/', isDefault: true },
  { id: 'telegram-api', name: 'Telegram API', url: 'https://api.telegram.org/bot/getMe', isDefault: true },
  { id: 'whatsapp-web', name: 'WhatsApp Web', url: 'https://web.whatsapp.com/', isDefault: true },
  { id: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/', isDefault: true },
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/', isDefault: true },
  { id: 'twitter', name: 'Twitter/X', url: 'https://twitter.com/', isDefault: true },
  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/', isDefault: true },
  { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com/', isDefault: true },
  
  // IP Detection Tests
  { id: 'httpbin-ip', name: 'HTTPBin IP', url: 'http://httpbin.org/ip' },
  { id: 'httpbin-user-agent', name: 'HTTPBin User-Agent', url: 'http://httpbin.org/user-agent' },
  { id: 'httpbin-headers', name: 'HTTPBin Headers', url: 'http://httpbin.org/headers' },
  { id: 'ipify', name: 'IPify', url: 'https://api.ipify.org?format=json' },
  { id: 'ipapi', name: 'IP API', url: 'https://ipapi.co/json/' },
  { id: 'ip-api', name: 'IP-API', url: 'http://ip-api.com/json/' },
  
  // Speed Tests
  { id: 'speedtest', name: 'SpeedTest', url: 'https://www.speedtest.net/' },
  { id: 'fast-com', name: 'Fast.com', url: 'https://fast.com/' },
  
  // Custom
  { id: 'custom', name: 'Tùy chỉnh', url: '' }
]

export default function TestUrlSelector({ onUrlSelect, onClose, position }: TestUrlSelectorProps) {
  const [testUrls, setTestUrls] = useState<TestUrl[]>(defaultTestUrls)
  const [customUrl, setCustomUrl] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const customInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  useEffect(() => {
    if (showCustomInput && customInputRef.current) {
      customInputRef.current.focus()
    }
  }, [showCustomInput])

  const filteredUrls = testUrls.filter(url => 
    url.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.url.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    // Sort default URLs first, then alphabetically
    if (a.isDefault && !b.isDefault) return -1
    if (!a.isDefault && b.isDefault) return 1
    return a.name.localeCompare(b.name)
  })

  const handleUrlSelect = (url: TestUrl) => {
    if (url.id === 'custom') {
      setShowCustomInput(true)
      return
    }
    
    onUrlSelect(url.url)
    onClose()
  }

  const handleCustomUrlSubmit = () => {
    if (customUrl.trim()) {
      onUrlSelect(customUrl.trim())
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showCustomInput) {
        handleCustomUrlSubmit()
      } else {
        const firstUrl = filteredUrls[0]
        if (firstUrl) {
          handleUrlSelect(firstUrl)
        }
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const addCustomUrl = (url: string) => {
    if (url.trim() && !testUrls.some(u => u.url === url.trim())) {
      const newUrl: TestUrl = {
        id: `custom-${Date.now()}`,
        name: `Custom: ${url.trim()}`,
        url: url.trim()
      }
      setTestUrls(prev => [...prev, newUrl])
    }
  }

  const removeCustomUrl = (id: string) => {
    setTestUrls(prev => prev.filter(url => url.id !== id))
  }

  const dropdownStyle = position ? {
    position: 'fixed' as const,
    top: position.y,
    left: position.x,
    zIndex: 1000
  } : {}

  return (
    <div
      ref={dropdownRef}
      className="absolute bg-white border border-gray-200 rounded-lg shadow-lg min-w-80 max-w-96 z-50"
      style={dropdownStyle}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Chọn URL Test</h3>
            <p className="text-xs text-gray-500 mt-1">
              Chọn URL phù hợp với mục đích sử dụng proxy để có kết quả chính xác
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm kiếm URL kiểm tra..."
            className="w-full px-3 py-2 pl-8 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* URL List */}
      <div className="max-h-60 overflow-y-auto">
        {filteredUrls.map((url) => (
          <div key={url.id}>
            {url.id === 'custom' ? (
              <div
                onClick={() => handleUrlSelect(url)}
                className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-2"
              >
                <Plus className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Thêm URL tùy chỉnh</span>
              </div>
            ) : (
              <div
                onClick={() => handleUrlSelect(url)}
                className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {url.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {url.url}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {url.isDefault && (
                    <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                      Khuyến nghị
                    </span>
                  )}
                  {!url.isDefault && url.id.startsWith('custom-') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeCustomUrl(url.id)
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom URL Input */}
      {showCustomInput && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Nhập URL tùy chỉnh:
            </label>
            <div className="flex space-x-2">
              <input
                ref={customInputRef}
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomUrlSubmit()
                  } else if (e.key === 'Escape') {
                    setShowCustomInput(false)
                    setCustomUrl('')
                  }
                }}
                placeholder="https://example.com/api"
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleCustomUrlSubmit}
                disabled={!customUrl.trim()}
                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                onClick={() => {
                  setShowCustomInput(false)
                  setCustomUrl('')
                }}
                className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-2 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          Nhấn Enter để chọn, Escape để đóng
        </div>
      </div>
    </div>
  )
}
