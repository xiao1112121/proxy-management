'use client'

import { ProxyType, SupportedProtocol } from '@/types/proxy'
import { 
  Globe, 
  Shield, 
  Zap, 
  Lock, 
  Unlock, 
  Wifi,
  WifiOff, 
  Server, 
  Smartphone, 
  Building, 
  Cloud,
  Eye,
  EyeOff,
  Gamepad2,
  Play,
  Database,
  Network,
  Terminal,
  Mail,
  Download,
  Upload,
  RotateCcw,
  Settings,
  HelpCircle
} from 'lucide-react'

interface ProxyTypeInfoProps {
  type: ProxyType
  protocol: SupportedProtocol
  className?: string
}

const typeInfo: Record<ProxyType, {
  name: string
  description: string
  icon: React.ComponentType<any>
  category: string
  features: string[]
  useCases: string[]
  security: 'low' | 'medium' | 'high' | 'very-high'
  speed: 'slow' | 'medium' | 'fast' | 'very-fast'
  reliability: 'low' | 'medium' | 'high' | 'very-high'
}> = {
  // HTTP Proxies
  'http': {
    name: 'HTTP Proxy',
    description: 'Proxy HTTP cơ bản cho web browsing và API calls',
    icon: Globe,
    category: 'Web',
    features: ['Web browsing', 'API calls', 'HTTP requests', 'Basic authentication'],
    useCases: ['Web scraping', 'API testing', 'Content filtering', 'Load balancing'],
    security: 'low',
    speed: 'fast',
    reliability: 'high'
  },
  'https': {
    name: 'HTTPS Proxy',
    description: 'Proxy HTTP với mã hóa SSL/TLS',
    icon: Lock,
    category: 'Web',
    features: ['Encrypted traffic', 'SSL/TLS support', 'Secure browsing', 'Certificate validation'],
    useCases: ['Secure web browsing', 'API calls', 'E-commerce', 'Banking'],
    security: 'high',
    speed: 'fast',
    reliability: 'high'
  },
  'http-connect': {
    name: 'HTTP CONNECT',
    description: 'HTTP CONNECT method cho tunneling',
    icon: Network,
    category: 'Tunneling',
    features: ['Tunneling', 'CONNECT method', 'Port forwarding', 'Protocol agnostic'],
    useCases: ['Tunneling', 'Port forwarding', 'Protocol conversion', 'Firewall bypass'],
    security: 'medium',
    speed: 'medium',
    reliability: 'medium'
  },
  'https-connect': {
    name: 'HTTPS CONNECT',
    description: 'HTTPS CONNECT với mã hóa',
    icon: Shield,
    category: 'Tunneling',
    features: ['Encrypted tunneling', 'SSL/TLS', 'CONNECT method', 'Secure forwarding'],
    useCases: ['Secure tunneling', 'Encrypted port forwarding', 'Corporate networks'],
    security: 'high',
    speed: 'medium',
    reliability: 'high'
  },

  // SOCKS Proxies
  'socks4': {
    name: 'SOCKS4',
    description: 'SOCKS4 proxy cho socket-level connections',
    icon: Server,
    category: 'Socket',
    features: ['Socket-level proxy', 'TCP support', 'Simple protocol', 'Low overhead'],
    useCases: ['Gaming', 'Torrenting', 'P2P applications', 'Legacy systems'],
    security: 'low',
    speed: 'fast',
    reliability: 'high'
  },
  'socks4a': {
    name: 'SOCKS4A',
    description: 'SOCKS4A với DNS resolution support',
    icon: Server,
    category: 'Socket',
    features: ['DNS resolution', 'Domain names', 'SOCKS4 compatible', 'Enhanced features'],
    useCases: ['Gaming', 'Torrenting', 'P2P applications', 'Domain-based routing'],
    security: 'low',
    speed: 'fast',
    reliability: 'high'
  },
  'socks5': {
    name: 'SOCKS5',
    description: 'SOCKS5 proxy với authentication và UDP support',
    icon: Shield,
    category: 'Socket',
    features: ['Authentication', 'UDP support', 'IPv6 support', 'Multiple auth methods'],
    useCases: ['Gaming', 'Torrenting', 'VPN services', 'Secure tunneling'],
    security: 'high',
    speed: 'fast',
    reliability: 'very-high'
  },

  // SSH Tunnels
  'ssh': {
    name: 'SSH Tunnel',
    description: 'SSH tunnel cho secure connections',
    icon: Terminal,
    category: 'Secure',
    features: ['SSH encryption', 'Port forwarding', 'Key-based auth', 'Command execution'],
    useCases: ['Remote access', 'Secure tunneling', 'Port forwarding', 'Server management'],
    security: 'very-high',
    speed: 'medium',
    reliability: 'high'
  },
  'ssh-tunnel': {
    name: 'SSH Tunnel',
    description: 'SSH tunnel chuyên dụng',
    icon: Terminal,
    category: 'Secure',
    features: ['Dedicated tunneling', 'SSH encryption', 'Port forwarding', 'Secure channels'],
    useCases: ['Secure tunneling', 'Port forwarding', 'Remote access', 'Bypass restrictions'],
    security: 'very-high',
    speed: 'medium',
    reliability: 'high'
  },

  // VPN Protocols
  'openvpn': {
    name: 'OpenVPN',
    description: 'OpenVPN protocol cho VPN connections',
    icon: Shield,
    category: 'VPN',
    features: ['Open source', 'Strong encryption', 'Cross-platform', 'Configurable'],
    useCases: ['VPN services', 'Corporate networks', 'Remote access', 'Privacy protection'],
    security: 'very-high',
    speed: 'medium',
    reliability: 'high'
  },
  'wireguard': {
    name: 'WireGuard',
    description: 'WireGuard VPN protocol hiện đại',
    icon: Zap,
    category: 'VPN',
    features: ['Modern crypto', 'Fast performance', 'Simple config', 'Low overhead'],
    useCases: ['VPN services', 'High-speed VPN', 'Mobile VPN', 'Privacy protection'],
    security: 'very-high',
    speed: 'very-fast',
    reliability: 'very-high'
  },
  'l2tp': {
    name: 'L2TP',
    description: 'Layer 2 Tunneling Protocol',
    icon: Network,
    category: 'VPN',
    features: ['Layer 2 tunneling', 'IPSec integration', 'Wide support', 'Standard protocol'],
    useCases: ['VPN services', 'Corporate networks', 'Remote access', 'Compatibility'],
    security: 'high',
    speed: 'medium',
    reliability: 'high'
  },
  'pptp': {
    name: 'PPTP',
    description: 'Point-to-Point Tunneling Protocol',
    icon: Network,
    category: 'VPN',
    features: ['Simple setup', 'Wide compatibility', 'Built-in support', 'Fast connection'],
    useCases: ['Legacy systems', 'Quick setup', 'Compatibility', 'Basic VPN'],
    security: 'low',
    speed: 'fast',
    reliability: 'medium'
  },
  'ikev2': {
    name: 'IKEv2',
    description: 'Internet Key Exchange version 2',
    icon: Shield,
    category: 'VPN',
    features: ['Mobile-friendly', 'Auto-reconnect', 'Strong crypto', 'Fast handshake'],
    useCases: ['Mobile VPN', 'Corporate networks', 'Auto-reconnect', 'High security'],
    security: 'very-high',
    speed: 'fast',
    reliability: 'very-high'
  },

  // Specialized Proxies
  'residential': {
    name: 'Residential Proxy',
    description: 'Proxy từ IP residential thật',
    icon: Globe,
    category: 'Specialized',
    features: ['Real IP addresses', 'Geographic diversity', 'Hard to detect', 'High anonymity'],
    useCases: ['Web scraping', 'Social media', 'E-commerce', 'Market research'],
    security: 'high',
    speed: 'medium',
    reliability: 'medium'
  },
  'datacenter': {
    name: 'Datacenter Proxy',
    description: 'Proxy từ datacenter servers',
    icon: Database,
    category: 'Specialized',
    features: ['High speed', 'Low cost', 'Stable connection', 'Bulk availability'],
    useCases: ['Web scraping', 'API testing', 'Load testing', 'Development'],
    security: 'medium',
    speed: 'very-fast',
    reliability: 'very-high'
  },
  'mobile': {
    name: 'Mobile Proxy',
    description: 'Proxy từ mobile networks',
    icon: Smartphone,
    category: 'Specialized',
    features: ['Mobile IPs', 'Carrier diversity', 'Geographic spread', 'App testing'],
    useCases: ['Mobile app testing', 'Social media', 'Location-based services', 'Mobile ads'],
    security: 'high',
    speed: 'slow',
    reliability: 'low'
  },
  'isp': {
    name: 'ISP Proxy',
    description: 'Proxy từ ISP networks',
    icon: Building,
    category: 'Specialized',
    features: ['ISP IPs', 'High trust', 'Stable connection', 'Geographic accuracy'],
    useCases: ['Web scraping', 'E-commerce', 'Market research', 'Content access'],
    security: 'high',
    speed: 'fast',
    reliability: 'high'
  },
  'static': {
    name: 'Static Proxy',
    description: 'Proxy với IP tĩnh',
    icon: Server,
    category: 'Specialized',
    features: ['Fixed IP', 'Consistent identity', 'Session persistence', 'Reliable connection'],
    useCases: ['Account management', 'Session-based apps', 'Consistent identity', 'Long-term use'],
    security: 'medium',
    speed: 'fast',
    reliability: 'high'
  },
  'rotating': {
    name: 'Rotating Proxy',
    description: 'Proxy với IP luân phiên',
    icon: RotateCcw,
    category: 'Specialized',
    features: ['IP rotation', 'High anonymity', 'Bulk requests', 'Anti-detection'],
    useCases: ['Web scraping', 'Data collection', 'Anti-detection', 'Bulk operations'],
    security: 'high',
    speed: 'medium',
    reliability: 'medium'
  },

  // Protocol-specific
  'ftp': {
    name: 'FTP Proxy',
    description: 'Proxy cho FTP protocol',
    icon: Upload,
    category: 'Protocol',
    features: ['FTP protocol', 'File transfer', 'Passive mode', 'Active mode'],
    useCases: ['File transfer', 'FTP services', 'Data migration', 'Backup systems'],
    security: 'low',
    speed: 'medium',
    reliability: 'medium'
  },
  'smtp': {
    name: 'SMTP Proxy',
    description: 'Proxy cho SMTP email',
    icon: Mail,
    category: 'Protocol',
    features: ['Email sending', 'SMTP protocol', 'Authentication', 'Relay support'],
    useCases: ['Email services', 'Bulk email', 'Email testing', 'SMTP relay'],
    security: 'medium',
    speed: 'medium',
    reliability: 'high'
  },
  'pop3': {
    name: 'POP3 Proxy',
    description: 'Proxy cho POP3 email',
    icon: Download,
    category: 'Protocol',
    features: ['Email retrieval', 'POP3 protocol', 'Authentication', 'Message download'],
    useCases: ['Email clients', 'Email backup', 'Message retrieval', 'Email migration'],
    security: 'low',
    speed: 'medium',
    reliability: 'medium'
  },
  'imap': {
    name: 'IMAP Proxy',
    description: 'Proxy cho IMAP email',
    icon: Mail,
    category: 'Protocol',
    features: ['Email sync', 'IMAP protocol', 'Folder support', 'Real-time sync'],
    useCases: ['Email clients', 'Email sync', 'Multi-device access', 'Email management'],
    security: 'medium',
    speed: 'medium',
    reliability: 'high'
  },
  'telnet': {
    name: 'Telnet Proxy',
    description: 'Proxy cho Telnet protocol',
    icon: Terminal,
    category: 'Protocol',
    features: ['Remote access', 'Telnet protocol', 'Command execution', 'Text-based'],
    useCases: ['Remote administration', 'Legacy systems', 'Command execution', 'System management'],
    security: 'low',
    speed: 'fast',
    reliability: 'low'
  },

  // Cloud & CDN
  'cloudflare': {
    name: 'Cloudflare Proxy',
    description: 'Proxy qua Cloudflare CDN',
    icon: Cloud,
    category: 'Cloud',
    features: ['CDN integration', 'DDoS protection', 'Global network', 'High performance'],
    useCases: ['Web acceleration', 'DDoS protection', 'Global distribution', 'Performance optimization'],
    security: 'high',
    speed: 'very-fast',
    reliability: 'very-high'
  },
  'cloudfront': {
    name: 'CloudFront Proxy',
    description: 'Proxy qua AWS CloudFront',
    icon: Cloud,
    category: 'Cloud',
    features: ['AWS integration', 'Global edge', 'High performance', 'Scalable'],
    useCases: ['Web acceleration', 'Content delivery', 'Global distribution', 'AWS services'],
    security: 'high',
    speed: 'very-fast',
    reliability: 'very-high'
  },
  'fastly': {
    name: 'Fastly Proxy',
    description: 'Proxy qua Fastly CDN',
    icon: Zap,
    category: 'Cloud',
    features: ['Edge computing', 'Real-time purging', 'High performance', 'Developer-friendly'],
    useCases: ['Web acceleration', 'API acceleration', 'Real-time updates', 'Developer tools'],
    security: 'high',
    speed: 'very-fast',
    reliability: 'very-high'
  },

  // Tor & Anonymity
  'tor': {
    name: 'Tor Proxy',
    description: 'Proxy qua Tor network',
    icon: EyeOff,
    category: 'Anonymity',
    features: ['High anonymity', 'Onion routing', 'Free service', 'Privacy focused'],
    useCases: ['Privacy protection', 'Anonymous browsing', 'Censorship bypass', 'Research'],
    security: 'very-high',
    speed: 'slow',
    reliability: 'low'
  },
  'i2p': {
    name: 'I2P Proxy',
    description: 'Proxy qua I2P network',
    icon: EyeOff,
    category: 'Anonymity',
    features: ['Darknet', 'High anonymity', 'Decentralized', 'Privacy focused'],
    useCases: ['Privacy protection', 'Anonymous communication', 'Censorship bypass', 'Research'],
    security: 'very-high',
    speed: 'slow',
    reliability: 'low'
  },
  'freenet': {
    name: 'Freenet Proxy',
    description: 'Proxy qua Freenet network',
    icon: EyeOff,
    category: 'Anonymity',
    features: ['Decentralized', 'Censorship resistant', 'Free service', 'Privacy focused'],
    useCases: ['Privacy protection', 'Censorship bypass', 'Free speech', 'Research'],
    security: 'very-high',
    speed: 'slow',
    reliability: 'low'
  },

  // Gaming & Streaming
  'gaming': {
    name: 'Gaming Proxy',
    description: 'Proxy tối ưu cho gaming',
    icon: Zap,
    category: 'Gaming',
    features: ['Low latency', 'Stable connection', 'Gaming optimized', 'Anti-lag'],
    useCases: ['Online gaming', 'Gaming servers', 'Latency reduction', 'Gaming performance'],
    security: 'medium',
    speed: 'very-fast',
    reliability: 'very-high'
  },
  'streaming': {
    name: 'Streaming Proxy',
    description: 'Proxy tối ưu cho streaming',
    icon: Play,
    category: 'Streaming',
    features: ['High bandwidth', 'Streaming optimized', 'Content delivery', 'Quality adaptation'],
    useCases: ['Video streaming', 'Live streaming', 'Content delivery', 'Media consumption'],
    security: 'medium',
    speed: 'very-fast',
    reliability: 'high'
  },
  'cdn': {
    name: 'CDN Proxy',
    description: 'Proxy qua Content Delivery Network',
    icon: Globe,
    category: 'CDN',
    features: ['Content delivery', 'Global distribution', 'High performance', 'Caching'],
    useCases: ['Content delivery', 'Web acceleration', 'Global distribution', 'Performance optimization'],
    security: 'high',
    speed: 'very-fast',
    reliability: 'very-high'
  },

  // Enterprise
  'enterprise': {
    name: 'Enterprise Proxy',
    description: 'Proxy cho doanh nghiệp',
    icon: Building,
    category: 'Enterprise',
    features: ['Enterprise features', 'High security', 'Management tools', 'Support'],
    useCases: ['Corporate networks', 'Business applications', 'Security compliance', 'Management'],
    security: 'very-high',
    speed: 'fast',
    reliability: 'very-high'
  },
  'corporate': {
    name: 'Corporate Proxy',
    description: 'Proxy cho công ty',
    icon: Building,
    category: 'Enterprise',
    features: ['Corporate security', 'Policy enforcement', 'Monitoring', 'Compliance'],
    useCases: ['Corporate networks', 'Employee access', 'Security policies', 'Compliance'],
    security: 'very-high',
    speed: 'fast',
    reliability: 'very-high'
  },
  'firewall': {
    name: 'Firewall Proxy',
    description: 'Proxy qua firewall',
    icon: Shield,
    category: 'Enterprise',
    features: ['Firewall integration', 'Security filtering', 'Access control', 'Monitoring'],
    useCases: ['Network security', 'Access control', 'Traffic filtering', 'Security monitoring'],
    security: 'very-high',
    speed: 'medium',
    reliability: 'high'
  },

  // Other
  'custom': {
    name: 'Custom Proxy',
    description: 'Proxy tùy chỉnh',
    icon: Settings,
    category: 'Custom',
    features: ['Custom configuration', 'Flexible setup', 'Specialized features', 'Tailored solution'],
    useCases: ['Specialized needs', 'Custom applications', 'Unique requirements', 'Tailored solutions'],
    security: 'medium',
    speed: 'medium',
    reliability: 'medium'
  },
  'unknown': {
    name: 'Unknown Proxy',
    description: 'Loại proxy không xác định',
    icon: HelpCircle,
    category: 'Unknown',
    features: ['Unknown type', 'Unidentified protocol', 'Generic features', 'Basic functionality'],
    useCases: ['Unknown applications', 'Generic use', 'Testing', 'Exploration'],
    security: 'low',
    speed: 'medium',
    reliability: 'low'
  }
}

