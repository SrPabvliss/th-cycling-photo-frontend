export const ORGANIZER_TABS = ['all', 'active', 'no_quota', 'expiring', 'invitations'] as const
export type OrganizerTab = (typeof ORGANIZER_TABS)[number]

export const ORGANIZER_SORTS = ['recent', 'available', 'expiry', 'events'] as const
export type OrganizerSort = (typeof ORGANIZER_SORTS)[number]

export interface IOrganizerFilters {
  search: string | null
  tab: OrganizerTab
  sort: OrganizerSort
}

export function toOrganizerFiltersParams(filters: IOrganizerFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {
    tab: filters.tab,
    sort: filters.sort,
  }

  if (filters.search) params.search = filters.search

  return params
}
