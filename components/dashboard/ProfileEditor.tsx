'use client'

import { useState, useRef, useEffect } from 'react'
import { toPng } from 'html-to-image'
import { ProfileCard } from './ProfileCard'
import { updateProfile } from '@/app/actions/profile'
import type { ProfileData, ThemeColor, Gender } from '@/lib/types'
import { COLORS } from '@/lib/types'
import { copyToClipboard } from '@/lib/utils'
import {
  Wand2,
  Download,
  Link as LinkIcon,
  Loader2,
  RefreshCcw,
  Save,
  Check,
  Eye,
  PenLine,
  Lock,
  Unlock,
  ChevronDown,
} from 'lucide-react'

interface ProfileEditorProps {
  initialProfile: ProfileData
}

export function ProfileEditor({ initialProfile }: ProfileEditorProps) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile)
  const [shareUrl, setShareUrl] = useState<string>('')
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')
  const [tagInput, setTagInput] = useState('')

  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    updateShareUrl()
  }, [profile.shareCode])

  const updateShareUrl = () => {
    const url = `${window.location.origin}/p/${profile.shareCode}`
    setShareUrl(url)
  }

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateProfile(profile)
    setIsSaving(false)

    if (result.error) {
      setToastMessage(result.error)
    } else {
      setIsEditing(false)
      setToastMessage('已保存')
    }
    setTimeout(() => setToastMessage(null), 2000)
  }

  const handleUnlock = () => {
    setIsEditing(true)
  }

  const handleProfileChange = (field: keyof ProfileData, value: unknown) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (
    field: 'aboutMe' | 'lookingFor' | 'questions',
    index: number,
    value: string
  ) => {
    const newArray = [...profile[field]]
    newArray[index] = value
    handleProfileChange(field, newArray)
  }

  const addItem = (field: 'aboutMe' | 'lookingFor' | 'questions') => {
    handleProfileChange(field, [...profile[field], ''])
  }

  const removeItem = (field: 'aboutMe' | 'lookingFor' | 'questions', index: number) => {
    const newArray = [...profile[field]]
    newArray.splice(index, 1)
    handleProfileChange(field, newArray)
  }

  const handleAiPolish = async (field: 'about' | 'looking') => {
    // AI polish 功能需要后端 API
    setToastMessage('AI 功能开发中')
    setTimeout(() => setToastMessage(null), 2000)
  }

  const handleAiQuestions = async () => {
    setToastMessage('AI 功能开发中')
    setTimeout(() => setToastMessage(null), 2000)
  }

  const addTagFromInput = () => {
    const raw = tagInput.trim()
    if (!raw) return
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean)
    const next = Array.from(new Set([...(profile.tags || []), ...parts]))
    handleProfileChange('tags', next)
    setTagInput('')
  }
  const removeTagAt = (index: number) => {
    const arr = [...(profile.tags || [])]
    arr.splice(index, 1)
    handleProfileChange('tags', arr)
  }

  const downloadImage = async () => {
    if (cardRef.current) {
      try {
        setToastMessage('生成中...')
        await document.fonts.ready

        const element = cardRef.current
        const dataUrl = await toPng(element, {
          cacheBust: true,
          pixelRatio: 3,
          backgroundColor: 'transparent',
          width: element.scrollWidth,
          height: element.scrollHeight,
          style: {
            transform: 'none',
            margin: '0',
          },
        })

        const link = document.createElement('a')
        link.download = `soulsync-${(profile.nickname || 'card').replace(/\s+/g, '-')}.png`
        link.href = dataUrl
        link.click()
        setToastMessage(null)
      } catch (err) {
        console.error('Failed to download image', err)
        setToastMessage('生成失败')
        setTimeout(() => setToastMessage(null), 3000)
      }
    }
  }

  const GENDER_OPTIONS: Gender[] = ['Male', 'Female', 'Non-binary', 'Any']
  const THEME_LABELS: Record<ThemeColor, string> = {
    zinc: 'Obsidian',
    blue: 'Sapphire',
    rose: 'Neon Rose',
    amber: 'Sunset',
    emerald: 'Cyber Mint',
    violet: 'Ultra Violet',
  }

  return (
    <div className="flex flex-col md:flex-row h-full relative">
      {toastMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-zinc-900 text-white px-6 py-2 rounded-full text-sm flex items-center gap-2 shadow-xl animate-fade-in-down">
          <Check size={16} /> {toastMessage}
        </div>
      )}

      {/* Mobile Toggle */}
      <div className="md:hidden flex border-b border-gray-100 bg-white sticky top-0 z-20 shrink-0">
        <button
          onClick={() => setMobileTab('edit')}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${
            mobileTab === 'edit'
              ? 'text-zinc-900 border-b-2 border-zinc-900'
              : 'text-gray-400'
          }`}
        >
          <PenLine size={16} /> 编辑
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${
            mobileTab === 'preview'
              ? 'text-zinc-900 border-b-2 border-zinc-900'
              : 'text-gray-400'
          }`}
        >
          <Eye size={16} /> 预览
        </button>
      </div>

      {/* Editor Panel */}
      <div
        className={`w-full md:w-1/2 lg:w-5/12 bg-white flex flex-col min-h-0 ${
          mobileTab === 'preview' ? 'hidden md:flex' : 'flex h-full'
        }`}
      >
        {/* Fixed Header */}
        <div className="flex justify-between items-center px-6 md:px-8 py-6 border-b border-zinc-50 bg-white z-10 shrink-0">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">编辑名片</h2>
            <p className="text-xs text-gray-400 font-medium">
              {isEditing ? '编辑中' : '已锁定'}
            </p>
          </div>
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              保存
            </button>
          ) : (
            <button
              onClick={handleUnlock}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95"
            >
              <Unlock size={14} /> 解锁编辑
            </button>
          )}
        </div>
        {!isEditing && (
          <div className="px-6 md:px-8 py-2 bg-amber-50 text-amber-700 text-xs font-bold border-t border-b border-amber-100 flex items-center gap-2">
            <Lock size={12} /> 当前内容已锁定，点击右上角“解锁编辑”开始编辑
          </div>
        )}

        {/* Scrollable Form Content */}
        <div
          onMouseDown={(e) => {
            if (!isEditing) {
              const t = e.target as HTMLElement
              const tag = t.tagName
              if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') {
                setToastMessage('当前内容已锁定，点击右上角“解锁编辑”')
                setTimeout(() => setToastMessage(null), 2000)
              }
            }
          }}
          className={`flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar pb-32 space-y-10 ${
            !isEditing ? 'opacity-60 grayscale-[0.8] select-none' : ''
          } transition-all duration-300`}
        >
          <section className="space-y-5">
            <h2 className="text-xs font-extrabold text-gray-300 uppercase tracking-widest mb-4">
              基本信息
            </h2>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-2 ml-1">昵称</label>
              <input
                disabled={!isEditing}
                value={profile.nickname}
                onChange={(e) => handleProfileChange('nickname', e.target.value)}
                className="w-full bg-zinc-50 border-none rounded-2xl text-base font-bold p-4 text-zinc-900 focus:ring-2 focus:ring-zinc-200 focus:bg-white transition-all placeholder:text-zinc-300 disabled:cursor-not-allowed"
                placeholder="你的昵称"
              />
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-2 ml-1">个人标语</label>
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    disabled={!isEditing}
                    value={profile.title}
                    maxLength={60}
                    onChange={(e) => handleProfileChange('title', e.target.value)}
                    placeholder="示例：产品经理，喜欢跑步和摄影；寻找认知同频的伙伴"
                    className="w-full bg-zinc-50 border-none rounded-2xl text-sm font-medium p-4 text-zinc-900 focus:ring-2 focus:ring-zinc-200 focus:bg-white transition-all disabled:cursor-not-allowed resize-none"
                  />
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">格式：一句话，6–24 字，具体可感知</span>
                    <span className="text-gray-400">{(profile.title || '').length}/60</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-2 ml-1">标签</label>
                <div className="bg-zinc-50 rounded-2xl p-3 border border-zinc-200 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {(profile.tags || []).map((t, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white border border-zinc-200 shadow-sm"
                      >
                        {t}
                        {isEditing && (
                          <button
                            onClick={() => removeTagAt(i)}
                            className="text-zinc-400 hover:text-red-500"
                            title="移除"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="space-y-2">
                      <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault()
                            addTagFromInput()
                          }
                        }}
                        placeholder="输入后回车添加，如：90后、创业、Web3/AI"
                        className="w-full bg-white border-none rounded-xl text-xs p-3 text-zinc-800 focus:ring-2 focus:ring-zinc-200"
                      />
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-400">格式：短语或关键词，按回车或逗号添加</span>
                        <span className="text-gray-400">{(profile.tags || []).length}/6</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['90后','创业','Web3','AI','阅读','徒步','摄影','产品经理'].map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              const curr = profile.tags || []
                              if (curr.length >= 6) return
                              const next = Array.from(new Set([...curr, s]))
                              handleProfileChange('tags', next)
                            }}
                            className="px-3 py-1 rounded-full text-[10px] font-bold bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-3 ml-1">主题色</label>
              <div className="grid grid-cols-6 gap-3">
                {(Object.keys(COLORS) as ThemeColor[]).map((c) => (
                  <button
                    key={c}
                    disabled={!isEditing}
                    onClick={() => handleProfileChange('themeColor', c)}
                    title={THEME_LABELS[c]}
                    className={`w-full aspect-square rounded-full ${COLORS[c]} ${
                      profile.themeColor === c
                        ? 'ring-4 ring-offset-2 ring-zinc-200 scale-90'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    } transition-all shadow-sm disabled:cursor-not-allowed`}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="text-xs font-extrabold text-gray-300 uppercase tracking-widest mb-4">
              匹配设置
            </h2>
            <div className="grid grid-cols-2 gap-5 p-5 bg-zinc-50 rounded-3xl border border-zinc-100">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">我是</label>
                <div className="relative">
                  <select
                    disabled={!isEditing}
                    value={profile.gender}
                    onChange={(e) => handleProfileChange('gender', e.target.value)}
                    className="w-full appearance-none bg-white border-none rounded-xl text-sm font-bold p-3 pr-8 text-zinc-900 focus:ring-2 focus:ring-zinc-200 cursor-pointer shadow-sm disabled:cursor-not-allowed"
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-3.5 text-zinc-400 pointer-events-none"
                    size={14}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">寻找</label>
                <div className="relative">
                  <select
                    disabled={!isEditing}
                    value={profile.targetGender}
                    onChange={(e) => handleProfileChange('targetGender', e.target.value)}
                    className="w-full appearance-none bg-white border-none rounded-xl text-sm font-bold p-3 pr-8 text-zinc-900 focus:ring-2 focus:ring-zinc-200 cursor-pointer shadow-sm disabled:cursor-not-allowed"
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-3.5 text-zinc-400 pointer-events-none"
                    size={14}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-xs font-extrabold text-gray-300 uppercase tracking-widest">
                关于我
              </h2>
              {isEditing && (
                <button
                  onClick={() => handleAiPolish('about')}
                  disabled={isAiLoading === 'about'}
                  className="text-[10px] bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-purple-100 transition-colors"
                >
                  {isAiLoading === 'about' ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <Wand2 size={10} />
                  )}{' '}
                  AI 优化
                </button>
              )}
            </div>
            <div className="space-y-3">
              {profile.aboutMe.map((item, idx) => (
                <div key={idx} className="flex gap-2 group">
                  <textarea
                    rows={2}
                    disabled={!isEditing}
                    value={item}
                    onChange={(e) => handleArrayChange('aboutMe', idx, e.target.value)}
                    className="flex-1 bg-zinc-50 border-none rounded-2xl text-sm p-4 font-medium focus:ring-2 focus:ring-zinc-200 focus:bg-white transition-all resize-none leading-relaxed disabled:cursor-not-allowed"
                  />
                  {isEditing && (
                    <button
                      onClick={() => removeItem('aboutMe', idx)}
                      className="text-zinc-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={() => addItem('aboutMe')}
                  className="w-full py-3 border border-dashed border-zinc-200 text-zinc-400 text-xs font-bold rounded-2xl hover:bg-zinc-50 hover:border-zinc-300 transition-all"
                >
                  + 添加一条
                </button>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-xs font-extrabold text-gray-300 uppercase tracking-widest">
                我在寻找
              </h2>
              {isEditing && (
                <button
                  onClick={() => handleAiPolish('looking')}
                  disabled={isAiLoading === 'looking'}
                  className="text-[10px] bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-purple-100 transition-colors"
                >
                  {isAiLoading === 'looking' ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <Wand2 size={10} />
                  )}{' '}
                  AI 优化
                </button>
              )}
            </div>
            <div className="space-y-3">
              {profile.lookingFor.map((item, idx) => (
                <div key={idx} className="flex gap-2 group">
                  <textarea
                    rows={2}
                    disabled={!isEditing}
                    value={item}
                    onChange={(e) => handleArrayChange('lookingFor', idx, e.target.value)}
                    className="flex-1 bg-zinc-50 border-none rounded-2xl text-sm p-4 font-medium focus:ring-2 focus:ring-zinc-200 focus:bg-white transition-all resize-none leading-relaxed disabled:cursor-not-allowed"
                  />
                  {isEditing && (
                    <button
                      onClick={() => removeItem('lookingFor', idx)}
                      className="text-zinc-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={() => addItem('lookingFor')}
                  className="w-full py-3 border border-dashed border-zinc-200 text-zinc-400 text-xs font-bold rounded-2xl hover:bg-zinc-50 hover:border-zinc-300 transition-all"
                >
                  + 添加一条
                </button>
              )}
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="text-xs font-extrabold text-gray-300 uppercase tracking-widest mb-4">
              联系方式与隐私
            </h2>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <Lock size={14} className="text-amber-600" />
                <h3 className="text-xs font-bold text-amber-800 uppercase">隐私保护</h3>
              </div>
              <p className="text-[11px] text-amber-700/80 leading-relaxed font-medium">
                你的微信号只有在你批准申请后才会显示给对方
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-2 ml-1">
                我的微信号（隐藏）
              </label>
              <input
                disabled={!isEditing}
                value={profile.contactWechat}
                onChange={(e) => handleProfileChange('contactWechat', e.target.value)}
                className="w-full bg-zinc-50 border-none rounded-2xl text-sm p-4 font-mono text-zinc-600 focus:ring-2 focus:ring-zinc-200 focus:bg-white transition-all disabled:cursor-not-allowed"
                placeholder="wx_id_123456"
              />
            </div>

            <div className="pt-8 border-t border-zinc-100">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest">
                  筛选问题
                </label>
                {isEditing && (
                  <button
                    onClick={handleAiQuestions}
                    disabled={isAiLoading === 'questions'}
                    className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-blue-100 transition-colors"
                  >
                    {isAiLoading === 'questions' ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : (
                      <RefreshCcw size={10} />
                    )}{' '}
                    AI 生成
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {profile.questions.map((item, idx) => (
                  <div key={idx} className="flex gap-2 group">
                    <span className="text-xs font-bold text-zinc-300 py-4 w-4 text-center">
                      {idx + 1}
                    </span>
                    <input
                      disabled={!isEditing}
                      value={item}
                      onChange={(e) => handleArrayChange('questions', idx, e.target.value)}
                      className="flex-1 bg-blue-50/50 border-none rounded-2xl text-sm p-4 font-medium text-zinc-700 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all disabled:cursor-not-allowed"
                    />
                    {isEditing && (
                      <button
                        onClick={() => removeItem('questions', idx)}
                        className="text-zinc-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    onClick={() => addItem('questions')}
                    className="ml-6 w-[calc(100%-1.5rem)] py-3 border border-dashed border-blue-200 text-blue-400 text-xs font-bold rounded-2xl hover:bg-blue-50 hover:border-blue-300 transition-all"
                  >
                    + 添加问题
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Preview Panel (Right Side) */}
      <div
        className={`w-full md:w-1/2 lg:w-7/12 bg-gray-50 flex flex-col items-center justify-start p-4 md:p-8 relative overflow-y-auto ${
          mobileTab === 'edit' ? 'hidden md:flex' : 'flex h-full'
        }`}
      >
        <div className="absolute top-4 right-4 flex gap-3 z-30">
          <button
            onClick={() => {
              copyToClipboard(shareUrl)
              setToastMessage('链接已复制!')
              setTimeout(() => setToastMessage(null), 2000)
            }}
            className="bg-white p-3 rounded-full shadow-lg shadow-black/5 hover:text-blue-600 transition-all hover:scale-110 active:scale-95 text-zinc-600"
            title="复制分享链接"
          >
            <LinkIcon size={20} />
          </button>
          <button
            onClick={downloadImage}
            className={`p-3 rounded-full shadow-lg shadow-black/10 text-white transition-all hover:scale-110 active:scale-95 ${
              !isEditing ? 'bg-zinc-900 hover:bg-black' : 'bg-zinc-400 hover:bg-zinc-500'
            }`}
            title="下载图片"
          >
            <Download size={20} />
          </button>
        </div>

        {!isEditing && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm flex items-center gap-1 animate-in fade-in zoom-in duration-300">
            <Check size={12} strokeWidth={3} /> 可以分享了
          </div>
        )}

        {/* Scaled Preview Wrapper */}
        <div className="mt-8 w-full flex justify-center pb-20 origin-top transform scale-75 md:scale-90 lg:scale-[0.85] transition-all">
          <ProfileCard data={profile} shareUrl={shareUrl} forwardRef={cardRef} />
        </div>
      </div>
    </div>
  )
}
