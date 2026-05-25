import { computed, type Ref } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { INTERNAL_IMAGE_QUERY_DEFAULTS } from '@/core/api/internal-image-query'
import { httpClient } from '@/core/http/axios-client'
import { toPagination } from '@/core/http/pagination'
import { DASHBOARD_STALE_TIME } from '../../constants/operator-dashboard'
import { OPERATOR_QUERY_KEYS } from '../../constants/operator-query-keys'
import { toOperatorReviewQueueItem } from '../../mappers/operator-review-queue-item.mapper'
import type { IApiOperatorReviewQueueItem } from '../../types/responses/operator-review-queue-item.response'
import type { TReviewQueueStatusFilter } from '../../types/review-queue-status-filter'

const WORKSPACE_PAGE_SIZE = 30

interface IPageParams {
  page: number
}

export function useOperatorReviewQueueQuery(
  eventSlug: Ref<string | null>,
  status: Ref<TReviewQueueStatusFilter>,
) {
  return useInfiniteQuery({
    queryKey: computed(() =>
      OPERATOR_QUERY_KEYS.dashboardReviewQueue(eventSlug.value, status.value, WORKSPACE_PAGE_SIZE),
    ),
    initialPageParam: { page: 1 } satisfies IPageParams,
    queryFn: async ({ pageParam }: { pageParam: IPageParams }) => {
      const params: Record<string, unknown> = {
        page: pageParam.page,
        limit: WORKSPACE_PAGE_SIZE,
        status: status.value,
      }
      if (eventSlug.value) params.eventSlug = eventSlug.value

      const response = await httpClient.get<IApiOperatorReviewQueueItem[]>(
        API_ROUTES.OPERATOR.DASHBOARD_REVIEW_QUEUE,
        { params },
      )
      const items = response.data.map(toOperatorReviewQueueItem)
      return {
        items,
        page: pageParam.page,
        pagination: toPagination(response.meta.pagination, {
          page: pageParam.page,
          limit: WORKSPACE_PAGE_SIZE,
          itemsCount: items.length,
        }),
      }
    },
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? ({ page: last.pagination.page + 1 } satisfies IPageParams)
        : undefined,
    ...INTERNAL_IMAGE_QUERY_DEFAULTS,
    staleTime: DASHBOARD_STALE_TIME.VOLATILE,
    refetchOnWindowFocus: true,
  })
}
