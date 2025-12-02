'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { applicationSchema, applicationActionSchema } from '@/lib/validations'
import type { FollowUp, ApplicationStatus } from '@/lib/types'

// 提交申请（申请者调用）
export async function submitApplication(data: {
  profileId: string
  applicantName?: string
  applicantWechat?: string
  applicantEmail?: string
  applicantPhone?: string
  answers: string[]
  questions: string[]
  syncToProfile?: boolean // 是否将联系方式同步到用户名片
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

    // 防止自己申请自己
    if (session?.user?.id && session.user.id === profile.userId) {
      return { error: '不能申请自己的名片哦' }
    }
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
      // 如果用户已有联系方式，使用已有的；否则使用传入的
      applicantWechat = me?.contactWechat || applicantWechat
      applicantEmail = me?.contactEmail || applicantEmail

      // 如果需要同步联系方式到用户名片
      if (data.syncToProfile && (applicantWechat || applicantEmail)) {
        await prisma.profile.update({
          where: { userId: session.user.id },
          data: {
            ...(applicantWechat && !me?.contactWechat ? { contactWechat: applicantWechat } : {}),
            ...(applicantEmail && !me?.contactEmail ? { contactEmail: applicantEmail } : {}),
          },
        })
      }
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
      applicantUser: {
        select: {
          profile: {
            select: {
              nickname: true,
              title: true,
              tags: true,
              aboutMe: true,
              lookingFor: true,
            },
          },
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
      followUps: (app.followUps as unknown as FollowUp[]) || [],
      status: app.status as ApplicationStatus,
      replyMessage: app.replyMessage ?? undefined,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      profile: app.profile,
      applicantProfile: app.applicantUser?.profile ? {
        nickname: app.applicantUser.profile.nickname,
        title: app.applicantUser.profile.title,
        tags: app.applicantUser.profile.tags,
        aboutMe: app.applicantUser.profile.aboutMe,
        lookingFor: app.applicantUser.profile.lookingFor,
      } : undefined
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
      followUps: (app.followUps as unknown as FollowUp[]) || [],
      status: app.status as ApplicationStatus,
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

  const [pending, followUp, answered, approved, rejected, sent, needAnswer] = await Promise.all([
    prisma.application.count({
      where: { targetUserId: session.user.id, status: 'pending' },
    }),
    prisma.application.count({
      where: { targetUserId: session.user.id, status: 'follow_up' },
    }),
    prisma.application.count({
      where: { targetUserId: session.user.id, status: 'answered' },
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
    // 需要我回答的追问
    prisma.application.count({
      where: { applicantUserId: session.user.id, status: 'follow_up' },
    }),
  ])

  return {
    stats: {
      pending: pending + answered, // 待处理 = 新申请 + 已回复追问
      followUp,
      answered,
      approved,
      rejected,
      total: pending + followUp + answered + approved + rejected,
      sent,
      needAnswer, // 需要我回答追问的数量
    },
  }
}

// 发起追问（被申请者调用）
export async function sendFollowUp(data: {
  applicationId: string
  questions: string[]
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: '请先登录' }
  }

  try {
    const { applicationId, questions } = data

    // 过滤空问题
    const validQuestions = questions.filter(q => q.trim())
    if (validQuestions.length === 0) {
      return { error: '请至少填写一个问题' }
    }

    // 获取申请信息
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return { error: '申请不存在' }
    }

    // 验证权限
    if (application.targetUserId !== session.user.id) {
      return { error: '无权操作此申请' }
    }

    // 只能在 pending 或 answered 状态下追问
    if (!['pending', 'answered'].includes(application.status)) {
      return { error: '当前状态不能追问' }
    }

    // 获取现有追问记录
    const existingFollowUps = (application.followUps as FollowUp[]) || []

    // 添加新的追问
    const newFollowUp: FollowUp = {
      questions: validQuestions,
      answers: [],
      createdAt: new Date().toISOString(),
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        followUps: [...existingFollowUps, newFollowUp],
        status: 'follow_up',
      },
    })

    revalidatePath('/dashboard/inbox')
    revalidatePath('/dashboard/sent')

    return { success: true }
  } catch (error) {
    console.error('Send follow-up error:', error)
    return { error: '发送追问失败，请稍后重试' }
  }
}

// 回答追问（申请者调用）
export async function answerFollowUp(data: {
  applicationId: string
  answers: string[]
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: '请先登录' }
  }

  try {
    const { applicationId, answers } = data

    // 获取申请信息
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      return { error: '申请不存在' }
    }

    // 验证权限
    if (application.applicantUserId !== session.user.id) {
      return { error: '无权操作此申请' }
    }

    // 只能在 follow_up 状态下回答
    if (application.status !== 'follow_up') {
      return { error: '当前状态不需要回答' }
    }

    // 获取现有追问记录
    const existingFollowUps = (application.followUps as FollowUp[]) || []
    if (existingFollowUps.length === 0) {
      return { error: '没有追问需要回答' }
    }

    // 获取最后一个追问（需要回答的）
    const lastFollowUp = existingFollowUps[existingFollowUps.length - 1]

    // 验证答案数量
    if (answers.length !== lastFollowUp.questions.length) {
      return { error: '请回答所有问题' }
    }

    // 检查是否所有答案都已填写
    if (!answers.every(a => a.trim())) {
      return { error: '请回答所有问题' }
    }

    // 更新最后一个追问的答案
    const updatedFollowUps = [...existingFollowUps]
    updatedFollowUps[updatedFollowUps.length - 1] = {
      ...lastFollowUp,
      answers: answers,
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        followUps: updatedFollowUps,
        status: 'answered',
      },
    })

    revalidatePath('/dashboard/inbox')
    revalidatePath('/dashboard/sent')

    return { success: true }
  } catch (error) {
    console.error('Answer follow-up error:', error)
    return { error: '提交回答失败，请稍后重试' }
  }
}
