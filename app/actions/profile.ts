'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { profileSchema } from '@/lib/validations'
import type { ProfileData } from '@/lib/types'

export async function getProfile() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: '请先登录' }
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) {
    return { error: '未找到名片' }
  }

  // 确保数组至少有一个空字符串用于显示输入框
  const ensureArray = (arr: string[]) => arr.length > 0 ? arr : ['']

  return {
    profile: {
      id: profile.id,
      nickname: profile.nickname,
      title: profile.title,
      tags: profile.tags,
      aboutMe: ensureArray(profile.aboutMe),
      lookingFor: ensureArray(profile.lookingFor),
      questions: ensureArray(profile.questions),
      contactEmail: profile.contactEmail || '',
      contactWechat: profile.contactWechat || '',
      themeColor: profile.themeColor as ProfileData['themeColor'],
      gender: profile.gender as ProfileData['gender'],
      targetGender: profile.targetGender as ProfileData['targetGender'],
      shareCode: profile.shareCode,
      isPublic: profile.isPublic,
    } as ProfileData,
  }
}

export async function updateProfile(data: Partial<ProfileData>) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: '请先登录' }
  }

  try {
    // 验证数据
    const validated = profileSchema.partial().parse(data)

    // 过滤空值
    const cleanTags = validated.tags?.filter(t => t.trim()) || []
    const cleanAboutMe = validated.aboutMe?.filter(t => t.trim()) || []
    const cleanLookingFor = validated.lookingFor?.filter(t => t.trim()) || []
    const cleanQuestions = validated.questions?.filter(t => t.trim()) || []

    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        ...(validated.nickname !== undefined && { nickname: validated.nickname.trim() }),
        ...(validated.title !== undefined && { title: validated.title.trim() }),
        ...(validated.tags && { tags: cleanTags }),
        ...(validated.aboutMe && { aboutMe: cleanAboutMe }),
        ...(validated.lookingFor && { lookingFor: cleanLookingFor }),
        ...(validated.questions && { questions: cleanQuestions }),
        ...(validated.contactEmail !== undefined && { contactEmail: validated.contactEmail.trim() }),
        ...(validated.contactWechat !== undefined && { contactWechat: validated.contactWechat.trim() }),
        ...(validated.themeColor && { themeColor: validated.themeColor }),
        ...(validated.gender && { gender: validated.gender }),
        ...(validated.targetGender && { targetGender: validated.targetGender }),
        ...(validated.isPublic !== undefined && { isPublic: validated.isPublic }),
      },
    })

    revalidatePath('/dashboard')
    revalidatePath(`/p/${profile.shareCode}`)

    return { success: true, profile }
  } catch (error) {
    console.error('Update profile error:', error)
    return { error: '保存失败，请稍后重试' }
  }
}

export async function getProfileByShareCode(shareCode: string) {
  const profile = await prisma.profile.findUnique({
    where: { shareCode },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!profile || !profile.isPublic) {
    return { error: '名片不存在或未公开' }
  }

  return {
    profile: {
      id: profile.id,
      userId: profile.userId,
      nickname: profile.nickname,
      title: profile.title,
      tags: profile.tags,
      aboutMe: profile.aboutMe,
      lookingFor: profile.lookingFor,
      questions: profile.questions,
      themeColor: profile.themeColor,
      gender: profile.gender,
      targetGender: profile.targetGender,
      shareCode: profile.shareCode,
    },
  }
}
