'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Eye, EyeOff, Type, Contrast, Volume2, VolumeX, Keyboard } from 'lucide-react'

interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  screenReader: boolean
  keyboardNavigation: boolean
  soundEnabled: boolean
  fontSize: number
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSettings: (updates: Partial<AccessibilitySettings>) => void
  announceToScreenReader: (message: string) => void
  focusManagement: {
    trapFocus: (container: HTMLElement) => () => void
    restoreFocus: (element: HTMLElement | null) => void
    setFocusVisible: (visible: boolean) => void
  }
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null)

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: true,
  soundEnabled: true,
  fontSize: 16,
  colorBlindMode: 'none'
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS)
  const [focusVisible, setFocusVisible] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('accessibility-settings')
      if (saved) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) })
      }
    } catch (error) {
      console.warn('Failed to load accessibility settings:', error)
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('accessibility-settings', JSON.stringify(settings))
    } catch (error) {
      console.warn('Failed to save accessibility settings:', error)
    }
  }, [settings])

  // Apply CSS custom properties for accessibility
  useEffect(() => {
    const root = document.documentElement

    // Font size
    root.style.setProperty('--base-font-size', `${settings.fontSize}px`)

    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Large text mode
    if (settings.largeText) {
      root.classList.add('large-text')
    } else {
      root.classList.remove('large-text')
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    // Color blind mode
    root.setAttribute('data-colorblind-mode', settings.colorBlindMode)

    // Focus visible
    if (focusVisible) {
      root.classList.add('focus-visible')
    } else {
      root.classList.remove('focus-visible')
    }
  }, [settings, focusVisible])

  // Detect system preferences
  useEffect(() => {
    // Detect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setSettings(prev => ({ ...prev, reducedMotion: true }))
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    if (mediaQuery.matches) {
      setSettings(prev => ({ ...prev, reducedMotion: true }))
    }

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Keyboard navigation detection
  useEffect(() => {
    let isUsingKeyboard = false

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        isUsingKeyboard = true
        setFocusVisible(true)
      }
    }

    const handleMouseDown = () => {
      if (isUsingKeyboard) {
        isUsingKeyboard = false
        setFocusVisible(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }

  // Screen reader announcements
  const announceToScreenReader = (message: string) => {
    if (!settings.screenReader) return

    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  // Focus management utilities
  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }

      if (e.key === 'Escape') {
        const closeButton = container.querySelector('[data-close]') as HTMLElement
        if (closeButton) {
          closeButton.click()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    // Focus first element
    if (firstElement) {
      firstElement.focus()
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }

  const restoreFocus = (element: HTMLElement | null) => {
    if (element && typeof element.focus === 'function') {
      element.focus()
    }
  }

  const contextValue: AccessibilityContextType = {
    settings,
    updateSettings,
    announceToScreenReader,
    focusManagement: {
      trapFocus,
      restoreFocus,
      setFocusVisible
    }
  }

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      
      {/* Screen reader only content */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" id="accessibility-announcements" />
      
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}

// Accessibility control panel
export function AccessibilityPanel({ 
  isVisible, 
  onToggle 
}: { 
  isVisible: boolean
  onToggle: () => void 
}) {
  const { settings, updateSettings } = useAccessibility()

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 left-4 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors z-40"
        aria-label="Open accessibility settings"
      >
        <Eye className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <Eye className="h-5 w-5 text-purple-500" />
            <span>Accessibility</span>
          </h3>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close accessibility settings"
          >
            <EyeOff className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Contrast className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">High Contrast</span>
          </div>
          <button
            onClick={() => updateSettings({ highContrast: !settings.highContrast })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.highContrast ? 'bg-purple-600' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={settings.highContrast}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.highContrast ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Large Text */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Type className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Large Text</span>
          </div>
          <button
            onClick={() => updateSettings({ largeText: !settings.largeText })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.largeText ? 'bg-purple-600' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={settings.largeText}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.largeText ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 text-gray-500">🌊</div>
            <span className="text-sm font-medium">Reduce Motion</span>
          </div>
          <button
            onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.reducedMotion ? 'bg-purple-600' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={settings.reducedMotion}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Sound */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {settings.soundEnabled ? <Volume2 className="h-4 w-4 text-gray-500" /> : <VolumeX className="h-4 w-4 text-gray-500" />}
            <span className="text-sm font-medium">Sound Effects</span>
          </div>
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.soundEnabled ? 'bg-purple-600' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={settings.soundEnabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Keyboard Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Keyboard className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Keyboard Navigation</span>
          </div>
          <button
            onClick={() => updateSettings({ keyboardNavigation: !settings.keyboardNavigation })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.keyboardNavigation ? 'bg-purple-600' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={settings.keyboardNavigation}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.keyboardNavigation ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Size: {settings.fontSize}px
          </label>
          <input
            type="range"
            min="12"
            max="24"
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Color Blind Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color Blind Support
          </label>
          <select
            value={settings.colorBlindMode}
            onChange={(e) => updateSettings({ 
              colorBlindMode: e.target.value as AccessibilitySettings['colorBlindMode']
            })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="none">None</option>
            <option value="protanopia">Protanopia (Red-blind)</option>
            <option value="deuteranopia">Deuteranopia (Green-blind)</option>
            <option value="tritanopia">Tritanopia (Blue-blind)</option>
          </select>
        </div>
      </div>
    </div>
  )
}
