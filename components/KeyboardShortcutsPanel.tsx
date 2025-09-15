'use client'

import React, { useState } from 'react'
import { 
  Keyboard, 
  Search, 
  X, 
  Command,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'
import { KeyboardShortcut, useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import Tooltip from './Tooltip'

interface KeyboardShortcutsPanelProps {
  shortcuts: KeyboardShortcut[]
  isVisible: boolean
  onToggleVisibility: () => void
  onUpdateConfig: (config: any) => void
}

export default function KeyboardShortcutsPanel({
  shortcuts,
  isVisible,
  onToggleVisibility,
  onUpdateConfig
}: KeyboardShortcutsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const { formatShortcut, getShortcutsByCategory } = useKeyboardShortcuts(shortcuts)
  const categorizedShortcuts = getShortcutsByCategory()
  const categories = ['all', ...Object.keys(categorizedShortcuts)]

  // Filter shortcuts based on search and category
  const filteredShortcuts = shortcuts.filter(shortcut => {
    const matchesSearch = searchTerm === '' || 
      shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.key.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || shortcut.category === selectedCategory
    
    return matchesSearch && matchesCategory && !shortcut.disabled
  })

  const getKeyIcon = (key: string) => {
    switch (key.toLowerCase()) {
      case 'enter': return '↵'
      case 'escape': return '⎋'
      case 'space': return '␣'
      case 'tab': return '⇥'
      case 'backspace': return '⌫'
      case 'delete': return '⌦'
      case 'arrowup': return '↑'
      case 'arrowdown': return '↓'
      case 'arrowleft': return '←'
      case 'arrowright': return '→'
      default: return key.toUpperCase()
    }
  }

  const formatShortcutForDisplay = (shortcut: KeyboardShortcut) => {
    const parts = []
    
    if (shortcut.ctrlKey) parts.push('Ctrl')
    if (shortcut.altKey) parts.push('Alt')
    if (shortcut.shiftKey) parts.push('Shift')
    if (shortcut.metaKey) parts.push('Cmd')
    
    parts.push(getKeyIcon(shortcut.key))
    
    return parts
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'navigation': return '🧭'
      case 'editing': return '✏️'
      case 'selection': return '☑️'
      case 'actions': return '⚡'
      case 'view': return '👁️'
      case 'system': return '⚙️'
      default: return '📋'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'navigation': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'editing': return 'text-green-600 bg-green-50 border-green-200'
      case 'selection': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'actions': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'view': return 'text-indigo-600 bg-indigo-50 border-indigo-200'
      case 'system': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (!isVisible) {
    return (
      <Tooltip content="Keyboard Shortcuts (Press ? to toggle)" position="left">
        <button
          onClick={onToggleVisibility}
          className="fixed bottom-20 right-4 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-colors z-40"
        >
          <Keyboard className="h-5 w-5" />
        </button>
      </Tooltip>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Keyboard className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Keyboard Shortcuts</h2>
              <p className="text-sm text-gray-600">
                {filteredShortcuts.length} shortcuts available
              </p>
            </div>
          </div>
          
          <button
            onClick={onToggleVisibility}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search shortcuts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex space-x-2 overflow-x-auto">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {category === 'all' ? '📋 All' : `${getCategoryIcon(category)} ${category}`}
                  <span className="ml-1 text-xs text-gray-500">
                    ({category === 'all' ? shortcuts.length : (categorizedShortcuts[category]?.length || 0)})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredShortcuts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Keyboard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No shortcuts found</h3>
              <p className="text-sm">
                {searchTerm ? 'Try adjusting your search term' : 'No shortcuts available for this category'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredShortcuts.map((shortcut, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {shortcut.description}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(shortcut.category)}`}>
                          {getCategoryIcon(shortcut.category)} {shortcut.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Shortcut Keys */}
                    <div className="flex items-center space-x-1">
                      {formatShortcutForDisplay(shortcut).map((part, partIndex) => (
                        <React.Fragment key={partIndex}>
                          <kbd className="inline-flex items-center px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono font-medium text-gray-700">
                            {part}
                          </kbd>
                          {partIndex < formatShortcutForDisplay(shortcut).length - 1 && (
                            <span className="text-gray-400 text-sm">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Command className="h-4 w-4" />
                <span>Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">?</kbd> to toggle this panel</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd> to close</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {filteredShortcuts.length} of {shortcuts.length} shortcuts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Compact shortcuts helper component
export function ShortcutsHelper({ 
  shortcuts,
  maxDisplay = 3,
  className = ''
}: {
  shortcuts: KeyboardShortcut[]
  maxDisplay?: number
  className?: string
}) {
  const [showAll, setShowAll] = useState(false)
  const displayShortcuts = showAll ? shortcuts : shortcuts.slice(0, maxDisplay)

  return (
    <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">Quick Actions</h4>
        {shortcuts.length > maxDisplay && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {showAll ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </button>
        )}
      </div>
      
      <div className="space-y-1">
        {displayShortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <span className="text-gray-600 truncate">{shortcut.description}</span>
            <div className="flex items-center space-x-1 ml-2">
              {shortcut.ctrlKey && <kbd className="px-1 bg-gray-200 rounded">Ctrl</kbd>}
              {shortcut.altKey && <kbd className="px-1 bg-gray-200 rounded">Alt</kbd>}
              {shortcut.shiftKey && <kbd className="px-1 bg-gray-200 rounded">Shift</kbd>}
              <kbd className="px-1 bg-gray-200 rounded">{shortcut.key.toUpperCase()}</kbd>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
