import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
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
        <SessionProvider refetchOnWindowFocus={false} refetchInterval={0} refetchWhenOffline={false}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
