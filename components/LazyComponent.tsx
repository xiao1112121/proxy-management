'use client'

import React, { Suspense, lazy, ComponentType } from 'react'
import { Loader2 } from 'lucide-react'

interface LazyComponentProps {
  fallback?: React.ReactNode
  delay?: number
}

// Loading spinner component
const LoadingSpinner = ({ delay = 0 }: { delay?: number }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-2">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-600">
        {delay > 0 ? `Loading in ${delay}ms...` : 'Loading...'}
      </p>
    </div>
  </div>
)

// Error boundary for lazy components
const LazyErrorBoundary = ({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) => {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      {fallback || (
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-600">Failed to load component</p>
        </div>
      )}
    </div>
  )
}

// Higher-order component for lazy loading
export function withLazyLoading<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: LazyComponentProps = {}
) {
  const LazyComponent = lazy(() => 
    new Promise<{ default: ComponentType<T> }>((resolve) => {
      if (options.delay && options.delay > 0) {
        setTimeout(() => {
          importFn().then(resolve)
        }, options.delay)
      } else {
        importFn().then(resolve)
      }
    })
  )

  return function LazyWrapper(props: T) {
    return (
      <LazyErrorBoundary fallback={options.fallback}>
        <Suspense fallback={<LoadingSpinner delay={options.delay} />}>
          <LazyComponent {...(props as any)} />
        </Suspense>
      </LazyErrorBoundary>
    )
  }
}

// Pre-configured lazy components
export const LazyProxyList = lazy(() => import('./ProxyList'))
export const LazyMassProxyValidator = lazy(() => import('./MassProxyValidator'))
export const LazySmartProxyRotation = lazy(() => import('./SmartProxyRotation'))
export const LazyAnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'))
export const LazyPerformanceDashboard = lazy(() => import('./PerformanceDashboard'))
export const LazyDistributionCharts = lazy(() => import('./DistributionCharts'))
export const LazyPerformanceLeaderboard = lazy(() => import('./PerformanceLeaderboard'))
export const LazyInteractiveChart = lazy(() => import('./InteractiveChart'))
export const LazyVirtualizedProxyList = lazy(() => import('./VirtualizedProxyList'))
export const LazyAdvancedExportModal = lazy(() => import('./AdvancedExportModal'))

// Utility hook for lazy loading with intersection observer
export function useLazyLoad(ref: React.RefObject<HTMLElement | null>, options: IntersectionObserverInit = {}) {
  const [isVisible, setIsVisible] = React.useState(false)
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, ...options }
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => observer.disconnect()
  }, [ref, options])
  
  return isVisible
}

// Lazy loading wrapper with intersection observer
export function LazyLoadWrapper({ 
  children, 
  fallback, 
  threshold = 0.1,
  rootMargin = '50px'
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const isVisible = useLazyLoad(ref, { threshold, rootMargin })
  
  return (
    <div ref={ref}>
      {isVisible ? children : (fallback || <LoadingSpinner />)}
    </div>
  )
}

export default withLazyLoading
