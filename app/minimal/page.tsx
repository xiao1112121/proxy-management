'use client'

import { useState } from 'react'

export default function MinimalPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'list', label: 'Danh sách Proxy' },
    { id: 'add', label: 'Thêm Proxy' },
    { id: 'import', label: 'Import Proxy' },
    { id: 'test', label: 'Test Proxy' },
    { id: 'multitest', label: 'Test & Quản lý URL' },
    { id: 'stats', label: 'Thống kê' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Proxy Manager</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Tab hiện tại: {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600">
              Nếu bạn thấy trang này, cấu trúc tabs đang hoạt động bình thường.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
