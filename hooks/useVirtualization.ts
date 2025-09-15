'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

export interface VirtualizationConfig {
  itemHeight: number
  containerHeight: number
  overscan: number // Number of items to render outside visible area
  threshold: number // Minimum items to enable virtualization
}

export interface VirtualItem {
  index: number
  start: number
  end: number
  size: number
}

export function useVirtualization<T>(
  items: T[],
  config: VirtualizationConfig
) {
  const [scrollTop, setScrollTop] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollElementRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const {
    itemHeight,
    containerHeight,
    overscan,
    threshold
  } = config

  // Calculate if virtualization should be enabled
  const shouldVirtualize = items.length > threshold

  // Calculate total height
  const totalHeight = useMemo(() => {
    return items.length * itemHeight
  }, [items.length, itemHeight])

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (!shouldVirtualize) {
      return { start: 0, end: items.length }
    }

    const start = Math.floor(scrollTop / itemHeight)
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    )

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length, end + overscan)
    }
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length, shouldVirtualize])

  // Get visible items
  const visibleItems = useMemo(() => {
    if (!shouldVirtualize) {
      return items.map((item, index) => ({
        item,
        index,
        style: {}
      }))
    }

    const result = []
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      result.push({
        item: items[i],
        index: i,
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight
        }
      })
    }
    return result
  }, [items, visibleRange, itemHeight, shouldVirtualize])

  // Handle scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop
    setScrollTop(scrollTop)
    setIsScrolling(true)

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Set new timeout to detect scroll end
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 150)
  }, [])

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    if (!scrollElementRef.current) return

    let scrollTop = 0
    
    switch (align) {
      case 'start':
        scrollTop = index * itemHeight
        break
      case 'center':
        scrollTop = index * itemHeight - (containerHeight - itemHeight) / 2
        break
      case 'end':
        scrollTop = index * itemHeight - containerHeight + itemHeight
        break
    }

    scrollTop = Math.max(0, Math.min(scrollTop, totalHeight - containerHeight))
    
    scrollElementRef.current.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    })
  }, [itemHeight, containerHeight, totalHeight])

  // Get container props
  const getContainerProps = useCallback(() => ({
    ref: scrollElementRef,
    onScroll: handleScroll,
    style: {
      height: containerHeight,
      overflow: 'auto' as const,
      position: 'relative' as const
    }
  }), [handleScroll, containerHeight])

  // Get content props
  const getContentProps = useCallback(() => ({
    style: {
      height: shouldVirtualize ? totalHeight : 'auto',
      position: 'relative' as const
    }
  }), [totalHeight, shouldVirtualize])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return {
    visibleItems,
    totalHeight,
    isScrolling,
    shouldVirtualize,
    scrollToIndex,
    getContainerProps,
    getContentProps,
    visibleRange
  }
}
