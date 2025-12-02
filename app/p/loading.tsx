import { Loader2, Sparkles } from 'lucide-react'

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 select-none animate-pulse">
          <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles size={20} className="text-yellow-300" />
          </div>
          <span className="font-black text-2xl tracking-tight">SoulSync</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-500">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm font-medium">Loading profile...</span>
        </div>
      </div>
    </div>
  )
}
