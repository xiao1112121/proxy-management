'use client'

import React from 'react'
import { useLanguage } from '@/lib/i18n'
import { ProxyType } from '@/types/proxy'
import { 
  Globe, 
  Shield, 
  Lock, 
  Wifi,
  Server, 
  Smartphone, 
  Building, 
  Cloud,
  Eye,
  Gamepad2,
  Briefcase,
  Settings,
  HelpCircle
} from 'lucide-react'

interface ProxyTypeInfoProps {
  selectedType?: ProxyType
  onTypeSelect?: (type: ProxyType) => void
}

export default function ProxyTypeInfo({ selectedType, onTypeSelect }: ProxyTypeInfoProps) {
  const { t } = useLanguage()

  const proxyCategories = [
    {
      name: 'HTTP Proxies',
    icon: Globe,
      color: 'from-blue-500 to-blue-600',
      types: [
        { type: 'http', name: t('proxyTypes.http'), description: 'Standard HTTP proxy' },
        { type: 'https', name: t('proxyTypes.https'), description: 'Secure HTTP proxy' },
        { type: 'http-connect', name: t('proxyTypes.httpConnect'), description: 'HTTP CONNECT method' },
        { type: 'https-connect', name: t('proxyTypes.httpsConnect'), description: 'HTTPS CONNECT method' }
      ]
    },
    {
      name: 'SOCKS Proxies',
    icon: Shield,
      color: 'from-green-500 to-green-600',
      types: [
        { type: 'socks4', name: t('proxyTypes.socks4'), description: 'SOCKS4 protocol' },
        { type: 'socks4a', name: t('proxyTypes.socks4a'), description: 'SOCKS4A with DNS resolution' },
        { type: 'socks5', name: t('proxyTypes.socks5'), description: 'SOCKS5 protocol' }
      ]
    },
    {
      name: 'SSH Tunnels',
      icon: Lock,
      color: 'from-purple-500 to-purple-600',
      types: [
        { type: 'ssh', name: t('proxyTypes.ssh'), description: 'SSH tunnel' },
        { type: 'ssh-tunnel', name: t('proxyTypes.sshTunnel'), description: 'SSH tunnel proxy' }
      ]
    },
    {
      name: 'VPN Protocols',
      icon: Wifi,
      color: 'from-orange-500 to-orange-600',
      types: [
        { type: 'openvpn', name: t('proxyTypes.openvpn'), description: 'OpenVPN protocol' },
        { type: 'wireguard', name: t('proxyTypes.wireguard'), description: 'WireGuard protocol' },
        { type: 'l2tp', name: t('proxyTypes.l2tp'), description: 'L2TP protocol' },
        { type: 'pptp', name: t('proxyTypes.pptp'), description: 'PPTP protocol' },
        { type: 'ikev2', name: t('proxyTypes.ikev2'), description: 'IKEv2 protocol' }
      ]
    },
    {
      name: 'Specialized Proxies',
    icon: Server,
      color: 'from-teal-500 to-teal-600',
      types: [
        { type: 'residential', name: t('proxyTypes.residential'), description: 'Residential IP proxy' },
        { type: 'datacenter', name: t('proxyTypes.datacenter'), description: 'Datacenter proxy' },
        { type: 'mobile', name: t('proxyTypes.mobile'), description: 'Mobile proxy' },
        { type: 'isp', name: t('proxyTypes.isp'), description: 'ISP proxy' },
        { type: 'static', name: t('proxyTypes.static'), description: 'Static IP proxy' },
        { type: 'rotating', name: t('proxyTypes.rotating'), description: 'Rotating IP proxy' }
      ]
    },
    {
      name: 'Protocol-specific',
      icon: Settings,
      color: 'from-indigo-500 to-indigo-600',
      types: [
        { type: 'ftp', name: t('proxyTypes.ftp'), description: 'FTP protocol' },
        { type: 'smtp', name: t('proxyTypes.smtp'), description: 'SMTP protocol' },
        { type: 'pop3', name: t('proxyTypes.pop3'), description: 'POP3 protocol' },
        { type: 'imap', name: t('proxyTypes.imap'), description: 'IMAP protocol' },
        { type: 'telnet', name: t('proxyTypes.telnet'), description: 'Telnet protocol' }
      ]
    },
    {
      name: 'Cloud & CDN',
    icon: Cloud,
      color: 'from-cyan-500 to-cyan-600',
      types: [
        { type: 'cloudflare', name: t('proxyTypes.cloudflare'), description: 'Cloudflare proxy' },
        { type: 'cloudfront', name: t('proxyTypes.cloudfront'), description: 'CloudFront proxy' },
        { type: 'fastly', name: t('proxyTypes.fastly'), description: 'Fastly proxy' }
      ]
    },
    {
      name: 'Tor & Anonymity',
      icon: Eye,
      color: 'from-red-500 to-red-600',
      types: [
        { type: 'tor', name: t('proxyTypes.tor'), description: 'Tor network' },
        { type: 'i2p', name: t('proxyTypes.i2p'), description: 'I2P network' },
        { type: 'freenet', name: t('proxyTypes.freenet'), description: 'Freenet network' }
      ]
    },
    {
      name: 'Gaming & Streaming',
      icon: Gamepad2,
      color: 'from-pink-500 to-pink-600',
      types: [
        { type: 'gaming', name: t('proxyTypes.gaming'), description: 'Gaming optimized' },
        { type: 'streaming', name: t('proxyTypes.streaming'), description: 'Streaming optimized' },
        { type: 'cdn', name: t('proxyTypes.cdn'), description: 'CDN proxy' }
      ]
    },
    {
      name: 'Enterprise',
      icon: Briefcase,
      color: 'from-gray-500 to-gray-600',
      types: [
        { type: 'enterprise', name: t('proxyTypes.enterprise'), description: 'Enterprise proxy' },
        { type: 'corporate', name: t('proxyTypes.corporate'), description: 'Corporate proxy' },
        { type: 'firewall', name: t('proxyTypes.firewall'), description: 'Firewall proxy' }
      ]
    },
    {
      name: 'Custom & Unknown',
    icon: HelpCircle,
      color: 'from-slate-500 to-slate-600',
      types: [
        { type: 'custom', name: t('proxyTypes.custom'), description: 'Custom proxy type' },
        { type: 'unknown', name: t('proxyTypes.unknown'), description: 'Unknown proxy type' }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Supported Proxy Types
        </h2>
        <p className="text-gray-600">
          Choose from {proxyCategories.reduce((total, cat) => total + cat.types.length, 0)} different proxy types
        </p>
          </div>
          
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proxyCategories.map((category, categoryIndex) => {
          const IconComponent = category.icon
          return (
            <div key={categoryIndex} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color} text-white mr-3`}>
                  <IconComponent className="h-5 w-5" />
            </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {category.name}
                </h3>
          </div>
          
          <div className="space-y-2">
                {category.types.map((proxyType, typeIndex) => (
                  <button
                    key={typeIndex}
                    onClick={() => onTypeSelect?.(proxyType.type as ProxyType)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      selectedType === proxyType.type
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {proxyType.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {proxyType.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
            </div>
            
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <HelpCircle className="h-5 w-5 text-blue-600" />
              </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">
              Need Help Choosing?
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              Most users start with HTTP or SOCKS5 proxies. For maximum anonymity, 
              consider Tor or residential proxies. For enterprise use, check out 
              our enterprise and corporate options.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
