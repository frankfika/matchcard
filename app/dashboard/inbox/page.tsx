import { getReceivedApplications } from '@/app/actions/application'
import { getProfile } from '@/app/actions/profile'
import { InboxList } from '@/components/dashboard/InboxList'

export default async function InboxPage() {
  const [applicationsResult, profileResult] = await Promise.all([
    getReceivedApplications(),
    getProfile(),
  ])

  if (applicationsResult.error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-600">{applicationsResult.error}</p>
      </div>
    )
  }

  return (
    <InboxList
      applications={applicationsResult.applications || []}
      myWechat={profileResult.profile?.contactWechat || ''}
    />
  )
}
