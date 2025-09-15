'use client'

import { useState, useEffect } from 'react'
import { 
  Sparkles, 
  Keyboard, 
  Eye, 
  Zap, 
  Heart,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { KeyboardShortcut, useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAccessibility } from '@/components/AccessibilityProvider'
import KeyboardShortcutsPanel from './KeyboardShortcutsPanel'
import { AccessibilityPanel } from './AccessibilityProvider'
import Tooltip, { ShortcutTooltip, StatusTooltip } from './Tooltip'
import { 
  LoadingSpinner, 
  LoadingButton, 
  StatusIndicator, 
  ProgressBar,
  LoadingOverlay,
  SkeletonCard,
  FloatingActionButton
} from './LoadingStates'

interface UXPolishTabProps {
  proxies: Proxy[]
  onProxyAction: (action: string, proxyId?: number) => void
}

export default function UXPolishTab({ proxies, onProxyAction }: UXPolishTabProps) {
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showAccessibility, setShowAccessibility] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoProgress, setDemoProgress] = useState(0)
  const [demoStatus, setDemoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const { announceToScreenReader } = useAccessibility()

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      key: '?',
      description: 'Show/hide keyboard shortcuts',
      category: 'Help',
      action: () => {
        setShowShortcuts(!showShortcuts)
        announceToScreenReader(showShortcuts ? 'Shortcuts panel closed' : 'Shortcuts panel opened')
      }
    },
    {
      key: 'a',
      ctrlKey: true,
      description: 'Select all proxies',
      category: 'Selection',
      action: () => {
        onProxyAction('selectAll')
        announceToScreenReader('All proxies selected')
      }
    },
    {
      key: 'd',
      ctrlKey: true,
      description: 'Deselect all proxies',
      category: 'Selection',
      action: () => {
        onProxyAction('deselectAll')
        announceToScreenReader('All proxies deselected')
      },
      preventDefault: true
    },
    {
      key: 't',
      ctrlKey: true,
      description: 'Test selected proxies',
      category: 'Actions',
      action: () => {
        onProxyAction('testSelected')
        announceToScreenReader('Testing selected proxies')
      },
      preventDefault: true
    },
    {
      key: 'Delete',
      description: 'Delete selected proxies',
      category: 'Actions',
      action: () => {
        onProxyAction('deleteSelected')
        announceToScreenReader('Deleted selected proxies')
      }
    },
    {
      key: 'f',
      ctrlKey: true,
      description: 'Focus search box',
      category: 'Navigation',
      action: () => {
        const searchBox = document.querySelector('input[type="search"]') as HTMLInputElement
        if (searchBox) {
          searchBox.focus()
          announceToScreenReader('Search box focused')
        }
      },
      preventDefault: true
    },
    {
      key: 'Escape',
      description: 'Close modals and panels',
      category: 'Navigation',
      action: () => {
        setShowShortcuts(false)
        setShowAccessibility(false)
        announceToScreenReader('Panels closed')
      }
    },
    {
      key: 'r',
      ctrlKey: true,
      description: 'Refresh proxy list',
      category: 'Actions',
      action: () => {
        onProxyAction('refresh')
        announceToScreenReader('Proxy list refreshed')
      },
      preventDefault: true
    }
  ]

  useKeyboardShortcuts(shortcuts)

  // Demo progress simulation
  useEffect(() => {
    if (demoLoading) {
      const interval = setInterval(() => {
        setDemoProgress(prev => {
          if (prev >= 100) {
            setDemoLoading(false)
            setDemoStatus('success')
            announceToScreenReader('Demo completed successfully')
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 200)

      return () => clearInterval(interval)
    }
  }, [demoLoading, announceToScreenReader])

  const handleDemoStart = () => {
    setDemoLoading(true)
    setDemoStatus('loading')
    setDemoProgress(0)
    announceToScreenReader('Demo started')
  }

  const handleDemoReset = () => {
    setDemoLoading(false)
    setDemoStatus('idle')
    setDemoProgress(0)
    announceToScreenReader('Demo reset')
  }

  const uxFeatures = [
    {
      icon: <Keyboard className="h-6 w-6 text-blue-500" />,
      title: 'Keyboard Shortcuts',
      description: 'Navigate efficiently with customizable keyboard shortcuts',
      status: 'active',
      shortcuts: shortcuts.length,
      demo: () => setShowShortcuts(true)
    },
    {
      icon: <Eye className="h-6 w-6 text-purple-500" />,
      title: 'Accessibility Features',
      description: 'High contrast, screen reader support, and keyboard navigation',
      status: 'active',
      features: ['High Contrast', 'Large Text', 'Screen Reader', 'Keyboard Nav'],
      demo: () => setShowAccessibility(true)
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: 'Smart Tooltips',
      description: 'Context-aware tooltips with keyboard shortcut hints',
      status: 'active',
      features: ['Auto-positioning', 'Interactive', 'Keyboard hints', 'Status indicators']
    },
    {
      icon: <Heart className="h-6 w-6 text-red-500" />,
      title: 'Loading States',
      description: 'Beautiful loading animations and progress indicators',
      status: 'demo',
      features: ['Spinners', 'Skeletons', 'Progress bars', 'Status indicators']
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Sparkles className="h-6 w-6" />
              <span>User Experience Polish</span>
            </h2>
            <p className="text-pink-100 mt-1">
              Enhanced UX với keyboard shortcuts, tooltips, loading states và accessibility
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <ShortcutTooltip
              shortcut="?"
              description="Show keyboard shortcuts"
            >
              <button
                onClick={() => setShowShortcuts(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
              >
                <Keyboard className="h-4 w-4" />
                <span>Shortcuts</span>
              </button>
            </ShortcutTooltip>

            <Tooltip content="Accessibility settings">
              <button
                onClick={() => setShowAccessibility(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>A11y</span>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-sm text-pink-100">Shortcuts</div>
            <div className="text-2xl font-bold">{shortcuts.length}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-sm text-pink-100">Tooltips</div>
            <div className="text-2xl font-bold">Active</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-sm text-pink-100">Accessibility</div>
            <div className="text-2xl font-bold">A11y</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-sm text-pink-100">Loading States</div>
            <div className="text-2xl font-bold">8 Types</div>
          </div>
        </div>
      </div>

      {/* UX Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {uxFeatures.map((feature, index) => (
          <div key={index} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {feature.icon}
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                </div>
              </div>
              
              <StatusTooltip
                status={feature.status === 'active' ? 'success' : 'info'}
                details={`Status: ${feature.status}`}
              >
                <StatusIndicator
                  status={feature.status === 'active' ? 'success' : 'idle'}
                  message={feature.status}
                />
              </StatusTooltip>
            </div>

            {/* Feature Details */}
            <div className="space-y-3">
              {'shortcuts' in feature && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available shortcuts:</span>
                  <span className="font-medium">{feature.shortcuts}</span>
                </div>
              )}

              {'features' in feature && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Features:</div>
                  <div className="flex flex-wrap gap-2">
                    {feature.features?.map((feat, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Demo Button */}
              {feature.demo && (
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={feature.demo}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Try Demo
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Demo Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Play className="h-5 w-5 text-green-500" />
          <span>Interactive Loading States Demo</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Loading Buttons */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Loading Buttons</h4>
            <div className="space-y-2">
              <LoadingButton
                isLoading={demoLoading}
                onClick={handleDemoStart}
                disabled={demoLoading}
                variant="primary"
              >
                Start Demo
              </LoadingButton>
              
              <LoadingButton
                isLoading={false}
                onClick={handleDemoReset}
                variant="secondary"
              >
                Reset Demo
              </LoadingButton>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Progress Indicators</h4>
            <div className="space-y-3">
              <ProgressBar
                progress={demoProgress}
                color="blue"
                animated={demoLoading}
              />
              
              <StatusIndicator
                status={demoStatus}
                message={
                  demoStatus === 'idle' ? 'Ready to start' :
                  demoStatus === 'loading' ? 'Processing...' :
                  demoStatus === 'success' ? 'Completed!' : 'Error occurred'
                }
                animated={demoLoading}
              />
            </div>
          </div>

          {/* Loading Overlays */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Loading Overlays</h4>
            <LoadingOverlay
              isLoading={demoLoading}
              message="Processing demo..."
            >
              <SkeletonCard />
            </LoadingOverlay>
          </div>
        </div>
      </div>

      {/* Tooltip Examples */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-500" />
          <span>Tooltip Examples</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Basic Tooltip */}
          <div className="text-center">
            <h4 className="font-medium text-gray-700 mb-3">Basic Tooltip</h4>
            <Tooltip content="This is a basic tooltip with helpful information">
              <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                Hover me
              </button>
            </Tooltip>
          </div>

          {/* Shortcut Tooltip */}
          <div className="text-center">
            <h4 className="font-medium text-gray-700 mb-3">Shortcut Tooltip</h4>
            <ShortcutTooltip
              shortcut="Ctrl + A"
              description="Select all items"
            >
              <button className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors">
                Select All
              </button>
            </ShortcutTooltip>
          </div>

          {/* Status Tooltip */}
          <div className="text-center">
            <h4 className="font-medium text-gray-700 mb-3">Status Tooltip</h4>
            <StatusTooltip
              status="success"
              details="All systems operational"
            >
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto cursor-pointer" />
            </StatusTooltip>
          </div>

          {/* Interactive Tooltip */}
          <div className="text-center">
            <h4 className="font-medium text-gray-700 mb-3">Interactive</h4>
            <Tooltip
              content={
                <div className="p-2">
                  <p className="mb-2">Interactive tooltip</p>
                  <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                    Click me
                  </button>
                </div>
              }
              interactive={true}
              trigger="click"
            >
              <button className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors">
                Click me
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Floating Action Button Demo */}
      <FloatingActionButton
        icon={<Heart className="h-5 w-5" />}
        onClick={() => announceToScreenReader('Floating action button clicked')}
        position="bottom-right"
        color="red"
        tooltip="Like this feature!"
        isLoading={false}
      />

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel
        shortcuts={shortcuts}
        isVisible={showShortcuts}
        onToggleVisibility={() => setShowShortcuts(!showShortcuts)}
        onUpdateConfig={() => {}}
      />

      {/* Accessibility Panel */}
      <AccessibilityPanel
        isVisible={showAccessibility}
        onToggle={() => setShowAccessibility(!showAccessibility)}
      />
    </div>
  )
}
