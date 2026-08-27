import { computed, type Ref } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { toEventListItems } from '@/shared/mappers/event-list.mapper'
import { toEventFiltersParams, type IEventFilters } from '@/shared/types/event-filters.types'
import type { IApiEventListItem } from '@/shared/types/event.types'

interface IPageParams {
  page: number
}

interface IPageResult {
  items: ReturnType<typeof toEventListItems>
  pagination: ReturnType<typeof toPagination>
}

export function useEventsListQuery(filters: Ref<IEventFilters>, limit = 12) {
  return useInfiniteQuery({
    queryKey: computed(() => [API_ROUTES.EVENTS.BASE, 'list', filters.value, limit]),
    initialPageParam: { page: 1 } satisfies IPageParams,
    queryFn: async ({ pageParam }: { pageParam: IPageParams }): Promise<IPageResult> => {
      const params = { ...toEventFiltersParams(filters.value), page: pageParam.page, limit }

      const response = await httpClient.get<IApiEventListItem[]>(API_ROUTES.EVENTS.GET_ALL, {
        params,
      })

      const items = toEventListItems(response.data)
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
