import { computed, type Ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { BUYER_QUERY_KEYS } from '../../constants/query-keys'
import { toBuyerListItem } from '../../mappers/buyer-list.mapper'
import type { IApiBuyerListItem } from '../../types/responses/buyer-list.response'

export function useBuyersListQuery(page: Ref<number>, search: Ref<string>, limit = 20) {
  return useQuery({
    queryKey: computed(() => BUYER_QUERY_KEYS.list(page.value, search.value)),
    queryFn: async () => {
      const params: Record<string, unknown> = { page: page.value, limit }
      if (search.value) params.search = search.value

      const response = await httpClient.get<IApiBuyerListItem[]>(API_ROUTES.BUYERS.GET_ALL, {
        params,
      })
      const items = response.data.map(toBuyerListItem)
      return {
        items,
        pagination: toPagination(response.meta.pagination, {
          page: page.value,
          limit,
          itemsCount: items.length,
        }),
      }
    },
    placeholderData: keepPreviousData,
  })
}
