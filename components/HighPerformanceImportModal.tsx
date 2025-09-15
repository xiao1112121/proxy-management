'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Upload, X, CheckCircle, AlertCircle, Loader2, FileText, Database } from 'lucide-react'
import { SimpleProxy as Proxy } from '@/types/proxy'
import { ProxyImportExport } from '@/utils/importExport'

interface HighPerformanceImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (proxies: Proxy[]) => void
  maxProxies?: number
}

interface ImportProgress {
  stage: 'reading' | 'parsing' | 'validating' | 'saving' | 'complete' | 'error'
  progress: number
  message: string
  processed: number
  total: number
  errors: string[]
}

export default function HighPerformanceImportModal({ 
  isOpen, 
  onClose, 
  onImport, 
  maxProxies = 200000 
}: HighPerformanceImportModalProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState<ImportProgress>({
    stage: 'reading',
    progress: 0,
    message: 'Sẵn sàng import...',
    processed: 0,
    total: 0,
    errors: []
  })
  const [importedCount, setImportedCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetProgress = useCallback(() => {
    setProgress({
      stage: 'reading',
      progress: 0,
      message: 'Sẵn sàng import...',
      processed: 0,
      total: 0,
      errors: []
    })
    setImportedCount(0)
  }, [])

  const handleClose = useCallback(() => {
    if (!isImporting) {
      resetProgress()
      onClose()
    }
  }, [isImporting, resetProgress, onClose])

  const updateProgress = useCallback((updates: Partial<ImportProgress>) => {
    setProgress(prev => ({ ...prev, ...updates }))
  }, [])

  const processFileInChunks = useCallback(async (file: File) => {
    const chunkSize = 10000 // Process 10,000 proxies at a time
    const totalSize = file.size
    let processedSize = 0
    let allProxies: Proxy[] = []
    let errors: string[] = []

    try {
      // Read file content
      updateProgress({
        stage: 'reading',
        message: 'Đang đọc file...',
        progress: 0
      })

      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      updateProgress({
        stage: 'parsing',
        message: 'Đang phân tích dữ liệu...',
        total: lines.length,
        processed: 0
      })

      // Process in chunks to avoid memory issues
      for (let i = 0; i < lines.length; i += chunkSize) {
        const chunk = lines.slice(i, i + chunkSize)
        
        try {
          const chunkProxies = await parseChunk(chunk, i)
          allProxies.push(...chunkProxies)
          
          processedSize += chunk.length
          const progressPercent = Math.round((processedSize / lines.length) * 100)
          
          updateProgress({
            stage: 'parsing',
            message: `Đang xử lý chunk ${Math.floor(i / chunkSize) + 1}...`,
            progress: progressPercent,
            processed: Math.min(i + chunkSize, lines.length),
            total: lines.length
          })

          // Check if we've reached the maximum
          if (allProxies.length >= maxProxies) {
            allProxies = allProxies.slice(0, maxProxies)
            updateProgress({
              message: `Đã đạt giới hạn ${maxProxies} proxy. Dừng xử lý.`,
              progress: 100
            })
            break
          }

          // Yield control to prevent blocking
          await new Promise(resolve => setTimeout(resolve, 0))
          
        } catch (error) {
          const errorMsg = `Lỗi xử lý chunk ${Math.floor(i / chunkSize) + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
          errors.push(errorMsg)
          console.error(errorMsg, error)
        }
      }

      // Validate proxies
      updateProgress({
        stage: 'validating',
        message: 'Đang kiểm tra tính hợp lệ...',
        progress: 0
      })

      const validProxies = await validateProxies(allProxies)
      
      updateProgress({
        stage: 'saving',
        message: 'Đang lưu dữ liệu...',
        progress: 0
      })

      // Save proxies
      await saveProxies(validProxies)
      
      setImportedCount(validProxies.length)
      updateProgress({
        stage: 'complete',
        message: `Import thành công! Đã thêm ${validProxies.length} proxy.`,
        progress: 100,
        processed: validProxies.length,
        total: validProxies.length,
        errors
      })

      // Call onImport callback
      onImport(validProxies)

    } catch (error) {
      console.error('Import failed:', error)
      updateProgress({
        stage: 'error',
        message: `Lỗi import: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0,
        errors: [...errors, error instanceof Error ? error.message : 'Unknown error']
      })
    }
  }, [maxProxies, updateProgress, onImport])

  const parseChunk = async (lines: string[], startIndex: number): Promise<Proxy[]> => {
    const proxies: Proxy[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      try {
        // Try different parsing methods
        let proxy: Omit<Proxy, 'id'> | null = null

        // Method 1: JSON format
        if (line.startsWith('{') && line.endsWith('}')) {
          const parsed = JSON.parse(line)
          if (parsed.host && parsed.port) {
            proxy = {
              host: parsed.host,
              port: parseInt(parsed.port),
              type: parsed.type || 'http',
              status: 'pending',
              username: parsed.username || '',
              password: parsed.password || '',
              group: parsed.group || 'imported'
            }
          }
        }
        // Method 2: CSV format (host:port:username:password:type)
        else if (line.includes(':')) {
          const parts = line.split(':')
          if (parts.length >= 2) {
            proxy = {
              host: parts[0].trim(),
              port: parseInt(parts[1].trim()),
              type: (parts[4]?.trim() as 'http' | 'https' | 'socks4' | 'socks5') || 'http',
              status: 'pending',
              username: parts[2]?.trim() || '',
              password: parts[3]?.trim() || '',
              group: 'imported'
            }
          }
        }
        // Method 3: Simple format (host:port)
        else if (line.includes(':') && !line.includes(' ')) {
          const [host, port] = line.split(':')
          if (host && port) {
            proxy = {
              host: host.trim(),
              port: parseInt(port.trim()),
              type: 'http',
              status: 'pending',
              username: '',
              password: '',
              group: 'imported'
            }
          }
        }

        if (proxy) {
          proxies.push({
            ...proxy,
            id: Date.now() + startIndex + i + Math.random()
          })
        }
      } catch (error) {
        // Skip invalid lines
        continue
      }
    }

    return proxies
  }

  const validateProxies = async (proxies: Proxy[]): Promise<Proxy[]> => {
    const validProxies: Proxy[] = []
    
    for (const proxy of proxies) {
      // Basic validation
      if (proxy.host && proxy.port && proxy.port > 0 && proxy.port <= 65535) {
        validProxies.push(proxy)
      }
    }

    return validProxies
  }

  const saveProxies = async (proxies: Proxy[]): Promise<void> => {
    // This would typically save to your storage system
    // For now, we'll just simulate the save operation
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`Saving ${proxies.length} proxies...`)
        resolve()
      }, 100)
    })
  }

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    resetProgress()

    try {
      await processFileInChunks(file)
    } catch (error) {
      console.error('File processing failed:', error)
      updateProgress({
        stage: 'error',
        message: `Lỗi xử lý file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0
      })
    } finally {
      setIsImporting(false)
    }
  }, [processFileInChunks, resetProgress, updateProgress])

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'reading':
        return <FileText className="h-5 w-5" />
      case 'parsing':
        return <Database className="h-5 w-5" />
      case 'validating':
        return <CheckCircle className="h-5 w-5" />
      case 'saving':
        return <Loader2 className="h-5 w-5 animate-spin" />
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'complete':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      case 'saving':
        return 'text-blue-500'
      default:
        return 'text-gray-500'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Upload className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Import Proxy Hiệu Suất Cao
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.json"
              onChange={handleFileSelect}
              disabled={isImporting}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex flex-col items-center space-y-4 disabled:opacity-50"
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isImporting ? 'Đang xử lý...' : 'Chọn file để import'}
                </p>
                <p className="text-sm text-gray-500">
                  Hỗ trợ .txt, .csv, .json (tối đa {maxProxies.toLocaleString()} proxy)
                </p>
              </div>
            </button>
          </div>

          {/* Progress */}
          {isImporting && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getStageIcon(progress.stage)}
                <span className={`font-medium ${getStageColor(progress.stage)}`}>
                  {progress.message}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              
              <div className="text-sm text-gray-600">
                {progress.processed > 0 && progress.total > 0 && (
                  <span>
                    {progress.processed.toLocaleString()} / {progress.total.toLocaleString()} 
                    ({progress.progress}%)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {progress.stage === 'complete' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-800">
                  Import thành công!
                </span>
              </div>
              <p className="text-green-700 mt-1">
                Đã import {importedCount.toLocaleString()} proxy thành công.
              </p>
            </div>
          )}

          {/* Errors */}
          {progress.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium text-red-800">
                  Có {progress.errors.length} lỗi xảy ra
                </span>
              </div>
              <div className="mt-2 max-h-32 overflow-y-auto">
                {progress.errors.map((error, index) => (
                  <p key={index} className="text-red-700 text-sm">
                    • {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={isImporting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              {progress.stage === 'complete' ? 'Đóng' : 'Hủy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
