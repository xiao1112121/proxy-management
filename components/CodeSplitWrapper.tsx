'use client'

import React, { Suspense, lazy, ComponentType, ReactNode } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'

interface CodeSplitWrapperProps {
  fallback?: ReactNode
  errorFallback?: ReactNode
  onError?: (error: Error) => void
  preload?: boolean
  delay?: number
}

// Error boundary for code splitting
class CodeSplitErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('CodeSplit Error:', error, errorInfo)
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Failed to load component</p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Loading component
const LoadingComponent = ({ delay = 0 }: { delay?: number }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-2">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-600">
        {delay > 0 ? `Loading in ${delay}ms...` : 'Loading...'}
      </p>
    </div>
  </div>
)

// Higher-order component for code splitting
export function withCodeSplitting<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: CodeSplitWrapperProps = {}
) {
  const LazyComponent = lazy(importFn)

  return function CodeSplitWrapper(props: T) {
    const { fallback, errorFallback, onError, delay = 0 } = options

    return (
      <CodeSplitErrorBoundary fallback={errorFallback} onError={onError}>
        <Suspense fallback={<LoadingComponent delay={delay} />}>
          <LazyComponent {...(props as any)} />
        </Suspense>
      </CodeSplitErrorBoundary>
    )
  }
}

// Pre-configured code-split components
export const CodeSplitProxyList = withCodeSplitting(
  () => import('./ProxyList'),
  { delay: 100 }
)

export const CodeSplitMassProxyValidator = withCodeSplitting(
  () => import('./MassProxyValidator'),
  { delay: 200 }
)

export const CodeSplitSmartProxyRotation = withCodeSplitting(
  () => import('./SmartProxyRotation'),
  { delay: 200 }
)

export const CodeSplitAnalyticsDashboard = withCodeSplitting(
  () => import('./AnalyticsDashboard'),
  { delay: 300 }
)

export const CodeSplitPerformanceDashboard = withCodeSplitting(
  () => import('./PerformanceDashboard'),
  { delay: 300 }
)

export const CodeSplitDistributionCharts = withCodeSplitting(
  () => import('./DistributionCharts'),
  { delay: 250 }
)

export const CodeSplitPerformanceLeaderboard = withCodeSplitting(
  () => import('./PerformanceLeaderboard'),
  { delay: 250 }
)

export const CodeSplitInteractiveChart = withCodeSplitting(
  () => import('./InteractiveChart'),
  { delay: 200 }
)

export const CodeSplitVirtualizedProxyList = withCodeSplitting(
  () => import('./VirtualizedProxyList'),
  { delay: 150 }
)

export const CodeSplitAdvancedExportModal = withCodeSplitting(
  () => import('./AdvancedExportModal'),
  { delay: 100 }
)

// Hook for preloading components
export function usePreloadComponent(importFn: () => Promise<any>) {
  const [isPreloaded, setIsPreloaded] = React.useState(false)
  const [isPreloading, setIsPreloading] = React.useState(false)

  const preload = React.useCallback(async () => {
    if (isPreloaded || isPreloading) return

    setIsPreloading(true)
    try {
      await importFn()
      setIsPreloaded(true)
    } catch (error) {
      console.error('Preload error:', error)
    } finally {
      setIsPreloading(false)
    }
  }, [importFn, isPreloaded, isPreloading])

  return { preload, isPreloaded, isPreloading }
}

// Hook for dynamic imports with error handling
export function useDynamicImport<T>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: { preload?: boolean; onError?: (error: Error) => void } = {}
) {
  const [Component, setComponent] = React.useState<ComponentType<T> | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const loadComponent = React.useCallback(async () => {
    if (Component || loading) return

    setLoading(true)
    setError(null)

    try {
      const importedModule = await importFn()
      setComponent(() => importedModule.default)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to load component')
      setError(errorObj)
      options.onError?.(errorObj)
    } finally {
      setLoading(false)
    }
  }, [importFn, Component, loading, options])

  // Preload if requested
  React.useEffect(() => {
    if (options.preload) {
      loadComponent()
    }
  }, [loadComponent, options.preload])

  return {
    Component,
    loading,
    error,
    loadComponent
  }
}

// Component for conditional loading
export function ConditionalLoader<T extends object>({
  condition,
  importFn,
  fallback,
  errorFallback,
  onError,
  ...props
}: {
  condition: boolean
  importFn: () => Promise<{ default: ComponentType<T> }>
  fallback?: ReactNode
  errorFallback?: ReactNode
  onError?: (error: Error) => void
} & T) {
  const { Component, loading, error, loadComponent } = useDynamicImport(importFn, { onError })

  React.useEffect(() => {
    if (condition && !Component && !loading) {
      loadComponent()
    }
  }, [condition, Component, loading, loadComponent])

  if (!condition) {
    return fallback || null
  }

  if (loading) {
    return <LoadingComponent />
  }

  if (error) {
    return errorFallback || (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Failed to load component</p>
        </div>
      </div>
    )
  }

  if (!Component) {
    return fallback || null
  }

  return <Component {...(props as T)} />
}

export default withCodeSplitting
