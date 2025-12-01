import { getSentApplications } from '@/app/actions/application'
import { SentList } from '@/components/dashboard/SentList'

export default async function SentPage() {
  const result = await getSentApplications()

  if (result.error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-600">{result.error}</p>
      </div>
    )
  }

  return <SentList applications={result.applications || []} />
}
