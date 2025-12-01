import { notFound } from 'next/navigation'
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

  return <ApplyForm profile={result.profile} />
}
