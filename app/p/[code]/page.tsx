import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getProfileByShareCode } from '@/app/actions/profile'
import { ApplyForm } from '@/components/apply/ApplyForm'

interface PageProps {
  params: Promise<{ code: string }>
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { code } = await params
  const result = await getProfileByShareCode(code)

  if (result.error || !result.profile) {
    notFound()
  }

  // 获取当前登录用户的 session
  const session = await auth()

  // 未登录用户重定向到登录页
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/p/${code}`)
  }

  // 获取当前登录用户的 profile 信息
  const isOwnProfile = session.user.id === result.profile.userId

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: {
      nickname: true,
      contactWechat: true,
      contactEmail: true,
    },
  })

  const currentUserProfile = profile
    ? {
        nickname: profile.nickname,
        wechat: profile.contactWechat || '',
        email: profile.contactEmail || '',
      }
    : null

  return (
    <ApplyForm
      profile={result.profile}
      currentUser={currentUserProfile}
      isOwnProfile={isOwnProfile}
    />
  )
}
