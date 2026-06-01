import { computed, type Ref } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { INTERNAL_IMAGE_QUERY_DEFAULTS } from '@/core/api/internal-image-query'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { ORDER_QUERY_KEYS } from '../../constants/query-keys'
import { toOrderListItems } from '../../mappers/order-list.mapper'
import type { IApiOrderListItem } from '../../types/responses/order-list.response'

export interface IOrderListFilters {
  status: string | null
  eventId: string | null
  search: string
}

interface IPageParams {
  page: number
}

interface IPageResult {
  items: ReturnType<typeof toOrderListItems>
  pagination: ReturnType<typeof toPagination>
}

/**
 * Infinite-scroll orders list query.
 *
 * Return shape (TanStack Query v5 `useInfiniteQuery`):
 * - `data.value?.pages: IPageResult[]` — one entry per fetched page; flatten
 *   via `data.value.pages.flatMap((p) => p.items)` to render rows.
 * - `data.value?.pages.at(-1)?.pagination` — latest server pagination (total,
 *   totalPages, page) for header counts.
 * - `fetchNextPage`, `hasNextPage`, `isFetchingNextPage` — to drive sentinel /
 *   "load more" UI.
 * - `isLoading`, `isError`, `refetch` — initial-load and error UX.
 *
 * Query key intentionally excludes `page` (TanStack manages page params
 * internally). Filter changes invalidate the whole infinite cache and start
 * from page 1.
 */
export function useOrdersListQuery(filters: Ref<IOrderListFilters>, limit = 20) {
  return useInfiniteQuery({
    queryKey: computed(() =>
      ORDER_QUERY_KEYS.list({
        status: filters.value.status ?? undefined,
        eventId: filters.value.eventId ?? undefined,
        search: filters.value.search || undefined,
      }),
    ),
    initialPageParam: { page: 1 } satisfies IPageParams,
    queryFn: async ({ pageParam }: { pageParam: IPageParams }): Promise<IPageResult> => {
      const params: Record<string, unknown> = {
        page: pageParam.page,
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
    ...INTERNAL_IMAGE_QUERY_DEFAULTS,
  })
}
