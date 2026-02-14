import { useListForms } from '@/lib/api/generated/form/form'
import { useUser } from '@/lib/auth'

export function useForms() {
  const user = useUser()

  const query = useListForms({
    query: {
      enabled: !!user?.id,
    },
  })

  return {
    ...query,
    data: query.data?.data,
  }
}
