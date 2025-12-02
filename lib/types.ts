// 前端使用的类型定义

export interface ProfileData {
  id?: string
  nickname: string
  title: string
  tags: string[]
  aboutMe: string[]
  lookingFor: string[]
  questions: string[]
  contactEmail: string
  contactWechat: string
  themeColor: ThemeColor
  gender: Gender
  targetGender: Gender
  shareCode?: string
  isPublic?: boolean
}

export type Gender = 'Male' | 'Female' | 'Non-binary' | 'Any'

export type ThemeColor = 'zinc' | 'blue' | 'rose' | 'amber' | 'emerald' | 'violet'

export const COLORS: Record<ThemeColor, string> = {
  zinc: 'bg-gradient-to-br from-zinc-800 via-zinc-900 to-black',
  blue: 'bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-800',
  rose: 'bg-gradient-to-br from-rose-400 via-pink-600 to-rose-900',
  amber: 'bg-gradient-to-br from-amber-300 via-orange-500 to-red-600',
  emerald: 'bg-gradient-to-br from-emerald-400 via-teal-600 to-cyan-800',
  violet: 'bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-900',
}

export const DEFAULT_PROFILE: ProfileData = {
  title: '',
  nickname: '',
  tags: [],
  aboutMe: [''],
  lookingFor: [''],
  questions: [''],
  contactEmail: '',
  contactWechat: '',
  themeColor: 'zinc',
  gender: 'Any',
  targetGender: 'Any',
}

// 申请状态
// pending: 待处理, follow_up: 追问中(等待申请者回答), answered: 已回复追问, approved: 已通过, rejected: 已拒绝
export type ApplicationStatus = 'pending' | 'follow_up' | 'answered' | 'approved' | 'rejected'

// 追问记录
export interface FollowUp {
  questions: string[]
  answers: string[]
  createdAt: string
}

// 申请数据
export interface ApplicationData {
  id: string
  profileId: string
  applicantName: string
  applicantWechat: string
  questions: string[]
  answers: string[]
  followUps: FollowUp[]
  status: ApplicationStatus
  replyMessage?: string
  createdAt: string
  updatedAt: string
  // 关联的 profile 信息（用于显示）
  profile?: {
    nickname: string
    title: string
    themeColor: string
    contactWechat?: string
  }
  // 申请者的名片信息（用于筛选时查看）
  applicantProfile?: {
    nickname: string
    title: string
    tags: string[]
    aboutMe: string[]
    lookingFor: string[]
  }
}

// 用于 URL 编码的申请 payload
export interface ApplicationPayload {
  type: 'APP'
  p: string   // profileId
  n: string   // applicantName
  w: string   // applicantWechat
  a: string[] // answers
  q: string[] // questions
  t: number   // timestamp
}
