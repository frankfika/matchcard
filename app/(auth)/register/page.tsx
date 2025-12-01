'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, Mail, Lock, User } from 'lucide-react'
import { register } from '@/app/actions/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await register({ name, email, password })

      if (result.error) {
        setError(result.error)
      } else {
        router.push('/login?registered=true')
      }
    } catch {
      setError('注册失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 bg-noise flex flex-col items-center justify-center p-4">
      {/* Background Gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/30 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/30 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles size={24} className="text-yellow-300" />
            </div>
            <span className="font-black text-3xl tracking-tight">SoulSync</span>
          </Link>
        </div>

        {/* Register Form */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8">
          <h1 className="text-2xl font-black text-zinc-900 mb-2">创建账号</h1>
          <p className="text-zinc-600 mb-8">开始寻找你的同频灵魂</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-2 ml-1">
                昵称
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border-none rounded-2xl text-base font-medium p-4 pl-12 text-zinc-900 focus:ring-2 focus:ring-zinc-200 focus:bg-white transition-all"
                  placeholder="你的昵称"
                  required
                  minLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-2 ml-1">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 border-none rounded-2xl text-base font-medium p-4 pl-12 text-zinc-900 focus:ring-2 focus:ring-zinc-200 focus:bg-white transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-2 ml-1">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 border-none rounded-2xl text-base font-medium p-4 pl-12 text-zinc-900 focus:ring-2 focus:ring-zinc-200 focus:bg-white transition-all"
                  placeholder="至少6位字符"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-zinc-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  注册中...
                </>
              ) : (
                '注册'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-600 mt-6">
            已有账号？{' '}
            <Link href="/login" className="font-bold text-zinc-900 hover:underline">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
