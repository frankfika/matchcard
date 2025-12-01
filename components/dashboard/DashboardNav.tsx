'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Sparkles, User, Heart, Send, LogOut, ChevronDown } from 'lucide-react'

interface DashboardNavProps {
  user: {
    id?: string
    name?: string | null
    email?: string | null
  }
}

const navItems = [
  { href: '/dashboard', label: '我的名片', labelShort: '名片', icon: User },
  { href: '/dashboard/inbox', label: '谁想认识我', labelShort: '想认识我', icon: Heart },
  { href: '/dashboard/sent', label: '我想认识谁', labelShort: '我想认识', icon: Send },
]

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const activeIndex = navItems.findIndex((item) => item.href === pathname)

  return (
    <header className="shrink-0 relative z-30 pt-4 px-4 pb-2 w-full max-w-7xl mx-auto flex flex-col items-center">
      {/* Logo and User */}
      <div className="w-full flex justify-between items-center mb-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center shadow-lg shadow-black/20">
            <Sparkles size={16} className="text-yellow-300" />
          </div>
          <span className="font-black text-xl tracking-tight text-zinc-900">SoulSync</span>
        </Link>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
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
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-zinc-900 truncate">{user.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                </div>
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

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-colors rounded-xl ${
                isActive ? 'text-white' : 'text-zinc-500 hover:bg-black/5'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.labelShort}</span>
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
