// Các loại proxy phổ biến trên thế giới
export type ProxyType = 
  // HTTP Proxies
  | 'http' | 'https' | 'http-connect' | 'https-connect'
  // SOCKS Proxies  
  | 'socks4' | 'socks4a' | 'socks5'
  // SSH Tunnels
  | 'ssh' | 'ssh-tunnel'
  // VPN Protocols
  | 'openvpn' | 'wireguard' | 'l2tp' | 'pptp' | 'ikev2'
  // Specialized Proxies
  | 'residential' | 'datacenter' | 'mobile' | 'isp' | 'static' | 'rotating'
  // Protocol-specific
  | 'ftp' | 'smtp' | 'pop3' | 'imap' | 'telnet'
  // Cloud & CDN
  | 'cloudflare' | 'cloudfront' | 'fastly'
  // Tor & Anonymity
  | 'tor' | 'i2p' | 'freenet'
  // Gaming & Streaming
  | 'gaming' | 'streaming' | 'cdn'
  // Enterprise
  | 'enterprise' | 'corporate' | 'firewall'
  // Custom/Unknown
  | 'custom' | 'unknown'

// Các định dạng proxy phổ biến
export type ProxyFormat = 
  | 'host:port'
  | 'host:port:username:password'
  | 'type://host:port'
  | 'type://username:password@host:port'
  | 'host:port:username:password:type'
  | 'json'
  | 'csv'
  | 'xml'
  | 'yaml'
  | 'url-encoded'

// Các giao thức hỗ trợ
export type SupportedProtocol = 
  | 'http' | 'https' | 'socks4' | 'socks4a' | 'socks5'
  | 'ssh' | 'ftp' | 'smtp' | 'pop3' | 'imap'
  | 'tcp' | 'udp' | 'icmp'

// Thông tin bảo mật và ẩn danh
export interface SecurityInfo {
  anonymity: 'transparent' | 'anonymous' | 'elite' | 'unknown'
  encryption: boolean
  supportsHttps: boolean
  supportsSocks: boolean
  supportsUDP: boolean
  supportsIPv6: boolean
  supportsAuthentication: boolean
  supportsCompression: boolean
  supportsChaining: boolean
}

// Thông tin địa lý mở rộng
export interface GeoInfo {
  country: string
  countryCode: string
  region: string
  city: string
  latitude?: number
  longitude?: number
  timezone: string
  isp: string
  organization: string
  asn?: number
}

// Thông tin hiệu suất
export interface PerformanceInfo {
  ping: number
  speed: number // KB/s
  bandwidth: number // Mbps
  uptime: number // percentage
  responseTime: number
  throughput: number
  latency: number
  jitter: number
}

// Thông tin kiểm tra bảo mật
export interface SecurityTest {
  dnsLeak: boolean
  webrtcLeak: boolean
  ipLeak: boolean
  headerLeak: boolean
  timestampLeak: boolean
  fingerprinting: boolean
  torCheck: boolean
  proxyCheck: boolean
}

// Simple Proxy interface for backward compatibility
export interface SimpleProxy {
  id: number
  host: string
  port: number
  username?: string
  password?: string
  type: 'http' | 'https' | 'socks4' | 'socks5' | 'residential' | 'datacenter' | 'mobile'
  status: 'alive' | 'dead' | 'pending' | 'testing'
  ping?: number
  speed?: number
  uptime?: number
  location?: string
  country?: string
  city?: string
  anonymity?: 'transparent' | 'anonymous' | 'elite'
  lastTested?: string
  group?: string
  notes?: string
  failCount?: number
  successCount?: number
  isSelected?: boolean
  publicIP?: string
  dnsLeak?: boolean
  webrtcLeak?: boolean
  userAgent?: string
}

export interface Proxy {
  id: number
  host: string
  port: number
  username?: string
  password?: string
  type: ProxyType
  protocol: SupportedProtocol
  format: ProxyFormat
  status: 'alive' | 'dead' | 'pending' | 'testing' | 'unknown'
  
  // Thông tin cơ bản
  name?: string
  description?: string
  group?: string
  tags?: string[]
  notes?: string
  
  // Thông tin bảo mật
  security: SecurityInfo
  
  // Thông tin địa lý
  geo: GeoInfo
  
  // Thông tin hiệu suất
  performance: PerformanceInfo
  
  // Thông tin kiểm tra bảo mật
  securityTest: SecurityTest
  
  // Thông tin thống kê
  failCount: number
  successCount: number
  lastTested?: string
  firstAdded: string
  lastUsed?: string
  
  // Thông tin kỹ thuật
  userAgent?: string
  customHeaders?: Record<string, string>
  proxyChain?: Proxy[]
  parentProxy?: number
  
  // Trạng thái UI
  isSelected?: boolean
  isFavorite?: boolean
  isHidden?: boolean
  
  // Thông tin bổ sung
  source?: string
  provider?: string
  cost?: number
  currency?: string
  expiresAt?: string
  maxConnections?: number
  currentConnections?: number
}

export interface TestResult {
  id: number
  success: boolean
  ping: number
  speed: number
  publicIP?: string
  country?: string
  city?: string
  anonymity?: string
  dnsLeak?: boolean
  webrtcLeak?: boolean
  error?: string
  timestamp: string
}

export interface TestSettings {
  timeout: number
  testUrl: string
  concurrent: number
  testAnonymity: boolean
  testDnsLeak: boolean
  testWebrtcLeak: boolean
  customUserAgent?: string
  customTestUrls?: {
    ipCheck: string
    speedTest: string
    anonymityTest: string
    geolocation: string
  }
}

export interface TestUrlConfig {
  name: string
  url: string
  type: 'ip' | 'speed' | 'anonymity' | 'geolocation' | 'dns' | 'webrtc'
  description: string
  isDefault: boolean
}

export interface ProxyStats {
  total: number
  alive: number
  dead: number
  pending: number
  averagePing: number
  averageSpeed: number
  successRate: number
  countries: Record<string, number>
  types: Record<string, number>
  anonymity: Record<string, number>
}

export interface LogEntry {
  id: number
  proxyId: number
  action: string
  result: 'success' | 'error' | 'warning'
  message: string
  timestamp: string
  details?: any
}
