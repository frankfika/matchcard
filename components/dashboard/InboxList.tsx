'use client'

import { useState } from 'react'
import { handleApplication, sendFollowUp } from '@/app/actions/application'
import { copyToClipboard } from '@/lib/utils'
import type { ApplicationData } from '@/lib/types'
import {
  Download,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  HelpCircle,
  Send,
} from 'lucide-react'

interface InboxListProps {
  applications: ApplicationData[]
  myWechat: string
}

export function InboxList({ applications: initialApplications, myWechat }: InboxListProps) {
  const [applications, setApplications] = useState(initialApplications)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // 追问相关状态
  const [followUpMode, setFollowUpMode] = useState<string | null>(null) // 正在追问的申请ID
  const [followUpQuestion, setFollowUpQuestion] = useState('')

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
    // 关闭追问模式
    if (expandedId === id) {
      setFollowUpMode(null)
      setFollowUpQuestion('')
    }
  }

  const handleAction = async (
    applicationId: string,
    action: 'approve' | 'reject',
    applicantName: string
  ) => {
    setProcessingId(applicationId)

    const result = await handleApplication({
      applicationId,
      action,
    })

    setProcessingId(null)

    if (result.error) {
      showToast(result.error)
    } else {
      // 更新本地状态
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? { ...app, status: action === 'approve' ? 'approved' : 'rejected' }
            : app
        )
      )

      // 如果是通过，复制回复话术
      if (action === 'approve' && myWechat) {
        const text = `Hi ${applicantName || '同频的朋友'}，看了你的回答感觉很真诚，我们可以认识一下！我的微信是：${myWechat}`
        await copyToClipboard(text)
        showToast('已通过！回复话术已复制')
      } else if (action === 'reject') {
        const text = `Hi ${applicantName || '朋友'}，谢谢你的申请。感觉我们可能不太合适，祝你早日找到同频的人！`
        await copyToClipboard(text)
        showToast('已婉拒，话术已复制')
      }
    }
  }

  // 开始追问
  const startFollowUp = (applicationId: string) => {
    setFollowUpMode(applicationId)
    setFollowUpQuestion('')
  }

  // 取消追问
  const cancelFollowUp = () => {
    setFollowUpMode(null)
    setFollowUpQuestion('')
  }

  // 发送追问
  const handleSendFollowUp = async (applicationId: string) => {
    if (!followUpQuestion.trim()) {
      showToast('请填写追问内容')
      return
    }

    setProcessingId(applicationId)
    const result = await sendFollowUp({
      applicationId,
      questions: [followUpQuestion.trim()],
    })
    setProcessingId(null)

    if (result.error) {
      showToast(result.error)
    } else {
      // 更新本地状态
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: 'follow_up',
                followUps: [
                  ...app.followUps,
                  { questions: [followUpQuestion.trim()], answers: [], createdAt: new Date().toISOString() }
                ]
              }
            : app
        )
      )
      setFollowUpMode(null)
      setFollowUpQuestion('')
      showToast('追问已发送')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            <Clock size={12} /> 待处理
          </span>
        )
      case 'follow_up':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            <HelpCircle size={12} /> 追问中
          </span>
        )
      case 'answered':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
            <MessageCircle size={12} /> 已回复
          </span>
        )
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <CheckCircle size={12} /> 已通过
          </span>
        )
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            <XCircle size={12} /> 已婉拒
          </span>
        )
      default:
        return null
    }
  }

  // 获取头像背景色
  const getAvatarColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'answered':
        return 'bg-blue-100 text-blue-700'
      case 'follow_up':
        return 'bg-purple-100 text-purple-700'
      case 'approved':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-500'
    }
  }

  // 判断是否可以操作（通过/拒绝/追问）
  const canTakeAction = (status: string) => {
    return ['pending', 'answered'].includes(status)
  }

  // 计算各种状态数量
  const pendingCount = applications.filter(app => app.status === 'pending').length
  const answeredCount = applications.filter(app => app.status === 'answered').length
  const followUpCount = applications.filter(app => app.status === 'follow_up').length
  const needActionCount = pendingCount + answeredCount

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-zinc-900 text-white px-6 py-2 rounded-full text-sm flex items-center gap-2 shadow-xl animate-fade-in-down">
          <Check size={16} /> {toast}
        </div>
      )}

      {/* 状态摘要栏 */}
      {applications.length > 0 && needActionCount > 0 && (
        <div className="shrink-0 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">
                  {needActionCount} 个申请待处理
                </p>
                <p className="text-xs text-amber-600">
                  {pendingCount > 0 && `${pendingCount} 个新申请`}
                  {pendingCount > 0 && answeredCount > 0 && '、'}
                  {answeredCount > 0 && `${answeredCount} 个已回复追问`}
                </p>
              </div>
            </div>
            {followUpCount > 0 && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {followUpCount} 个追问中
              </span>
            )}
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {applications.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download size={24} className="opacity-50" />
            </div>
            <p className="font-bold text-gray-600">暂无申请</p>
            <p className="text-xs mt-2 max-w-[200px] mx-auto leading-relaxed">
              当别人扫描你的名片二维码并提交申请后，申请会出现在这里。
            </p>
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-700 text-xs text-left max-w-sm mx-auto">
              <strong>提示:</strong>
              <br />
              1. 在 &quot;我的名片&quot; 页面下载或复制链接分享
              <br />
              2. 对方扫码填写申请
              <br />
              3. 你在这里审批申请
            </div>
          </div>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className={`bg-white rounded-xl border transition-all overflow-hidden ${
                expandedId === app.id
                  ? 'shadow-lg border-zinc-400 ring-1 ring-zinc-100'
                  : 'shadow-sm border-gray-100 active:scale-[0.99]'
              }`}
            >
              <div
                onClick={() => toggleExpand(app.id)}
                className="p-4 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getAvatarColor(app.status)}`}
                  >
                    {app.applicantName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-zinc-900">{app.applicantName || '未命名'}</h3>
                    <p className="text-xs text-gray-400">
                      {new Date(app.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                    {app.applicantProfile && (
                      <div className="mt-0.5">
                        <p className="text-[11px] text-zinc-600 line-clamp-1">
                          {app.applicantProfile.title}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(app.applicantProfile.tags || []).slice(0, 3).map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded border"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(app.status)}
                  {expandedId === app.id ? (
                    <ChevronUp size={20} className="text-gray-300" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-300" />
                  )}
                </div>
              </div>

              {expandedId === app.id && (
                <div
                  className="px-4 pb-4 border-t border-gray-100 cursor-default"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-4 mt-4">
                    {/* TA的联系方式 - 已通过时显示在最上方 */}
                    {app.status === 'approved' && app.applicantWechat && (
                      <div className="bg-green-50 rounded-xl border border-green-200 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-green-700 mb-1">🎉 已通过 · TA的微信号</p>
                            <p className="text-lg font-mono font-bold text-green-800">{app.applicantWechat}</p>
                          </div>
                          <button
                            onClick={() => {
                              copyToClipboard(app.applicantWechat)
                              showToast('微信号已复制')
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-bold"
                          >
                            <Copy size={14} />
                            复制
                          </button>
                        </div>
                      </div>
                    )}

                    {/* TA的名片摘要 - 只有当有名片时才显示 */}
                    {app.applicantProfile && (
                      <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4">
                        <p className="text-xs font-bold text-zinc-500 mb-3">📇 TA的名片</p>
                        <div className="space-y-3">
                          {/* 基本信息 */}
                          <div>
                            <p className="font-bold text-zinc-900">{app.applicantProfile.nickname}</p>
                            {app.applicantProfile.title && (
                              <p className="text-sm text-zinc-600 mt-0.5">{app.applicantProfile.title}</p>
                            )}
                          </div>
                          {/* 标签 */}
                          {app.applicantProfile.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {app.applicantProfile.tags.map((t, i) => (
                                <span key={i} className="text-xs font-medium px-2 py-1 bg-white text-zinc-600 rounded-full border border-zinc-200">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* 关于TA */}
                          {app.applicantProfile.aboutMe?.some(item => item.trim()) && (
                            <div>
                              <p className="text-xs text-zinc-400 mb-1">关于TA</p>
                              <ul className="text-sm text-zinc-700 space-y-1">
                                {app.applicantProfile.aboutMe.filter(item => item.trim()).map((item, i) => (
                                  <li key={i}>• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {/* TA在寻找 */}
                          {app.applicantProfile.lookingFor?.some(item => item.trim()) && (
                            <div>
                              <p className="text-xs text-zinc-400 mb-1">TA在寻找</p>
                              <ul className="text-sm text-zinc-700 space-y-1">
                                {app.applicantProfile.lookingFor.filter(item => item.trim()).map((item, i) => (
                                  <li key={i}>→ {item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 问答记录 - 对话式布局 */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="p-3 bg-gray-50 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-500">💬 问答记录</p>
                      </div>
                      <div className="p-4 space-y-4">
                        {/* 初始问答 */}
                        {app.questions.map((q, i) => (
                          <div key={i} className="space-y-2">
                            {/* 你的问题 - 右对齐 */}
                            <div className="flex justify-end">
                              <div className="bg-zinc-900 text-white px-3 py-2 rounded-2xl rounded-tr-sm max-w-[85%]">
                                <p className="text-sm">{q}</p>
                              </div>
                            </div>
                            {/* TA的回答 - 左对齐 */}
                            <div className="flex justify-start">
                              <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-2xl rounded-tl-sm max-w-[85%]">
                                <p className="text-sm">{app.answers[i] || '未回答'}</p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* 追问记录 */}
                        {app.followUps && app.followUps.map((followUp, fIdx) => (
                          <div key={`followup-${fIdx}`} className="space-y-2 pt-3 border-t border-gray-100">
                            <p className="text-[10px] text-center text-gray-400">— 追问 {fIdx + 1} —</p>
                            {/* 你的追问 - 右对齐 */}
                            <div className="flex justify-end">
                              <div className="bg-blue-600 text-white px-3 py-2 rounded-2xl rounded-tr-sm max-w-[85%]">
                                <p className="text-sm">{followUp.questions[0]}</p>
                              </div>
                            </div>
                            {/* TA的回答 - 左对齐 */}
                            <div className="flex justify-start">
                              {followUp.answers[0] ? (
                                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-2xl rounded-tl-sm max-w-[85%]">
                                  <p className="text-sm">{followUp.answers[0]}</p>
                                </div>
                              ) : (
                                <div className="bg-amber-50 text-amber-600 px-3 py-2 rounded-2xl rounded-tl-sm border border-amber-200">
                                  <p className="text-sm italic">等待TA回答...</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 追问输入区 */}
                    {followUpMode === app.id && (
                      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                        <p className="text-xs font-bold text-blue-700 mb-2">输入追问</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={followUpQuestion}
                            onChange={(e) => setFollowUpQuestion(e.target.value)}
                            placeholder="想再问TA什么..."
                            className="flex-1 text-sm p-3 rounded-lg border border-blue-200 bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                            onKeyDown={(e) => e.key === 'Enter' && handleSendFollowUp(app.id)}
                          />
                          <button
                            onClick={cancelFollowUp}
                            className="px-3 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50"
                          >
                            <X size={16} />
                          </button>
                          <button
                            onClick={() => handleSendFollowUp(app.id)}
                            disabled={processingId === app.id || !followUpQuestion.trim()}
                            className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {processingId === app.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Send size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 待审批时显示遮罩的微信号 */}
                    {app.status !== 'approved' && app.applicantWechat && (
                      <div className="bg-zinc-100 rounded-xl border border-zinc-200 p-4">
                        <p className="text-xs font-bold text-zinc-400 mb-1">TA的微信号</p>
                        <p className="text-sm font-mono text-zinc-400">{app.applicantWechat.replace(/./g, '•')}</p>
                        <p className="text-xs text-zinc-400 mt-2">通过申请后可见</p>
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  {canTakeAction(app.status) && followUpMode !== app.id && (
                    <div className="mt-6 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleAction(app.id, 'reject', app.applicantName)}
                        disabled={processingId === app.id}
                        className="py-3 border border-gray-200 bg-white rounded-xl text-gray-600 text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {processingId === app.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <X size={14} />
                        )}
                        婉拒
                      </button>
                      <button
                        onClick={() => startFollowUp(app.id)}
                        disabled={processingId === app.id}
                        className="py-3 border border-blue-200 bg-blue-50 rounded-xl text-blue-600 text-xs font-bold hover:bg-blue-100 flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <HelpCircle size={14} />
                        追问
                      </button>
                      <button
                        onClick={() => handleAction(app.id, 'approve', app.applicantName)}
                        disabled={processingId === app.id || !myWechat}
                        className="py-3 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black shadow-lg flex items-center justify-center gap-1 disabled:opacity-50"
                        title={!myWechat ? '请先在名片中设置微信号' : undefined}
                      >
                        {processingId === app.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                        通过
                      </button>
                    </div>
                  )}

                  {/* 追问中状态提示 */}
                  {app.status === 'follow_up' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-xl text-center">
                      <p className="text-xs text-blue-600 font-medium">等待对方回答追问...</p>
                    </div>
                  )}

                  {!myWechat && canTakeAction(app.status) && (
                    <p className="text-xs text-amber-600 mt-2 text-center">
                      请先在 &quot;我的名片&quot; 中设置微信号才能通过申请
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
