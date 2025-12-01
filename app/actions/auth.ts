'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { registerSchema } from '@/lib/validations'
import { DEFAULT_PROFILE } from '@/lib/types'

export async function register(data: { name: string; email: string; password: string }) {
  try {
    const validated = registerSchema.parse(data)

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return { error: '该邮箱已被注册' }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(validated.password, 12)

    // 创建用户和默认 Profile
    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        profile: {
          create: {
            nickname: validated.name,
            title: DEFAULT_PROFILE.title,
            tags: DEFAULT_PROFILE.tags,
            aboutMe: DEFAULT_PROFILE.aboutMe,
            lookingFor: DEFAULT_PROFILE.lookingFor,
            questions: DEFAULT_PROFILE.questions,
            themeColor: DEFAULT_PROFILE.themeColor,
            gender: DEFAULT_PROFILE.gender,
            targetGender: DEFAULT_PROFILE.targetGender,
          },
        },
      },
    })

    return { success: true, userId: user.id }
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return { error: '请检查输入信息' }
    }
    console.error('Register error:', error)
    return { error: '注册失败，请稍后重试' }
  }
}
