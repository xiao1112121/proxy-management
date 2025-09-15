'use client'

import { useEffect, useCallback, useRef } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  description: string
  category: string
  action: () => void
  disabled?: boolean
  preventDefault?: boolean
}

export interface KeyboardShortcutConfig {
  enableGlobal: boolean
  enableInInput: boolean
  showTooltips: boolean
}

const DEFAULT_CONFIG: KeyboardShortcutConfig = {
  enableGlobal: true,
  enableInInput: false,
  showTooltips: true
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  config: KeyboardShortcutConfig = DEFAULT_CONFIG
) {
  const shortcutsRef = useRef<KeyboardShortcut[]>(shortcuts)
  const configRef = useRef<KeyboardShortcutConfig>(config)

  // Update refs when props change
  useEffect(() => {
    shortcutsRef.current = shortcuts
    configRef.current = config
  }, [shortcuts, config])

  const isInputElement = useCallback((element: Element): boolean => {
    const tagName = element.tagName.toLowerCase()
    return ['input', 'textarea', 'select'].includes(tagName) ||
           element.getAttribute('contenteditable') === 'true'
  }, [])

  const matchesShortcut = useCallback((event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
    return event.key.toLowerCase() === shortcut.key.toLowerCase() &&
           !!event.ctrlKey === !!shortcut.ctrlKey &&
           !!event.altKey === !!shortcut.altKey &&
           !!event.shiftKey === !!shortcut.shiftKey &&
           !!event.metaKey === !!shortcut.metaKey
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const config = configRef.current
    const shortcuts = shortcutsRef.current

    // Skip if shortcuts are disabled globally
    if (!config.enableGlobal) return

    // Skip if in input element and not enabled for inputs
    const target = event.target as Element
    if (isInputElement(target) && !config.enableInInput) return

    // Find matching shortcut
    const matchedShortcut = shortcuts.find(shortcut => 
      !shortcut.disabled && matchesShortcut(event, shortcut)
    )

    if (matchedShortcut) {
      if (matchedShortcut.preventDefault !== false) {
        event.preventDefault()
        event.stopPropagation()
      }
      
      try {
        matchedShortcut.action()
      } catch (error) {
        console.error('Error executing keyboard shortcut:', error)
      }
    }
  }, [isInputElement, matchesShortcut])

  // Register global event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, { capture: true })
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [handleKeyDown])

  // Format shortcut for display
  const formatShortcut = useCallback((shortcut: KeyboardShortcut): string => {
    const parts: string[] = []
    
    if (shortcut.ctrlKey) parts.push('Ctrl')
    if (shortcut.altKey) parts.push('Alt')
    if (shortcut.shiftKey) parts.push('Shift')
    if (shortcut.metaKey) parts.push('Cmd')
    
    parts.push(shortcut.key.toUpperCase())
    
    return parts.join(' + ')
  }, [])

  // Get shortcuts by category
  const getShortcutsByCategory = useCallback(() => {
    const categories: Record<string, KeyboardShortcut[]> = {}
    
    shortcuts.forEach(shortcut => {
      if (!categories[shortcut.category]) {
        categories[shortcut.category] = []
      }
      categories[shortcut.category].push(shortcut)
    })
    
    return categories
  }, [shortcuts])

  // Check if shortcut is available
  const isShortcutAvailable = useCallback((key: string, modifiers: Partial<Pick<KeyboardShortcut, 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>>): boolean => {
    return !shortcuts.some(shortcut => 
      shortcut.key.toLowerCase() === key.toLowerCase() &&
      !!shortcut.ctrlKey === !!modifiers.ctrlKey &&
      !!shortcut.altKey === !!modifiers.altKey &&
      !!shortcut.shiftKey === !!modifiers.shiftKey &&
      !!shortcut.metaKey === !!modifiers.metaKey
    )
  }, [shortcuts])

  return {
    formatShortcut,
    getShortcutsByCategory,
    isShortcutAvailable
  }
}

// Hook for component-specific shortcuts
export function useComponentShortcuts(
  elementRef: React.RefObject<HTMLElement>,
  shortcuts: KeyboardShortcut[]
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const matchedShortcut = shortcuts.find(shortcut => 
      !shortcut.disabled &&
      event.key.toLowerCase() === shortcut.key.toLowerCase() &&
      !!event.ctrlKey === !!shortcut.ctrlKey &&
      !!event.altKey === !!shortcut.altKey &&
      !!event.shiftKey === !!shortcut.shiftKey &&
      !!event.metaKey === !!shortcut.metaKey
    )

    if (matchedShortcut) {
      if (matchedShortcut.preventDefault !== false) {
        event.preventDefault()
        event.stopPropagation()
      }
      
      matchedShortcut.action()
    }
  }, [shortcuts])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('keydown', handleKeyDown)
    
    return () => {
      element.removeEventListener('keydown', handleKeyDown)
    }
  }, [elementRef, handleKeyDown])
}
