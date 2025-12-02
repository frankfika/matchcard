'use client'

import { useState } from 'react'
import type { ApplicationData } from '@/lib/types'
import { answerFollowUp } from '@/app/actions/application'
import { copyToClipboard } from '@/lib/utils'
import {
  Clock,
  Send,
  CheckCircle,
  XCircle,
  HourglassIcon,
  Copy,
  HelpCircle,
  MessageCircle,
  Loader2,
  Check,
  AlertCircle,
  X,
} from 'lucide-react'

interface SentListProps {
  applications: ApplicationData[]
}

export function SentList({ applications: initialApplications }: SentListProps) {
  const [applications, setApplications] = useState(initialApplications)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // 追问回答状态 - 简化为单个回答
  const [answerMode, setAnswerMode] = useState<string | null>(null)
  const [followUpAnswer, setFollowUpAnswer] = useState('')

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            <HourglassIcon size={12} /> 等待回复
          </span>
        )
      case 'follow_up':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full animate-pulse">
            <AlertCircle size={12} /> 需要回答
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
            <XCircle size={12} /> 未通过
          </span>
        )
      default:
        return null
    }
  }

  // 开始回答追问
  const startAnswering = (app: ApplicationData) => {
    setAnswerMode(app.id)
    setFollowUpAnswer('')
    setExpandedId(app.id)
  }

  // 取消回答
  const cancelAnswering = () => {
    setAnswerMode(null)
    setFollowUpAnswer('')
  }

  // 提交回答
  const handleSubmitAnswer = async (applicationId: string) => {
    if (!followUpAnswer.trim()) {
      showToast('请填写回答')
      return
    }

    setProcessingId(applicationId)
    const result = await answerFollowUp({
      applicationId,
      answers: [followUpAnswer.trim()],
    })
    setProcessingId(null)

    if (result.error) {
      showToast(result.error)
    } else {
      // 更新本地状态
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id === applicationId && app.followUps && app.followUps.length > 0) {
            const updatedFollowUps = [...app.followUps]
            updatedFollowUps[updatedFollowUps.length - 1] = {
              ...updatedFollowUps[updatedFollowUps.length - 1],
              answers: [followUpAnswer.trim()],
            }
            return { ...app, status: 'answered', followUps: updatedFollowUps }
          }
          return app
        })
      )
      setAnswerMode(null)
      setFollowUpAnswer('')
      showToast('回答已提交')
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-zinc-900 text-white px-6 py-2 rounded-full text-sm flex items-center gap-2 shadow-xl animate-fade-in-down">
          <Check size={16} /> {toast}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {applications.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={24} className="opacity-50 ml-1" />
            </div>
            <p className="font-bold text-gray-600">还没有发送过申请</p>
            <p className="text-xs mt-2 text-gray-400 max-w-[200px] mx-auto">
              当你扫描别人的名片并提交申请后，记录会显示在这里
            </p>
          </div>
        ) : (
          applications.map((app) => {
            const hasUnansweredFollowUp = app.status === 'follow_up' && app.followUps && app.followUps.length > 0
            const lastFollowUp = hasUnansweredFollowUp ? app.followUps[app.followUps.length - 1] : null

            return (
              <div
                key={app.id}
                className={`bg-white rounded-xl border shadow-sm transition-all overflow-hidden ${
                  hasUnansweredFollowUp ? 'border-red-200 ring-2 ring-red-100' : 'border-gray-100'
                }`}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {app.profile?.nickname || app.profile?.title || '名片'}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Clock size={12} />
                        {new Date(app.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  {/* 需要回答追问的提示 */}
                  {hasUnansweredFollowUp && lastFollowUp && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-2">
                      <p className="text-xs text-red-500 mb-1">对方追问:</p>
                      <p className="text-sm text-red-700 font-medium">{lastFollowUp.questions[0]}</p>
                    </div>
                  )}
                </div>

                {/* 展开详情 */}
                {expandedId === app.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
                    {/* 追问历史 */}
                    {app.followUps && app.followUps.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {app.followUps.map((followUp, fIdx) => {
                          const isLastUnanswered = fIdx === app.followUps.length - 1 && !followUp.answers[0]

                          return (
                            <div key={fIdx} className="bg-purple-50 rounded-lg border border-purple-100 p-3">
                              <div className="flex items-start gap-2">
                                <HelpCircle size={14} className="text-purple-500 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-purple-700 font-medium">{followUp.questions[0]}</p>
                                  {followUp.answers[0] ? (
                                    <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded border border-purple-100">
                                      {followUp.answers[0]}
                                    </p>
                                  ) : isLastUnanswered && answerMode === app.id ? (
                                    <div className="mt-2 flex gap-2">
                                      <input
                                        type="text"
                                        value={followUpAnswer}
                                        onChange={(e) => setFollowUpAnswer(e.target.value)}
                                        placeholder="输入回答..."
                                        className="flex-1 text-sm p-2 rounded-lg border border-purple-200 bg-white focus:ring-2 focus:ring-purple-300"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer(app.id)}
                                      />
                                      <button
                                        onClick={cancelAnswering}
                                        className="px-2 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50"
                                      >
                                        <X size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleSubmitAnswer(app.id)}
                                        disabled={processingId === app.id || !followUpAnswer.trim()}
                                        className="px-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                      >
                                        {processingId === app.id ? (
                                          <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                          <Send size={16} />
                                        )}
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-red-400 mt-1 italic">等待回答...</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* 回答追问按钮 */}
                    {hasUnansweredFollowUp && answerMode !== app.id && (
                      <div className="mt-4">
                        <button
                          onClick={() => startAnswering(app)}
                          className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 flex items-center justify-center gap-2"
                        >
                          <MessageCircle size={16} />
                          回答追问
                        </button>
                      </div>
                    )}

                    {/* 如果通过了，显示对方微信号 */}
                    {app.status === 'approved' && (
                      <div className="mt-4">
                        {app.profile?.contactWechat ? (
                          <div className="p-3 rounded-lg border bg-green-50 border-green-100 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-green-600 mb-0.5">对方微信号</p>
                              <p className="text-sm font-mono text-green-800 font-bold">{app.profile.contactWechat}</p>
                            </div>
                            <button
                              onClick={() => {
                                copyToClipboard(app.profile!.contactWechat!)
                                showToast('微信号已复制')
                              }}
                              className="text-green-600 hover:text-green-700 p-2"
                            >
                              <Copy size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg border bg-yellow-50 border-yellow-100 text-yellow-700 text-xs">
                            对方暂未设置微信号
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
