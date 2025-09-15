declare global {
  interface Window {
    _hmt: any[]
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export {}
