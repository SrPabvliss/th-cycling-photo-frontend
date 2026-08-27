import { computed, type Ref } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { BUYER_QUERY_KEYS } from '../../constants/query-keys'
import { toBuyerListItems } from '../../mappers/buyer-list.mapper'
import { toBuyerFiltersParams } from '../../types/requests/buyer-filters.request'
import type { IBuyerFilters } from '../../types/requests/buyer-filters.request'
import type { IApiBuyerListItem } from '../../types/responses/buyer-list.response'

interface IPageParams {
  page: number
}

interface IPageResult {
  items: ReturnType<typeof toBuyerListItems>
  pagination: ReturnType<typeof toPagination>
}

/**
 * Infinite-scroll buyers list. Same shape as `useEventsListQuery`: read rows via
 * `data.value.pages.flatMap((p) => p.items)`, drive the sentinel with `fetchNextPage`,
 * `hasNextPage` and `isFetchingNextPage`. Every filter belongs to the query key, so
 * changing any of them starts a fresh page 1 instead of appending to the previous rows.
 */
export function useBuyersListQuery(filters: Ref<IBuyerFilters>, limit = 20) {
  return useInfiniteQuery({
    queryKey: computed(() => BUYER_QUERY_KEYS.list(filters.value)),
    initialPageParam: { page: 1 } satisfies IPageParams,
    queryFn: async ({ pageParam }: { pageParam: IPageParams }): Promise<IPageResult> => {
      const params = { ...toBuyerFiltersParams(filters.value), page: pageParam.page, limit }

      const response = await httpClient.get<IApiBuyerListItem[]>(API_ROUTES.BUYERS.GET_ALL, {
        params,
      })

      const items = toBuyerListItems(response.data)
      return {
        items,
        pagination: toPagination(response.meta.pagination, {
          page: pageParam.page,
          limit,
          itemsCount: items.length,
        }),
      }
    },
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? ({ page: last.pagination.page + 1 } satisfies IPageParams)
        : undefined,
  })
}
