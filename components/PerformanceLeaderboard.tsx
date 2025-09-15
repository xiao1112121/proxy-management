'use client'

import { useState } from 'react'
import { 
  Trophy, 
  TrendingDown, 
  Crown, 
  Medal, 
  Award,
  AlertTriangle,
  Clock,
  Activity,
  Globe,
  Zap,
  CheckCircle,
  XCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

interface PerformerData {
  id: number
  name: string
  healthScore: number
  successRate: number
  responseTime: number
  uptime?: number
  consecutiveFailures?: number
  lastError?: string
  country: string
}

interface PerformanceLeaderboardProps {
  topPerformers: PerformerData[]
  worstPerformers: PerformerData[]
}

export default function PerformanceLeaderboard({
  topPerformers,
  worstPerformers
}: PerformanceLeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'top' | 'worst'>('top')
  const [sortBy, setSortBy] = useState<'healthScore' | 'successRate' | 'responseTime'>('healthScore')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder(field === 'responseTime' ? 'asc' : 'desc') // Lower response time is better
    }
  }

  const sortData = (data: PerformerData[]) => {
    return [...data].sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortOrder === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50'
    if (score >= 60) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getResponseTimeColor = (time: number) => {
    if (time < 500) return 'text-green-600'
    if (time < 1000) return 'text-yellow-600'
    if (time < 2000) return 'text-orange-600'
    return 'text-red-600'
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600'
    if (rate >= 90) return 'text-yellow-600'
    if (rate >= 80) return 'text-orange-600'
    return 'text-red-600'
  }

  const formatCountry = (country: string) => {
    const flagEmojis: Record<string, string> = {
      'US': '🇺🇸',
      'UK': '🇬🇧',
      'DE': '🇩🇪',
      'FR': '🇫🇷',
      'JP': '🇯🇵',
      'CN': '🇨🇳',
      'RU': '🇷🇺',
      'CA': '🇨🇦',
      'AU': '🇦🇺',
      'BR': '🇧🇷',
      'IN': '🇮🇳',
      'KR': '🇰🇷',
      'SG': '🇸🇬',
      'NL': '🇳🇱'
    }
    
    return `${flagEmojis[country] || '🌍'} ${country}`
  }

  const renderPerformerCard = (performer: PerformerData, index: number, isTop: boolean) => (
    <div
      key={performer.id}
      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
        index === 0 && isTop
          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getRankIcon(index)}
          <div>
            <h4 className="font-medium text-gray-900">{performer.name}</h4>
            <p className="text-sm text-gray-500">{formatCountry(performer.country)}</p>
          </div>
        </div>
        
        {/* Health Score Badge */}
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getHealthScoreColor(performer.healthScore)}`}>
          {performer.healthScore}%
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Success Rate */}
        <div className="text-center">
          <div className={`text-lg font-bold ${getSuccessRateColor(performer.successRate)}`}>
            {performer.successRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Success Rate</div>
        </div>

        {/* Response Time */}
        <div className="text-center">
          <div className={`text-lg font-bold ${getResponseTimeColor(performer.responseTime)}`}>
            {performer.responseTime}ms
          </div>
          <div className="text-xs text-gray-500">Response</div>
        </div>

        {/* Uptime or Failures */}
        <div className="text-center">
          {isTop && performer.uptime !== undefined ? (
            <>
              <div className="text-lg font-bold text-blue-600">
                {performer.uptime.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Uptime</div>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-red-600">
                {performer.consecutiveFailures || 0}
              </div>
              <div className="text-xs text-gray-500">Failures</div>
            </>
          )}
        </div>
      </div>

      {/* Last Error for worst performers */}
      {!isTop && performer.lastError && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          <AlertTriangle className="h-3 w-3 inline mr-1" />
          {performer.lastError}
        </div>
      )}

      {/* Performance indicators */}
      <div className="mt-3 flex justify-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < Math.floor(performer.healthScore / 20)
                ? performer.healthScore >= 80 ? 'bg-green-400' :
                  performer.healthScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  )

  const renderTable = (data: PerformerData[], isTop: boolean) => (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Proxy
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
              onClick={() => handleSort('healthScore')}
            >
              <div className="flex items-center space-x-1">
                <span>Health Score</span>
                {sortBy === 'healthScore' && (
                  sortOrder === 'desc' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
                )}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
              onClick={() => handleSort('successRate')}
            >
              <div className="flex items-center space-x-1">
                <span>Success Rate</span>
                {sortBy === 'successRate' && (
                  sortOrder === 'desc' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
                )}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
              onClick={() => handleSort('responseTime')}
            >
              <div className="flex items-center space-x-1">
                <span>Response Time</span>
                {sortBy === 'responseTime' && (
                  sortOrder === 'desc' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
                )}
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {isTop ? 'Uptime' : 'Failures'}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortData(data).map((performer, index) => (
            <tr key={performer.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                {getRankIcon(index)}
              </td>
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium text-gray-900">{performer.name}</div>
                  <div className="text-sm text-gray-500">{formatCountry(performer.country)}</div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getHealthScoreColor(performer.healthScore)}`}>
                  {performer.healthScore}%
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`font-medium ${getSuccessRateColor(performer.successRate)}`}>
                  {performer.successRate.toFixed(1)}%
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`font-medium ${getResponseTimeColor(performer.responseTime)}`}>
                  {performer.responseTime}ms
                </span>
              </td>
              <td className="px-4 py-3">
                {isTop && performer.uptime !== undefined ? (
                  <span className="font-medium text-blue-600">
                    {performer.uptime.toFixed(1)}%
                  </span>
                ) : (
                  <span className="font-medium text-red-600">
                    {performer.consecutiveFailures || 0}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const activeData = activeTab === 'top' ? topPerformers : worstPerformers

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-4 pb-0">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Performance Leaderboard</span>
          </h3>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 px-4">
          <button
            onClick={() => setActiveTab('top')}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'top'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>Top Performers ({topPerformers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('worst')}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'worst'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingDown className="h-4 w-4" />
            <span>Need Attention ({worstPerformers.length})</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No {activeTab === 'top' ? 'top performers' : 'problematic proxies'} data available</p>
          </div>
        ) : (
          <>
            {/* Cards view for mobile/small screens */}
            <div className="block lg:hidden space-y-4">
              {sortData(activeData).slice(0, 5).map((performer, index) =>
                renderPerformerCard(performer, index, activeTab === 'top')
              )}
            </div>

            {/* Table view for larger screens */}
            <div className="hidden lg:block">
              {renderTable(activeData, activeTab === 'top')}
            </div>
          </>
        )}
      </div>

      {/* Stats Summary */}
      {activeData.length > 0 && (
        <div className="px-6 pb-6 border-t border-gray-200 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">
                {activeTab === 'top' ? 'Avg Health Score' : 'Avg Health Score'}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {Math.round(activeData.reduce((sum, p) => sum + p.healthScore, 0) / activeData.length)}%
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Avg Success Rate</div>
              <div className="text-lg font-bold text-gray-900">
                {(activeData.reduce((sum, p) => sum + p.successRate, 0) / activeData.length).toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Avg Response Time</div>
              <div className="text-lg font-bold text-gray-900">
                {Math.round(activeData.reduce((sum, p) => sum + p.responseTime, 0) / activeData.length)}ms
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">
                {activeTab === 'top' ? 'Best Score' : 'Worst Score'}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {activeTab === 'top' 
                  ? Math.max(...activeData.map(p => p.healthScore))
                  : Math.min(...activeData.map(p => p.healthScore))
                }%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
