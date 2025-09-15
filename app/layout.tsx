import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import { LanguageProvider } from '@/lib/i18n'
import { AuthProvider } from '@/contexts/AuthContext'
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var _hmt = _hmt || [];
              (function() {
                var hm = document.createElement("script");
                hm.src = "https://hm.baidu.com/hm.js?9ddf465d5d56e4d1b52b331b7b64eca6";
                var s = document.getElementsByTagName("script")[0]; 
                s.parentNode.insertBefore(hm, s);
              })();
            `,
          }}
        />
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
