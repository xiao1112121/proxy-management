'use client'

import { useState } from 'react'
import { 
  TestTube, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Play, 
  Settings,
  Clock,
  Target,
  Shield,
  Zap,
  Globe,
  Tag,
  Star,
  AlertTriangle
} from 'lucide-react'
import { TestScenario, TestStep, useAdvancedTesting } from '@/hooks/useAdvancedTesting'
import { LoadingButton, StatusIndicator } from './LoadingStates'
import Tooltip from './Tooltip'

interface TestScenarioManagerProps {
  onRunScenario: (scenarioIds: string[]) => void
}

export default function TestScenarioManager({ onRunScenario }: TestScenarioManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basic' | 'performance' | 'security' | 'reliability' | 'custom'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingScenario, setEditingScenario] = useState<TestScenario | null>(null)
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])

  const { scenarios, addTestScenario, getTestStatistics } = useAdvancedTesting()
  const stats = getTestStatistics()

  // Filter scenarios
  const filteredScenarios = scenarios.filter(scenario => {
    const matchesCategory = selectedCategory === 'all' || scenario.category === selectedCategory
    const matchesSearch = searchTerm === '' || 
      scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  const handleSelectScenario = (scenarioId: string, selected: boolean) => {
    setSelectedScenarios(prev => 
      selected 
        ? [...prev, scenarioId]
        : prev.filter(id => id !== scenarioId)
    )
  }

  const handleSelectAll = () => {
    const allSelected = selectedScenarios.length === filteredScenarios.length
    setSelectedScenarios(allSelected ? [] : filteredScenarios.map(s => s.id))
  }

  const handleDuplicateScenario = (scenario: TestScenario) => {
    const newScenario = {
      ...scenario,
      name: `${scenario.name} (Copy)`,
      category: 'custom' as const,
      isDefault: false
    }
    delete (newScenario as any).id
    delete (newScenario as any).createdAt
    addTestScenario(newScenario)
  }

  const getCategoryIcon = (category: TestScenario['category']) => {
    switch (category) {
      case 'basic':
        return <Globe className="h-4 w-4 text-green-500" />
      case 'performance':
        return <Zap className="h-4 w-4 text-yellow-500" />
      case 'security':
        return <Shield className="h-4 w-4 text-red-500" />
      case 'reliability':
        return <Target className="h-4 w-4 text-blue-500" />
      case 'custom':
        return <Settings className="h-4 w-4 text-purple-500" />
    }
  }

  const getCategoryColor = (category: TestScenario['category']) => {
    switch (category) {
      case 'basic':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'performance':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'security':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'reliability':
        return 'text-blue-700 bg-blue-50 border-blue-200'
      case 'custom':
        return 'text-purple-700 bg-purple-50 border-purple-200'
    }
  }

  const getTestTypeIcon = (type: TestStep['type']) => {
    switch (type) {
      case 'http': return '🌐'
      case 'https': return '🔒'
      case 'socks': return '🧦'
      case 'ping': return '📡'
      case 'dns': return '🔍'
      case 'custom': return '⚙️'
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const getScenarioStats = (scenarioId: string) => {
    return stats.scenarioStats.find(s => s.id === scenarioId) || {
      tests: 0,
      successes: 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <TestTube className="h-5 w-5 text-blue-500" />
            <span>Test Scenarios</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage and configure custom test scenarios
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {selectedScenarios.length > 0 && (
            <LoadingButton
              onClick={() => onRunScenario(selectedScenarios)}
              variant="primary"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Selected ({selectedScenarios.length})
            </LoadingButton>
          )}

          <LoadingButton onClick={() => setShowCreateModal(true)} variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Scenario
          </LoadingButton>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search scenarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto">
          {(['all', 'basic', 'performance', 'security', 'reliability', 'custom'] as const).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              <span className="ml-1 text-xs">
                ({category === 'all' 
                  ? scenarios.length 
                  : scenarios.filter(s => s.category === category).length
                })
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <TestTube className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Total Scenarios</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{scenarios.length}</div>
        </div>

        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            {(stats.successRate * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Avg Response</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {stats.averageResponseTime.toFixed(0)}ms
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
          <div className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">Tests Run</span>
          </div>
          <div className="text-2xl font-bold text-purple-900 mt-1">{stats.totalTests}</div>
        </div>
      </div>

      {/* Bulk Actions */}
      {filteredScenarios.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <input
                  type="checkbox"
                  checked={selectedScenarios.length === filteredScenarios.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  {selectedScenarios.length === filteredScenarios.length 
                    ? 'Deselect All' 
                    : 'Select All'
                  }
                </span>
              </button>
              
              {selectedScenarios.length > 0 && (
                <span className="text-sm text-blue-600">
                  {selectedScenarios.length} scenario{selectedScenarios.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>

            {selectedScenarios.length > 0 && (
              <div className="flex items-center space-x-2">
                <LoadingButton
                  onClick={() => onRunScenario(selectedScenarios)}
                  variant="primary"
                  size="sm"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Run Selected
                </LoadingButton>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scenarios List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredScenarios.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
            <TestTube className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              {searchTerm || selectedCategory !== 'all' 
                ? 'No scenarios match your criteria'
                : 'No test scenarios available'
              }
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first test scenario to get started'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <LoadingButton onClick={() => setShowCreateModal(true)} variant="primary">
                Create First Scenario
              </LoadingButton>
            )}
          </div>
        ) : (
          filteredScenarios.map((scenario) => {
            const scenarioStats = getScenarioStats(scenario.id)
            const isSelected = selectedScenarios.includes(scenario.id)
            
            return (
              <div 
                key={scenario.id} 
                className={`bg-white rounded-lg border p-6 hover:shadow-md transition-all cursor-pointer ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => handleSelectScenario(scenario.id, !isSelected)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation()
                        handleSelectScenario(scenario.id, e.target.checked)
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <span>{scenario.name}</span>
                        {scenario.isDefault && (
                          <Tooltip content="Default scenario">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          </Tooltip>
                        )}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(scenario.category)}`}>
                          {getCategoryIcon(scenario.category)}
                          <span className="ml-1">{scenario.category}</span>
                        </span>
                        <span className="text-xs text-gray-500">
                          {scenario.tests.length} test{scenario.tests.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Tooltip content="Duplicate scenario">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDuplicateScenario(scenario)
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </Tooltip>
                    
                    {!scenario.isDefault && (
                      <Tooltip content="Edit scenario">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingScenario(scenario)
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    )}

                    <Tooltip content="Run scenario">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRunScenario([scenario.id])
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    </Tooltip>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>

                {/* Test Steps Preview */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">Test Steps:</div>
                  <div className="flex flex-wrap gap-2">
                    {scenario.tests.slice(0, 3).map((test) => (
                      <div key={test.id} className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs">
                        <span>{getTestTypeIcon(test.type)}</span>
                        <span>{test.name}</span>
                        {test.critical && (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    ))}
                    {scenario.tests.length > 3 && (
                      <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{scenario.tests.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Configuration */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">Timeout:</span> {formatDuration(scenario.timeout)}
                  </div>
                  <div>
                    <span className="font-medium">Retries:</span> {scenario.retries}
                  </div>
                  <div>
                    <span className="font-medium">Execution:</span> {scenario.parallel ? 'Parallel' : 'Sequential'}
                  </div>
                  <div>
                    <span className="font-medium">Tests run:</span> {scenarioStats.tests}
                  </div>
                </div>

                {/* Tags */}
                {scenario.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {scenario.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Statistics */}
                {scenarioStats.tests > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Success: {scenarioStats.successes}/{scenarioStats.tests}</span>
                        <span>
                          Rate: {((scenarioStats.successes / scenarioStats.tests) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <StatusIndicator
                        status={scenarioStats.successes === scenarioStats.tests ? 'success' : 
                               scenarioStats.successes > scenarioStats.tests * 0.8 ? 'warning' : 'error'}
                        message=""
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Create/Edit Scenario Modal */}
      {(showCreateModal || editingScenario) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <TestTube className="h-5 w-5 text-blue-500" />
                <span>{editingScenario ? 'Edit Test Scenario' : 'Create New Test Scenario'}</span>
              </h3>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-6">
                <div className="text-sm text-gray-600">
                  Test scenario creation form would be implemented here with fields for:
                </div>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Scenario name and description</li>
                  <li>• Category selection</li>
                  <li>• Test steps configuration</li>
                  <li>• Timeout and retry settings</li>
                  <li>• Parallel vs sequential execution</li>
                  <li>• Tags for organization</li>
                  <li>• Critical test marking</li>
                </ul>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingScenario(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Scenario creation/update logic would go here
                  setShowCreateModal(false)
                  setEditingScenario(null)
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {editingScenario ? 'Update Scenario' : 'Create Scenario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
