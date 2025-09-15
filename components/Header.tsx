'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { 
  User, 
  LogOut, 
  Settings, 
  ChevronDown
} from 'lucide-react'

export default function Header() {
  const { user, logout, isAuthenticated, isLoading } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center h-16">

          {/* Language Switcher & User Menu - Same row */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center space-x-2">
              <select className="text-sm border border-white/30 rounded-md px-2 py-1 bg-white text-gray-900">
                <option value="vi" className="text-gray-900">Tiếng Việt</option>
                <option value="en" className="text-gray-900">English</option>
              </select>
            </div>

            {/* User Menu */}
            {isLoading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <span className="hidden md:block">{user?.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Cài đặt tài khoản
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium bg-white/20"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        </div>
      </div>
    </header>
  )
}
