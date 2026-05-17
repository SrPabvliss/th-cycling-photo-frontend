import { computed, ref, type Ref } from 'vue'
import { useQuery, keepPreviousData } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { RETOUCH_QUERY_KEYS } from '../../constants/retouch-query-keys'
import { toOperatorRetouchOrdersList } from '../../mappers/operator-retouch-orders.mapper'
import type {
  IApiOperatorRetouchOrder,
  IOperatorRetouchOrdersPage,
  TRetouchOrderScope,
} from '../../types/responses/operator-retouch-orders.response'

const DEFAULT_LIMIT = 20

export function useOperatorRetouchOrdersQuery(
  page: Ref<number> = ref(1),
  limit: Ref<number> = ref(DEFAULT_LIMIT),
  scope: Ref<TRetouchOrderScope> = ref('pending'),
  eventSlug: Ref<string | null> = ref(null),
) {
  return useQuery({
    queryKey: computed(() =>
      RETOUCH_QUERY_KEYS.operatorOrders(page.value, limit.value, scope.value, eventSlug.value),
    ),
    queryFn: async (): Promise<IOperatorRetouchOrdersPage> => {
      const params: Record<string, unknown> = {
        page: page.value,
        limit: limit.value,
        scope: scope.value,
      }
      if (eventSlug.value) params.eventSlug = eventSlug.value

      const response = await httpClient.get<IApiOperatorRetouchOrder[]>(
        API_ROUTES.OPERATOR.RETOUCH_ORDERS,
        { params },
      )
      const items = toOperatorRetouchOrdersList(response.data)
      const pagination = toPagination(response.meta.pagination, {
        page: page.value,
        limit: limit.value,
        itemsCount: items.length,
      })
      return {
        items,
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      }
    },
    placeholderData: keepPreviousData,
  })
}
