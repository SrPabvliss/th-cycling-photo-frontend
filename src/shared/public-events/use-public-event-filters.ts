import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toPublicEventFilterOptions } from './public-event-filters.mapper'
import type {
  IApiPublicEventFilterOptions,
  IPublicEventFilterOptions,
  IPublicEventFilters,
} from './public-event.types'
import {
  normalizePublicEventFilters,
  PUBLIC_EVENTS_QUERY_KEYS,
  toPublicEventParams,
} from './query-keys'

const FIVE_MINUTES = 5 * 60_000

/**
 * What the menus of the events list offer, with how many events each choice would bring under
 * the current filters. While new counts load, the previous ones stay. Silent: without them the
 * menus keep what they had and the list still works.
 */
export function usePublicEventFiltersQuery(filters: MaybeRefOrGetter<IPublicEventFilters>) {
  const normalized = computed(() => normalizePublicEventFilters(toValue(filters)))

  return useQuery({
    queryKey: computed(() => PUBLIC_EVENTS_QUERY_KEYS.filters(normalized.value)),
    queryFn: async (): Promise<IPublicEventFilterOptions> => {
      const response = await httpClient.get<IApiPublicEventFilterOptions>(
        API_ROUTES.PUBLIC_EVENTS.FILTERS,
        { params: toPublicEventParams(normalized.value), silent: true },
      )
      return toPublicEventFilterOptions(response.data)
    },
    staleTime: FIVE_MINUTES,
    placeholderData: keepPreviousData,
  })
}
