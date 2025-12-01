import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400 mx-auto" />
        <p className="text-sm text-zinc-500 mt-3">加载中...</p>
      </div>
    </div>
  )
}
