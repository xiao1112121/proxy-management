import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import { LanguageProvider } from '@/lib/i18n'
import React from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Proxy Manager - Quản lý Proxy Chuyên Nghiệp',
  description: 'Ứng dụng quản lý và kiểm tra proxy chuyên nghiệp',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <LanguageProvider>
          <Providers>
            <div className="min-h-screen bg-gray-50">
              {children}
            </div>
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  )
}
