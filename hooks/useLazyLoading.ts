'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface LazyLoadingConfig {
  threshold: number // Distance from viewport to trigger loading (0.0 - 1.0)
  rootMargin: string // Margin around root for early loading
  triggerOnce: boolean // Whether to stop observing after first load
}

const DEFAULT_CONFIG: LazyLoadingConfig = {
  threshold: 0.1,
  rootMargin: '50px',
  triggerOnce: true
}

export function useLazyLoading(config: LazyLoadingConfig = DEFAULT_CONFIG) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const elementRef = useRef<HTMLElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const { threshold, rootMargin, triggerOnce } = config

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            
            if (triggerOnce) {
              observerRef.current?.unobserve(element)
            }
          } else if (!triggerOnce) {
            setIsInView(false)
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [threshold, rootMargin, triggerOnce])

  const markAsLoaded = useCallback(() => {
    setIsLoaded(true)
    setError(null)
  }, [])

  const markAsError = useCallback((errorMessage: string) => {
    setError(errorMessage)
  }, [])

  return {
    elementRef,
    isLoaded,
    isInView,
    error,
    markAsLoaded,
    markAsError
  }
}

// Hook for lazy loading images
export function useLazyImage(src: string, config?: LazyLoadingConfig) {
  const { elementRef, isInView, isLoaded, error, markAsLoaded, markAsError } = useLazyLoading(config)
  const [imageSrc, setImageSrc] = useState<string>('')

  useEffect(() => {
    if (isInView && !isLoaded && !error) {
      const img = new Image()
      
      img.onload = () => {
        setImageSrc(src)
        markAsLoaded()
      }
      
      img.onerror = () => {
        markAsError('Failed to load image')
      }
      
      img.src = src
    }
  }, [isInView, isLoaded, error, src, markAsLoaded, markAsError])

  return {
    ref: elementRef,
    src: imageSrc,
    isLoaded,
    isInView,
    error
  }
}

// Hook for lazy loading components
export function useLazyComponent<T>(
  loadComponent: () => Promise<T>,
  config?: LazyLoadingConfig
) {
  const { elementRef, isInView, isLoaded, error, markAsLoaded, markAsError } = useLazyLoading(config)
  const [component, setComponent] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isInView && !isLoaded && !isLoading && !error) {
      setIsLoading(true)
      
      loadComponent()
        .then((loadedComponent) => {
          setComponent(loadedComponent)
          markAsLoaded()
        })
        .catch((err) => {
          markAsError(err.message || 'Failed to load component')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [isInView, isLoaded, isLoading, error, loadComponent, markAsLoaded, markAsError])

  return {
    ref: elementRef,
    component,
    isLoaded,
    isLoading,
    isInView,
    error
  }
}
