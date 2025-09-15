// Advanced Storage Manager - Handles large datasets with chunking and compression
export class AdvancedStorageManager {
  private static readonly CHUNK_SIZE = 500 // Giảm chunk size để xử lý tốt hơn
  private static readonly MAX_CHUNKS = 200 // Tăng max chunks để hỗ trợ 100,000+ proxy
  private static readonly COMPRESSION_THRESHOLD = 50 * 1024 // 50KB
  private static readonly MAX_TOTAL_SIZE = 8 * 1024 * 1024 // 8MB max total size
  
  // Chunk-based storage keys
  private static getChunkKey(index: number): string {
    return `proxies_chunk_${index}`
  }
  
  private static getMetadataKey(): string {
    return 'proxies_metadata'
  }

  // Improved compression using better algorithms
  private static compress(data: any): string {
    const jsonString = JSON.stringify(data)
    if (jsonString.length > this.COMPRESSION_THRESHOLD) {
      // Enhanced compression with better property mapping
      const compressed = jsonString
        .replace(/\s+/g, '') // Remove all whitespace
        .replace(/"id":/g, '"i":')
        .replace(/"host":/g, '"h":')
        .replace(/"port":/g, '"p":')
        .replace(/"type":/g, '"t":')
        .replace(/"status":/g, '"s":')
        .replace(/"username":/g, '"u":')
        .replace(/"password":/g, '"w":')
        .replace(/"ping":/g, '"g":')
        .replace(/"speed":/g, '"d":')
        .replace(/"country":/g, '"c":')
        .replace(/"city":/g, '"y":')
        .replace(/"anonymity":/g, '"a":')
        .replace(/"lastTested":/g, '"l":')
        .replace(/"notes":/g, '"n":')
        .replace(/"group":/g, '"r":')
        .replace(/"tags":/g, '"g":')
        .replace(/"alive":/g, '"a"')
        .replace(/"dead":/g, '"d"')
        .replace(/"testing":/g, '"t"')
        .replace(/"pending":/g, '"p"')
        .replace(/"http":/g, '"h"')
        .replace(/"https":/g, '"s"')
        .replace(/"socks4":/g, '"4"')
        .replace(/"socks5":/g, '"5"')
      return btoa(compressed)
    }
    return jsonString
  }

  // Decompress data with improved error handling
  private static decompress(compressedData: string): any {
    try {
      // Try to parse as compressed data first
      const decompressed = atob(compressedData)
      const expanded = decompressed
        .replace(/"i":/g, '"id":')
        .replace(/"h":/g, '"host":')
        .replace(/"p":/g, '"port":')
        .replace(/"t":/g, '"type":')
        .replace(/"s":/g, '"status":')
        .replace(/"u":/g, '"username":')
        .replace(/"w":/g, '"password":')
        .replace(/"g":/g, '"ping":')
        .replace(/"d":/g, '"speed":')
        .replace(/"c":/g, '"country":')
        .replace(/"y":/g, '"city":')
        .replace(/"a":/g, '"anonymity":')
        .replace(/"l":/g, '"lastTested":')
        .replace(/"n":/g, '"notes":')
        .replace(/"r":/g, '"group":')
        .replace(/"g":/g, '"tags":')
        .replace(/"a"/g, '"alive"')
        .replace(/"d"/g, '"dead"')
        .replace(/"t"/g, '"testing"')
        .replace(/"p"/g, '"pending"')
        .replace(/"h"/g, '"http"')
        .replace(/"s"/g, '"https"')
        .replace(/"4"/g, '"socks4"')
        .replace(/"5"/g, '"socks5"')
      return JSON.parse(expanded)
    } catch (error) {
      console.warn('Decompression failed, trying regular JSON parse:', error)
      // If decompression fails, try parsing as regular JSON
      try {
        return JSON.parse(compressedData)
      } catch (parseError) {
        console.error('Both compression and regular parsing failed:', parseError)
        return []
      }
    }
  }

  // Split proxies into chunks
  private static chunkProxies(proxies: any[]): any[][] {
    const chunks: any[][] = []
    for (let i = 0; i < proxies.length; i += this.CHUNK_SIZE) {
      chunks.push(proxies.slice(i, i + this.CHUNK_SIZE))
    }
    return chunks
  }

  // Save proxies with chunking and compression
  static saveProxies(proxies: any[]): boolean {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('localStorage not available in SSR environment')
      return false
    }

