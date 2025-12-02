'use client'

import { useState } from 'react'
import Link from '@/components/ui/LinkNoPrefetch'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, signIn } from 'next-auth/react'
import { Sparkles, User, Heart, Send, LogOut, ChevronDown, AlertCircle } from 'lucide-react'

interface DashboardNavProps {
  user: {
    id?: string
    name?: string | null
    email?: string | null
  }
  stats?: {
    pending: number
    needAnswer: number
  }
}

const navItems = [
  { href: '/dashboard', label: '我的名片', labelShort: '名片', icon: User },
  { href: '/dashboard/inbox', label: '谁想认识我', labelShort: '想认识我', icon: Heart },
  { href: '/dashboard/sent', label: '我想认识谁', labelShort: '我想认识', icon: Send },
]

export function DashboardNav({ user, stats }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSwitch, setShowSwitch] = useState(false)
  const [switchEmail, setSwitchEmail] = useState('')
  const [switchPassword, setSwitchPassword] = useState('')
  const [switching, setSwitching] = useState(false)
  const [switchError, setSwitchError] = useState('')

  const activeIndex = navItems.findIndex((item) => item.href === pathname)

  return (
    <>
    <header className="shrink-0 relative z-30 pt-4 px-4 pb-2 w-full max-w-7xl mx-auto flex flex-col items-center">
      {/* Logo and User */}
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center shadow-lg shadow-black/20">
            <Sparkles size={16} className="text-yellow-300" />
          </div>
          <span className="font-black text-xl tracking-tight text-zinc-900">SoulSync</span>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
          >
            <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-zinc-700 hidden sm:block">
              {user.name || user.email}
            </span>
            <ChevronDown size={14} className="text-zinc-400" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-50"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-zinc-900 truncate">{user.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowSwitch(true)
                    setShowUserMenu(false)
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                >
                  切换账号
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={14} />
                  退出登录
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="glass p-1.5 rounded-2xl flex relative shadow-sm w-full max-w-md">
        <div
          className="absolute top-1.5 bottom-1.5 rounded-xl bg-zinc-900 transition-all duration-300 ease-out shadow-sm"
          style={{
            left: `calc(${activeIndex * 33.33}% + 6px)`,
            width: 'calc(33.33% - 8px)',
          }}
        />

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          // 计算徽章数量
          let badgeCount = 0
          if (item.href === '/dashboard/inbox' && stats?.pending) {
            badgeCount = stats.pending
          } else if (item.href === '/dashboard/sent' && stats?.needAnswer) {
            badgeCount = stats.needAnswer
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-colors rounded-xl ${
                isActive ? 'text-white' : 'text-zinc-500 hover:bg-black/5'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.labelShort}</span>
              {badgeCount > 0 && (
                <span className={`absolute -top-1 -right-1 sm:right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1 ${
                  isActive ? 'bg-white text-zinc-900' : 'bg-red-500 text-white animate-pulse'
                }`}>
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </header>
    {showSwitch && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {
          if (!switching) {
            setShowSwitch(false)
            setSwitchError('')
            setSwitchEmail('')
            setSwitchPassword('')
          }
        }} />
        <div className="relative z-10 bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 p-6 animate-in fade-in zoom-in-95 duration-200">
          <h3 className="text-base font-black text-zinc-900 mb-3">切换账号</h3>
          <div className="space-y-3">
            <input
              type="email"
              value={switchEmail}
              onChange={(e) => {
                setSwitchEmail(e.target.value)
                setSwitchError('')
              }}
              placeholder="邮箱"
              disabled={switching}
              className="w-full bg-zinc-50 border-none rounded-xl text-sm p-3 text-zinc-900 focus:ring-2 focus:ring-zinc-200 disabled:opacity-50"
            />
            <input
              type="password"
              value={switchPassword}
              onChange={(e) => {
                setSwitchPassword(e.target.value)
                setSwitchError('')
              }}
              placeholder="密码"
              disabled={switching}
              className="w-full bg-zinc-50 border-none rounded-xl text-sm p-3 text-zinc-900 focus:ring-2 focus:ring-zinc-200 disabled:opacity-50"
            />
            {switchError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl">
                <AlertCircle size={16} />
                {switchError}
              </div>
            )}
            <button
              onClick={async () => {
                setSwitching(true)
                setSwitchError('')
                try {
                  // 先登出当前账号
                  await signOut({ redirect: false })
                  // 尝试登录新账号
                  const result = await signIn('credentials', {
                    email: switchEmail,
                    password: switchPassword,
                    redirect: false,
                  })
                  if (result?.error) {
                    setSwitchError('邮箱或密码错误')
                    setSwitching(false)
                  } else {
                    // 登录成功，关闭弹窗并刷新页面
                    setSwitching(false)
                    setShowSwitch(false)
                    setSwitchEmail('')
                    setSwitchPassword('')
                    // 强制刷新整个页面以更新所有状态
                    window.location.href = '/dashboard'
                  }
                } catch {
                  setSwitchError('切换失败，请重试')
                  setSwitching(false)
                }
              }}
              disabled={switching || !switchEmail || !switchPassword}
              className="w-full bg-zinc-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all disabled:opacity-50"
            >
              {switching ? '切换中…' : '切换登录'}
            </button>
            <button
              onClick={() => {
                setShowSwitch(false)
                setSwitchError('')
                setSwitchEmail('')
                setSwitchPassword('')
              }}
              disabled={switching}
              className="w-full text-zinc-500 text-sm py-2 hover:text-zinc-700 disabled:opacity-50"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
