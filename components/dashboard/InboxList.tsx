'use client'

import { useState } from 'react'
import { handleApplication } from '@/app/actions/application'
import { copyToClipboard } from '@/lib/utils'
import type { ApplicationData } from '@/lib/types'
import {
  Download,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Copy,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
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

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            <Clock size={12} /> 待处理
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

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-zinc-900 text-white px-6 py-2 rounded-full text-sm flex items-center gap-2 shadow-xl animate-fade-in-down">
          <Check size={16} /> {toast}
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
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      app.status === 'pending'
                        ? 'bg-blue-100 text-blue-700'
                        : app.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {app.applicantName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">{app.applicantName || '未命名'}</h3>
                    <p className="text-xs text-gray-400">
                      {new Date(app.createdAt).toLocaleDateString('zh-CN')}
                    </p>
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
                  className="px-4 pb-4 border-t border-gray-50 bg-gray-50/30 cursor-default"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-4 mt-4">
                    {app.questions.map((q, i) => (
                      <div key={i}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{q}</p>
                        <p className="text-sm text-gray-800 bg-white p-2.5 rounded border border-gray-100 leading-relaxed shadow-sm">
                          {app.answers[i]}
                        </p>
                      </div>
                    ))}

                    {/* 微信号显示 */}
                    <div className="pt-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                        对方微信号{' '}
                        {app.status === 'approved' ? (
                          <span className="text-green-600">(已显示)</span>
                        ) : (
                          <span className="text-amber-600">(待审批)</span>
                        )}
                      </p>
                      <div
                        className={`text-sm font-mono p-3 rounded border flex items-center justify-between ${
                          app.status === 'approved'
                            ? 'bg-green-50 text-green-800 border-green-100'
                            : 'bg-zinc-100 text-zinc-400 border-zinc-200'
                        }`}
                      >
                        <span>
                          {app.status === 'approved'
                            ? app.applicantWechat
                            : app.applicantWechat.replace(/./g, '*')}
                        </span>
                        {app.status === 'approved' && (
                          <button
                            onClick={() => {
                              copyToClipboard(app.applicantWechat)
                              showToast('微信号已复制')
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Copy size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  {app.status === 'pending' && (
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAction(app.id, 'reject', app.applicantName)}
                        disabled={processingId === app.id}
                        className="py-3 border border-gray-200 bg-white rounded-xl text-gray-600 text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {processingId === app.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <X size={14} />
                        )}
                        婉拒
                      </button>
                      <button
                        onClick={() => handleAction(app.id, 'approve', app.applicantName)}
                        disabled={processingId === app.id || !myWechat}
                        className="py-3 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
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

                  {!myWechat && app.status === 'pending' && (
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
