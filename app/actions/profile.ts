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

  return {
    profile: {
      id: profile.id,
      nickname: profile.nickname,
      title: profile.title,
      tags: profile.tags,
      aboutMe: profile.aboutMe,
      lookingFor: profile.lookingFor,
      questions: profile.questions,
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

    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        ...(validated.nickname && { nickname: validated.nickname }),
        ...(validated.title && { title: validated.title }),
        ...(validated.tags && { tags: validated.tags }),
        ...(validated.aboutMe && { aboutMe: validated.aboutMe }),
        ...(validated.lookingFor && { lookingFor: validated.lookingFor }),
        ...(validated.questions && { questions: validated.questions }),
        ...(validated.contactEmail !== undefined && { contactEmail: validated.contactEmail }),
        ...(validated.contactWechat !== undefined && { contactWechat: validated.contactWechat }),
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
