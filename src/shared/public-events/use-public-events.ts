import { keepPreviousData, useInfiniteQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPagination, type IPagination } from '@/core/http/pagination'
import { toPublicEventListItem } from './public-event.mapper'
import type {
  IApiPublicEventListItem,
  IPublicEventFilters,
  IPublicEventListItem,
} from './public-event.types'
import {
  normalizePublicEventFilters,
  PUBLIC_EVENTS_PAGE_SIZE,
  PUBLIC_EVENTS_QUERY_KEYS,
  toPublicEventParams,
} from './query-keys'

interface IPublicEventsPage {
  items: IPublicEventListItem[]
  pagination: IPagination
}

export interface IPublicEventsQueryOptions {
  pageSize?: number
}

/**
 * The public events list, page by page, newest first. Home and events share it: without filters
 * both read the same cache entry. A failed load is silent, the screen shows it; while new filters
 * load, the previous list stays.
 */
export function usePublicEventsQuery(
  filters: MaybeRefOrGetter<IPublicEventFilters | undefined> = undefined,
  options: IPublicEventsQueryOptions = {},
) {
  const pageSize = options.pageSize ?? PUBLIC_EVENTS_PAGE_SIZE
  const normalized = computed(() => normalizePublicEventFilters(toValue(filters)))

  const query = useInfiniteQuery({
    queryKey: computed(() => PUBLIC_EVENTS_QUERY_KEYS.list(normalized.value, pageSize)),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<IPublicEventsPage> => {
      const response = await httpClient.get<IApiPublicEventListItem[]>(
        API_ROUTES.PUBLIC_EVENTS.GET_ALL,
        {
          params: { page: pageParam, limit: pageSize, ...toPublicEventParams(normalized.value) },
          silent: true,
        },
      )

      const items = response.data.map(toPublicEventListItem)
      return {
        items,
        pagination: toPagination(response.meta.pagination, {
          page: pageParam,
          limit: pageSize,
          itemsCount: items.length,
        }),
      }
    },
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
    placeholderData: keepPreviousData,
  })

  const events = computed(() => query.data.value?.pages.flatMap((page) => page.items) ?? [])
  const total = computed(() => {
    const pages = query.data.value?.pages ?? []
    return pages[pages.length - 1]?.pagination.total ?? 0
  })

  return { ...query, events, total }
}
