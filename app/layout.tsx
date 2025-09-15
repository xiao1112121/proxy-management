import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import { LanguageProvider } from '@/lib/i18n'
import { AuthProvider } from '@/contexts/AuthContext'
import React from 'react'
import BaiduAnalytics from '@/components/BaiduAnalytics'

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
      <head>
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-BRQRFJ334D"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-BRQRFJ334D');
            `,
          }}
        />
        
        {/* Baidu Analytics */}
        <BaiduAnalytics />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <Providers>
              <div className="min-h-screen bg-gray-50">
                {children}
              </div>
            </Providers>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
