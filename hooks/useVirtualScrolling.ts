'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface VirtualScrollingOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
  threshold?: number
  enableSmoothScrolling?: boolean
  enableMomentumScrolling?: boolean
}

interface VirtualScrollingState {
  startIndex: number
  endIndex: number
  visibleItems: number[]
  totalHeight: number
  offsetY: number
  isScrolling: boolean
  scrollDirection: 'up' | 'down' | null
}

interface MomentumState {
  velocity: number
  lastTime: number
  lastScrollTop: number
}

export function useVirtualScrolling<T>(
  items: T[],
  options: VirtualScrollingOptions
) {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    threshold = 0.1,
    enableSmoothScrolling = true,
    enableMomentumScrolling = true
  } = options

  const [scrollTop, setScrollTop] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastScrollTopRef = useRef(0)
  const momentumRef = useRef<MomentumState>({ velocity: 0, lastTime: 0, lastScrollTop: 0 })

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length])

  // Calculate visible items
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange
    return items.slice(startIndex, endIndex + 1)
  }, [items, visibleRange])

  // Calculate total height
  const totalHeight = useMemo(() => {
    return items.length * itemHeight
  }, [items.length, itemHeight])

  // Calculate offset
  const offsetY = useMemo(() => {
    return visibleRange.startIndex * itemHeight
  }, [visibleRange.startIndex, itemHeight])

  // Handle scroll events
  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLDivElement
    const newScrollTop = target.scrollTop
    
    // Determine scroll direction
    if (newScrollTop > lastScrollTopRef.current) {
      setScrollDirection('down')
    } else if (newScrollTop < lastScrollTopRef.current) {
      setScrollDirection('up')
    }
    
    lastScrollTopRef.current = newScrollTop
    setScrollTop(newScrollTop)
    setIsScrolling(true)

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Set timeout to detect end of scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
      setScrollDirection(null)
    }, 150)
  }, [])

  // Handle momentum scrolling
  const handleMomentumScroll = useCallback((event: Event) => {
    if (!enableMomentumScrolling) return

    const target = event.target as HTMLDivElement
    const currentTime = Date.now()
    const currentScrollTop = target.scrollTop
    
    if (momentumRef.current.lastTime > 0) {
      const deltaTime = currentTime - momentumRef.current.lastTime
      const deltaScroll = currentScrollTop - momentumRef.current.lastScrollTop
      
      if (deltaTime > 0) {
        momentumRef.current.velocity = deltaScroll / deltaTime
      }
    }
    
    momentumRef.current.lastTime = currentTime
    momentumRef.current.lastScrollTop = currentScrollTop
  }, [enableMomentumScrolling])

  // Scroll to specific item
  const scrollToItem = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.current) return
    
    const targetScrollTop = index * itemHeight
    containerRef.current.scrollTo({
      top: targetScrollTop,
      behavior: behavior
    })
  }, [itemHeight])

  // Scroll to top
  const scrollToTop = useCallback((behavior: ScrollBehavior = 'smooth') => {
    scrollToItem(0, behavior)
  }, [scrollToItem])

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    scrollToItem(items.length - 1, behavior)
  }, [scrollToItem, items.length])

  // Scroll to specific position
  const scrollToPosition = useCallback((position: number, behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.current) return
    
    containerRef.current.scrollTo({
      top: position,
      behavior: behavior
    })
  }, [])

  // Get item position
  const getItemPosition = useCallback((index: number) => {
    return index * itemHeight
  }, [itemHeight])

  // Check if item is visible
  const isItemVisible = useCallback((index: number) => {
    const { startIndex, endIndex } = visibleRange
    return index >= startIndex && index <= endIndex
  }, [visibleRange])

  // Get visible item indices
  const getVisibleIndices = useCallback(() => {
    const { startIndex, endIndex } = visibleRange
    return Array.from({ length: endIndex - startIndex + 1 }, (_, i) => startIndex + i)
  }, [visibleRange])

  // Setup scroll listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    container.addEventListener('scroll', handleMomentumScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      container.removeEventListener('scroll', handleMomentumScroll)
    }
  }, [handleScroll, handleMomentumScroll])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    const { startIndex, endIndex } = visibleRange
    const visibleCount = endIndex - startIndex + 1
    const totalCount = items.length
    const renderRatio = visibleCount / totalCount
    
    return {
      visibleCount,
      totalCount,
      renderRatio,
      startIndex,
      endIndex,
      isScrolling,
      scrollDirection
    }
  }, [visibleRange, items.length, isScrolling, scrollDirection])

  return {
    // State
    scrollTop,
    isScrolling,
    scrollDirection,
    visibleItems,
    visibleRange,
    totalHeight,
    offsetY,
    
    // Refs
    containerRef,
    
    // Methods
    scrollToItem,
    scrollToTop,
    scrollToBottom,
    scrollToPosition,
    getItemPosition,
    isItemVisible,
    getVisibleIndices,
    
    // Performance metrics
    performanceMetrics
  }
}

// Hook for infinite scrolling
export function useInfiniteScroll<T>(
  items: T[],
  options: VirtualScrollingOptions & {
    loadMore?: () => Promise<void>
    hasMore?: boolean
    threshold?: number
  }
) {
  const {
    loadMore,
    hasMore = true,
    threshold = 0.8
  } = options

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const virtualScrolling = useVirtualScrolling(items, options)

  const handleLoadMore = useCallback(async () => {
    if (!loadMore || !hasMore || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      await loadMore()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more items'))
    } finally {
      setIsLoading(false)
    }
  }, [loadMore, hasMore, isLoading])

  // Check if we need to load more
  useEffect(() => {
    const { endIndex } = virtualScrolling.visibleRange
    const shouldLoadMore = endIndex >= items.length * threshold

    if (shouldLoadMore && hasMore && !isLoading) {
      handleLoadMore()
    }
  }, [virtualScrolling.visibleRange, items.length, threshold, hasMore, isLoading, handleLoadMore])

  return {
    ...virtualScrolling,
    isLoading,
    error,
    hasMore,
    loadMore: handleLoadMore
  }
}

export default useVirtualScrolling
