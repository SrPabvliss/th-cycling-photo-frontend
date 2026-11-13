import { API_ROUTES } from '@/core/api/api-routes'
import type { IPublicEventFilters } from './public-event.types'

export const PUBLIC_EVENTS_PAGE_SIZE = 20

const SEARCH_MIN_LENGTH = 2
const SEARCH_MAX_LENGTH = 100

/**
 * Filters as the api accepts them, with everything that filters nothing left out. A search of one
 * character, `hasPhotos: false` and no filters at all are the same request, and so the same cache
 * entry.
 */
export function normalizePublicEventFilters(
  filters: IPublicEventFilters = {},
): IPublicEventFilters {
  const normalized: IPublicEventFilters = {}

  const search = filters.search?.trim().slice(0, SEARCH_MAX_LENGTH) ?? ''
  if (search.length >= SEARCH_MIN_LENGTH) normalized.search = search

  if (Number.isInteger(filters.eventTypeId) && filters.eventTypeId! > 0) {
    normalized.eventTypeId = filters.eventTypeId
  }

  if (filters.hasPhotos === true) normalized.hasPhotos = true

  return normalized
}

export const PUBLIC_EVENTS_QUERY_KEYS = {
  list: (filters?: IPublicEventFilters, pageSize: number = PUBLIC_EVENTS_PAGE_SIZE) =>
    [
      API_ROUTES.PUBLIC_EVENTS.BASE,
      'list',
      normalizePublicEventFilters(filters),
      { pageSize },
    ] as const,
  filters: () => [API_ROUTES.PUBLIC_EVENTS.BASE, 'filters'] as const,
} as const
