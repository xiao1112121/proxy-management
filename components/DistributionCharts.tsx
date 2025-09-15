'use client'

import { useState } from 'react'
import { 
  PieChart, 
  BarChart3, 
  Globe, 
  Shield, 
  Zap, 
  Activity,
  TrendingUp,
  Users,
  Eye,
  EyeOff
} from 'lucide-react'

interface DistributionData {
  label: string
  value: number
  percentage: number
  color: string
}

interface DistributionChartsProps {
  statusDistribution: Map<string, number>
  countryDistribution: Map<string, number>
  typeDistribution: Map<string, number>
  anonymityDistribution: Map<string, number>
  healthScoreDistribution?: Map<string, number>
  responseTimeDistribution?: Map<string, number>
}

export default function DistributionCharts({
  statusDistribution,
  countryDistribution,
  typeDistribution,
  anonymityDistribution,
  healthScoreDistribution,
  responseTimeDistribution
}: DistributionChartsProps) {
  const [activeChart, setActiveChart] = useState<string>('status')

  // Color palettes
  const statusColors: Record<string, string> = {
    'alive': '#10B981',
    'dead': '#EF4444', 
    'pending': '#F59E0B',
    'testing': '#3B82F6',
    'unknown': '#6B7280'
  }

  const typeColors: Record<string, string> = {
    'http': '#3B82F6',
    'https': '#10B981',
    'socks4': '#8B5CF6',
    'socks5': '#F59E0B',
    'unknown': '#6B7280'
  }

  const anonymityColors: Record<string, string> = {
    'transparent': '#EF4444',
    'anonymous': '#F59E0B',
    'elite': '#10B981',
    'unknown': '#6B7280'
  }

  const defaultColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ]

  // Convert Map to DistributionData array
  const convertToDistributionData = (
    map: Map<string, number>, 
    colorMap?: Record<string, string>
  ): DistributionData[] => {
    const total = Array.from(map.values()).reduce((sum, value) => sum + value, 0)
    
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], index) => ({
        label,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        color: colorMap?.[label] || defaultColors[index % defaultColors.length]
      }))
  }

  // Get data for active chart
  const getActiveData = () => {
    switch (activeChart) {
      case 'status':
        return convertToDistributionData(statusDistribution, statusColors)
      case 'country':
        return convertToDistributionData(countryDistribution).slice(0, 10) // Top 10
      case 'type':
        return convertToDistributionData(typeDistribution, typeColors)
      case 'anonymity':
        return convertToDistributionData(anonymityDistribution, anonymityColors)
      case 'healthScore':
        return healthScoreDistribution 
          ? convertToDistributionData(healthScoreDistribution)
          : []
      case 'responseTime':
        return responseTimeDistribution
          ? convertToDistributionData(responseTimeDistribution)
          : []
      default:
        return []
    }
  }

  // Render pie chart
  const renderPieChart = (data: DistributionData[]) => {
    if (data.length === 0) return null

    const size = 200
    const center = size / 2
    const radius = 80
    
    let cumulativePercentage = 0

    return (
      <div className="flex items-center justify-center">
        <svg width={size} height={size} className="drop-shadow-sm">
          {data.map((item, index) => {
            const startAngle = (cumulativePercentage / 100) * 360
            const endAngle = ((cumulativePercentage + item.percentage) / 100) * 360
            cumulativePercentage += item.percentage

            const startAngleRad = (startAngle * Math.PI) / 180
            const endAngleRad = (endAngle * Math.PI) / 180

            const x1 = center + radius * Math.cos(startAngleRad)
            const y1 = center + radius * Math.sin(startAngleRad)
            const x2 = center + radius * Math.cos(endAngleRad)
            const y2 = center + radius * Math.sin(endAngleRad)

            const largeArc = item.percentage > 50 ? 1 : 0

            const pathData = [
              `M ${center} ${center}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ')

            return (
              <g key={index}>
                <path
                  d={pathData}
                  fill={item.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <title>{`${item.label}: ${item.value} (${item.percentage}%)`}</title>
                </path>
              </g>
            )
          })}
          
          {/* Center circle */}
          <circle
            cx={center}
            cy={center}
            r={30}
            fill="white"
            className="drop-shadow-sm"
          />
          
          {/* Center text */}
          <text
            x={center}
            y={center - 5}
            textAnchor="middle"
            className="text-sm font-semibold fill-gray-900"
          >
            Total
          </text>
          <text
            x={center}
            y={center + 10}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            {data.reduce((sum, item) => sum + item.value, 0)}
          </text>
        </svg>
      </div>
    )
  }

  // Render bar chart
  const renderBarChart = (data: DistributionData[]) => {
    if (data.length === 0) return null

    const maxValue = Math.max(...data.map(item => item.value))

    return (
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-gray-700 truncate" title={item.label}>
              {item.label}
            </div>
            <div className="flex-1 relative">
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className="h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color
                  }}
                >
                  <span className="text-xs font-medium text-white">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            </div>
            <div className="w-12 text-sm text-gray-600 text-right">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Get chart icon
  const getChartIcon = (chartType: string) => {
    switch (chartType) {
      case 'status': return <Activity className="h-4 w-4" />
      case 'country': return <Globe className="h-4 w-4" />
      case 'type': return <Zap className="h-4 w-4" />
      case 'anonymity': return <Shield className="h-4 w-4" />
      case 'healthScore': return <TrendingUp className="h-4 w-4" />
      case 'responseTime': return <BarChart3 className="h-4 w-4" />
      default: return <PieChart className="h-4 w-4" />
    }
  }

  // Get chart title
  const getChartTitle = (chartType: string) => {
    switch (chartType) {
      case 'status': return 'Proxy Status Distribution'
      case 'country': return 'Country Distribution'
      case 'type': return 'Proxy Type Distribution'
      case 'anonymity': return 'Anonymity Level Distribution'
      case 'healthScore': return 'Health Score Distribution'
      case 'responseTime': return 'Response Time Distribution'
      default: return 'Distribution'
    }
  }

  const activeData = getActiveData()
  const chartTabs = [
    { id: 'status', label: 'Status', icon: Activity },
    { id: 'country', label: 'Country', icon: Globe },
    { id: 'type', label: 'Type', icon: Zap },
    { id: 'anonymity', label: 'Anonymity', icon: Shield },
    ...(healthScoreDistribution ? [{ id: 'healthScore', label: 'Health', icon: TrendingUp }] : []),
    ...(responseTimeDistribution ? [{ id: 'responseTime', label: 'Response', icon: BarChart3 }] : [])
  ]

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header with tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-4 pb-0">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-blue-500" />
            <span>Distribution Analysis</span>
          </h3>
        </div>
        
        <div className="flex space-x-1 px-4">
          {chartTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeChart === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart content */}
      <div className="p-6">
        {activeData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <PieChart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No data available for {getChartTitle(activeChart)}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center space-x-2">
                {getChartIcon(activeChart)}
                <span>{getChartTitle(activeChart)}</span>
              </h4>
              {renderPieChart(activeData)}
            </div>

            {/* Legend & Bar Chart */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">
                Detailed Breakdown
              </h4>
              {renderBarChart(activeData)}
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {activeData.length > 0 && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Total Items</div>
              <div className="text-lg font-bold text-gray-900">
                {activeData.reduce((sum, item) => sum + item.value, 0)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Categories</div>
              <div className="text-lg font-bold text-gray-900">
                {activeData.length}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Top Category</div>
              <div className="text-lg font-bold text-gray-900">
                {activeData[0]?.percentage || 0}%
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Diversity</div>
              <div className="text-lg font-bold text-gray-900">
                {activeData.length > 1 
                  ? Math.round((1 - (activeData[0]?.percentage || 0) / 100) * 100)
                  : 0}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
