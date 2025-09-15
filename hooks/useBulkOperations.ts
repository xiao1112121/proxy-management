'use client'

import { useState, useCallback, useRef } from 'react'
import { SimpleProxy as Proxy } from '@/types/proxy'

export interface BulkOperation {
  id: string
  type: 'delete' | 'update' | 'test' | 'export'
  status: 'pending' | 'running' | 'completed' | 'error' | 'cancelled'
  progress: number
  total: number
  processed: number
  startTime: number
  endTime?: number
  error?: string
  data?: any
  canUndo: boolean
  undoData?: any
}

export interface BulkOperationResult {
  success: boolean
  processed: number
  errors: string[]
  undoData?: any
}

export function useBulkOperations() {
  const [operations, setOperations] = useState<BulkOperation[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const operationQueue = useRef<BulkOperation[]>([])
  const abortControllers = useRef<Map<string, AbortController>>(new Map())

  const addOperation = useCallback((
    type: BulkOperation['type'],
    total: number,
    data?: any
  ): string => {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const operation: BulkOperation = {
      id,
      type,
      status: 'pending',
      progress: 0,
      total,
      processed: 0,
      startTime: Date.now(),
      data,
      canUndo: type !== 'export' && type !== 'test'
    }

    setOperations(prev => [...prev, operation])
    operationQueue.current.push(operation)
    
    return id
  }, [])

  const updateOperation = useCallback((
    id: string,
    updates: Partial<BulkOperation>
  ) => {
    setOperations(prev => prev.map(op => 
      op.id === id ? { ...op, ...updates } : op
    ))
  }, [])

  const removeOperation = useCallback((id: string) => {
    setOperations(prev => prev.filter(op => op.id !== id))
    abortControllers.current.delete(id)
  }, [])

  const cancelOperation = useCallback((id: string) => {
    const controller = abortControllers.current.get(id)
    if (controller) {
      controller.abort()
    }
    updateOperation(id, { status: 'cancelled', endTime: Date.now() })
  }, [updateOperation])

  const bulkDelete = useCallback(async (
    proxyIds: number[],
    onDelete: (id: number) => void,
    batchSize: number = 10
  ): Promise<BulkOperationResult> => {
    const operationId = addOperation('delete', proxyIds.length, { proxyIds })
    const controller = new AbortController()
    abortControllers.current.set(operationId, controller)

    try {
      setIsProcessing(true)
      updateOperation(operationId, { status: 'running' })

      const deletedProxies: number[] = []
      let processed = 0

      // Process in batches to avoid UI blocking
      for (let i = 0; i < proxyIds.length; i += batchSize) {
        if (controller.signal.aborted) {
          throw new Error('Operation cancelled')
        }

        const batch = proxyIds.slice(i, i + batchSize)
        
        // Simulate async processing
        await new Promise(resolve => setTimeout(resolve, 100))
        
        batch.forEach(id => {
          onDelete(id)
          deletedProxies.push(id)
          processed++
          
          updateOperation(operationId, {
            progress: Math.round((processed / proxyIds.length) * 100),
            processed
          })
        })
      }

      updateOperation(operationId, {
        status: 'completed',
        endTime: Date.now(),
        undoData: { deletedProxies }
      })

      return {
        success: true,
        processed: deletedProxies.length,
        errors: [],
        undoData: { deletedProxies }
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      updateOperation(operationId, {
        status: 'error',
        endTime: Date.now(),
        error: errorMsg
      })

      return {
        success: false,
        processed: 0,
        errors: [errorMsg]
      }
    } finally {
      setIsProcessing(false)
      abortControllers.current.delete(operationId)
    }
  }, [addOperation, updateOperation])

  const bulkUpdate = useCallback(async (
    proxyIds: number[],
    updates: Partial<Proxy>,
    onUpdate: (id: number, updates: Partial<Proxy>) => void,
    batchSize: number = 10
  ): Promise<BulkOperationResult> => {
    const operationId = addOperation('update', proxyIds.length, { proxyIds, updates })
    const controller = new AbortController()
    abortControllers.current.set(operationId, controller)

    try {
      setIsProcessing(true)
      updateOperation(operationId, { status: 'running' })

      const updatedProxies: Array<{id: number, oldData: Partial<Proxy>}> = []
      let processed = 0

      for (let i = 0; i < proxyIds.length; i += batchSize) {
        if (controller.signal.aborted) {
          throw new Error('Operation cancelled')
        }

        const batch = proxyIds.slice(i, i + batchSize)
        
        await new Promise(resolve => setTimeout(resolve, 100))
        
        batch.forEach(id => {
          // Store old data for undo
          const oldData = { /* would need to get current proxy data */ }
          onUpdate(id, updates)
          updatedProxies.push({ id, oldData })
          processed++
          
          updateOperation(operationId, {
            progress: Math.round((processed / proxyIds.length) * 100),
            processed
          })
        })
      }

      updateOperation(operationId, {
        status: 'completed',
        endTime: Date.now(),
        undoData: { updatedProxies, updates }
      })

      return {
        success: true,
        processed: updatedProxies.length,
        errors: [],
        undoData: { updatedProxies, updates }
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      updateOperation(operationId, {
        status: 'error',
        endTime: Date.now(),
        error: errorMsg
      })

      return {
        success: false,
        processed: 0,
        errors: [errorMsg]
      }
    } finally {
      setIsProcessing(false)
      abortControllers.current.delete(operationId)
    }
  }, [addOperation, updateOperation])

  const bulkTest = useCallback(async (
    proxyIds: number[],
    onTest: (ids: number[]) => void,
    batchSize: number = 5
  ): Promise<BulkOperationResult> => {
    const operationId = addOperation('test', proxyIds.length, { proxyIds })
    const controller = new AbortController()
    abortControllers.current.set(operationId, controller)

    try {
      setIsProcessing(true)
      updateOperation(operationId, { status: 'running' })

      let processed = 0
      const errors: string[] = []

      for (let i = 0; i < proxyIds.length; i += batchSize) {
        if (controller.signal.aborted) {
          throw new Error('Operation cancelled')
        }

        const batch = proxyIds.slice(i, i + batchSize)
        
        try {
          onTest(batch)
          // Simulate test time
          await new Promise(resolve => setTimeout(resolve, 2000))
          processed += batch.length
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Test failed'
          errors.push(`Batch ${i}-${i + batch.length}: ${errorMsg}`)
          processed += batch.length // Count as processed even if failed
        }
        
        updateOperation(operationId, {
          progress: Math.round((processed / proxyIds.length) * 100),
          processed
        })
      }

      updateOperation(operationId, {
        status: errors.length === 0 ? 'completed' : 'error',
        endTime: Date.now(),
        error: errors.length > 0 ? errors.join('; ') : undefined
      })

      return {
        success: errors.length === 0,
        processed,
        errors
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      updateOperation(operationId, {
        status: 'error',
        endTime: Date.now(),
        error: errorMsg
      })

      return {
        success: false,
        processed: 0,
        errors: [errorMsg]
      }
    } finally {
      setIsProcessing(false)
      abortControllers.current.delete(operationId)
    }
  }, [addOperation, updateOperation])

  const undoOperation = useCallback((
    operationId: string,
    onUndo: (undoData: any) => void
  ) => {
    const operation = operations.find(op => op.id === operationId)
    if (!operation || !operation.canUndo || !operation.undoData) {
      return false
    }

    try {
      onUndo(operation.undoData)
      updateOperation(operationId, { canUndo: false })
      return true
    } catch (error) {
      console.error('Undo failed:', error)
      return false
    }
  }, [operations, updateOperation])

  const clearCompletedOperations = useCallback(() => {
    setOperations(prev => prev.filter(op => 
      op.status === 'running' || op.status === 'pending'
    ))
  }, [])

  const getOperationStats = useCallback(() => {
    const stats = {
      total: operations.length,
      pending: operations.filter(op => op.status === 'pending').length,
      running: operations.filter(op => op.status === 'running').length,
      completed: operations.filter(op => op.status === 'completed').length,
      error: operations.filter(op => op.status === 'error').length,
      cancelled: operations.filter(op => op.status === 'cancelled').length
    }
    return stats
  }, [operations])

  return {
    operations,
    isProcessing,
    bulkDelete,
    bulkUpdate,
    bulkTest,
    undoOperation,
    cancelOperation,
    removeOperation,
    clearCompletedOperations,
    getOperationStats
  }
}
