'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  Star, 
  Bookmark,
  ChevronDown,
  Tag,
  Zap,
  Globe,
  Shield
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'

interface SavedFilter {
  id: string
  name: string
  filters: {
    searchTerm: string
    status: string
    type: string
    country: string
    anonymity: string
    ping: string
    speed: string
  }
  createdAt: string
}

interface AdvancedSearchProps {
  proxies: Proxy[]
  onFilter: (filteredProxies: Proxy[]) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filterStatus: string
  setFilterStatus: (status: string) => void
  filterType: string
  setFilterType: (type: string) => void
}

export default function AdvancedSearch({
  proxies,
  onFilter,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType
}: AdvancedSearchProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [showSavedFilters, setShowSavedFilters] = useState(false)
  
  const [filterCountry, setFilterCountry] = useState('all')
  const [filterAnonymity, setFilterAnonymity] = useState('all')
  const [filterPing, setFilterPing] = useState('all')
  const [filterSpeed, setFilterSpeed] = useState('all')
  
  const searchRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Load saved data from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
    
    const saved = localStorage.getItem('savedFilters')
    if (saved) {
      setSavedFilters(JSON.parse(saved))
    }
  }, [])

  // Generate suggestions based on search term
  useEffect(() => {
    if (searchTerm.length > 0) {
      const allValues = new Set<string>()
      
      proxies.forEach(proxy => {
        if (proxy.host.toLowerCase().includes(searchTerm.toLowerCase())) {
          allValues.add(proxy.host)
        }
        if (proxy.country && proxy.country.toLowerCase().includes(searchTerm.toLowerCase())) {
          allValues.add(proxy.country)
        }
        if (proxy.city && proxy.city.toLowerCase().includes(searchTerm.toLowerCase())) {
          allValues.add(proxy.city)
        }
        if (proxy.group && proxy.group.toLowerCase().includes(searchTerm.toLowerCase())) {
          allValues.add(proxy.group)
        }
      })
      
      // Add search history matches
      searchHistory.forEach(term => {
        if (term.toLowerCase().includes(searchTerm.toLowerCase())) {
          allValues.add(term)
        }
      })
      
      setSuggestions(Array.from(allValues).slice(0, 8))
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [searchTerm, proxies, searchHistory])

  // Apply filters
  useEffect(() => {
    let filtered = [...proxies]

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(proxy =>
        proxy.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proxy.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proxy.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proxy.group?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proxy.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(proxy => proxy.status === filterStatus)
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(proxy => proxy.type === filterType)
    }

    // Country filter
    if (filterCountry !== 'all') {
      filtered = filtered.filter(proxy => proxy.country === filterCountry)
    }

    // Anonymity filter
    if (filterAnonymity !== 'all') {
      filtered = filtered.filter(proxy => proxy.anonymity === filterAnonymity)
    }

    // Ping filter
    if (filterPing !== 'all') {
      filtered = filtered.filter(proxy => {
        if (!proxy.ping) return false
        switch (filterPing) {
          case 'very-fast': return proxy.ping < 100
          case 'fast': return proxy.ping >= 100 && proxy.ping < 500
          case 'medium': return proxy.ping >= 500 && proxy.ping < 1000
          case 'slow': return proxy.ping >= 1000
          default: return true
        }
      })
    }

    // Speed filter
    if (filterSpeed !== 'all') {
      filtered = filtered.filter(proxy => {
        if (!proxy.speed) return false
        switch (filterSpeed) {
          case 'very-fast': return proxy.speed > 5000
          case 'fast': return proxy.speed > 2000 && proxy.speed <= 5000
          case 'medium': return proxy.speed > 1000 && proxy.speed <= 2000
          case 'slow': return proxy.speed <= 1000
          default: return true
        }
      })
    }

    onFilter(filtered)
  }, [searchTerm, filterStatus, filterType, filterCountry, filterAnonymity, filterPing, filterSpeed, proxies, onFilter])

  const handleSearchSubmit = (term: string) => {
    if (term && !searchHistory.includes(term)) {
      const newHistory = [term, ...searchHistory.slice(0, 9)]
      setSearchHistory(newHistory)
      localStorage.setItem('searchHistory', JSON.stringify(newHistory))
    }
    setSearchTerm(term)
    setShowSuggestions(false)
  }

  const saveCurrentFilter = () => {
    const filterName = prompt('Tên cho bộ lọc này:')
    if (!filterName) return

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      filters: {
        searchTerm,
        status: filterStatus,
        type: filterType,
        country: filterCountry,
        anonymity: filterAnonymity,
        ping: filterPing,
        speed: filterSpeed
      },
      createdAt: new Date().toISOString()
    }

    const newSavedFilters = [...savedFilters, newFilter]
    setSavedFilters(newSavedFilters)
    localStorage.setItem('savedFilters', JSON.stringify(newSavedFilters))
  }

  const loadSavedFilter = (filter: SavedFilter) => {
    setSearchTerm(filter.filters.searchTerm)
    setFilterStatus(filter.filters.status)
    setFilterType(filter.filters.type)
    setFilterCountry(filter.filters.country)
    setFilterAnonymity(filter.filters.anonymity)
    setFilterPing(filter.filters.ping)
    setFilterSpeed(filter.filters.speed)
    setShowSavedFilters(false)
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
    setFilterType('all')
    setFilterCountry('all')
    setFilterAnonymity('all')
    setFilterPing('all')
    setFilterSpeed('all')
  }

  const getUniqueCountries = () => {
    const countries = proxies.map(p => p.country).filter(Boolean)
    return Array.from(new Set(countries)).sort()
  }

  const quickFilters = [
    { id: 'alive-elite', label: '🔒 Elite Alive', icon: Shield, action: () => { setFilterStatus('alive'); setFilterAnonymity('elite') }},
    { id: 'fast-proxies', label: '⚡ Nhanh nhất', icon: Zap, action: () => { setFilterStatus('alive'); setFilterPing('very-fast') }},
    { id: 'recent-tested', label: '🕒 Vừa test', icon: Clock, action: () => { /* Filter by recent test */ }},
    { id: 'by-country', label: '🌍 Theo quốc gia', icon: Globe, action: () => setShowAdvanced(true)}
  ]

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Tìm kiếm theo host, quốc gia, thành phố, group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(searchTerm)}
            className="pl-10 pr-12 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto z-50"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSearchSubmit(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
              >
                <Search className="inline h-3 w-3 text-gray-400 mr-2" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {quickFilters.map((filter) => {
          const Icon = filter.icon
          return (
            <button
              key={filter.id}
              onClick={filter.action}
              className="px-3 py-2 text-sm bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 border border-blue-200 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {filter.label}
            </button>
          )
        })}

        {/* Saved Filters */}
        <div className="relative">
          <button
            onClick={() => setShowSavedFilters(!showSavedFilters)}
            className="px-3 py-2 text-sm bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 border border-purple-200 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          >
            <Bookmark className="h-4 w-4" />
            Đã lưu ({savedFilters.length})
            <ChevronDown className="h-3 w-3" />
          </button>

          {showSavedFilters && (
            <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 min-w-48 z-50">
              {savedFilters.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500">Chưa có bộ lọc nào</div>
              ) : (
                savedFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => loadSavedFilter(filter)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{filter.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(filter.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </button>
                ))
              )}
              <div className="border-t border-gray-100">
                <button
                  onClick={saveCurrentFilter}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-blue-600 font-medium"
                >
                  + Lưu bộ lọc hiện tại
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-4 py-2 border rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 transform hover:scale-105 ${
            showAdvanced 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-blue-500' 
              : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-md hover:shadow-lg border-gray-500'
          }`}
        >
          <Filter className="h-4 w-4" />
          Nâng cao
        </button>

        {/* Clear All */}
        <button
          onClick={clearAllFilters}
          className="px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition-all duration-200"
        >
          <X className="h-4 w-4 inline mr-1" />
          Xóa tất cả
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="alive">✅ Alive</option>
                <option value="dead">❌ Dead</option>
                <option value="pending">⏳ Pending</option>
                <option value="testing">🔄 Testing</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại proxy</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="http">🌐 HTTP</option>
                <option value="https">🔒 HTTPS</option>
                <option value="socks4">🧦 SOCKS4</option>
                <option value="socks5">🧦 SOCKS5</option>
              </select>
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quốc gia</label>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                {getUniqueCountries().map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Anonymity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mức ẩn danh</label>
              <select
                value={filterAnonymity}
                onChange={(e) => setFilterAnonymity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="transparent">🔍 Transparent</option>
                <option value="anonymous">👤 Anonymous</option>
                <option value="elite">🔒 Elite</option>
              </select>
            </div>

            {/* Ping Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ping</label>
              <select
                value={filterPing}
                onChange={(e) => setFilterPing(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="very-fast">⚡ Rất nhanh (&lt;100ms)</option>
                <option value="fast">🚀 Nhanh (100-500ms)</option>
                <option value="medium">🚶 Trung bình (500ms-1s)</option>
                <option value="slow">🐌 Chậm (&gt;1s)</option>
              </select>
            </div>

            {/* Speed Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tốc độ</label>
              <select
                value={filterSpeed}
                onChange={(e) => setFilterSpeed(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="very-fast">⚡ Rất nhanh (&gt;5MB/s)</option>
                <option value="fast">🚀 Nhanh (2-5MB/s)</option>
                <option value="medium">🚶 Trung bình (1-2MB/s)</option>
                <option value="slow">🐌 Chậm (&lt;1MB/s)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
