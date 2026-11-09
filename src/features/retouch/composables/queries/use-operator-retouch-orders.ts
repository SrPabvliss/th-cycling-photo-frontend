import { computed, ref, type Ref } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { INTERNAL_IMAGE_QUERY_DEFAULTS } from '@/core/api/internal-image-query'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { RETOUCH_QUERY_KEYS } from '../../constants/retouch-query-keys'
import { toOperatorRetouchOrdersList } from '../../mappers/operator-retouch-orders.mapper'
import type {
  IApiOperatorRetouchOrder,
  IOperatorRetouchOrder,
  TRetouchOrderScope,
} from '../../types/responses/operator-retouch-orders.response'

const PAGE_LIMIT = 30

interface IPageParams {
  page: number
}

export interface IOperatorRetouchOrdersInfinitePage {
  items: IOperatorRetouchOrder[]
  pagination: ReturnType<typeof toPagination>
}

export function useOperatorRetouchOrdersInfiniteQuery(
  scope: Ref<TRetouchOrderScope> = ref('pending'),
  eventSlug: Ref<string | null> = ref(null),
  enabled: Ref<boolean> = ref(true),
) {
  return useInfiniteQuery({
    queryKey: computed(() =>
      RETOUCH_QUERY_KEYS.operatorOrders(PAGE_LIMIT, scope.value, eventSlug.value),
    ),
    initialPageParam: { page: 1 } satisfies IPageParams,
    queryFn: async ({
      pageParam,
    }: {
      pageParam: IPageParams
    }): Promise<IOperatorRetouchOrdersInfinitePage> => {
      const params: Record<string, unknown> = {
        page: pageParam.page,
        limit: PAGE_LIMIT,
        scope: scope.value,
      }
      if (eventSlug.value) params.eventSlug = eventSlug.value

      const response = await httpClient.get<IApiOperatorRetouchOrder[]>(
        API_ROUTES.OPERATOR.RETOUCH_ORDERS,
        { params },
      )
      const items = toOperatorRetouchOrdersList(response.data)
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
    enabled: computed(() => enabled.value),
    ...INTERNAL_IMAGE_QUERY_DEFAULTS,
  })
}
