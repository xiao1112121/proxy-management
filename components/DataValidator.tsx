'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Settings,
  Play,
  Pause,
  RotateCcw,
  Filter,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { ValidationRule, ValidationResult, useDataManager } from '@/hooks/useDataManager'
import { LoadingButton, StatusIndicator } from './LoadingStates'
import Tooltip from './Tooltip'

interface DataValidatorProps {
  proxies: Proxy[]
  onFixProxy: (proxyId: number, fixes: Partial<Proxy>) => void
}

export default function DataValidator({ proxies, onFixProxy }: DataValidatorProps) {
  const [activeTab, setActiveTab] = useState<'results' | 'rules'>('results')
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warning' | 'info'>('all')
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [editingRule, setEditingRule] = useState<ValidationRule | null>(null)
  const [autoValidate, setAutoValidate] = useState(true)

  const {
    validationRules,
    validationResults,
    validateProxies,
    addValidationRule,
    getValidationStats
  } = useDataManager()

  // Auto-validate when proxies change
  useEffect(() => {
    if (autoValidate && proxies.length > 0) {
      validateProxies(proxies)
    }
  }, [proxies, autoValidate, validateProxies])

  const handleValidate = () => {
    validateProxies(proxies)
  }

  const stats = getValidationStats()
  
  const filteredResults = validationResults.filter(result => 
    filterSeverity === 'all' || result.severity === filterSeverity
  )

  const getSeverityIcon = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'info':
        return 'text-blue-700 bg-blue-50 border-blue-200'
    }
  }

  const getFieldDisplayName = (field: keyof Proxy): string => {
    const fieldNames: Partial<Record<keyof Proxy, string>> = {
      id: 'ID',
      host: 'Host',
      port: 'Port',
      username: 'Username',
      password: 'Password',
      type: 'Type',
      country: 'Country',
      city: 'City',
      anonymity: 'Anonymity',
      status: 'Status',
      ping: 'Ping',
      speed: 'Speed'
    }
    return fieldNames[field] || String(field)
  }

  const handleCreateRule = () => {
    setEditingRule(null)
    setShowRuleModal(true)
  }

  const handleEditRule = (rule: ValidationRule) => {
    setEditingRule(rule)
    setShowRuleModal(true)
  }

  const getSuggestedFix = (result: ValidationResult): Partial<Proxy> | null => {
    const { rule, field, value } = result

    switch (rule.id) {
      case 'host-required':
        return { [field]: 'example.com' }
      case 'port-range':
        return { [field]: 8080 }
      case 'host-format':
        // Try to fix common host format issues
        if (typeof value === 'string') {
          const cleaned = value.replace(/[^\w.-]/g, '')
          return cleaned ? { [field]: cleaned } : null
        }
        return null
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-500" />
            <span>Data Validator</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Validate proxy data integrity and quality
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="auto-validate"
              checked={autoValidate}
              onChange={(e) => setAutoValidate(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="auto-validate" className="text-sm text-gray-700">
              Auto-validate
            </label>
          </div>

          <LoadingButton
            onClick={handleValidate}
            variant="primary"
          >
            <Play className="h-4 w-4 mr-2" />
            Validate Now
          </LoadingButton>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Total Issues</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>

        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-red-700">Errors</span>
          </div>
          <div className="text-2xl font-bold text-red-900 mt-1">{stats.errors}</div>
        </div>

        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-700">Warnings</span>
          </div>
          <div className="text-2xl font-bold text-yellow-900 mt-1">{stats.warnings}</div>
        </div>

        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Info</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{stats.info}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('results')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'results'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Validation Results ({filteredResults.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Validation Rules ({validationRules.length})
          </button>
        </nav>
      </div>

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Filter by severity:</span>
            </div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
            >
              <option value="all">All ({stats.total})</option>
              <option value="error">Errors ({stats.errors})</option>
              <option value="warning">Warnings ({stats.warnings})</option>
              <option value="info">Info ({stats.info})</option>
            </select>
          </div>

          {/* Results List */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            {filteredResults.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                {stats.total === 0 ? (
                  <>
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-300" />
                    <h3 className="text-lg font-medium mb-2">All data is valid!</h3>
                    <p className="text-sm">No validation issues found in your proxy data.</p>
                  </>
                ) : (
                  <>
                    <Filter className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No results match filter</h3>
                    <p className="text-sm">Try adjusting your filter criteria.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredResults.map((result, index) => {
                  const proxy = proxies.find(p => p.id === result.proxyId)
                  const suggestedFix = getSuggestedFix(result)
                  
                  return (
                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getSeverityIcon(result.severity)}
                            <span className="font-medium text-gray-900">
                              {getFieldDisplayName(result.field)} validation failed
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(result.severity)}`}>
                              {result.severity}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                          
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">Proxy:</span> {proxy?.host}:{proxy?.port}
                            {result.value !== undefined && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="font-medium">Current value:</span> 
                                <code className="mx-1 px-1 bg-gray-100 rounded text-xs">
                                  {String(result.value)}
                                </code>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {suggestedFix && (
                            <Tooltip content="Apply suggested fix">
                              <button
                                onClick={() => onFixProxy(result.proxyId, suggestedFix)}
                                className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm transition-colors"
                              >
                                Quick Fix
                              </button>
                            </Tooltip>
                          )}
                          
                          <Tooltip content="View rule details">
                            <button
                              onClick={() => handleEditRule(result.rule)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Info className="h-4 w-4" />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <LoadingButton onClick={handleCreateRule} variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </LoadingButton>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200">
            {validationRules.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No validation rules</h3>
                <p className="text-sm mb-4">Create your first validation rule to get started.</p>
                <LoadingButton onClick={handleCreateRule} variant="primary">
                  Create First Rule
                </LoadingButton>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {validationRules.map((rule) => (
                  <div key={rule.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h5 className="font-medium text-gray-900">{rule.name}</h5>
                          <StatusIndicator
                            status={rule.enabled ? 'success' : 'idle'}
                            message={rule.enabled ? 'Enabled' : 'Disabled'}
                          />
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(rule.severity)}`}>
                            {rule.severity}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                        
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Field:</span> {getFieldDisplayName(rule.field)}
                          <span className="mx-2">•</span>
                          <span className="font-medium">Type:</span> {rule.type}
                          {stats.byRule[rule.id] && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="font-medium">Issues:</span> {stats.byRule[rule.id]}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Tooltip content="Edit rule">
                          <button
                            onClick={() => handleEditRule(rule)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rule Modal would go here - simplified for brevity */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingRule ? 'Edit Rule' : 'Create Rule'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Rule creation interface would be implemented here with form fields for:
              name, description, field, type, rule logic, severity, etc.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRuleModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowRuleModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {editingRule ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
