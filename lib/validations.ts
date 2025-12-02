import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, '名字至少2个字符').max(50, '名字最多50个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符').max(100, '密码最多100个字符'),
})

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

export const profileSchema = z.object({
  nickname: z.string().min(1, '请输入昵称').max(50, '昵称最多50个字符'),
  title: z.string().min(1, '请输入个人标语').max(100, '标语最多100个字符'),
  tags: z.array(z.string()).max(10, '最多10个标签'),
  aboutMe: z.array(z.string()).min(1, '至少填写一条自我介绍').max(10, '最多10条'),
  lookingFor: z.array(z.string()).min(1, '至少填写一条期望').max(10, '最多10条'),
  questions: z.array(z.string()).min(1, '至少设置一个问题').max(5, '最多5个问题'),
  contactEmail: z.string().email('请输入有效的邮箱').optional().or(z.literal('')),
  contactWechat: z.string().max(50, '微信号最多50个字符').optional().or(z.literal('')),
  themeColor: z.enum(['zinc', 'blue', 'rose', 'amber', 'emerald', 'violet']),
  gender: z.enum(['Male', 'Female', 'Non-binary', 'Any']),
  targetGender: z.enum(['Male', 'Female', 'Non-binary', 'Any']),
  isPublic: z.boolean().optional(),
})

export const applicationSchema = z.object({
  profileId: z.string().min(1, '缺少名片ID'),
  applicantName: z.string().min(1, '请输入您的昵称').max(50, '昵称最多50个字符').optional().or(z.literal('')),
  applicantWechat: z.string().max(50, '微信号最多50个字符').optional().or(z.literal('')),
  applicantEmail: z.string().email('请输入有效的邮箱').optional().or(z.literal('')),
  applicantPhone: z.string().max(20, '电话最多20个字符').optional().or(z.literal('')),
  answers: z.array(z.string().min(1, '请回答问题')).min(1, '请回答问题'),
  questions: z.array(z.string()),
})

export const applicationActionSchema = z.object({
  applicationId: z.string().min(1),
  action: z.enum(['approve', 'reject']),
  replyMessage: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type ApplicationInput = z.infer<typeof applicationSchema>
export type ApplicationActionInput = z.infer<typeof applicationActionSchema>
