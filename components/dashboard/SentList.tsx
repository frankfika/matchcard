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
} from 'lucide-react'

interface SentListProps {
  applications: ApplicationData[]
}

export function SentList({ applications: initialApplications }: SentListProps) {
  const [applications, setApplications] = useState(initialApplications)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // 追问回答状态
  const [answerMode, setAnswerMode] = useState<string | null>(null)
  const [followUpAnswers, setFollowUpAnswers] = useState<string[]>([])

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
            <MessageCircle size={12} /> 已回复追问
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
    if (app.followUps && app.followUps.length > 0) {
      const lastFollowUp = app.followUps[app.followUps.length - 1]
      setAnswerMode(app.id)
      setFollowUpAnswers(new Array(lastFollowUp.questions.length).fill(''))
      setExpandedId(app.id)
    }
  }

  // 取消回答
  const cancelAnswering = () => {
    setAnswerMode(null)
    setFollowUpAnswers([])
  }

  // 更新回答
  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...followUpAnswers]
    newAnswers[index] = value
    setFollowUpAnswers(newAnswers)
  }

  // 提交回答
  const handleSubmitAnswers = async (applicationId: string) => {
    if (followUpAnswers.some(a => !a.trim())) {
      showToast('请回答所有问题')
      return
    }

    setProcessingId(applicationId)
    const result = await answerFollowUp({
      applicationId,
      answers: followUpAnswers,
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
              answers: followUpAnswers,
            }
            return { ...app, status: 'answered', followUps: updatedFollowUps }
          }
          return app
        })
      )
      setAnswerMode(null)
      setFollowUpAnswers([])
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
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">
                        {app.profile?.nickname || app.profile?.title || '名片'}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Clock size={12} />
                        {new Date(app.createdAt).toLocaleDateString('zh-CN')}{' '}
                        {new Date(app.createdAt).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  {/* 需要回答追问的提示 */}
                  {hasUnansweredFollowUp && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
                      <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        对方向你发起了追问，请尽快回答
                      </p>
                    </div>
                  )}

                  {/* 显示回答摘要 */}
                  <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500">
                    <p className="font-medium text-gray-700 mb-1">你的初始回答:</p>
                    <p className="line-clamp-2 italic">{app.answers.join(' | ')}</p>
                  </div>
                </div>

                {/* 展开详情 */}
                {expandedId === app.id && (
                  <div className="px-5 pb-5 border-t border-gray-100 bg-gray-50/50">
                    {/* 追问历史 */}
                    {app.followUps && app.followUps.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                          <HelpCircle size={12} /> 追问记录
                        </p>
                        {app.followUps.map((followUp, fIdx) => (
                          <div key={fIdx} className="bg-purple-50 rounded-xl border border-purple-100 overflow-hidden">
                            <div className="p-3 border-b border-purple-100 bg-purple-100/50">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-purple-600 uppercase">
                                  追问 #{fIdx + 1}
                                </span>
                                <span className="text-[10px] text-purple-400">
                                  {new Date(followUp.createdAt).toLocaleDateString('zh-CN')}
                                </span>
                              </div>
                            </div>
                            <div className="p-3 space-y-3">
                              {followUp.questions.map((q, qIdx) => (
                                <div key={qIdx}>
                                  <p className="text-[10px] font-bold text-purple-500 mb-1">{q}</p>
                                  {followUp.answers[qIdx] ? (
                                    <p className="text-sm text-gray-800 bg-white p-2 rounded-lg border border-purple-100">
                                      {followUp.answers[qIdx]}
                                    </p>
                                  ) : answerMode === app.id && fIdx === app.followUps.length - 1 ? (
                                    <textarea
                                      value={followUpAnswers[qIdx] || ''}
                                      onChange={(e) => updateAnswer(qIdx, e.target.value)}
                                      placeholder="请输入你的回答..."
                                      rows={2}
                                      className="w-full text-sm p-2 rounded-lg border border-purple-200 bg-white focus:ring-2 focus:ring-purple-300 resize-none"
                                    />
                                  ) : (
                                    <p className="text-sm text-red-400 italic bg-red-50 p-2 rounded-lg">
                                      等待你回答...
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 回答追问按钮 */}
                    {hasUnansweredFollowUp && answerMode !== app.id && (
                      <div className="mt-4">
                        <button
                          onClick={() => startAnswering(app)}
                          className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 flex items-center justify-center gap-2 shadow-lg"
                        >
                          <MessageCircle size={16} />
                          回答追问
                        </button>
                      </div>
                    )}

                    {/* 回答模式下的提交按钮 */}
                    {answerMode === app.id && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={cancelAnswering}
                          className="flex-1 py-3 border border-gray-200 bg-white rounded-xl text-gray-600 text-sm font-bold hover:bg-gray-50"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => handleSubmitAnswers(app.id)}
                          disabled={processingId === app.id}
                          className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {processingId === app.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Send size={16} />
                          )}
                          提交回答
                        </button>
                      </div>
                    )}

                    {/* 如果通过了，显示对方回复与微信号 */}
                    {app.status === 'approved' && (
                      <div className="mt-4 space-y-3">
                        {app.replyMessage && (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                            <p className="text-xs font-bold text-green-700 mb-1">对方回复:</p>
                            <p className="text-sm text-green-800">{app.replyMessage}</p>
                          </div>
                        )}
                        {app.profile?.contactWechat && (
                          <div className="p-3 rounded-lg border bg-white flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-gray-500 mb-1">对方微信号</p>
                              <p className="text-sm font-mono text-zinc-800">{app.profile.contactWechat}</p>
                            </div>
                            <button
                              onClick={() => {
                                copyToClipboard(app.profile!.contactWechat!)
                                showToast('微信号已复制')
                              }}
                              className="text-zinc-600 hover:text-zinc-900"
                              title="复制微信号"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        )}
                        {!app.profile?.contactWechat && (
                          <div className="p-3 rounded-lg border bg-yellow-50 text-yellow-700 text-xs">
                            对方暂未设置微信号，请稍后再试或等待对方主动联系。
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
