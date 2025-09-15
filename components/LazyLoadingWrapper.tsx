'use client'

import React, { Suspense } from 'react'
import { useLazyComponent, useLazyLoading } from '@/hooks/useLazyLoading'
import { Loader2, AlertCircle } from 'lucide-react'

interface LazyLoadingWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
  height?: number
  className?: string
  threshold?: number
  rootMargin?: string
}

// Loading skeleton component
const LoadingSkeleton = ({ height = 200 }: { height?: number }) => (
  <div 
    className="animate-pulse bg-gray-200 rounded-lg flex items-center justify-center"
    style={{ height }}
  >
    <div className="flex items-center space-x-2 text-gray-400">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="text-sm">Loading...</span>
    </div>
  </div>
)

// Error fallback component
const ErrorFallback = ({ 
  error, 
  retry, 
  height = 200 
}: { 
  error?: string
  retry?: () => void
  height?: number 
}) => (
  <div 
    className="bg-red-50 border border-red-200 rounded-lg flex items-center justify-center"
    style={{ height }}
  >
    <div className="text-center p-4">
      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
      <p className="text-red-700 text-sm mb-3">
        {error || 'Failed to load content'}
      </p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
)

export default function LazyLoadingWrapper({
  children,
  fallback,
  errorFallback,
  height = 200,
  className = '',
  threshold = 0.1,
  rootMargin = '50px'
}: LazyLoadingWrapperProps) {
  const { 
    elementRef, 
    isInView, 
    isLoaded, 
    error 
  } = useLazyLoading({
    threshold,
    rootMargin,
    triggerOnce: true
  })

  return (
    <div 
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={className}
    >
      {error ? (
        errorFallback || <ErrorFallback error={error} height={height} />
      ) : isInView || isLoaded ? (
        <Suspense fallback={fallback || <LoadingSkeleton height={height} />}>
          {children}
        </Suspense>
      ) : (
        fallback || <LoadingSkeleton height={height} />
      )}
    </div>
  )
}

// HOC for lazy loading components
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode
    errorFallback?: React.ReactNode
    height?: number
    threshold?: number
    rootMargin?: string
  }
) {
  const LazyComponent = (props: P) => {
    return (
      <LazyLoadingWrapper
        fallback={options?.fallback}
        errorFallback={options?.errorFallback}
        height={options?.height}
        threshold={options?.threshold}
        rootMargin={options?.rootMargin}
      >
        <Component {...props} />
      </LazyLoadingWrapper>
    )
  }

  LazyComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`
  return LazyComponent
}

// Lazy image component
export function LazyImage({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder,
  onLoad,
  onError
}: {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  placeholder?: string
  onLoad?: () => void
  onError?: (error: string) => void
}) {
  const { 
    elementRef, 
    isInView, 
    isLoaded, 
    error 
  } = useLazyLoading({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true
  })

  const [imageSrc, setImageSrc] = React.useState<string>('')
  const [imageLoaded, setImageLoaded] = React.useState(false)

  React.useEffect(() => {
    if (isInView && !isLoaded && !error) {
      const img = new Image()
      
      img.onload = () => {
        setImageSrc(src)
        setImageLoaded(true)
        onLoad?.()
      }
      
      img.onerror = () => {
        const errorMsg = 'Failed to load image'
        onError?.(errorMsg)
      }
      
      img.src = src
    }
  }, [isInView, isLoaded, error, src, onLoad, onError])

  return (
    <div 
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`relative ${className}`}
      style={{ width, height }}
    >
      {!imageLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center"
          style={{ width, height }}
        >
          {placeholder ? (
            <img src={placeholder} alt={alt} className="opacity-50" />
          ) : (
            <div className="text-gray-400 text-sm">Loading...</div>
          )}
        </div>
      )}
      
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          style={{ width, height }}
          onLoad={() => setImageLoaded(true)}
        />
      )}
      
      {error && (
        <div 
          className="absolute inset-0 bg-red-50 border border-red-200 rounded flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-center">
            <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <div className="text-red-700 text-xs">Failed to load</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Lazy section component for large content blocks
export function LazySection({
  children,
  title,
  className = '',
  minHeight = 300,
  loadingMessage = 'Loading section...'
}: {
  children: React.ReactNode
  title?: string
  className?: string
  minHeight?: number
  loadingMessage?: string
}) {
  const { 
    elementRef, 
    isInView, 
    isLoaded 
  } = useLazyLoading({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true
  })

  return (
    <div 
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={className}
      style={{ minHeight }}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
      )}
      
      {isInView || isLoaded ? (
        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
            <span className="text-gray-600">{loadingMessage}</span>
          </div>
        }>
          {children}
        </Suspense>
      ) : (
        <div 
          className="bg-gray-100 animate-pulse rounded-lg flex items-center justify-center"
          style={{ minHeight: minHeight - 60 }}
        >
          <div className="text-gray-400 text-sm">
            {loadingMessage}
          </div>
        </div>
      )}
    </div>
  )
}
