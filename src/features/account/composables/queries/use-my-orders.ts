import { useInfiniteQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { ACCOUNT_QUERY_KEYS } from '../../constants/query-keys'
import { toMyOrderList } from '../../mappers/my-order.mapper'
import type { IApiMyOrderListItem } from '../../types/responses/my-order.response'

const PAGE_SIZE = 20

interface IPageParams {
  page: number
}

interface IPageResult {
  items: ReturnType<typeof toMyOrderList>
  pagination: ReturnType<typeof toPagination>
}

export function useMyOrdersQuery() {
  return useInfiniteQuery({
    queryKey: ACCOUNT_QUERY_KEYS.orders(),
    initialPageParam: { page: 1 } satisfies IPageParams,
    queryFn: async ({ pageParam }: { pageParam: IPageParams }): Promise<IPageResult> => {
      const response = await httpClient.get<IApiMyOrderListItem[]>(API_ROUTES.MY_ORDERS.BASE, {
        params: { page: pageParam.page, limit: PAGE_SIZE },
      })

      const items = toMyOrderList(response.data)
      return {
        items,
        pagination: toPagination(response.meta.pagination, {
          page: pageParam.page,
          limit: PAGE_SIZE,
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
