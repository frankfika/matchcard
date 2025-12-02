import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
        <span className="text-sm text-zinc-500 font-medium">Loading...</span>
      </div>
    </div>
  )
}
