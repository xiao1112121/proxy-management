'use client'

import { useState, useEffect } from 'react'
import { AdvancedStorageManager } from '@/utils/advancedStorageManager'

export function useSSRSafeStorage() {
  const [isClient, setIsClient] = useState(false)
  const [storageStats, setStorageStats] = useState({
    totalSize: 0,
    chunkCount: 0,
    averageChunkSize: 0,
    compressionRatio: 0,
    isEssential: false
  })

  useEffect(() => {
    setIsClient(true)
    setStorageStats(AdvancedStorageManager.getStorageStats())
  }, [])

  const getStorageStats = () => {
    if (!isClient) return storageStats
    return AdvancedStorageManager.getStorageStats()
  }

  const getRecommendedAction = () => {
    if (!isClient) return 'Loading...'
    return AdvancedStorageManager.getRecommendedAction()
  }

  const isStorageNearLimit = () => {
    if (!isClient) return false
    return AdvancedStorageManager.isStorageNearLimit()
  }

  return {
    isClient,
    storageStats: getStorageStats(),
    getRecommendedAction: getRecommendedAction(),
    isStorageNearLimit: isStorageNearLimit()
  }
}
