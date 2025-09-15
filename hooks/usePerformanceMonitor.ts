'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface PerformanceMetrics {
  // Rendering performance
  renderTime: number
  reRenderCount: number
  lastRenderTime: number
  
  // Memory usage
  memoryUsage: number
  memoryPeak: number
  
  // Component lifecycle
  mountTime: number
  updateCount: number
  
  // User interactions
  interactionCount: number
  averageInteractionTime: number
  
  // Network/async operations
  asyncOperationCount: number
  averageAsyncTime: number
  
  // Frame rate
  fps: number
  frameDrops: number
}

export interface PerformanceConfig {
  enableMemoryTracking: boolean
  enableRenderTracking: boolean
  enableInteractionTracking: boolean
  enableFPSTracking: boolean
  sampleRate: number // How often to collect metrics (ms)
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enableMemoryTracking: true,
  enableRenderTracking: true,
  enableInteractionTracking: true,
  enableFPSTracking: true,
  sampleRate: 1000
}

export function usePerformanceMonitor(
  componentName: string,
  config: PerformanceConfig = DEFAULT_CONFIG
) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    reRenderCount: 0,
    lastRenderTime: 0,
    memoryUsage: 0,
    memoryPeak: 0,
    mountTime: 0,
    updateCount: 0,
    interactionCount: 0,
    averageInteractionTime: 0,
    asyncOperationCount: 0,
    averageAsyncTime: 0,
    fps: 60,
    frameDrops: 0
  })

  const metricsRef = useRef(metrics)
  const renderStartTime = useRef<number>(0)
  const mountStartTime = useRef<number>(Date.now())
  const interactionTimes = useRef<number[]>([])
  const asyncTimes = useRef<number[]>([])
  const frameRef = useRef<number>(0)
  const lastFrameTime = useRef<number>(performance.now())
  const frameCount = useRef<number>(0)
  const droppedFrames = useRef<number>(0)

  // Update metrics ref when state changes
  useEffect(() => {
    metricsRef.current = metrics
  }, [metrics])

  // Render time tracking
  const startRender = useCallback(() => {
    if (config.enableRenderTracking) {
      renderStartTime.current = performance.now()
    }
  }, [config.enableRenderTracking])

  const endRender = useCallback(() => {
    if (config.enableRenderTracking && renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current
      
      setMetrics(prev => ({
        ...prev,
        renderTime,
        lastRenderTime: renderTime,
        reRenderCount: prev.reRenderCount + 1,
        updateCount: prev.updateCount + 1
      }))
    }
  }, [config.enableRenderTracking])

  // Memory tracking
  const updateMemoryMetrics = useCallback(() => {
    if (config.enableMemoryTracking && 'memory' in performance) {
      const memory = (performance as any).memory
      const currentUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage: currentUsage,
        memoryPeak: Math.max(prev.memoryPeak, currentUsage)
      }))
    }
  }, [config.enableMemoryTracking])

  // Interaction tracking
  const trackInteraction = useCallback((interactionName: string) => {
    if (!config.enableInteractionTracking) return () => {}

    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      interactionTimes.current.push(duration)
      
      // Keep only last 100 interactions for average calculation
      if (interactionTimes.current.length > 100) {
        interactionTimes.current = interactionTimes.current.slice(-100)
      }
      
      const averageTime = interactionTimes.current.reduce((sum, time) => sum + time, 0) / interactionTimes.current.length
      
      setMetrics(prev => ({
        ...prev,
        interactionCount: prev.interactionCount + 1,
        averageInteractionTime: averageTime
      }))
    }
  }, [config.enableInteractionTracking])

  // Async operation tracking
  const trackAsyncOperation = useCallback(<T>(
    operation: Promise<T>,
    operationName?: string
  ): Promise<T> => {
    const startTime = performance.now()
    
    return operation
      .then((result) => {
        const duration = performance.now() - startTime
        asyncTimes.current.push(duration)
        
        // Keep only last 100 operations for average calculation
        if (asyncTimes.current.length > 100) {
          asyncTimes.current = asyncTimes.current.slice(-100)
        }
        
        const averageTime = asyncTimes.current.reduce((sum, time) => sum + time, 0) / asyncTimes.current.length
        
        setMetrics(prev => ({
          ...prev,
          asyncOperationCount: prev.asyncOperationCount + 1,
          averageAsyncTime: averageTime
        }))
        
        return result
      })
      .catch((error) => {
        const duration = performance.now() - startTime
        asyncTimes.current.push(duration)
        
        setMetrics(prev => ({
          ...prev,
          asyncOperationCount: prev.asyncOperationCount + 1
        }))
        
        throw error
      })
  }, [])

  // FPS tracking
  const trackFPS = useCallback(() => {
    if (!config.enableFPSTracking) return

    const currentTime = performance.now()
    const deltaTime = currentTime - lastFrameTime.current
    
    frameCount.current++
    
    // Calculate FPS every second
    if (deltaTime >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / deltaTime)
      const expectedFrames = Math.round(deltaTime / 16.67) // 60fps = 16.67ms per frame
      const dropped = Math.max(0, expectedFrames - frameCount.current)
      
      setMetrics(prev => ({
        ...prev,
        fps,
        frameDrops: prev.frameDrops + dropped
      }))
      
      frameCount.current = 0
      lastFrameTime.current = currentTime
    }
    
    frameRef.current = requestAnimationFrame(trackFPS)
  }, [config.enableFPSTracking])

  // Start FPS tracking
  useEffect(() => {
    if (config.enableFPSTracking) {
      frameRef.current = requestAnimationFrame(trackFPS)
    }
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [config.enableFPSTracking, trackFPS])

  // Periodic metrics collection
  useEffect(() => {
    const interval = setInterval(() => {
      updateMemoryMetrics()
    }, config.sampleRate)

    return () => clearInterval(interval)
  }, [config.sampleRate, updateMemoryMetrics])

  // Set mount time
  useEffect(() => {
    const mountTime = Date.now() - mountStartTime.current
    setMetrics(prev => ({ ...prev, mountTime }))
  }, [])

  // Performance warnings
  const getPerformanceWarnings = useCallback(() => {
    const warnings: string[] = []
    
    if (metrics.renderTime > 16) {
      warnings.push(`Slow render detected: ${metrics.renderTime.toFixed(2)}ms (target: <16ms)`)
    }
    
    if (metrics.reRenderCount > 10) {
      warnings.push(`High re-render count: ${metrics.reRenderCount} (consider memoization)`)
    }
    
    if (metrics.memoryUsage > 50) {
      warnings.push(`High memory usage: ${metrics.memoryUsage.toFixed(2)}MB`)
    }
    
    if (metrics.fps < 50) {
      warnings.push(`Low FPS detected: ${metrics.fps} (target: 60fps)`)
    }
    
    if (metrics.averageInteractionTime > 100) {
      warnings.push(`Slow interactions: ${metrics.averageInteractionTime.toFixed(2)}ms (target: <100ms)`)
    }
    
    return warnings
  }, [metrics])

  // Get performance score (0-100)
  const getPerformanceScore = useCallback(() => {
    let score = 100
    
    // Render performance (30%)
    if (metrics.renderTime > 16) score -= 30
    else if (metrics.renderTime > 10) score -= 15
    
    // Memory usage (20%)
    if (metrics.memoryUsage > 100) score -= 20
    else if (metrics.memoryUsage > 50) score -= 10
    
    // FPS (25%)
    if (metrics.fps < 30) score -= 25
    else if (metrics.fps < 50) score -= 15
    else if (metrics.fps < 55) score -= 5
    
    // Interaction responsiveness (25%)
    if (metrics.averageInteractionTime > 200) score -= 25
    else if (metrics.averageInteractionTime > 100) score -= 15
    else if (metrics.averageInteractionTime > 50) score -= 5
    
    return Math.max(0, Math.min(100, score))
  }, [metrics])

  // Export metrics
  const exportMetrics = useCallback(() => {
    const exportData = {
      component: componentName,
      timestamp: Date.now(),
      metrics,
      warnings: getPerformanceWarnings(),
      score: getPerformanceScore(),
      config
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-${componentName}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [componentName, metrics, getPerformanceWarnings, getPerformanceScore, config])

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setMetrics({
      renderTime: 0,
      reRenderCount: 0,
      lastRenderTime: 0,
      memoryUsage: 0,
      memoryPeak: 0,
      mountTime: 0,
      updateCount: 0,
      interactionCount: 0,
      averageInteractionTime: 0,
      asyncOperationCount: 0,
      averageAsyncTime: 0,
      fps: 60,
      frameDrops: 0
    })
    
    interactionTimes.current = []
    asyncTimes.current = []
    frameCount.current = 0
    droppedFrames.current = 0
  }, [])

  return {
    metrics,
    startRender,
    endRender,
    trackInteraction,
    trackAsyncOperation,
    getPerformanceWarnings,
    getPerformanceScore,
    exportMetrics,
    resetMetrics
  }
}
