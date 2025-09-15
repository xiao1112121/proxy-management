'use client'

import { useState, useCallback, useRef } from 'react'
import { SimpleProxy as Proxy } from '@/types/proxy'

export interface WorkflowNode {
  id: string
  type: 'trigger' | 'condition' | 'action' | 'delay'
  name: string
  config: Record<string, any>
  position: { x: number; y: number }
  connections: string[] // IDs of connected nodes
}

export interface Workflow {
  id: string
  name: string
  description: string
  category: 'maintenance' | 'monitoring' | 'optimization' | 'alerts' | 'custom'
  isActive: boolean
  nodes: WorkflowNode[]
  triggers: WorkflowTrigger[]
  schedule?: {
    type: 'interval' | 'cron' | 'event'
    value: string
    timezone?: string
  }
  createdAt: number
  lastRun?: number
  nextRun?: number
  runCount: number
  successCount: number
  errorCount: number
}

export interface WorkflowTrigger {
  id: string
  type: 'schedule' | 'proxy_status' | 'performance' | 'manual' | 'webhook'
  conditions: Record<string, any>
  isActive: boolean
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  startTime: number
  endTime?: number
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  steps: WorkflowStep[]
  error?: string
  context: Record<string, any>
}

export interface WorkflowStep {
  nodeId: string
  nodeName: string
  startTime: number
  endTime?: number
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  output?: any
  error?: string
}

export interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: {
    type: 'proxy_down' | 'performance_drop' | 'usage_spike' | 'schedule'
    conditions: Record<string, any>
  }
  actions: {
    type: 'replace_proxy' | 'send_alert' | 'scale_up' | 'rotate_proxies' | 'run_test'
    config: Record<string, any>
  }[]
  isActive: boolean
  priority: number
  cooldown: number // minutes
  lastTriggered?: number
}

const WORKFLOW_TEMPLATES: Partial<Workflow>[] = [
  {
    name: 'Daily Health Check',
    description: 'Automatically test all proxies daily and remove failed ones',
    category: 'maintenance',
    nodes: [
      {
        id: 'trigger_1',
        type: 'trigger',
        name: 'Daily Schedule',
        config: { schedule: '0 6 * * *' }, // 6 AM daily
        position: { x: 100, y: 100 },
        connections: ['action_1']
      },
      {
        id: 'action_1',
        type: 'action',
        name: 'Test All Proxies',
        config: { testType: 'comprehensive', timeout: 30000 },
        position: { x: 300, y: 100 },
        connections: ['condition_1']
      },
      {
        id: 'condition_1',
        type: 'condition',
        name: 'Check Success Rate',
        config: { operator: 'less_than', value: 0.8 },
        position: { x: 500, y: 100 },
        connections: ['action_2']
      },
      {
        id: 'action_2',
        type: 'action',
        name: 'Remove Failed Proxies',
        config: { action: 'remove', criteria: 'failed_test' },
        position: { x: 700, y: 100 },
        connections: []
      }
    ]
  },
  {
    name: 'Performance Optimization',
    description: 'Monitor performance and auto-optimize proxy rotation',
    category: 'optimization',
    nodes: [
      {
        id: 'trigger_1',
        type: 'trigger',
        name: 'Performance Drop',
        config: { metric: 'avg_response_time', threshold: 2000 },
        position: { x: 100, y: 100 },
        connections: ['action_1']
      },
      {
        id: 'action_1',
        type: 'action',
        name: 'Analyze Performance',
        config: { lookback: '1h', metrics: ['response_time', 'success_rate'] },
        position: { x: 300, y: 100 },
        connections: ['action_2']
      },
      {
        id: 'action_2',
        type: 'action',
        name: 'Optimize Rotation',
        config: { strategy: 'performance_based', topPercent: 20 },
        position: { x: 500, y: 100 },
        connections: []
      }
    ]
  }
]

