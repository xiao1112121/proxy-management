'use client'

import { useState } from 'react'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Star,
  StarOff,
  Tag,
  Settings,
  Play,
  Zap,
  Globe,
  Shield,
  Clock
} from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { DataTemplate, useDataManager } from '@/hooks/useDataManager'
import { LoadingButton } from './LoadingStates'
import Tooltip from './Tooltip'

interface ProxyTemplatesProps {
  onCreateFromTemplate: (template: DataTemplate, overrides?: Partial<Proxy>) => void
}

export default function ProxyTemplates({ onCreateFromTemplate }: ProxyTemplatesProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<DataTemplate | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basic' | 'advanced' | 'custom'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const { templates, createFromTemplate, addTemplate } = useDataManager()

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  const handleCreateProxy = (template: DataTemplate) => {
    onCreateFromTemplate(template)
  }

  const handleDuplicateTemplate = (template: DataTemplate) => {
    const newTemplate = {
      ...template,
      name: `${template.name} (Copy)`,
      category: 'custom' as const,
      isDefault: false
    }
    delete (newTemplate as any).id
    delete (newTemplate as any).createdAt
    delete (newTemplate as any).usage
    addTemplate(newTemplate)
  }

  const getCategoryIcon = (category: DataTemplate['category']) => {
    switch (category) {
      case 'basic':
        return <Globe className="h-4 w-4 text-green-500" />
      case 'advanced':
        return <Shield className="h-4 w-4 text-blue-500" />
      case 'custom':
        return <Settings className="h-4 w-4 text-purple-500" />
    }
  }

  const getCategoryColor = (category: DataTemplate['category']) => {
    switch (category) {
      case 'basic':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'advanced':
        return 'text-blue-700 bg-blue-50 border-blue-200'
      case 'custom':
        return 'text-purple-700 bg-purple-50 border-purple-200'
    }
  }

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'http':
        return '🌐'
      case 'https':
        return '🔒'
      case 'socks4':
        return '🧦'
      case 'socks5':
        return '🔐'
      default:
        return '📡'
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-indigo-500" />
            <span>Proxy Templates</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Quick-start templates for common proxy configurations
          </p>
        </div>

        <LoadingButton onClick={() => setShowCreateModal(true)} variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </LoadingButton>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-2">
          {(['all', 'basic', 'advanced', 'custom'] as const).map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              <span className="ml-1 text-xs">
                ({category === 'all' 
                  ? templates.length 
                  : templates.filter(t => t.category === category).length
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
            <FileText className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Total Templates</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{templates.length}</div>
        </div>

        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">Basic</span>
          </div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            {templates.filter(t => t.category === 'basic').length}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Advanced</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {templates.filter(t => t.category === 'advanced').length}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">Custom</span>
          </div>
          <div className="text-2xl font-bold text-purple-900 mt-1">
            {templates.filter(t => t.category === 'custom').length}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              {searchTerm || selectedCategory !== 'all' 
                ? 'No templates match your criteria'
                : 'No templates available'
              }
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first template to get started'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <LoadingButton onClick={() => setShowCreateModal(true)} variant="primary">
                Create First Template
              </LoadingButton>
            )}
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Template Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {getTypeIcon(template.fields.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <span>{template.name}</span>
                      {template.isDefault && (
                        <Tooltip content="Default template">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        </Tooltip>
                      )}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(template.category)}`}>
                        {getCategoryIcon(template.category)}
                        <span className="ml-1">{template.category}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Tooltip content="Duplicate template">
                    <button
                      onClick={() => handleDuplicateTemplate(template)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </Tooltip>
                  
                  {!template.isDefault && (
                    <Tooltip content="Edit template">
                      <button
                        onClick={() => setEditingTemplate(template)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>

              {/* Configuration Preview */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-xs text-gray-500 mb-2">Configuration:</div>
                <div className="space-y-1 text-xs">
                  {template.fields.type && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-mono">{template.fields.type}</span>
                    </div>
                  )}
                  {template.fields.anonymity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Anonymity:</span>
                      <span className="font-mono">{template.fields.anonymity}</span>
                    </div>
                  )}
                  {template.fields.status && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-mono">{template.fields.status}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {template.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Zap className="h-3 w-3" />
                    <span>{template.usage} uses</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(template.createdAt)}</span>
                  </div>
                </div>

                <LoadingButton
                  onClick={() => handleCreateProxy(template)}
                  variant="primary"
                  size="sm"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Use Template
                </LoadingButton>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Template Modal */}
      {(showCreateModal || editingTemplate) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                <span>{editingTemplate ? 'Edit Template' : 'Create New Template'}</span>
              </h3>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-6">
                <div className="text-sm text-gray-600">
                  Template creation form would be implemented here with fields for:
                </div>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Template name and description</li>
                  <li>• Category selection</li>
                  <li>• Default field values (host, port, type, etc.)</li>
                  <li>• Validation rules to apply</li>
                  <li>• Tags for organization</li>
                  <li>• Default/custom status</li>
                </ul>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingTemplate(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Template creation/update logic would go here
                  setShowCreateModal(false)
                  setEditingTemplate(null)
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
