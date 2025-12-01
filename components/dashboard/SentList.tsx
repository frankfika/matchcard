'use client'

import type { ApplicationData } from '@/lib/types'
import { Clock, Check, Send, CheckCircle, XCircle, HourglassIcon } from 'lucide-react'

interface SentListProps {
  applications: ApplicationData[]
}

export function SentList({ applications }: SentListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            <HourglassIcon size={12} /> 等待回复
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

  return (
    <div className="flex flex-col h-full bg-gray-50">
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
          applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 transition-all"
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

              {/* 显示回答摘要 */}
              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500">
                <p className="font-medium text-gray-700 mb-1">你的回答:</p>
                <p className="line-clamp-2 italic">{app.answers.join(' | ')}</p>
              </div>

              {/* 如果通过了，显示对方微信 */}
              {app.status === 'approved' && app.replyMessage && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xs font-bold text-green-700 mb-1">对方回复:</p>
                  <p className="text-sm text-green-800">{app.replyMessage}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
