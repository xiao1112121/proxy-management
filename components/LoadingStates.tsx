'use client'

import React from 'react'
import { Loader2, Zap, Activity, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

// Basic loading spinner
export function LoadingSpinner({ 
  size = 'md', 
  color = 'blue',
  className = ''
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'green' | 'red' | 'gray' | 'white'
  className?: string
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    gray: 'text-gray-500',
    white: 'text-white'
  }

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`} />
  )
}

// Pulsing dots loader
export function PulsingDots({ 
  color = 'blue',
  className = ''
}: {
  color?: 'blue' | 'green' | 'red' | 'gray'
  className?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500'
  }

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${colorClasses[color]} animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  )
}

// Skeleton loader for text
export function SkeletonText({ 
  lines = 1,
  className = ''
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{
            width: `${Math.random() * 40 + 60}%`
          }}
        />
      ))}
    </div>
  )
}

// Skeleton loader for cards
export function SkeletonCard({ 
  className = ''
}: {
  className?: string
}) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded mb-2" style={{ width: '60%' }}></div>
            <div className="h-3 bg-gray-200 rounded" style={{ width: '40%' }}></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded" style={{ width: '80%' }}></div>
          <div className="h-3 bg-gray-200 rounded" style={{ width: '90%' }}></div>
        </div>
      </div>
    </div>
  )
}

// Progress bar with animation
export function ProgressBar({
  progress,
  showPercentage = true,
  color = 'blue',
  size = 'md',
  animated = true,
  className = ''
}: {
  progress: number
  showPercentage?: boolean
  color?: 'blue' | 'green' | 'red' | 'yellow'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  }

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  return (
    <div className={className}>
      {showPercentage && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} rounded-full transition-all duration-300 ${colorClasses[color]} ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  )
}

// Loading overlay for components
export function LoadingOverlay({
  isLoading,
  children,
  message = 'Loading...',
  blur = true,
  className = ''
}: {
  isLoading: boolean
  children: React.ReactNode
  message?: string
  blur?: boolean
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <div className={`transition-all duration-300 ${
        isLoading && blur ? 'blur-sm opacity-50' : ''
      }`}>
        {children}
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
          <div className="flex flex-col items-center space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-600 font-medium">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Status indicator with loading states
export function StatusIndicator({
  status,
  message,
  showIcon = true,
  animated = true,
  className = ''
}: {
  status: 'loading' | 'success' | 'error' | 'warning' | 'idle'
  message?: string
  showIcon?: boolean
  animated?: boolean
  className?: string
}) {
  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <LoadingSpinner size="sm" />,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          bgColor: 'bg-blue-50'
        }
      case 'success':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'text-green-600 bg-green-50 border-green-200',
          bgColor: 'bg-green-50'
        }
      case 'error':
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: 'text-red-600 bg-red-50 border-red-200',
          bgColor: 'bg-red-50'
        }
      case 'warning':
        return {
          icon: <RefreshCw className="h-4 w-4" />,
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          bgColor: 'bg-yellow-50'
        }
      default:
        return {
          icon: <div className="h-4 w-4 bg-gray-300 rounded-full" />,
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          bgColor: 'bg-gray-50'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full border ${config.color} ${
      animated && status === 'loading' ? 'animate-pulse' : ''
    } ${className}`}>
      {showIcon && config.icon}
      {message && <span className="text-sm font-medium">{message}</span>}
    </div>
  )
}

// Typing animation for text
export function TypingText({
  text,
  speed = 50,
  className = '',
  onComplete
}: {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
}) {
  const [displayText, setDisplayText] = React.useState('')
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)
      
      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete])

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

// Loading button with different states
export function LoadingButton({
  isLoading = false,
  disabled = false,
  children,
  loadingText = 'Loading...',
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  ...props
}: {
  isLoading?: boolean
  disabled?: boolean
  children: React.ReactNode
  loadingText?: string
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center space-x-2 rounded-lg font-medium
        transition-all duration-200 transform
        ${variantClasses[variant]} ${sizeClasses[size]}
        ${disabled || isLoading 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:scale-105 active:scale-95'
        }
        ${className}
      `}
      {...props}
    >
      {isLoading && <LoadingSpinner size="sm" color="white" />}
      <span>{isLoading ? loadingText : children}</span>
    </button>
  )
}

// Shimmer effect for loading content
export function ShimmerEffect({
  width = '100%',
  height = '20px',
  className = ''
}: {
  width?: string
  height?: string
  className?: string
}) {
  return (
    <div
      className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded ${className}`}
      style={{
        width,
        height,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite'
      }}
    />
  )
}

// Floating action button with loading state
export function FloatingActionButton({
  isLoading = false,
  icon,
  onClick,
  position = 'bottom-right',
  color = 'blue',
  size = 'md',
  tooltip,
  className = ''
}: {
  isLoading?: boolean
  icon: React.ReactNode
  onClick?: () => void
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  color?: 'blue' | 'green' | 'red' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  tooltip?: string
  className?: string
}) {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    red: 'bg-red-600 hover:bg-red-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  }

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  }

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        fixed ${positionClasses[position]} ${sizeClasses[size]}
        ${colorClasses[color]} text-white rounded-full shadow-lg
        flex items-center justify-center
        transition-all duration-300 transform hover:scale-110 active:scale-95
        ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-xl'}
        ${className}
      `}
      title={tooltip}
      style={{ zIndex: 1000 }}
    >
      {isLoading ? <LoadingSpinner size="sm" color="white" /> : icon}
    </button>
  )
}

// Add shimmer keyframes to global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `
  document.head.appendChild(style)
}
