import { ApplicationPayload } from './types'

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    return false
  }
}

// 编码申请数据（用于分享链接）
export const encodePayload = (data: ApplicationPayload): string => {
  try {
    const json = JSON.stringify(data)
    const encoder = new TextEncoder()
    const bytes = encoder.encode(json)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return 'soul:' + btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } catch {
    return ''
  }
}

// 解码申请数据
export const decodePayload = (str: string): ApplicationPayload | null => {
  try {
    const cleanStr = str.trim()
    if (!cleanStr.startsWith('soul:')) return null
    let base64 = cleanStr.substring(5).replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const decoder = new TextDecoder()
    return JSON.parse(decoder.decode(bytes))
  } catch {
    return null
  }
}

// 生成随机 ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

// 格式化日期
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 格式化相对时间
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return formatDate(d)
}
