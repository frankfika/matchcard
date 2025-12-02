'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from '@/components/ui/LinkNoPrefetch'
import { submitApplication } from '@/app/actions/application'
import { COLORS, type ThemeColor } from '@/lib/types'
import {
  CheckCircle,
  ArrowRight,
  MessageCircle,
  Loader2,
  Hash,
  UserCircle,
  AlertTriangle,
} from 'lucide-react'

interface ProfileForApply {
  id: string
  userId: string
  nickname: string
  title: string
  tags: string[]
  aboutMe: string[]
  lookingFor: string[]
  questions: string[]
  themeColor: string
  gender: string
  targetGender: string
  shareCode: string
}

interface CurrentUserProfile {
  nickname: string
  wechat: string
  email: string
}

interface ApplyFormProps {
  profile: ProfileForApply
  currentUser: CurrentUserProfile | null
  isOwnProfile?: boolean
  hasApplied?: boolean
  applicationStatus?: 'pending' | 'approved' | 'rejected'
}

export function ApplyForm({ profile, currentUser, isOwnProfile = false, hasApplied = false, applicationStatus }: ApplyFormProps) {
  const router = useRouter()
  // 过滤空问题
  const validQuestions = profile.questions.filter(q => q.trim())
  const [answers, setAnswers] = useState<string[]>(
    new Array(validQuestions.length).fill('')
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [redirectCountdown, setRedirectCountdown] = useState(3)
  const [error, setError] = useState('')

  // 联系方式状态 - 如果用户没有微信，允许手动填写
  const [inputWechat, setInputWechat] = useState('')

  // 提交成功后或已申请过自动跳转
  useEffect(() => {
    if (isSubmitted || hasApplied) {
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push('/dashboard')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isSubmitted, hasApplied, router])

  const themeClass = COLORS[profile.themeColor as ThemeColor] || COLORS.zinc

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers]
    newAnswers[index] = value
    setAnswers(newAnswers)
  }

  // 检查是否有微信号（已保存的或者新填写的）
  const hasExistingWechat = currentUser ? !!currentUser.wechat : false
  const hasNewWechat = !!inputWechat.trim()
  const hasWechat = hasExistingWechat || hasNewWechat
  const isFormValid = answers.every((a) => a.trim().length > 0) && hasWechat

  const handleSubmit = async () => {
    if (!isFormValid || !currentUser) return

    setIsSubmitting(true)
    setError('')

    // 优先使用已保存的微信号，否则使用新填写的
    const wechatToSubmit = currentUser.wechat || inputWechat.trim()

    const result = await submitApplication({
      profileId: profile.id,
      applicantName: currentUser.nickname,
      applicantWechat: wechatToSubmit,
      answers,
      questions: validQuestions,
      // 如果是新填写的微信号，标记需要同步到名片
      syncToProfile: !hasExistingWechat && hasNewWechat,
    })

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      setIsSubmitted(true)
    }
  }

  // 已经申请过
  if (hasApplied) {
    const statusText = {
      pending: '等待对方审批中',
      approved: '对方已通过你的申请',
      rejected: '对方婉拒了你的申请',
    }
    const statusColor = {
      pending: 'bg-amber-100 text-amber-600',
      approved: 'bg-green-100 text-green-600',
      rejected: 'bg-red-100 text-red-600',
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className={`w-16 h-16 ${statusColor[applicationStatus || 'pending']} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">你已经申请过了</h2>
          <p className="text-gray-600 mb-4 text-sm">
            你已向 <strong>{profile.nickname}</strong> 发送过申请
          </p>
          <div className="bg-zinc-50 rounded-xl p-4 mb-6">
            <span className="text-sm font-medium text-zinc-700">
              当前状态：{statusText[applicationStatus || 'pending']}
            </span>
          </div>

          <div className="text-sm text-zinc-500 mb-4">
            {redirectCountdown > 0 ? (
              <span>{redirectCountdown} 秒后自动跳转到个人主页...</span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                正在跳转...
              </span>
            )}
          </div>

          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 text-white rounded-xl hover:bg-black transition-colors font-bold shadow-lg text-sm"
          >
            <ArrowRight size={16} /> 返回个人主页
          </Link>
        </div>
      </div>
    )
  }

  // 自己的名片提示
  if (isOwnProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">这是你的名片</h2>
          <p className="text-gray-600 mb-6 text-sm">
            不能申请自己的名片哦～
            <br />
            把链接分享给别人，让他们来申请吧！
          </p>

          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 text-white rounded-xl hover:bg-black transition-colors font-bold shadow-lg text-sm"
            >
              <ArrowRight size={16} /> 返回我的名片
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 提交成功页面
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">申请已提交</h2>
          <p className="text-gray-600 mb-6 text-sm">
            你的申请已发送给 <strong>{profile.nickname}</strong>
            <br />
            请耐心等待对方审批
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6 text-left shadow-sm">
            <div className="text-xs font-bold text-blue-500 uppercase mb-2">接下来</div>
            <p className="text-sm text-blue-900 leading-relaxed font-medium">
              如果对方通过你的申请，你会收到 TA 的微信号。
              <br />
              可以在「我的申请」中查看申请状态。
            </p>
          </div>

          <div className="text-sm text-zinc-500 mb-4">
            {redirectCountdown > 0 ? (
              <span>{redirectCountdown} 秒后自动跳转到个人主页...</span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                正在跳转...
              </span>
            )}
          </div>

          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 text-white rounded-xl hover:bg-black transition-colors font-bold shadow-lg text-sm"
          >
            <ArrowRight size={16} /> 立即返回
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className={`${themeClass} p-8 text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-noise opacity-20" />
            <div className="relative z-10">
              <p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-2">
                申请匹配
              </p>
              <h1 className="text-4xl font-black tracking-tighter mb-2">
                {profile.nickname || profile.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded text-xs font-bold backdrop-blur-md"
                  >
                    <Hash size={10} /> {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Intro Section */}
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              关于 TA
            </h3>
            <ul className="space-y-3">
              {profile.aboutMe.filter(line => line.trim()).map((line, i) => (
                <li
                  key={i}
                  className="text-gray-700 font-medium leading-relaxed flex items-start gap-2"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* Looking For Section */}
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              TA 在寻找
            </h3>
            <ul className="space-y-3">
              {profile.lookingFor.filter(line => line.trim()).map((line, i) => (
                <li
                  key={i}
                  className="text-gray-700 font-medium leading-relaxed flex items-start gap-2"
                >
                  <ArrowRight size={14} className="mt-1 text-gray-400 shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* Questionnaire */}
          <div className="p-8 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-bold shadow-md">
                1
              </span>
              回答问题
            </h3>

            <div className="space-y-8">
              {validQuestions.map((q, idx) => (
                <div key={idx} className="group">
                  <label className="block text-sm font-bold text-gray-800 mb-3 ml-1 border-l-4 border-zinc-200 pl-3">
                    {q}
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="真诚的回答能提高匹配成功率..."
                    className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 sm:text-sm p-4 border bg-white transition-all"
                    value={answers[idx]}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-12 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-bold shadow-md">
                2
              </span>
              你的信息
            </h3>

            {/* 显示当前账号信息 */}
            {currentUser ? (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase">昵称</span>
                  <span className="text-sm font-medium text-gray-900">{currentUser.nickname}</span>
                </div>
                {currentUser.wechat && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">微信</span>
                    <span className="text-sm font-medium text-gray-900">{currentUser.wechat}</span>
                  </div>
                )}
                {/* 如果没有微信号，显示输入框 */}
                {!currentUser.wechat && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg flex items-start gap-2">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <span>你还没有填写微信号，请在下方填写（填写后会自动同步到你的名片）</span>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">微信号</label>
                      <input
                        type="text"
                        value={inputWechat}
                        onChange={(e) => setInputWechat(e.target.value)}
                        placeholder="你的微信号"
                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-zinc-500 focus:ring-zinc-500 text-sm p-3 border bg-gray-50"
                      />
                    </div>
                  </div>
                )}
                {hasExistingWechat && (
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 pt-2 border-t border-gray-100">
                    <CheckCircle size={10} /> 以上信息来自你的名片，仅在对方通过后可见
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-700 text-sm p-4 rounded-xl flex items-center gap-2">
                <AlertTriangle size={16} />
                请先完善你的名片信息
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100">
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-8 bg-white border-t border-gray-100">
            <button
              disabled={!isFormValid || isSubmitting}
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-zinc-900 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <MessageCircle size={20} />
                  提交申请
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
