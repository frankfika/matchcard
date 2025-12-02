'use client'

import Link from '@/components/ui/LinkNoPrefetch'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-zinc-200">404</h1>
        <h2 className="text-2xl font-bold text-zinc-900 mt-4 mb-2">页面不存在</h2>
        <p className="text-zinc-600 mb-8">你访问的页面可能已被删除或链接有误</p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
          >
            <Home size={18} />
            返回首页
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 bg-white text-zinc-700 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={18} />
            返回上页
          </button>
        </div>
      </div>
    </div>
  )
}
