'use client'

import { useState } from 'react'
import { Info, Cookie, Shield, Eye, Target, Settings } from 'lucide-react'

export default function CookiePolicyInfo() {
  const [isOpen, setIsOpen] = useState(false)

  const cookieTypes = [
    {
      name: 'Cookie cần thiết',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Cần thiết cho website hoạt động bình thường',
      examples: [
        'Lưu trữ phiên đăng nhập',
        'Ghi nhớ cài đặt ngôn ngữ',
        'Bảo mật và xác thực',
        'Tối ưu hóa hiệu suất'
      ],
      required: true
    },
    {
      name: 'Cookie phân tích',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Giúp chúng tôi hiểu cách bạn sử dụng website',
      examples: [
        'Thống kê lưu lượng truy cập',
        'Phân tích hành vi người dùng',
        'Đo lường hiệu suất trang',
        'Cải thiện trải nghiệm'
      ],
      required: false
    },
    {
      name: 'Cookie marketing',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Để hiển thị quảng cáo phù hợp với bạn',
      examples: [
        'Quảng cáo cá nhân hóa',
        'Theo dõi chuyển đổi',
        'Retargeting',
        'A/B testing'
      ],
      required: false
    },
    {
      name: 'Cookie chức năng',
      icon: Settings,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Để cải thiện chức năng và trải nghiệm website',
      examples: [
        'Ghi nhớ tùy chọn',
        'Tự động điền form',
        'Tích hợp mạng xã hội',
        'Chức năng tùy chỉnh'
      ],
      required: false
    }
  ]

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        Tìm hiểu về Cookie
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Chính sách Cookie
                    </h2>
                    <p className="text-sm text-gray-600">
                      Thông tin chi tiết về cách chúng tôi sử dụng cookie
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Introduction */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">
                  Cookie là gì?
                </h3>
                <p className="text-sm text-blue-700">
                  Cookie là các file nhỏ được lưu trữ trên thiết bị của bạn khi bạn truy cập website. 
                  Chúng giúp website hoạt động hiệu quả hơn và cung cấp thông tin cho chủ sở hữu website.
                </p>
              </div>

              {/* Cookie Types */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Các loại Cookie chúng tôi sử dụng
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cookieTypes.map((type) => (
                    <div key={type.name} className={`p-4 rounded-lg border ${type.bgColor}`}>
                      <div className="flex items-start space-x-3">
                        <type.icon className={`w-6 h-6 ${type.color} mt-1`} />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{type.name}</h4>
                            {type.required && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Bắt buộc
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                          
                          <div className="mt-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Ví dụ:</h5>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {type.examples.map((example, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <span className="text-gray-400">•</span>
                                  <span>{example}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How to Manage */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  Cách quản lý Cookie
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Bạn có thể chấp nhận hoặc từ chối cookie không cần thiết</p>
                  <p>• Cookie cần thiết luôn được kích hoạt để website hoạt động</p>
                  <p>• Bạn có thể thay đổi tùy chọn cookie bất kỳ lúc nào</p>
                  <p>• Sử dụng nút "Quản lý Cookie" ở góc dưới bên phải</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">
                  Liên hệ
                </h3>
                <p className="text-sm text-yellow-700">
                  Nếu bạn có câu hỏi về chính sách cookie, vui lòng liên hệ với chúng tôi qua email hoặc 
                  sử dụng form liên hệ trên website.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
