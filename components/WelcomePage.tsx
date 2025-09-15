'use client'

import { Shield, Zap, Globe, BarChart3, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function WelcomePage() {
  const features = [
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: 'Quản lý Proxy Thông minh',
      description: 'Quản lý hàng trăm nghìn proxy với hiệu suất cao và giao diện thân thiện'
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: 'Kiểm tra Proxy Tự động',
      description: 'Kiểm tra proxy tự động với báo cáo chi tiết'
    },
    {
      icon: <Globe className="h-8 w-8 text-green-600" />,
      title: 'Phân tích Địa lý',
      description: 'Theo dõi vị trí địa lý, tốc độ và độ ổn định của proxy'
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: 'Báo cáo Chi tiết',
      description: 'Thống kê và phân tích dữ liệu proxy với biểu đồ trực quan'
    }
  ]

  const benefits = [
    'Hỗ trợ tất cả loại proxy (HTTP, HTTPS, SOCKS4, SOCKS5)',
    'Kiểm tra proxy với nhiều URL khác nhau',
    'Lưu trữ dữ liệu an toàn và bảo mật',
    'Giao diện thân thiện, dễ sử dụng',
    'Tự động tối ưu hóa hiệu suất',
    'Xuất báo cáo CSV, JSON, XML'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Proxy Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Đăng ký miễn phí
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Quản lý Proxy
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}Chuyên Nghiệp
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Ứng dụng quản lý và kiểm tra proxy mạnh mẽ. 
            Quản lý hàng trăm nghìn proxy với hiệu suất cao và bảo mật tuyệt đối.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Bắt đầu miễn phí
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-900 text-lg font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
            >
              Đã có tài khoản? Đăng nhập
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tất cả công cụ bạn cần để quản lý proxy hiệu quả
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Tại sao chọn Proxy Manager?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Chúng tôi cung cấp giải pháp toàn diện để quản lý proxy 
                với công nghệ tiên tiến và giao diện thân thiện.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Bảo mật tuyệt đối
                </h3>
                <p className="text-gray-600 mb-6">
                  Dữ liệu proxy của bạn được mã hóa và bảo vệ an toàn. 
                  Chỉ bạn mới có thể truy cập dữ liệu của mình.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">100K+</div>
                    <div className="text-gray-600">Proxy được hỗ trợ</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">99.9%</div>
                    <div className="text-gray-600">Thời gian hoạt động</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Tạo tài khoản miễn phí và bắt đầu quản lý proxy chuyên nghiệp ngay hôm nay.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
          >
            Đăng ký miễn phí ngay
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Shield className="h-8 w-8 text-blue-400" />
              <h3 className="text-2xl font-bold">Proxy Manager</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Ứng dụng quản lý proxy chuyên nghiệp với AI Intelligence
            </p>
            <p className="text-sm text-gray-500">
              © 2024 Proxy Manager. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
