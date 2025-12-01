import { getProfile } from '@/app/actions/profile'
import { ProfileEditor } from '@/components/dashboard/ProfileEditor'

export default async function DashboardPage() {
  const result = await getProfile()

  if (result.error || !result.profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-600">{result.error || '加载失败'}</p>
      </div>
    )
  }

  return <ProfileEditor initialProfile={result.profile} />
}
