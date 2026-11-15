import { API_ROUTES } from '@/core/api/api-routes'
import type { IPublicEventFilters } from './public-event.types'

export const PUBLIC_EVENTS_PAGE_SIZE = 20

const SEARCH_MIN_LENGTH = 2
const SEARCH_MAX_LENGTH = 100
const MAX_IDS = 20
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/

const NO_FILTERS: IPublicEventFilters = { eventTypeIds: [], provinceIds: [] }

// Each id once, positive integers only, smallest first: the same choice is the same request.
function ids(values: number[] | undefined): number[] {
  const valid = (values ?? []).filter((value) => Number.isInteger(value) && value > 0)
  return [...new Set(valid)].sort((a, b) => a - b).slice(0, MAX_IDS)
}

function month(value: string | undefined): string | undefined {
  return value !== undefined && MONTH.test(value) ? value : undefined
}

/**
 * Filters as the api accepts them, with everything that filters nothing left out. A search of one
 * character and no filters at all are the same request, and so the same cache entry. One month is
 * both ends of the range; a range out of order filters nothing.
 */
export function normalizePublicEventFilters(
  filters: IPublicEventFilters = NO_FILTERS,
): IPublicEventFilters {
  const normalized: IPublicEventFilters = {
    eventTypeIds: ids(filters.eventTypeIds),
    provinceIds: ids(filters.provinceIds),
  }

  const search = filters.search?.trim().slice(0, SEARCH_MAX_LENGTH) ?? ''
  if (search.length >= SEARCH_MIN_LENGTH) normalized.search = search

  const from = month(filters.from) ?? month(filters.to)
  const to = month(filters.to) ?? from
  if (from && to && from <= to) {
    normalized.from = from
    normalized.to = to
  }

  return normalized
}

/**
 * Query parameters of the list and of its filter options. A list goes as one parameter of ids
 * joined by commas, and is left out when nothing is marked: the api rejects an empty one.
 */
export function toPublicEventParams(filters: IPublicEventFilters): Record<string, string> {
  const normalized = normalizePublicEventFilters(filters)
  const params: Record<string, string> = {}
  if (normalized.search) params.search = normalized.search
  if (normalized.eventTypeIds.length) params.eventTypeIds = normalized.eventTypeIds.join(',')
  if (normalized.provinceIds.length) params.provinceIds = normalized.provinceIds.join(',')
  if (normalized.from && normalized.to) {
    params.from = normalized.from
    params.to = normalized.to
  }
  return params
}

export const PUBLIC_EVENTS_QUERY_KEYS = {
  list: (filters?: IPublicEventFilters, pageSize: number = PUBLIC_EVENTS_PAGE_SIZE) =>
    [
      API_ROUTES.PUBLIC_EVENTS.BASE,
      'list',
      normalizePublicEventFilters(filters),
      { pageSize },
    ] as const,
  filters: (filters?: IPublicEventFilters) =>
    [API_ROUTES.PUBLIC_EVENTS.BASE, 'filters', normalizePublicEventFilters(filters)] as const,
} as const
