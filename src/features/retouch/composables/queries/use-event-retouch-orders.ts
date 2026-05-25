import { computed, ref, type Ref } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { RETOUCH_QUERY_KEYS } from '../../constants/retouch-query-keys'
import { toRetouchQueueOrder } from '../../mappers/operator-retouch-queue.mapper'
import type {
  IApiRetouchQueueOrder,
  IRetouchQueueOrder,
} from '../../types/responses/operator-retouch-queue.response'
import type { TRetouchOrderScope } from '../../types/responses/operator-retouch-orders.response'

const PAGE_LIMIT = 30

interface IPageParams {
  page: number
}

export interface IEventRetouchOrdersPage {
  items: IRetouchQueueOrder[]
  pagination: ReturnType<typeof toPagination>
}

export function useEventRetouchOrdersInfiniteQuery(
  eventSlug: Ref<string>,
  scope: Ref<TRetouchOrderScope> = ref('pending'),
) {
  return useInfiniteQuery({
    queryKey: computed(() => RETOUCH_QUERY_KEYS.eventOrders(eventSlug.value, scope.value)),
    initialPageParam: { page: 1 } satisfies IPageParams,
    queryFn: async ({
      pageParam,
    }: {
      pageParam: IPageParams
    }): Promise<IEventRetouchOrdersPage> => {
      const response = await httpClient.get<IApiRetouchQueueOrder[]>(
        API_ROUTES.OPERATOR.RETOUCH_QUEUE(eventSlug.value),
        { params: { scope: scope.value, page: pageParam.page, limit: PAGE_LIMIT } },
      )
      const items = response.data.map(toRetouchQueueOrder)
      return {
        items,
        pagination: toPagination(response.meta.pagination, {
          page: pageParam.page,
          limit: PAGE_LIMIT,
          itemsCount: items.length,
        }),
      }
    },
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? ({ page: last.pagination.page + 1 } satisfies IPageParams)
        : undefined,
    enabled: computed(() => !!eventSlug.value),
  })
}
