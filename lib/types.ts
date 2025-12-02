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
  title: '寻找同频灵魂',
  nickname: 'Mysterious ENTP',
  tags: ['90后', '创业', 'Web3/AI', 'ENTP'],
  aboutMe: [
    '性格随和，成熟，认知高，解决问题能力强',
    '擅长做菜，喜欢旅游，骑车，网球',
    '性格：真诚直率，追求本质',
  ],
  lookingFor: [
    '心智成熟，情绪稳定，真诚有责任心',
    '有共同话题，认知同频，互帮互助',
    '以长期伴侣为目标，拒绝短期关系',
  ],
  questions: [
    '你最近在读的一本书是什么？',
    '描述一下你理想的周六是如何度过的？',
    '你对未来的职业规划是什么？',
  ],
  contactEmail: '',
  contactWechat: '',
  themeColor: 'zinc',
  gender: 'Female',
  targetGender: 'Male',
}

// 申请状态
export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

// 申请数据
export interface ApplicationData {
  id: string
  profileId: string
  applicantName: string
  applicantWechat: string
  questions: string[]
  answers: string[]
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
