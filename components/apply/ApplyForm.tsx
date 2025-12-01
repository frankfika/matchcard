'use client'

import { useState } from 'react'
import Link from 'next/link'
import { submitApplication } from '@/app/actions/application'
import { COLORS, type ThemeColor, type Gender } from '@/lib/types'
import {
  CheckCircle,
  ArrowRight,
  MessageCircle,
  Loader2,
  Sparkles,
  Hash,
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

interface ApplyFormProps {
  profile: ProfileForApply
}

export function ApplyForm({ profile }: ApplyFormProps) {
  const [answers, setAnswers] = useState<string[]>(
    new Array(profile.questions.length).fill('')
  )
  const [applicantWechat, setApplicantWechat] = useState('')
  const [applicantName, setApplicantName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const themeClass = COLORS[profile.themeColor as ThemeColor] || COLORS.zinc

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers]
    newAnswers[index] = value
    setAnswers(newAnswers)
  }

  const isFormValid = answers.every((a) => a.trim().length > 0) && applicantWechat.trim().length > 0

  const handleSubmit = async () => {
    if (!isFormValid) return

    setIsSubmitting(true)
    setError('')

    const result = await submitApplication({
      profileId: profile.id,
      applicantName,
      applicantWechat,
      answers,
      questions: profile.questions,
    })

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      setIsSubmitted(true)
    }
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
              你也可以注册账号追踪申请状态。
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/register"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 text-white rounded-xl hover:bg-black transition-colors font-bold shadow-lg text-sm"
            >
              <Sparkles size={16} /> 我也要创建名片
            </Link>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-zinc-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-sm"
            >
              <ArrowRight size={16} /> 返回首页
            </Link>
          </div>
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
              <div className="flex justify-between items-start mb-2">
                <p className="text-white/80 text-sm font-medium uppercase tracking-widest">
                  申请匹配
                </p>
                <Link href="/register" className="text-white/60 text-xs hover:text-white underline">
                  我也要创建名片
                </Link>
              </div>
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
              {profile.aboutMe.map((line, i) => (
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
              {profile.lookingFor.map((line, i) => (
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
              {profile.questions.map((q, idx) => (
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
            <div className="grid grid-cols-1 gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  怎么称呼你
                </label>
                <input
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="block w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white shadow-sm sm:text-sm p-3 border transition-all"
                  placeholder="昵称"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  你的微信号 <span className="text-red-500">*</span>
                </label>
                <input
                  value={applicantWechat}
                  onChange={(e) => setApplicantWechat(e.target.value)}
                  className="block w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white shadow-sm sm:text-sm p-3 border transition-all"
                  placeholder="仅在对方通过后可见"
                />
                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                  <CheckCircle size={10} /> 隐私保护：未通过审批前，对方看不到此信息
                </p>
              </div>
            </div>

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