export function useWorkflowAutomation() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [activeExecutions, setActiveExecutions] = useState<Map<string, WorkflowExecution>>(new Map())

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Create workflow from template
  const createWorkflowFromTemplate = useCallback((templateIndex: number, customName?: string) => {
    const template = WORKFLOW_TEMPLATES[templateIndex]
    if (!template) return null

    const workflow: Workflow = {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: customName || template.name!,
      description: template.description!,
      category: template.category!,
      isActive: false,
      nodes: template.nodes!,
      triggers: [],
      createdAt: Date.now(),
      runCount: 0,
      successCount: 0,
      errorCount: 0
    }

    setWorkflows(prev => [...prev, workflow])
    return workflow
  }, [])

  // Execute workflow
  const executeWorkflow = useCallback(async (workflowId: string, context: Record<string, any> = {}) => {
    const workflow = workflows.find(w => w.id === workflowId)
    if (!workflow) return null

    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      startTime: Date.now(),
      status: 'running',
      steps: [],
      context
    }

    setExecutions(prev => [execution, ...prev])
    setActiveExecutions(prev => new Map(prev.set(execution.id, execution)))

    try {
      // Execute workflow nodes in order
      for (const node of workflow.nodes) {
        const step: WorkflowStep = {
          nodeId: node.id,
          nodeName: node.name,
          startTime: Date.now(),
          status: 'running'
        }

        execution.steps.push(step)

        // Simulate node execution
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500))

        // Simulate step completion
        step.endTime = Date.now()
        step.status = Math.random() > 0.1 ? 'completed' : 'failed'
        
        if (step.status === 'failed') {
          step.error = 'Simulated execution error'
          execution.status = 'failed'
          execution.error = `Step "${node.name}" failed`
          break
        }

        // Add simulated output
        step.output = {
          message: `${node.name} completed successfully`,
          data: { processed: Math.floor(Math.random() * 100) }
        }
      }

      if (execution.status === 'running') {
        execution.status = 'completed'
      }

      execution.endTime = Date.now()

      // Update workflow statistics
      setWorkflows(prev => prev.map(w => {
        if (w.id === workflowId) {
          return {
            ...w,
            lastRun: Date.now(),
            runCount: w.runCount + 1,
            successCount: execution.status === 'completed' ? w.successCount + 1 : w.successCount,
            errorCount: execution.status === 'failed' ? w.errorCount + 1 : w.errorCount
          }
        }
        return w
      }))

    } finally {
      setActiveExecutions(prev => {
        const newMap = new Map(prev)
        newMap.delete(execution.id)
        return newMap
      })
    }

    return execution
  }, [workflows])

  // Create automation rule
  const createAutomationRule = useCallback((rule: Omit<AutomationRule, 'id'>) => {
    const newRule: AutomationRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    setAutomationRules(prev => [...prev, newRule])
    return newRule
  }, [])

  // Toggle workflow active status
  const toggleWorkflow = useCallback((workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, isActive: !w.isActive } : w
    ))
  }, [])

  // Delete workflow
  const deleteWorkflow = useCallback((workflowId: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== workflowId))
    setExecutions(prev => prev.filter(e => e.workflowId !== workflowId))
  }, [])

  // Get workflow statistics
  const getWorkflowStats = useCallback(() => {
    const totalWorkflows = workflows.length
    const activeWorkflows = workflows.filter(w => w.isActive).length
    const totalExecutions = executions.length
    const successfulExecutions = executions.filter(e => e.status === 'completed').length
    const failedExecutions = executions.filter(e => e.status === 'failed').length
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0

    return {
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      successRate
    }
  }, [workflows, executions])

  // Get recent executions
  const getRecentExecutions = useCallback((limit: number = 10) => {
    return executions
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit)
  }, [executions])

  // Check automation rules
  const checkAutomationRules = useCallback((proxies: Proxy[]) => {
    const triggeredRules = []

    for (const rule of automationRules) {
      if (!rule.isActive) continue

      // Check cooldown
      if (rule.lastTriggered && Date.now() - rule.lastTriggered < rule.cooldown * 60 * 1000) {
        continue
      }

      let shouldTrigger = false

      switch (rule.trigger.type) {
        case 'proxy_down':
          const downProxies = proxies.filter(p => p.status === 'dead')
          shouldTrigger = downProxies.length >= (rule.trigger.conditions.minCount || 1)
          break

        case 'performance_drop':
          const avgResponseTime = proxies
            .filter(p => p.ping)
            .reduce((sum, p) => sum + p.ping!, 0) / proxies.length
          shouldTrigger = avgResponseTime > (rule.trigger.conditions.threshold || 2000)
          break

        case 'usage_spike':
          // Simulate usage spike detection
          shouldTrigger = Math.random() > 0.95
          break
      }

      if (shouldTrigger) {
        triggeredRules.push(rule)
        
        // Update last triggered time
        setAutomationRules(prev => prev.map(r => 
          r.id === rule.id ? { ...r, lastTriggered: Date.now() } : r
        ))
      }
    }

    return triggeredRules
  }, [automationRules])

  // Execute automation rule actions
  const executeAutomationActions = useCallback(async (rule: AutomationRule, context: Record<string, any> = {}) => {
    const results = []

    for (const action of rule.actions) {
      try {
        // Simulate action execution
        await new Promise(resolve => setTimeout(resolve, 1000))

        let result
        switch (action.type) {
          case 'send_alert':
            result = { type: 'alert', message: `Alert: ${rule.name}`, sent: true }
            break
          case 'replace_proxy':
            result = { type: 'proxy_replacement', replaced: Math.floor(Math.random() * 5) + 1 }
            break
          case 'scale_up':
            result = { type: 'scaling', added: Math.floor(Math.random() * 10) + 5 }
            break
          default:
            result = { type: action.type, executed: true }
        }

        results.push(result)
      } catch (error) {
        results.push({ 
          type: action.type, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    return results
  }, [])

  return {
    // State
    workflows,
    executions,
    automationRules,
    isRunning,
    activeExecutions,

    // Actions
    createWorkflowFromTemplate,
    executeWorkflow,
    createAutomationRule,
    toggleWorkflow,
    deleteWorkflow,
    checkAutomationRules,
    executeAutomationActions,

    // Utils
    getWorkflowStats,
    getRecentExecutions,
    
    // Templates
    workflowTemplates: WORKFLOW_TEMPLATES
  }
}
