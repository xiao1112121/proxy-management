'use client'

import React, { useCallback, useRef, useEffect } from 'react'

interface DebouncedCallbackOptions {
  delay?: number
  leading?: boolean
  trailing?: boolean
  maxWait?: number
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300,
  options: DebouncedCallbackOptions = {}
): T {
  const {
    leading = false,
    trailing = true,
    maxWait
  } = options

  const callbackRef = useRef(callback)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastCallTimeRef = useRef<number>(0)
  const lastInvokeTimeRef = useRef<number>(0)
  const lastArgsRef = useRef<Parameters<T> | undefined>(undefined)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTimeRef.current
    const timeSinceLastInvoke = now - lastInvokeTimeRef.current

    lastCallTimeRef.current = now
    lastArgsRef.current = args

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current)
    }

    // Leading edge
    if (leading && timeSinceLastCall >= delay) {
      lastInvokeTimeRef.current = now
      callbackRef.current(...args)
      return
    }

    // Set up the debounced call
    timeoutRef.current = setTimeout(() => {
      if (trailing) {
        lastInvokeTimeRef.current = Date.now()
        callbackRef.current(...args)
      }
    }, delay)

    // Set up max wait timeout
    if (maxWait && timeSinceLastInvoke >= maxWait) {
      lastInvokeTimeRef.current = Date.now()
      callbackRef.current(...args)
    } else if (maxWait) {
      maxTimeoutRef.current = setTimeout(() => {
        lastInvokeTimeRef.current = Date.now()
        callbackRef.current(...args)
      }, maxWait - timeSinceLastInvoke)
    }
  }, [delay, leading, trailing, maxWait]) as T

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

// Hook for debouncing values
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for debouncing async operations
export function useDebouncedAsyncCallback<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  delay: number = 300,
  options: DebouncedCallbackOptions = {}
): T {
  const debouncedCallback = useDebouncedCallback(callback, delay, options)
  
  return useCallback(async (...args: Parameters<T>) => {
    try {
      return await debouncedCallback(...args)
    } catch (error) {
      console.error('Debounced async callback error:', error)
      throw error
    }
  }, [debouncedCallback]) as T
}

// Hook for throttling callbacks
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const callbackRef = useRef(callback)
  const lastCallTimeRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTimeRef.current

    if (timeSinceLastCall >= delay) {
      lastCallTimeRef.current = now
      callbackRef.current(...args)
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        lastCallTimeRef.current = Date.now()
        callbackRef.current(...args)
      }, delay - timeSinceLastCall)
    }
  }, [delay]) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return throttledCallback
}

export default useDebouncedCallback
