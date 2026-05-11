import { computed, type Ref } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { QUEUE_PAGINATION_DEFAULTS } from '../../constants/queue-pagination'
import { REVIEW_QUERY_KEYS } from '../../constants/query-keys'
import { toReviewQueueItem } from '../../mappers/review-queue.mapper'
import type { IReviewQueueRequest } from '../../types/requests/review-queue.request'
import type { IApiReviewQueueItem } from '../../types/responses/review-queue.response'
import type { IReviewQueueItem } from '../../types/review-queue-item.type'

interface IReviewQueuePage {
  items: IReviewQueueItem[]
  page: number
  total: number
  totalPages: number
}

export function useReviewQueueQuery(
  eventSlug: Ref<string>,
  options: Ref<Pick<IReviewQueueRequest, 'onlyPending' | 'limit'>>,
) {
  const limit = computed(() => options.value.limit ?? QUEUE_PAGINATION_DEFAULTS.LIMIT)

  return useInfiniteQuery({
    queryKey: computed(() => [
      ...REVIEW_QUERY_KEYS.queue(eventSlug.value, options.value.onlyPending ?? false),
      limit.value,
    ]),
    initialPageParam: QUEUE_PAGINATION_DEFAULTS.PAGE as number,
    queryFn: async ({ pageParam }: { pageParam: number }): Promise<IReviewQueuePage> => {
      const response = await httpClient.get<IApiReviewQueueItem[]>(
        API_ROUTES.EVENTS.REVIEW_QUEUE(eventSlug.value),
        {
          params: {
            page: pageParam,
            limit: limit.value,
            status: options.value.onlyPending ? 'pending' : 'all',
          },
        },
      )
      const items = response.data.map((item) => toReviewQueueItem(item))
      const pagination = response.meta.pagination ?? {
        total: items.length,
        page: pageParam,
        limit: limit.value,
        totalPages: 1,
      }
      return {
        items,
        page: pagination.page,
        total: pagination.total,
        totalPages: pagination.totalPages,
      }
    },
    getNextPageParam: (last: IReviewQueuePage) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    enabled: computed(() => !!eventSlug.value),
  })
}
