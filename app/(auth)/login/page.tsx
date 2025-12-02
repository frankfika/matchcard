'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from '@/components/ui/LinkNoPrefetch'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Sparkles, Loader2, Mail, Lock } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 读取 URL 中的错误参数并清除
  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError === 'CredentialsSignin') {
      setError('邮箱或密码错误')
      // 清除 URL 中的错误参数，避免刷新后重复显示
      window.history.replaceState({}, '', '/login')
    } else if (urlError) {
      setError('登录失败，请重试')
      window.history.replaceState({}, '', '/login')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('邮箱或密码错误')
      } else {
        // 登录成功，跳转到 callbackUrl 或 dashboard
        const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
        window.location.href = callbackUrl
      }
    } catch {
      setError('登录失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative z-10 w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 select-none">
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles size={24} className="text-yellow-300" />
          </div>
          <span className="font-black text-3xl tracking-tight">SoulSync</span>
        </div>
      </div>

      {/* Login Form */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8">
        <h1 className="text-2xl font-black text-zinc-900 mb-2">欢迎回来</h1>
        <p className="text-zinc-600 mb-8">登录你的账号继续</p>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="••••••••"
                required
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
                登录中...
              </>
            ) : (
              '登录'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-600 mt-6">
          还没有账号？{' '}
          <Link href="/register" className="font-bold text-zinc-900 hover:underline">
            免费注册
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 bg-noise flex flex-col items-center justify-center p-4">
      {/* Background Gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/30 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/30 blur-[100px] pointer-events-none" />

      <Suspense fallback={
        <div className="relative z-10 w-full max-w-md flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-zinc-400" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
