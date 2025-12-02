'use client'

import { SessionProvider } from 'next-auth/react'
import DevConsoleSilencer from '@/components/dev/DevConsoleSilencer'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0} refetchWhenOffline={false}>
      <DevConsoleSilencer />
      {children}
    </SessionProvider>
  )
}
