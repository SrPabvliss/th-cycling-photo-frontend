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

export function toEventFiltersParams(filters: IEventFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {
    tab: filters.tab,
    sort: filters.sort,
  }

  if (filters.search) params.search = filters.search
  if (filters.organizerId) params.organizerId = filters.organizerId

  return params
}