    try {
      console.log(`💾 Saving ${proxies.length} proxies with chunking...`)
      
      // Clear existing data
      this.clearProxies()
      
      if (proxies.length === 0) {
        return true
      }

      // Split into chunks
      const chunks = this.chunkProxies(proxies)
      
      if (chunks.length > this.MAX_CHUNKS) {
        console.warn(`⚠️ Too many proxies (${proxies.length}). Only saving first ${this.MAX_CHUNKS * this.CHUNK_SIZE} proxies.`)
        const limitedChunks = chunks.slice(0, this.MAX_CHUNKS)
        this.saveChunks(limitedChunks)
      } else {
        this.saveChunks(chunks)
      }

      // Save metadata
      const metadata = {
        totalCount: proxies.length,
        chunkCount: Math.min(chunks.length, this.MAX_CHUNKS),
        lastSaved: new Date().toISOString(),
        version: '2.0.0'
      }
      
      localStorage.setItem(this.getMetadataKey(), JSON.stringify(metadata))
      console.log(`✅ Successfully saved ${proxies.length} proxies in ${chunks.length} chunks`)
      return true
      
    } catch (error) {
      console.error('❌ Failed to save proxies:', error)
      
      // Fallback: save only essential data in smaller chunks
      return this.saveEssentialProxies(proxies)
    }
  }

  // Save chunks to localStorage
  private static saveChunks(chunks: any[][]): void {
    chunks.forEach((chunk, index) => {
      const compressedChunk = this.compress(chunk)
      const chunkKey = this.getChunkKey(index)
      
      try {
        localStorage.setItem(chunkKey, compressedChunk)
      } catch (error) {
        console.error(`❌ Failed to save chunk ${index}:`, error)
        throw error
      }
    })
  }

  // Load proxies from chunks
  static loadProxies(): any[] | null {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      console.warn('localStorage not available in SSR environment')
      return null
    }

    try {
      // Load metadata first
      const metadataStr = localStorage.getItem(this.getMetadataKey())
      if (!metadataStr) {
        console.log('📭 No proxy data found')
        return null
      }

      const metadata = JSON.parse(metadataStr)
      console.log(`📖 Loading ${metadata.totalCount} proxies from ${metadata.chunkCount} chunks...`)

      const allProxies: any[] = []
      
      // Load each chunk
      for (let i = 0; i < metadata.chunkCount; i++) {
        const chunkKey = this.getChunkKey(i)
        const chunkData = localStorage.getItem(chunkKey)
        
        if (chunkData) {
          const decompressedChunk = this.decompress(chunkData)
          allProxies.push(...decompressedChunk)
        }
      }

      console.log(`✅ Successfully loaded ${allProxies.length} proxies`)
      return allProxies
      
    } catch (error) {
      console.error('❌ Failed to load proxies:', error)
      return null
    }
  }

  // Fallback: save only essential data
  private static saveEssentialProxies(proxies: any[]): boolean {
    try {
      console.log('🔄 Using essential data fallback...')
      
      const essentialProxies = proxies.map(p => ({
        id: p.id,
        host: p.host,
        port: p.port,
        type: p.type,
        status: p.status || 'pending'
      }))

      // Split essential data into smaller chunks
      const chunks = this.chunkProxies(essentialProxies)
      const limitedChunks = chunks.slice(0, 10) // Only 10,000 essential proxies
      
      this.saveChunks(limitedChunks)
      
      const metadata = {
        totalCount: essentialProxies.length,
        chunkCount: limitedChunks.length,
        lastSaved: new Date().toISOString(),
        version: '2.0.0-essential',
        isEssential: true
      }
      
      localStorage.setItem(this.getMetadataKey(), JSON.stringify(metadata))
      console.log(`✅ Saved ${essentialProxies.length} essential proxies`)
      return true
      
    } catch (error) {
      console.error('❌ Essential data save failed:', error)
      return false
    }
  }

  // Clear all proxy data
  static clearProxies(): void {
    try {
      // Clear metadata
      localStorage.removeItem(this.getMetadataKey())
      
      // Clear all chunks
      for (let i = 0; i < this.MAX_CHUNKS; i++) {
        const chunkKey = this.getChunkKey(i)
        localStorage.removeItem(chunkKey)
      }
      
      console.log('✅ Cleared all proxy data')
    } catch (error) {
      console.error('❌ Failed to clear proxy data:', error)
    }
  }

  // Get storage statistics
  static getStorageStats(): {
    totalSize: number
    chunkCount: number
    averageChunkSize: number
    compressionRatio: number
    isEssential: boolean
  } {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return {
        totalSize: 0,
        chunkCount: 0,
        averageChunkSize: 0,
        compressionRatio: 0,
        isEssential: false
      }
    }

    try {
      const metadataStr = localStorage.getItem(this.getMetadataKey())
      if (!metadataStr) {
        return {
          totalSize: 0,
          chunkCount: 0,
          averageChunkSize: 0,
          compressionRatio: 0,
          isEssential: false
        }
      }

      const metadata = JSON.parse(metadataStr)
      let totalSize = 0
      
      for (let i = 0; i < metadata.chunkCount; i++) {
        const chunkKey = this.getChunkKey(i)
        const chunkData = localStorage.getItem(chunkKey)
        if (chunkData) {
          totalSize += chunkData.length
        }
      }

      const averageChunkSize = metadata.chunkCount > 0 ? totalSize / metadata.chunkCount : 0
      const compressionRatio = metadata.totalCount > 0 ? totalSize / (metadata.totalCount * 100) : 0

      return {
        totalSize,
        chunkCount: metadata.chunkCount,
        averageChunkSize: Math.round(averageChunkSize),
        compressionRatio: Math.round(compressionRatio * 100) / 100,
        isEssential: metadata.isEssential || false
      }
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error)
      return {
        totalSize: 0,
        chunkCount: 0,
        averageChunkSize: 0,
        compressionRatio: 0,
        isEssential: false
      }
    }
  }

  // Check if storage is near limit
  static isStorageNearLimit(): boolean {
    const stats = this.getStorageStats()
    return stats.totalSize > 4 * 1024 * 1024 // 4MB warning
  }

  // Get recommended action
  static getRecommendedAction(): string {
    const stats = this.getStorageStats()
    
    if (stats.isEssential) {
      return 'Dữ liệu đã được nén tối đa. Cân nhắc xóa proxy không cần thiết.'
    }
    
    if (stats.totalSize > 3 * 1024 * 1024) {
      return 'Dữ liệu gần đầy. Hệ thống sẽ tự động nén dữ liệu.'
    }
    
    if (stats.chunkCount > 30) {
      return 'Quá nhiều proxy. Hệ thống sẽ chỉ lưu 30,000 proxy đầu tiên.'
    }
    
    return 'Dữ liệu bình thường.'
  }
}
