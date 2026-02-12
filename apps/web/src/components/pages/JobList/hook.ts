import { useListJobs } from '@/lib/api/generated/job/job'
import { useUser } from '@/lib/auth'

export function useJobs() {
  const user = useUser()

  const query = useListJobs({
    query: {
      enabled: !!user?.id,
    },
  })

  return {
    ...query,
    data: query.data?.data,
  }
}
