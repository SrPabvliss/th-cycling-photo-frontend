export const EVENT_TABS = ['all', 'active', 'no_cover', 'frozen', 'archived'] as const
export type EventTab = (typeof EVENT_TABS)[number]

export const EVENT_SORTS = [
  'activity',
  'event_date',
  'quota',
  'pending_review',
  'revenue',
  'name',
] as const
export type EventSort = (typeof EVENT_SORTS)[number]

export interface IEventFilters {
  search: string | null
  tab: EventTab
  organizerId: string | null
  sort: EventSort
}

export type IEventsStatsScope = Pick<IEventFilters, 'search' | 'organizerId'>

export function toEventsStatsParams(scope: IEventsStatsScope): Record<string, unknown> {
  const params: Record<string, unknown> = {}

  if (scope.search) params.search = scope.search
  if (scope.organizerId) params.organizerId = scope.organizerId

  return params
}

export function toEventFiltersParams(filters: IEventFilters): Record<string, unknown> {
  return {
    tab: filters.tab,
    sort: filters.sort,
    ...toEventsStatsParams(filters),
  }
}
