import { useInfiniteQuery } from '@tanstack/react-query'
import { getListTweetsQueryKey, listTweets } from '../generated/tweet/tweet'
import type { ListTweetsParams } from '../generated/models'

export function useListTweetsInfinite(params: Omit<ListTweetsParams, 'offset'>) {
  return useInfiniteQuery({
    queryKey: [...getListTweetsQueryKey(params), 'infinite'],
    queryFn: ({ pageParam = 0 }) => listTweets({ ...params, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.hasMore) return undefined
      return lastPage.meta.offset + lastPage.meta.limit
    },
  })
}
