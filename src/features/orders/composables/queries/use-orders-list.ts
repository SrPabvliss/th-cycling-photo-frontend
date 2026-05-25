import { computed, type Ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { INTERNAL_IMAGE_QUERY_DEFAULTS } from '@/core/api/internal-image-query'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { ORDER_QUERY_KEYS } from '../../constants/query-keys'
import { toOrderListItems } from '../../mappers/order-list.mapper'
import type { IApiOrderListItem } from '../../types/responses/order-list.response'

export interface IOrderListFilters {
  page: number
  status: string | null
  eventId: string | null
  search: string
}

export function useOrdersListQuery(filters: Ref<IOrderListFilters>, limit = 20) {
  return useQuery({
    queryKey: computed(() =>
      ORDER_QUERY_KEYS.list({
        page: filters.value.page,
        status: filters.value.status ?? undefined,
        eventId: filters.value.eventId ?? undefined,
        search: filters.value.search || undefined,
      }),
    ),
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page: filters.value.page,
        limit,
      }
      if (filters.value.status) params.status = filters.value.status
      if (filters.value.eventId) params.eventId = filters.value.eventId
      if (filters.value.search) params.search = filters.value.search

      const response = await httpClient.get<IApiOrderListItem[]>(API_ROUTES.ORDERS.GET_ALL, {
        params,
      })

      const items = toOrderListItems(response.data)
      return {
        items,
        pagination: toPagination(response.meta.pagination, {
          page: filters.value.page,
          limit,
          itemsCount: items.length,
        }),
      }
    },
    placeholderData: keepPreviousData,
    ...INTERNAL_IMAGE_QUERY_DEFAULTS,
  })
}
