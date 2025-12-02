'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { applicationSchema, applicationActionSchema } from '@/lib/validations'

// 提交申请（申请者调用）
export async function submitApplication(data: {
  profileId: string
  applicantName?: string
  applicantWechat?: string
  applicantEmail?: string
  applicantPhone?: string
  answers: string[]
  questions: string[]
}) {
  try {
    const validated = applicationSchema.parse(data)

    // 获取目标名片信息
    const profile = await prisma.profile.findUnique({
      where: { id: validated.profileId },
      select: { userId: true, nickname: true },
    })

    if (!profile) {
      return { error: '名片不存在' }
    }

    // 登录用户优先使用自己的名片联系方式；未登录允许填写任意联系方式
    const session = await auth()
    let applicantUserId: string | null = null
    let applicantName = validated.applicantName || ''
    let applicantWechat = validated.applicantWechat || ''
    let applicantEmail = validated.applicantEmail || ''
    const applicantPhone = validated.applicantPhone || ''

    if (session?.user?.id) {
      applicantUserId = session.user.id
      const me = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { nickname: true, contactWechat: true, contactEmail: true },
      })
      applicantName = applicantName || me?.nickname || '匿名'
      applicantWechat = me?.contactWechat || applicantWechat
      applicantEmail = me?.contactEmail || applicantEmail
    }

    // 至少提供一种联系方式
    if (![applicantWechat, applicantEmail, applicantPhone].some((v) => (v || '').trim().length > 0)) {
      return { error: '请至少填写一种联系方式（微信/邮箱/电话）' }
    }

    // 检查是否已申请过（同一申请者对同一名片）
    const existing = await prisma.application.findFirst({
      where: {
        profileId: validated.profileId,
        OR: [
          { applicantUserId: applicantUserId || undefined },
          applicantWechat ? { applicantWechat } : {},
          applicantEmail ? { applicantEmail } : {},
        ],
      },
    })
    if (existing) {
      return { error: '你已经申请过了，请等待对方回复' }
    }

    // 创建申请
    const application = await prisma.application.create({
      data: {
        profileId: validated.profileId,
        targetUserId: profile.userId,
        applicantUserId,
        applicantName,
        applicantWechat,
        applicantEmail,
        applicantPhone,
        questions: validated.questions,
        answers: validated.answers,
        status: 'pending',
      },
    })

    revalidatePath('/dashboard/inbox')

    return { success: true, applicationId: application.id }
  } catch (error) {
    console.error('Submit application error:', error)
    return { error: '提交失败，请稍后重试' }
  }
}

// 获取收到的申请（被申请者调用）
export async function getReceivedApplications() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: '请先登录' }
  }

  const applications = await prisma.application.findMany({
    where: { targetUserId: session.user.id },
    include: {
      profile: {
        select: {
          nickname: true,
          title: true,
          themeColor: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return {
    applications: applications.map((app) => ({
      id: app.id,
      profileId: app.profileId,
      applicantName: app.applicantName,
      applicantWechat: app.applicantWechat ?? '',
      questions: app.questions,
      answers: app.answers,
      status: app.status as 'pending' | 'approved' | 'rejected',
      replyMessage: app.replyMessage ?? undefined,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      profile: app.profile,
    })),
  }
}

// 获取发出的申请（申请者调用）
export async function getSentApplications() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: '请先登录' }
  }

  const applications = await prisma.application.findMany({
    where: { applicantUserId: session.user.id },
    include: {
      profile: {
        select: {
          nickname: true,
          title: true,
          themeColor: true,
          contactWechat: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return {
    applications: applications.map((app) => ({
      id: app.id,
      profileId: app.profileId,
      applicantName: app.applicantName,
      applicantWechat: app.applicantWechat ?? '',
      questions: app.questions,
      answers: app.answers,
      status: app.status as 'pending' | 'approved' | 'rejected',
      replyMessage: app.replyMessage ?? undefined,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      profile: {
        ...app.profile,
        contactWechat: app.profile?.contactWechat ?? undefined,
      },
    })),
  }
}

// 处理申请（通过/拒绝）
export async function handleApplication(data: {
  applicationId: string
  action: 'approve' | 'reject'
  replyMessage?: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: '请先登录' }
  }

  try {
    const validated = applicationActionSchema.parse(data)

    // 获取申请信息
    const application = await prisma.application.findUnique({
      where: { id: validated.applicationId },
      include: { profile: true },
    })

    if (!application) {
      return { error: '申请不存在' }
    }

    // 验证权限
    if (application.targetUserId !== session.user.id) {
      return { error: '无权操作此申请' }
    }

    // 更新申请状态
    const status = validated.action === 'approve' ? 'approved' : 'rejected'

    await prisma.application.update({
      where: { id: validated.applicationId },
      data: {
        status,
        replyMessage: validated.replyMessage || null,
      },
    })

    revalidatePath('/dashboard/inbox')

    return { success: true, status }
  } catch (error) {
    console.error('Handle application error:', error)
    return { error: '操作失败，请稍后重试' }
  }
}

// 获取申请统计
export async function getApplicationStats() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: '请先登录' }
  }

  const [pending, approved, rejected, sent] = await Promise.all([
    prisma.application.count({
      where: { targetUserId: session.user.id, status: 'pending' },
    }),
    prisma.application.count({
      where: { targetUserId: session.user.id, status: 'approved' },
    }),
    prisma.application.count({
      where: { targetUserId: session.user.id, status: 'rejected' },
    }),
    prisma.application.count({
      where: { applicantUserId: session.user.id },
    }),
  ])

  return {
    stats: {
      pending,
      approved,
      rejected,
      total: pending + approved + rejected,
      sent,
    },
  }
}
