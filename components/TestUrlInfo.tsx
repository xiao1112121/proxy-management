'use client'

import React from 'react'
import { Info, Globe, Shield, Zap, MapPin } from 'lucide-react'

interface TestUrlInfoProps {
  selectedUrl: string
  onUrlChange: (url: string) => void
}

const urlCategories = [
  {
    name: 'Mạng xã hội & Giao tiếp',
    icon: Globe,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    urls: [
      {
        name: 'Telegram Web',
        url: 'https://web.telegram.org/',
        description: 'Test proxy với Telegram Web - phù hợp cho mục đích sử dụng Telegram',
        recommended: true
      },
      {
        name: 'Telegram API',
        url: 'https://api.telegram.org/bot/getMe',
        description: 'Test proxy với Telegram API - kiểm tra kết nối API',
        recommended: true
      },
      {
        name: 'WhatsApp Web',
        url: 'https://web.whatsapp.com/',
        description: 'Test proxy với WhatsApp Web',
        recommended: true
      },
      {
        name: 'Facebook',
        url: 'https://www.facebook.com/',
        description: 'Test proxy với Facebook',
        recommended: true
      },
      {
        name: 'Instagram',
        url: 'https://www.instagram.com/',
        description: 'Test proxy với Instagram',
        recommended: true
      },
      {
        name: 'Twitter/X',
        url: 'https://twitter.com/',
        description: 'Test proxy với Twitter/X',
        recommended: true
      }
    ]
  },
  {
    name: 'Video & Streaming',
    icon: Zap,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    urls: [
      {
        name: 'YouTube',
        url: 'https://www.youtube.com/',
        description: 'Test tốc độ với YouTube - kiểm tra khả năng stream video',
        recommended: true
      },
      {
        name: 'TikTok',
        url: 'https://www.tiktok.com/',
        description: 'Test tốc độ với TikTok - kiểm tra khả năng load video ngắn',
        recommended: true
      }
    ]
  },
  {
    name: 'Kiểm tra IP & Vị trí',
    icon: MapPin,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    urls: [
      {
        name: 'HTTPBin IP',
        url: 'https://httpbin.org/ip',
        description: 'Kiểm tra IP public qua proxy',
        recommended: false
      },
      {
        name: 'IPify',
        url: 'https://api.ipify.org?format=json',
        description: 'Kiểm tra IP public (backup)',
        recommended: false
      },
      {
        name: 'IP API',
        url: 'https://ipapi.co/json/',
        description: 'Kiểm tra vị trí địa lý',
        recommended: false
      }
    ]
  }
]

export default function TestUrlInfo({ selectedUrl, onUrlChange }: TestUrlInfoProps) {
  return (
    <div className="space-y-6">
      {/* Thông tin quan trọng */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Tại sao chọn URL test phù hợp?
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Việc test proxy với URL phù hợp với mục đích sử dụng sẽ cho kết quả chính xác hơn. 
              Ví dụ: Nếu bạn dùng proxy cho Telegram, hãy test với Telegram Web thay vì Google.
            </p>
          </div>
        </div>
      </div>

      {/* Danh sách URL theo danh mục */}
      <div className="space-y-4">
        {urlCategories.map((category) => (
          <div key={category.name} className="space-y-2">
            <div className="flex items-center space-x-2">
              <category.icon className={`w-5 h-5 ${category.color}`} />
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.urls.map((url) => (
                <div
                  key={url.url}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedUrl === url.url
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => onUrlChange(url.url)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{url.name}</h4>
                        {url.recommended && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Khuyến nghị
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{url.description}</p>
                      <p className="text-xs text-gray-500 mt-2 font-mono">{url.url}</p>
                    </div>
                    {selectedUrl === url.url && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Lưu ý quan trọng */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Lưu ý quan trọng
            </h3>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Chọn URL test phù hợp với mục đích sử dụng proxy</li>
              <li>• Test với nhiều URL khác nhau để có kết quả toàn diện</li>
              <li>• URL "Khuyến nghị" được tối ưu cho các mục đích phổ biến</li>
              <li>• Kết quả test sẽ phản ánh chính xác khả năng hoạt động của proxy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
