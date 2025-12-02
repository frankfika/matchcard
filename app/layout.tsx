import type { Metadata } from 'next'
import ClientProviders from '@/components/providers/ClientProviders'
import './globals.css'

export const metadata: Metadata = {
  title: 'SoulSync - 灵魂同频匹配卡',
  description: '创建你的专属匹配名片，寻找同频灵魂',
  keywords: ['交友', '匹配', '名片', 'SoulSync'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
