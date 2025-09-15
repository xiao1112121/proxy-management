'use client'

import { useEffect } from 'react'

export default function IubendaConsent() {
  useEffect(() => {
    // Tạo script element cho Iubenda configuration
    const configScript = document.createElement('script')
    configScript.type = 'text/javascript'
    configScript.innerHTML = `
      var _iub = _iub || [];
      _iub.csConfiguration = {
        "siteId": 4240212,
        "cookiePolicyId": 56584846,
        "lang": "vi",
        "storage": {
          "useSiteId": true
        }
      };
    `
    document.head.appendChild(configScript)

    // Tạo script element cho autoblocking
    const autoblockingScript = document.createElement('script')
    autoblockingScript.type = 'text/javascript'
    autoblockingScript.src = 'https://cs.iubenda.com/autoblocking/4240212.js'
    document.head.appendChild(autoblockingScript)

    // Tạo script element cho GPP stub
    const gppStubScript = document.createElement('script')
    gppStubScript.type = 'text/javascript'
    gppStubScript.src = '//cdn.iubenda.com/cs/gpp/stub.js'
    document.head.appendChild(gppStubScript)

    // Tạo script element cho Iubenda CS
    const iubendaScript = document.createElement('script')
    iubendaScript.type = 'text/javascript'
    iubendaScript.src = '//cdn.iubenda.com/cs/iubenda_cs.js'
    iubendaScript.charset = 'UTF-8'
    iubendaScript.async = true
    document.head.appendChild(iubendaScript)

    // Cleanup function
    return () => {
      // Xóa các script khi component unmount
      document.head.removeChild(configScript)
      document.head.removeChild(autoblockingScript)
      document.head.removeChild(gppStubScript)
      document.head.removeChild(iubendaScript)
    }
  }, [])

  return null
}
