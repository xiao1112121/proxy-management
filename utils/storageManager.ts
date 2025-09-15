// Storage Manager - Handles localStorage/sessionStorage with fallbacks
export class StorageManager {
  private static readonly MAX_LOCALSTORAGE_SIZE = 4 * 1024 * 1024 // 4MB
  private static readonly STORAGE_KEYS = {
    PROXIES: 'proxies',
    PROXIES_ESSENTIAL: 'proxies_essential',
    SETTINGS: 'proxy_settings'
  }

  // Save data with automatic fallback
  static saveProxies(proxies: any[]): boolean {
    try {
      const data = JSON.stringify(proxies)
      
      // Check data size
      if (data.length > this.MAX_LOCALSTORAGE_SIZE) {
        console.warn('Data too large for localStorage, using sessionStorage')
        return this.saveToSessionStorage(this.STORAGE_KEYS.PROXIES, data)
      }
      
      // Try localStorage first
      localStorage.setItem(this.STORAGE_KEYS.PROXIES, data)
      console.log('✅ Saved proxies to localStorage')
      return true
      
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error)
      
      // Fallback to sessionStorage
      try {
        const data = JSON.stringify(proxies)
        return this.saveToSessionStorage(this.STORAGE_KEYS.PROXIES, data)
      } catch (sessionError) {
        console.error('❌ Failed to save to sessionStorage:', sessionError)
        
        // Last resort: save only essential data
        return this.saveEssentialProxies(proxies)
      }
    }
  }

  // Load data with automatic fallback
  static loadProxies(): any[] | null {
    // Try localStorage first
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.PROXIES)
      if (data) {
        console.log('✅ Loaded proxies from localStorage')
        return JSON.parse(data)
      }
    } catch (error) {
      console.warn('⚠️ localStorage failed, trying sessionStorage')
    }
    
    // Try sessionStorage
    try {
      const data = sessionStorage.getItem(this.STORAGE_KEYS.PROXIES)
      if (data) {
        console.log('✅ Loaded proxies from sessionStorage')
        return JSON.parse(data)
      }
    } catch (error) {
      console.warn('⚠️ sessionStorage failed, trying essential data')
    }
    
    // Try essential data
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.PROXIES_ESSENTIAL)
      if (data) {
        console.log('✅ Loaded essential proxies from localStorage')
        return JSON.parse(data)
      }
    } catch (error) {
      console.error('❌ All storage methods failed')
    }
    
    return null
  }

  // Save to sessionStorage
  private static saveToSessionStorage(key: string, data: string): boolean {
    try {
      sessionStorage.setItem(key, data)
      console.log('✅ Saved to sessionStorage')
      return true
    } catch (error) {
      console.error('❌ sessionStorage failed:', error)
      return false
    }
  }

  // Save only essential proxy data
  private static saveEssentialProxies(proxies: any[]): boolean {
    try {
      const essentialProxies = proxies.map(p => ({
        id: p.id,
        host: p.host,
        port: p.port,
        type: p.type,
        status: p.status,
        username: p.username,
        password: p.password
      }))
      
      const data = JSON.stringify(essentialProxies)
      localStorage.setItem(this.STORAGE_KEYS.PROXIES_ESSENTIAL, data)
      console.log('✅ Saved essential proxies to localStorage')
      return true
    } catch (error) {
      console.error('❌ Failed to save essential proxies:', error)
      return false
    }
  }

  // Clear all proxy data
  static clearProxies(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.PROXIES)
      sessionStorage.removeItem(this.STORAGE_KEYS.PROXIES)
      localStorage.removeItem(this.STORAGE_KEYS.PROXIES_ESSENTIAL)
      console.log('✅ Cleared all proxy data')
    } catch (error) {
      console.error('❌ Failed to clear proxy data:', error)
    }
  }

  // Get storage usage info
  static getStorageInfo(): { 
    localStorage: { used: number; available: boolean }
    sessionStorage: { used: number; available: boolean }
  } {
    const info = {
      localStorage: { used: 0, available: false },
      sessionStorage: { used: 0, available: false }
    }

    try {
      const localData = localStorage.getItem(this.STORAGE_KEYS.PROXIES) || ''
      info.localStorage.used = new Blob([localData]).size
      info.localStorage.available = true
    } catch (error) {
      console.warn('localStorage not available')
    }

    try {
      const sessionData = sessionStorage.getItem(this.STORAGE_KEYS.PROXIES) || ''
      info.sessionStorage.used = new Blob([sessionData]).size
      info.sessionStorage.available = true
    } catch (error) {
      console.warn('sessionStorage not available')
    }

    return info
  }
}
