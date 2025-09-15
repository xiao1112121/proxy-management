'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    _hmt: any[]
  }
}

export default function BaiduAnalytics() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Baidu Analytics
      window._hmt = window._hmt || []
      
      const script = document.createElement('script')
      script.src = 'https://hm.baidu.com/hm.js?9ddf465d5d56e4d1b52b331b7b64eca6'
      script.async = true
      
      const firstScript = document.getElementsByTagName('script')[0]
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript)
      }
    }
  }, [])

  return null
}