export default function ProxyTypeInfo({ type, protocol, className = '' }: ProxyTypeInfoProps) {
  const info = typeInfo[type]
  if (!info) return null

  const Icon = info.icon

  const getSecurityColor = (level: string) => {
    switch (level) {
      case 'very-high': return 'text-green-600 bg-green-100'
      case 'high': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSpeedColor = (level: string) => {
    switch (level) {
      case 'very-fast': return 'text-green-600 bg-green-100'
      case 'fast': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'slow': return 'text-red-600 bg-red-50'
      case 'very-slow': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getReliabilityColor = (level: string) => {
    switch (level) {
      case 'very-high': return 'text-green-600 bg-green-100'
      case 'high': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-red-600 bg-red-50'
      case 'very-low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{info.name}</h3>
            <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
              {info.category}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{info.description}</p>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className={`px-2 py-1 rounded text-xs font-medium text-center ${getSecurityColor(info.security)}`}>
              Bảo mật: {info.security}
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium text-center ${getSpeedColor(info.speed)}`}>
              Tốc độ: {info.speed}
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium text-center ${getReliabilityColor(info.reliability)}`}>
              Độ tin cậy: {info.reliability}
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Tính năng:</h4>
              <div className="flex flex-wrap gap-1">
                {info.features.map((feature, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Ứng dụng:</h4>
              <div className="flex flex-wrap gap-1">
                {info.useCases.map((useCase, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                    {useCase}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
