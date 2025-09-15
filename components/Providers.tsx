'use client'

import { SessionProvider } from 'next-auth/react'
import React from 'react'
import { LanguageProvider } from '@/lib/i18n'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <LanguageProvider>
      <SessionProvider>
        {children}
      </SessionProvider>
    </LanguageProvider>
  )
}
