'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  LineChart, 
  BarChart3, 
  PieChart, 
  Activity, 
  TrendingUp,
  TrendingDown,
  Maximize2,
  Minimize2,
  Download,
  Settings,
  Eye,
  EyeOff,
  Play,
  Pause
} from 'lucide-react'
import { TimeSeriesData, ChartDataPoint } from '@/hooks/useChartData'

interface InteractiveChartProps {
  data: TimeSeriesData[]
  title: string
  type: 'line' | 'bar' | 'area' | 'pie'
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  enableZoom?: boolean
  enableAnimation?: boolean
  realTime?: boolean
  onSeriesToggle?: (seriesId: string) => void
  onExport?: () => void
}

export default function InteractiveChart({
  data,
  title,
  type = 'line',
  height = 300,
  showLegend = true,
  showGrid = true,
  enableZoom = true,
  enableAnimation = true,
  realTime = false,
  onSeriesToggle,
  onExport
}: InteractiveChartProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState<{
    seriesId: string
    point: ChartDataPoint
    x: number
    y: number
  } | null>(null)
  const [isPlaying, setIsPlaying] = useState(realTime)
  
  const chartRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const visibleData = data.filter(series => series.visible)
  const chartHeight = isExpanded ? height * 1.5 : height
  const chartWidth = chartRef.current?.clientWidth || 800

  // Calculate chart dimensions
  const margin = { top: 20, right: 30, bottom: 40, left: 60 }
  const innerWidth = chartWidth - margin.left - margin.right
  const innerHeight = chartHeight - margin.top - margin.bottom

  // Get data bounds
  const allDataPoints = visibleData.flatMap(series => series.data)
  const minValue = Math.min(...allDataPoints.map(d => d.value))
  const maxValue = Math.max(...allDataPoints.map(d => d.value))
  const minTime = Math.min(...allDataPoints.map(d => d.timestamp))
  const maxTime = Math.max(...allDataPoints.map(d => d.timestamp))

  // Scale functions
  const xScale = (timestamp: number) => 
    ((timestamp - minTime) / (maxTime - minTime || 1)) * innerWidth

  const yScale = (value: number) => 
    innerHeight - ((value - minValue) / (maxValue - minValue || 1)) * innerHeight

  // Generate path for line chart
  const generateLinePath = (points: ChartDataPoint[]) => {
    if (points.length === 0) return ''
    
    const pathData = points.map((point, index) => {
      const x = xScale(point.timestamp)
      const y = yScale(point.value)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
    
    return pathData
  }

  // Generate area path
  const generateAreaPath = (points: ChartDataPoint[]) => {
    if (points.length === 0) return ''
    
    const linePath = generateLinePath(points)
    const firstX = xScale(points[0].timestamp)
    const lastX = xScale(points[points.length - 1].timestamp)
    
    return `${linePath} L ${lastX} ${innerHeight} L ${firstX} ${innerHeight} Z`
  }

  // Handle mouse move for tooltip
  const handleMouseMove = (event: React.MouseEvent, seriesId: string, point: ChartDataPoint) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (rect) {
      setHoveredPoint({
        seriesId,
        point,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      })
    }
  }

  // Format value for display
  const formatValue = (value: number, seriesId: string) => {
    if (seriesId.includes('time')) {
      return `${value}ms`
    }
    if (seriesId.includes('score')) {
      return `${value}%`
    }
    return value.toString()
  }

  // Get trend for series
  const getTrend = (series: TimeSeriesData) => {
    if (series.data.length < 2) return null
    
    const recent = series.data.slice(-5)
    const older = series.data.slice(-10, -5)
    
    if (older.length === 0) return null
    
    const recentAvg = recent.reduce((sum, p) => sum + p.value, 0) / recent.length
    const olderAvg = older.reduce((sum, p) => sum + p.value, 0) / older.length
    
    return recentAvg > olderAvg ? 'up' : 'down'
  }

  // Render grid lines
  const renderGrid = () => {
    if (!showGrid) return null

    const xLines = []
    const yLines = []
    
    // Vertical grid lines (time)
    for (let i = 0; i <= 10; i++) {
      const x = (innerWidth / 10) * i
      xLines.push(
        <line
          key={`x-${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={innerHeight}
          stroke="#E5E7EB"
          strokeWidth={0.5}
        />
      )
    }

    // Horizontal grid lines (values)
    for (let i = 0; i <= 5; i++) {
      const y = (innerHeight / 5) * i
      yLines.push(
        <line
          key={`y-${i}`}
          x1={0}
          y1={y}
          x2={innerWidth}
          y2={y}
          stroke="#E5E7EB"
          strokeWidth={0.5}
        />
      )
    }

    return (
      <g className="grid">
        {xLines}
        {yLines}
      </g>
    )
  }

  // Render chart based on type
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <g>
            {visibleData.map(series => (
              <g key={series.id}>
                <path
                  d={generateLinePath(series.data)}
                  fill="none"
                  stroke={series.color}
                  strokeWidth={2}
                  className={enableAnimation ? 'transition-all duration-300' : ''}
                />
                {series.data.map((point, index) => (
                  <circle
                    key={index}
                    cx={xScale(point.timestamp)}
                    cy={yScale(point.value)}
                    r={3}
                    fill={series.color}
                    className="cursor-pointer hover:r-4 transition-all"
                    onMouseMove={(e) => handleMouseMove(e, series.id, point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </g>
            ))}
          </g>
        )
      
      case 'area':
        return (
          <g>
            {visibleData.map((series, index) => (
              <path
                key={series.id}
                d={generateAreaPath(series.data)}
                fill={series.color}
                fillOpacity={0.3}
                stroke={series.color}
                strokeWidth={2}
                className={enableAnimation ? 'transition-all duration-300' : ''}
              />
            ))}
          </g>
        )
      
      case 'bar':
        return (
          <g>
            {visibleData.map((series, seriesIndex) => (
              <g key={series.id}>
                {series.data.map((point, pointIndex) => {
                  const barWidth = Math.max(2, innerWidth / (series.data.length * visibleData.length))
                  const x = xScale(point.timestamp) - (barWidth * visibleData.length) / 2 + barWidth * seriesIndex
                  const barHeight = Math.max(0, innerHeight - yScale(point.value))
                  
                  return (
                    <rect
                      key={pointIndex}
                      x={x}
                      y={yScale(point.value)}
                      width={barWidth}
                      height={barHeight}
                      fill={series.color}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onMouseMove={(e) => handleMouseMove(e, series.id, point)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  )
                })}
              </g>
            ))}
          </g>
        )
      
      default:
        return null
    }
  }

  // Render axes
  const renderAxes = () => (
    <g className="axes">
      {/* X-axis */}
      <line
        x1={0}
        y1={innerHeight}
        x2={innerWidth}
        y2={innerHeight}
        stroke="#374151"
        strokeWidth={1}
      />
      
      {/* Y-axis */}
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={innerHeight}
        stroke="#374151"
        strokeWidth={1}
      />
      
      {/* Y-axis labels */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const value = minValue + ((maxValue - minValue) * i) / 5
        const y = innerHeight - (innerHeight * i) / 5
        
        return (
          <text
            key={i}
            x={-10}
            y={y + 4}
            textAnchor="end"
            className="text-xs fill-gray-600"
          >
            {Math.round(value)}
          </text>
        )
      })}
      
      {/* X-axis labels */}
      {[0, 1, 2, 3, 4].map(i => {
        const timestamp = minTime + ((maxTime - minTime) * i) / 4
        const x = (innerWidth * i) / 4
        const time = new Date(timestamp).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        })
        
        return (
          <text
            key={i}
            x={x}
            y={innerHeight + 20}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            {time}
          </text>
        )
      })}
    </g>
  )

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {type === 'line' && <LineChart className="h-5 w-5 text-blue-500" />}
          {type === 'bar' && <BarChart3 className="h-5 w-5 text-blue-500" />}
          {type === 'area' && <Activity className="h-5 w-5 text-blue-500" />}
          {type === 'pie' && <PieChart className="h-5 w-5 text-blue-500" />}
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {realTime && (
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {realTime && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          )}
          
          {onExport && (
            <button
              onClick={onExport}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Export"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div ref={chartRef} className="relative">
        <svg
          ref={svgRef}
          width="100%"
          height={chartHeight}
          className="overflow-visible"
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {renderGrid()}
            {renderChart()}
            {renderAxes()}
          </g>
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none z-10 transform -translate-x-1/2 -translate-y-full"
            style={{
              left: hoveredPoint.x,
              top: hoveredPoint.y - 10
            }}
          >
            <div className="text-sm font-medium">
              {data.find(s => s.id === hoveredPoint.seriesId)?.name}
            </div>
            <div className="text-xs text-gray-300">
              {formatValue(hoveredPoint.point.value, hoveredPoint.seriesId)}
            </div>
            <div className="text-xs text-gray-400">
              {hoveredPoint.point.label}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && visibleData.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4">
            {data.map(series => {
              const trend = getTrend(series)
              return (
                <div
                  key={series.id}
                  className="flex items-center space-x-2 cursor-pointer group"
                  onClick={() => onSeriesToggle?.(series.id)}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: series.color }}
                  />
                  <span className={`text-sm ${
                    series.visible ? 'text-gray-900' : 'text-gray-400 line-through'
                  }`}>
                    {series.name}
                  </span>
                  {series.visible && (
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      title={series.visible ? 'Hide' : 'Show'}
                    >
                      {series.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </button>
                  )}
                  {trend && series.visible && (
                    <span className={`text-xs ${
                      trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
