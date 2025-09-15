'use client'

import { validateProxy, validateTestSettings, validateBulkOperation } from './validators'
import type { ApiResponse, ErrorResponse, SuccessResponse } from './validators'

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// API Client class
class ApiClient {
  private baseURL = '/api'
  
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new ApiError(
          response.status, 
          data.error || data.message || 'Request failed',
          data.details
        )
      }
      
      return { success: true, data }
    } catch (error) {
      if (error instanceof ApiError) {
      return { 
        success: false, 
        error: error.message
      }
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  // Proxy endpoints
  async getProxies(): Promise<ApiResponse<any[]>> {
    return this.request('/proxy-pool')
  }
  
  async addProxy(proxy: any): Promise<ApiResponse<any>> {
    const validation = validateProxy(proxy)
    if (!validation.success) {
      return validation
    }
    
    return this.request('/proxy-pool', {
      method: 'POST',
      body: JSON.stringify(validation.data),
    })
  }
  
  async updateProxy(id: number, updates: any): Promise<ApiResponse<any>> {
    const validation = validateProxy(updates)
    if (!validation.success) {
      return validation
    }
    
    return this.request(`/proxy-pool/${id}`, {
      method: 'PUT',
      body: JSON.stringify(validation.data),
    })
  }
  
  async deleteProxy(id: number): Promise<ApiResponse<void>> {
    return this.request(`/proxy-pool/${id}`, {
      method: 'DELETE',
    })
  }
  
  async testProxy(proxy: any): Promise<ApiResponse<any>> {
    const validation = validateProxy(proxy)
    if (!validation.success) {
      return validation
    }
    
    return this.request('/test-proxy', {
      method: 'POST',
      body: JSON.stringify({ proxy: validation.data }),
    })
  }
  
  async testMultipleProxies(proxies: any[]): Promise<ApiResponse<any[]>> {
    return this.request('/test-multiple-proxies', {
      method: 'POST',
      body: JSON.stringify({ proxies }),
    })
  }
  
  async testMultiUrl(proxy: any, urls: string[]): Promise<ApiResponse<any>> {
    const validation = validateProxy(proxy)
    if (!validation.success) {
      return validation
    }
    
    return this.request('/test-multi-url', {
      method: 'POST',
      body: JSON.stringify({ 
        proxy: validation.data, 
        urls 
      }),
    })
  }
  
  // Bulk operations
  async bulkOperation(action: string, ids: number[], updates?: any): Promise<ApiResponse<any>> {
    const validation = validateBulkOperation({ action, ids, updates })
    if (!validation.success) {
      return validation
    }
    
    return this.request('/proxy-pool/bulk', {
      method: 'POST',
      body: JSON.stringify(validation.data),
    })
  }
  
  // Statistics
  async getProxyStats(): Promise<ApiResponse<any>> {
    return this.request('/proxy-stats')
  }
  
  // Performance
  async getPerformanceMetrics(): Promise<ApiResponse<any>> {
    return this.request('/performance-metrics')
  }
  
  // Health monitoring
  async getHealthMonitoring(): Promise<ApiResponse<any>> {
    return this.request('/health-monitoring')
  }
  
  // AI Analysis
  async getAiAnalysis(): Promise<ApiResponse<any>> {
    return this.request('/ai-analysis')
  }
  
  async applyRecommendation(recommendation: any): Promise<ApiResponse<any>> {
    return this.request('/apply-recommendation', {
      method: 'POST',
      body: JSON.stringify(recommendation),
    })
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Hook for using API client
export function useApiClient() {
  return apiClient
}

// Utility functions for common operations
export const proxyApi = {
  // Get all proxies
  getAll: () => apiClient.getProxies(),
  
  // Add new proxy
  add: (proxy: any) => apiClient.addProxy(proxy),
  
  // Update proxy
  update: (id: number, updates: any) => apiClient.updateProxy(id, updates),
  
  // Delete proxy
  delete: (id: number) => apiClient.deleteProxy(id),
  
  // Test single proxy
  test: (proxy: any) => apiClient.testProxy(proxy),
  
  // Test multiple proxies
  testMultiple: (proxies: any[]) => apiClient.testMultipleProxies(proxies),
  
  // Test with multiple URLs
  testMultiUrl: (proxy: any, urls: string[]) => apiClient.testMultiUrl(proxy, urls),
  
  // Bulk operations
  bulkDelete: (ids: number[]) => apiClient.bulkOperation('delete', ids),
  bulkUpdate: (ids: number[], updates: any) => apiClient.bulkOperation('update', ids, updates),
  bulkTest: (ids: number[]) => apiClient.bulkOperation('test', ids),
  
  // Statistics
  getStats: () => apiClient.getProxyStats(),
}

export const performanceApi = {
  getMetrics: () => apiClient.getPerformanceMetrics(),
}

export const monitoringApi = {
  getHealth: () => apiClient.getHealthMonitoring(),
}

export const aiApi = {
  getAnalysis: () => apiClient.getAiAnalysis(),
  applyRecommendation: (recommendation: any) => apiClient.applyRecommendation(recommendation),
}
