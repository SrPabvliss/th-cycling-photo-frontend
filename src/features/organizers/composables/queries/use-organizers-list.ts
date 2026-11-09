import { computed, type Ref } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { ORGANIZER_QUERY_KEYS } from '../../constants/query-keys'
import { toOrganizerRows } from '../../mappers/organizer-list.mapper'
import { toOrganizerFiltersParams } from '../../types/requests/organizer-filters.request'
import type { IOrganizerFilters } from '../../types/requests/organizer-filters.request'
import type { IApiOrganizerRow } from '../../types/responses/organizer-list.response'

interface IPageParams {
  page: number
}

interface IPageResult {
  items: ReturnType<typeof toOrganizerRows>
  pagination: ReturnType<typeof toPagination>
}

/**
 * Infinite-scroll organizers list. Same shape as `useBuyersListQuery`: read rows via
 * `data.value.pages.flatMap((p) => p.items)`, drive the sentinel with `fetchNextPage`,
 * `hasNextPage` and `isFetchingNextPage`. Every filter belongs to the query key, so
 * changing any of them starts a fresh page 1 instead of appending to the previous rows.
 */
export function useOrganizersListQuery(
  filters: Ref<IOrganizerFilters>,
  limit = 20,
  enabled?: Ref<boolean>,
) {
  return useInfiniteQuery({
    queryKey: computed(() => ORGANIZER_QUERY_KEYS.list(filters.value)),
    initialPageParam: { page: 1 } satisfies IPageParams,
    queryFn: async ({ pageParam }: { pageParam: IPageParams }): Promise<IPageResult> => {
      const params = { ...toOrganizerFiltersParams(filters.value), page: pageParam.page, limit }

      const response = await httpClient.get<IApiOrganizerRow[]>(API_ROUTES.ORGANIZERS.GET_ALL, {
        params,
      })

      const items = toOrganizerRows(response.data)
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
    enabled: computed(() => enabled?.value ?? true),
  })
}
