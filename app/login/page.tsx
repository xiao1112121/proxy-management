'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowLeft,
  Chrome,
  Shield,
  Sparkles,
  Zap,
  Star,
  Heart,
  Globe,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Lưu token vào localStorage
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Chuyển hướng về trang chính
        router.push('/')
      } else {
        setError(data.message || 'Đăng nhập thất bại')
      }
    } catch (error) {
      setError('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      // Redirect to Google OAuth
      window.location.href = '/api/auth/google'
    } catch (error) {
      setError('Có lỗi xảy ra khi đăng nhập Google')
    } finally {
      setIsLoading(false)
    }
  }

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-500"></div>
        
        {/* Interactive cursor effect */}
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none transition-all duration-300"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transform: isHovered ? 'scale(1.2)' : 'scale(1)'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Back Button */}
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center text-white/80 hover:text-white transition-colors duration-200 group"
            >
              <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors duration-200 mr-3">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <span className="font-medium">Về trang chủ</span>
            </Link>
          </div>

          {/* Login Card */}
          <div className="relative">
            {/* Card Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="relative inline-block mb-6">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full opacity-75 blur-lg animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-4 rounded-full">
                    <Shield className="h-12 w-12 text-white drop-shadow-2xl" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-2 border-white animate-bounce">
                    <Sparkles className="h-3 w-3 text-white m-0.5" />
                  </div>
                </div>
                
                <h1 className="text-4xl font-black text-white mb-3 bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent">
                  Chào mừng trở lại!
                </h1>
                <p className="text-white/80 text-lg">Đăng nhập để tiếp tục hành trình của bạn</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white/90">
                    Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 group-hover:text-white/80 transition-colors duration-200" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                        placeholder="Nhập email của bạn"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white/90">
                    Mật khẩu
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 group-hover:text-white/80 transition-colors duration-200" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                        placeholder="Nhập mật khẩu"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl text-sm flex items-center space-x-2 backdrop-blur-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-2xl hover:shadow-purple-500/25 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Đang đăng nhập...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        <span>Đăng nhập ngay</span>
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Divider */}
              <div className="my-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-white/60 font-medium">Hoặc</span>
                  </div>
                </div>
              </div>

              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white/10 border border-white/20 text-white py-4 px-6 rounded-xl font-semibold hover:bg-white/20 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm group"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Chrome className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                  <span>Đăng nhập bằng Google</span>
                </div>
              </button>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-white/80">
                  Chưa có tài khoản?{' '}
                  <Link 
                    href="/register" 
                    className="text-white font-bold hover:text-purple-200 transition-colors duration-200 relative group"
                  >
                    <span className="relative z-10">Đăng ký ngay</span>
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="text-white/60">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                <Shield className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Bảo mật cao</p>
            </div>
            <div className="text-white/60">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                <Zap className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Tốc độ nhanh</p>
            </div>
            <div className="text-white/60">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                <Heart className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Dễ sử dụng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
