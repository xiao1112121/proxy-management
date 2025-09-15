'use client'

import React from 'react'
import { useLanguage } from '@/lib/i18n'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  const handleLanguageChange = (newLanguage: 'vi' | 'en') => {
    setLanguage(newLanguage)
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 text-white hover:bg-white/30 transition-all duration-200">
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">
          {language === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN'}
        </span>
      </button>
      
      <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          <button
            onClick={() => handleLanguageChange('vi')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 ${
              language === 'vi' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
            }`}
          >
            <span>🇻🇳</span>
            <span>Tiếng Việt</span>
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 ${
              language === 'en' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
            }`}
          >
            <span>🇺🇸</span>
            <span>English</span>
          </button>
        </div>
      </div>
    </div>
  )
}
