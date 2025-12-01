import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-zinc-100 font-sans text-zinc-900 relative selection:bg-zinc-900 selection:text-white overflow-hidden">
      {/* Header */}
      <DashboardNav user={session.user} />

      {/* Main Content */}
      <main className="flex-1 relative w-full max-w-7xl mx-auto md:px-6 md:pb-6 min-h-0 overflow-hidden">
        <div className="h-full bg-white md:rounded-3xl shadow-sm md:border border-zinc-200/50 relative flex flex-col">
          {children}
        </div>
      </main>
    </div>
  )
}
