import { Loader2, Sparkles } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 bg-noise flex flex-col items-center justify-center p-4">
      {/* Background Gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/30 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/30 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 select-none animate-pulse">
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles size={24} className="text-yellow-300" />
          </div>
          <span className="font-black text-3xl tracking-tight">SoulSync</span>
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center gap-3 text-zinc-500">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm font-medium">Loading...</span>
        </div>
      </div>
    </div>
  )
}
